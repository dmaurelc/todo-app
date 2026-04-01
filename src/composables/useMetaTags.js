import { ref, computed } from "vue";

/**
 * Manages document title
 */
export function useMetaTags(isDarkMode) {
  /**
   * Updates document title
   */
  const updateMeta = () => {
    document.title = "ToDo App - Organiza tu día";
  };

  // Auto-update when dark mode changes (kept for compatibility, but does nothing)
  const watchDarkMode = (callback) => {
    const unwatch = computed(() => isDarkMode.value);
    return () => {
      // Computed handles cleanup automatically
    };
  };

  return {
    updateMeta,
    watchDarkMode,
  };
}
