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
  console.log('Launching headless Chrome for subsidy-calc...');
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--enable-webgl',
    '--no-first-run',
    '--no-default-browser-check',
  ]);

  await sleep(1500);

  try {
    const targetRes = await fetch('http://127.0.0.1:3000/?app=subsidy-calc&standalone=true');
    const targetData = await fetch('http://127.0.0.1:9222/json/new?http://localhost:3000/?app=subsidy-calc&standalone=true', {
      method: 'PUT',
    });
    const target = await targetData.json();

    const client = new CDPClient(target.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('DOM.enable');

    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 636,
      height: 1048,
      deviceScaleFactor: 1,
      mobile: true,
    });

    await sleep(2500);

    // Screenshot 1: Step 1 연령/신분 선택 화면
    console.log('Capturing Screenshot 1 (연령/신분 선택 화면)...');
    const ss1 = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ASSETS_DIR, 'screenshot_1.png'), Buffer.from(ss1.data, 'base64'));

    // Click "다음 단계 (소득 선택)"
    console.log('Clicking next step button...');
    await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const nextBtn = buttons.find(b => b.textContent.includes('다음 단계'));
          if (nextBtn) nextBtn.click();
        })()
      `,
    });
    await sleep(800);

    // Screenshot 2: Step 2 소득 구간 선택 화면
    console.log('Capturing Screenshot 2 (소득 구간 선택)...');
    const ss2 = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ASSETS_DIR, 'screenshot_2.png'), Buffer.from(ss2.data, 'base64'));

    // Click "무료 모의 계산 결과 보기"
    console.log('Clicking calculate button...');
    await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const calcBtn = buttons.find(b => b.textContent.includes('무료 모의 계산') || b.textContent.includes('결과 보기'));
          if (calcBtn) calcBtn.click();
        })()
      `,
    });
    await sleep(3500); // Wait for confetti to disappear

    // Screenshot 3: 계산 결과 화면 (연 최대 405만원 수혜 및 K-패스, 청년도약계좌 등 매칭 리스트)
    console.log('Capturing Screenshot 3 (지원금 결과 리스트)...');
    const ss3 = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ASSETS_DIR, 'screenshot_3.png'), Buffer.from(ss3.data, 'base64'));

    console.log('All subsidy-calc screenshots captured successfully!');
    client.close();
  } finally {
    chrome.kill();
  }
}

capture().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
