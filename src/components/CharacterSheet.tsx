import React, { useRef } from 'react';
import { Character } from '../stores/characterStore-simple';
import { useCharacterStore } from '../stores/characterStore-simple';
import { TactileInventory } from './TactileInventory';
import { HirelingList } from './HirelingList';
import { CharacterDetails } from './CharacterDetails';

interface CharacterSheetProps {
  character: Character;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({ character }) => {
  const { updateCharacter, addCharacter } = useCharacterStore();
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = (updates: Partial<Character>) => {
    updateCharacter(character.id, updates);
  };

  const exportCharacter = async () => {
    const dataStr = JSON.stringify(character, null, 2);
    
    // Try to use the modern File System Access API if available
    if ('showSaveFilePicker' in window) {
      try {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: `${character.name || 'character'}.json`,
          types: [{
            description: 'JSON files',
            accept: { 'application/json': ['.json'] }
          }]
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(dataStr);
        await writable.close();
        return;
      } catch (error: any) {
        // Check if user cancelled the dialog
        if (error.name === 'AbortError') {
          return; // User cancelled, don't do anything
        }
        // If it's a different error, fall through to fallback
      }
    }
    
    // Fallback to traditional download method
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${character.name || 'character'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importCharacter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as Character;
        
        // Validate that it's a valid character object by checking required fields
        if (!imported.id || typeof imported.name !== 'string' || typeof imported.level !== 'number') {
          alert('Invalid character file format');
          return;
        }

        // Show confirmation dialog for overwrite
        const confirmed = window.confirm(
          `Are you sure you want to overwrite "${character.name || 'this character'}" with "${imported.name}"?\n\nThis action cannot be undone.`
        );

        if (!confirmed) {
          return;
        }

        // Keep the current character's ID but overwrite all other data
        const updatedCharacter: Character = {
          ...imported,
          id: character.id
        };

        updateCharacter(character.id, updatedCharacter);
        alert(`Character overwritten with "${updatedCharacter.name}" successfully!`);
      } catch (error) {
        alert('Error reading character file. Please ensure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (importFileInputRef.current) {
      importFileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="text-center border-b-2 border-theme-primary-800 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex-1"></div>
          <div className="flex items-center justify-center gap-3">
            <h1 className={`text-5xl text-theme-primary-800 mb-2 font-header ${
              !character.alive ? 'line-through opacity-60' : ''
            }`}>
              {character.name || 'Unnamed Character'}
            </h1>
            {!character.alive && <span className="text-4xl mb-2">💀</span>}
          </div>
          <div className="flex-1 flex justify-end gap-2">
            <button
              onClick={exportCharacter}
              className="px-3 py-1 text-sm border border-theme-primary-600 text-theme-primary-600 rounded hover:bg-theme-primary-100 transition-colors"
              title="Export character to JSON file"
            >
              Export
            </button>
            <button
              onClick={() => importFileInputRef.current?.click()}
              className="px-3 py-1 text-sm border border-theme-primary-600 text-theme-primary-600 rounded hover:bg-theme-primary-100 transition-colors"
              title="Import character from JSON file"
            >
              Import
            </button>
            <input
              ref={importFileInputRef}
              type="file"
              accept=".json"
              onChange={importCharacter}
              className="hidden"
            />
          </div>
        </div>
        <p className="text-lg text-theme-primary-800 opacity-75">
          Level {character.level} • {character.experience} XP
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <CharacterDetails character={character} onUpdate={handleUpdate} />
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