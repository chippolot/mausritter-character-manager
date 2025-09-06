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
    { value: 'weapon' as const, label: 'Weapons', colorClass: 'bg-theme-error-100 text-theme-error-800 border-theme-error-100 hover:bg-theme-error-100' },
    { value: 'armor' as const, label: 'Armor', colorClass: 'bg-theme-info-100 text-theme-info-800 border-theme-info-100 hover:bg-theme-info-100' },
    { value: 'item' as const, label: 'Items & Gear', colorClass: 'bg-theme-success-100 text-theme-success-800 border-theme-success-100 hover:bg-theme-success-100' },
    { value: 'spell' as const, label: 'Spells', colorClass: 'bg-theme-magic-100 text-theme-magic-800 border-theme-magic-100 hover:bg-theme-magic-100' },
    { value: 'condition' as const, label: 'Conditions', colorClass: 'bg-theme-warning-100 text-theme-warning-800 border-theme-warning-100 hover:bg-theme-warning-100' },
    { value: 'currency' as const, label: 'Currency', colorClass: 'bg-theme-currency-100 text-theme-currency-800 border-theme-currency-100 hover:bg-theme-currency-100' },
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
                  ? 'ring-2 ring-offset-1 ring-theme-primary-400' 
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
              className="border border-theme-neutral-300 rounded px-2 py-1 text-sm min-w-48 bg-theme-surface flex-1"
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
            <span className="text-sm text-theme-text-light flex-1">Add a Pip Purse (1×1) to track currency</span>
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