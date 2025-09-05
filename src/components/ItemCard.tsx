import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { PlacedItem } from '../types/inventory';
import { GRID_CONFIG } from '../constants/inventory';
import { useItemImages } from '../hooks/useItemImages';

interface ItemCardProps {
  item: PlacedItem;
  onRotate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleUsagePip?: (itemId: string, pipIndex: number) => void;
  onPipValueChange?: (itemId: string, value: number) => void;
  isDragging?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onRotate, onDelete, onToggleUsagePip, onPipValueChange, isDragging }) => {
  const { getImageUrl } = useItemImages();
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

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Delete "${item.name}"?`)) {
      onDelete(item.id);
    }
  };

  const handlePipClick = (e: React.MouseEvent, pipIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleUsagePip) {
      onToggleUsagePip(item.id, pipIndex);
    }
  };

  const handlePipValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    const maxValue = item.maxPipValue || 250;
    const clampedValue = Math.max(0, Math.min(maxValue, value));
    if (onPipValueChange) {
      onPipValueChange(item.id, clampedValue);
    }
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
        border-2 border-amber-800 rounded-lg
        flex flex-col p-2 select-none
        hover:border-yellow-600 group
        ${isActive ? 'dragging opacity-90' : ''}
        ${item.type === 'condition' ? 'bg-red-100' : 
          'bg-white'}
      `}
    >
      <div className="text-left pointer-events-none w-full h-full flex flex-col">
        {item.type === 'condition' ? (
          <>
            {/* Condition card layout */}
            <div className="font-semibold text-stone-800 text-s leading-tight mb-1">
              {item.name}
            </div>
            <hr/>
            {item.description && (
              <div className="text-xs text-stone-600 italic flex-1 mb-2 leading-tight">
                {item.description}
              </div>
            )}
            {item.clearInstructions && (
              <div className="text-xs text-stone-800 mt-auto">
                <div className="font-semibold mb-1">Clear:</div>
                <div className="leading-tight">{item.clearInstructions}</div>
              </div>
            )}
          </>
        ) : item.type === 'pip-purse' ? (
          <>
            {/* Pip purse layout */}
            <div className="font-semibold text-stone-800 text-s leading-tight mb-1">
              {item.name}
            </div>
            <hr className="my-1 border-stone-300"/>
            
            {/* Pip value display and input */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-lg font-bold text-amber-700 mb-2">
                {item.pipValue || 0} pips
              </div>
              <input
                type="number"
                min="0"
                max={item.maxPipValue || 250}
                value={item.pipValue || 0}
                onChange={handlePipValueChange}
                className="w-16 h-8 text-center text-sm border border-amber-300 rounded bg-white pointer-events-auto focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </>
        ) : (
          <>
            {/* Regular item layout */}
            <div className="font-semibold text-stone-800 text-s leading-tight">
              {item.name}
            </div>
            <hr className="my-1 border-stone-300"/>
            
            {/* Main content area with relative positioning */}
            <div className="flex-1 relative">
              {/* Optional image background */}
              {(item.imageUrl || item.imageKey) && (
                <div 
                  className="absolute inset-0 bg-contain bg-center bg-no-repeat rounded opacity-50"
                  style={{ 
                    backgroundImage: `url(${item.imageUrl || getImageUrl(item.imageKey!)})` 
                  }}
                />
              )}
              
              {/* Usage pips in upper-left (3 column grid) */}
              {item.maxUsageDots && (
                <div className="absolute top-1 left-1 grid grid-cols-3 gap-0.5">
                  {Array.from({ length: item.maxUsageDots || 3 }, (_, index) => (
                    <button
                      key={index}
                      onClick={(e) => handlePipClick(e, index)}
                      className={`w-2 h-2 rounded-full border pointer-events-auto ${
                        index < (item.usageDots || 0)
                          ? 'bg-amber-600 border-amber-700'
                          : 'bg-white border-stone-400'
                      }`}
                      title={`Usage pip ${index + 1}`}
                    />
                  ))}
                </div>
              )}
              
              {/* Damage/Defense in upper-right */}
              {(item.damage || item.defense || item.armor) && (
                <div className="absolute top-1 right-1 text-xs font-semibold text-stone-800 bg-white bg-opacity-80 px-1 rounded border-2 border-solid">
                  {item.damage && item.damage}
                  {item.defense && `${item.defense} def`}
                  {!item.defense && item.armor && `${item.armor} def`}
                </div>
              )}
              
              {/* Weapon category in lower-left */}
              {item.weaponCategory && (
                <div className="absolute bottom-1 left-1 text-xs font-bold text-stone-700 bg-white bg-opacity-50 px-1 rounded">
                  {item.weaponCategory.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Delete button - appears on hover */}
      <button
        onClick={handleDelete}
        className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                   text-amber-600 hover:text-red-600 w-4 h-4 
                   flex items-center justify-center pointer-events-auto"
        title="Delete item"
      >
        <RiDeleteBin6Line size={12} />
      </button>
    </div>
  );
};