import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EventBus } from '../js/lib/event-bus.js';

describe('EventBus', () => {
  it('pub/sub delivers detail', () => {
    const bus = new EventBus();
    let got = null;
    bus.on('poem:selected', (d) => {
      got = d;
    });
    bus.emit('poem:selected', { poemId: 'x', source: 'test' });
    assert.deepEqual(got, { poemId: 'x', source: 'test' });
  });

  it('unsubscribe stops delivery', () => {
    const bus = new EventBus();
    let n = 0;
    const off = bus.on('filter:changed', () => {
      n++;
    });
    bus.emit('filter:changed', {});
    off();
    bus.emit('filter:changed', {});
    assert.equal(n, 1);
  });
});
