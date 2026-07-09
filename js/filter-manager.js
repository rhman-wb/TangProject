/**
 * 筛选器：时期 / 诗人 / 扩展范围状态
 */
import { PERIODS, PERIOD_LABELS } from './config.js';
import { createFilterState } from './lib/filters.js';

export class FilterManager {
  /**
   * @param {import('./lib/event-bus.js').EventBus} bus
   * @param {import('./data-loader.js').AppData} data
   */
  constructor(bus, data) {
    this.bus = bus;
    this.data = data;
    this.state = createFilterState({
      periods: null,
      poetIds: null,
      year: null,
      showExtended: false,
    });
  }

  init() {
    this._renderPeriodButtons();
    this._renderPoetCheckboxes();
    this._bindExtendedToggle();
    return this;
  }

  getState() {
    return { ...this.state, periods: this.state.periods ? [...this.state.periods] : null, poetIds: this.state.poetIds ? [...this.state.poetIds] : null };
  }

  _emit() {
    this.bus.emit('filter:changed', this.getState());
  }

  setPeriods(periods) {
    // null 或包含全部四段 → 视为全部
    if (!periods || periods.length === 0 || periods.length === PERIODS.length) {
      this.state.periods = null;
    } else {
      this.state.periods = periods;
    }
    this._syncPeriodButtons();
    this._emit();
  }

  setPoetIds(poetIds) {
    if (!poetIds || poetIds.length === 0) {
      this.state.poetIds = null;
    } else {
      this.state.poetIds = poetIds;
    }
    this._emit();
  }

  setYear(year) {
    this.state.year = year;
    this._emit();
  }

  setShowExtended(show) {
    this.state.showExtended = !!show;
    const btn = document.getElementById('btn-extended');
    if (btn) btn.setAttribute('aria-pressed', String(this.state.showExtended));
    this.bus.emit('scope:changed', { showExtended: this.state.showExtended });
    this._emit();
  }

  _renderPeriodButtons() {
    const host = document.getElementById('period-filter');
    if (!host) return;
    host.innerHTML = '';
    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.textContent = '全部';
    allBtn.dataset.period = 'all';
    allBtn.setAttribute('aria-pressed', 'true');
    allBtn.addEventListener('click', () => this.setPeriods(null));
    host.appendChild(allBtn);
    for (const p of PERIODS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = PERIOD_LABELS[p];
      btn.dataset.period = p;
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', () => {
        // 单选时期（也可再点取消回全部）
        if (this.state.periods?.length === 1 && this.state.periods[0] === p) {
          this.setPeriods(null);
        } else {
          this.setPeriods([p]);
        }
      });
      host.appendChild(btn);
    }
  }

  _syncPeriodButtons() {
    const host = document.getElementById('period-filter');
    if (!host) return;
    const active = this.state.periods;
    for (const btn of host.querySelectorAll('button')) {
      const p = btn.dataset.period;
      if (p === 'all') {
        btn.setAttribute('aria-pressed', String(!active));
      } else {
        btn.setAttribute('aria-pressed', String(!!active?.includes(p)));
      }
    }
  }

  _renderPoetCheckboxes() {
    const host = document.getElementById('poet-filter');
    if (!host) return;
    host.innerHTML = '';
    const byPeriod = new Map(PERIODS.map((p) => [p, []]));
    for (const poet of this.data.poets) {
      if (byPeriod.has(poet.period)) byPeriod.get(poet.period).push(poet);
    }
    for (const p of PERIODS) {
      const poets = byPeriod.get(p);
      if (!poets?.length) continue;
      const group = document.createElement('div');
      group.className = 'poet-filter-group';
      group.innerHTML = `<div class="poet-filter-group__title" style="color:var(--color-${p})">${PERIOD_LABELS[p]}</div>`;
      for (const poet of poets) {
        const label = document.createElement('label');
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = poet.id;
        cb.addEventListener('change', () => this._onPoetChange());
        label.appendChild(cb);
        label.appendChild(document.createTextNode(poet.name));
        // 双击/额外按钮进诗人页
        const link = document.createElement('button');
        link.type = 'button';
        link.className = 'btn-ghost';
        link.style.cssText =
          'padding:0 0.25rem;margin-left:auto;font-size:0.7rem;border:none;';
        link.textContent = '介';
        link.title = `${poet.name}介绍`;
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.bus.emit('poet:selected', { poetId: poet.id, source: 'filter' });
        });
        label.style.display = 'flex';
        label.appendChild(link);
        group.appendChild(label);
      }
      host.appendChild(group);
    }
  }

  _onPoetChange() {
    const host = document.getElementById('poet-filter');
    const ids = [...host.querySelectorAll('input[type="checkbox"]:checked')].map(
      (el) => el.value
    );
    this.setPoetIds(ids);
  }

  _bindExtendedToggle() {
    const btn = document.getElementById('btn-extended');
    if (!btn) return;
    btn.addEventListener('click', () => {
      this.setShowExtended(!this.state.showExtended);
    });
  }
}

export default FilterManager;
