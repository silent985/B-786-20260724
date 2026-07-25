// Tests for the maze generation algorithm.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateMaze } from '../src/maze.js';

/** Deterministic pseudo-random generator (mulberry32) for reproducible mazes. */
function seededRandom(seed) {
    let a = seed >>> 0;
    return function () {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

test('produces a grid of the requested size', () => {
    const { grid } = generateMaze({ size: 15, random: seededRandom(1) });
    assert.equal(grid.length, 15);
    for (const row of grid) assert.equal(row.length, 15);
});

test('every cell is either a wall (1) or open (0)', () => {
    const { grid } = generateMaze({ size: 15, random: seededRandom(2) });
    for (const row of grid) {
        for (const cell of row) {
            assert.ok(cell === 0 || cell === 1, `unexpected cell value ${cell}`);
        }
    }
});

test('the outer border stays solid', () => {
    const size = 15;
    const { grid } = generateMaze({ size, random: seededRandom(3) });
    for (let i = 0; i < size; i++) {
        assert.equal(grid[0][i], 1, 'top row must be wall');
        assert.equal(grid[size - 1][i], 1, 'bottom row must be wall');
        assert.equal(grid[i][0], 1, 'left column must be wall');
        assert.equal(grid[i][size - 1], 1, 'right column must be wall');
    }
});

test('start and end cells are open', () => {
    const { grid, start, end } = generateMaze({ size: 15, random: seededRandom(4) });
    assert.equal(grid[start.y][start.x], 0);
    assert.equal(grid[end.y][end.x], 0);
    assert.deepEqual(start, { x: 1, y: 1 });
    assert.deepEqual(end, { x: 13, y: 13 });
});

test('is deterministic for a fixed seed', () => {
    const a = generateMaze({ size: 15, random: seededRandom(42) });
    const b = generateMaze({ size: 15, random: seededRandom(42) });
    assert.deepEqual(a.grid, b.grid);
});

test('different seeds usually give different mazes', () => {
    const a = generateMaze({ size: 15, random: seededRandom(1) });
    const b = generateMaze({ size: 15, random: seededRandom(999) });
    assert.notDeepEqual(a.grid, b.grid);
});

export { seededRandom };
