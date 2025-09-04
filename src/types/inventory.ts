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
  type: 'weapon' | 'armor' | 'item' | 'spell' | 'condition';
  description?: string;
  damage?: string;
  armor?: number;
  usageDots?: number;
  maxUsageDots?: number;
  cost?: number;
  weight?: number;
  clearInstructions?: string; // For condition cards
  imageUrl?: string; // Optional image for regular items
  weaponCategory?: 'light' | 'medium' | 'heavy'; // For weapons
  defense?: number; // For armor (replaces armor field)
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

