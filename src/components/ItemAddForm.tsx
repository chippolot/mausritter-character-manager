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
  const [isExpanded, setIsExpanded] = useState(false);

  const categories = [
    { value: 'weapon' as const, label: 'Weapons', colorClass: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-150' },
    { value: 'armor' as const, label: 'Armor', colorClass: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-150' },
    { value: 'item' as const, label: 'Items & Gear', colorClass: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-150' },
    { value: 'spell' as const, label: 'Spells', colorClass: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-150' },
    { value: 'condition' as const, label: 'Conditions', colorClass: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-150' },
    { value: 'currency' as const, label: 'Currency', colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-150' },
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
    if (selectedCategory === category) {
      // If clicking the same category, hide the section
      setSelectedCategory('');
    } else {
      // If clicking a different category, show that section
      setSelectedCategory(category);
    }
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
      <div className="flex flex-col gap-3">
        {/* Category Selection */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => handleCategoryChange(category.value)}
              className={`px-3 py-2 rounded border text-sm font-medium transition-colors ${
                category.colorClass
              } ${
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
                  {(() => {
                    switch (item.size) {
                      case 'small': return ' (1×1)';
                      case 'wide': return ' (2×1)';
                      case 'tall': return ' (1×2)';
                      case 'large': return ' (2×2)';
                      default: return ' (1×1)';
                    }
                  })()}
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