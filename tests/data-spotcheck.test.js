import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const poets = JSON.parse(readFileSync(join(root, 'data/poets.json'), 'utf8')).poets;
const places = JSON.parse(readFileSync(join(root, 'data/places.json'), 'utf8')).places;
const poems = JSON.parse(readFileSync(join(root, 'data/poems.json'), 'utf8')).poems;
const placeById = new Map(places.map((p) => [p.id, p]));

describe('dataset scale and spot checks', () => {
  it('meets PRD scale', () => {
    assert.ok(poems.length >= 60, `poems ${poems.length}`);
    assert.ok(places.length >= 30, `places ${places.length}`);
    assert.ok(poets.length >= 25, `poets ${poets.length}`);
  });

  it('李白/杜甫 → 盛唐', () => {
    assert.equal(poets.find((p) => p.id === 'libai')?.period, 'high');
    assert.equal(poets.find((p) => p.id === 'dufu')?.period, 'high');
  });

  it('马嵬 → extended', () => {
    assert.equal(placeById.get('mawei')?.scope, 'extended');
  });

  it('长恨歌 highlight ≥3 and no 仙界 marker', () => {
    const p = poems.find((x) => x.id === 'changhenge');
    assert.ok(p);
    assert.ok(p.highlight.length >= 3);
    assert.equal(
      places.some((pl) => /仙界|梦境/.test(pl.name) || /仙界|梦境/.test(pl.id)),
      false
    );
  });

  it('送元二：渭城 core + 阳关 related', () => {
    const p = poems.find((x) => x.id === 'songyuanershi-anxi');
    assert.ok(p);
    const w = p.places.find((r) => r.placeId === 'weicheng');
    const y = p.places.find((r) => r.placeId === 'yangguan');
    assert.ok(w);
    assert.equal(placeById.get('weicheng')?.scope, 'core');
    assert.equal(y?.relation, 'related');
    assert.equal(placeById.get('yangguan')?.scope, 'extended');
  });

  it('images status generated after T12', () => {
    const pending = places.filter((p) =>
      (p.images || []).some((img) => img.status !== 'generated')
    );
    assert.equal(pending.length, 0, pending.map((p) => p.id).join(','));
  });

  it('shipped place images use WebP', () => {
    const bad = [];
    for (const p of places) {
      for (const img of p.images || []) {
        if (!/\.webp$/i.test(img.src || '')) {
          bad.push(`${p.id}:${img.src}`);
        }
      }
    }
    assert.equal(bad.length, 0, bad.join(', '));
  });
});

