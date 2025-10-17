// useCreatePersistedDataShower.js
import logger from './Logger';
class PersistedDataShower {
	constructor() {
		this._store = null;
		this._initialized = false;
		this._maxRetryCount = 5;
		this._retryDelay = 200;
	}

	setStore(store) {
		if (store && store.$id) {
			this._store = store;
			this._initialized = true;
			logger.log("✅ PersistedDataShower 已初始化，Store:", store.$id);

			// 检查持久化方法是否存在
			this._checkPersistedMethods();
			return true;
		}
		logger.warn("❌ 传入的 store 无效");
		return false;
	}

	// 检查持久化方法是否存在
	_checkPersistedMethods() {
		const requiredMethods = [
			"$getPersistedData",
			"$getPersistedStats",
			"$getPersistConfig",
		];

		const missingMethods = requiredMethods.filter(
			(method) => typeof this._store[method] !== "function"
		);

		if (missingMethods.length > 0) {
			logger.warn("❌ Store 缺少持久化方法:", missingMethods);
			logger.log("💡 请检查 pinia 插件是否正确注册");
			logger.log(
				"🔍 当前 store 的方法:",
				Object.keys(this._store).filter((key) => key.startsWith("$"))
			);
		} else {
			logger.log("✅ Store 持久化方法检查通过");
		}
	}

	showPersistedData() {
		if (!this._initialized || !this._store) {
			logger.warn(
				"❌ PersistedDataShower 未初始化，请先调用 setStore()"
			);
			return false;
		}

		// 检查 store 是否有持久化方法
		if (typeof this._store.$getPersistedData !== "function") {
			logger.warn("❌ Store 没有持久化方法，请检查 pinia 插件配置");

			// 显示所有以 $ 开头的方法
			const dollarMethods = Object.getOwnPropertyNames(
				this._store
			).filter((key) => key.startsWith("$"));
			logger.log("🔍 当前 store 的 $ 方法:", dollarMethods);

			// 检查原型链上的方法
			const prototypeMethods = Object.getOwnPropertyNames(
				Object.getPrototypeOf(this._store)
			).filter((key) => key.startsWith("$"));
			logger.log("🔍 原型链上的 $ 方法:", prototypeMethods);

			return false;
		}


		try {
			const data = this._store.$getPersistedData();
			const stats = this._store.$getPersistedStats();

			logger.group("📦 持久化数据调试");
			logger.log("🔑 Store ID:", this._store.$id);
			logger.log("📊 统计数据:", stats);
			logger.log("💾 持久化数据:", data);
			logger.log("⚙️ 配置:", this._store.$getPersistConfig());
			logger.groupEnd();

			return true;
		} catch (error) {
			logger.error("❌ 显示持久化数据失败:", error);
			return false;
		}
	}

	// 添加重试机制
	async showPersistedDataWithRetry(retryCount = 0) {
		if (retryCount >= this._maxRetryCount) {
			logger.error(`❌ 重试 ${this._maxRetryCount} 次后仍失败`);
			return false;
		}

		if (typeof this._store.$getPersistedData === "function") {
			return this.showPersistedData();
		}

		logger.log(
			`🔄 等待持久化方法加载... (${retryCount + 1}/${
				this._maxRetryCount
			})`
		);

		await new Promise((resolve) => setTimeout(resolve, this._retryDelay));
		return this.showPersistedDataWithRetry(retryCount + 1);
	}

	// 添加其他有用的方法
	getStoreInfo() {
		if (!this._store) return null;
		return {
			id: this._store.$id,
			hasPersistedMethods:
				typeof this._store.$getPersistedData === "function",
			isInitialized: this._initialized,
			availableMethods: Object.keys(this._store).filter((key) =>
				key.startsWith("$")
			),
		};
	}
}

// 创建单例
const persDataShowerInstance = new PersistedDataShower();

export function useCreatePersistedDataShower(store) {
	if (store) {
		persDataShowerInstance.setStore(store);
	}

	return persDataShowerInstance;
}

export default useCreatePersistedDataShower;
