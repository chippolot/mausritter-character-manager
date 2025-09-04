import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { GRID_CONFIG } from '../types/inventory';

interface InventoryGridProps {
  onGridDrop: (position: { x: number; y: number }) => void;
}

export const InventoryGridNew: React.FC<InventoryGridProps> = ({ onGridDrop }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'inventory-grid',
  });

  const handleCellClick = (x: number, y: number) => {
    onGridDrop({ x, y });
  };

  const getSectionStyle = (x: number, y: number) => {
    let sectionClass = '';
    let borderClass = 'border border-dashed border-amber-400';
    
    if (x === 0) {
      // Paws column (left)
      sectionClass = 'bg-red-50 bg-opacity-40';
    } else if (x === 1) {
      // Body column (middle)
      sectionClass = 'bg-blue-50 bg-opacity-40';
    } else {
      // General inventory (right columns)
      sectionClass = 'bg-amber-50 bg-opacity-30';
    }
    
    return `${borderClass} ${sectionClass}`;
  };

  const getCellLabel = (x: number, y: number) => {
    if (x === 0) {
      // Paws column - use shorter labels
      return y === 0 ? 'Main' : 'Off';
    } else if (x === 1) {
      // Body column
      return 'Body';
    } else {
      // General inventory - number sequentially
      // Top row: cells 2,3 become 1,2
      // Bottom row: cells 2,3 become 3,4, etc.
      const inventoryIndex = (y * 3) + (x - 2) + 1;
      return inventoryIndex.toString();
    }
  };

  const getCellLabelStyle = (x: number, y: number) => {
    if (x <= 1) {
      // Paws and Body - small text at top, absolute positioned
      return 'absolute top-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap';
    } else {
      // General inventory - large centered text, absolute positioned
      return 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg text-gray-400 font-semibold';
    }
  };

  const renderGridCells = () => {
    const cells = [];
    
    for (let y = 0; y < GRID_CONFIG.height; y++) {
      for (let x = 0; x < GRID_CONFIG.width; x++) {
        cells.push(
          <div
            key={`${x}-${y}`}
            className={`
              ${getSectionStyle(x, y)}
              cursor-pointer transition-colors duration-200 relative
              hover:bg-amber-100 hover:border-amber-600
              ${isOver ? 'bg-yellow-100 border-yellow-500' : ''}
            `}
            style={{
              width: GRID_CONFIG.cellSize,
              height: GRID_CONFIG.cellSize,
              gridColumn: x + 1,
              gridRow: y + 1,
            }}
            onClick={() => handleCellClick(x, y)}
          >
            <span className={`${getCellLabelStyle(x, y)} pointer-events-none select-none`}>
              {getCellLabel(x, y)}
            </span>
          </div>
        );
      }
    }
    
    return cells;
  };

  return (
    <div className="relative">
      <h2 className="text-xl text-amber-800 mb-4 font-bold">Inventory</h2>
      
      {/* Section labels */}
      <div className="mb-2 flex" style={{
        paddingLeft: '16px', // Match grid padding
        gap: '2px',
      }}>
        <div className="text-center text-sm font-semibold text-amber-700" style={{width: GRID_CONFIG.cellSize}}>
          Paws
        </div>
        <div className="text-center text-sm font-semibold text-amber-700" style={{width: GRID_CONFIG.cellSize}}>
          Body
        </div>
        <div className="text-center text-sm font-semibold text-amber-700" style={{width: GRID_CONFIG.cellSize * 3 + 4}}>
          General Inventory
        </div>
      </div>
      
      <div
        ref={setNodeRef}
        data-id="inventory-grid"
        className={`
          relative border-2 border-amber-800 rounded-lg p-4 bg-white
          transition-colors duration-200
          ${isOver ? 'bg-yellow-50 border-yellow-600' : ''}
        `}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_CONFIG.width}, ${GRID_CONFIG.cellSize}px)`,
          gridTemplateRows: `repeat(${GRID_CONFIG.height}, ${GRID_CONFIG.cellSize}px)`,
          gap: '2px',
        }}
      >
        {renderGridCells()}
      </div>
      
      <div className="mt-2 text-sm text-amber-700">
        <p>• <span className="text-red-700">Paws:</span> Weapons & tools you can use quickly</p>
        <p>• <span className="text-blue-700">Body:</span> Armor & clothing worn on body</p>
        <p>• <span className="text-amber-700">General:</span> Everything else you carry</p>
        <p>• Right-click items to rotate • Items snap to grid when dropped</p>
      </div>
    </div>
  );
};