import { ref, computed } from "vue";
import { storage, isTauriRuntime } from "./use-storage-adapter.js";

const isDarkMode = ref(false);
let initialized = false;

export function useAuth() {
  const loading = ref(false);

  const applyTheme = () => {
    if (isDarkMode.value) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const loadDarkMode = async () => {
    try {
      const v = await storage.get("darkMode");
      isDarkMode.value = v === true;
    } catch (err) {
      console.warn("[auth] darkMode load failed, default false:", err);
      isDarkMode.value = false;
    }
    applyTheme();
    initialized = true;
  };

  // Lazy first-time bootstrap: do not block component mount, but ensure
  // theme is applied before first paint. Callers can `await useAuth().loadDarkMode()`
  // if they need to read the value synchronously after.
  if (!initialized) {
    loadDarkMode();
  }

  const toggleDarkMode = async () => {
    isDarkMode.value = !isDarkMode.value;
    applyTheme();
    try {
      await storage.set("darkMode", isDarkMode.value);
    } catch (err) {
      // Revert on write failure so UI matches persisted state.
      isDarkMode.value = !isDarkMode.value;
      applyTheme();
      console.error("[auth] darkMode persist failed:", err);
    }
  };

  const user = computed(() => ({ id: "local", email: "Usuario Local" }));

  return {
    user,
    isGuest: isDarkMode,
    isDarkMode,
    loading,
    toggleDarkMode,
    loadDarkMode,
    isTauri: isTauriRuntime,
  };
}
