import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useResponsiveInventory } from '../hooks/useResponsiveInventory';

interface InventoryGridProps {
  onGridDrop: (position: { x: number; y: number }) => void;
  onMobileGridClick?: (position: { x: number; y: number }) => void;
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({ onGridDrop, onMobileGridClick }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'inventory-grid',
  });
  const { GRID_CONFIG, isMobile } = useResponsiveInventory();

  const handleCellClick = (x: number, y: number) => {
    if (isMobile && onMobileGridClick) {
      onMobileGridClick({ x, y });
    } else {
      onGridDrop({ x, y });
    }
  };

  const getSectionStyle = (x: number, y: number) => {
    let sectionClass = '';
    let borderClass = 'border border-dashed border-theme-primary-400';
    
    // All sections use the same background color
    sectionClass = 'bg-theme-primary-100 bg-opacity-30';
    
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
      // Pack - number sequentially
      // Top row: cells 2,3 become 1,2
      // Bottom row: cells 2,3 become 3,4, etc.
      const inventoryIndex = (y * 3) + (x - 2) + 1;
      return inventoryIndex.toString();
    }
  };

  const getCellLabelStyle = (x: number, y: number) => {
    if (x <= 1) {
      // Paws and Body - small text at top, absolute positioned
      const textSize = isMobile ? 'text-xs' : 'text-xs';
      return `absolute top-1 left-1/2 transform -translate-x-1/2 ${textSize} text-gray-500 whitespace-nowrap`;
    } else {
      // Pack - large centered text, absolute positioned
      const textSize = isMobile ? 'text-sm' : 'text-lg';
      return `absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${textSize} text-gray-400 font-semibold`;
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
              hover:bg-theme-primary-100 hover:border-theme-primary-600
              ${isOver ? 'bg-theme-primary-200 border-theme-primary-500' : ''}
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
      
      {/* Section labels */}
      <div className={`mb-3 ${isMobile ? 'flex-col space-y-2' : 'flex'}`} style={{
        paddingLeft: isMobile ? '8px' : '16px', // Match grid padding
        gap: isMobile ? '0' : '2px',
      }}>
        {isMobile ? (
          // Mobile layout - stacked labels
          <>
            <div className="text-center">
              <div className="text-xs font-semibold text-theme-primary-700">Carried | Worn | Pack (1-6)</div>
              <div className="text-xs text-theme-primary-600">Touch items to select, long press for options</div>
            </div>
          </>
        ) : (
          // Desktop layout - inline labels
          <>
            <div className="text-center" style={{width: GRID_CONFIG.cellSize}}>
              <div className="text-sm font-semibold text-theme-primary-700">Carried</div>
              <div className="text-xs text-theme-primary-600">Ready to use.</div>
            </div>
            <div className="text-center" style={{width: GRID_CONFIG.cellSize}}>
              <div className="text-sm font-semibold text-theme-primary-700">Worn</div>
              <div className="text-xs text-theme-primary-600">Quick to ready.</div>
            </div>
            <div className="text-center" style={{width: GRID_CONFIG.cellSize * 3 + 4}}>
              <div className="text-sm font-semibold text-theme-primary-700">Pack</div>
              <div className="text-xs text-theme-primary-600">Takes time to ready. During combat, requires an action to retrieve.</div>
            </div>
          </>
        )}
      </div>
      
      <div
        ref={setNodeRef}
        data-id="inventory-grid"
        className={`
          relative border-2 border-theme-primary-800 rounded-lg bg-theme-surface
          transition-colors duration-200 overflow-x-auto
          ${isOver ? 'bg-theme-primary-100 border-theme-primary-600' : ''}
          ${isMobile ? 'p-2' : 'p-4'}
        `}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_CONFIG.width}, ${GRID_CONFIG.cellSize}px)`,
          gridTemplateRows: `repeat(${GRID_CONFIG.height}, ${GRID_CONFIG.cellSize}px)`,
          gap: '2px',
          minWidth: isMobile ? `${GRID_CONFIG.width * GRID_CONFIG.cellSize + 4 * (GRID_CONFIG.width - 1)}px` : 'auto',
        }}
      >
        {renderGridCells()}
      </div>
      
      <div className="mt-2 text-sm text-theme-primary-700">
        {isMobile ? (
          <p>• Long press items for options • Tap to select/move</p>
        ) : (
          <p>• Right-click items to rotate • Items snap to grid when dropped</p>
        )}
      </div>
    </div>
  );
};