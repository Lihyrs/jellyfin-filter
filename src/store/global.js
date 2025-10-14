// stores/global.js
import { defineStore } from "pinia";
import { defaultSettings } from "../comm/defaultSettings";

export const useGlobalStore = defineStore("global", {
	state: () => ({
		settings: { ...defaultSettings },
	}),
	actions: {
		setUser(user) {
			this.user = user;
		},
		setTheme(theme) {
			this.theme = theme;
		},
	},
});
