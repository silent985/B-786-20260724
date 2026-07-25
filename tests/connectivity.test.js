// Tests for maze connectivity (every generated maze must be solvable).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateMaze } from '../src/maze.js';
import { floodFill, isConnected } from '../src/connectivity.js';
import { seededRandom } from './maze.test.js';

test('start can always reach end across many seeds', () => {
    for (let seed = 0; seed < 50; seed++) {
        const { grid, start, end } = generateMaze({ size: 15, random: seededRandom(seed) });
        assert.ok(isConnected(grid, start, end),
            `maze from seed ${seed} should be solvable`);
    }
});

test('floodFill marks the start cell visited', () => {
    const { grid, start } = generateMaze({ size: 15, random: seededRandom(7) });
    const visited = floodFill(grid, start);
    assert.equal(visited[start.y][start.x], true);
});

test('floodFill never marks a wall as visited', () => {
    const { grid, start } = generateMaze({ size: 15, random: seededRandom(8) });
    const visited = floodFill(grid, start);
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x] === 1) assert.equal(visited[y][x], false);
        }
    }
});

test('reports no connection when the end is walled off', () => {
    // A hand-built grid where the end cell is isolated by walls.
    const grid = [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 1, 1, 1],
        [1, 0, 1, 0, 1],
        [1, 1, 1, 1, 1],
    ];
    const start = { x: 1, y: 1 };
    const end = { x: 3, y: 3 };
    assert.equal(isConnected(grid, start, end), false);
});

test('reports a connection through an open corridor', () => {
    const grid = [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1],
    ];
    const start = { x: 1, y: 1 };
    const end = { x: 1, y: 3 };
    assert.equal(isConnected(grid, start, end), true);
});
