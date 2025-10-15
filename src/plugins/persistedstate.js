import logger from "../lib/Logger";

// 改进版的插件
function persistedState() {
	return function (context) {
		const { options, store } = context;

		// 检查是否启用了持久化
		if (!options.persist) return;

		// 默认配置
		const defaultConfig = {
			key: `pinia-${store.$id}`,
			storage: {
				getItem: GM_getValue,
				setItem: GM_setValue,
			},
			paths: null,
			// 新增：序列化/反序列化函数
			serialize: JSON.stringify,
			deserialize: JSON.parse,
			// 新增：调试模式
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
						const value = getValueByPath(state, path);
						if (value !== undefined) {
							setValueByPath(stateToSave, path, value);
						}
					});
				} else {
					stateToSave = state;
				}

				const serializedState = config.serialize(stateToSave);
				logger.info(`保存状态: ${config.key}`, stateToSave);
				config.storage.setItem(config.key, serializedState);
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

		// 添加清除持久化数据的方法
		store.$clearPersistedState = function () {
			logger.info(`清除持久化数据: ${config.key}`);
			config.storage.setItem(config.key, null);
		};

		// 添加获取持久化配置的方法
		store.$getPersistConfig = function () {
			return { ...config };
		};

		// 添加重新加载状态的方法
		store.$rehydrate = function () {
			const storedValue = config.storage.getItem(config.key);
			if (storedValue) {
				const storedState = config.deserialize(storedValue);
				store.$patch(storedState);
			}
		};
	};
}

export default persistedState;
