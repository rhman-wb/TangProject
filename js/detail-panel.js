/**
 * 详情面板：古今地名 + 诗卡
 */
import { PERIOD_LABELS } from './config.js';
import { formatYearLabel } from './lib/year-label.js';

export class DetailPanel {
  /**
   * @param {import('./lib/event-bus.js').EventBus} bus
   * @param {import('./data-loader.js').AppData} data
   */
  constructor(bus, data) {
    this.bus = bus;
    this.data = data;
    this.el = null;
    this.body = null;
    this.titleEl = null;
    this.subEl = null;
  }

  init() {
    this.el = document.getElementById('detail-panel');
    this.body = document.getElementById('detail-body');
    this.titleEl = document.getElementById('detail-title');
    this.subEl = document.getElementById('detail-subtitle');
    document.getElementById('detail-close')?.addEventListener('click', () =>
      this.close()
    );
    this.bus.on('place:selected', ({ placeId }) => this.showPlace(placeId));
    this.bus.on('poem:selected', ({ poemId, placeId }) =>
      this.showPoem(poemId, placeId)
    );
    return this;
  }

  open() {
    this.el?.classList.add('is-open');
    this.el?.setAttribute('aria-hidden', 'false');
  }

  close() {
    this.el?.classList.remove('is-open');
    this.el?.setAttribute('aria-hidden', 'true');
    this.bus.emit('detail:closed', {});
  }

  showPlace(placeId) {
    const place = this.data.placeById.get(placeId);
    if (!place) return;
    this.titleEl.textContent = place.name;
    this.subEl.textContent = formatPlaceNames(place);
    const poems = this.data.poemsByPlaceId.get(placeId) || [];
    this.body.innerHTML = '';
    this.body.appendChild(renderPlaceHeader(place));
    if (poems.length === 0) {
      const p = document.createElement('p');
      p.textContent = '此地暂无收录诗词。';
      this.body.appendChild(p);
    } else {
      for (const poem of poems) {
        this.body.appendChild(this._renderPoemCard(poem));
      }
    }
    this.open();
  }

  showPoem(poemId, placeId) {
    const poem = this.data.poemById.get(poemId);
    if (!poem) return;
    const place =
      this.data.placeById.get(placeId) ||
      this.data.placeById.get(poem.places?.[0]?.placeId);
    this.titleEl.textContent = place?.name || poem.title;
    this.subEl.textContent = place ? formatPlaceNames(place) : '';
    this.body.innerHTML = '';
    if (place) this.body.appendChild(renderPlaceHeader(place));
    this.body.appendChild(this._renderPoemCard(poem));
    this.open();
  }

  _renderPoemCard(poem) {
    const poet = this.data.poetById.get(poem.poetId);
    const card = document.createElement('article');
    card.className = 'poem-card';
    card.dataset.poemId = poem.id;

    const title = document.createElement('h3');
    title.className = 'poem-card__title';
    title.textContent = poem.title;
    card.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'poem-card__meta';
    const authorBtn = document.createElement('button');
    authorBtn.type = 'button';
    authorBtn.className = 'poem-card__author';
    authorBtn.textContent = poet?.name || poem.poetId;
    authorBtn.addEventListener('click', () => {
      this.bus.emit('poet:selected', { poetId: poem.poetId, source: 'detail' });
    });
    meta.appendChild(authorBtn);
    const badge = document.createElement('span');
    badge.className = 'period-badge';
    badge.dataset.period = poem.period;
    badge.textContent = PERIOD_LABELS[poem.period] || poem.period;
    meta.appendChild(badge);
    const year = document.createElement('span');
    year.className = 'poem-card__year';
    year.textContent = formatYearLabel(poem.year, poem.yearPrecision);
    meta.appendChild(year);
    card.appendChild(meta);

    const body = document.createElement('div');
    body.className = 'poem-card__body';
    const highlights = (poem.highlight || []).map(normalizeLine);
    const lines = poem.content || [];
    const long = lines.length > 8;
    if (long) body.classList.add('is-collapsed');
    for (const line of lines) {
      const span = document.createElement('span');
      span.className = 'line';
      span.textContent = line;
      if (isHighlightLine(line, highlights)) span.classList.add('is-highlight');
      body.appendChild(span);
    }
    card.appendChild(body);

    if (long) {
      const exp = document.createElement('button');
      exp.type = 'button';
      exp.className = 'poem-card__expand';
      exp.textContent = '展开全文';
      exp.addEventListener('click', () => {
        const collapsed = body.classList.toggle('is-collapsed');
        exp.textContent = collapsed ? '展开全文' : '收起';
      });
      card.appendChild(exp);
    }

    if (poem.story) {
      const story = document.createElement('p');
      story.className = 'poem-card__story';
      story.textContent = poem.story;
      card.appendChild(story);
    }
    if (poem.sources?.length) {
      const src = document.createElement('p');
      src.className = 'poem-card__sources';
      src.textContent = '出处：' + poem.sources.join('；');
      card.appendChild(src);
    }
    return card;
  }
}

function formatPlaceNames(place) {
  const ancient = place.ancientName || place.name;
  const modern = place.modernName || '';
  if (modern) return `${ancient} · 今${modern.replace(/^今/, '')}`;
  return ancient;
}

function renderPlaceHeader(place) {
  const wrap = document.createElement('div');
  const imgSrc = place.images?.[0]?.src;
  if (imgSrc) {
    const img = document.createElement('img');
    img.className = 'detail-panel__image';
    img.src = imgSrc;
    img.alt = place.images[0].caption || place.name;
    img.loading = 'lazy';
    wrap.appendChild(img);
  }
  if (place.description) {
    const d = document.createElement('p');
    d.className = 'detail-panel__desc';
    d.textContent = place.description;
    wrap.appendChild(d);
  }
  return wrap;
}

function normalizeLine(s) {
  return String(s).replace(/[，。、；：！？\s]/g, '');
}

function isHighlightLine(line, highlightsNorm) {
  const n = normalizeLine(line);
  if (!n) return false;
  return highlightsNorm.some((h) => h.includes(n) || n.includes(h));
}

export default DetailPanel;
