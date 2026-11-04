import { useMemo } from 'react';
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

  return {
    items,
  };
};