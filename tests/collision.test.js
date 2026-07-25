import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { checkCollision, checkWin } from '../src/collision.js';
import { generateMaze } from '../src/maze.js';
import { gridToWorld } from '../src/coordinates.js';

const MAZE_SIZE = 15;
const MAZE_SCALE = 10;
const PLAYER_RADIUS = 2;
const WIN_DISTANCE = 6;

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe('collision', () => {
  describe('checkCollision', () => {
    it('returns false at the start cell (open path)', () => {
      const { grid, start } = generateMaze(MAZE_SIZE, seededRandom(1));
      const { x, z } = gridToWorld(start.x, start.y, MAZE_SIZE, MAZE_SCALE);
      assert.equal(checkCollision(grid, x, z, MAZE_SIZE, MAZE_SCALE, PLAYER_RADIUS), false);
    });

    it('returns true when inside a wall cell', () => {
      const { grid } = generateMaze(MAZE_SIZE, seededRandom(1));
      const wallPositions = [];
      for (let y = 0; y < MAZE_SIZE; y++) {
        for (let x = 0; x < MAZE_SIZE; x++) {
          if (grid[y][x] === 1) wallPositions.push({ x, y });
        }
      }
      assert.ok(wallPositions.length > 0, 'expected walls in maze');
      for (const w of wallPositions.slice(0, 10)) {
        const { x, z } = gridToWorld(w.x, w.y, MAZE_SIZE, MAZE_SCALE);
        assert.equal(checkCollision(grid, x, z, MAZE_SIZE, MAZE_SCALE, PLAYER_RADIUS), true);
      }
    });

    it('returns true outside world bounds', () => {
      const { grid } = generateMaze(MAZE_SIZE, seededRandom(1));
      const half = (MAZE_SIZE * MAZE_SCALE) / 2;
      assert.equal(checkCollision(grid, half + 100, 0, MAZE_SIZE, MAZE_SCALE, PLAYER_RADIUS), true);
      assert.equal(checkCollision(grid, -(half + 100), 0, MAZE_SIZE, MAZE_SCALE, PLAYER_RADIUS), true);
      assert.equal(checkCollision(grid, 0, half + 100, MAZE_SIZE, MAZE_SCALE, PLAYER_RADIUS), true);
      assert.equal(checkCollision(grid, 0, -(half + 100), MAZE_SIZE, MAZE_SCALE, PLAYER_RADIUS), true);
    });

    it('allows movement through all reachable path cells', () => {
      const { grid, start, end } = generateMaze(MAZE_SIZE, seededRandom(42));
      const visited = Array.from({ length: MAZE_SIZE }, () => Array(MAZE_SIZE).fill(false));
      const queue = [start];
      visited[start.y][start.x] = true;
      const dirs = [
        { x: 0, y: -1 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
      ];
      while (queue.length > 0) {
        const cur = queue.shift();
        const { x, z } = gridToWorld(cur.x, cur.y, MAZE_SIZE, MAZE_SCALE);
        assert.equal(
          checkCollision(grid, x, z, MAZE_SIZE, MAZE_SCALE, PLAYER_RADIUS),
          false,
          `Path cell (${cur.x},${cur.y}) should be walkable`
        );
        for (const d of dirs) {
          const nx = cur.x + d.x;
          const ny = cur.y + d.y;
          if (
            nx >= 0 &&
            nx < MAZE_SIZE &&
            ny >= 0 &&
            ny < MAZE_SIZE &&
            !visited[ny][nx] &&
            grid[ny][nx] === 0
          ) {
            visited[ny][nx] = true;
            queue.push({ x: nx, y: ny });
          }
        }
      }
      assert.ok(visited[end.y][end.x]);
    });

    it('detects collision when player radius overlaps a wall edge', () => {
      const grid = Array.from({ length: 5 }, () => Array(5).fill(0));
      for (let i = 0; i < 5; i++) {
        grid[0][i] = 1;
        grid[4][i] = 1;
        grid[i][0] = 1;
        grid[i][4] = 1;
      }
      grid[2][3] = 1;
      const { x, z } = gridToWorld(2, 2, 5, 10);
      assert.equal(checkCollision(grid, x + 4, z, 5, 10, 2), true);
    });
  });

  describe('checkWin', () => {
    it('returns true when within win distance', () => {
      assert.ok(checkWin(0, 0, 3, 4, 6));
    });

    it('returns false when outside win distance', () => {
      assert.equal(checkWin(0, 0, 10, 0, 6), false);
    });

    it('returns true exactly at the goal', () => {
      assert.ok(checkWin(5, 5, 5, 5, 6));
    });

    it('boundary case: exactly at win distance threshold (not strictly less)', () => {
      assert.equal(checkWin(0, 0, 6, 0, 6), false);
    });
  });
});
