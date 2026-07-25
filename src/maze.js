export function createEmptyGrid(size) {
  const grid = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) row.push(1);
    grid.push(row);
  }
  return grid;
}

function shuffle(array, rng = Math.random) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export function generateMaze(size, rng = Math.random) {
  if (size < 3) throw new Error('Maze size must be at least 3');
  if (size % 2 === 0) throw new Error('Maze size must be odd');

  const grid = createEmptyGrid(size);
  const directions = [
    { x: 0, y: -2 },
    { x: 2, y: 0 },
    { x: 0, y: 2 },
    { x: -2, y: 0 },
  ];

  const stack = [{ x: 1, y: 1 }];
  grid[1][1] = 0;

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const validNeighbors = [];

    const dirs = directions.slice();
    shuffle(dirs, rng);

    for (const dir of dirs) {
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

  const endX = size - 2;
  const endY = size - 2;
  grid[1][1] = 0;
  grid[endY][endX] = 0;

  return {
    grid,
    start: { x: 1, y: 1 },
    end: { x: endX, y: endY },
  };
}

export function isConnected(grid, start, end) {
  const size = grid.length;
  const visited = Array.from({ length: size }, () => Array(size).fill(false));
  const queue = [start];
  visited[start.y][start.x] = true;

  const dirs = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];

  while (queue.length > 0) {
    const cur = queue.shift();
    if (cur.x === end.x && cur.y === end.y) return true;

    for (const d of dirs) {
      const nx = cur.x + d.x;
      const ny = cur.y + d.y;
      if (
        nx >= 0 &&
        nx < size &&
        ny >= 0 &&
        ny < size &&
        !visited[ny][nx] &&
        grid[ny][nx] === 0
      ) {
        visited[ny][nx] = true;
        queue.push({ x: nx, y: ny });
      }
    }
  }
  return false;
}

export function countCells(grid, value) {
  let count = 0;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === value) count++;
    }
  }
  return count;
}
