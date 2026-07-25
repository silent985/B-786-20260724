// Tests for grid <-> world coordinate conversion.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gridToWorld, worldToGridIndex, mazeHalfExtent } from '../src/coordinates.js';

const SIZE = 15;
const SCALE = 10;

test('mazeHalfExtent is half the total world size', () => {
    assert.equal(mazeHalfExtent(SIZE, SCALE), (SIZE * SCALE) / 2);
});

test('gridToWorld centres the maze on the origin', () => {
    // Cell 0 sits at -half; the opposite edge cell is symmetric.
    assert.equal(gridToWorld(0, SIZE, SCALE), -75);
    assert.equal(gridToWorld(SIZE - 1, SIZE, SCALE), 65);
});

test('gridToWorld matches the original formula', () => {
    for (let i = 0; i < SIZE; i++) {
        const expected = i * SCALE - (SIZE * SCALE) / 2;
        assert.equal(gridToWorld(i, SIZE, SCALE), expected);
    }
});

test('worldToGridIndex inverts gridToWorld at cell centres', () => {
    for (let i = 0; i < SIZE; i++) {
        const world = gridToWorld(i, SIZE, SCALE);
        assert.equal(worldToGridIndex(world, SIZE, SCALE), i);
    }
});

test('worldToGridIndex resolves positions within a cell to that cell', () => {
    const centre = gridToWorld(5, SIZE, SCALE);
    // Anywhere within +/- half a cell maps to the same index.
    assert.equal(worldToGridIndex(centre + 4, SIZE, SCALE), 5);
    assert.equal(worldToGridIndex(centre - 4, SIZE, SCALE), 5);
});
