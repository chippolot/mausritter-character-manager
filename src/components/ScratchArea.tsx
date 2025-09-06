import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface ScratchAreaProps {}

export const ScratchArea: React.FC<ScratchAreaProps> = () => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'scratch-area',
  });


  return (
    <div className="mt-8">
      <h2 className="text-2xl font-medium text-theme-primary-800 mb-4">Scratch Area</h2>
      
      <div
        ref={setNodeRef}
        data-id="scratch-area"
        className={`
          relative min-h-[300px] border-2 border-dashed border-theme-primary-600 rounded-lg
          bg-theme-primary-100 bg-opacity-20 p-4
          transition-colors duration-200
          ${isOver ? 'bg-theme-primary-200 border-theme-primary-500' : 'hover:bg-theme-primary-50'}
        `}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-theme-primary-600 text-center">
            <div className="text-lg font-semibold">Drop items here to organize</div>
            <div className="text-sm mt-2">Items placed here don't snap to any grid</div>
          </div>
        </div>
      </div>
    </div>
  );
};