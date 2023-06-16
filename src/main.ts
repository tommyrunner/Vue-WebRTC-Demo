import { createApp } from "vue";
import "./style.less";
import App from "./App.vue";
import pinia from "./pinia";

// 懒人方法的动态适配
let timer: NodeJS.Timeout | null = null;
window.addEventListener("resize", () => {
  if (timer !== null) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => {
    window.location.href = window.location.href;
  }, 1000);
});

createApp(App).use(pinia).mount("#app");
