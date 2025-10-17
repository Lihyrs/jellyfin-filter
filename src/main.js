// main.js
import { createApp } from "vue";
import { createPinia } from "pinia";

import logger from "./plugins/logger";
import persistedState from "./plugins/persistedstate";
import "./styles/style.scss";
import AppWrapper from "./AppWrapper.vue";

const pinia = createPinia();
const app = createApp(AppWrapper);

// 注册持久化插件
pinia.use(persistedState());

app.use(pinia);
app.use(logger);

const appElement = document.createElement("div");
document.body.appendChild(appElement);
app.mount(appElement);
