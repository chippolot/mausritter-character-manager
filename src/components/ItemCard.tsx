import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { InventoryItem } from '../types/inventory';
import { useItemImages } from '../hooks/useItemImages';
import { useResponsiveInventory } from '../hooks/useResponsiveInventory';

interface ItemCardProps {
  item: InventoryItem;
  onRotate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleUsagePip?: (itemId: string, pipIndex: number) => void;
  onPipValueChange?: (itemId: string, value: number) => void;
  isDragging?: boolean;
  onMobileClick?: (id: string) => void;
  isSelected?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({ 
  item, 
  onRotate, 
  onDelete, 
  onToggleUsagePip, 
  onPipValueChange, 
  isDragging, 
  onMobileClick,
  isSelected 
}) => {
  const { getImageUrl } = useItemImages();
  const { isMobile, GRID_CONFIG } = useResponsiveInventory();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: dndKitDragging
  } = useDraggable({
    id: item.id,
    disabled: isMobile, // Disable dragging on mobile
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

  const getItemSizeClass = () => {
    const { width, height } = item.size;
    if (width === 1 && height === 1) return 'item-1x1';
    if (width === 2 && height === 1) return 'item-2x1';
    if (width === 1 && height === 2) return 'item-1x2';
    if (width === 2 && height === 2) return 'item-2x2';
    return 'item-1x1'; // fallback
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

  const handleMobileClick = (e: React.MouseEvent) => {
    if (isMobile && onMobileClick) {
      e.preventDefault();
      e.stopPropagation();
      onMobileClick(item.id);
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
        transform: `${CSS.Translate.toString(transform)} ${getRotationTransform()}`,
      }}
      {...(!isMobile ? listeners : {})} // Only attach drag listeners on non-mobile
      {...(!isMobile ? attributes : {})}
      onContextMenu={isMobile ? undefined : handleRightClick}
      onClick={handleMobileClick}
      className={`
        item-card absolute select-none
        border-2 rounded-lg flex flex-col
        hover:border-theme-primary-600 group transition-all duration-200
        ${getItemSizeClass()}
        ${isActive ? 'dragging opacity-90' : ''}
        ${isMobile ? 'cursor-pointer touch-manipulation' : 'cursor-grab active:cursor-grabbing'}
        ${isSelected ? 'border-theme-primary-600 bg-theme-primary-100' : 'border-theme-primary-800'}
        ${item.type === 'condition' ? 'bg-red-100' : 
          isSelected ? 'bg-theme-primary-100' : 'bg-white'}
        ${isMobile ? 'p-1' : 'p-2'}
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
              
              {/* Pip value input */}
              <div className="flex flex-col items-center justify-end h-full relative z-10 pb-1">
                <input
                  type="number"
                  min="0"
                  max={item.maxPipValue || 250}
                  value={item.pipValue || 0}
                  onChange={handlePipValueChange}
                  className="w-16 h-8 text-center text-sm border border-theme-primary-300 rounded bg-theme-surface pointer-events-auto focus:outline-none focus:ring-2 focus:ring-theme-primary-500"
                />
              </div>
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
                      className={`w-3 h-3 rounded-full border pointer-events-auto ${
                        index < (item.usageDots || 0)
                          ? 'bg-theme-primary-600 border-theme-primary-700'
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
                   text-theme-primary-600 hover:text-theme-error-600 w-4 h-4 
                   flex items-center justify-center pointer-events-auto"
        title="Delete item"
      >
        <RiDeleteBin6Line size={12} />
      </button>
    </div>
  );
};