import React, { useState } from 'react';
import { Character, InventoryItem } from '../stores/characterStore-simple';
import { createNewItem } from '../stores/characterStore-simple';

interface InventoryGridProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({
  character,
  onUpdate,
}) => {
  const [showAddModal, setShowAddModal] = useState<number | null>(null);

  const handleSlotClick = (index: number) => {
    if (character.inventory[index]) {
      // Remove item if slot is filled
      const newInventory = [...character.inventory];
      newInventory[index] = null;
      onUpdate({ inventory: newInventory });
    } else {
      // Add item if slot is empty
      setShowAddModal(index);
    }
  };

  const handleAddItem = (index: number, name: string, type: InventoryItem['type']) => {
    if (name.trim()) {
      const newItem = createNewItem(name.trim(), type);
      const newInventory = [...character.inventory];
      newInventory[index] = newItem;
      onUpdate({ inventory: newInventory });
    }
    setShowAddModal(null);
  };

  return (
    <div className="card">
      <h2 className="text-xl text-amber-800 text-amber-800 mb-4">Inventory</h2>
      
      <div className="grid grid-cols-3 gap-4">
        {character.inventory.map((item, index) => (
          <div
            key={index}
            className={`inventory-slot ${item ? 'filled' : ''} cursor-pointer`}
            onClick={() => handleSlotClick(index)}
          >
            {item ? (
              <div className="text-center">
                <div className="font-semibold text-stone-800 text-sm">{item.name}</div>
                <div className="text-xs text-amber-800 capitalize">{item.type}</div>
                {item.usageDots && (
                  <div className="text-xs text-amber-800">
                    Usage: {item.usageDots}/{item.maxUsageDots}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs">Slot {index + 1}</span>
            )}
          </div>
        ))}
      </div>

      {showAddModal !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg text-amber-800 text-amber-800 mb-4">
              Add Item to Slot {showAddModal + 1}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const name = formData.get('name') as string;
                const type = formData.get('type') as InventoryItem['type'];
                handleAddItem(showAddModal, name, type);
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-amber-800 mb-1">
                    Item Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    placeholder="Enter item name"
                    className="input-field w-full"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-amber-800 mb-1">
                    Item Type
                  </label>
                  <select
                    name="type"
                    className="input-field w-full"
                    defaultValue="item"
                  >
                    <option value="item">Item</option>
                    <option value="weapon">Weapon</option>
                    <option value="armor">Armor</option>
                    <option value="spell">Spell</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-6">
                <button
                  type="submit"
                  className="button-primary flex-1"
                >
                  Add Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(null)}
                  className="px-4 py-2 border border-amber-800 text-amber-800 rounded hover:bg-amber-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};