import React from 'react';
import { useCharacterStore } from './stores/characterStore-simple';
import { CharacterSelector } from './components/CharacterSelector';
import { CharacterSheet } from './components/CharacterSheet';

function App() {
  const { currentCharacter } = useCharacterStore();

  return (
    <div className="min-h-screen bg-amber-50">
      {currentCharacter ? (
        <div>
          <nav className="bg-white border-b-2 border-amber-800 p-4 shadow-sm">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              <h1 className="text-2xl text-amber-800" style={{fontFamily: 'Cinzel, serif'}}>
                Mausritter Character Sheet
              </h1>
              <button
                onClick={() => useCharacterStore.getState().setCurrentCharacter(null)}
                className="text-amber-800 hover:text-yellow-600 transition-colors"
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