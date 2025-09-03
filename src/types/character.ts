export interface Character {
  id: string;
  name: string;
  level: number;
  experience: number;
  
  // Core attributes
  strength: number;
  dexterity: number;
  will: number;
  hitPoints: number;
  maxHitPoints: number;
  
  // Character details
  background: string;
  birthsign: string;
  coatOfArms: string;
  look: string;
  grit: number;
  pips: number;
  
  // Equipment
  mainHandWeapon?: InventoryItem;
  offHandWeapon?: InventoryItem;
  armor?: InventoryItem;
  
  // Inventory slots (6 slots total)
  inventory: (InventoryItem | null)[];
  
  // Hirelings
  hirelings: Hireling[];
}

export interface InventoryItem {
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
}

export interface Hireling {
  id: string;
  name: string;
  strength: number;
  dexterity: number;
  will: number;
  hitPoints: number;
  maxHitPoints: number;
  equipment?: string;
  cost: number;
}

export interface CharacterState {
  characters: Character[];
  currentCharacter: Character | null;
  addCharacter: (character: Character) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  setCurrentCharacter: (character: Character | null) => void;
  loadCharacters: () => void;
  saveCharacters: () => void;
}