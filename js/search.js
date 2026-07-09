/**
 * 搜索：内存索引 + 300ms 防抖
 */
import { SEARCH_DEBOUNCE_MS } from './config.js';
import {
  buildSearchIndex,
  searchIndex,
  flattenSearchResults,
} from './lib/search-index.js';
import { selectTargetPlaceId } from './lib/place-target.js';

export class Search {
  /**
   * @param {import('./lib/event-bus.js').EventBus} bus
   * @param {import('./data-loader.js').AppData} data
   */
  constructor(bus, data) {
    this.bus = bus;
    this.data = data;
    this.index = buildSearchIndex(data, data.poetById);
    this.input = null;
    this.resultsEl = null;
    this._timer = null;
  }

  init() {
    this.input = document.getElementById('search-input');
    this.resultsEl = document.getElementById('search-results');
    if (!this.input || !this.resultsEl) return this;

    this.input.addEventListener('input', () => {
      clearTimeout(this._timer);
      this._timer = setTimeout(
        () => this.query(this.input.value),
        SEARCH_DEBOUNCE_MS
      );
    });
    this.input.addEventListener('focus', () => {
      if (this.input.value.trim()) this.query(this.input.value);
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-wrap')) this.hide();
    });
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hide();
    });
    return this;
  }

  query(q) {
    const grouped = searchIndex(this.index, q);
    const flat = flattenSearchResults(grouped);
    this.resultsEl.innerHTML = '';
    if (!q.trim() || flat.length === 0) {
      if (q.trim()) {
        const li = document.createElement('li');
        li.innerHTML =
          '<button type="button" disabled>无匹配结果</button>';
        this.resultsEl.appendChild(li);
        this.resultsEl.hidden = false;
      } else {
        this.hide();
      }
      return;
    }
    for (const rec of flat) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = `<span class="cat">${rec.category}</span>${escapeHtml(rec.display)}${rec.sub ? ` · ${escapeHtml(rec.sub)}` : ''}`;
      btn.addEventListener('click', () => this.select(rec));
      li.appendChild(btn);
      this.resultsEl.appendChild(li);
    }
    this.resultsEl.hidden = false;
  }

  select(rec) {
    this.hide();
    this.input.value = rec.display;
    if (rec.type === 'poem') {
      const poem = this.data.poemById.get(rec.id);
      const placeId = poem
        ? selectTargetPlaceId(poem.places, this.data.placeById)
        : null;
      this.bus.emit('poem:selected', {
        poemId: rec.id,
        placeId,
        source: 'search',
      });
    } else if (rec.type === 'place') {
      this.bus.emit('place:selected', { placeId: rec.id, source: 'search' });
    } else if (rec.type === 'poet') {
      this.bus.emit('poet:selected', { poetId: rec.id, source: 'search' });
    }
  }

  hide() {
    if (this.resultsEl) this.resultsEl.hidden = true;
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default Search;
