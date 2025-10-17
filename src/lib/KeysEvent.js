class KeysEvent {
	constructor(options = {}) {
		const {
			eventType = "keydown",
			interval = 500,
			autoStart = true,
			debug = false,
			preventDefault = false,
		} = options;

		this.interval = interval;
		this.inputs = [];
		this.eventMap = new Map();
		this.isListening = false;
		this.preventDefault = preventDefault;
		this.debug = debug;

		// 自动开始监听
		if (autoStart) {
			this.start(eventType);
		}
	}

	// 日志方法
	log = (...args) => {
		if (this.debug) {
			console.log("[KeysEvent]", ...args);
		}
	};

	// 错误日志
	error = (...args) => {
		console.error("[KeysEvent]", ...args);
	};

	// 开始监听
	start = (eventType = "keydown") => {
		if (this.isListening) {
			this.log("已经在监听状态");
			return;
		}

		this.eventType = eventType;
		document.addEventListener(eventType, this.handler);
		this.isListening = true;

		this.log(`开始监听 ${eventType} 事件`);
	};

	// 停止监听
	stop = () => {
		if (!this.isListening) {
			this.log("当前未在监听状态");
			return;
		}

		document.removeEventListener(this.eventType, this.handler);
		this.isListening = false;
		this.inputs = [];

		this.log("停止监听键盘事件");
	};

	// 事件处理器
	handler = (e) => {
		// 阻止默认行为（如果配置了）
		if (this.preventDefault) {
			e.preventDefault();
		}

		const now = Date.now();
		const key = e.key.toLowerCase();

		// 清理过期的输入
		const index = this.inputs.findLastIndex(
			({ time }) => now - time > this.interval
		);
		if (index > -1) {
			this.inputs.splice(0, index + 1);
		}

		// 添加新输入
		this.inputs.push({ key, time: now, event: e });

		this.log(`按键输入: ${key}, 当前序列: ${this.getCurrentSequence()}`);
		this.trigger();
	};

	// 触发匹配的监听器
	trigger = () => {
		const inputKeys = this.inputs.map((input) => input.key).join("");

		for (const [keys, listeners] of this.eventMap) {
			const startIndex = inputKeys.indexOf(keys);
			if (startIndex > -1) {
				this.log(`匹配到快捷键: ${keys}`);

				try {
					// 执行所有监听器
					listeners.forEach((listener) =>
						listener(keys, this.inputs)
					);

					// 移除已匹配的输入序列
					this.inputs.splice(0, startIndex + keys.length);
				} catch (error) {
					this.error("执行监听器时出错:", error);
				}

				break; // 匹配到一个后就退出，避免多次触发
			}
		}
	};

	/**
	 * 注册监听器
	 * @param {string} keys
	 * @param {function} listener
	 * @returns function 返回取消监听的函数
	 */
	on = (keys, listener) => {
		if (!keys || typeof listener !== "function") {
			this.error("注册监听器失败: 参数无效");
			return () => {};
		}
		this.log("keys:", keys, typeof keys);

		const normalizedKeys = keys.toLowerCase();
		const listeners = this.eventMap.get(normalizedKeys) || [];

		// 不允许注册相同的处理函数
		if (!listeners.includes(listener)) {
			listeners.push(listener);
			this.eventMap.set(normalizedKeys, listeners);
			this.log(`注册快捷键: ${normalizedKeys}`);
		}

		// 返回取消监听的函数
		return () => this.off(normalizedKeys, listener);
	};

	/**
	 * 取消监听
	 * @param {string} keys
	 * @param {function} listener
	 * @returns function 返回取消监听的函数
	 */
	off = (keys, listener) => {
		const normalizedKeys = keys.toLowerCase();
		const listeners = this.eventMap.get(normalizedKeys);

		if (!listeners) {
			this.log(`未找到快捷键: ${normalizedKeys}`);
			return;
		}

		const index = listeners.findIndex((l) => l === listener);
		if (index > -1) {
			listeners.splice(index, 1);
			this.log(`取消注册快捷键: ${normalizedKeys}`);

			// 如果没有监听器了，删除该快捷键
			if (listeners.length === 0) {
				this.eventMap.delete(normalizedKeys);
			}
		}
	};

	// 一次性监听
	once = (keys, listener) => {
		const wrappedListener = (...args) => {
			listener(...args);
			this.off(keys, wrappedListener);
		};
		return this.on(keys, wrappedListener);
	};

	// 获取当前输入序列
	getCurrentSequence = () => {
		return this.inputs.map((input) => input.key).join("");
	};

	// 清空输入序列
	clearInputs = () => {
		this.inputs = [];
		this.log("清空输入序列");
	};

	// 获取所有注册的快捷键
	getRegisteredKeys = () => {
		return Array.from(this.eventMap.keys());
	};

	// 获取状态信息
	getStatus = () => {
		return {
			isListening: this.isListening,
			currentSequence: this.getCurrentSequence(),
			registeredKeys: this.getRegisteredKeys(),
			totalListeners: Array.from(this.eventMap.values()).reduce(
				(total, listeners) => total + listeners.length,
				0
			),
			eventType: this.eventType,
			interval: this.interval,
		};
	};

	// 销毁实例
	destroy = () => {
		this.stop();
		this.eventMap.clear();
		this.inputs = [];
		this.log("KeysEvent实例已销毁");
	};
}

// 全局单例管理
const instances = new Map();

// 创建或获取实例
export const createKeysEvent = (name = "default", options = {}) => {
	if (!instances.has(name)) {
		const instance = new KeysEvent(options);
		instances.set(name, instance);
		return instance;
	}
	return instances.get(name);
};

// 获取实例
export const getKeysEvent = (name = "default") => {
	return instances.get(name);
};

// 销毁实例
export const destroyKeysEvent = (name = "default") => {
	const instance = instances.get(name);
	if (instance) {
		instance.destroy();
		instances.delete(name);
	}
};

// 默认导出
export default KeysEvent;
