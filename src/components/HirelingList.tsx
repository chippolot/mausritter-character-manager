import React from 'react';
import { Character, Hireling } from '../types/character';
import { HirelingFactory } from '../factories';

interface HirelingListProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const HirelingList: React.FC<HirelingListProps> = ({
  character,
  onUpdate,
}) => {

  const addHireling = () => {
    const newHireling = HirelingFactory.create(); // No name parameter = blank name, random stats
    onUpdate({ 
      hirelings: [...character.hirelings, newHireling] 
    });
  };

  const updateHireling = (id: string, updates: Partial<Hireling>) => {
    const updatedHirelings = character.hirelings.map(hireling =>
      hireling.id === id ? { ...hireling, ...updates } : hireling
    );
    onUpdate({ hirelings: updatedHirelings });
  };

  const removeHireling = (id: string) => {
    const updatedHirelings = character.hirelings.filter(h => h.id !== id);
    onUpdate({ hirelings: updatedHirelings });
  };

  const HirelingCard: React.FC<{ hireling: Hireling }> = ({ hireling }) => {
    const handleInputChange = (field: keyof Hireling) => (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const value = ['strength', 'dexterity', 'will', 'hitPoints', 'maxHitPoints', 'cost'].includes(field)
        ? parseInt(e.target.value) || 0
        : e.target.value;
      updateHireling(hireling.id, { [field]: value });
    };

    return (
      <div className="border border-theme-primary-800 rounded p-4 bg-theme-surface bg-opacity-50">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 mr-4">
            <label className="block text-sm font-semibold text-theme-primary-800 mb-1">
              Name
            </label>
            <input
              type="text"
              value={hireling.name}
              onChange={handleInputChange('name')}
              className="input-field text-theme-primary-800 text-xl w-full"
              placeholder="Hireling name"
            />
          </div>
          <button
            onClick={() => removeHireling(hireling.id)}
            className="text-theme-primary-800 hover:text-red-600 text-sm mt-6"
          >
            Remove
          </button>
        </div>

        <div className="flex items-end space-x-3 mb-3">
          <div>
            <label className="text-sm font-semibold text-theme-primary-800 block mb-1">STR</label>
            <input
              type="number"
              value={hireling.strength}
              onChange={handleInputChange('strength')}
              className="input-field w-12 text-sm text-center"
              min="1"
              max="20"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-theme-primary-800 block mb-1">DEX</label>
            <input
              type="number"
              value={hireling.dexterity}
              onChange={handleInputChange('dexterity')}
              className="input-field w-12 text-sm text-center"
              min="1"
              max="20"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-theme-primary-800 block mb-1">WIL</label>
            <input
              type="number"
              value={hireling.will}
              onChange={handleInputChange('will')}
              className="input-field w-12 text-sm text-center"
              min="1"
              max="20"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-theme-primary-800 block mb-1">Cost</label>
            <div className="flex items-center">
              <input
                type="number"
                value={hireling.cost}
                onChange={handleInputChange('cost')}
                className="input-field w-20 text-sm text-center"
                min="0"
              />
              <span className="text-theme-primary-800 text-sm ml-1">p</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div>
            <label className="text-sm font-semibold text-theme-primary-800 block">HP</label>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                value={hireling.hitPoints}
                onChange={handleInputChange('hitPoints')}
                className="input-field w-12 text-sm text-center"
                min="0"
              />
              <span className="text-theme-primary-800">/</span>
              <input
                type="number"
                value={hireling.maxHitPoints}
                onChange={handleInputChange('maxHitPoints')}
                className="input-field w-12 text-sm text-center"
                min="1"
              />
            </div>
          </div>
          
          <div className="flex-1">
            <label className="text-sm font-semibold text-theme-primary-800 block">Equipment</label>
            <input
              type="text"
              value={hireling.equipment || ''}
              onChange={handleInputChange('equipment')}
              className="input-field w-full text-sm"
              placeholder="Equipment list"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-medium text-theme-primary-800">
          Hirelings ({character.hirelings.length}/2)
        </h2>
        {character.hirelings.length < 2 && (
          <button
            onClick={addHireling}
            className="button-primary"
          >
            Add Hireling
          </button>
        )}
      </div>

      {character.hirelings.length === 0 ? (
        <div className="text-center text-theme-primary-800 opacity-75 py-8">
          No hirelings yet. Click "Add Hireling" to add one.
        </div>
      ) : (
        <div className="space-y-4">
          {character.hirelings.map(hireling => (
            <HirelingCard key={hireling.id} hireling={hireling} />
          ))}
        </div>
      )}
    </div>
  );
};