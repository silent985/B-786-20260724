// --- Maze Generation ---
// Randomised depth-first search ("recursive backtracker") maze generator. The
// grid stores 1 for walls and 0 for open cells. Cells on even indices are the
// solid lattice; the algorithm carves passages by knocking out the wall between
// two cells that are two steps apart.

import { MAZE_SIZE, START_CELL } from './config.js';

// The four carving directions, each two cells away from the current cell.
const DIRECTIONS = [
    { x: 0, y: -2 },
    { x: 2, y: 0 },
    { x: 0, y: 2 },
    { x: -2, y: 0 },
];

/**
 * Fisher-Yates shuffle in place, using the supplied random function.
 */
function shuffle(array, random) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Create a fully-walled grid of the given size.
 */
function createFilledGrid(size) {
    const grid = [];
    for (let y = 0; y < size; y++) {
        const row = [];
        for (let x = 0; x < size; x++) row.push(1);
        grid.push(row);
    }
    return grid;
}

/**
 * Generate a maze grid using randomised DFS.
 *
 * @param {object} [options]
 * @param {number} [options.size]   Grid dimension (defaults to MAZE_SIZE).
 * @param {() => number} [options.random] RNG returning [0, 1); defaults to
 *        Math.random. Injecting a seeded RNG makes generation deterministic for
 *        tests.
 * @returns {{ grid: number[][], start: {x:number,y:number}, end: {x:number,y:number} }}
 */
export function generateMaze({ size = MAZE_SIZE, random = Math.random } = {}) {
    const grid = createFilledGrid(size);

    const start = { x: START_CELL.x, y: START_CELL.y };
    const stack = [{ x: start.x, y: start.y }];
    grid[start.y][start.x] = 0;

    // Work on a local copy so the shared DIRECTIONS array is never mutated;
    // otherwise leftover order would leak between calls and break determinism.
    const directions = DIRECTIONS.map(dir => ({ ...dir }));

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const validNeighbors = [];
        shuffle(directions, random);

        for (const dir of directions) {
            const nx = current.x + dir.x;
            const ny = current.y + dir.y;
            if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1) {
                if (grid[ny][nx] === 1) {
                    validNeighbors.push({ x: nx, y: ny, dx: dir.x / 2, dy: dir.y / 2 });
                }
            }
        }

        if (validNeighbors.length > 0) {
            const next = validNeighbors[0];
            grid[current.y + next.dy][current.x + next.dx] = 0;
            grid[next.y][next.x] = 0;
            stack.push({ x: next.x, y: next.y });
        } else {
            stack.pop();
        }
    }

    // Guarantee the start and end cells are open and reachable.
    const end = { x: size - 2, y: size - 2 };
    grid[start.y][start.x] = 0;
    grid[end.y][end.x] = 0;

    return { grid, start, end };
}
