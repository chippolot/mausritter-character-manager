import React, { useState } from 'react';
import { Character, InventoryItem } from '../stores/characterStore-simple';
import { createNewItem } from '../stores/characterStore-simple';

interface EquipmentSlotsProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const EquipmentSlots: React.FC<EquipmentSlotsProps> = ({
  character,
  onUpdate,
}) => {
  const [showAddModal, setShowAddModal] = useState<string | null>(null);

  const EquipmentSlot: React.FC<{
    label: string;
    item: InventoryItem | undefined;
    slotKey: 'mainHandWeapon' | 'offHandWeapon' | 'armor';
  }> = ({ label, item, slotKey }) => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-theme-primary-800">
        {label}
      </label>
      <div
        className={`inventory-slot ${item ? 'filled' : ''} cursor-pointer`}
        onClick={() => setShowAddModal(slotKey)}
      >
        {item ? (
          <div className="text-center">
            <div className="font-semibold text-stone-800">{item.name}</div>
            {item.damage && (
              <div className="text-xs text-theme-primary-800">Damage: {item.damage}</div>
            )}
            {item.armor && (
              <div className="text-xs text-theme-primary-800">Armor: {item.armor}</div>
            )}
          </div>
        ) : (
          <span>Click to add {label.toLowerCase()}</span>
        )}
      </div>
    </div>
  );

  const handleAddItem = (slotKey: string, name: string, type: InventoryItem['type']) => {
    if (name.trim()) {
      const newItem = createNewItem(name.trim(), type);
      onUpdate({ [slotKey]: newItem });
    }
    setShowAddModal(null);
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-medium text-theme-primary-800 mb-4">Equipment</h2>
      
      <div className="space-y-4">
        <EquipmentSlot
          label="Main Hand Weapon"
          item={character.mainHandWeapon}
          slotKey="mainHandWeapon"
        />
        <EquipmentSlot
          label="Off Hand Weapon"
          item={character.offHandWeapon}
          slotKey="offHandWeapon"
        />
        <EquipmentSlot
          label="Armor"
          item={character.armor}
          slotKey="armor"
        />
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-theme-primary-800 mb-4">
              Add {showAddModal === 'mainHandWeapon' || showAddModal === 'offHandWeapon' ? 'Weapon' : 'Armor'}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const name = formData.get('name') as string;
                const type = showAddModal === 'armor' ? 'armor' : 'weapon';
                handleAddItem(showAddModal, name, type);
              }}
            >
              <input
                name="name"
                type="text"
                placeholder="Enter item name"
                className="input-field w-full mb-4"
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="button-primary flex-1"
                >
                  Add Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(null)}
                  className="px-4 py-2 border border-theme-primary-800 text-theme-primary-800 rounded hover:bg-theme-primary-800 hover:text-white transition-colors"
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