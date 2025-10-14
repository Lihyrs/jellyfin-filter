// plugins/logger.js
class Logger {
	constructor(options = {}) {
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

const LoggerPlugin = {
	install(app, options = {}) {
		const logger = new Logger(options);

		// 挂载到全局属性
		app.config.globalProperties.$log = logger;

		// 提供依赖注入
		app.provide("$logger", logger);

		// 开发环境下挂载到 window 方便调试
		if (import.meta.env.DEV) {
			window.$log = logger;
		}

		logger.info("Logger 插件安装完成");
	},
};

export default LoggerPlugin;
