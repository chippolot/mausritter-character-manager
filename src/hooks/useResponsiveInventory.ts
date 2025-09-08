import { useState, useEffect } from 'react';

const CELL_SIZE = 128; // Base cell size in pixels for desktop
const MOBILE_CELL_SIZE = 64; // Smaller cell size for mobile devices

export const useResponsiveInventory = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Check both screen width and touch capability
      const isMobileScreen = window.innerWidth < 768; // md breakpoint
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(isMobileScreen || isTouchDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const cellSize = isMobile ? MOBILE_CELL_SIZE : CELL_SIZE;
  
  // Calculate responsive grid config
  const RESPONSIVE_GRID_CONFIG = {
    width: 5,
    height: 2,
    cellSize
  } as const;

  // Responsive offsets that scale with cell size
  const RESPONSIVE_GRID_OFFSET = {
    top: Math.round(cellSize * 0.52),
    left: Math.round(cellSize * 0.14),
  };

  const RESPONSIVE_SCRATCH_PADDING = {
    top: Math.round(cellSize * -0.58), // Adjusted for removed header text
    left: Math.round(cellSize * -0.09),
    bottom: Math.round(cellSize * 1.22),
    right: Math.round(cellSize * 0.25),
  };

  return {
    isMobile,
    cellSize,
    GRID_CONFIG: RESPONSIVE_GRID_CONFIG,
    GRID_OFFSET: RESPONSIVE_GRID_OFFSET,
    SCRATCH_PADDING: RESPONSIVE_SCRATCH_PADDING,
    GRID_GAP: 2,
    GRID_PADDING: isMobile ? 8 : 16, // Smaller padding on mobile
  };
};