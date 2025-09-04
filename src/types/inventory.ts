export interface GridPosition {
  x: number;
  y: number;
}

export interface ItemSize {
  width: number;
  height: number;
}

export interface PlacedItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'item' | 'spell';
  description?: string;
  damage?: string;
  armor?: number;
  usageDots?: number;
  maxUsageDots?: number;
  cost?: number;
  weight?: number;
  size: ItemSize;
  position: GridPosition;
  rotation: 0 | 90;
  isInGrid: boolean;
  scratchPosition?: { x: number; y: number };
}

export interface InventoryGrid {
  width: number;
  height: number;
  items: PlacedItem[];
}

export const GRID_CONFIG = {
  width: 5,
  height: 2,
  cellSize: 80
} as const;

export const ITEM_SIZES = {
  small: { width: 1, height: 1 },
  large: { width: 2, height: 1 }
} as const;