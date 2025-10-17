// filterHelper
import { SITE_HELPERS } from "./web";
import { SITE_CONFIGS } from "../comm/constant";
import { logger } from "../lib/Logger";

// const jellyfin = new Jellyfin

class FilterHelper {
	#webHelper;

	init(url) {
		const helper = this.getWebHelper(url);
		if (helper) this.#webHelper = helper;
	}
	/**
	 *
	 * @param {Set<string>} siteCodes
	 * @param {Set<string>} jellyfinCodes
	 * @returns {Set<string>|null}
	 */
	async getExistCodes(siteCodes, jellyfinCodes) {
		if (siteCodes && jellyfinCodes) {
			return siteCodes.intersection(jellyfinCodes);
		}
		return null;
	}

	/**
	 * 在页面中查找作品代码
	 * @returns {Map<string, {box: HTMLElement, type: string}>} 代码映射表
	 * @example
	 * // 返回示例：Map { 'abc123' => {box: div.element, type: 'music'} }
	 */
	getCodeFormPage() {
		return this.#webHelper.findCode();
	}
	/**
	 * 根据 URL 获取对应的站点助手实例
	 * @param {string} url - 要检测的 URL
	 * @returns {BaseWebHelper|null} 返回对应的助手实例，如果不匹配则返回 null
	 */
	getWebHelper(url) {
		const siteConfig = this.detectSiteConfig(url);
		if (!siteConfig) {
			logger.warn(`未找到匹配的站点配置: ${url}`);
			return null;
		}

		const HelperClass = SITE_HELPERS.get(siteConfig.name);
		if (!HelperClass) {
			logger.warn(`未找到对应的助手类: ${siteConfig.name}`);
			return null;
		}

		return new HelperClass();
	}

	/**
	 *
	 * @param {Array[HTMLElement]} boxes
	 * @param {string} outlineStyle
	 */
	setHighlightStyle(boxes, outlineStyle) {
		this.#webHelper.addOutlineStyle(boxes, outlineStyle);
	}

	clearHighlightStyle() {
		this.#webHelper.clearHighlightStyle();
	}

	/**
	 * 根据 URL 检测站点配置
	 * @param {string} url - 要检测的 URL
	 * @returns {Object|null} 返回站点配置对象
	 */
	detectSiteConfig(url) {
		for (const config of Object.values(SITE_CONFIGS)) {
			if (config.urlReg.test(url)) {
				return config;
			}
		}
		return null;
	}

	/**
	 * 获取当前页面的助手实例
	 * @returns {BaseWebHelper|null} 返回当前页面的助手实例
	 */
	getCurrentPageHelper() {
		return this.#webHelper || this.getWebHelper(window.location.href);
	}

	/**
	 * 获取所有支持的站点名称
	 * @returns {string[]} 站点名称数组
	 */
	getSupportedSites() {
		return Array.from(SITE_HELPERS.keys());
	}

	/**
	 * 检查 URL 是否被支持
	 * @param {string} url - 要检查的 URL
	 * @returns {boolean} 是否支持
	 */
	isUrlSupported(url) {
		return this.detectSiteConfig(url) !== null;
	}
}

export default FilterHelper;
