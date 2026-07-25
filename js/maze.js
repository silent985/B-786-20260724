const DIRECTIONS = [
  { x: 0, y: -2 },
  { x: 2, y: 0 },
  { x: 0, y: 2 },
  { x: -2, y: 0 },
];

export function shuffle(array, rng = Math.random) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function generateMaze(size, { rng = Math.random, start = { x: 1, y: 1 }, end } = {}) {
  const grid = Array.from({ length: size }, () => new Array(size).fill(1));

  const dirs = DIRECTIONS.map((d) => ({ ...d }));
  const stack = [{ x: start.x, y: start.y }];
  grid[start.y][start.x] = 0;

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const validNeighbors = [];
    shuffle(dirs, rng);

    for (const dir of dirs) {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;
      if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && grid[ny][nx] === 1) {
        validNeighbors.push({ x: nx, y: ny, dx: dir.x / 2, dy: dir.y / 2 });
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

  const endCell = end ?? { x: size - 2, y: size - 2 };
  grid[start.y][start.x] = 0;
  grid[endCell.y][endCell.x] = 0;

  return { grid, start: { x: start.x, y: start.y }, end: { x: endCell.x, y: endCell.y } };
}

export function countOpenCells(grid) {
  let n = 0;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === 0) n++;
    }
  }
  return n;
}

export function getReachableCells(grid, startX, startY) {
  const size = grid.length;
  const visited = Array.from({ length: size }, () => new Array(size).fill(false));
  const queue = [[startX, startY]];
  visited[startY][startX] = true;
  const reached = [];

  while (queue.length > 0) {
    const [x, y] = queue.shift();
    reached.push({ x, y });
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (
        nx >= 0 && nx < size &&
        ny >= 0 && ny < size &&
        !visited[ny][nx] &&
        grid[ny][nx] === 0
      ) {
        visited[ny][nx] = true;
        queue.push([nx, ny]);
      }
    }
  }
  return reached;
}

export function isFullyConnected(grid, startX = 1, startY = 1) {
  return getReachableCells(grid, startX, startY).length === countOpenCells(grid);
}
