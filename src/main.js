import { createApp } from "vue";
import Vue3Toastify, { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { storage } from "./composables/use-storage-adapter.js";
import { useCategories } from "./composables/use-categories.js";

const app = createApp(App);

app.use(router);
app.use(Vue3Toastify, {
  autoClose: 3000,
  position: toast.POSITION.BOTTOM_RIGHT,
});

app.mount("#app");

// Eager initialization: load categories before first render.
// useCategories() is called here so all downstream components get
// pre-populated data on first access (no async race on first open).
useCategories();

storage.migrateLegacyAll(["todos", "darkMode"]).catch((err) => {
  console.warn("[boot] legacy migration skipped:", err);
});
