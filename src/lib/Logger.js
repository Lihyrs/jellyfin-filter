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

	// 分组日志
	group = (label, ...args) => {
		if (this.levels["debug"] >= this.levels[this.level]) {
			console.group(`${this.prefix} ${label}`);
			args.forEach((arg) => console.log(arg));
			console.groupEnd();
		}
	};

	// 性能测量
	time = (label) => {
		if (this.levels["debug"] >= this.levels[this.level]) {
			console.time(`${this.prefix} ${label}`);
		}
	};

	timeEnd = (label) => {
		if (this.levels["debug"] >= this.levels[this.level]) {
			console.timeEnd(`${this.prefix} ${label}`);
		}
	};

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
