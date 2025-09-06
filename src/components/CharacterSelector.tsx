import React, { useState } from 'react';
import { useCharacterStore, createNewCharacter } from '../stores/characterStore-simple';
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

  const handleCreateCharacter = () => {
    const newCharacter = createNewCharacter();
    addCharacter(newCharacter);
  };

  const handleDeleteCharacter = (id: string) => {
    deleteCharacter(id);
    setShowDeleteConfirm(null);
  };

  if (characters.length === 0) {
    return (
      <>
        <div className="max-w-md mx-auto mt-20 text-center">
          <div className="card">
            <h1 className="text-3xl text-theme-primary-800 text-theme-primary-800 mb-6">
              Mausritter Character Sheet
            </h1>
            <p className="text-theme-primary-800 mb-6">
              Welcome! You don't have any characters yet.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => setShowWizard(true)}
                className="button-primary text-lg px-6 py-3 w-full"
              >
                🎲 Generate Random Character
              </button>
              <div className="text-sm text-theme-text-light">or</div>
              <button
                onClick={handleCreateCharacter}
                className="px-6 py-3 border border-theme-primary-800 text-theme-primary-800 rounded hover:bg-theme-primary-100 transition-colors text-lg"
              >
                Create Blank Character
              </button>
            </div>
          </div>
        </div>
        
        <CharacterGenerationWizard 
          isOpen={showWizard}
          onClose={() => setShowWizard(false)}
        />
      </>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl text-theme-primary-800 text-theme-primary-800">
            Your Characters
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowWizard(true)}
              className="button-primary"
            >
              🎲 Generate
            </button>
            <button
              onClick={handleCreateCharacter}
              className="px-4 py-2 border border-theme-primary-800 text-theme-primary-800 rounded hover:bg-theme-primary-100 transition-colors"
            >
              Blank Character
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
                <h3 className="text-2xl font-medium text-theme-primary-800">
                  {character.name || 'Unnamed Character'}
                </h3>
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
    </div>
  );
};