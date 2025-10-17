// Logger.js
class Logger {
	static instance = null;

	constructor(options = {}) {
		// 如果已存在实例，返回现有实例
		if (Logger.instance) {
			return Logger.instance;
		}

		this.level = options.level || "info";
		this.prefix = options.prefix || "[App]";
		this.levels = {
			trace: 0,
			debug: 1,
			info: 2,
			warn: 3,
			error: 4,
			silent: 5,
		};

		// 存储原始配置用于重置
		this._originalConfig = { ...options };

		// 确保实例唯一
		Logger.instance = this;
	}

	// 静态方法获取实例
	static getInstance(options = {}) {
		if (!Logger.instance) {
			Logger.instance = new Logger(options);
		}
		// 允许更新现有实例的配置
		if (Object.keys(options).length > 0) {
			Logger.instance._updateConfig(options);
		}
		return Logger.instance;
	}

	// 更新配置
	_updateConfig(options) {
		if (options.level && this.levels[options.level] !== undefined) {
			this.level = options.level;
		}
		if (options.prefix) {
			this.prefix = options.prefix;
		}
	}

	// 重置到初始配置
	reset() {
		this.level = this._originalConfig.level || "info";
		this.prefix = this._originalConfig.prefix || "[App]";
	}

	// 新增：log 方法，作为 info 的别名
	log = (...args) => {
		this._log("info", ...args);
	};

	setLevel = (level) => {
		if (this.levels[level] !== undefined) {
			this.level = level;
			this._log("info", `日志级别设置为: ${level}`);
		} else {
			this._log("warn", `无效的日志级别: ${level}`);
		}
	};

	getLevel = () => {
		return this.level;
	};

	trace = (...args) => {
		this._log("trace", ...args);
	};

	debug = (...args) => {
		this._log("debug", ...args);
	};

	info = (...args) => {
		this._log("info", ...args);
	};

	warn = (...args) => {
		this._log("warn", ...args);
	};

	error = (...args) => {
		this._log("error", ...args);
	};

	// ========== 增强的 Group 方法 ==========

	/**
	 * 开始一个日志分组
	 * @param {string} label - 分组标签
	 * @param {string} [level="debug"] - 日志级别
	 */
	group = (label, level = "debug") => {
		if (this.levels[level] >= this.levels[this.level]) {
			console.group(`${this.prefix} ${label}`);
		}
	};

	/**
	 * 开始一个可折叠的日志分组
	 * @param {string} label - 分组标签
	 * @param {string} [level="debug"] - 日志级别
	 */
	groupCollapsed = (label, level = "debug") => {
		if (this.levels[level] >= this.levels[this.level]) {
			console.groupCollapsed(`${this.prefix} ${label}`);
		}
	};

	/**
	 * 结束当前日志分组
	 */
	groupEnd = () => {
		console.groupEnd();
	};

	/**
	 * 自动分组 - 执行函数并在分组中显示结果
	 * @param {string} label - 分组标签
	 * @param {Function} fn - 要执行的函数
	 * @param {string} [level="debug"] - 日志级别
	 * @returns {*} 函数的返回值
	 */
	groupAuto = (label, fn, level = "debug") => {
		if (this.levels[level] < this.levels[this.level]) {
			return fn();
		}

		this.groupCollapsed(label, level);
		try {
			const result = fn();
			if (result !== undefined) {
				this.log("返回值:", result);
			}
			return result;
		} catch (error) {
			this.error("执行出错:", error);
			throw error;
		} finally {
			this.groupEnd();
		}
	};

	/**
	 * 异步自动分组
	 * @param {string} label - 分组标签
	 * @param {Function} asyncFn - 要执行的异步函数
	 * @param {string} [level="debug"] - 日志级别
	 * @returns {Promise<*>} 异步函数的返回值
	 */
	async groupAutoAsync(label, asyncFn, level = "debug") {
		if (this.levels[level] < this.levels[this.level]) {
			return await asyncFn();
		}

		this.groupCollapsed(label, level);
		try {
			const result = await asyncFn();
			if (result !== undefined) {
				this.log("返回值:", result);
			}
			return result;
		} catch (error) {
			this.error("执行出错:", error);
			throw error;
		} finally {
			this.groupEnd();
		}
	}

	/**
	 * 嵌套分组
	 * @param {string} label - 分组标签
	 * @param {Function} fn - 要执行的函数
	 * @param {string} [level="debug"] - 日志级别
	 */
	groupNested = (label, fn, level = "debug") => {
		if (this.levels[level] < this.levels[this.level]) {
			fn();
			return;
		}

		this.group(label, level);
		try {
			fn();
		} catch (error) {
			this.error("嵌套分组执行出错:", error);
		} finally {
			this.groupEnd();
		}
	};

	// ========== 表格日志 ==========

	/**
	 * 表格形式输出
	 * @param {Array|Object} data - 表格数据
	 * @param {string} [level="debug"] - 日志级别
	 */
	table = (data, level = "debug") => {
		if (this.levels[level] >= this.levels[this.level]) {
			console.table(data);
		}
	};

	// ========== 性能测量 ==========

	/**
	 * 开始性能测量
	 * @param {string} label - 测量标签
	 * @param {string} [level="debug"] - 日志级别
	 */
	time = (label, level = "debug") => {
		if (this.levels[level] >= this.levels[this.level]) {
			console.time(`${this.prefix} ${label}`);
		}
	};

	/**
	 * 结束性能测量
	 * @param {string} label - 测量标签
	 * @param {string} [level="debug"] - 日志级别
	 */
	timeEnd = (label, level = "debug") => {
		if (this.levels[level] >= this.levels[this.level]) {
			console.timeEnd(`${this.prefix} ${label}`);
		}
	};

	/**
	 * 自动性能测量
	 * @param {string} label - 测量标签
	 * @param {Function} fn - 要测量的函数
	 * @param {string} [level="debug"] - 日志级别
	 * @returns {*} 函数的返回值
	 */
	timeAuto = (label, fn, level = "debug") => {
		if (this.levels[level] < this.levels[this.level]) {
			return fn();
		}

		this.time(label, level);
		try {
			const result = fn();
			this.timeEnd(label, level);
			return result;
		} catch (error) {
			this.timeEnd(label, level);
			throw error;
		}
	};

	// ========== 私有方法 ==========

	_log = (level, ...args) => {
		if (this.levels[level] < this.levels[this.level]) {
			return;
		}

		const timestamp = new Date().toISOString();
		const method = console[level] || console.log;
		const prefix = `[${timestamp}] ${this.prefix} [${level.toUpperCase()}]`;

		method(prefix, ...args);
	};
}

// 创建默认实例
const logger = new Logger();

export { Logger, logger };
export default logger;
