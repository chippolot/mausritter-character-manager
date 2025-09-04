import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface ScratchAreaProps {
  onScratchDrop: (position: { x: number; y: number }) => void;
}

export const ScratchArea: React.FC<ScratchAreaProps> = ({ onScratchDrop }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'scratch-area',
  });

  const handleAreaClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 48; // Center the item (assuming ~96px width)
    const y = e.clientY - rect.top - 48;  // Center the item (assuming ~96px height)
    
    onScratchDrop({ x: Math.max(0, x), y: Math.max(0, y) });
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl text-amber-800 mb-4 font-bold">Scratch Area</h2>
      
      <div
        ref={setNodeRef}
        data-id="scratch-area"
        className={`
          relative min-h-[300px] border-2 border-dashed border-amber-600 rounded-lg
          bg-amber-25 bg-opacity-20 p-4 cursor-pointer
          transition-colors duration-200
          ${isOver ? 'bg-yellow-100 border-yellow-500' : 'hover:bg-amber-50'}
        `}
        onClick={handleAreaClick}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-amber-600 text-center">
            <div className="text-lg font-semibold">Drop items here to organize</div>
            <div className="text-sm mt-2">Items placed here don't snap to any grid</div>
            <div className="text-sm">Click anywhere to place selected items</div>
          </div>
        </div>
      </div>
    </div>
  );
};