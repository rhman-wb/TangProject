/**
 * 应用核心：初始化各模块、全局状态、事件协调
 */
import { EventBus } from './lib/event-bus.js';
import { THEME_STORAGE_KEY } from './config.js';
import { loadAppData } from './data-loader.js';
import { MapCore } from './map-core.js';
import { MapMarkers } from './map-markers.js';
import { MapOverlay } from './map-overlay.js';
import { FilterManager } from './filter-manager.js';
import { ListPanel } from './list-panel.js';
import { DetailPanel } from './detail-panel.js';
import { PoetView } from './poet-view.js';
import { Search } from './search.js';
import { Timeline } from './timeline.js';
import { Router } from './router.js';
import { Intro } from './intro.js';

export class App {
  constructor() {
    this.bus = new EventBus();
    this.data = null;
    this.state = {
      theme: 'auto',
    };
  }

  async start() {
    // file:// 协议检测
    if (location.protocol === 'file:') {
      this._showFileProtocolHelp();
      return;
    }

    this._initTheme();
    this.data = await loadAppData();

    this.mapCore = new MapCore('map', this.bus).init();
    this.markers = new MapMarkers(this.mapCore, this.bus, this.data).init();
    this.overlay = new MapOverlay(this.mapCore).init();
    this.filters = new FilterManager(this.bus, this.data).init();
    this.list = new ListPanel(this.bus, this.data).init();
    this.detail = new DetailPanel(this.bus, this.data).init();
    this.poetView = new PoetView(this.bus, this.data).init();
    this.search = new Search(this.bus, this.data).init();
    this.timeline = new Timeline(this.bus, this.filters).init();
    this.router = new Router(this.bus, this.data).init();
    this.intro = new Intro().init();

    this._wire();
    // 初始筛选 → 标记与列表
    this.bus.emit('filter:changed', this.filters.getState());
    this.router.applyInitial();

    // 暴露调试句柄（测试/深链可用）
    window.__长安诗境__ = this;
    window.__changanApp__ = this;
  }

  _wire() {
    this.bus.on('filter:changed', (f) => {
      this.markers.update(f);
    });
    this.bus.on('scope:changed', ({ showExtended }) => {
      this.mapCore.setExtended(showExtended);
    });
    this.bus.on('place:selected', ({ placeId }) => {
      const place = this.data.placeById.get(placeId);
      if (place) this.mapCore.flyToPlace(place);
      this.markers.setHighlight([placeId]);
    });
    this.bus.on('poem:selected', ({ placeId, highlightPlaceIds }) => {
      const place = placeId ? this.data.placeById.get(placeId) : null;
      if (place) this.mapCore.flyToPlace(place);
      this.markers.setHighlight(highlightPlaceIds || (placeId ? [placeId] : []));
    });
    this.bus.on('list:hover', ({ placeId }) => {
      this.markers.setHover(placeId);
    });

    document.getElementById('btn-reset-changan')?.addEventListener('click', () =>
      this.mapCore.resetToChangan()
    );
    document.getElementById('btn-overlay')?.addEventListener('click', async (e) => {
      const on = await this.overlay.toggle();
      e.currentTarget.setAttribute('aria-pressed', String(on));
    });
    document.getElementById('btn-theme')?.addEventListener('click', () =>
      this.cycleTheme()
    );
    document.getElementById('btn-list-mobile')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('is-open');
    });
    document.getElementById('btn-intro')?.addEventListener('click', () => {
      const el = document.getElementById('intro-modal');
      if (el) el.hidden = false;
    });
  }

  _initTheme() {
    let mode = 'auto';
    try {
      mode = localStorage.getItem(THEME_STORAGE_KEY) || 'auto';
    } catch {
      /* ignore */
    }
    this.setTheme(mode);
  }

  cycleTheme() {
    const order = ['auto', 'light', 'dark'];
    const i = order.indexOf(this.state.theme);
    this.setTheme(order[(i + 1) % order.length]);
  }

  setTheme(mode) {
    this.state.theme = mode;
    const root = document.documentElement;
    if (mode === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
    const btn = document.getElementById('btn-theme');
    if (btn) {
      const labels = { auto: '主题:系统', light: '主题:浅', dark: '主题:暗' };
      btn.textContent = labels[mode] || '主题';
      btn.title = `当前：${mode}`;
    }
    this.bus.emit('theme:changed', { mode });
  }

  _showFileProtocolHelp() {
    document.body.innerHTML = `
      <div class="file-protocol-banner">
        <div>
          <h1>请通过本地服务器打开</h1>
          <p>本站使用 ES Modules，直接双击 HTML（file://）无法加载数据。</p>
          <code>npm run serve</code>
          <p>然后访问 <code>http://localhost:5173</code></p>
        </div>
      </div>`;
  }
}

export default App;
