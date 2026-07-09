import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const scratch =
  process.env.SCRATCH ||
  'C:/Users/39722/AppData/Local/Temp/grok-goal-d632ebb73046/implementer';
fs.mkdirSync(path.join(scratch, 'launch'), { recursive: true });
fs.mkdirSync(path.join(scratch, 'responsive'), { recursive: true });

async function runOnce(label, width) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('http://localhost:5173/', {
    waitUntil: 'networkidle',
    timeout: 90000,
  });
  await page.waitForTimeout(3000);
  const mapBox = await page.locator('#map').boundingBox();
  const mapOk = mapBox && mapBox.width > 100 && mapBox.height > 100;

  const detail = await page.evaluate(async () => {
    const app = window.__changanApp__;
    if (!app) return { err: 'no app' };
    const poem =
      app.data.poems.find((p) => p.id === 'songyuanershi-anxi') ||
      app.data.poems[0];
    const placeId = poem.places?.[0]?.placeId;
    app.bus.emit('poem:selected', {
      poemId: poem.id,
      placeId,
      source: 'test',
    });
    await new Promise((r) => setTimeout(r, 1000));
    const body = document.getElementById('detail-body');
    const open = document
      .getElementById('detail-panel')
      ?.classList.contains('is-open');
    return {
      open,
      text: body?.innerText?.slice(0, 500) || '',
      poems: app.data.poems.length,
      places: app.data.places.length,
      title: document.getElementById('detail-title')?.textContent || '',
    };
  });

  await page.screenshot({
    path: path.join(scratch, 'launch', `${label}.png`),
    fullPage: true,
  });
  if (width <= 400) {
    await page.screenshot({
      path: path.join(scratch, 'responsive', 'mobile-375.png'),
      fullPage: true,
    });
  } else {
    await page.screenshot({
      path: path.join(scratch, 'responsive', 'desktop.png'),
      fullPage: true,
    });
  }
  await browser.close();
  return { label, width, mapOk, mapBox, errors, detail };
}

const r1 = await runOnce('load-1', 1280);
const r2 = await runOnce('load-2', 1280);
const r3 = await runOnce('mobile', 375);
const out = { r1, r2, r3 };
fs.writeFileSync(
  path.join(scratch, 'launch', 'browser-result.json'),
  JSON.stringify(out, null, 2)
);
console.log(JSON.stringify(out, null, 2));

const criticalErrors = (errors) =>
  (errors || []).filter(
    (e) =>
      !/favicon|Failed to load resource.*favicon|net::ERR_CONNECTION/i.test(e)
  );

const ok =
  r1.mapOk &&
  r2.mapOk &&
  r1.detail?.open &&
  (r1.detail?.text?.length || 0) > 10 &&
  criticalErrors(r1.errors).length === 0 &&
  criticalErrors(r2.errors).length === 0;

if (!ok) {
  console.error('BROWSER SMOKE FAILED');
  process.exit(1);
}
console.log('BROWSER SMOKE OK');
