import logger from "../lib/Logger";
import { toRaw } from "vue";

function serialize(data) {
	function processValue(value) {
		// 处理基本类型
		if (value === null || typeof value !== "object") {
			return value;
		}

		// 处理 Set
		if (value instanceof Set) {
			return {
				__type: "Set",
				value: Array.from(value).map(processValue),
			};
		}

		// 处理 Map
		if (value instanceof Map) {
			return {
				__type: "Map",
				value: Array.from(value.entries()).map(([k, v]) => [
					processValue(k),
					processValue(v),
				]),
			};
		}

		// 处理数组
		if (Array.isArray(value)) {
			return value.map(processValue);
		}

		// 处理普通对象 - 使用 toRaw 确保获取原始值而不是 Proxy
		const rawValue = toRaw(value);
		const result = {};
		Object.keys(rawValue).forEach((key) => {
			result[key] = processValue(rawValue[key]);
		});
		return result;
	}

	const processed = processValue(data);
	// logger.debug("serialize: ", data, processed, JSON.stringify(processed));
	// return JSON.stringify(processed);
	return processed;
}

function deserialize(data) {
	logger.debug("deserialize:", data);
	function processValue(value) {
		// 处理基本类型
		if (value === null || typeof value !== "object") {
			return value;
		}

		// 处理 Set
		if (value.__type === "Set") {
			const setValue = Array.isArray(value.value) ? value.value : [];
			return new Set(setValue.map(processValue));
		}

		// 处理 Map
		if (value.__type === "Map") {
			const mapValue = Array.isArray(value.value) ? value.value : [];
			return new Map(
				mapValue.map(([k, v]) => [processValue(k), processValue(v)])
			);
		}

		// 处理数组
		if (Array.isArray(value)) {
			return value.map(processValue);
		}

		// 处理普通对象
		const result = {};
		Object.keys(value).forEach((key) => {
			result[key] = processValue(value[key]);
		});
		return result;
	}

	const parsed = data;
	const result = processValue(parsed);
	logger.debug("deserialize: ", data, parsed, result);
	return result;
}

function persistedState() {
	return function (context) {
		const { options, store } = context;

		// 检查是否启用了持久化
		if (!options.persist) {
			return;
		}

		// 默认配置 - 使用你提供的序列化/反序列化函数
		const defaultConfig = {
			key: `pinia-${store.$id}`,
			storage: {
				getItem: GM_getValue,
				setItem: GM_setValue,
			},
			paths: null,
			// 使用你提供的序列化/反序列化函数
			serialize: serialize,
			deserialize: deserialize,
			debug: false,
		};

		// 合并配置
		let config;
		if (options.persist === true) {
			config = defaultConfig;
		} else {
			config = {
				...defaultConfig,
				...options.persist,
			};
		}

		// 从存储中恢复状态
		try {
			const storedValue = config.storage.getItem(config.key);
			if (storedValue) {
				logger.info(`恢复存储状态前: `, storedValue);
				const storedState = config.deserialize(storedValue);
				logger.info(`恢复存储状态: ${config.key}`, storedState);

				if (config.paths && Array.isArray(config.paths)) {
					const patchState = {};
					config.paths.forEach((path) => {
						// 使用lodash的get函数类似的功能
						const value = getValueByPath(storedState, path);
						if (value !== undefined) {
							setValueByPath(patchState, path, value);
						}
					});
					store.$patch(patchState);
				} else {
					store.$patch(storedState);
				}
			}
		} catch (error) {
			logger.error("恢复状态失败:", error);
		}

		// 监听状态变化并保存
		store.$subscribe((mutation, state) => {
			try {
				let stateToSave;

				if (config.paths && Array.isArray(config.paths)) {
					stateToSave = {};
					config.paths.forEach((path) => {
						// 使用 toRaw 获取实际值，避免 Proxy
						const rawState = toRaw(state);
						const value = getValueByPath(rawState, path);
						if (value !== undefined) {
							setValueByPath(stateToSave, path, value);
						}
					});
				} else {
					// 使用 toRaw 获取整个状态的实际值，避免 Proxy
					stateToSave = toRaw(state);
				}

				const serializedState = config.serialize(stateToSave);
				logger.info(`保存状态: ${config.key}`, stateToSave);
				config.storage.setItem(config.key, serializedState);
				if (config.debug) {
					logger.debug(
						"已保存的数据: ",
						store.$getPersistedStats?.()
					);
				}
			} catch (error) {
				logger.error("保存状态失败:", error);
			}
		});

		// 辅助函数：通过路径获取值
		function getValueByPath(obj, path) {
			return path.split(".").reduce((current, key) => {
				return current && current[key] !== undefined
					? current[key]
					: undefined;
			}, obj);
		}

		// 辅助函数：通过路径设置值
		function setValueByPath(obj, path, value) {
			const keys = path.split(".");
			const lastKey = keys.pop();
			const target = keys.reduce((current, key) => {
				if (!current[key] || typeof current[key] !== "object") {
					current[key] = {};
				}
				return current[key];
			}, obj);
			target[lastKey] = value;
		}

		// ========== 添加查看持久化数据的方法 ==========

		/**
		 * 查看已持久化的数据
		 * @returns {Object} 持久化的数据
		 */
		store.$getPersistedData = function () {
			try {
				const storedValue = config.storage.getItem(config.key);
				if (storedValue) {
					return config.deserialize(storedValue);
				}
				return null;
			} catch (error) {
				logger.error("获取持久化数据失败:", error);
				return null;
			}
		};

		/**
		 * 查看所有持久化的存储键
		 * @returns {Array} 所有存储键的数组
		 */
		store.$getAllPersistedKeys = function () {
			try {
				// 如果是 GM_setValue，可以使用 GM_listValues 获取所有键
				if (typeof GM_listValues === "function") {
					return GM_listValues().filter((key) =>
						key.startsWith("pinia-")
					);
				}
				// 对于其他存储，返回当前 store 的键
				return [config.key];
			} catch (error) {
				logger.error("获取持久化键列表失败:", error);
				return [config.key];
			}
		};

		/**
		 * 查看持久化数据的统计信息
		 * @returns {Object} 统计信息
		 */
		store.$getPersistedStats = function () {
			try {
				const storedValue = config.storage.getItem(config.key);
				if (storedValue) {
					const data = config.deserialize(storedValue);
					return {
						key: config.key,
						storeId: store.$id,
						dataSize: new Blob([storedValue]).size,
						itemCount: Object.keys(data).length,
						lastUpdated: new Date().toISOString(),
						paths: config.paths || "all",
						data: data,
					};
				}
				return {
					key: config.key,
					storeId: store.$id,
					dataSize: 0,
					itemCount: 0,
					lastUpdated: null,
					paths: config.paths || "all",
					data: null,
				};
			} catch (error) {
				logger.error("获取持久化统计信息失败:", error);
				return null;
			}
		};

		/**
		 * 导出持久化数据
		 * @returns {Object} 导出数据
		 */
		store.$exportPersistedData = function () {
			try {
				const storedValue = config.storage.getItem(config.key);
				if (storedValue) {
					const data = config.deserialize(storedValue);
					return {
						storeId: store.$id,
						key: config.key,
						timestamp: new Date().toISOString(),
						data: data,
						config: {
							paths: config.paths,
							storage: config.storage ? "GM_setValue" : "unknown",
						},
					};
				}
				return null;
			} catch (error) {
				logger.error("导出持久化数据失败:", error);
				return null;
			}
		};

		// 清除持久化数据的方法
		store.$clearPersistedState = function () {
			logger.info(`清除持久化数据: ${config.key}`);
			config.storage.setItem(config.key, null);
		};

		// 获取持久化配置的方法
		store.$getPersistConfig = function () {
			return { ...config };
		};

		// 重新加载状态的方法
		store.$rehydrate = function () {
			const storedValue = config.storage.getItem(config.key);
			if (storedValue) {
				const storedState = config.deserialize(storedValue);
				store.$patch(storedState);
			}
		};
	};
}

// 全局方法：查看所有持久化的存储
persistedState.getAllStoresData = function () {
	try {
		if (typeof GM_listValues === "function") {
			const allKeys = GM_listValues().filter((key) =>
				key.startsWith("pinia-")
			);
			const result = {};

			allKeys.forEach((key) => {
				try {
					const value = GM_getValue(key);
					if (value) {
						// 使用默认的反序列化函数处理数据
						let data;
						try {
							data = deserialize(value);
						} catch (e) {
							// 如果自定义反序列化失败，尝试普通 JSON 解析
							data = value;
						}
						result[key] = {
							data: data,
							size: new Blob([value]).size,
							timestamp: new Date().toISOString(),
						};
					}
				} catch (error) {
					logger.error(`解析存储数据失败 ${key}:`, error);
				}
			});

			return result;
		}
		return {};
	} catch (error) {
		logger.error("获取所有存储数据失败:", error);
		return {};
	}
};

// 全局方法：清除所有持久化数据
persistedState.clearAllPersistedData = function () {
	try {
		if (typeof GM_listValues === "function") {
			const allKeys = GM_listValues().filter((key) =>
				key.startsWith("pinia-")
			);
			allKeys.forEach((key) => {
				GM_setValue(key, null);
			});
			logger.info(`已清除所有持久化数据，共 ${allKeys.length} 个存储`);
			return allKeys.length;
		}
		return 0;
	} catch (error) {
		logger.error("清除所有持久化数据失败:", error);
		return 0;
	}
};

export default persistedState;
