// logger.js (插件)
import { Logger } from "./utils/Logger.js";

// 已安装标志
let installed = false;

const LoggerPlugin = {
	install(app, options = {}) {
		// 确保只安装一次
		if (installed) {
			console.warn("Logger插件已安装，跳过重复安装");
			return;
		}

		// 获取单例实例
		const logger = Logger.getInstance(options);

		// 挂载到全局属性
		app.config.globalProperties.$log = logger;

		// 提供依赖注入
		app.provide("$logger", logger);

		// 开发环境下挂载到 window 方便调试
		if (process.env.NODE_ENV === "development" || import.meta.env?.DEV) {
			window.$log = logger;
		}

		// logger.info("Logger 插件安装完成");

		// 标记已安装
		installed = true;

		// 添加卸载方法
		app.config.globalProperties.$uninstallLogger = () => {
			delete app.config.globalProperties.$log;
			if (window.$log) {
				delete window.$log;
			}
			installed = false;
			logger.info("Logger 插件已卸载");
		};
	},
};

export default LoggerPlugin;
