import { ref } from "vue";

/**
 * Manages sad/warning emoji overlay state with automatic timers
 */
export function useEmojiOverlay() {
  const showSadEmoji = ref(false);
  const showWarningEmoji = ref(false);

  /**
   * Triggers sad emoji overlay for 2 seconds
   */
  const triggerSad = () => {
    showSadEmoji.value = true;
    setTimeout(() => {
      showSadEmoji.value = false;
    }, 2000);
  };

  /**
   * Triggers warning emoji overlay for 2 seconds
   */
  const triggerWarning = () => {
    showWarningEmoji.value = true;
    setTimeout(() => {
      showWarningEmoji.value = false;
    }, 2000);
  };

  return {
    showSadEmoji,
    showWarningEmoji,
    triggerSad,
    triggerWarning
  };
}
