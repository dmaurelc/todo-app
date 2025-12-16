import { createApp } from "vue";
import Vue3Toastify, { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import "./style.css";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(router);
app.use(Vue3Toastify, {
  autoClose: 3000,
  position: toast.POSITION.BOTTOM_RIGHT,
});

app.mount("#app");
