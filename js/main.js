/**
 * 入口：DOMContentLoaded 后启动 App（等待 Leaflet defer 脚本）
 */
import { App } from './app.js';

function waitForLeaflet(timeoutMs = 15000) {
  if (window.L) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const id = setInterval(() => {
      if (window.L) {
        clearInterval(id);
        resolve();
      } else if (Date.now() - t0 > timeoutMs) {
        clearInterval(id);
        reject(new Error('Leaflet 加载超时'));
      }
    }, 30);
  });
}

async function boot() {
  try {
    await waitForLeaflet();
    const app = new App();
    await app.start();
  } catch (err) {
    console.error(err);
    const map = document.getElementById('map');
    if (map) {
      map.innerHTML = `<div style="padding:2rem;text-align:center">
        <p>应用启动失败：${String(err.message || err)}</p>
        <p style="color:var(--color-ink-muted);font-size:0.9rem">请确认使用 <code>npm run serve</code> 并通过 http 访问。</p>
      </div>`;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
