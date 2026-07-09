/**
 * 标记层：地点中心标记（每地一标），点击选中
 */
import { PERIOD_COLORS } from './config.js';
import { placeVisible } from './lib/filters.js';

function pinSvg(color) {
  return `<svg class="poem-marker__svg" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M14 0C6.3 0 0 6.1 0 13.6c0 9.6 12.4 21.2 13 21.7a1.3 1.3 0 0 0 1.9 0c.6-.5 13-12.1 13-21.7C28 6.1 21.7 0 14 0z" fill="${color}"/>
    <circle cx="14" cy="13" r="6" fill="#fff" opacity="0.95"/>
    <text x="14" y="16.5" text-anchor="middle" font-size="9" font-weight="700" fill="${color}" font-family="serif">诗</text>
  </svg>`;
}

export class MapMarkers {
  /**
   * @param {import('./map-core.js').MapCore} mapCore
   * @param {import('./lib/event-bus.js').EventBus} bus
   * @param {import('./data-loader.js').AppData} data
   */
  constructor(mapCore, bus, data) {
    this.mapCore = mapCore;
    this.bus = bus;
    this.data = data;
    /** @type {Map<string, L.Marker>} */
    this.markers = new Map();
    this.layerGroup = null;
    this.clusterGroup = null;
  }

  init() {
    const L = window.L;
    this.layerGroup = L.layerGroup();
    if (L.markerClusterGroup) {
      this.clusterGroup = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 50,
        disableClusteringAtZoom: 14,
      });
      this.mapCore.getMap().addLayer(this.clusterGroup);
    } else {
      this.layerGroup.addTo(this.mapCore.getMap());
    }
    return this;
  }

  /**
   * 按筛选状态刷新标记
   * @param {import('./lib/filters.js').FilterState} filter
   */
  update(filter) {
    const L = window.L;
    const host = this.clusterGroup || this.layerGroup;
    host.clearLayers();
    this.markers.clear();

    for (const place of this.data.places) {
      const poems = this.data.poemsByPlaceId.get(place.id) || [];
      if (!placeVisible(place, poems, filter)) continue;

      // 标记色：该地点关联诗中最多时期色，否则 high
      const periodCount = {};
      for (const p of poems) {
        if (!periodCount[p.period]) periodCount[p.period] = 0;
        periodCount[p.period]++;
      }
      const topPeriod =
        Object.entries(periodCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        'high';
      const color = PERIOD_COLORS[topPeriod] || PERIOD_COLORS.high;
      const latlng = this.mapCore.toDisplayLatLng(place.coordinates);
      const count = poems.length;
      const approx = place.locationPrecision === 'approximate';

      const html = `<div class="poem-marker${approx ? ' is-approximate' : ''}" data-place-id="${place.id}" style="position:relative;color:${color}">
        <div class="poem-marker__pin">${pinSvg(color)}</div>
        ${count > 1 ? `<span class="poem-marker__badge">${count}</span>` : ''}
      </div>`;

      const icon = L.divIcon({
        className: 'poem-marker-icon',
        html,
        iconSize: [28, 36],
        iconAnchor: [14, 36],
        popupAnchor: [0, -32],
      });

      const marker = L.marker(latlng, { icon, riseOnHover: true });
      const tipPoem = poems[0];
      const poet = tipPoem
        ? this.data.poetById.get(tipPoem.poetId)?.name || ''
        : '';
      const hl = tipPoem?.highlight?.[0] || '';
      marker.bindTooltip(
        `<strong>${place.name}</strong><br/>${tipPoem ? `${tipPoem.title} · ${poet}` : ''}${hl ? `<br/><em>${hl}</em>` : ''}`,
        { direction: 'top', offset: [0, -28], opacity: 0.95, className: 'poem-tip' }
      );
      marker.on('click', () => {
        this.bus.emit('place:selected', { placeId: place.id, source: 'marker' });
      });
      host.addLayer(marker);
      this.markers.set(place.id, marker);
    }
  }

  /**
   * 列表悬停联动：放大指定地点标记
   * @param {string|null} placeId
   */
  setHover(placeId) {
    for (const [id, marker] of this.markers) {
      const el = marker.getElement();
      if (!el) continue;
      const pin = el.querySelector('.poem-marker');
      if (!pin) continue;
      pin.classList.toggle('is-hover', id === placeId);
    }
  }

  /**
   * 多地点高亮
   * @param {string[]} placeIds
   */
  setHighlight(placeIds) {
    const set = new Set(placeIds || []);
    for (const [id, marker] of this.markers) {
      const el = marker.getElement();
      if (!el) continue;
      const pin = el.querySelector('.poem-marker');
      if (!pin) continue;
      pin.classList.toggle('is-highlight', set.has(id));
    }
  }

  getMarker(placeId) {
    return this.markers.get(placeId);
  }
}

export default MapMarkers;
