/**
 * 列表侧栏：当前筛选下诗词列表，悬停/点击联动
 */
import { filterPoems } from './lib/filters.js';
import { selectTargetPlaceId, allPlaceIds } from './lib/place-target.js';
import { PERIOD_LABELS } from './config.js';

export class ListPanel {
  /**
   * @param {import('./lib/event-bus.js').EventBus} bus
   * @param {import('./data-loader.js').AppData} data
   */
  constructor(bus, data) {
    this.bus = bus;
    this.data = data;
    this.listEl = null;
    this.filter = null;
  }

  init() {
    this.listEl = document.getElementById('poem-list');
    this.bus.on('filter:changed', (f) => {
      this.filter = f;
      this.render(f);
    });
    return this;
  }

  render(filter) {
    if (!this.listEl) return;
    const poems = filterPoems(this.data.poems, filter, this.data.placeById);
    // 按时期 + 标题排序
    poems.sort((a, b) => {
      if (a.period !== b.period) return a.period.localeCompare(b.period);
      return a.title.localeCompare(b.title, 'zh');
    });
    this.listEl.innerHTML = '';
    if (poems.length === 0) {
      const li = document.createElement('li');
      li.innerHTML =
        '<p style="padding:0.75rem;color:var(--color-ink-muted);font-size:0.85rem">当前筛选下无诗词</p>';
      this.listEl.appendChild(li);
      return;
    }
    for (const poem of poems) {
      const poet = this.data.poetById.get(poem.poetId);
      const targetId = selectTargetPlaceId(poem.places, this.data.placeById);
      const place = targetId ? this.data.placeById.get(targetId) : null;
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = `
        <span class="poem-list__title">${escapeHtml(poem.title)}</span>
        <span class="poem-list__meta">${escapeHtml(poet?.name || '')} · ${PERIOD_LABELS[poem.period] || ''} · ${escapeHtml(place?.name || '')}</span>
        <span class="poem-list__highlight">${escapeHtml(poem.highlight?.[0] || '')}</span>
      `;
      btn.addEventListener('mouseenter', () => {
        btn.classList.add('is-hover');
        this.bus.emit('list:hover', { placeId: targetId, poemId: poem.id });
      });
      btn.addEventListener('mouseleave', () => {
        btn.classList.remove('is-hover');
        this.bus.emit('list:hover', { placeId: null, poemId: null });
      });
      btn.addEventListener('click', () => {
        const ids = allPlaceIds(poem.places);
        this.bus.emit('poem:selected', {
          poemId: poem.id,
          placeId: targetId,
          highlightPlaceIds: ids,
          source: 'list',
        });
      });
      li.appendChild(btn);
      this.listEl.appendChild(li);
    }
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default ListPanel;
