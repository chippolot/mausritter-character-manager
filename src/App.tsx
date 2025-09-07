import { useCharacterStore } from './stores/characterStore-simple';
import { CharacterSelector } from './components/CharacterSelector';
import { CharacterSheet } from './components/CharacterSheet';

function App() {
  const { currentCharacter } = useCharacterStore();

  return (
    <div className="min-h-screen bg-theme-background flex flex-col">
      <div className="flex-1">
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
      
      {/* Footer with Attribution */}
      <footer className="bg-theme-surface border-t-2 border-theme-primary-800 py-6 mt-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img 
                src="/compatible-with-mausritter.png" 
                alt="Compatible with Mausritter" 
                className="h-16 w-auto"
              />
              <div className="text-sm text-theme-primary-800">
                <p className="mb-1">
                  This work is based on{' '}
                  <a 
                    href="https://mausritter.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-theme-primary-600 hover:text-theme-primary-400 underline"
                  >
                    Mausritter
                  </a>
                  , a product of Losing Games and Isaac Williams,
                </p>
                <p>
                  and is licensed for use under the{' '}
                  <a 
                    href="https://creativecommons.org/licenses/by/4.0/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-theme-primary-600 hover:text-theme-primary-400 underline"
                  >
                    Creative Commons Attribution 4.0 International (CC BY 4.0)
                  </a>
                  {' '}licence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;