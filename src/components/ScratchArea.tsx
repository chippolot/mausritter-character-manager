import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useResponsiveInventory } from '../hooks/useResponsiveInventory';

interface ScratchAreaProps {
  onMobileScratchClick?: () => void;
}

export const ScratchArea: React.FC<ScratchAreaProps> = ({ onMobileScratchClick }) => {
  const { isMobile } = useResponsiveInventory();
  const { isOver, setNodeRef } = useDroppable({
    id: 'scratch-area',
  });


  const handleClick = () => {
    if (isMobile && onMobileScratchClick) {
      onMobileScratchClick();
    }
  };

  return (
    <div className="mt-8">
      <div
        ref={setNodeRef}
        data-id="scratch-area"
        onClick={handleClick}
        className={`
          relative min-h-[300px] border-2 border-dashed border-theme-primary-600 rounded-lg
          bg-theme-primary-100 bg-opacity-20 p-4
          transition-colors duration-200
          ${isOver ? 'bg-theme-primary-200 border-theme-primary-500' : 'hover:bg-theme-primary-50'}
          ${isMobile ? 'cursor-pointer' : ''}
        `}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-theme-primary-600 text-center">
            <div className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
              {isMobile ? 'Tap to move selected item here' : 'Drop items here to organize'}
            </div>
            <div className="text-sm mt-2">Items placed here don't snap to any grid</div>
          </div>
        </div>
      </div>
    </div>
  );
};