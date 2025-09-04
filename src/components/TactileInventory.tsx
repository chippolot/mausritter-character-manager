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
import { InventoryGrid } from './InventoryGrid';
import { ScratchArea } from './ScratchArea';
import { PlacedItem, GridPosition } from '../types/inventory';
import { GRID_CONFIG, ITEM_SIZES, GRID_GAP, GRID_PADDING, GRID_OFFSET, SCRATCH_PADDING } from '../constants/inventory';

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

  const snapToGrid = useCallback((mouseX: number, mouseY: number, item: PlacedItem): GridPosition => {
    // We want to snap based on the item's top-left corner position
    // Since the mouse might be anywhere on the item, we need to estimate where the top-left corner is
    // For simplicity, assume the mouse is roughly at the center of the item during drag
    
    const { width, height } = item.size;
    const isRotated = item.rotation === 90;
    const actualWidth = isRotated ? height : width;
    const actualHeight = isRotated ? width : height;
    
    // Calculate where the top-left corner would be (assuming mouse is at item center)
    const itemTopLeftX = mouseX - (actualWidth * GRID_CONFIG.cellSize / 2);
    const itemTopLeftY = mouseY - (actualHeight * GRID_CONFIG.cellSize / 2);
    
    // Find which grid cell the top-left corner should snap to
    // Account for the gaps between cells when calculating grid position
    const cellSizeWithGap = GRID_CONFIG.cellSize + GRID_GAP;
    const gridX = Math.round(itemTopLeftX / cellSizeWithGap);
    const gridY = Math.round(itemTopLeftY / cellSizeWithGap);
    
    // Ensure the item fits within the grid bounds
    return {
      x: Math.max(0, Math.min(GRID_CONFIG.width - actualWidth, gridX)),
      y: Math.max(0, Math.min(GRID_CONFIG.height - actualHeight, gridY)),
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
      // Get the actual grid element to calculate precise positioning
      const gridElement = document.querySelector('[data-id="inventory-grid"]') as HTMLElement;
      if (!gridElement) return;
      
      const rect = gridElement.getBoundingClientRect();
      
      // Get current mouse position relative to grid
      const mouseX = event.activatorEvent.clientX + (event.delta?.x || 0);
      const mouseY = event.activatorEvent.clientY + (event.delta?.y || 0);
      
      // Convert to grid coordinates relative to the actual grid content area
      // The grid has padding, so we need to account for that
      const gridContentX = mouseX - rect.left - GRID_PADDING;
      const gridContentY = mouseY - rect.top - GRID_PADDING;
      
      const dropPosition = snapToGrid(gridContentX, gridContentY, draggedItem);

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
      
      // Get the current mouse position (where the DragOverlay is displayed)
      const currentMouseX = event.activatorEvent.clientX + (event.delta?.x || 0);
      const currentMouseY = event.activatorEvent.clientY + (event.delta?.y || 0);
      
      // Calculate item dimensions in pixels
      const { width, height } = draggedItem.size;
      const isRotated = draggedItem.rotation === 90;
      const actualWidth = isRotated ? height : width;
      const actualHeight = isRotated ? width : height;
      const itemPixelWidth = actualWidth * GRID_CONFIG.cellSize;
      const itemPixelHeight = actualHeight * GRID_CONFIG.cellSize;
      
      // The DragOverlay centers the item on the mouse cursor, so we need to calculate
      // the top-left corner position of where the item visually appears
      const itemVisualLeft = currentMouseX - (itemPixelWidth / 2);
      const itemVisualTop = currentMouseY - (itemPixelHeight / 2);
      
      // Convert to scratch area coordinate system
      // Use dynamic padding values that scale with cell size
      const paddingTop = SCRATCH_PADDING.top;
      const paddingLeft = SCRATCH_PADDING.left;
      const paddingBottom = SCRATCH_PADDING.bottom;
      const paddingRight = SCRATCH_PADDING.right;
      
      const scratchX = itemVisualLeft - rect.left - paddingLeft;
      const scratchY = itemVisualTop - rect.top - paddingTop;
      
      // Calculate the usable content area accounting for individual padding
      const contentWidth = rect.width - paddingLeft - paddingRight;
      const contentHeight = rect.height - paddingTop - paddingBottom;
      
      // Clamp the item position so it stays within the scratch area bounds
      // Ensure no part of the item extends outside the dotted border
      const clampedX = Math.max(paddingLeft, Math.min(contentWidth - itemPixelWidth, scratchX));
      const clampedY = Math.max(paddingTop, Math.min(contentHeight - itemPixelHeight, scratchY));

      updatedItem = {
        ...draggedItem,
        isInGrid: false,
        scratchPosition: { 
          x: clampedX, 
          y: clampedY 
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

  const handleDeleteItem = useCallback((itemId: string) => {
    const newItems = items.filter(item => item.id !== itemId);
    onItemsChange(newItems);
  }, [items, onItemsChange]);

  const handleToggleUsagePip = useCallback((itemId: string, pipIndex: number) => {
    const newItems = items.map(item => {
      if (item.id === itemId) {
        const currentUsage = item.usageDots || 0;
        // If clicking a pip that's already filled, reduce usage to that pip
        // If clicking an empty pip, increase usage to include that pip
        const newUsage = pipIndex < currentUsage ? pipIndex : pipIndex + 1;
        return { ...item, usageDots: newUsage };
      }
      return item;
    });
    onItemsChange(newItems);
  }, [items, onItemsChange]);

  const handlePipValueChange = useCallback((itemId: string, value: number) => {
    const newItems = items.map(item => {
      if (item.id === itemId) {
        return { ...item, pipValue: value };
      }
      return item;
    });
    onItemsChange(newItems);
  }, [items, onItemsChange]);

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


  const addNewItem = (name: string, type: PlacedItem['type'], size: 'small' | 'large' = 'small', description?: string, clearInstructions?: string, additionalProps?: Partial<PlacedItem>) => {
    const newItem: PlacedItem = {
      id: crypto.randomUUID(),
      name,
      type,
      description,
      clearInstructions,
      size: ITEM_SIZES[size],
      position: { x: 0, y: 0 },
      rotation: 0,
      isInGrid: false,
      scratchPosition: { x: 50, y: 50 },
      ...additionalProps,
    };
    onItemsChange([...items, newItem]);
  };

  return (
    <div className="card">
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => addNewItem('Sword', 'weapon', 'small', undefined, undefined, { damage: 'd6', weaponCategory: 'light', maxUsageDots: 3, usageDots: 3 })}
            className="button-primary text-sm"
          >
            + Sword (1×1)
          </button>
          <button
            onClick={() => addNewItem('Long Bow', 'weapon', 'large', undefined, undefined, { damage: 'd6', weaponCategory: 'medium', maxUsageDots: 3, usageDots: 3 })}
            className="button-primary text-sm"
          >
            + Long Bow (2×1)
          </button>
          <button
            onClick={() => addNewItem('Ration', 'item', 'small', undefined, undefined, { maxUsageDots: 3, usageDots: 3 })}
            className="button-primary text-sm"
          >
            + Ration (1×1)
          </button>
          <button
            onClick={() => addNewItem('Rope', 'item', 'large', undefined, undefined, { maxUsageDots: 6, usageDots: 6 })}
            className="button-primary text-sm"
          >
            + Rope (2×1)
          </button>
          <button
            onClick={() => addNewItem('Chain Mail', 'armor', 'large', undefined, undefined, { defense: 2, maxUsageDots: 3, usageDots: 3 })}
            className="button-primary text-sm"
          >
            + Chain Mail (2×1)
          </button>
          <button
            onClick={() => addNewItem('Pip Purse', 'pip-purse', 'small', undefined, undefined, { pipValue: 0, maxPipValue: 250 })}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-sm"
          >
            + Pip Purse (1×1)
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm text-amber-800 font-semibold mr-2">Conditions:</span>
          <button
            onClick={() => addNewItem(
              'Exhausted', 
              'condition', 
              'small', 
              'You are weary and need rest.', 
              'Sleep for 6 hours in a safe place'
            )}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
          >
            + Exhausted
          </button>
          <button
            onClick={() => addNewItem(
              'Injured', 
              'condition', 
              'small', 
              'You have suffered physical harm.', 
              'Receive medical attention or heal naturally over time'
            )}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
          >
            + Injured
          </button>
          <button
            onClick={() => addNewItem(
              'Frightened', 
              'condition', 
              'small', 
              'You are overcome with fear.', 
              'Confront your fear or find safety and comfort'
            )}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
          >
            + Frightened
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
          <InventoryGrid onGridDrop={handleGridDrop} />
          {items.filter(item => item.isInGrid && item.id !== activeItem?.id).map((item) => {
            // Position items relative to the grid element using a more direct approach
            return (
              <div
                key={item.id}
                className="absolute pointer-events-auto"
                style={{
                  // Position items to align with grid cells, accounting for gaps
                  top: GRID_OFFSET.top + item.position.y * GRID_CONFIG.cellSize + item.position.y * GRID_GAP,
                  left: GRID_OFFSET.left + item.position.x * GRID_CONFIG.cellSize + item.position.x * GRID_GAP,
                }}
              >
                <ItemCard
                  item={item}
                  onRotate={handleRotateItem}
                  onDelete={handleDeleteItem}
                  onToggleUsagePip={handleToggleUsagePip}
                  onPipValueChange={handlePipValueChange}
                  isDragging={false}
                />
              </div>
            );
          })}
        </div>

        <div className="relative">
          <ScratchArea />
          <div className="absolute top-20 left-4 pointer-events-none">
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
                    onDelete={handleDeleteItem}
                    onToggleUsagePip={handleToggleUsagePip}
                    onPipValueChange={handlePipValueChange}
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
              onDelete={() => {}}
              onToggleUsagePip={() => {}}
              onPipValueChange={() => {}}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};