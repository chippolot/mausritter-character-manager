import React, { useState } from 'react';
import { useMausritterItems, MausritterItemData } from '../hooks/useMausritterItems';
import { PlacedItem } from '../types/inventory';

interface ItemSelectorProps {
  type: 'weapon' | 'armor' | 'item' | 'spell' | 'condition';
  onItemSelect: (itemData: MausritterItemData, type: PlacedItem['type']) => void;
}

export const ItemSelector: React.FC<ItemSelectorProps> = ({ type, onItemSelect }) => {
  const { items } = useMausritterItems();
  const [selectedItem, setSelectedItem] = useState<string>('');

  const getTypeData = () => {
    switch (type) {
      case 'weapon': return { items: items.weapons, label: 'Weapons', className: 'bg-red-500 hover:bg-red-600' };
      case 'armor': return { items: items.armor, label: 'Armor', className: 'bg-blue-500 hover:bg-blue-600' };
      case 'item': return { items: items.items, label: 'Items & Gear', className: 'bg-green-500 hover:bg-green-600' };
      case 'spell': return { items: items.spells, label: 'Spells', className: 'bg-purple-500 hover:bg-purple-600' };
      case 'condition': return { items: items.conditions, label: 'Conditions', className: 'bg-red-500 hover:bg-red-600' };
      default: return { items: [], label: '', className: '' };
    }
  };

  const typeData = getTypeData();

  const handleAdd = () => {
    if (selectedItem) {
      const itemData = typeData.items.find(item => item.name === selectedItem);
      if (itemData) {
        onItemSelect(itemData, type);
        setSelectedItem(''); // Reset selection
      }
    }
  };

  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-stone-700 mb-2">{typeData.label}:</h3>
      <div className="flex gap-2 items-center">
        <select
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
          className="border border-stone-300 rounded px-2 py-1 text-sm min-w-32 bg-white"
        >
          <option value="">Select {type}...</option>
          {typeData.items.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name}
              {item.damage && ` (${item.damage})`}
              {item.defense && ` (${item.defense} def)`}
              {item.size === 'large' ? ' (2×1)' : ' (1×1)'}
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={!selectedItem}
          className={`px-3 py-1 rounded text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed ${typeData.className}`}
        >
          + Add
        </button>
      </div>
    </div>
  );
};