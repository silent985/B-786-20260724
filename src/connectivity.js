// --- Maze Connectivity ---
// Breadth-first search utilities used to verify that the generated maze is
// solvable (the start cell can reach the end cell through open cells).

/**
 * Breadth-first flood fill from a starting cell over open (0) cells.
 *
 * @param {number[][]} grid  Maze grid (1 = wall, 0 = open).
 * @param {{x:number,y:number}} start  Starting cell.
 * @returns {boolean[][]} A visited matrix matching the grid dimensions.
 */
export function floodFill(grid, start) {
    const height = grid.length;
    const width = grid[0].length;
    const visited = grid.map(row => row.map(() => false));

    if (grid[start.y][start.x] === 1) return visited;

    const queue = [{ x: start.x, y: start.y }];
    visited[start.y][start.x] = true;

    const neighbors = [
        { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 },
    ];

    while (queue.length > 0) {
        const { x, y } = queue.shift();
        for (const dir of neighbors) {
            const nx = x + dir.x;
            const ny = y + dir.y;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height &&
                !visited[ny][nx] && grid[ny][nx] === 0) {
                visited[ny][nx] = true;
                queue.push({ x: nx, y: ny });
            }
        }
    }

    return visited;
}

/**
 * Check whether the end cell is reachable from the start cell.
 */
export function isConnected(grid, start, end) {
    const visited = floodFill(grid, start);
    return visited[end.y][end.x] === true;
}
