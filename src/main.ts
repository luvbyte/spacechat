import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import "./style.css";

const app = createApp(App);

app.use(router);

const mountApp = () => app.mount("#app");

if (window.location.hostname === "app.spacechat") {
  router.replace({ name: "home" }).then(mountApp);
} else {
  mountApp();
}
