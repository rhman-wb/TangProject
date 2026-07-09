/**
 * 时间轴 618–907，四段边界，与筛选取交集
 */
import { TIMELINE_RANGE, TIMELINE_MARKS } from './config.js';
import { formatYearLabel } from './lib/year-label.js';

export class Timeline {
  /**
   * @param {import('./lib/event-bus.js').EventBus} bus
   * @param {import('./filter-manager.js').FilterManager} filterManager
   */
  constructor(bus, filterManager) {
    this.bus = bus;
    this.filterManager = filterManager;
    this.year = null;
    this.playing = false;
    this._playTimer = null;
    this.rangeEl = null;
    this.labelEl = null;
  }

  init() {
    this.rangeEl = document.getElementById('timeline-range');
    this.labelEl = document.getElementById('timeline-year-label');
    const marks = document.getElementById('timeline-marks');
    if (marks) {
      marks.innerHTML = TIMELINE_MARKS.map((y) => `<span>${y}</span>`).join('');
    }
    if (this.rangeEl) {
      this.rangeEl.min = String(TIMELINE_RANGE.start);
      this.rangeEl.max = String(TIMELINE_RANGE.end);
      this.rangeEl.value = String(TIMELINE_RANGE.end);
      this.rangeEl.addEventListener('input', () => {
        this.setYear(Number(this.rangeEl.value));
      });
    }
    document.getElementById('timeline-play')?.addEventListener('click', () =>
      this.togglePlay()
    );
    document.getElementById('timeline-reset')?.addEventListener('click', () =>
      this.reset()
    );
    this._updateLabel();
    return this;
  }

  setYear(year) {
    this.year = year;
    if (this.rangeEl) this.rangeEl.value = String(year);
    this._updateLabel();
    this.filterManager.setYear(year);
  }

  reset() {
    this.stop();
    this.year = null;
    if (this.rangeEl) this.rangeEl.value = String(TIMELINE_RANGE.end);
    this._updateLabel();
    this.filterManager.setYear(null);
  }

  togglePlay() {
    if (this.playing) this.stop();
    else this.play();
  }

  play() {
    this.playing = true;
    const btn = document.getElementById('timeline-play');
    if (btn) {
      btn.textContent = '暂停';
      btn.setAttribute('aria-pressed', 'true');
    }
    let y = this.year ?? TIMELINE_RANGE.start;
    if (y >= TIMELINE_RANGE.end) y = TIMELINE_RANGE.start;
    this.setYear(y);
    this._playTimer = setInterval(() => {
      y += 5;
      if (y >= TIMELINE_RANGE.end) {
        this.setYear(TIMELINE_RANGE.end);
        this.stop();
        return;
      }
      this.setYear(y);
    }, 500);
  }

  stop() {
    this.playing = false;
    clearInterval(this._playTimer);
    const btn = document.getElementById('timeline-play');
    if (btn) {
      btn.textContent = '播放';
      btn.setAttribute('aria-pressed', 'false');
    }
  }

  _updateLabel() {
    if (!this.labelEl) return;
    if (this.year == null) {
      this.labelEl.textContent = '全时段';
    } else {
      this.labelEl.textContent = `截至 ${formatYearLabel(this.year, 'exact')}`;
    }
  }
}

export default Timeline;
