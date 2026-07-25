// --- Coordinate Conversion ---
// Single source of truth for translating between maze grid indices and Three.js
// world coordinates. The maze is centred on the world origin, so both the X/Z
// world axes map to grid columns/rows through the same formula.

/**
 * Half of the maze's total world extent. The maze is centred on the origin, so
 * this is the offset applied when converting grid indices to world positions.
 */
export function mazeHalfExtent(size, scale) {
    return (size * scale) / 2;
}

/**
 * Convert a grid index (column or row) to its centre position in world units.
 */
export function gridToWorld(index, size, scale) {
    return index * scale - mazeHalfExtent(size, scale);
}

/**
 * Convert a world coordinate (X or Z) back to the grid index of the cell that
 * contains it. Uses the same rounding the original collision code relied on so
 * behaviour is identical.
 */
export function worldToGridIndex(world, size, scale) {
    const half = mazeHalfExtent(size, scale);
    return Math.floor((world + half + scale / 2) / scale);
}
