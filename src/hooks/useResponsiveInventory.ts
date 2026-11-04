import { useState, useEffect, useMemo } from 'react';

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

  return useMemo(() => {
    const cellSize = isMobile ? MOBILE_CELL_SIZE : CELL_SIZE;

    return {
      isMobile,
      cellSize,
      GRID_CONFIG: {
        width: 5,
        height: 2,
        cellSize,
      },
      // Responsive offsets that scale with cell size
      GRID_OFFSET: {
        top: Math.round(cellSize * 0.52),
        left: Math.round(cellSize * 0.14),
      },
      SCRATCH_PADDING: {
        top: Math.round(cellSize * -0.58),
        left: Math.round(cellSize * -0.09),
        bottom: Math.round(cellSize * 1.22),
        right: Math.round(cellSize * 0.25),
      },
      GRID_GAP: 2,
      GRID_PADDING: isMobile ? 8 : 16, // Smaller padding on mobile
    };
  }, [isMobile]);
};
