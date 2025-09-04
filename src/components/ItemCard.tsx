import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { PlacedItem, GRID_CONFIG } from '../types/inventory';

interface ItemCardProps {
  item: PlacedItem;
  onRotate: (id: string) => void;
  isDragging?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onRotate, isDragging }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: dndKitDragging
  } = useDraggable({
    id: item.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const getRotationTransform = () => {
    return `rotate(${item.rotation}deg)`;
  };

  const getItemDimensions = () => {
    const { width, height } = item.size;
    const isRotated = item.rotation === 90;
    
    // When rotated, swap width and height
    if (isRotated) {
      return {
        width: height * GRID_CONFIG.cellSize,
        height: width * GRID_CONFIG.cellSize,
      };
    }
    
    return {
      width: width * GRID_CONFIG.cellSize,
      height: height * GRID_CONFIG.cellSize,
    };
  };

  const dimensions = getItemDimensions();

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onRotate(item.id);
  };

  const isActive = dndKitDragging || isDragging;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        width: dimensions.width,
        height: dimensions.height,
        zIndex: isActive ? 1000 : 1,
      }}
      {...listeners}
      {...attributes}
      onContextMenu={handleRightClick}
      className={`
        item-card absolute cursor-grab active:cursor-grabbing
        bg-white border-2 border-amber-800 rounded-lg
        flex flex-col items-center justify-center p-2 select-none
        hover:border-yellow-600
        ${isActive ? 'dragging opacity-90' : ''}
        ${item.type === 'weapon' ? 'bg-red-50' : ''}
        ${item.type === 'armor' ? 'bg-blue-50' : ''}
        ${item.type === 'spell' ? 'bg-purple-50' : ''}
        ${item.type === 'item' ? 'bg-green-50' : ''}
      `}
    >
      <div className="text-center pointer-events-none">
        <div className="font-semibold text-stone-800 text-xs leading-tight">
          {item.name}
        </div>
        <div className="text-xs text-amber-800 capitalize mt-1">
          {item.type}
        </div>
        {item.usageDots && (
          <div className="text-xs text-amber-800 mt-1">
            {item.usageDots}/{item.maxUsageDots}
          </div>
        )}
      </div>
      
      {item.size.width === 2 && (
        <div className="absolute top-1 right-1 text-xs text-amber-600">
          2x1
        </div>
      )}
    </div>
  );
};