import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { ItemCard } from './ItemCard';
import { InventoryGridNew } from './InventoryGridNew';
import { ScratchArea } from './ScratchArea';
import { PlacedItem, GRID_CONFIG, ITEM_SIZES, GridPosition } from '../types/inventory';

interface TactileInventoryProps {
  items: PlacedItem[];
  onItemsChange: (items: PlacedItem[]) => void;
}

export const TactileInventory: React.FC<TactileInventoryProps> = ({
  items,
  onItemsChange,
}) => {
  const [activeItem, setActiveItem] = useState<PlacedItem | null>(null);
  const [pendingItem, setPendingItem] = useState<PlacedItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const canPlaceItem = useCallback((item: PlacedItem, gridPos: GridPosition): boolean => {
    const { width, height } = item.size;
    const isRotated = item.rotation === 90;
    const actualWidth = isRotated ? height : width;
    const actualHeight = isRotated ? width : height;

    if (gridPos.x + actualWidth > GRID_CONFIG.width || gridPos.y + actualHeight > GRID_CONFIG.height) {
      return false;
    }

    const occupiedCells = new Set<string>();
    items.forEach((placedItem) => {
      if (placedItem.id === item.id || !placedItem.isInGrid) return;
      
      const placedIsRotated = placedItem.rotation === 90;
      const placedWidth = placedIsRotated ? placedItem.size.height : placedItem.size.width;
      const placedHeight = placedIsRotated ? placedItem.size.width : placedItem.size.height;
      
      for (let x = placedItem.position.x; x < placedItem.position.x + placedWidth; x++) {
        for (let y = placedItem.position.y; y < placedItem.position.y + placedHeight; y++) {
          occupiedCells.add(`${x}-${y}`);
        }
      }
    });

    for (let x = gridPos.x; x < gridPos.x + actualWidth; x++) {
      for (let y = gridPos.y; y < gridPos.y + actualHeight; y++) {
        if (occupiedCells.has(`${x}-${y}`)) {
          return false;
        }
      }
    }

    return true;
  }, [items]);

  const snapToGrid = useCallback((x: number, y: number): GridPosition => {
    return {
      x: Math.max(0, Math.min(GRID_CONFIG.width - 1, Math.round(x / GRID_CONFIG.cellSize))),
      y: Math.max(0, Math.min(GRID_CONFIG.height - 1, Math.round(y / GRID_CONFIG.cellSize))),
    };
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const item = items.find((item) => item.id === event.active.id);
    if (item) {
      setActiveItem(item);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    const draggedItem = items.find((item) => item.id === active.id);
    if (!draggedItem) return;

    if (!over) {
      // If dropped outside any drop zone, keep item where it was
      return;
    }

    let updatedItem: PlacedItem;

    if (over.id === 'inventory-grid') {
      // Get the current position of the dragged item (where it visually appears)
      const gridElement = document.querySelector('[data-id="inventory-grid"]') as HTMLElement;
      if (!gridElement) return;
      
      const rect = gridElement.getBoundingClientRect();
      
      // Calculate position based on where the item currently is + delta
      let currentX, currentY;
      if (draggedItem.isInGrid) {
        currentX = draggedItem.position.x * GRID_CONFIG.cellSize;
        currentY = draggedItem.position.y * GRID_CONFIG.cellSize;
      } else if (draggedItem.scratchPosition) {
        // Coming from scratch area - use current mouse position
        const mouseX = event.activatorEvent.clientX;
        const mouseY = event.activatorEvent.clientY;
        currentX = mouseX - rect.left - 16;
        currentY = mouseY - rect.top - 64;
      } else {
        return;
      }

      // Add the drag delta
      const finalX = currentX + (event.delta?.x || 0);
      const finalY = currentY + (event.delta?.y || 0);
      
      const dropPosition = snapToGrid(finalX, finalY);

      if (canPlaceItem(draggedItem, dropPosition)) {
        updatedItem = {
          ...draggedItem,
          position: dropPosition,
          isInGrid: true,
          scratchPosition: undefined,
        };
      } else {
        // If can't place in grid, keep where it was
        return;
      }
    } else if (over.id === 'scratch-area') {
      const scratchElement = document.querySelector('[data-id="scratch-area"]') as HTMLElement;
      if (!scratchElement) return;
      
      const rect = scratchElement.getBoundingClientRect();
      
      // Calculate final position based on current position + drag delta
      let currentX, currentY;
      if (draggedItem.isInGrid) {
        // Coming from grid - use mouse position
        const mouseX = event.activatorEvent.clientX;
        const mouseY = event.activatorEvent.clientY;
        currentX = mouseX - rect.left;
        currentY = mouseY - rect.top;
      } else if (draggedItem.scratchPosition) {
        currentX = draggedItem.scratchPosition.x;
        currentY = draggedItem.scratchPosition.y;
      } else {
        return;
      }

      // Add drag delta and center the item
      const finalX = currentX + (event.delta?.x || 0) - 40;
      const finalY = currentY + (event.delta?.y || 0) - 40;

      updatedItem = {
        ...draggedItem,
        isInGrid: false,
        scratchPosition: { 
          x: Math.max(0, finalX), 
          y: Math.max(0, finalY) 
        },
      };
    } else {
      return;
    }

    const newItems = items.map((item) =>
      item.id === draggedItem.id ? updatedItem : item
    );
    onItemsChange(newItems);
  };

  const handleRotateItem = useCallback((itemId: string) => {
    const newItems = items.map((item) => {
      if (item.id === itemId) {
        // Toggle between 0° and 90°
        const newRotation = item.rotation === 0 ? 90 : 0;
        const rotatedItem = { ...item, rotation: newRotation as 0 | 90 };

        // If item is in grid, check if it can fit in the rotated orientation
        if (item.isInGrid) {
          if (!canPlaceItem(rotatedItem, item.position)) {
            // Try to find a new position where it can fit after rotation
            const { width, height } = item.size;
            const isNewRotated = newRotation === 90;
            const newWidth = isNewRotated ? height : width;
            const newHeight = isNewRotated ? width : height;

            // Try positions starting from current position and expanding outward
            for (let y = 0; y <= GRID_CONFIG.height - newHeight; y++) {
              for (let x = 0; x <= GRID_CONFIG.width - newWidth; x++) {
                const testPosition = { x, y };
                if (canPlaceItem(rotatedItem, testPosition)) {
                  return { ...rotatedItem, position: testPosition };
                }
              }
            }
            
            // If no position found, don't rotate
            return item;
          }
        }

        return rotatedItem;
      }
      return item;
    });
    onItemsChange(newItems);
  }, [items, canPlaceItem, onItemsChange]);

  const handleGridDrop = useCallback((position: GridPosition) => {
    if (pendingItem && canPlaceItem(pendingItem, position)) {
      const updatedItem = {
        ...pendingItem,
        position,
        isInGrid: true,
        scratchPosition: undefined,
      };
      const newItems = items.map((item) =>
        item.id === pendingItem.id ? updatedItem : item
      );
      onItemsChange(newItems);
    }
    setPendingItem(null);
  }, [pendingItem, canPlaceItem, items, onItemsChange]);

  const handleScratchDrop = useCallback((position: { x: number; y: number }) => {
    if (pendingItem) {
      const updatedItem = {
        ...pendingItem,
        isInGrid: false,
        scratchPosition: position,
      };
      const newItems = items.map((item) =>
        item.id === pendingItem.id ? updatedItem : item
      );
      onItemsChange(newItems);
    }
    setPendingItem(null);
  }, [pendingItem, items, onItemsChange]);

  const addNewItem = (name: string, type: PlacedItem['type'], size: 'small' | 'large' = 'small') => {
    const newItem: PlacedItem = {
      id: crypto.randomUUID(),
      name,
      type,
      size: ITEM_SIZES[size],
      position: { x: 0, y: 0 },
      rotation: 0,
      isInGrid: false,
      scratchPosition: { x: 50, y: 50 },
    };
    onItemsChange([...items, newItem]);
  };

  const renderItemCards = () => {
    return items.map((item) => {
      const style: React.CSSProperties = {
        position: 'absolute',
        pointerEvents: 'auto',
      };
      
      if (item.isInGrid) {
        style.left = item.position.x * GRID_CONFIG.cellSize;
        style.top = item.position.y * GRID_CONFIG.cellSize;
      } else if (item.scratchPosition) {
        style.left = item.scratchPosition.x;
        style.top = item.scratchPosition.y;
      }

      return (
        <div key={item.id} style={style}>
          <ItemCard
            item={item}
            onRotate={handleRotateItem}
            isDragging={activeItem?.id === item.id}
          />
        </div>
      );
    });
  };

  return (
    <div className="card">
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => addNewItem('Sword', 'weapon', 'small')}
            className="button-primary text-sm"
          >
            + Sword (1×1)
          </button>
          <button
            onClick={() => addNewItem('Long Bow', 'weapon', 'large')}
            className="button-primary text-sm"
          >
            + Long Bow (2×1)
          </button>
          <button
            onClick={() => addNewItem('Ration', 'item', 'small')}
            className="button-primary text-sm"
          >
            + Ration (1×1)
          </button>
          <button
            onClick={() => addNewItem('Rope', 'item', 'large')}
            className="button-primary text-sm"
          >
            + Rope (2×1)
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="relative mb-8">
          <InventoryGridNew onGridDrop={handleGridDrop} />
          <div className="absolute top-16 left-4 pointer-events-none">
            {items.filter(item => item.isInGrid && item.id !== activeItem?.id).map((item) => {
              const style: React.CSSProperties = {
                position: 'absolute',
                left: item.position.x * GRID_CONFIG.cellSize,
                top: item.position.y * GRID_CONFIG.cellSize,
                pointerEvents: 'auto',
              };

              return (
                <div key={item.id} style={style}>
                  <ItemCard
                    item={item}
                    onRotate={handleRotateItem}
                    isDragging={false}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <ScratchArea onScratchDrop={handleScratchDrop} />
          <div className="absolute top-16 left-4 pointer-events-none">
            {items.filter(item => !item.isInGrid && item.id !== activeItem?.id).map((item) => {
              if (!item.scratchPosition) return null;
              
              const style: React.CSSProperties = {
                position: 'absolute',
                left: item.scratchPosition.x,
                top: item.scratchPosition.y,
                pointerEvents: 'auto',
              };

              return (
                <div key={item.id} style={style}>
                  <ItemCard
                    item={item}
                    onRotate={handleRotateItem}
                    isDragging={false}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <DragOverlay>
          {activeItem ? (
            <ItemCard
              item={activeItem}
              onRotate={() => {}}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};