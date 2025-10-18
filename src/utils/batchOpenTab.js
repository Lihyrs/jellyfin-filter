import logger from "../lib/Logger";

/**
 * 批量打开标签页
 * @param {Array<string>} links urls
 * @param {Number} delay 延迟时间（毫秒）
 * @param {Number} maxTab 最大并发标签数
 * @param {Object} cb 回调函数 { success, failed }
 * @returns {Promise<{success: Set<string>, failed: Set<string>}>}
 */
export async function batchOpenTab(links, delay = 1500, maxTab = 5, cb = {}) {
	let current = 0;
	let openSuccessed = new Set();
	let openFailed = new Set();
	const { success, failed } = cb;

	// 参数验证
	if (!Array.isArray(links) || links.length === 0) {
		logger.warn("batchOpenTab: 链接列表为空或不是数组");
		return Promise.resolve({ success: openSuccessed, failed: openFailed });
	}

	try {
		while (current < links.length) {
			const batch = links.slice(current, current + maxTab);
			const promises = batch.map(
				(link, index) =>
					new Promise((resolve) => {
						setTimeout(() => {
							try {
								GM_openInTab(link, true);
								openSuccessed.add(link);
								if (typeof success === "function") {
									success(link);
								}
								logger.debug(`已打开链接: ${link}`);
							} catch (error) {
								openFailed.add(link);
								if (typeof failed === "function") {
									failed(link, error);
								}
								logger.error(`打开链接失败: ${link}`, error);
							}
							resolve();
						}, index * delay);
					})
			);

			await Promise.all(promises);
			current += maxTab;

			// 批次间延迟
			if (current < links.length) {
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	} catch (error) {
		logger.error("batchOpenTab 执行过程中发生错误:", error);
	}

	return { success: openSuccessed, failed: openFailed };
}
