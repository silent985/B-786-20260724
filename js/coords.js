import { CONFIG, HALF_WORLD_SIZE, HALF_SCALE } from './config.js';

export function gridToWorld(col, row) {
  return {
    x: col * CONFIG.MAZE_SCALE - HALF_WORLD_SIZE,
    z: row * CONFIG.MAZE_SCALE - HALF_WORLD_SIZE,
  };
}

export function worldToGrid(x, z) {
  return {
    col: Math.floor((x + HALF_WORLD_SIZE + HALF_SCALE) / CONFIG.MAZE_SCALE),
    row: Math.floor((z + HALF_WORLD_SIZE + HALF_SCALE) / CONFIG.MAZE_SCALE),
  };
}

export function wallAABB(col, row) {
  const { x, z } = gridToWorld(col, row);
  return {
    minX: x - HALF_SCALE,
    maxX: x + HALF_SCALE,
    minZ: z - HALF_SCALE,
    maxZ: z + HALF_SCALE,
  };
}
