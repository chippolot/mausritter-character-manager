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

  const renderGridCells = () => {
    const cells = [];
    
    for (let y = 0; y < GRID_CONFIG.height; y++) {
      for (let x = 0; x < GRID_CONFIG.width; x++) {
        cells.push(
          <div
            key={`${x}-${y}`}
            className={`
              border border-dashed border-amber-400 bg-amber-50 bg-opacity-30
              cursor-pointer transition-colors duration-200
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
          />
        );
      }
    }
    
    return cells;
  };

  return (
    <div className="relative">
      <h2 className="text-xl text-amber-800 mb-4 font-bold">Inventory Grid (5×2)</h2>
      
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
        <p>• Drag items here to organize them</p>
        <p>• Right-click items to rotate</p>
        <p>• Items snap to grid when dropped</p>
      </div>
    </div>
  );
};