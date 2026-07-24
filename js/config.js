export const CONFIG = Object.freeze({
  MAZE_SIZE: 15,
  MAZE_SCALE: 10,
  WALL_HEIGHT: 12,
  MOVEMENT_SPEED: 50.0,
  PLAYER_HEIGHT: 4.0,
  PLAYER_RADIUS: 2.0,
});

export const HALF_WORLD_SIZE = (CONFIG.MAZE_SIZE * CONFIG.MAZE_SCALE) / 2;
export const HALF_SCALE = CONFIG.MAZE_SCALE / 2;

export const START_CELL = Object.freeze({ x: 1, y: 1 });
export const END_CELL = Object.freeze({ x: CONFIG.MAZE_SIZE - 2, y: CONFIG.MAZE_SIZE - 2 });
