import { HTML_ATTRI, ICONS, DEFAULT_CSS_VAR_PREFIX } from "../../comm/constant";
import logger from "../../lib/Logger";
import getcode from "../../utils/getCode";

const { AV_OUTLINE, AV_OUTLINE_PRIORITY, AV_CODE, AV_NODE_PROCESSED } =
	HTML_ATTRI.data;
const {
	AV_EXISTED,
	AV_BOX,
	AV_LINK,
	JELLYFIN_ICON,
	AV_BOX_HIGHLIGHT,
	AV_BOX_HIDDEN,
} = HTML_ATTRI.className;

class BaseWebHelper {
	#highlighted = new Set();
	#jellyfinIcon = null;
	#codeLink = null;
	#cssVarPrefix = DEFAULT_CSS_VAR_PREFIX;

	// 配置属性 - 改为公有字段，提供更好的TS支持和简洁性
	boxSelector;
	codeSelector;
	magnetSelector;

	constructor(
		{ boxSelector, codeSelector, magnetSelector = "" },
		cssVarPrefix = DEFAULT_CSS_VAR_PREFIX
	) {
		// 参数验证
		if (!boxSelector?.trim() || !codeSelector) {
			throw new Error("boxSelector 和 codeSelector 是必需的参数");
		}

		this.boxSelector = boxSelector.trim();
		this.codeSelector = codeSelector;
		this.magnetSelector = magnetSelector;

		if (cssVarPrefix && cssVarPrefix !== DEFAULT_CSS_VAR_PREFIX) {
			this.#cssVarPrefix = cssVarPrefix.trim();
		}

		this.#initElements();
	}

	#initElements() {
		// 合并初始化方法
		this.#jellyfinIcon = Object.assign(document.createElement("img"), {
			src: ICONS.jellyfin,
			className: JELLYFIN_ICON,
		});

		this.#codeLink = Object.assign(document.createElement("a"), {
			className: AV_LINK,
		});
	}

	setCSSVarPrefix(prefix) {
		this.#cssVarPrefix = `${prefix}`.trim();
		return this; // 支持链式调用
	}

	getCSSVarPrefix() {
		return this.#cssVarPrefix;
	}

	// CSS 变量操作方法
	setCssVariable(key, value, customPrefix = "") {
		const prefix = customPrefix || this.#cssVarPrefix;
		document.documentElement.style.setProperty(`--${prefix}-${key}`, value);
		return this; // 支持链式调用
	}

	getCssVariable(key, customPrefix = "") {
		const prefix = customPrefix || this.#cssVarPrefix;
		return getComputedStyle(document.documentElement)
			.getPropertyValue(`--${prefix}-${key}`)
			.trim();
	}

	setStyle(element, styles, isImportant = false) {
		if (!element?.style) return this;

		const important = isImportant ? "important" : "";
		Object.entries(styles).forEach(([property, value]) => {
			element.style.setProperty(property, value, important);
		});
		return this;
	}

	/**
	 * 在页面中查找作品代码
	 * 使用实例初始化时配置的选择器进行查找
	 * @returns {Map<string, {code: string, box: HTMLElement, codeElement: HTMLElement, type: string}>}
	 *          代码映射表，键为标准化后的作品代码，值为包含详细信息的对象
	 * @example
	 * const codeMap = helper.findCode();
	 * // 返回示例: Map {
	 * //   'ABC123' => {
	 * //     code: 'ABC123',
	 * //     box: <div class="movie-item">...</div>,
	 * //     codeElement: <a class="jf-av-link">ABC123</a>,
	 * //     type: 'movie'
	 * //   }
	 * // }
	 */
	findCode() {
		return this.findCodeWithSelectors(this.boxSelector, this.codeSelector);
	}

	/**
	 * 使用指定的选择器在页面中查找作品代码
	 * 此方法会处理每个找到的作品容器，提取代码并进行标准化处理
	 *
	 * @param {string} boxSelector - 作品容器元素的CSS选择器
	 * @param {string|Function} codeSelector - 代码提取方式，可以是：
	 *        - CSS选择器字符串，用于在容器内查找代码元素
	 *        - 函数，接收容器元素作为参数，返回代码元素
	 * @returns {Map<string, {code: string, box: HTMLElement, codeElement: HTMLElement, type: string}>}
	 *          代码映射表，包含以下属性的对象：
	 *          - code: 标准化后的作品代码（大写）
	 *          - box: 作品容器元素
	 *          - codeElement: 包含代码的DOM元素
	 *          - type: 作品类型（如'movie', 'music'等）
	 * @throws 不会抛出异常，但会在控制台输出警告信息
	 * @example
	 * // 使用CSS选择器
	 * const map1 = helper.findCodeWithSelectors('.movie-item', '.code');
	 *
	 * // 使用函数选择器
	 * const map2 = helper.findCodeWithSelectors('.movie-item', (box) => {
	 *   return box.querySelector('.custom-code-element');
	 * });
	 */
	findCodeWithSelectors(boxSelector, codeSelector) {
		const boxes = document.querySelectorAll(boxSelector);
		if (!boxes.length) {
			logger.warn("该页面没有找到作品");
			return new Map();
		}

		logger.debug("找到作品容器:", boxes);
		const codeMap = new Map();

		for (const box of boxes) {
			const result = this.#processBox(box, codeSelector);
			if (result) {
				codeMap.set(result.code, result);
			}
		}

		return codeMap;
	}

	/**
	 * 处理单个作品容器，提取并处理作品代码
	 * 这是一个私有方法，用于内部处理流程
	 *
	 * @private
	 * @param {HTMLElement} box - 作品容器元素
	 * @param {string|Function} codeSelector - 代码提取选择器或函数
	 * @returns {?{code: string, box: HTMLElement, codeElement: HTMLElement, type: string}}
	 *          成功时返回包含代码信息的对象，失败时返回null
	 * @example
	 * // 内部使用，处理流程：
	 * // 1. 预处理容器元素（添加类名、保存属性）
	 * // 2. 查找代码元素
	 * // 3. 提取并标准化代码
	 * // 4. 处理代码元素（替换为链接）
	 * // 5. 触发onCodeFound回调
	 */
	#processBox(box, codeSelector) {
		this.#processBoxElement(box);

		const codeElement =
			typeof codeSelector === "function"
				? codeSelector(box)
				: box.querySelector(codeSelector);

		if (!codeElement) return null;

		const code = codeElement?.textContent?.trim();
		if (!code) return null;

		const parsed = getcode(code);
		if (!parsed) return null;

		const finalCode = parsed.code.toUpperCase();
		logger.debug("解析到的代码:", finalCode);

		this.#processCodeElement(codeElement, code);
		this.onCodeFound(finalCode, box, codeElement, parsed.type);

		return {
			code: finalCode,
			box,
			type: parsed.type,
			codeElement,
		};
	}

	#processBoxElement(box) {
		if (!box || box.getAttribute(AV_NODE_PROCESSED)) return;

		box.classList.add(AV_BOX);
		box.setAttribute(AV_OUTLINE, box.style.outline);
		box.setAttribute(
			AV_OUTLINE_PRIORITY,
			box.style.getPropertyPriority("outline")
		);
		box.setAttribute(AV_NODE_PROCESSED, "true");
	}

	/**
	 *
	 * @param {HTMLElement} element
	 * @param {string} code
	 * @returns
	 */
	#processCodeElement(element, code) {
		if (!element || element.getAttribute(AV_NODE_PROCESSED)) return;

		const link = this.#codeLink.cloneNode(false);
		link.setAttribute(AV_CODE, code);
		link.textContent = code;
		link.appendChild(this.#jellyfinIcon.cloneNode(true));

		element.firstChild.replaceWith(link);
		element.setAttribute(AV_NODE_PROCESSED, "true");
	}

	// 磁力链接相关方法
	findMagnetLinks(container = document) {
		if (!this.magnetSelector) {
			logger.warn("未配置 magnetSelector");
			return [];
		}

		const magnets = container.querySelectorAll(this.magnetSelector);
		return Array.from(magnets).map((magnet) => {
			const href = magnet.getAttribute("href");
			this.onMagnetLinkFound(href, magnet);

			return {
				element: magnet,
				text: magnet.textContent?.trim(),
				href,
			};
		});
	}

	findMagnetLinksInBox(box) {
		return this.findMagnetLinks(box);
	}

	highlight(boxes) {
		Array.from(boxes).forEach((box) => {
			if (box?.classList) {
				box.classList.add(AV_BOX_HIGHLIGHT);
				this.#highlighted.add(box);
			}
		});
	}

	unHighlight(boxes = null) {
		const finalBoxes = boxes || this.#highlighted;
		Array.from(finalBoxes).forEach((box) => {
			box?.classList.remove(AV_BOX_HIGHLIGHT);
			this.#highlighted.delete(box);
		});
	}

	hideElements(boxes = null) {
		Array.from(boxes).forEach((box) => {
			box?.classList.add(AV_BOX_HIDDEN);
		});
	}

	showElements(boxes = null) {
		Array.from(boxes).forEach((box) => {
			box?.classList.remove(AV_BOX_HIDDEN);
		});
	}

	addExisted(boxes) {
		Array.from(boxes).forEach((box) => {
			if (box?.classList) {
				box.classList.add(AV_EXISTED);
			}
		});
		return this;
	}

	clearExisted(boxes) {
		boxes.forEach((box) => {
			if (box?.classList) {
				box.classList.remove(AV_EXISTED);
			}
		});
		return this;
	}

	clearAllHighlights() {
		this.unHighlight([...this.#highlighted]);
		return this;
	}

	getHighlighted() {
		return new Set(this.#highlighted);
	}

	getHighlightedCount() {
		return this.#highlighted.size;
	}

	// 生命周期钩子 - 供子类重写
	onCodeFound(code, box, codeElement, type) {
		// 子类可以重写此方法
	}

	onMagnetLinkFound(href, element) {
		// 子类可以重写此方法
	}

	// 工具方法
	async findCodeAsync() {
		return Promise.resolve(this.findCode());
	}

	// 验证方法
	validateSelectors() {
		const issues = [];

		if (!document.querySelector(this.boxSelector)) {
			issues.push(`boxSelector "${this.boxSelector}" 未找到匹配元素`);
		}

		if (
			this.magnetSelector &&
			!document.querySelector(this.magnetSelector)
		) {
			issues.push(
				`magnetSelector "${this.magnetSelector}" 未找到匹配元素`
			);
		}

		return issues;
	}
}

export default BaseWebHelper;
