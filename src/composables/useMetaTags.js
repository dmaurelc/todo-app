import { ref, computed } from "vue";

/**
 * Manages favicon and document title based on dark mode state
 */
export function useMetaTags(isDarkMode) {
  /**
   * Updates favicon and document title based on current mode
   */
  const updateMeta = () => {
    const link =
      document.querySelector("link[rel~='icon']") ||
      document.createElement("link");
    link.type = "image/svg+xml";
    link.rel = "icon";

    document.title = "✅ ToDo App ✅";
    link.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✅</text></svg>`;
    
    document.getElementsByTagName("head")[0].appendChild(link);
  };

  // Auto-update when dark mode changes
  const watchDarkMode = (callback) => {
    const unwatch = computed(() => isDarkMode.value);
    // Return a cleanup function
    return () => {
      // Computed handles cleanup automatically
    };
  };

  return {
    updateMeta,
    watchDarkMode
  };
}
