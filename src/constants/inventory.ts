// Centralized inventory sizing constants
// Change CELL_SIZE to adjust all inventory sizing throughout the app

export const CELL_SIZE = 128; // Base cell size in pixels for desktop
export const MOBILE_CELL_SIZE = 64; // Smaller cell size for mobile devices

export const GRID_CONFIG = {
  width: 5,
  height: 2,
  cellSize: CELL_SIZE
} as const;

export const ITEM_SIZES = {
  small: { width: 1, height: 1 },     // 1x1
  wide: { width: 2, height: 1 },      // 2x1
  tall: { width: 1, height: 2 },      // 1x2
  large: { width: 2, height: 2 }      // 2x2
} as const;

// Calculated positioning constants based on cell size
export const GRID_GAP = 2; // Gap between grid cells in pixels
export const GRID_PADDING = 16; // Grid container padding (p-4 in Tailwind)

// Dynamic positioning offsets (scale with cell size)
export const GRID_OFFSET = {
  // These offsets position items correctly within the grid container
  top: Math.round(CELL_SIZE * 0.52), // Roughly 70% of cell size
  left: Math.round(CELL_SIZE * 0.14), // Roughly 14% of cell size
};

// Scratch area padding (scale with cell size for better proportions)
export const SCRATCH_PADDING = {
  top: Math.round(CELL_SIZE * -0.23),
  left: Math.round(CELL_SIZE * -0.09),
  bottom: Math.round(CELL_SIZE * 0.5),
  right: Math.round(CELL_SIZE * 0.25),
};