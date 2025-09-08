import React, { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { ItemCard } from './ItemCard';
import { InventoryGrid } from './InventoryGrid';
import { ScratchArea } from './ScratchArea';
import { ItemAddForm } from './ItemAddForm';
import { InventoryItem, GridPosition } from '../types/inventory';
import { useMausritterItems, MausritterItemData } from '../hooks/useMausritterItems';
import { useResponsiveInventory } from '../hooks/useResponsiveInventory';
import { InventoryItemFactory } from '../factories';

interface TactileInventoryProps {
  items: InventoryItem[];
  onItemsChange: (items: InventoryItem[]) => void;
}

export const TactileInventory: React.FC<TactileInventoryProps> = ({
  items,
  onItemsChange,
}) => {
  // Safe fallback for undefined items
  const safeItems = items || [];
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);
  const [pendingItem, setPendingItem] = useState<InventoryItem | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null); // For mobile item selection
  const { items: itemsData } = useMausritterItems();
  const { 
    isMobile, 
    cellSize,
    GRID_CONFIG, 
    GRID_GAP, 
    GRID_PADDING, 
    GRID_OFFSET, 
    SCRATCH_PADDING 
  } = useResponsiveInventory();

  // Utility function to clamp scratch position within bounds
  const clampScratchPosition = useCallback((
    item: InventoryItem, 
    position: { x: number; y: number },
    scratchBounds?: { width: number; height: number }
  ): { x: number; y: number } => {
    // Use provided bounds or try to get current scratch area bounds
    let bounds = scratchBounds;
    if (!bounds) {
      const scratchElement = document.querySelector('[data-id="scratch-area"]') as HTMLElement;
      if (scratchElement) {
        const rect = scratchElement.getBoundingClientRect();
        bounds = { width: rect.width, height: rect.height };
      } else {
        // Fallback bounds if scratch area isn't available yet
        bounds = { width: isMobile ? 400 : 600, height: 300 };
      }
    }

    // Calculate item pixel dimensions
    const { width, height } = item.size;
    const isRotated = item.rotation === 90;
    const actualWidth = isRotated ? height : width;
    const actualHeight = isRotated ? width : height;
    const itemPixelWidth = actualWidth * cellSize;
    const itemPixelHeight = actualHeight * cellSize;

    // Use the same padding logic as the original drag handler
    const paddingTop = SCRATCH_PADDING.top;
    const paddingLeft = SCRATCH_PADDING.left;
    const paddingBottom = SCRATCH_PADDING.bottom;
    const paddingRight = SCRATCH_PADDING.right;
    
    // Calculate the usable content area accounting for individual padding
    const contentWidth = bounds.width - paddingLeft - paddingRight;
    const contentHeight = bounds.height - paddingTop - paddingBottom;
    
    // Clamp the item position so it stays within the scratch area bounds
    // This matches the original: Math.max(paddingLeft, Math.min(contentWidth - itemPixelWidth, scratchX))
    const clampedX = Math.max(paddingLeft, Math.min(contentWidth - itemPixelWidth, position.x));
    const clampedY = Math.max(paddingTop, Math.min(contentHeight - itemPixelHeight, position.y));

    return { x: clampedX, y: clampedY };
  }, [cellSize, SCRATCH_PADDING, isMobile]);

  // Effect to clamp existing items' scratch positions on mount/update
  useEffect(() => {
    let hasChanges = false;
    const clampedItems = safeItems.map(item => {
      if (!item.isInGrid && item.scratchPosition) {
        const clampedPosition = clampScratchPosition(item, item.scratchPosition);
        if (clampedPosition.x !== item.scratchPosition.x || clampedPosition.y !== item.scratchPosition.y) {
          hasChanges = true;
          return { ...item, scratchPosition: clampedPosition };
        }
      }
      return item;
    });
    
    if (hasChanges) {
      onItemsChange(clampedItems);
    }
  }, [safeItems, clampScratchPosition, onItemsChange]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isMobile ? 20 : 8, // Longer distance on mobile to prevent accidental drags
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: isMobile ? 100 : 250, // Shorter delay on mobile 
        tolerance: 15, // More tolerance for movement during delay
      },
    })
  );

  const canPlaceItem = useCallback((item: InventoryItem, gridPos: GridPosition): boolean => {
    const { width, height } = item.size;
    const isRotated = item.rotation === 90;
    const actualWidth = isRotated ? height : width;
    const actualHeight = isRotated ? width : height;

    if (gridPos.x + actualWidth > GRID_CONFIG.width || gridPos.y + actualHeight > GRID_CONFIG.height) {
      return false;
    }

    const occupiedCells = new Set<string>();
    safeItems.forEach((existingItem) => {
      if (existingItem.id === item.id || !existingItem.isInGrid) return;
      
      const placedIsRotated = existingItem.rotation === 90;
      const placedWidth = placedIsRotated ? existingItem.size.height : existingItem.size.width;
      const placedHeight = placedIsRotated ? existingItem.size.width : existingItem.size.height;
      
      for (let x = existingItem.position.x; x < existingItem.position.x + placedWidth; x++) {
        for (let y = existingItem.position.y; y < existingItem.position.y + placedHeight; y++) {
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
  }, [safeItems]);

  const snapToGrid = useCallback((itemTopLeftX: number, itemTopLeftY: number, item: InventoryItem): GridPosition => {
    // We want to snap based on the item's top-left corner position
    // The itemTopLeftX and itemTopLeftY should already be the top-left corner coordinates
    
    const { width, height } = item.size;
    const isRotated = item.rotation === 90;
    const actualWidth = isRotated ? height : width;
    const actualHeight = isRotated ? width : height;
    
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
      
      // Calculate the offset between the mouse click and the item's visual position
      if (!item.isInGrid && item.scratchPosition) {
        // For items in scratch area, calculate offset from their current position
        const scratchElement = document.querySelector('[data-id="scratch-area"]') as HTMLElement;
        if (scratchElement) {
          const rect = scratchElement.getBoundingClientRect();
          const itemVisualLeft = rect.left + SCRATCH_PADDING.left + item.scratchPosition.x;
          const itemVisualTop = rect.top + SCRATCH_PADDING.top + item.scratchPosition.y;
          
          setDragOffset({
            x: event.activatorEvent.clientX - itemVisualLeft,
            y: event.activatorEvent.clientY - itemVisualTop
          });
        }
      } else if (item.isInGrid) {
        // For items in grid, calculate offset from their grid position
        const gridElement = document.querySelector('[data-id="inventory-grid"]') as HTMLElement;
        if (gridElement) {
          const rect = gridElement.getBoundingClientRect();
          // For grid items, the GRID_OFFSET includes the section labels height and padding,
          // but the grid element rect starts after the labels, so we need to account for this
          const itemVisualLeft = rect.left + GRID_PADDING + item.position.x * (GRID_CONFIG.cellSize + GRID_GAP);
          const itemVisualTop = rect.top + GRID_PADDING + item.position.y * (GRID_CONFIG.cellSize + GRID_GAP);
          
          setDragOffset({
            x: event.activatorEvent.clientX - itemVisualLeft,
            y: event.activatorEvent.clientY - itemVisualTop
          });
        }
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);
    setDragOffset(null);

    const draggedItem = safeItems.find((item) => item.id === active.id);
    if (!draggedItem) return;

    if (!over) {
      // If dropped outside any drop zone, keep item where it was
      return;
    }

    let updatedItem: InventoryItem;

    if (over.id === 'inventory-grid') {
      // Get the actual grid element to calculate precise positioning
      const gridElement = document.querySelector('[data-id="inventory-grid"]') as HTMLElement;
      if (!gridElement || !dragOffset) return;
      
      const rect = gridElement.getBoundingClientRect();
      
      // Get current mouse position relative to grid
      const mouseX = event.activatorEvent.clientX + (event.delta?.x || 0);
      const mouseY = event.activatorEvent.clientY + (event.delta?.y || 0);
      
      // Use the drag offset to calculate where the top-left corner should be
      const itemTopLeftX = mouseX - dragOffset.x;
      const itemTopLeftY = mouseY - dragOffset.y;
      
      // Convert to grid coordinates relative to the actual grid content area
      const gridContentX = itemTopLeftX - rect.left - GRID_PADDING;
      const gridContentY = itemTopLeftY - rect.top - GRID_PADDING;
      
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
      if (!scratchElement || !dragOffset) return;
      
      const rect = scratchElement.getBoundingClientRect();
      
      // Get the current mouse position
      const currentMouseX = event.activatorEvent.clientX + (event.delta?.x || 0);
      const currentMouseY = event.activatorEvent.clientY + (event.delta?.y || 0);
      
      // Use the drag offset to calculate where the top-left corner should be
      const itemVisualLeft = currentMouseX - dragOffset.x;
      const itemVisualTop = currentMouseY - dragOffset.y;
      
      // Convert to scratch area coordinate system
      const scratchX = itemVisualLeft - rect.left - SCRATCH_PADDING.left;
      const scratchY = itemVisualTop - rect.top - SCRATCH_PADDING.top;
      
      // Use the helper function to clamp the position
      const clampedPosition = clampScratchPosition(
        draggedItem, 
        { x: scratchX, y: scratchY },
        { width: rect.width, height: rect.height }
      );

      updatedItem = {
        ...draggedItem,
        isInGrid: false,
        scratchPosition: clampedPosition,
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
        } else if (item.scratchPosition) {
          // For items in scratch area, trigger a "resnap" after rotation
          const scratchElement = document.querySelector('[data-id="scratch-area"]') as HTMLElement;
          if (scratchElement) {
            const rect = scratchElement.getBoundingClientRect();
            
            // Clamp the current position to ensure the rotated item fits
            const clampedPosition = clampScratchPosition(
              rotatedItem,
              item.scratchPosition,
              { width: rect.width, height: rect.height }
            );
            
            return {
              ...rotatedItem,
              scratchPosition: clampedPosition
            };
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

  // Mobile-specific item handling
  const handleMobileItemClick = useCallback((itemId: string) => {
    if (isMobile) {
      setSelectedItem(selectedItem === itemId ? null : itemId);
    }
  }, [isMobile, selectedItem]);

  const handleMobileItemMove = useCallback((itemId: string, targetPosition: GridPosition) => {
    if (!isMobile || !selectedItem) return;
    
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (canPlaceItem(item, targetPosition)) {
      const updatedItem = {
        ...item,
        position: targetPosition,
        isInGrid: true,
        scratchPosition: undefined,
      };
      const newItems = items.map((i) => i.id === itemId ? updatedItem : i);
      onItemsChange(newItems);
      setSelectedItem(null);
    }
  }, [isMobile, selectedItem, items, canPlaceItem, onItemsChange]);

  const handleMobileItemToScratch = useCallback(() => {
    if (!isMobile || !selectedItem) return;
    
    const item = items.find(i => i.id === selectedItem);
    if (!item) return;

    // Move item to scratch area at a clamped position
    const clampedPosition = clampScratchPosition(item, { x: 50, y: 50 });
    const updatedItem = {
      ...item,
      isInGrid: false,
      scratchPosition: clampedPosition,
    };
    const newItems = items.map((i) => i.id === selectedItem ? updatedItem : i);
    onItemsChange(newItems);
    setSelectedItem(null);
  }, [isMobile, selectedItem, items, onItemsChange, clampScratchPosition]);

  const handleItemSelect = useCallback((itemData: MausritterItemData, type: InventoryItem['type']) => {
    const newItem = InventoryItemFactory.createFromMausritterData(itemData, type, { x: 50, y: 50 });
    // Clamp the scratch position to ensure it's within bounds
    const clampedPosition = clampScratchPosition(newItem, newItem.scratchPosition);
    const clampedItem = { ...newItem, scratchPosition: clampedPosition };
    onItemsChange([...safeItems, clampedItem]);
  }, [safeItems, onItemsChange, clampScratchPosition]);

  const addPipPurse = useCallback(() => {
    const purseData = itemsData.pipPurse;
    const newItem = InventoryItemFactory.createFromMausritterData(purseData, 'pip-purse', { x: 50, y: 50 });
    // Clamp the scratch position to ensure it's within bounds
    const clampedPosition = clampScratchPosition(newItem, newItem.scratchPosition);
    const clampedItem = { ...newItem, scratchPosition: clampedPosition };
    onItemsChange([...safeItems, clampedItem]);
  }, [safeItems, onItemsChange, itemsData.pipPurse, clampScratchPosition]);

  return (
    <div className="card inventory-container">
      <h2 className={`font-medium text-theme-primary-800 mb-4 ${isMobile ? 'text-xl' : 'text-2xl'}`}>Inventory</h2>
      
      {selectedItem && isMobile && (
        <div className="mb-4 p-2 bg-theme-primary-100 rounded-lg border border-theme-primary-300">
          <p className="text-sm text-theme-primary-800">
            Item selected. Tap a grid cell to move it there, or tap the item again to deselect.
          </p>
        </div>
      )}
      
      <ItemAddForm 
        onItemSelect={handleItemSelect} 
        onAddPipPurse={addPipPurse}
      />

      <DndContext
        sensors={isMobile ? [] : sensors} // Disable drag and drop on mobile
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="relative mb-8">
          <InventoryGrid 
            onGridDrop={handleGridDrop}
            onMobileGridClick={isMobile ? (pos) => selectedItem && handleMobileItemMove(selectedItem, pos) : undefined}
          />
          {safeItems.filter(item => item.isInGrid && item.id !== activeItem?.id).map((item) => {
            // Position items relative to the grid element using responsive offsets
            return (
              <div
                key={item.id}
                className="absolute pointer-events-auto"
                style={{
                  // Position items to align with grid cells, accounting for gaps and responsive sizing
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
                  onMobileClick={handleMobileItemClick}
                  isSelected={selectedItem === item.id}
                />
              </div>
            );
          })}
        </div>

        <div className="relative">
          <ScratchArea onMobileScratchClick={handleMobileItemToScratch} />
          <div className="absolute top-20 left-4 pointer-events-none">
            {safeItems.filter(item => !item.isInGrid && item.id !== activeItem?.id).map((item) => {
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
                    onMobileClick={handleMobileItemClick}
                    isSelected={selectedItem === item.id}
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
              onMobileClick={() => {}}
              isSelected={false}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};