/**
 * Centralized factory module for all model creation
 * Eliminates duplication of initialization logic across components
 */
import { Character, Hireling } from '../types/character';
import { InventoryItem } from '../types/inventory';

const ITEM_SIZES = {
  small: { width: 1, height: 1 },     // 1x1
  wide: { width: 2, height: 1 },      // 2x1
  tall: { width: 1, height: 2 },      // 1x2
  large: { width: 2, height: 2 }      // 2x2
} as const;

// Utility functions
const generateId = () => crypto.randomUUID();

const rollDice = (count: number, sides: number): number => {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
};

// Character Factory
export class CharacterFactory {
  static createBlank(): Character {
    return {
      id: generateId(),
      name: '',
      level: 1,
      experience: 0,
      strength: 8,
      maxStrength: 8,
      dexterity: 8,
      maxDexterity: 8,
      will: 8,
      maxWill: 8,
      hitPoints: 4,
      maxHitPoints: 4,
      background: '',
      birthsign: '',
      coat: '',
      look: '',
      grit: 0,
      pips: 0,
      alive: true,
      ignoredConditions: '',
      bankedItemsAndPips: '',
      inventory: [],
      hirelings: [],
    };
  }

  static createFromGeneration(options: {
    name: string;
    strength: number;
    dexterity: number;
    will: number;
    hitPoints: number;
    background: string;
    birthsign: string;
    coat: string;
    look: string;
    pips: number;
    inventory: InventoryItem[];
    hirelings: Hireling[];
  }): Character {
    const base = this.createBlank();
    return {
      ...base,
      name: options.name,
      strength: options.strength,
      maxStrength: options.strength,
      dexterity: options.dexterity,
      maxDexterity: options.dexterity,
      will: options.will,
      maxWill: options.will,
      hitPoints: options.hitPoints,
      maxHitPoints: options.hitPoints,
      background: options.background,
      birthsign: options.birthsign,
      coat: options.coat,
      look: options.look,
      pips: options.pips,
      inventory: options.inventory,
      hirelings: options.hirelings,
    };
  }

  static createFromImport(imported: Partial<Character>): Character {
    const base = this.createBlank();
    return {
      ...base,
      ...imported,
      id: generateId(), // Always generate new ID for imports
    };
  }
}

// Hireling Factory
export class HirelingFactory {
  static create(name?: string): Hireling {
    const hitPoints = rollDice(1, 6); // d6 HP
    return {
      id: generateId(),
      name: name || '',
      strength: rollDice(2, 6),   // 2d6 STR
      dexterity: rollDice(2, 6),  // 2d6 DEX  
      will: rollDice(2, 6),       // 2d6 WIL
      hitPoints: hitPoints,
      maxHitPoints: hitPoints,
      cost: 0,
    };
  }
}

// InventoryItem Factory
export class InventoryItemFactory {
  static create(options: {
    name: string;
    type: InventoryItem['type'];
    scratchPosition?: { x: number; y: number };
    damage?: string;
    defense?: number;
    usageDots?: number;
    maxUsageDots?: number;
    imageKey?: string;
    weaponCategory?: string;
    size?: { width: number; height: number };
    pipValue?: number;
    maxPipValue?: number;
  }): InventoryItem {
    return {
      id: generateId(),
      name: options.name,
      type: options.type,
      damage: options.damage,
      defense: options.defense,
      usageDots: options.usageDots || 0,
      maxUsageDots: options.maxUsageDots || 0,
      imageKey: options.imageKey,
      weaponCategory: options.weaponCategory,
      pipValue: options.pipValue,
      maxPipValue: options.maxPipValue,
      size: options.size || ITEM_SIZES.small,
      position: { x: 0, y: 0 },
      rotation: 0,
      isInGrid: false,
      scratchPosition: options.scratchPosition || { x: 50, y: 50 },
    };
  }

  static createCustom(name: string, scratchPosition?: { x: number; y: number }): InventoryItem {
    return this.create({
      name,
      type: 'item',
      maxUsageDots: 3,
      size: ITEM_SIZES.small,
      scratchPosition,
    });
  }

  static createFromMausritterData(
    itemData: Record<string, any>,
    type: InventoryItem['type'],
    scratchPosition?: { x: number; y: number }
  ): InventoryItem {
    const sizeKey = itemData.size as keyof typeof ITEM_SIZES;
    const itemSize = ITEM_SIZES[sizeKey] || ITEM_SIZES.small;

    return this.create({
      name: itemData.name,
      type,
      damage: itemData.damage,
      defense: itemData.defense,
      maxUsageDots: itemData.maxUsageDots || 0,
      imageKey: itemData.imageKey,
      weaponCategory: itemData.weaponCategory,
      size: itemSize,
      scratchPosition,
    });
  }
}

