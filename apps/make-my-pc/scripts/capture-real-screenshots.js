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
    '--remote-debugging-port=9222',
    '--enable-webgl',
    '--no-first-run',
    '--no-default-browser-check',
  ]);

  await sleep(1500);

  try {
    const targetRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:3000/?app=make-my-pc&standalone=true', {
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

    // 636 x 1048 px viewport (Toss spec)
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 636,
      height: 1048,
      deviceScaleFactor: 1,
      mobile: true,
    });

    console.log('Waiting for initial load and render...');
    await sleep(3500);

    const bodyHtml = await client.send('Runtime.evaluate', {
      expression: 'document.body.innerText',
    });
    console.log('PAGE TEXT PREVIEW:', bodyHtml.result?.value?.slice(0, 300));


    // Select 200만원대 QHD 풀옵션 preset for impressive gaming benchmark and spec sheet
    await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const qhdBtn = buttons.find(b => b.textContent.includes('200만원대 QHD') || b.textContent.includes('QHD 풀옵션'));
          if (qhdBtn) qhdBtn.click();
        })()
      `,
    });
    // Wait for confetti animation to finish completely
    await sleep(3500);

    // Screenshot 1: 부품 조립 (build 탭)
    console.log('Capturing Screenshot 1 (부품 조립)...');
    const ss1 = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ASSETS_DIR, 'screenshot_1.png'), Buffer.from(ss1.data, 'base64'));

    // Switch to Benchmark tab
    console.log('Switching to Benchmark tab...');
    await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          window.scrollTo({ top: 0 });
          const buttons = Array.from(document.querySelectorAll('button'));
          const benchBtn = buttons.find(b => b.textContent.includes('성능 벤치') || b.textContent.includes('벤치'));
          if (benchBtn) benchBtn.click();
        })()
      `,
    });
    await sleep(1500);

    // Screenshot 2: 게임 성능 벤치마크 (bench 탭)
    console.log('Capturing Screenshot 2 (성능 벤치마크)...');
    const ss2 = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ASSETS_DIR, 'screenshot_2.png'), Buffer.from(ss2.data, 'base64'));

    // Switch to Quote tab
    console.log('Switching to Quote tab...');
    await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const quoteBtn = buttons.find(b => b.textContent.includes('견적서'));
          if (quoteBtn) quoteBtn.click();
          window.scrollTo({ top: 140 });
        })()
      `,
    });
    await sleep(1500);

    // Screenshot 3: 디지털 견적서 (quote 탭)
    console.log('Capturing Screenshot 3 (디지털 견적서)...');
    const ss3 = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ASSETS_DIR, 'screenshot_3.png'), Buffer.from(ss3.data, 'base64'));

    console.log('All screenshots captured successfully!');
    client.close();
  } finally {
    chrome.kill();
  }
}

capture().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
