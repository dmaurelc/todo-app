import { ref, computed } from "vue";

const isDarkMode = ref(localStorage.getItem("darkMode") === "true");

export function useAuth() {
  const loading = ref(false);

  const applyTheme = () => {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Initial apply
  applyTheme();

  // Dark mode toggle
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
    localStorage.setItem("darkMode", isDarkMode.value);
    applyTheme();
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
