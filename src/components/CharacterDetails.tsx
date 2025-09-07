import React from 'react';
import { Character } from '../stores/characterStore-simple';

interface CharacterDetailsProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const CharacterDetails: React.FC<CharacterDetailsProps> = ({
  character,
  onUpdate,
}) => {
  const handleInputChange = (field: keyof Character) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onUpdate({ [field]: e.target.value });
  };

  const handleNumberChange = (field: keyof Character) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value) || 0;
    
    // Validate current attributes don't exceed their max values
    if (field === 'strength' && value > character.maxStrength) {
      onUpdate({ [field]: character.maxStrength });
    } else if (field === 'dexterity' && value > character.maxDexterity) {
      onUpdate({ [field]: character.maxDexterity });
    } else if (field === 'will' && value > character.maxWill) {
      onUpdate({ [field]: character.maxWill });
    } else if (field === 'hitPoints' && value > character.maxHitPoints) {
      onUpdate({ [field]: character.maxHitPoints });
    } else {
      onUpdate({ [field]: value });
    }
  };

  const handleCheckboxChange = (field: keyof Character) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onUpdate({ [field]: e.target.checked });
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-medium text-theme-primary-800 mb-4">Character Details</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-theme-primary-800 mb-1">
            Name
          </label>
          <input
            type="text"
            value={character.name}
            onChange={handleInputChange('name')}
            className={`input-field w-full ${
              !character.alive ? 'line-through opacity-60' : ''
            }`}
            placeholder="Enter character name"
          />
        </div>

        <div className="flex items-center gap-3 p-3 bg-theme-primary-100 rounded-lg">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={character.alive}
              onChange={handleCheckboxChange('alive')}
              className="w-4 h-4 text-theme-primary-600 border-theme-primary-800 rounded focus:ring-theme-primary-600"
            />
            <span className={`text-sm font-semibold ${
              character.alive ? 'text-green-700' : 'text-red-700'
            }`}>
              {character.alive ? '✓ Alive' : '💀 Dead'}
            </span>
          </label>
          {!character.alive && (
            <span className="text-xs text-theme-primary-700">
              Character appears crossed out in lists
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-theme-primary-800 mb-1">
              Level
            </label>
            <input
              type="number"
              value={character.level}
              onChange={handleNumberChange('level')}
              className="input-field w-full"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-theme-primary-800 mb-1">
              XP
            </label>
            <input
              type="number"
              value={character.experience}
              onChange={handleNumberChange('experience')}
              className="input-field w-full"
              min="0"
            />
          </div>
        </div>
        <div className="text-xs text-theme-primary-600 -mt-2">
          Recovered treasure → XP
        </div>

        {/* Attributes */}
        <div className="space-y-3">
          {/* STR */}
          <div className="flex items-center justify-between">
            <label className="text-lg font-semibold text-theme-primary-800">
              STR
            </label>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                value={character.strength}
                onChange={handleNumberChange('strength')}
                className="input-field w-24 text-center font-semibold"
                min="0"
                max={character.maxStrength}
              />
              <span className="text-theme-primary-800 font-bold">/</span>
              <input
                type="number"
                value={character.maxStrength}
                onChange={handleNumberChange('maxStrength')}
                className="input-field w-24 text-center font-semibold"
                min="1"
              />
            </div>
          </div>
          
          {/* DEX */}
          <div className="flex items-center justify-between">
            <label className="text-lg font-semibold text-theme-primary-800">
              DEX
            </label>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                value={character.dexterity}
                onChange={handleNumberChange('dexterity')}
                className="input-field w-24 text-center font-semibold"
                min="0"
                max={character.maxDexterity}
              />
              <span className="text-theme-primary-800 font-bold">/</span>
              <input
                type="number"
                value={character.maxDexterity}
                onChange={handleNumberChange('maxDexterity')}
                className="input-field w-24 text-center font-semibold"
                min="1"
              />
            </div>
          </div>
          
          {/* WIL */}
          <div className="flex items-center justify-between">
            <label className="text-lg font-semibold text-theme-primary-800">
              WIL
            </label>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                value={character.will}
                onChange={handleNumberChange('will')}
                className="input-field w-24 text-center font-semibold"
                min="0"
                max={character.maxWill}
              />
              <span className="text-theme-primary-800 font-bold">/</span>
              <input
                type="number"
                value={character.maxWill}
                onChange={handleNumberChange('maxWill')}
                className="input-field w-24 text-center font-semibold"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Hit Points - spaced apart */}
        <div className="flex items-center justify-between">
          <label className="text-lg font-semibold text-theme-primary-800">
            HP
          </label>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              value={character.hitPoints}
              onChange={handleNumberChange('hitPoints')}
              className="input-field w-24 text-center font-semibold"
              min="0"
              max={character.maxHitPoints}
            />
            <span className="text-theme-primary-800 font-bold">/</span>
            <input
              type="number"
              value={character.maxHitPoints}
              onChange={handleNumberChange('maxHitPoints')}
              className="input-field w-24 text-center font-semibold"
              min="1"
            />
          </div>
        </div>

        {/* Pips */}
        <div className="flex items-center justify-between">
          <label className="text-lg font-semibold text-theme-primary-800">
            Pips
          </label>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              value={character.pips}
              onChange={handleNumberChange('pips')}
              className="input-field w-24 text-center font-semibold"
              min="0"
              max="250"
            />
            <span className="text-theme-primary-800 font-bold">/</span>
            <span className="w-24 text-center font-semibold text-theme-primary-800">250</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-theme-primary-800 mb-1">
            Background
          </label>
          <input
            type="text"
            value={character.background}
            onChange={handleInputChange('background')}
            className="input-field w-full"
            placeholder="e.g., Kitchen Forager"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-theme-primary-800 mb-1">
            Birthsign
          </label>
          <input
            type="text"
            value={character.birthsign}
            onChange={handleInputChange('birthsign')}
            className="input-field w-full"
            placeholder="e.g., The Star"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-theme-primary-800 mb-1">
            Coat
          </label>
          <input
            type="text"
            value={character.coat}
            onChange={handleInputChange('coat')}
            className="input-field w-full"
            placeholder="Describe your coat"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-theme-primary-800 mb-1">
            Look
          </label>
          <textarea
            value={character.look}
            onChange={handleInputChange('look')}
            className="input-field w-full h-20 resize-none"
            placeholder="Describe your character's appearance"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-theme-primary-800 mb-1">
            Grit
          </label>
          <input
            type="number"
            value={character.grit}
            onChange={handleNumberChange('grit')}
            className="input-field w-full"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-theme-primary-800 mb-1">
            Ignored Conditions
          </label>
          <textarea
            value={character.ignoredConditions}
            onChange={handleInputChange('ignoredConditions')}
            className="input-field w-full h-24 resize-none"
            placeholder="List conditions you are ignoring due to Grit"
          />
          <div className="text-xs text-theme-primary-600 mt-1">
            Ignore a number of conditions equal to your Grit
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-theme-primary-800 mb-1">
            Banked Items and Pips
          </label>
          <textarea
            value={character.bankedItemsAndPips}
            onChange={handleInputChange('bankedItemsAndPips')}
            className="input-field w-full h-24 resize-none"
            placeholder="List items and pips you have banked for safekeeping"
          />
        </div>

      </div>
    </div>
  );
};