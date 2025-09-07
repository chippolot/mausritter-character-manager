import React, { useState, useRef } from 'react';
import { useCharacterStore, createNewCharacter, Character } from '../stores/characterStore-simple';
import { CharacterGenerationWizard } from './CharacterGenerationWizard';

export const CharacterSelector: React.FC = () => {
  const { 
    characters, 
    currentCharacter, 
    addCharacter, 
    setCurrentCharacter, 
    deleteCharacter 
  } = useCharacterStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateCharacter = () => {
    const newCharacter = createNewCharacter();
    addCharacter(newCharacter);
  };

  const handleDeleteCharacter = (id: string) => {
    deleteCharacter(id);
    setShowDeleteConfirm(null);
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

        // Generate new ID to avoid conflicts
        const characterWithNewId = {
          ...imported,
          id: crypto.randomUUID(),
        };

        addCharacter(characterWithNewId);
        alert(`Character "${characterWithNewId.name}" imported successfully!`);
      } catch (error) {
        alert('Error reading character file. Please make sure it\'s a valid JSON file.');
      }
    };

    reader.readAsText(file);
    // Reset the input value so the same file can be imported again if needed
    event.target.value = '';
  };

  if (characters.length === 0) {
    return (
      <>
        <div className="max-w-md mx-auto mt-20 text-center px-4">
          <div className="card">
            <h1 className="text-2xl sm:text-3xl text-theme-primary-800 text-theme-primary-800 mb-6">
              Mausritter Character Manager
            </h1>
            <p className="text-theme-primary-800 mb-6">
              Welcome! You don't have any characters yet.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => setShowWizard(true)}
                className="button-primary text-base sm:text-lg px-4 sm:px-6 py-3 w-full min-h-[44px] touch-manipulation"
              >
                🎲 Generate Random Character
              </button>
              <div className="text-sm text-theme-text-light">or</div>
              <button
                onClick={handleCreateCharacter}
                className="px-4 sm:px-6 py-3 border border-theme-primary-800 text-theme-primary-800 rounded hover:bg-theme-primary-100 transition-colors text-base sm:text-lg w-full min-h-[44px] touch-manipulation"
              >
                Create Blank Character
              </button>
              <div className="text-sm text-theme-text-light">or</div>
              <button
                onClick={() => importFileInputRef.current?.click()}
                className="px-4 sm:px-6 py-3 border border-theme-primary-800 text-theme-primary-800 rounded hover:bg-theme-primary-100 transition-colors text-base sm:text-lg w-full min-h-[44px] touch-manipulation"
              >
                📄 Import from JSON
              </button>
            </div>
          </div>
        </div>
        
        <CharacterGenerationWizard 
          isOpen={showWizard}
          onClose={() => setShowWizard(false)}
        />
        
        <input
          ref={importFileInputRef}
          type="file"
          accept=".json"
          onChange={importCharacter}
          className="hidden"
        />
      </>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h1 className="text-2xl sm:text-3xl text-theme-primary-800 text-theme-primary-800">
            Your Characters
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowWizard(true)}
              className="button-primary min-h-[44px] touch-manipulation text-sm sm:text-base"
            >
              🎲 Generate
            </button>
            <button
              onClick={handleCreateCharacter}
              className="px-3 sm:px-4 py-2 border border-theme-primary-800 text-theme-primary-800 rounded hover:bg-theme-primary-100 transition-colors min-h-[44px] touch-manipulation text-sm sm:text-base"
            >
              Blank Character
            </button>
            <button
              onClick={() => importFileInputRef.current?.click()}
              className="px-3 sm:px-4 py-2 border border-theme-primary-800 text-theme-primary-800 rounded hover:bg-theme-primary-100 transition-colors min-h-[44px] touch-manipulation text-sm sm:text-base"
              title="Import character from JSON file"
            >
              📄 Import
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((character) => (
            <div
              key={character.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                currentCharacter?.id === character.id
                  ? 'border-theme-primary-600 bg-theme-primary-600 bg-opacity-10'
                  : 'border-theme-primary-800 bg-theme-surface hover:bg-theme-primary-200'
              }`}
              onClick={() => setCurrentCharacter(character)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <h3 className={`text-2xl font-medium text-theme-primary-800 ${
                    !character.alive ? 'line-through opacity-60' : ''
                  }`}>
                    {character.name || 'Unnamed Character'}
                  </h3>
                  {!character.alive && <span className="text-lg">💀</span>}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(character.id);
                  }}
                  className="text-theme-primary-800 hover:text-theme-error-600 text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="text-sm text-theme-primary-800 opacity-75 mb-2">
                Level {character.level} • {character.experience} XP
              </div>
              
              <div className="text-xs text-theme-primary-800">
                {character.background && (
                  <div>Background: {character.background}</div>
                )}
                <div>
                  STR {character.strength} • DEX {character.dexterity} • WIL {character.will}
                </div>
                <div>
                  HP {character.hitPoints}/{character.maxHitPoints}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-theme-primary-800 mb-4">
              Delete Character
            </h3>
            <p className="text-theme-primary-800 mb-6">
              Are you sure you want to delete this character? This action cannot be undone.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleDeleteCharacter(showDeleteConfirm)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-theme-primary-800 text-theme-primary-800 rounded hover:bg-theme-primary-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <CharacterGenerationWizard 
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
      />
      
      <input
        ref={importFileInputRef}
        type="file"
        accept=".json"
        onChange={importCharacter}
        className="hidden"
      />
    </div>
  );
};