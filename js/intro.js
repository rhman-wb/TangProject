/**
 * 首次访问引导
 */
import { INTRO_STORAGE_KEY } from './config.js';

export class Intro {
  constructor() {
    this.el = null;
  }

  init() {
    this.el = document.getElementById('intro-modal');
    if (!this.el) return this;
    document.getElementById('intro-skip')?.addEventListener('click', () =>
      this.dismiss(true)
    );
    document.getElementById('intro-start')?.addEventListener('click', () =>
      this.dismiss(true)
    );
    // 延迟显示引导，避免 CLS 与 LCP 被遮罩干扰
    const show = () => {
      try {
        if (!localStorage.getItem(INTRO_STORAGE_KEY)) {
          this.el.hidden = false;
        }
      } catch {
        this.el.hidden = false;
      }
    };
    setTimeout(show, 600);
    return this;
  }

  dismiss(remember) {
    if (this.el) this.el.hidden = true;
    if (remember) {
      try {
        localStorage.setItem(INTRO_STORAGE_KEY, '1');
      } catch {
        /* ignore */
      }
    }
  }
}

export default Intro;
