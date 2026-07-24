import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateMaze,
  isFullyConnected,
  countOpenCells,
  getReachableCells,
  shuffle,
} from '../js/maze.js';

function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

test('generateMaze returns a square grid of the requested size', () => {
  const size = 15;
  const { grid } = generateMaze(size);
  assert.equal(grid.length, size);
  for (const row of grid) assert.equal(row.length, size);
});

test('generateMaze keeps the outer border as walls', () => {
  const size = 15;
  const { grid } = generateMaze(size, { rng: seededRandom(1) });
  for (let i = 0; i < size; i++) {
    assert.equal(grid[0][i], 1, `top border at ${i}`);
    assert.equal(grid[size - 1][i], 1, `bottom border at ${i}`);
    assert.equal(grid[i][0], 1, `left border at ${i}`);
    assert.equal(grid[i][size - 1], 1, `right border at ${i}`);
  }
});

test('generateMaze opens the start and end cells', () => {
  const { grid, start, end } = generateMaze(15, { rng: seededRandom(42) });
  assert.equal(grid[start.y][start.x], 0);
  assert.equal(grid[end.y][end.x], 0);
});

test('generated maze is fully connected across many seeds', () => {
  for (let seed = 0; seed < 30; seed++) {
    const { grid, start } = generateMaze(15, { rng: seededRandom(seed * 13 + 1) });
    assert.ok(isFullyConnected(grid, start.x, start.y), `seed ${seed} produced disconnected maze`);
  }
});

test('every open cell is reachable from start for a large maze', () => {
  const { grid, start } = generateMaze(31, { rng: seededRandom(99) });
  const reached = getReachableCells(grid, start.x, start.y);
  assert.equal(reached.length, countOpenCells(grid));
});

test('connectivity holds for multiple odd maze sizes', () => {
  for (const size of [5, 9, 11, 15, 21, 31]) {
    const { grid, start } = generateMaze(size, { rng: seededRandom(size) });
    assert.ok(isFullyConnected(grid, start.x, start.y), `size ${size} not connected`);
  }
});

test('generateMaze is deterministic with a seeded RNG', () => {
  const a = generateMaze(15, { rng: seededRandom(123) });
  const b = generateMaze(15, { rng: seededRandom(123) });
  assert.deepEqual(a.grid, b.grid);
});

test('shuffle preserves the multiset of elements', () => {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const sortedCopy = [...arr].sort((x, y) => x - y);
  shuffle(arr, seededRandom(7));
  assert.deepEqual([...arr].sort((x, y) => x - y), sortedCopy);
});

test('shuffle with fixed seed produces a stable permutation', () => {
  const make = () => [1, 2, 3, 4, 5, 6, 7, 8];
  const a = make();
  const b = make();
  shuffle(a, seededRandom(42));
  shuffle(b, seededRandom(42));
  assert.deepEqual(a, b);
});
