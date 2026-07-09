/**
 * 唐长安城复原图层（GeoJSON）— 打开开关时按需加载
 */
import { loadChanganCity } from './data-loader.js';

const TYPE_STYLE = {
  wall: { color: '#9d2933', weight: 2, fillOpacity: 0.05, fillColor: '#9d2933' },
  palace: { color: '#c9a227', weight: 1.5, fillOpacity: 0.2, fillColor: '#c9a227' },
  ward: { color: '#2c6e8f', weight: 1, fillOpacity: 0.12, fillColor: '#2c6e8f' },
  street: { color: '#5a5650', weight: 1.5, fillOpacity: 0, dashArray: '4 4' },
};

export class MapOverlay {
  /**
   * @param {import('./map-core.js').MapCore} mapCore
   */
  constructor(mapCore) {
    this.mapCore = mapCore;
    this.layer = null;
    this.enabled = false;
    this.noteEl = null;
    this._loaded = false;
  }

  init() {
    this.noteEl = document.getElementById('overlay-note');
    return this;
  }

  async toggle(force) {
    const next = force != null ? !!force : !this.enabled;
    if (next === this.enabled) return this.enabled;
    if (next) {
      await this._ensureLoaded();
      if (this.layer) {
        this.layer.addTo(this.mapCore.getMap());
        this.enabled = true;
        if (this.noteEl) this.noteEl.hidden = false;
      }
    } else {
      if (this.layer) this.mapCore.getMap().removeLayer(this.layer);
      this.enabled = false;
      if (this.noteEl) this.noteEl.hidden = true;
    }
    return this.enabled;
  }

  async _ensureLoaded() {
    if (this._loaded) return;
    const L = window.L;
    try {
      const geo = await loadChanganCity();
      this.layer = L.geoJSON(geo, {
        style(feature) {
          const t = feature?.properties?.type || 'ward';
          return TYPE_STYLE[t] || TYPE_STYLE.ward;
        },
        onEachFeature(feature, layer) {
          const name = feature?.properties?.name;
          const type = feature?.properties?.type;
          if (name && type === 'ward') {
            layer.bindTooltip(name, {
              permanent: false,
              direction: 'center',
              className: 'ward-label',
            });
          } else if (name) {
            layer.bindTooltip(name, { sticky: true });
          }
        },
      });
      // 高缩放时显示坊名
      this.mapCore.getMap().on('zoomend', () => this._updateLabels());
      this._loaded = true;
    } catch {
      // 降级：无 GeoJSON 时不抛错，仅保持关闭
      console.warn('长安城复原图层加载失败，已跳过');
      this._loaded = true;
    }
  }

  _updateLabels() {
    // Leaflet tooltip permanent 切换较重，保持 hover 即可
  }
}

export default MapOverlay;
