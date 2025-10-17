const PREFIX = "jf-av";
const DEFAULT_CSS_VAR_PREFIX = PREFIX;

const createAttr = (type) => (str) =>
	type === "data" ? `data-${PREFIX}-${str}` : `${PREFIX}-${str}`;

const createDataAttr = createAttr("data");
const createClassName = createAttr("class");

// 统一配置
const CONFIG = {
	data: [
		"fake-title",
		"outline",
		"outline-priority",
		"code",
		"textOverflow",
		"processed",
	],
	class: [
		"label",
		"link",
		"label-link",
		"label-text",
		"jf-icon",
		"existed",
		"box",
	],
};

// 自动生成
const data = Object.fromEntries(
	CONFIG.data.map((key) => [
		key.toUpperCase().replace(/-/g, "_"),
		createDataAttr(key),
	])
);

const className = Object.fromEntries(
	CONFIG.class.map((key) => [
		key.toUpperCase().replace(/-/g, "_"),
		createClassName(key),
	])
);

export const HTML_ATTRI = { data, className };
export { DEFAULT_CSS_VAR_PREFIX };
