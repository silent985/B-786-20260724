// Tests for AABB collision detection on the XZ plane.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkCollision, boxesIntersect } from '../src/collision.js';

// A small explicit maze so expected positions are easy to reason about.
// SIZE = 5, SCALE = 10 -> half extent 25, cells centred from -15 (index 1)
// to +15 (index 3). The single interior wall sits at cell (2,2) -> world (-5,-5).
const GRID = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
];
const OPTS = { size: 5, scale: 10 };

test('boxesIntersect detects overlap and edge contact', () => {
    const a = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
    assert.equal(boxesIntersect(a, { minX: 5, maxX: 15, minZ: 5, maxZ: 15 }), true, 'overlap');
    assert.equal(boxesIntersect(a, { minX: 10, maxX: 20, minZ: 0, maxZ: 10 }), true, 'edge touch');
    assert.equal(boxesIntersect(a, { minX: 11, maxX: 20, minZ: 0, maxZ: 10 }), false, 'separated');
});

test('open cell away from walls is free', () => {
    assert.equal(checkCollision(GRID, -15, -15, OPTS), false);
});

test('standing on the interior wall collides', () => {
    assert.equal(checkCollision(GRID, -5, -5, OPTS), true);
});

test('touching a wall edge within the player radius collides', () => {
    // Player at open cell (2,1) world (-5,-15) sliding toward the wall at (-5,-5).
    // Wall spans z in [-10, 0]; with radius 2 the player box touches it at z = -12.
    assert.equal(checkCollision(GRID, -5, -12, OPTS), true);
    // Just short of that it is still free.
    assert.equal(checkCollision(GRID, -5, -13, OPTS), false);
});

test('leaving the maze boundary collides', () => {
    assert.equal(checkCollision(GRID, 100, -15, OPTS), true, 'far outside +X');
    assert.equal(checkCollision(GRID, -15, -100, OPTS), true, 'far outside -Z');
});

test('the outer border wall blocks the player', () => {
    // Cell (1,1) world (-15,-15); the border wall at column 0 is world x -25,
    // spanning x in [-30, -20]. The player box touches it at x = -18.
    assert.equal(checkCollision(GRID, -18, -15, OPTS), true);
});
