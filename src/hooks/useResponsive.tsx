import { useState, useEffect } from "react";

interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
  xl: number;
}

const breakpoints: BreakpointConfig = {
  mobile: 640,   // sm
  tablet: 768,   // md
  desktop: 1024, // lg
  xl: 1280,      // xl
};

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isXL: boolean;
  width: number;
  height: number;
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isXL: false,
        width: 1024,
        height: 768,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
      isMobile: width < breakpoints.tablet,
      isTablet: width >= breakpoints.tablet && width < breakpoints.desktop,
      isDesktop: width >= breakpoints.desktop && width < breakpoints.xl,
      isXL: width >= breakpoints.xl,
      width,
      height,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setState({
        isMobile: width < breakpoints.tablet,
        isTablet: width >= breakpoints.tablet && width < breakpoints.desktop,
        isDesktop: width >= breakpoints.desktop && width < breakpoints.xl,
        isXL: width >= breakpoints.xl,
        width,
        height,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return state;
}

// Legacy hook for backward compatibility
export function useIsMobile(): boolean {
  const { isMobile } = useResponsive();
  return isMobile;
}