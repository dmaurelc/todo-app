import { createRouter, createWebHistory } from "vue-router";
import AuthView from "../views/AuthView.vue";
import DashboardView from "../views/DashboardView.vue";
import { supabase } from "../lib/supabase";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/dashboard",
    },
    {
      path: "/auth",
      name: "auth",
      component: AuthView,
      meta: { requiresGuest: true },
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: DashboardView,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isGuest = localStorage.getItem("isGuest") === "true";

  if (to.meta.requiresAuth && !session && !isGuest) {
    next("/auth"); // Bloquear solo si no hay sesión Y no es invitado
  } else if (to.meta.requiresGuest && (session || isGuest)) {
    next("/dashboard"); // Redirigir al dashboard si ya hay sesión o es invitado
  } else {
    next();
  }
});

export default router;
