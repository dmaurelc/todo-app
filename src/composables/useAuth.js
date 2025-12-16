import { ref } from "vue";
import { supabase } from "../lib/supabase";

const user = ref(null);
const isGuest = ref(localStorage.getItem("isGuest") === "true");

export function useAuth() {
  const loading = ref(true);

  const getSession = async () => {
    console.log("getSession called. isGuest:", isGuest.value);
    if (isGuest.value) {
      user.value = { id: "guest", email: "Invitado" };
      loading.value = false;
      return { user: user.value };
    }

    const { data } = await supabase.auth.getSession();
    user.value = data.session?.user ?? null;
    loading.value = false;
    return data.session;
  };

  const loginAsGuest = () => {
    console.log("loginAsGuest called");
    isGuest.value = true;
    localStorage.setItem("isGuest", "true");
    user.value = { id: "guest", email: "Invitado" };
    console.log("Guest set. User:", user.value);
  };

  const logout = async () => {
    if (isGuest.value) {
      isGuest.value = false;
      localStorage.removeItem("isGuest");
      user.value = null;
    } else {
      try {
        const { error } = await supabase.auth.signOut();
        // Ignore "AuthSessionMissingError" as it means we are already logged out
        if (error && error.message !== "Auth session missing!") {
          console.warn("Supabase signOut warning:", error.message);
        }
      } catch (error) {
        // Fallback for unexpected errors, but don't block
      } finally {
        user.value = null;
        // Force cleanup of Supabase tokens from localStorage
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("sb-")) {
            localStorage.removeItem(key);
          }
        });
      }
    }
  };

  const handleAuthStateChange = () => {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (!isGuest.value) {
        user.value = session?.user ?? null;
      }
      loading.value = false;
    });
  };

  return {
    user,
    isGuest,
    loading,
    getSession,
    loginAsGuest,
    logout,
    handleAuthStateChange,
  };
}
