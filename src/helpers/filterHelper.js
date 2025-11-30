// filterHelper
import { SITE_HELPERS } from "./web";
import { SITE_CONFIGS, AV_CODE_REG_EXP } from "../comm/constant";
import logger from "../lib/Logger";

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
	getExistCodes(siteCodes, jellyfinCodes) {
		if (siteCodes && jellyfinCodes) {
			return siteCodes.intersection(jellyfinCodes);
		}
		return null;
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

	findCurrentPageCodes() {
		return (
			this.#webHelper || this.getWebHelper(window.location.href)
		)?.findCode();
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
		if (!this.detectSiteConfig(url)) return false;
		return this.extractCodeFromPath(url) !== null;
	}
	extractCodeFromPath(url) {
		const path = new URL(url).pathname;

		// 检查所有番号模式
		for (const [type, regex] of Object.entries(AV_CODE_REG_EXP)) {
			if (Array.isArray(regex)) {
				for (const subRegex of regex) {
					const match = path.match(subRegex);
					if (match) return { type, code: match[0] };
				}
			} else {
				const match = path.match(regex);
				if (match) return { type, code: match[0] };
			}
		}
		return null;
	}
}

export default FilterHelper;
