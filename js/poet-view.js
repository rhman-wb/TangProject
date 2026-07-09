/**
 * 诗人介绍视图
 */
import { PERIOD_LABELS } from './config.js';
import { selectTargetPlaceId } from './lib/place-target.js';

export class PoetView {
  /**
   * @param {import('./lib/event-bus.js').EventBus} bus
   * @param {import('./data-loader.js').AppData} data
   */
  constructor(bus, data) {
    this.bus = bus;
    this.data = data;
    this.el = null;
  }

  init() {
    this.el = document.getElementById('poet-view');
    document.getElementById('poet-view-close')?.addEventListener('click', () =>
      this.close()
    );
    this.bus.on('poet:selected', ({ poetId }) => this.show(poetId));
    return this;
  }

  show(poetId) {
    const poet = this.data.poetById.get(poetId);
    if (!poet || !this.el) return;
    const works = this.data.poems.filter((p) => p.poetId === poetId);
    const years =
      poet.birthYear && poet.deathYear
        ? `${poet.birthYear}–${poet.deathYear}`
        : poet.activeYears
          ? `活动约 ${poet.activeYears[0]}–${poet.activeYears[1]}`
          : '';

    this.el.innerHTML = `
      <div class="poet-view__header">
        <img class="poet-view__portrait" src="${poet.portrait || 'assets/images/poets/default.svg'}" alt="${escapeAttr(poet.name)}" width="80" height="80" loading="lazy"/>
        <div>
          <button type="button" class="btn-ghost" id="poet-view-close" style="float:right">关闭</button>
          <h2 style="margin:0 0 0.35rem;font-family:var(--font-poem)">${escapeHtml(poet.name)}</h2>
          <p style="margin:0;color:var(--color-ink-muted);font-size:0.9rem">
            ${poet.courtesyName ? `字${escapeHtml(poet.courtesyName)} · ` : ''}
            <span class="period-badge" data-period="${poet.period}">${PERIOD_LABELS[poet.period] || ''}</span>
            ${years ? ` · ${years}` : ''}
          </p>
        </div>
      </div>
      <h3 style="font-size:0.9rem;color:var(--color-ink-muted)">小传</h3>
      <p style="line-height:1.7;font-size:0.95rem">${escapeHtml(poet.bio || '暂无小传')}</p>
      <h3 style="font-size:0.9rem;color:var(--color-ink-muted)">与长安渊源</h3>
      <p style="line-height:1.7;font-size:0.95rem">${escapeHtml(poet.changanStory || '暂无')}</p>
      <h3 style="font-size:0.9rem;color:var(--color-ink-muted)">收录作品（${works.length}）</h3>
      <ul class="poet-view__works" id="poet-works"></ul>
    `;
    this.el.querySelector('#poet-view-close')?.addEventListener('click', () =>
      this.close()
    );
    const list = this.el.querySelector('#poet-works');
    for (const poem of works) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = poem.title;
      btn.addEventListener('click', () => {
        const placeId = selectTargetPlaceId(poem.places, this.data.placeById);
        this.close();
        this.bus.emit('poem:selected', {
          poemId: poem.id,
          placeId,
          source: 'poet-view',
        });
      });
      li.appendChild(btn);
      list.appendChild(li);
    }
    this.el.classList.add('is-open');
    this.el.setAttribute('aria-hidden', 'false');
  }

  close() {
    this.el?.classList.remove('is-open');
    this.el?.setAttribute('aria-hidden', 'true');
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, '&quot;');
}

export default PoetView;
