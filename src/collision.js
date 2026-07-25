import { gridCellToWallBox, playerBounds, boxesIntersect } from './coordinates.js';

export function checkCollision(grid, wx, wz, mazeSize, mazeScale, playerRadius) {
  const halfSize = (mazeSize * mazeScale) / 2;
  const limit = halfSize - 1;
  if (wx < -limit || wx > limit || wz < -limit || wz > limit) {
    return true;
  }

  const pBox = playerBounds(wx, wz, playerRadius);
  const half = mazeScale / 2;
  const gridX = Math.floor((wx + halfSize + half) / mazeScale);
  const gridZ = Math.floor((wz + halfSize + half) / mazeScale);

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const cx = gridX + dx;
      const cy = gridZ + dy;
      if (cx >= 0 && cx < mazeSize && cy >= 0 && cy < mazeSize) {
        if (grid[cy][cx] === 1) {
          const wallBox = gridCellToWallBox(cx, cy, mazeSize, mazeScale);
          if (boxesIntersect(pBox, wallBox)) return true;
        }
      }
    }
  }
  return false;
}

export function checkWin(playerX, playerZ, endWorldX, endWorldZ, winDistance) {
  const dx = playerX - endWorldX;
  const dz = playerZ - endWorldZ;
  return Math.sqrt(dx * dx + dz * dz) < winDistance;
}
