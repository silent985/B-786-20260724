import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createEmptyGrid, generateMaze, isConnected, countCells } from '../src/maze.js';

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe('maze', () => {
  describe('createEmptyGrid', () => {
    it('creates a grid of the specified size filled with walls (1)', () => {
      const grid = createEmptyGrid(5);
      assert.equal(grid.length, 5);
      for (const row of grid) {
        assert.equal(row.length, 5);
        for (const cell of row) assert.equal(cell, 1);
      }
    });
  });

  describe('generateMaze', () => {
    it('throws for even sizes', () => {
      assert.throws(() => generateMaze(4), /odd/);
    });

    it('throws for sizes less than 3', () => {
      assert.throws(() => generateMaze(2), /at least 3/);
    });

    it('returns a grid of the correct size', () => {
      const { grid } = generateMaze(15, seededRandom(42));
      assert.equal(grid.length, 15);
      for (const row of grid) assert.equal(row.length, 15);
    });

    it('start cell is a path (0)', () => {
      const { grid, start } = generateMaze(15, seededRandom(1));
      assert.equal(grid[start.y][start.x], 0);
    });

    it('end cell is a path (0)', () => {
      const { grid, end } = generateMaze(15, seededRandom(1));
      assert.equal(grid[end.y][end.x], 0);
    });

    it('border cells are always walls except where carved', () => {
      const { grid } = generateMaze(15, seededRandom(7));
      for (let x = 0; x < 15; x++) {
        assert.equal(grid[0][x], 1);
        assert.equal(grid[14][x], 1);
      }
      for (let y = 0; y < 15; y++) {
        assert.equal(grid[y][0], 1);
        assert.equal(grid[y][14], 1);
      }
    });

    it('produces deterministic mazes with the same seed', () => {
      const a = generateMaze(15, seededRandom(123));
      const b = generateMaze(15, seededRandom(123));
      assert.deepEqual(a.grid, b.grid);
      assert.deepEqual(a.start, b.start);
      assert.deepEqual(a.end, b.end);
    });

    it('generates a fully connected maze (start can reach end)', () => {
      for (let seed = 0; seed < 20; seed++) {
        const { grid, start, end } = generateMaze(15, seededRandom(seed));
        assert.ok(
          isConnected(grid, start, end),
          `Maze with seed ${seed} is not connected`
        );
      }
    });

    it('has a reasonable number of path cells (not all walls)', () => {
      const { grid } = generateMaze(15, seededRandom(99));
      const paths = countCells(grid, 0);
      const total = 15 * 15;
      const ratio = paths / total;
      assert.ok(ratio > 0.3, `Path ratio ${ratio} too low`);
      assert.ok(ratio < 0.8, `Path ratio ${ratio} too high`);
    });

    it('works for the minimum odd size (3)', () => {
      const { grid, start, end } = generateMaze(3, seededRandom(1));
      assert.equal(grid.length, 3);
      assert.ok(isConnected(grid, start, end));
    });
  });

  describe('isConnected', () => {
    it('returns true for a simple open grid', () => {
      const grid = [
        [1, 1, 1],
        [1, 0, 0],
        [1, 1, 1],
      ];
      assert.ok(isConnected(grid, { x: 1, y: 1 }, { x: 2, y: 1 }));
    });

    it('returns false when blocked', () => {
      const grid = [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
      ];
      assert.equal(isConnected(grid, { x: 1, y: 1 }, { x: 2, y: 1 }), false);
    });
  });
});
