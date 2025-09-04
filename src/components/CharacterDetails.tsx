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
    onUpdate({ [field]: parseInt(e.target.value) || 0 });
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-amber-800 mb-4">Character Details</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-amber-800 mb-1">
            Name
          </label>
          <input
            type="text"
            value={character.name}
            onChange={handleInputChange('name')}
            className="input-field w-full"
            placeholder="Enter character name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-1">
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
            <label className="block text-sm font-semibold text-amber-800 mb-1">
              Experience
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

        <div>
          <label className="block text-sm font-semibold text-amber-800 mb-1">
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
          <label className="block text-sm font-semibold text-amber-800 mb-1">
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
          <label className="block text-sm font-semibold text-amber-800 mb-1">
            Coat of Arms
          </label>
          <input
            type="text"
            value={character.coatOfArms}
            onChange={handleInputChange('coatOfArms')}
            className="input-field w-full"
            placeholder="Describe your coat of arms"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-amber-800 mb-1">
            Look
          </label>
          <textarea
            value={character.look}
            onChange={handleInputChange('look')}
            className="input-field w-full h-20 resize-none"
            placeholder="Describe your character's appearance"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-1">
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
            <label className="block text-sm font-semibold text-amber-800 mb-1">
              Pips
            </label>
            <input
              type="number"
              value={character.pips}
              onChange={handleNumberChange('pips')}
              className="input-field w-full"
              min="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};