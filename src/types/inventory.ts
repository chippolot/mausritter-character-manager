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
  type: 'weapon' | 'armor' | 'item' | 'spell' | 'condition' | 'pip-purse';
  description?: string;
  damage?: string;
  armor?: number;
  usageDots?: number;
  maxUsageDots?: number;
  cost?: number;
  weight?: number;
  clearInstructions?: string; // For condition cards
  imageUrl?: string; // Optional image for regular items
  imageKey?: string; // Key to look up predefined images
  weaponCategory?: 'light' | 'medium' | 'heavy'; // For weapons
  defense?: number; // For armor (replaces armor field)
  pipValue?: number; // For pip purses - current pip count
  maxPipValue?: number; // For pip purses - maximum pip count (default 250)
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

