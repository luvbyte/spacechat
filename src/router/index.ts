import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from "vue-router";

import Home from "@/views/Home.vue";
import Space from "@/views/Space.vue";

const router = createRouter({
  history:
    window.location.protocol === "file:" ||
    window.location.hostname === "app.spacechat"
      ? window.location.hostname === "app.spacechat"
        ? createMemoryHistory("/")
        : createWebHashHistory()
      : createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/index.html", redirect: "/" },
    { path: "/", component: Home, name: "home" },
    {
      path: "/space/:name",
      component: Space,
      name: "space",
    },
  ],
});

export default router;
