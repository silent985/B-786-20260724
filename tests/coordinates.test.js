import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  gridToWorld,
  worldToGrid,
  gridCellToWallBox,
  playerBounds,
  boxesIntersect,
  getHalfWorldSize,
} from '../src/coordinates.js';

const MAZE_SIZE = 15;
const MAZE_SCALE = 10;

describe('coordinates', () => {
  describe('gridToWorld / worldToGrid', () => {
    it('origin (0,0) grid maps to top-left world corner offset', () => {
      const { x, z } = gridToWorld(0, 0, MAZE_SIZE, MAZE_SCALE);
      assert.equal(x, -(MAZE_SIZE * MAZE_SCALE) / 2);
      assert.equal(z, -(MAZE_SIZE * MAZE_SCALE) / 2);
    });

    it('world origin (0,0) lies at the boundary between the four center cells', () => {
      const half = (MAZE_SIZE * MAZE_SCALE) / 2;
      const c1 = gridToWorld(7, 7, MAZE_SIZE, MAZE_SCALE);
      const c2 = gridToWorld(8, 8, MAZE_SIZE, MAZE_SCALE);
      assert.equal(c1.x, 7 * MAZE_SCALE - half);
      assert.equal(c2.x, 8 * MAZE_SCALE - half);
      assert.ok(c1.x < 0 && c2.x > 0);
      assert.ok(c1.z < 0 && c2.z > 0);
    });

    it('round-trips grid -> world -> grid for integer cells', () => {
      for (let gx = 0; gx < MAZE_SIZE; gx++) {
        for (let gy = 0; gy < MAZE_SIZE; gy++) {
          const { x, z } = gridToWorld(gx, gy, MAZE_SIZE, MAZE_SCALE);
          const back = worldToGrid(x, z, MAZE_SIZE, MAZE_SCALE);
          assert.equal(back.x, gx, `gx=${gx} gy=${gy}`);
          assert.equal(back.y, gy, `gx=${gx} gy=${gy}`);
        }
      }
    });

    it('start cell (1,1) maps to expected world position', () => {
      const { x, z } = gridToWorld(1, 1, MAZE_SIZE, MAZE_SCALE);
      assert.equal(x, 1 * MAZE_SCALE - (MAZE_SIZE * MAZE_SCALE) / 2);
      assert.equal(z, 1 * MAZE_SCALE - (MAZE_SIZE * MAZE_SCALE) / 2);
    });
  });

  describe('gridCellToWallBox', () => {
    it('produces an axis-aligned box of size MAZE_SCALE centered on the cell world position', () => {
      const box = gridCellToWallBox(1, 1, MAZE_SIZE, MAZE_SCALE);
      const { x, z } = gridToWorld(1, 1, MAZE_SIZE, MAZE_SCALE);
      const half = MAZE_SCALE / 2;
      assert.equal(box.minX, x - half);
      assert.equal(box.maxX, x + half);
      assert.equal(box.minZ, z - half);
      assert.equal(box.maxZ, z + half);
    });
  });

  describe('playerBounds', () => {
    it('expands by player radius in x and z', () => {
      const b = playerBounds(10, 20, 2);
      assert.equal(b.minX, 8);
      assert.equal(b.maxX, 12);
      assert.equal(b.minZ, 18);
      assert.equal(b.maxZ, 22);
    });
  });

  describe('boxesIntersect', () => {
    it('detects overlapping boxes', () => {
      const a = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
      const b = { minX: 5, maxX: 15, minZ: 5, maxZ: 15 };
      assert.ok(boxesIntersect(a, b));
    });

    it('returns false for separated boxes (x-axis)', () => {
      const a = { minX: 0, maxX: 5, minZ: 0, maxZ: 10 };
      const b = { minX: 6, maxX: 10, minZ: 0, maxZ: 10 };
      assert.equal(boxesIntersect(a, b), false);
    });

    it('returns false for separated boxes (z-axis)', () => {
      const a = { minX: 0, maxX: 10, minZ: 0, maxZ: 5 };
      const b = { minX: 0, maxX: 10, minZ: 6, maxZ: 10 };
      assert.equal(boxesIntersect(a, b), false);
    });

    it('returns false for touching edges (no overlap)', () => {
      const a = { minX: 0, maxX: 5, minZ: 0, maxZ: 5 };
      const b = { minX: 5, maxX: 10, minZ: 0, maxZ: 5 };
      assert.equal(boxesIntersect(a, b), false);
    });
  });

  describe('getHalfWorldSize', () => {
    it('returns half the world extent', () => {
      assert.equal(getHalfWorldSize(MAZE_SIZE, MAZE_SCALE), (MAZE_SIZE * MAZE_SCALE) / 2);
    });
  });
});
