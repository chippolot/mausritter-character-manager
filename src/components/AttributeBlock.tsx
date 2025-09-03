import React from 'react';
import { Character } from '../stores/characterStore-simple';

interface AttributeBlockProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const AttributeBlock: React.FC<AttributeBlockProps> = ({
  character,
  onUpdate,
}) => {
  const handleAttributeChange = (field: keyof Character) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onUpdate({ [field]: parseInt(e.target.value) || 0 });
  };

  const AttributeField: React.FC<{
    label: string;
    value: number;
    field: keyof Character;
    max?: number;
  }> = ({ label, value, field, max = 20 }) => (
    <div className="text-center">
      <label className="block text-sm font-semibold text-amber-800 mb-2">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={handleAttributeChange(field)}
        className="input-field w-16 h-16 text-center text-xl font-bold"
        min="0"
        max={max}
      />
    </div>
  );

  return (
    <div className="card">
      <h2 className="text-xl text-amber-800 mb-4 text-center" style={{fontFamily: 'Cinzel, serif'}}>
        Attributes
      </h2>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <AttributeField
          label="STR"
          value={character.strength}
          field="strength"
        />
        <AttributeField
          label="DEX"
          value={character.dexterity}
          field="dexterity"
        />
        <AttributeField
          label="WIL"
          value={character.will}
          field="will"
        />
      </div>

      <div className="border-t border-amber-800 pt-4">
        <div className="text-center">
          <label className="block text-sm font-semibold text-amber-800 mb-2">
            Hit Points
          </label>
          <div className="flex items-center justify-center space-x-2">
            <input
              type="number"
              value={character.hitPoints}
              onChange={handleAttributeChange('hitPoints')}
              className="input-field w-16 h-12 text-center text-lg font-bold"
              min="0"
              max={character.maxHitPoints}
            />
            <span className="text-amber-800 font-bold">/</span>
            <input
              type="number"
              value={character.maxHitPoints}
              onChange={handleAttributeChange('maxHitPoints')}
              className="input-field w-16 h-12 text-center text-lg font-bold"
              min="1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};