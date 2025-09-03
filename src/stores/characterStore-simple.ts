import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Inline types for testing
interface Character {
  id: string;
  name: string;
  level: number;
  experience: number;
  strength: number;
  dexterity: number;
  will: number;
  hitPoints: number;
  maxHitPoints: number;
  background: string;
  birthsign: string;
  coatOfArms: string;
  look: string;
  grit: number;
  pips: number;
  mainHandWeapon?: InventoryItem;
  offHandWeapon?: InventoryItem;
  armor?: InventoryItem;
  inventory: (InventoryItem | null)[];
  hirelings: Hireling[];
}

interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'item' | 'spell';
  description?: string;
  damage?: string;
  armor?: number;
  usageDots?: number;
  maxUsageDots?: number;
  cost?: number;
  weight?: number;
}

interface Hireling {
  id: string;
  name: string;
  strength: number;
  dexterity: number;
  will: number;
  hitPoints: number;
  maxHitPoints: number;
  equipment?: string;
  cost: number;
}

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

export type { Character, InventoryItem, Hireling };