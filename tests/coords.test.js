import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gridToWorld, worldToGrid, wallAABB } from '../js/coords.js';
import { CONFIG, HALF_WORLD_SIZE } from '../js/config.js';

test('gridToWorld places cell (0,0) at the negative world corner', () => {
  const w = gridToWorld(0, 0);
  assert.equal(w.x, -HALF_WORLD_SIZE);
  assert.equal(w.z, -HALF_WORLD_SIZE);
});

test('gridToWorld places the last cell at the positive world corner', () => {
  const last = CONFIG.MAZE_SIZE - 1;
  const w = gridToWorld(last, last);
  assert.equal(w.x, last * CONFIG.MAZE_SCALE - HALF_WORLD_SIZE);
  assert.equal(w.z, last * CONFIG.MAZE_SCALE - HALF_WORLD_SIZE);
});

test('gridToWorld for start cell matches original spawn formula', () => {
  const s = gridToWorld(1, 1);
  assert.equal(s.x, 1 * CONFIG.MAZE_SCALE - HALF_WORLD_SIZE);
  assert.equal(s.z, 1 * CONFIG.MAZE_SCALE - HALF_WORLD_SIZE);
});

test('worldToGrid inverts gridToWorld for every cell center', () => {
  for (let y = 0; y < CONFIG.MAZE_SIZE; y++) {
    for (let x = 0; x < CONFIG.MAZE_SIZE; x++) {
      const w = gridToWorld(x, y);
      const g = worldToGrid(w.x, w.z);
      assert.equal(g.col, x, `col mismatch at cell (${x},${y})`);
      assert.equal(g.row, y, `row mismatch at cell (${x},${y})`);
    }
  }
});

test('worldToGrid snaps points within a cell to that cell', () => {
  const center = gridToWorld(3, 4);
  const quarter = CONFIG.MAZE_SCALE * 0.25;
  for (const [dx, dz] of [[quarter, 0], [-quarter, 0], [0, quarter], [0, -quarter]]) {
    const g = worldToGrid(center.x + dx, center.z + dz);
    assert.equal(g.col, 3);
    assert.equal(g.row, 4);
  }
});

test('wallAABB spans exactly one MAZE_SCALE in each axis', () => {
  const box = wallAABB(2, 2);
  assert.equal(box.maxX - box.minX, CONFIG.MAZE_SCALE);
  assert.equal(box.maxZ - box.minZ, CONFIG.MAZE_SCALE);
});

test('wallAABB is centered on the cell world position', () => {
  const center = gridToWorld(2, 2);
  const box = wallAABB(2, 2);
  assert.equal((box.minX + box.maxX) / 2, center.x);
  assert.equal((box.minZ + box.maxZ) / 2, center.z);
});
