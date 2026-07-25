const NEIGHBOR_RING = [-1, 0, 1];

function aabbOverlap(ax, ay, bx, by, halfR, halfW) {
  return (
    ax + halfR > bx - halfW &&
    ax - halfR < bx + halfW &&
    ay + halfR > by - halfW &&
    ay - halfR < by + halfW
  );
}

export function collidesAt(grid, config, x, z) {
  const size = config.MAZE_SIZE;
  const scale = config.MAZE_SCALE;
  const radius = config.PLAYER_RADIUS;
  const halfSize = (size * scale) / 2;
  const halfScale = scale / 2;

  const col = Math.floor((x + halfSize + halfScale) / scale);
  const row = Math.floor((z + halfSize + halfScale) / scale);

  for (const dy of NEIGHBOR_RING) {
    for (const dx of NEIGHBOR_RING) {
      const cx = col + dx;
      const cy = row + dy;
      if (cx < 0 || cx >= size || cy < 0 || cy >= size) continue;
      if (grid[cy][cx] !== 1) continue;

      const wx = cx * scale - halfSize;
      const wz = cy * scale - halfSize;
      if (aabbOverlap(x, z, wx, wz, radius, halfScale)) return true;
    }
  }

  const limit = halfSize - 1;
  if (x < -limit || x > limit || z < -limit || z > limit) return true;
  return false;
}
