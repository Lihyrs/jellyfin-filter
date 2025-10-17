import { HTML_ATTRI, ICONS } from "../../comm/constant";
import { logger } from "../../lib/Logger";
import getcode from "../../utils/getCode";

const { AV_OUTLINE, AV_OUTLINE_PRIORITY } = HTML_ATTRI.data;

class BaseWebHelper {
	#outlined = new Set();
	#jellyfinIcon = null;

	// 配置属性
	#boxSelector;
	#codeSelector;
	#magnetSelector;

	constructor({ boxSelector, codeSelector, magnetSelector = "" }) {
		if (!boxSelector || !codeSelector) {
			throw new Error("boxSelector 和 codeSelector 是必需的参数");
		}

		this.#boxSelector = boxSelector;
		this.#codeSelector = codeSelector;
		this.#magnetSelector = magnetSelector;

		this.#initJellyfinIcon();
	}

	#initJellyfinIcon() {
		this.#jellyfinIcon = document.createElement("img");
		this.#jellyfinIcon.src = ICONS.jellyfin;
		this.#jellyfinIcon.className = "jellyfin-icon";
	}

	// 获取配置属性的公共方法
	getBoxSelector() {
		return this.#boxSelector;
	}

	getCodeSelector() {
		return this.#codeSelector;
	}

	getMagnetSelector() {
		return this.#magnetSelector;
	}

	// 设置配置属性的方法（可选，根据需要提供）
	setBoxSelector(selector) {
		this.#boxSelector = selector;
	}

	setCodeSelector(selector) {
		this.#codeSelector = selector;
	}

	setMagnetSelector(selector) {
		this.#magnetSelector = selector;
	}

	setStyle(element, styles, isImportant = false) {
		Object.entries(styles).forEach(([key, value]) => {
			element.style.setProperty(
				key,
				value,
				isImportant ? "important" : ""
			);
		});
	}

	/**
	 * 在页面中查找作品代码
	 * @returns {Map<string, {box: HTMLElement, type: string}>} 代码映射表
	 * @example
	 * // 返回示例：Map { 'abc123' => {box: div.element, type: 'music'} }
	 */
	findCode() {
		return this.findCodeWithSelectors(
			this.#boxSelector,
			this.#codeSelector
		);
	}

	/**
	 * 通过选择器在页面中查找作品代码
	 * @param {string} boxSelector - 作品容器元素的CSS选择器
	 * @param {string|Function} codeSelector - 代码提取方式：CSS选择器或提取函数
	 * @returns {Map<string, {box: HTMLElement, type: string}>} 代码映射表
	 * @example
	 * // 返回示例：Map { 'abc123' => {box: div.element, type: 'music'} }
	 */
	findCodeWithSelectors(boxSelector, codeSelector) {
		const ret = new Map();

		const boxes = document.querySelectorAll(boxSelector);
		if (boxes.length === 0) {
			logger.warn("该页面没有找到作品");
			return ret;
		}
		logger.debug("findcode:", boxes);
		boxes.forEach((box) => {
			let code =
				typeof codeSelector === "function"
					? codeSelector(box)
					: box.querySelector(codeSelector)?.textContent;
			if (!code) return;

			const tmp = getcode(code);
			// logger.debug("code:", code, "----", tmp);
			if (tmp) {
				const { code: parsedCode, type } = tmp;
				const finalCode = parsedCode.toUpperCase();
				logger.debug("finalCode", finalCode);
				ret.set(finalCode, { box, type });

				// 调用钩子方法
				this.onCodeFound(finalCode, box, type);
			}
		});

		return ret;
	}

	/**
	 * 在页面中查找作品磁力链接
	 * @param {string} boxSelector - 作品容器元素的CSS选择器
	 * @returns {Array[ {ele: HTMLElement, text: string,href:string}] 代码映射表
	 * @example
	 * // 返回示例：Map { 'abc123' => {box: div.element, type: 'music'} }
	 */
	findMagnetLinks(box = document) {
		if (!this.#magnetSelector) {
			logger.warn("未配置 magnetSelector");
			return [];
		}

		const magnets = box.querySelectorAll(this.#magnetSelector);
		return Array.from(magnets).map((magnet) => {
			const href = magnet.getAttribute("href");
			this.onMagnetLinkFound(href, magnet);
			return {
				element: magnet,
				text: magnet.textContent?.trim(),
				href: magnet.getAttribute("href"),
			};
		});
	}

	onMagnetLinkFound(href, ele) {}

	// 在特定box中查找磁力链接
	findMagnetLinksInBox(box) {
		return this.findMagnetLinks(box);
	}

	addOutlineStyle(boxes, outlineStyle) {
		boxes.forEach((box) => {
			if (box.getAttribute(AV_OUTLINE)) return;
			this.setStyle(box, { outline: outlineStyle }, true);
			box.setAttribute(AV_OUTLINE, box.style.outline);
			box.setAttribute(
				AV_OUTLINE_PRIORITY,
				box.style.getPropertyPriority("outline")
			);
			this.#outlined.add(box);
			this.onOutlineAdded(box);
		});
	}

	clearOutlineStyle(boxes) {
		boxes.forEach((box) => {
			const outline = box.getAttribute(AV_OUTLINE);
			const priority = box.getAttribute(AV_OUTLINE_PRIORITY);
			box.removeAttribute(AV_OUTLINE);
			box.removeAttribute(AV_OUTLINE_PRIORITY);
			this.setStyle(box, { outline }, priority === "important");
			this.#outlined.delete(box);
		});
	}

	addJellyfinIcon(eles) {
		eles.forEach((ele) => {
			ele.appendChild(this.#jellyfinIcon.cloneNode(true));
		});
	}

	getOutlinedBox() {
		return new Set(this.#outlined);
	}

	// 清理所有轮廓
	clearAllOutlines() {
		this.#outlined.forEach((box) => {
			this.clearOutlineStyle([box]);
		});
		this.#outlined.clear();
	}

	// 获取轮廓数量
	getOutlinedCount() {
		return this.#outlined.size;
	}

	// 供子类重写的钩子方法
	onCodeFound(code, box, type) {
		// 子类可以重写此方法来处理找到的代码
	}
	// 供子类重写的钩子方法
	onMagnetLinkFound(href, ele) {
		// 子类可以重写此方法来处理找到的代码
	}

	onOutlineAdded(box) {
		// 子类可以重写此方法来处理添加轮廓后的逻辑
	}

	// 通用工具方法
	safeQuerySelector(selector, parent = document) {
		return parent.querySelector(selector);
	}

	safeQuerySelectorAll(selector, parent = document) {
		return Array.from(parent.querySelectorAll(selector));
	}

	// 异步查找代码的方法
	async findCodeAsync() {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(this.findCode());
			}, 0);
		});
	}
}

export default BaseWebHelper;
