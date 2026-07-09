/**
 * 基于 EventTarget 的简易事件总线（ADR-0005）
 * 事件名采用「域:动作」小写形式。
 */

export class EventBus {
  constructor() {
    this._target = new EventTarget();
  }

  /**
   * @param {string} type
   * @param {(detail: any) => void} handler
   * @returns {() => void} unsubscribe
   */
  on(type, handler) {
    const listener = (event) => handler(event.detail);
    this._target.addEventListener(type, listener);
    return () => this._target.removeEventListener(type, listener);
  }

  /**
   * @param {string} type
   * @param {any} [detail]
   */
  emit(type, detail) {
    this._target.dispatchEvent(new CustomEvent(type, { detail }));
  }
}

export default EventBus;
