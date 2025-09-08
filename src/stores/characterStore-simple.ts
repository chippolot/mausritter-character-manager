import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Character, Hireling } from '../types/character';

interface CharacterState {
  characters: Character[];
  currentCharacter: Character | null;
  addCharacter: (character: Character) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  setCurrentCharacter: (character: Character | null) => void;
}

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
}),
    {
      name: 'mausritter-characters',
      storage: createJSONStorage(() => localStorage),
    }
  )
);


export type { Character, InventoryItem, Hireling };