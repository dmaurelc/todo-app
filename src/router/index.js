import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "../views/DashboardView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: DashboardView,
    },
    // Catch-all for SPA routing - prevents 404 on refresh
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

export default router;
