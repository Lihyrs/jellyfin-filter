// stores/global.js
import { defineStore } from "pinia";
import defaultSettings from "../comm/defaultSettings.js";
import logger from "../lib/Logger.js";

/**
 * @typedef {Object} WebState
 * @property {string} boxSelector - 作品容器选择器
 * @property {string} codeSelector - 代码选择器
 * @property {string} loctionHref - 当前页面URL
 */

/**
 * @typedef {Object} JellyfinState
 * @property {Array} originItem - 原始项目列表
 * @property {Set<string>} codes - 代码集合
 */

/**
 * 全局状态管理 Store
 * @class GlobalStore
 */

export const useGlobalStore = defineStore("global", {
	state: () => ({
		/** @type {import("../comm/defaultSettings.js").defaultSettings} */
		settings: { ...defaultSettings },
		/** @type {WebState} */
		web: {
			loctionHref: "",
			codes: new Set(),
			boxes: new Map(),
		},
		/** @type {JellyfinState} */
		jellyfin: {
			originItem: [],
			codes: new Set(),
		},
		forTest: {
			a: new Map(),
			b: new Set(),
		},
	}),

	persist: {
		paths: ["settings", "jellyfin"],
		debug: true,
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
				logger.info(`设置已更新: ${key} = ${value}`);
			} else {
				logger.warn(`未知的设置项: ${key}`);
			}
		},

		// 批量更新设置
		updateSettings(newSettings) {
			Object.keys(newSettings).forEach((key) => {
				if (key in this.settings) {
					this.settings[key] = newSettings[key];
				}
			});
			logger.info("批量设置已更新:", newSettings);
		},

		// 重置为默认设置
		resetToDefault() {
			this.settings = { ...defaultSettings };
			logger.info("设置已重置为默认值");
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
			logger.info("设置已导入:", validSettings);
		},

		// 导出设置
		exportSettings() {
			return { ...this.settings };
		},

		// ========== Jellyfin 相关 Actions ==========

		/**
		 * 合并更新 Jellyfin 数据（不覆盖，只合并）
		 * @param {Object} newJellyfin - 新的 Jellyfin 数据
		 */
		mergeJellyfin(newJellyfin) {
			if (!newJellyfin) return;

			Object.keys(newJellyfin).forEach((key) => {
				if (key in this.jellyfin) {
					if (
						key === "originItem" &&
						Array.isArray(newJellyfin[key])
					) {
						// 合并数组 - 去重合并
						const mergedItems = [...this.jellyfin.originItem];
						newJellyfin[key].forEach((item) => {
							const exists = mergedItems.some(
								(existingItem) => existingItem.Id === item.Id
							);
							if (!exists) {
								mergedItems.push(item);
							}
						});
						this.jellyfin.originItem = mergedItems;
					} else if (
						key === "codes" &&
						(newJellyfin[key] instanceof Set ||
							Array.isArray(newJellyfin[key]))
					) {
						// 合并 Set - 自动去重
						const newCodesSet =
							newJellyfin[key] instanceof Set
								? newJellyfin[key]
								: new Set(newJellyfin[key]);
						this.jellyfin.codes = new Set([
							...this.jellyfin.codes,
							...newCodesSet,
						]);
					} else {
						this.jellyfin[key] = newJellyfin[key];
					}
				}
			});
			logger.info("Jellyfin 数据已合并更新");
		},

		/**
		 * 完全替换 Jellyfin 数据
		 * @param {Object} newJellyfin - 新的 Jellyfin 数据
		 */
		replaceJellyfin(newJellyfin) {
			Object.keys(newJellyfin).forEach((key) => {
				if (key in this.jellyfin) {
					// 特殊处理 Set 类型
					if (key === "codes" && newJellyfin[key] instanceof Set) {
						this.jellyfin[key] = new Set(newJellyfin[key]);
					} else {
						this.jellyfin[key] = newJellyfin[key];
					}
				}
			});
			logger.info("Jellyfin 数据已完全替换");
		},

		/**
		 * 添加单个作品到 Jellyfin
		 * @param {Object} item - 作品对象
		 * @param {string} code - 作品代码
		 */
		addJellyfinItem(item, code) {
			if (item && item.Id) {
				// 检查是否已存在
				const exists = this.jellyfin.originItem.some(
					(existingItem) => existingItem.Id === item.Id
				);
				if (!exists) {
					this.jellyfin.originItem.push(item);
				}
			}
			if (code) {
				this.jellyfin.codes.add(code);
			}
			logger.info(`已添加作品到 Jellyfin: ${code || item?.Name}`);
		},

		/**
		 * 从 Jellyfin 移除作品
		 * @param {string} itemId - 作品ID
		 * @param {string} code - 作品代码
		 */
		removeJellyfinItem(itemId, code) {
			if (itemId) {
				this.jellyfin.originItem = this.jellyfin.originItem.filter(
					(item) => item.Id !== itemId
				);
			}
			if (code) {
				this.jellyfin.codes.delete(code);
			}
			logger.info(`已从 Jellyfin 移除作品: ${code || itemId}`);
		},

		/**
		 * 清空 Jellyfin 数据
		 */
		clearJellyfin() {
			this.jellyfin.originItem = [];
			this.jellyfin.codes = new Set();
			logger.info("Jellyfin 数据已清空");
		},

		// ========== Web 相关 Actions ==========

		updateWebCodes(newCodes) {
			if (newCodes instanceof Set) {
				this.web.codes = new Set(newCodes);
			} else if (Array.isArray(newCodes)) {
				this.web.codes = new Set(newCodes);
			} else {
				logger.warn("updateWebCodes: 参数类型不支持", typeof newCodes);
				this.web.codes = new Set();
			}
		},

		/**
		 * 合并 Web Codes（不覆盖，只合并）
		 * @param {Set|Array} newCodes - 新的代码集合
		 */
		mergeWebCodes(newCodes) {
			if (!newCodes) return;

			const newCodesSet =
				newCodes instanceof Set ? newCodes : new Set(newCodes);
			this.web.codes = new Set([...this.web.codes, ...newCodesSet]);
			logger.info(`Web Codes 已合并，当前数量: ${this.web.codes.size}`);
		},

		addWebCode(newCode) {
			if (newCode) {
				this.web.codes.add(newCode);
			}
		},

		delWebCode(code) {
			this.web.codes.delete(code);
		},

		updateWebBoxes(newBoxes) {
			if (!newBoxes) {
				this.web.boxes = new Map();
				return;
			}

			if (newBoxes instanceof Map) {
				this.web.boxes = new Map(newBoxes);
			} else if (Array.isArray(newBoxes)) {
				const validEntries = newBoxes.filter(
					(entry) => Array.isArray(entry) && entry.length === 2
				);
				this.web.boxes = new Map(validEntries);
			} else if (typeof newBoxes === "object") {
				this.web.boxes = new Map(Object.entries(newBoxes));
			} else {
				logger.warn("updateWebBoxes: 参数类型不支持", typeof newBoxes);
				this.web.boxes = new Map();
			}
		},

		/**
		 * 合并 Web Boxes（不覆盖，只合并）
		 * @param {Map|Array|Object} newBoxes - 新的 boxes 数据
		 */
		mergeWebBoxes(newBoxes) {
			if (!newBoxes) return;

			let newBoxesMap;
			if (newBoxes instanceof Map) {
				newBoxesMap = newBoxes;
			} else if (Array.isArray(newBoxes)) {
				const validEntries = newBoxes.filter(
					(entry) => Array.isArray(entry) && entry.length === 2
				);
				newBoxesMap = new Map(validEntries);
			} else if (typeof newBoxes === "object") {
				newBoxesMap = new Map(Object.entries(newBoxes));
			} else {
				logger.warn("mergeWebBoxes: 参数类型不支持", typeof newBoxes);
				return;
			}

			// 合并到现有 Map
			this.web.boxes = new Map([...this.web.boxes, ...newBoxesMap]);
			logger.info(`Web Boxes 已合并，当前数量: ${this.web.boxes.size}`);
		},

		updateWeb(newWeb) {
			Object.keys(newWeb).forEach((key) => {
				if (key in this.web) {
					if (key === "codes" && newWeb[key] instanceof Set) {
						this.web[key] = new Set(newWeb[key]);
					} else if (key === "boxes" && newWeb[key] instanceof Map) {
						this.web[key] = new Map(newWeb[key]);
					} else {
						this.web[key] = newWeb[key];
					}
				}
			});
		},

		addWebBox(code, newBox) {
			if (code && newBox) {
				this.web.boxes.set(code, newBox);
			}
		},

		delWebBox(code) {
			this.web.boxes.delete(code);
		},
	},
});
