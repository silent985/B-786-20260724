// --- Collision Detection ---
// Pure 2D axis-aligned bounding box (AABB) collision logic on the XZ plane.
// Kept free of Three.js so it can be unit tested directly; the runtime player
// module feeds it plain numbers taken from the camera position.

import { MAZE_SIZE, MAZE_SCALE, PLAYER_RADIUS } from './config.js';
import { gridToWorld, mazeHalfExtent, worldToGridIndex } from './coordinates.js';

/**
 * Two AABBs (each {minX, minZ, maxX, maxZ}) overlap. Edge contact counts as an
 * intersection, matching THREE.Box2.intersectsBox semantics used originally.
 */
export function boxesIntersect(a, b) {
    return a.maxX >= b.minX && a.minX <= b.maxX &&
        a.maxZ >= b.minZ && a.minZ <= b.maxZ;
}

/**
 * Determine whether the player standing at (x, z) would collide with a wall or
 * leave the maze bounds.
 *
 * @param {number[][]} grid  Maze grid (1 = wall, 0 = open).
 * @param {number} x  Player world X.
 * @param {number} z  Player world Z.
 * @param {object} [options]
 * @param {number} [options.size]    Grid dimension.
 * @param {number} [options.scale]   World units per cell.
 * @param {number} [options.radius]  Player collision radius.
 * @returns {boolean} True when the position is blocked.
 */
export function checkCollision(grid, x, z, {
    size = MAZE_SIZE,
    scale = MAZE_SCALE,
    radius = PLAYER_RADIUS,
} = {}) {
    const half = mazeHalfExtent(size, scale);

    const playerBox = {
        minX: x - radius, maxX: x + radius,
        minZ: z - radius, maxZ: z + radius,
    };

    const gridX = worldToGridIndex(x, size, scale);
    const gridZ = worldToGridIndex(z, size, scale);

    // Only the 3x3 block of cells around the player can possibly overlap.
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const cx = gridX + dx;
            const cy = gridZ + dy;

            if (cx >= 0 && cx < size && cy >= 0 && cy < size && grid[cy][cx] === 1) {
                const wx = gridToWorld(cx, size, scale);
                const wz = gridToWorld(cy, size, scale);
                const wallBox = {
                    minX: wx - scale / 2, maxX: wx + scale / 2,
                    minZ: wz - scale / 2, maxZ: wz + scale / 2,
                };
                if (boxesIntersect(playerBox, wallBox)) return true;
            }
        }
    }

    // Outer boundary (slight buffer so the player cannot clip the edge).
    const limit = half - 1;
    if (x < -limit || x > limit || z < -limit || z > limit) return true;

    return false;
}
