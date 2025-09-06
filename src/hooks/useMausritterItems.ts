import { useMemo } from 'react';
import { PlacedItem } from '../types/inventory';
import itemsData from '../data/mausritterItems.json';

export interface MausritterItemData {
  name: string;
  damage?: string;
  weaponCategory?: 'light' | 'medium' | 'heavy';
  defense?: number;
  size: 'small' | 'wide' | 'tall' | 'large';
  maxUsageDots?: number;
  usageDots?: number;
  description?: string;
  clearInstructions?: string;
  pipValue?: number;
  maxPipValue?: number;
  imageKey?: string;
}

export interface MausritterItemsData {
  weapons: MausritterItemData[];
  armor: MausritterItemData[];
  items: MausritterItemData[];
  spells: MausritterItemData[];
  conditions: MausritterItemData[];
  pipPurse: MausritterItemData;
}

export const useMausritterItems = () => {
  const items = useMemo(() => itemsData as MausritterItemsData, []);

  const createItemFromData = (
    itemData: MausritterItemData,
    type: PlacedItem['type']
  ): Omit<PlacedItem, 'id' | 'position' | 'rotation' | 'isInGrid' | 'scratchPosition'> => {
    return {
      name: itemData.name,
      type,
      damage: itemData.damage,
      weaponCategory: itemData.weaponCategory,
      defense: itemData.defense,
      description: itemData.description,
      clearInstructions: itemData.clearInstructions,
      pipValue: itemData.pipValue,
      maxPipValue: itemData.maxPipValue,
      maxUsageDots: itemData.maxUsageDots,
      usageDots: itemData.usageDots,
      imageKey: itemData.imageKey,
      size: (() => {
        switch (itemData.size) {
          case 'small': return { width: 1, height: 1 };
          case 'wide': return { width: 2, height: 1 };
          case 'tall': return { width: 1, height: 2 };
          case 'large': return { width: 2, height: 2 };
          default: return { width: 1, height: 1 }; // fallback
        }
      })(),
    };
  };

  return {
    items,
    createItemFromData,
  };
};