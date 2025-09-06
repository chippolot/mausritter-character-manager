import React from 'react';
import { Character } from '../stores/characterStore-simple';
import { useCharacterStore } from '../stores/characterStore-simple';
import { AttributeBlock } from './AttributeBlock';
import { TactileInventory } from './TactileInventory';
import { HirelingList } from './HirelingList';
import { CharacterDetails } from './CharacterDetails';

interface CharacterSheetProps {
  character: Character;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({ character }) => {
  const { updateCharacter } = useCharacterStore();

  const handleUpdate = (updates: Partial<Character>) => {
    updateCharacter(character.id, updates);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="text-center border-b-2 border-theme-primary-800 pb-4">
        <div className="flex items-center justify-center gap-3">
          <h1 className={`text-5xl text-theme-primary-800 mb-2 font-header ${
            !character.alive ? 'line-through opacity-60' : ''
          }`}>
            {character.name || 'Unnamed Character'}
          </h1>
          {!character.alive && <span className="text-4xl mb-2">💀</span>}
        </div>
        <p className="text-lg text-theme-primary-800 opacity-75">
          Level {character.level} • {character.experience} XP
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <CharacterDetails character={character} onUpdate={handleUpdate} />
          <AttributeBlock character={character} onUpdate={handleUpdate} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <TactileInventory 
            items={character.tactileInventory} 
            onItemsChange={(items) => handleUpdate({ tactileInventory: items })}
          />
          <HirelingList character={character} onUpdate={handleUpdate} />
        </div>
      </div>
    </div>
  );
};