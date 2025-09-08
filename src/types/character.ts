import { InventoryItem } from './inventory';

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

export interface Character {
  id: string;
  name: string;
  level: number;
  experience: number;
  strength: number;
  maxStrength: number;
  dexterity: number;
  maxDexterity: number;
  will: number;
  maxWill: number;
  hitPoints: number;
  maxHitPoints: number;
  background: string;
  birthsign: string;
  coat: string;
  look: string;
  grit: number;
  pips: number;
  alive: boolean;
  ignoredConditions: string;
  bankedItemsAndPips: string;
  inventory: (InventoryItem | null)[];
  tactileInventory: InventoryItem[];
  hirelings: Hireling[];
}