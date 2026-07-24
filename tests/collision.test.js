import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collidesAt } from '../js/collision.js';
import { generateMaze } from '../js/maze.js';
import { CONFIG } from '../js/config.js';
import { gridToWorld } from '../js/coords.js';

const SMALL_SIZE = 5;
const SMALL_CONFIG = (radius = CONFIG.PLAYER_RADIUS) => ({
  MAZE_SIZE: SMALL_SIZE,
  MAZE_SCALE: CONFIG.MAZE_SCALE,
  PLAYER_RADIUS: radius,
});

const OPEN_5X5 = [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1],
];

function smallGridToWorld(col, row) {
  const half = (SMALL_SIZE * CONFIG.MAZE_SCALE) / 2;
  return {
    x: col * CONFIG.MAZE_SCALE - half,
    z: row * CONFIG.MAZE_SCALE - half,
  };
}

function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

test('collides at the center of a wall cell', () => {
  const { x, z } = smallGridToWorld(2, 2);
  assert.equal(collidesAt(OPEN_5X5, SMALL_CONFIG(), x, z), true);
});

test('does not collide at the center of an open cell', () => {
  const { x, z } = smallGridToWorld(1, 1);
  assert.equal(collidesAt(OPEN_5X5, SMALL_CONFIG(), x, z), false);
});

test('collides when stepping outside the maze boundary', () => {
  const size = 5;
  const scale = CONFIG.MAZE_SCALE;
  const grid = Array.from({ length: size }, () => new Array(size).fill(0));
  const half = (size * scale) / 2;
  assert.equal(collidesAt(grid, SMALL_CONFIG(0.5), half - 0.5, 0), true);
  assert.equal(collidesAt(grid, SMALL_CONFIG(0.5), -(half - 0.5), 0), true);
});

test('stays clear well inside the maze center', () => {
  const grid = Array.from({ length: 15 }, () => new Array(15).fill(0));
  assert.equal(collidesAt(grid, CONFIG, 0, 0), false);
});

test('larger player radius causes collision farther from the wall', () => {
  const wallCenter = smallGridToWorld(2, 2);
  const edge = wallCenter.x - CONFIG.MAZE_SCALE / 2;
  assert.equal(collidesAt(OPEN_5X5, SMALL_CONFIG(4.5), edge, wallCenter.z), true);
  assert.equal(collidesAt(OPEN_5X5, SMALL_CONFIG(0.1), edge, wallCenter.z), true);
});

test('small radius near the same wall edge does not collide', () => {
  const wallCenter = smallGridToWorld(2, 2);
  const outside = wallCenter.x - CONFIG.MAZE_SCALE;
  assert.equal(collidesAt(OPEN_5X5, SMALL_CONFIG(0.1), outside, wallCenter.z), false);
});

test('start and end cells of generated mazes are collision-free', () => {
  for (let seed = 0; seed < 10; seed++) {
    const { grid, start, end } = generateMaze(15, { rng: seededRandom(seed) });
    const s = gridToWorld(start.x, start.y);
    const e = gridToWorld(end.x, end.y);
    assert.equal(collidesAt(grid, CONFIG, s.x, s.z), false, `seed ${seed} start blocked`);
    assert.equal(collidesAt(grid, CONFIG, e.x, e.z), false, `seed ${seed} end blocked`);
  }
});

test('collision is symmetric in x and z for a symmetric grid', () => {
  const center = smallGridToWorld(2, 2);
  const offset = CONFIG.MAZE_SCALE * 0.75;
  const hitX = collidesAt(OPEN_5X5, SMALL_CONFIG(), center.x + offset, center.z);
  const hitZ = collidesAt(OPEN_5X5, SMALL_CONFIG(), center.x, center.z + offset);
  assert.equal(hitX, hitZ);
});
