import React, { useState } from 'react';
import { useMausritterItems, MausritterItemData } from '../hooks/useMausritterItems';
import { PlacedItem } from '../types/inventory';
import { CustomItemDialog } from './CustomItemDialog';

interface ItemAddFormProps {
  onItemSelect: (itemData: MausritterItemData, type: PlacedItem['type']) => void;
  onAddPipPurse: () => void;
}

type ItemCategory = 'weapon' | 'armor' | 'item' | 'spell' | 'condition' | 'currency';

export const ItemAddForm: React.FC<ItemAddFormProps> = ({ onItemSelect, onAddPipPurse }) => {
  const { items } = useMausritterItems();
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customDialogCategory, setCustomDialogCategory] = useState<'weapon' | 'armor' | 'item' | 'spell' | 'condition'>('weapon');

  const categories = [
    { value: 'weapon' as const, label: 'Weapons' },
    { value: 'armor' as const, label: 'Armor' },
    { value: 'item' as const, label: 'Items & Gear' },
    { value: 'spell' as const, label: 'Spells' },
    { value: 'condition' as const, label: 'Conditions' },
    { value: 'currency' as const, label: 'Currency' },
  ];

  const getItemsForCategory = () => {
    switch (selectedCategory) {
      case 'weapon': return items.weapons;
      case 'armor': return items.armor;
      case 'item': return items.items;
      case 'spell': return items.spells;
      case 'condition': return items.conditions;
      case 'currency': return [items.pipPurse];
      default: return [];
    }
  };

  const handleCategoryChange = (category: ItemCategory) => {
    setSelectedCategory(category);
    setSelectedItem(''); // Reset item selection when category changes
  };

  const handleAdd = () => {
    if (selectedCategory === 'currency') {
      onAddPipPurse();
      setSelectedCategory('');
      return;
    }

    if (selectedItem && selectedCategory) {
      const categoryItems = getItemsForCategory();
      const itemData = categoryItems.find(item => item.name === selectedItem);
      if (itemData) {
        onItemSelect(itemData, selectedCategory);
        setSelectedItem(''); // Reset item selection
        setSelectedCategory(''); // Reset category selection
      }
    }
  };

  const handleCreateCustom = (category: 'weapon' | 'armor' | 'item' | 'spell' | 'condition') => {
    setCustomDialogCategory(category);
    setCustomDialogOpen(true);
  };

  const handleCustomSubmit = (itemData: MausritterItemData, type: PlacedItem['type']) => {
    onItemSelect(itemData, type);
    setCustomDialogOpen(false);
  };

  const selectedCategoryData = categories.find(cat => cat.value === selectedCategory);
  const itemsForCategory = getItemsForCategory();

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-stone-700 mb-3">Add Items:</h3>
      
      <div className="flex flex-col gap-3">
        {/* Category Selection */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => handleCategoryChange(category.value)}
              className={`button-primary text-sm transition-colors ${
                selectedCategory === category.value 
                  ? 'ring-2 ring-offset-1 ring-amber-400' 
                  : ''
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Item Selection and Add Button */}
        {selectedCategory && selectedCategory !== 'currency' && (
          <div className="flex gap-2 items-center">
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="border border-stone-300 rounded px-2 py-1 text-sm min-w-48 bg-white flex-1"
            >
              <option value="">Select {selectedCategoryData?.label.toLowerCase()}...</option>
              {itemsForCategory.map((item) => (
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
              className="button-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Add
            </button>
            <button
              onClick={() => handleCreateCustom(selectedCategory as 'weapon' | 'armor' | 'item' | 'spell' | 'condition')}
              className="button-primary text-sm"
            >
              + Custom
            </button>
          </div>
        )}

        {/* Currency (Pip Purse) - Direct Add */}
        {selectedCategory === 'currency' && (
          <div className="flex gap-2 items-center">
            <span className="text-sm text-stone-600 flex-1">Add a Pip Purse (1×1) to track currency</span>
            <button
              onClick={handleAdd}
              className="button-primary text-sm"
            >
              + Add Pip Purse
            </button>
          </div>
        )}

        <CustomItemDialog
          isOpen={customDialogOpen}
          onClose={() => setCustomDialogOpen(false)}
          category={customDialogCategory}
          onSubmit={handleCustomSubmit}
        />
      </div>
    </div>
  );
};