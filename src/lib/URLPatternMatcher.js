import { AV_CODE_REG_EXP } from "../comm/constant";
export default class URLPatternMatcher {
	constructor(
		domainPatterns = [],
		pathPatterns = [],
		productPatterns = [],
		options = {}
	) {
		// domainPatterns: 数组，如 ['bus', 'jav', 'javbus']
		// pathPatterns: 数组，如 ['', 'page', 'search', 'genre', ...]
		// productPatterns: 数组，用于匹配特定产品页面的模式（正则表达式字符串或RegExp对象）
		// options: 配置选项

		this.domainPatterns = domainPatterns;
		this.pathPatterns = pathPatterns;
		this.productPatterns = productPatterns;
		this.options = {
			requireTLD: true,
			allowSubdomains: true,
			tldMinLength: 2,
			tldMaxLength: 10,
			protocol: "https",
			caseInsensitive: true,
			pathPrefix: "", // 新增：路径前缀，如 '/cn'
			...options,
		};

		this.regexCache = new Map();
		this.buildRegexes();
	}

	buildRegexes() {
		this.hostReg = this.buildHostRegex();
		this.pathReg = this.buildPathRegex();
		this.productReg = this.buildProductRegex();
		this.urlReg = this.buildFullUrlRegex();
	}

	buildHostRegex() {
		if (this.domainPatterns.length === 0) {
			// 如果没有域名模式，匹配任何域名
			return new RegExp(
				`^${this.options.protocol}:\\/\\/(www\\.)?[a-zA-Z0-9][a-zA-Z0-9-]*\\.[a-zA-Z]{${this.options.tldMinLength},${this.options.tldMaxLength}}`,
				this.options.caseInsensitive ? "i" : ""
			);
		}

		// 对域名模式进行转义处理
		const escapedDomainPatterns = this.domainPatterns.map((pattern) =>
			this.escapeRegExp(pattern)
		);
		const domainPart = `([a-zA-Z0-9-]*?(${escapedDomainPatterns.join(
			"|"
		)})[a-zA-Z0-9-]*?)`;
		const tldPattern = this.options.requireTLD
			? `\\.[a-zA-Z]{${this.options.tldMinLength},${this.options.tldMaxLength}}`
			: "(?:\\.[a-zA-Z]{2,10})?";

		const pattern = `^${this.options.protocol}:\\/\\/${
			this.options.allowSubdomains ? "(www\\.)?" : ""
		}${domainPart}${tldPattern}`;

		return new RegExp(pattern, this.options.caseInsensitive ? "i" : "");
	}

	buildPathRegex() {
		// 合并 pathPatterns 和字符串类型的 productPatterns
		const allPathPatterns = [...this.pathPatterns];

		// 将字符串类型的 productPatterns 添加到路径模式中
		if (this.productPatterns.length > 0) {
			this.productPatterns.forEach((pattern) => {
				if (typeof pattern === "string") {
					// 将字符串产品模式转换为路径模式
					allPathPatterns.push(pattern);
				}
			});
		}

		if (allPathPatterns.length === 0) {
			// 如果没有路径模式，匹配任何路径
			return new RegExp(
				"(?:\\/[^?#]*)?(?:[?#].*)?$",
				this.options.caseInsensitive ? "i" : ""
			);
		}

		const pathPatterns = allPathPatterns.map((pattern) => {
			if (pattern === "") {
				// 处理根路径
				if (this.options.pathPrefix) {
					const escapedPrefix = this.escapeRegExp(
						this.options.pathPrefix
					);
					return `\\/${escapedPrefix}\\/?$`;
				}
				return "\\/?$";
			}

			if (pattern === "page") {
				// 处理分页路径
				if (this.options.pathPrefix) {
					const escapedPrefix = this.escapeRegExp(
						this.options.pathPrefix
					);
					return `\\/${escapedPrefix}\\/page\\/\\d+`;
				}
				return "\\/page\\/\\d+";
			}

			// if (pattern === "search") {
			// 	// 处理搜索路径
			// 	if (this.options.pathPrefix) {
			// 		const escapedPrefix = this.escapeRegExp(
			// 			this.options.pathPrefix
			// 		);
			// 		return `\\/${escapedPrefix}\\/search(?:\\?[^#]*)?`;
			// 	}
			// 	return "\\/search(?:\\?[^#]*)?";
			// }

			// 动态参数模式匹配（如: /genre/:id, /star/:name）
			if (pattern.includes(":")) {
				// 对动态参数路径进行特殊处理
				const parts = pattern.split("/");
				const escapedParts = parts.map((part) => {
					if (part.startsWith(":")) {
						// 动态参数，不转义，替换为匹配非路径字符
						return `[^\\/?#]+`;
					} else {
						// 普通部分，需要转义
						return this.escapeRegExp(part);
					}
				});
				const escapedPattern = escapedParts
					.filter((p) => p)
					.join("\\/");

				if (this.options.pathPrefix) {
					const escapedPrefix = this.escapeRegExp(
						this.options.pathPrefix
					);
					return `\\/${escapedPrefix}\\/${escapedPattern}(?:\\/[^\\/?#]*)?`;
				}
				return `\\/${escapedPattern}(?:\\/[^\\/?#]*)?`;
			}

			// 对普通字符串模式进行转义
			const escapedPattern = this.escapeRegExp(pattern);

			// 处理常见路径格式
			if (pattern.includes(".php")) {
				// PHP文件路径，允许查询字符串和哈希
				if (this.options.pathPrefix) {
					const escapedPrefix = this.escapeRegExp(
						this.options.pathPrefix
					);
					return `\\/${escapedPrefix}\\/${escapedPattern}(?:[?#].*)?$`;
				}
				return `\\/${escapedPattern}(?:[?#].*)?$`;
			}

			// // 处理带括号的路径
			// if (pattern.includes("(") || pattern.includes(")")) {
			// 	// 带括号的路径，允许查询字符串和哈希
			// 	if (this.options.pathPrefix) {
			// 		const escapedPrefix = this.escapeRegExp(
			// 			this.options.pathPrefix
			// 		);
			// 		return `\\/${escapedPrefix}\\/${escapedPattern}(?:[?#].*)?$`;
			// 	}
			// 	return `\\/${escapedPattern}(?:[?#].*)?$`;
			// }

			// 默认处理：转义后的路径，允许子路径
			if (this.options.pathPrefix) {
				const escapedPrefix = this.escapeRegExp(
					this.options.pathPrefix
				);
				return `\\/${escapedPrefix}\\/${escapedPattern}(?:\\/[^\\/?#]*)?`;
			}
			return `\\/${escapedPattern}(?:\\/[^\\/?#]*)?`;
		});

		const pattern = `(?:${pathPatterns.join("|")})(?:[?#].*)?$`;
		return new RegExp(pattern, this.options.caseInsensitive ? "i" : "");
	}

	buildProductRegex() {
		// 收集所有正则表达式类型的productPatterns
		const regexPatterns = [];

		// 添加自定义正则表达式产品模式
		if (this.productPatterns.length > 0) {
			this.productPatterns.forEach((pattern) => {
				if (pattern instanceof RegExp) {
					regexPatterns.push(pattern);
				}
			});
		}

		// 添加 AV_CODE_REG_EXP 中的所有正则表达式
		Object.values(AV_CODE_REG_EXP).forEach((exp) => {
			if (Array.isArray(exp)) {
				exp.forEach((subExp) => regexPatterns.push(subExp));
			} else if (exp instanceof RegExp) {
				regexPatterns.push(exp);
			}
		});

		if (regexPatterns.length === 0) {
			// 如果没有产品模式，返回一个永远不会匹配的正则表达式
			return new RegExp("(?!)", this.options.caseInsensitive ? "i" : "");
		}

		// 构建产品路径模式，用于匹配URL路径部分
		const productPathPatterns = regexPatterns.map((regex) => {
			const source = regex.source;

			// 对于路径匹配，我们需要调整正则表达式，使其匹配URL路径格式
			// 例如，将 `fc2?` 调整为匹配路径的格式
			let processedSource = source;

			// 简化处理：在正则表达式前添加路径分隔符，并确保可以匹配结尾
			if (this.options.pathPrefix) {
				const escapedPrefix = this.escapeRegExp(
					this.options.pathPrefix
				);
				return `\\/${escapedPrefix}\\/?(?:${processedSource})(?:\\/?)?`;
			}
			return `\\/(?:${processedSource})(?:\\/?)?`;
		});

		// 组合所有产品路径模式
		const pattern = `(?:${productPathPatterns.join("|")})(?:[?#].*)?$`;
		return new RegExp(pattern, this.options.caseInsensitive ? "i" : "");
	}

	buildFullUrlRegex() {
		const hostPattern = this.hostReg.source.replace(/^\^|\\\$$/g, "");

		// 合并所有路径模式
		const allPathPatterns = [];

		// 添加普通路径模式
		if (this.pathReg.source !== "(?!)" && this.pathReg.source !== "") {
			const pathPart = this.pathReg.source.replace(/^\^|\\\$$/g, "");
			allPathPatterns.push(pathPart);
		}

		// 添加产品路径模式
		if (
			this.productReg &&
			this.productReg.source !== "(?!)" &&
			this.productReg.source !== ""
		) {
			const productPart = this.productReg.source.replace(
				/^\^|\\\$$/g,
				""
			);
			allPathPatterns.push(productPart);
		}

		// 如果没有路径模式，匹配任何路径
		if (allPathPatterns.length === 0) {
			const pattern = `^${hostPattern}(?:\\/[^?#]*)?(?:[?#].*)?$`;
			return new RegExp(pattern, this.options.caseInsensitive ? "i" : "");
		}

		// 构建完整的URL模式
		const fullPattern = `^${hostPattern}(?:${allPathPatterns.join("|")})`;
		return new RegExp(fullPattern, this.options.caseInsensitive ? "i" : "");
	}

	// 测试URL是否匹配主机模式
	testHost(url) {
		return this.hostReg.test(url);
	}

	// 测试URL是否匹配路径模式
	testPath(url) {
		// 提取URL的路径部分进行测试
		const pathMatch = url.match(
			/^https?:\/\/[^\/?#]+(\/[^?#]*)?(?:[?#].*)?$/
		);
		if (!pathMatch) return false;

		const path = pathMatch[1] || "/";
		return this.pathReg.test(path);
	}

	// 测试URL是否匹配产品模式
	testProduct(url) {
		if (this.productReg.source === "(?!)") {
			return false; // 没有产品模式
		}

		// 提取URL的路径部分进行测试
		const pathMatch = url.match(
			/^https?:\/\/[^\/?#]+(\/[^?#]*)?(?:[?#].*)?$/
		);
		if (!pathMatch) return false;

		const path = pathMatch[1] || "/";
		return this.productReg.test(path);
	}

	// 测试完整URL
	test(url) {
		return this.urlReg.test(url);
	}

	// // 从URL中提取信息
	// extract(url) {
	// 	if (!this.test(url)) return null;

	// 	const result = {
	// 		url,
	// 		matches: {
	// 			host: false,
	// 			path: false,
	// 			product: false,
	// 		},
	// 		extracted: {
	// 			domain: null,
	// 			subdomain: null,
	// 			tld: null,
	// 			path: null,
	// 			query: null,
	// 			hash: null,
	// 			productCode: null,
	// 			productType: null,
	// 			pathPrefix: this.options.pathPrefix,
	// 		},
	// 	};

	// 	// 提取主机信息
	// 	const hostMatch = url.match(this.hostReg);
	// 	if (hostMatch) {
	// 		result.matches.host = true;
	// 		const fullHost = hostMatch[0].replace(/^https?:\/\//, "");
	// 		const hostParts = fullHost.split(".");

	// 		if (hostParts.length >= 2) {
	// 			result.extracted.tld = hostParts.pop();
	// 			result.extracted.domain = hostParts.pop();

	// 			if (hostParts.length > 0) {
	// 				result.extracted.subdomain = hostParts.join(".");
	// 			}
	// 		}
	// 	}

	// 	// 提取路径信息
	// 	const pathMatch = url.match(this.pathReg);
	// 	if (pathMatch) {
	// 		result.matches.path = true;

	// 		// 分离路径、查询和哈希
	// 		const fullPath = pathMatch[0];
	// 		const hashIndex = fullPath.indexOf("#");
	// 		const queryIndex = fullPath.indexOf("?");

	// 		if (hashIndex !== -1) {
	// 			result.extracted.hash = fullPath.substring(hashIndex);
	// 		}

	// 		if (queryIndex !== -1) {
	// 			const endIndex = hashIndex !== -1 ? hashIndex : fullPath.length;
	// 			result.extracted.query = fullPath.substring(
	// 				queryIndex,
	// 				endIndex
	// 			);
	// 		}

	// 		// 提取纯路径
	// 		const pathEndIndex = Math.min(
	// 			queryIndex !== -1 ? queryIndex : fullPath.length,
	// 			hashIndex !== -1 ? hashIndex : fullPath.length
	// 		);
	// 		result.extracted.path = fullPath.substring(0, pathEndIndex) || "/";
	// 	}

	// 	// 提取产品信息
	// 	const productMatch = url.match(this.productReg);
	// 	if (productMatch && this.productReg.source !== "(?!)") {
	// 		result.matches.product = true;

	// 		// 分离路径、查询和哈希
	// 		const fullPath = productMatch[0];
	// 		const hashIndex = fullPath.indexOf("#");
	// 		const queryIndex = fullPath.indexOf("?");

	// 		if (hashIndex !== -1) {
	// 			result.extracted.hash = fullPath.substring(hashIndex);
	// 		}

	// 		if (queryIndex !== -1) {
	// 			const endIndex = hashIndex !== -1 ? hashIndex : fullPath.length;
	// 			result.extracted.query = fullPath.substring(
	// 				queryIndex,
	// 				endIndex
	// 			);
	// 		}

	// 		// 提取纯路径
	// 		const pathEndIndex = Math.min(
	// 			queryIndex !== -1 ? queryIndex : fullPath.length,
	// 			hashIndex !== -1 ? hashIndex : fullPath.length
	// 		);
	// 		const purePath = fullPath.substring(0, pathEndIndex) || "/";

	// 		// 如果之前没有设置路径，设置产品路径
	// 		if (!result.extracted.path) {
	// 			result.extracted.path = purePath;
	// 		}

	// 		// 尝试提取产品编号和类型
	// 		this.extractProductCode(purePath, result.extracted);
	// 	}

	// 	return result;
	// }

	// // 提取产品编号和类型
	// extractProductCode(path, extracted) {
	// 	// 去除路径开头的斜杠
	// 	let cleanPath = path.replace(/^\//, "");

	// 	// 如果设置了路径前缀，先去除路径前缀
	// 	if (this.options.pathPrefix) {
	// 		const prefixPattern = new RegExp(
	// 			`^${this.escapeRegExp(this.options.pathPrefix)}\\/`
	// 		);
	// 		cleanPath = cleanPath.replace(prefixPattern, "");
	// 	}

	// 	// 测试每种AV代码正则表达式
	// 	for (const [type, regex] of Object.entries(this.AV_CODE_REG_EXP)) {
	// 		if (Array.isArray(regex)) {
	// 			// 处理数组类型的正则表达式
	// 			for (const subRegex of regex) {
	// 				const match = cleanPath.match(subRegex);
	// 				if (match && match[0]) {
	// 					extracted.productType = type;
	// 					extracted.productCode = match[0];

	// 					// 提取捕获组（如果有）
	// 					if (match.groups) {
	// 						extracted.productGroups = match.groups;
	// 					} else if (match.length > 1) {
	// 						extracted.productParts = Array.from(match).slice(1);
	// 					}
	// 					return;
	// 				}
	// 			}
	// 		} else {
	// 			const match = cleanPath.match(regex);
	// 			if (match && match[0]) {
	// 				extracted.productType = type;
	// 				extracted.productCode = match[0];

	// 				// 提取捕获组（如果有）
	// 				if (match.groups) {
	// 					extracted.productGroups = match.groups;
	// 				} else if (match.length > 1) {
	// 					extracted.productParts = Array.from(match).slice(1);
	// 				}
	// 				return;
	// 			}
	// 		}
	// 	}
	// }

	// 更新域名模式
	updateDomainPatterns(domainPatterns) {
		this.domainPatterns = domainPatterns;
		this.buildRegexes();
		return this;
	}

	// 更新路径模式
	updatePathPatterns(pathPatterns) {
		this.pathPatterns = pathPatterns;
		this.buildRegexes();
		return this;
	}

	// 更新产品模式
	updateProductPatterns(productPatterns) {
		this.productPatterns = productPatterns;
		this.buildRegexes();
		return this;
	}

	// 更新路径前缀
	updatePathPrefix(pathPrefix) {
		this.options.pathPrefix = pathPrefix;
		this.buildRegexes();
		return this;
	}

	// 批量测试URL
	filter(urls) {
		return urls.filter((url) => this.test(url));
	}

	// 批量测试产品URL
	filterProducts(urls) {
		return urls.filter((url) => this.testProduct(url));
	}

	// 获取正则表达式字符串
	toString() {
		return {
			host: this.hostReg.toString(),
			path: this.pathReg.toString(),
			product: this.productReg.toString(),
			full: this.urlReg.toString(),
		};
	}

	// 转义正则表达式特殊字符
	escapeRegExp(string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}
}
