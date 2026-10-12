import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.resolve(__dirname, '../assets');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message));
          } else {
            resolve(msg.result);
          }
        }
      };
    });
  }

  send(method, params = {}) {
    const id = this.msgId++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function capture() {
  console.log('Launching headless Chrome...');
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--enable-webgl',
    '--no-first-run',
    '--no-default-browser-check',
  ]);

  await sleep(1500);

  try {
    const targetRes = await fetch('http://127.0.0.1:9223/json/new?http://localhost:3000/?app=cy-mini&standalone=true', {
      method: 'PUT',
    });
    const target = await targetRes.json();
    console.log('Target created:', target.id);

    const client = new CDPClient(target.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('DOM.enable');
    await client.send('Runtime.enable');

    client.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        console.log('PAGE LOG:', msg.params.args.map(a => a.value));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.error('PAGE ERROR:', msg.params.exceptionDetails);
      }
      if (msg.id && client.callbacks.has(msg.id)) {
        const { resolve, reject } = client.callbacks.get(msg.id);
        client.callbacks.delete(msg.id);
        if (msg.error) {
          reject(new Error(msg.error.message));
        } else {
          resolve(msg.result);
        }
      }
    };

    // Exactly 636 x 1048 px viewport (Toss mini-app standard screenshot spec)
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 636,
      height: 1048,
      deviceScaleFactor: 1,
      mobile: true,
    });

    console.log('Waiting for initial load and render...');
    await sleep(2500);

    const bodyHtml = await client.send('Runtime.evaluate', {
      expression: 'document.body.innerText',
    });
    console.log('PAGE TEXT PREVIEW:', bodyHtml.result?.value?.slice(0, 200));

    // Screenshot 1: 홈 / 일촌평 탭 (미니룸 뷰어 & 일촌 방명록)
    console.log('Capturing Screenshot 1 (홈 & 미니룸 뷰어)...');
    const ss1 = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ASSETS_DIR, 'screenshot_1.png'), Buffer.from(ss1.data, 'base64'));

    // Switch to '룸꾸미기' tab
    console.log('Switching to Room Decorating tab (룸꾸미기)...');
    await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const roomTab = buttons.find(b => b.textContent.includes('룸꾸미기'));
          if (roomTab) roomTab.click();
        })()
      `,
    });
    await sleep(1500);

    // Screenshot 2: 룸꾸미기 탭 (테마, 미니미, 레트로 도트 가구)
    console.log('Capturing Screenshot 2 (룸꾸미기)...');
    const ss2 = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ASSETS_DIR, 'screenshot_2.png'), Buffer.from(ss2.data, 'base64'));

    // Switch to 'BGM' tab
    console.log('Switching to BGM tab...');
    await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const bgmTab = buttons.find(b => b.textContent.includes('BGM'));
          if (bgmTab) bgmTab.click();
        })()
      `,
    });
    await sleep(1500);

    // Screenshot 3: BGM 주크박스 및 레트로 카세트 플레이어
    console.log('Capturing Screenshot 3 (BGM 주크박스)...');
    const ss3 = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ASSETS_DIR, 'screenshot_3.png'), Buffer.from(ss3.data, 'base64'));

    console.log('All 3 real screenshots captured successfully at 636x1048!');
    client.close();
  } finally {
    chrome.kill();
  }
}

capture().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
