import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface ScratchAreaProps {}

export const ScratchArea: React.FC<ScratchAreaProps> = () => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'scratch-area',
  });


  return (
    <div className="mt-8">
      <h2 className="text-xl text-amber-800 mb-4 font-bold">Scratch Area</h2>
      
      <div
        ref={setNodeRef}
        data-id="scratch-area"
        className={`
          relative min-h-[300px] border-2 border-dashed border-amber-600 rounded-lg
          bg-amber-25 bg-opacity-20 p-4
          transition-colors duration-200
          ${isOver ? 'bg-yellow-100 border-yellow-500' : 'hover:bg-amber-50'}
        `}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-amber-600 text-center">
            <div className="text-lg font-semibold">Drop items here to organize</div>
            <div className="text-sm mt-2">Items placed here don't snap to any grid</div>
          </div>
        </div>
      </div>
    </div>
  );
};