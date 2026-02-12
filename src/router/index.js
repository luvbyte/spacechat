import { createRouter, createWebHistory } from "vue-router";

import Home from "@/views/Home.vue";
import Space from "@/views/Space.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", component: Home, name: "home" },
    {
      path: "/space/:name",
      component: Space,
      name: "space"
    }
  ]
});

export default router;
