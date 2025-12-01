import URLPatternMatcher from "../../lib/URLPatternMatcher";
export const SITE_NAMES = {
	JAVBUS: "javbus",
	JAVLIBRARY: "javlibrary",
	JAVDB: "javdb",
	JINJIER: "jinjier",
	FC2: "fc2",
};
// 修改站点配置工厂函数，支持路径前缀
const createSiteConfig = (
	name,
	boxSelector,
	codeSelector,
	domainPatterns,
	pathPatterns,
	magnetBoxSelector = "",
	magnetPatterns = [],
	options = {}
) => ({
	name,
	boxSelector,
	codeSelector,
	urlReg: new URLPatternMatcher(
		domainPatterns,
		pathPatterns,
		magnetPatterns,
		options
	),
	magnet: {
		selector: magnetBoxSelector,
	},
});

// 站点配置（更新后）
export const SITE_CONFIGS = {
	JAVBUS: createSiteConfig(
		SITE_NAMES.JAVBUS,
		"a.movie-box",
		"date",
		["bus", "jav", "javbus"],
		[
			"",
			"page",
			"search",
			"genre",
			"uncensored",
			"star",
			"label",
			"director",
			"studio",
			"series",
		],
		"#magnet-table tr"
	),

	JAVLIBRARY: createSiteConfig(
		SITE_NAMES.JAVLIBRARY,
		".video",
		".id",
		["javdb"],
		["v"],
		"", // magnetBoxSelector
		[], // magnetPatterns
		{ pathPrefix: "cn" } // 新增路径前缀
	),

	JAVDB: createSiteConfig(
		SITE_NAMES.JAVDB,
		".movie-list .item",
		".video-title strong",
		["javlibrary"],
		["tl_bestreviews.php", "publicgroups.php", "publictopic.php"],
		"", // magnetBoxSelector
		[], // magnetPatterns
		{ pathPrefix: "cn" } // 新增路径前缀
	),

	JINJIER: createSiteConfig(
		SITE_NAMES.JINJIER,
		"tbody tr",
		(box) => {
			const td = box.querySelector("td:nth-of-type(3)");
			return td?.textContent?.split(" ")[0] || "";
		},
		["jinjier"],
		["sql"]
	),

	FC2: createSiteConfig(
		SITE_NAMES.FC2,
		".flex section .container .relative",
		(box) => {
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
		["fc2ppvdb"]
	),
};
