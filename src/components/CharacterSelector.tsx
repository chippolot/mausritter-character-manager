import React, { useState } from 'react';
import { useCharacterStore, createNewCharacter } from '../stores/characterStore-simple';

export const CharacterSelector: React.FC = () => {
  const { 
    characters, 
    currentCharacter, 
    addCharacter, 
    setCurrentCharacter, 
    deleteCharacter 
  } = useCharacterStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

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
      <div className="max-w-md mx-auto mt-20 text-center">
        <div className="card">
          <h1 className="text-3xl text-amber-800 text-amber-800 mb-6">
            Mausritter Character Sheet
          </h1>
          <p className="text-amber-800 mb-6">
            Welcome! You don't have any characters yet.
          </p>
          <button
            onClick={handleCreateCharacter}
            className="button-primary text-lg px-6 py-3"
          >
            Create Your First Character
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl text-amber-800 text-amber-800">
            Your Characters
          </h1>
          <button
            onClick={handleCreateCharacter}
            className="button-primary"
          >
            New Character
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((character) => (
            <div
              key={character.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                currentCharacter?.id === character.id
                  ? 'border-yellow-500 bg-yellow-500 bg-opacity-10'
                  : 'border-amber-800 bg-white hover:bg-amber-800 hover:bg-opacity-10'
              }`}
              onClick={() => setCurrentCharacter(character)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-amber-800 text-lg text-amber-800">
                  {character.name || 'Unnamed Character'}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(character.id);
                  }}
                  className="text-amber-800 hover:text-red-600 text-sm"
                >
                  ×
                </button>
              </div>
              
              <div className="text-sm text-amber-800 opacity-75 mb-2">
                Level {character.level} • {character.experience} XP
              </div>
              
              <div className="text-xs text-amber-800">
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
            <h3 className="text-lg text-amber-800 text-amber-800 mb-4">
              Delete Character
            </h3>
            <p className="text-amber-800 mb-6">
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
                className="px-4 py-2 border border-amber-800 text-amber-800 rounded hover:bg-amber-800 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};