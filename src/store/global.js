// stores/global.js
import { defineStore } from "pinia";
import defaultSettings from "../comm/defaultSettings.js";

export const useGlobalStore = defineStore("global", {
	state: () => ({
		settings: { ...defaultSettings },
		web: {
			boxSelector: "",
			codeSelector: "",
			loctionHref: "",
		},
	}),

	persist: {
		paths: ["settings"],
	},

	getters: {
		// 获取特定设置项
		getSetting: (state) => (key) => {
			return state.settings[key];
		},

		// 获取所有设置
		getAllSettings: (state) => {
			return { ...state.settings };
		},
	},

	actions: {
		// 更新单个设置项
		updateSetting(key, value) {
			if (key in this.settings) {
				this.settings[key] = value;
				console.log(`设置已更新: ${key} = ${value}`);
			} else {
				console.warn(`未知的设置项: ${key}`);
			}
		},

		// 批量更新设置
		updateSettings(newSettings) {
			Object.keys(newSettings).forEach((key) => {
				if (key in this.settings) {
					this.settings[key] = newSettings[key];
				}
			});
			console.log("批量设置已更新:", newSettings);
		},

		// 重置为默认设置
		resetToDefault() {
			this.settings = { ...defaultSettings };
			console.log("设置已重置为默认值");
		},

		// 导入设置
		importSettings(importedSettings) {
			const validSettings = {};
			Object.keys(importedSettings).forEach((key) => {
				if (key in this.settings) {
					validSettings[key] = importedSettings[key];
				}
			});
			this.settings = { ...this.settings, ...validSettings };
			console.log("设置已导入:", validSettings);
		},

		// 导出设置
		exportSettings() {
			return { ...this.settings };
		},
	},
});
