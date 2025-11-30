// 常量定义
export const SITE_NAMES = {
	JAVBUS: "javbus",
	JAVLIBRARY: "javlibrary",
	JAVDB: "javdb",
	JINJIER: "jinjier",
	FC2: "fc2",
};

// 站点配置工厂函数
const createSiteConfig = (
	name,
	boxSelector,
	codeSelector,
	urlReg,
	magnetBoxSelector = "",
	magnetPageReg = ""
) => ({
	name,
	boxSelector,
	codeSelector,
	urlReg,
	magnet: {
		selector: magnetBoxSelector,
		pageReg: magnetPageReg,
	},
});

// 站点配置
export const SITE_CONFIGS = {
	JAVBUS: createSiteConfig(
		SITE_NAMES.JAVBUS,
		"a.movie-box",
		"date",
		/^https:\/\/(www\.)?([a-zA-Z0-9-]*?(bus|jav|javbus)[a-zA-Z0-9-]*?)\.[a-zA-Z]{2,}(?=\/?$|\/page\/\d+|\/search|\/genre|\/uncensored|\/star|\/label|\/director|\/studio|\/series|\/[^\/]+)/i,
		"#magnet-table tr",
		/\/[a-zA-Z]{2,}-\d+$/i
	),

	JAVLIBRARY: createSiteConfig(
		SITE_NAMES.JAVLIBRARY,
		".video",
		".id",
		/^https:\/\/(www\.)?javdb\.com(?!\/v\/)/i
		// magnetBoxSelector,
		// magnetPageReg
	),

	JAVDB: createSiteConfig(
		SITE_NAMES.JAVDB,
		".movie-list .item",
		".video-title strong",
		/^https:\/\/www\.javlibrary\.com\/cn(?!(\/tl_bestreviews\.php|\/publicgroups\.php|\/publictopic\.php))/i
		// magnetBoxSelector,
		// magnetPageReg
	),

	JINJIER: {
		name: SITE_NAMES.JINJIER,
		boxSelector: "tbody tr",
		codeSelector: (box) => {
			const td = box.querySelector("td:nth-of-type(3)");
			return td?.textContent?.split(" ")[0] || "";
		},
		urlReg: /^https:\/\/jinjier\.art\/sql.*/i,
		// magnetBoxSelector,
		// magnetPageReg,
	},

	FC2: {
		name: SITE_NAMES.FC2,
		boxSelector: ".flex section .container .relative",
		codeSelector: (box) => {
			const span =
				box.querySelector(".lazyload-wrapper + span") ||
				box.querySelector("a.block + span");
			const code = span?.textContent?.trim();

			if (code && !code.startsWith("fc2") && span) {
				span.textContent = `fc2-${code}`;
				return `fc2-${code}`;
			}
			return code || "";
		},
		urlReg: /https:\/\/fc2ppvdb\.com/i,
		// magnetBoxSelector,
		// magnetPageReg,
	},
};

// 导出各个站点的便捷访问
export const { JAVBUS, JAVLIBRARY, JAVDB, JINJIER, FC2 } = SITE_CONFIGS;
