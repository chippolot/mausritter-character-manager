import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Character, CharacterState, InventoryItem, Hireling } from '../types/character';

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      characters: [],
      currentCharacter: null,
      
      addCharacter: (character: Character) => {
        set((state) => ({
          characters: [...state.characters, character],
          currentCharacter: character,
        }));
      },
      
      updateCharacter: (id: string, updates: Partial<Character>) => {
        set((state) => ({
          characters: state.characters.map((char) =>
            char.id === id ? { ...char, ...updates } : char
          ),
          currentCharacter:
            state.currentCharacter?.id === id
              ? { ...state.currentCharacter, ...updates }
              : state.currentCharacter,
        }));
      },
      
      deleteCharacter: (id: string) => {
        set((state) => ({
          characters: state.characters.filter((char) => char.id !== id),
          currentCharacter:
            state.currentCharacter?.id === id ? null : state.currentCharacter,
        }));
      },
      
      setCurrentCharacter: (character: Character | null) => {
        set({ currentCharacter: character });
      },
      
      loadCharacters: () => {
        // This is handled by the persist middleware
      },
      
      saveCharacters: () => {
        // This is handled by the persist middleware
      },
    }),
    {
      name: 'mausritter-characters',
    }
  )
);

export const createNewCharacter = (): Character => ({
  id: crypto.randomUUID(),
  name: '',
  level: 1,
  experience: 0,
  strength: 8,
  dexterity: 8,
  will: 8,
  hitPoints: 4,
  maxHitPoints: 4,
  background: '',
  birthsign: '',
  coatOfArms: '',
  look: '',
  grit: 0,
  pips: 0,
  inventory: new Array(6).fill(null),
  hirelings: [],
});

export const createNewItem = (name: string, type: InventoryItem['type']): InventoryItem => ({
  id: crypto.randomUUID(),
  name,
  type,
});

export const createNewHireling = (): Hireling => ({
  id: crypto.randomUUID(),
  name: '',
  strength: 6,
  dexterity: 6,
  will: 6,
  hitPoints: 2,
  maxHitPoints: 2,
  cost: 1,
});