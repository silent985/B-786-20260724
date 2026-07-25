// --- Game Configuration ---
// Central place for every tunable constant so no magic numbers leak into the
// gameplay, rendering or physics modules.

export const MAZE_SIZE = 15;       // Grid dimension (odd number keeps a clean border)
export const MAZE_SCALE = 10;      // World units per maze cell
export const WALL_HEIGHT = 12;     // Wall height (slightly shorter for a cartoon feel)
export const MOVEMENT_SPEED = 50.0; // Player movement speed (units / second)
export const PLAYER_HEIGHT = 4.0;  // Camera height above the floor
export const PLAYER_RADIUS = 2.0;  // Player collision radius (half-width of the AABB)

// Distance to the castle centre that counts as "reached the goal".
export const WIN_DISTANCE = 6;

// Start cell is always the top-left open cell of the maze.
export const START_CELL = { x: 1, y: 1 };
