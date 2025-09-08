import React, { useState } from 'react';
import { useCharacterStore } from '../stores/characterStore-simple';
import { InventoryItem } from '../types/inventory';
import { CharacterFactory, HirelingFactory, InventoryItemFactory } from '../factories';
import generationTables from '../data/generationTables.json';
import mausritterItems from '../data/mausritterItems.json';

interface CharacterGenerationWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

type BackgroundItem = string | {
  type: 'custom';
  itemType: 'weapon' | 'armor' | 'item';
  name: string;
  damage?: string;
  defense?: number;
  weaponCategory?: string;
  size?: string;
  maxUsageDots?: number;
  imageKey?: string;
  description?: string;
};

interface GenerationResults {
  step: number;
  attributes: { 
    str: number[]; 
    dex: number[]; 
    wil: number[]; 
    final: { str: number; dex: number; wil: number };
    original: { str: number; dex: number; wil: number };
  };
  hitPoints: number;
  pips: number;
  background: { name: string; items: BackgroundItem[] };
  birthsign: { name: string; description: string };
  coat: { color: string; pattern: string };
  physicalDetail: string;
  name: string;
  selectedWeapon: string;
  customBirthsign: string;
  customCoat: { color: string; pattern: string };
  customPhysicalDetail: string;
  selectedSwap: string | null;
}

// Helper function to get background by HP and Pips
const getBackground = (hp: number, pips: number) => {
  const hpKey = `hp${Math.min(hp, 6)}` as keyof typeof generationTables.backgrounds;
  const pipIndex = Math.min(pips - 1, 5);
  return generationTables.backgrounds[hpKey][pipIndex];
};

// Helper function to extract hireling name from background items
const extractHirelingName = (backgroundItem: BackgroundItem): string | null => {
  if (typeof backgroundItem === 'object') {
    return null; // Custom items are never hirelings
  }
  
  const hirelingMatch = backgroundItem.match(/^Hireling:\s*(.+)$/);
  return hirelingMatch ? hirelingMatch[1] : null;
};

// Helper function to create InventoryItem from item name (string only)
const createItemFromName = (itemName: string, scratchX: number, scratchY: number): InventoryItem | null => {
  // Check if this is a hireling item - if so, don't create a physical item
  if (itemName.startsWith('Hireling:')) {
    return null;
  }

  // Search for the item in all categories
  const allItems = [
    ...mausritterItems.weapons,
    ...mausritterItems.armor,
    ...mausritterItems.items,
    ...mausritterItems.spells
  ];
  
  const foundItem = allItems.find(item => item.name === itemName);
  if (!foundItem) {
    // Create a custom item for unknown background items
    console.log(`Creating custom item: ${itemName}`);
    return InventoryItemFactory.createCustom(itemName, { x: scratchX, y: scratchY });
  }

  // Determine item type
  let itemType: InventoryItem['type'] = 'item';
  if (mausritterItems.weapons.some(w => w.name === itemName)) itemType = 'weapon';
  else if (mausritterItems.armor.some(a => a.name === itemName)) itemType = 'armor';
  else if (mausritterItems.spells.some(s => s.name === itemName)) itemType = 'spell';

  return InventoryItemFactory.createFromMausritterData(
    foundItem,
    itemType,
    { x: scratchX, y: scratchY }
  );
};

// Helper function to create InventoryItem from background item (string or custom object)
const createItemFromBackgroundItem = (backgroundItem: BackgroundItem, scratchX: number, scratchY: number): InventoryItem | null => {
  // Handle custom items
  if (typeof backgroundItem === 'object' && backgroundItem.type === 'custom') {
    const itemType = backgroundItem.itemType === 'weapon' ? 'weapon' 
                  : backgroundItem.itemType === 'armor' ? 'armor' 
                  : 'item';
    
    return InventoryItemFactory.create({
      name: backgroundItem.name,
      type: itemType,
      damage: backgroundItem.damage,
      defense: backgroundItem.defense,
      weaponCategory: backgroundItem.weaponCategory,
      maxUsageDots: backgroundItem.maxUsageDots || 0,
      imageKey: backgroundItem.imageKey,
      size: backgroundItem.size ? 
        { 
          width: backgroundItem.size === 'large' ? 2 : 1, 
          height: backgroundItem.size === 'large' ? 2 : backgroundItem.size === 'medium' ? 1 : 1 
        } : undefined,
      scratchPosition: { x: scratchX, y: scratchY }
    });
  }

  // Handle string items - delegate to createItemFromName
  return createItemFromName(backgroundItem as string, scratchX, scratchY);
};

export const CharacterGenerationWizard: React.FC<CharacterGenerationWizardProps> = ({ isOpen, onClose }) => {
  const { addCharacter } = useCharacterStore();
  const [results, setResults] = useState<GenerationResults>({
    step: 0,
    attributes: { 
      str: [], 
      dex: [], 
      wil: [], 
      final: { str: 0, dex: 0, wil: 0 },
      original: { str: 0, dex: 0, wil: 0 }
    },
    hitPoints: 0,
    pips: 0,
    background: { name: '', items: [] },
    birthsign: { name: '', description: '' },
    coat: { color: '', pattern: '' },
    physicalDetail: '',
    name: '',
    selectedWeapon: '',
    customBirthsign: '',
    customCoat: { color: '', pattern: '' },
    customPhysicalDetail: '',
    selectedSwap: null
  });

  const rollDice = (sides: number, count: number = 1): number[] => {
    return Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
  };

  const rollAttribute = (): number[] => {
    const rolls = rollDice(6, 3);
    rolls.sort((a, b) => b - a); // Sort descending
    return rolls;
  };

  const swapStats = (stat1: 'str' | 'dex' | 'wil', stat2: 'str' | 'dex' | 'wil') => {
    const swapKey = `${stat1}-${stat2}`;
    const newResults = { ...results };
    
    // If same swap is selected, revert to original
    if (results.selectedSwap === swapKey) {
      newResults.attributes.final = { ...results.attributes.original };
      newResults.selectedSwap = null;
    } else {
      // Apply new swap from original values
      newResults.attributes.final = { ...results.attributes.original };
      const temp = newResults.attributes.final[stat1];
      newResults.attributes.final[stat1] = newResults.attributes.final[stat2];
      newResults.attributes.final[stat2] = temp;
      newResults.selectedSwap = swapKey;
    }
    
    setResults(newResults);
  };

  const resetWizard = () => {
    setResults({
      step: 0,
      attributes: { 
        str: [], 
        dex: [], 
        wil: [], 
        final: { str: 0, dex: 0, wil: 0 },
        original: { str: 0, dex: 0, wil: 0 }
      },
      hitPoints: 0,
      pips: 0,
      background: { name: '', items: [] },
      birthsign: { name: '', description: '' },
      coat: { color: '', pattern: '' },
      physicalDetail: '',
      name: '',
      selectedWeapon: '',
      customBirthsign: '',
      customCoat: { color: '', pattern: '' },
      customPhysicalDetail: '',
      selectedSwap: null
    });
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  const nextStep = () => {
    const newResults = { ...results };
    
    switch (results.step) {
      case 0: // Roll Attributes
        const strRolls = rollAttribute();
        const dexRolls = rollAttribute();
        const wilRolls = rollAttribute();
        
        const finalStats = {
          str: strRolls[0] + strRolls[1],
          dex: dexRolls[0] + dexRolls[1],
          wil: wilRolls[0] + wilRolls[1]
        };
        
        newResults.attributes = {
          str: strRolls,
          dex: dexRolls, 
          wil: wilRolls,
          final: finalStats,
          original: { ...finalStats }
        };
        newResults.selectedSwap = null;
        break;
        
      case 1: // Roll HP
        newResults.hitPoints = rollDice(6)[0];
        break;
        
      case 2: // Roll Pips
        newResults.pips = rollDice(6)[0];
        break;
        
      case 3: // Determine Background
        newResults.background = getBackground(newResults.hitPoints, newResults.pips);
        break;
        
      case 4: // Roll Birthsign
        const birthsignRoll = rollDice(6)[0] - 1;
        newResults.birthsign = generationTables.birthsigns[birthsignRoll];
        break;
        
      case 5: // Roll Coat
        const colorRoll = rollDice(6)[0] - 1;
        const patternRoll = rollDice(6)[0] - 1;
        newResults.coat = {
          color: generationTables.coatColors[colorRoll],
          pattern: generationTables.coatPatterns[patternRoll]
        };
        break;
        
      case 6: // Roll Physical Detail
        const detailRoll = rollDice(generationTables.physicalDetails.length)[0] - 1;
        newResults.physicalDetail = generationTables.physicalDetails[detailRoll];
        break;
        
      case 7: // Generate Name suggestion
        const nameRoll = rollDice(generationTables.mouseNames.length)[0] - 1;
        newResults.name = generationTables.mouseNames[nameRoll];
        break;
        
      case 8: // Weapon Selection
        // Step for weapon selection - no automatic roll
        break;
        
      case 9: // Final customization
        // Step for final customization - no automatic roll
        break;
    }
    
    newResults.step = Math.min(results.step + 1, 11);
    setResults(newResults);
  };

  const createCharacterFromResults = () => {
    // Create InventoryItems for starting items
    const startingItems: InventoryItem[] = [];
    let itemIndex = 0;
    
    // Add torches and rations (always included)
    const standardItems = ['Torch', 'Rations'];
    standardItems.forEach((itemName) => {
      const scratchX = 50 + (itemIndex % 3) * 150; // 3 columns
      const scratchY = 50 + Math.floor(itemIndex / 3) * 100; // New row every 3 items
      const inventoryItem = createItemFromName(itemName, scratchX, scratchY);
      if (inventoryItem) {
        startingItems.push(inventoryItem);
        itemIndex++;
      }
    });
    
    // Process background items - separate hirelings from physical items
    const startingHirelings = [];
    results.background.items.forEach((backgroundItem) => {
      const hirelingName = extractHirelingName(backgroundItem);
      if (hirelingName) {
        // Create a hireling with the extracted name
        const hireling = HirelingFactory.create(hirelingName);
        startingHirelings.push(hireling);
      } else {
        // Create a physical item
        const scratchX = 50 + (itemIndex % 3) * 150; // 3 columns
        const scratchY = 50 + Math.floor(itemIndex / 3) * 100; // New row every 3 items
        const inventoryItem = createItemFromBackgroundItem(backgroundItem, scratchX, scratchY);
        if (inventoryItem) {
          startingItems.push(inventoryItem);
          itemIndex++;
        }
      }
    });
    
    // Add selected weapon
    if (results.selectedWeapon) {
      const scratchX = 50 + (itemIndex % 3) * 150;
      const scratchY = 50 + Math.floor(itemIndex / 3) * 100;
      const weaponItem = createItemFromName(results.selectedWeapon, scratchX, scratchY);
      if (weaponItem) {
        startingItems.push(weaponItem);
      }
    }

    const newCharacter = CharacterFactory.createFromGeneration({
      name: results.name,
      strength: results.attributes.final.str,
      dexterity: results.attributes.final.dex,
      will: results.attributes.final.wil,
      hitPoints: results.hitPoints,
      background: results.background.name,
      birthsign: results.customBirthsign || results.birthsign.name,
      coat: `${results.customCoat.pattern || results.coat.pattern} ${results.customCoat.color || results.coat.color}`,
      look: results.customPhysicalDetail || results.physicalDetail,
      pips: results.pips,
      inventory: startingItems,
      hirelings: startingHirelings
    });
    
    addCharacter(newCharacter);
    handleClose();
  };

  if (!isOpen) return null;

  const renderStep = () => {
    switch (results.step) {
      case 0:
        return (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Welcome to Mouse Generation!</h3>
            <p className="mb-6">Let's create your brave mouse adventurer following the official Mausritter rules.</p>
            <p className="mb-6">First, we'll roll your attributes (STR, DEX, WIL) using 3d6, keeping the two highest dice for each.</p>
          </div>
        );
        
      case 1:
        return (
          <div>
            <h3 className="text-xl font-bold mb-4">Attributes Rolled!</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="font-semibold">STR</div>
                <div className="text-sm mb-2">Rolled: {results.attributes.str.join(', ')}</div>
                <div className="text-2xl font-bold">{results.attributes.final.str}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">DEX</div>
                <div className="text-sm mb-2">Rolled: {results.attributes.dex.join(', ')}</div>
                <div className="text-2xl font-bold">{results.attributes.final.dex}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">WIL</div>
                <div className="text-sm mb-2">Rolled: {results.attributes.wil.join(', ')}</div>
                <div className="text-2xl font-bold">{results.attributes.final.wil}</div>
              </div>
            </div>
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Optional: Swap Two Stats</h4>
              <p className="text-sm text-theme-text-light mb-3">You may swap any two attribute values if you wish. Click again to undo.</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => swapStats('str', 'dex')}
                  className={`px-3 py-2 text-sm border rounded transition-colors ${
                    results.selectedSwap === 'str-dex' 
                      ? 'border-theme-primary-600 bg-theme-primary-100 text-theme-primary-800'
                      : 'border-theme-primary-800 text-theme-primary-800 hover:bg-theme-primary-200'
                  }`}
                >
                  Swap STR ↔ DEX
                </button>
                <button
                  onClick={() => swapStats('str', 'wil')}
                  className={`px-3 py-2 text-sm border rounded transition-colors ${
                    results.selectedSwap === 'str-wil' 
                      ? 'border-theme-primary-600 bg-theme-primary-100 text-theme-primary-800'
                      : 'border-theme-primary-800 text-theme-primary-800 hover:bg-theme-primary-200'
                  }`}
                >
                  Swap STR ↔ WIL
                </button>
                <button
                  onClick={() => swapStats('dex', 'wil')}
                  className={`px-3 py-2 text-sm border rounded transition-colors ${
                    results.selectedSwap === 'dex-wil' 
                      ? 'border-theme-primary-600 bg-theme-primary-100 text-theme-primary-800'
                      : 'border-theme-primary-800 text-theme-primary-800 hover:bg-theme-primary-200'
                  }`}
                >
                  Swap DEX ↔ WIL
                </button>
              </div>
              {results.selectedSwap && (
                <p className="text-sm text-theme-primary-600 mt-2">
                  Current swap: <strong>{results.selectedSwap.replace('-', ' ↔ ').toUpperCase()}</strong>
                </p>
              )}
            </div>
            <p>Now let's roll for Hit Points (1d6)...</p>
          </div>
        );
        
      case 2:
        return (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Hit Points</h3>
            <div className="text-4xl font-bold mb-4">{results.hitPoints} HP</div>
            <p>Now let's roll for starting Pips (currency)...</p>
          </div>
        );
        
      case 3:
        return (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Starting Pips</h3>
            <div className="text-4xl font-bold mb-4">{results.pips} Pips</div>
            <p>Now we'll determine your background based on your HP and Pips...</p>
          </div>
        );
        
      case 4:
        return (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Background</h3>
            <div className="text-2xl font-bold mb-2">{results.background.name}</div>
            <div className="mb-4">
              <div className="font-semibold">Starting Items:</div>
              <div>{results.background.items.map(item => 
                typeof item === 'object' ? item.name : item
              ).join(', ')}</div>
            </div>
            <p>Now let's roll for your birthsign...</p>
          </div>
        );
        
      case 5:
        return (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Birthsign</h3>
            <div className="text-2xl font-bold mb-2">{results.birthsign.name}</div>
            <div className="text-sm mb-4">{results.birthsign.description}</div>
            <p>Now let's roll for your coat...</p>
          </div>
        );
        
      case 6:
        return (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Coat</h3>
            <div className="text-2xl font-bold mb-4">{results.coat.pattern} {results.coat.color}</div>
            <p>Now let's roll for a distinguishing physical detail...</p>
          </div>
        );
        
      case 7:
        return (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Physical Detail</h3>
            <div className="text-xl mb-4">{results.physicalDetail}</div>
            <p>Now let's choose your starting weapon...</p>
          </div>
        );
        
      case 8:
        return (
          <div>
            <h3 className="text-xl font-bold mb-4">Choose Your Weapon</h3>
            <p className="mb-4">Select a starting weapon for your mouse:</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {mausritterItems.weapons.map((weapon) => (
                <button
                  key={weapon.name}
                  onClick={() => setResults({ ...results, selectedWeapon: weapon.name })}
                  className={`p-3 text-sm border rounded transition-colors text-left ${
                    results.selectedWeapon === weapon.name
                      ? 'border-theme-primary-600 bg-theme-primary-100'
                      : 'border-theme-primary-800 hover:bg-theme-primary-200'
                  }`}
                >
                  <div className="font-semibold">{weapon.name}</div>
                  <div className="text-xs text-theme-text-light">
                    {weapon.damage} damage • {weapon.weaponCategory}
                  </div>
                </button>
              ))}
            </div>
            {results.selectedWeapon && (
              <p className="text-sm text-theme-text-light">
                Selected: <strong>{results.selectedWeapon}</strong>
              </p>
            )}
          </div>
        );
        
      case 9:
        return (
          <div>
            <h3 className="text-xl font-bold mb-4">Name Your Mouse</h3>
            <p className="mb-4">We've suggested a name, but you can change it:</p>
            <input
              type="text"
              value={results.name}
              onChange={(e) => setResults({ ...results, name: e.target.value })}
              className="w-full p-3 border border-theme-primary-800 rounded mb-4"
              placeholder="Enter mouse name..."
            />
          </div>
        );
        
      case 10:
        return (
          <div>
            <h3 className="text-xl font-bold mb-4">Final Customization</h3>
            <p className="mb-4">You can customize these rolled characteristics or keep them as is:</p>
            
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">Birthsign:</label>
                <select
                  value={results.customBirthsign || results.birthsign.name}
                  onChange={(e) => setResults({ ...results, customBirthsign: e.target.value })}
                  className="w-full p-2 border border-theme-primary-800 rounded"
                >
                  {generationTables.birthsigns.map((sign) => (
                    <option key={sign.name} value={sign.name}>
                      {sign.name} - {sign.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">Coat Color:</label>
                  <select
                    value={results.customCoat.color || results.coat.color}
                    onChange={(e) => setResults({ 
                      ...results, 
                      customCoat: { 
                        ...results.customCoat, 
                        color: e.target.value 
                      } 
                    })}
                    className="w-full p-2 border border-theme-primary-800 rounded"
                  >
                    {generationTables.coatColors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block font-semibold mb-2">Coat Pattern:</label>
                  <select
                    value={results.customCoat.pattern || results.coat.pattern}
                    onChange={(e) => setResults({ 
                      ...results, 
                      customCoat: { 
                        ...results.customCoat, 
                        pattern: e.target.value 
                      } 
                    })}
                    className="w-full p-2 border border-theme-primary-800 rounded"
                  >
                    {generationTables.coatPatterns.map((pattern) => (
                      <option key={pattern} value={pattern}>
                        {pattern}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Physical Detail:</label>
                <select
                  value={results.customPhysicalDetail || results.physicalDetail}
                  onChange={(e) => setResults({ ...results, customPhysicalDetail: e.target.value })}
                  className="w-full p-2 border border-theme-primary-800 rounded"
                >
                  {generationTables.physicalDetails.map((detail) => (
                    <option key={detail} value={detail}>
                      {detail}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
        
      case 11:
        return (
          <div>
            <h3 className="text-xl font-bold mb-4">Your Mouse is Complete!</h3>
            <div className="bg-theme-primary-100 p-4 rounded-lg mb-4">
              <div className="text-2xl font-bold mb-2">{results.name}</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div><strong>STR:</strong> {results.attributes.final.str}</div>
                  <div><strong>DEX:</strong> {results.attributes.final.dex}</div>
                  <div><strong>WIL:</strong> {results.attributes.final.wil}</div>
                </div>
                <div>
                  <div><strong>HP:</strong> {results.hitPoints}</div>
                  <div><strong>Pips:</strong> {results.pips}</div>
                  <div><strong>Background:</strong> {results.background.name}</div>
                </div>
              </div>
              <div className="mt-2">
                <div><strong>Birthsign:</strong> {results.customBirthsign || results.birthsign.name}</div>
                <div><strong>Coat:</strong> {results.customCoat.pattern || results.coat.pattern} {results.customCoat.color || results.coat.color}</div>
                <div><strong>Look:</strong> {results.customPhysicalDetail || results.physicalDetail}</div>
                <div><strong>Weapon:</strong> {results.selectedWeapon}</div>
                <div><strong>Items:</strong> Torch, Rations, {results.background.items.map(item => 
                  typeof item === 'object' ? item.name : item
                ).join(', ')}</div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-theme-surface rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-medium text-theme-primary-800">
              Mouse Generator
            </h2>
            <button
              onClick={handleClose}
              className="text-theme-primary-400 hover:text-theme-primary-600 text-xl"
            >
              ×
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-theme-primary-200 h-2 rounded-full">
              <div 
                className="bg-theme-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(results.step / 11) * 100}%` }}
              />
            </div>
            <div className="text-sm text-theme-text-light mt-1">
              Step {results.step + 1} of 12
            </div>
          </div>

          {renderStep()}

          <div className="flex gap-2 mt-6">
            {results.step < 11 ? (
              <button
                onClick={nextStep}
                className={`flex-1 ${
                  results.step === 8 && !results.selectedWeapon
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed px-4 py-2 rounded'
                    : 'button-primary'
                }`}
                disabled={results.step === 8 && !results.selectedWeapon}
              >
                {results.step === 0 ? 'Start Generation' : 'Next Step'}
              </button>
            ) : (
              <button
                onClick={createCharacterFromResults}
                className="button-primary flex-1"
              >
                Create Character
              </button>
            )}
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-theme-primary-800 text-theme-primary-800 rounded hover:bg-theme-primary-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};