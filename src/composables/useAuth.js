import { ref, computed } from "vue";

const isDarkMode = ref(localStorage.getItem("darkMode") === "true");

export function useAuth() {
  const loading = ref(false);

  // Dark mode toggle (Vecna Mode)
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
    localStorage.setItem("darkMode", isDarkMode.value);
  };

  // Simulate user for compatibility (optional, can be removed if not used)
  const user = computed(() => ({ id: "local", email: "Usuario Local" }));

  return {
    user,
    isGuest: isDarkMode,
    isDarkMode,
    loading,
    toggleDarkMode,
  };
}
