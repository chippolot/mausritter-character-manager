import React from 'react';
import { useCharacterStore } from './stores/characterStore-simple';
import { CharacterSelector } from './components/CharacterSelector';
import { CharacterSheet } from './components/CharacterSheet';

function App() {
  const { currentCharacter } = useCharacterStore();

  return (
    <div className="min-h-screen bg-theme-background">
      {currentCharacter ? (
        <div>
          <nav className="bg-theme-surface border-b-2 border-theme-primary-800 p-4 shadow-sm">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              <h1 className="text-2xl text-theme-primary-800 font-header">
                Mausritter Character Sheet
              </h1>
              <button
                onClick={() => useCharacterStore.getState().setCurrentCharacter(null)}
                className="text-theme-primary-800 hover:text-theme-primary-600 transition-colors"
              >
                ← Back to Characters
              </button>
            </div>
          </nav>
          <CharacterSheet character={currentCharacter} />
        </div>
      ) : (
        <CharacterSelector />
      )}
    </div>
  );
}

export default App;