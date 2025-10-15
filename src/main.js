import { createApp } from "vue";
import { createPinia } from "pinia";

import logger from "./plugins/logger";
import persistedState from "./plugins/persistedstate";
import "./styles/style.css";
import App from "./App.vue";

const pinia = createPinia();
const app = createApp(App);

pinia.use(persistedState);

app.use(logger);
app.use(pinia);

const appElement = document.createElement("div");
document.body.appendChild(appElement);
app.mount(appElement);
