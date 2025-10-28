import { useCallback } from "react";

interface TouchFeedbackOptions {
  type?: "light" | "medium" | "heavy" | "selection" | "impact";
  duration?: number;
}

export function useTouchFeedback() {
  const triggerHaptic = useCallback((options: TouchFeedbackOptions = {}) => {
    const { type = "light" } = options;

    // Check if the browser supports vibration API
    if ("vibrate" in navigator) {
      let pattern: number | number[];

      switch (type) {
        case "light":
          pattern = 10;
          break;
        case "medium":
          pattern = 20;
          break;
        case "heavy":
          pattern = 40;
          break;
        case "selection":
          pattern = [5, 10, 5];
          break;
        case "impact":
          pattern = [10, 50, 10];
          break;
        default:
          pattern = 10;
      }

      navigator.vibrate(pattern);
    }

    // For future Capacitor integration
    // if (window.Capacitor?.isNativePlatform()) {
    //   import('@capacitor/haptics').then(({ Haptics, ImpactStyle }) => {
    //     switch (type) {
    //       case "light":
    //         Haptics.impact({ style: ImpactStyle.Light });
    //         break;
    //       case "medium":
    //         Haptics.impact({ style: ImpactStyle.Medium });
    //         break;
    //       case "heavy":
    //         Haptics.impact({ style: ImpactStyle.Heavy });
    //         break;
    //       case "selection":
    //         Haptics.selectionStart();
    //         break;
    //       default:
    //         Haptics.impact({ style: ImpactStyle.Light });
    //     }
    //   });
    // }
  }, []);

  const triggerTouch = useCallback(() => {
    triggerHaptic({ type: "light" });
  }, [triggerHaptic]);

  const triggerPress = useCallback(() => {
    triggerHaptic({ type: "medium" });
  }, [triggerHaptic]);

  const triggerSuccess = useCallback(() => {
    triggerHaptic({ type: "selection" });
  }, [triggerHaptic]);

  const triggerError = useCallback(() => {
    triggerHaptic({ type: "impact" });
  }, [triggerHaptic]);

  return {
    triggerHaptic,
    triggerTouch,
    triggerPress,
    triggerSuccess,
    triggerError,
  };
}