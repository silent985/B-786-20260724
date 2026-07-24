export function gridToWorld(gx, gy, mazeSize, mazeScale) {
  const halfSize = (mazeSize * mazeScale) / 2;
  return {
    x: gx * mazeScale - halfSize,
    z: gy * mazeScale - halfSize,
  };
}

export function worldToGrid(wx, wz, mazeSize, mazeScale) {
  const halfSize = (mazeSize * mazeScale) / 2;
  return {
    x: Math.floor((wx + halfSize + mazeScale / 2) / mazeScale),
    y: Math.floor((wz + halfSize + mazeScale / 2) / mazeScale),
  };
}

export function gridCellToWallBox(gx, gy, mazeSize, mazeScale) {
  const { x, z } = gridToWorld(gx, gy, mazeSize, mazeScale);
  const half = mazeScale / 2;
  return {
    minX: x - half,
    maxX: x + half,
    minZ: z - half,
    maxZ: z + half,
  };
}

export function playerBounds(wx, wz, playerRadius) {
  return {
    minX: wx - playerRadius,
    maxX: wx + playerRadius,
    minZ: wz - playerRadius,
    maxZ: wz + playerRadius,
  };
}

export function boxesIntersect(a, b) {
  return (
    a.minX < b.maxX &&
    a.maxX > b.minX &&
    a.minZ < b.maxZ &&
    a.maxZ > b.minZ
  );
}

export function getHalfWorldSize(mazeSize, mazeScale) {
  return (mazeSize * mazeScale) / 2;
}
