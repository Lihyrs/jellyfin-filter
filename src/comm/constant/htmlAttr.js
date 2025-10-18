const PREFIX = "jf-av";
const DEFAULT_CSS_VAR_PREFIX = PREFIX;

const createAttr = (type) => (str) =>
	type === "data" ? `data-${PREFIX}-${str}` : `${PREFIX}-${str}`;

const createDataAttr = createAttr("data");
const createClassName = createAttr("class");

const data = {
	FAKE_TITLE: createDataAttr("fake-title"),
	AV_OUTLINE: createDataAttr("outline"),
	AV_OUTLINE_PRIORITY: createDataAttr("outline-priority"),
	AV_CODE: createDataAttr("code"),
	AV_TEXTOVERFLOW: createDataAttr("textOverflow"),
	AV_NODE_PROCESSED: createDataAttr("processed"),
};

const className = {
	AV_LABEL: createClassName("label"),
	AV_LINK: createClassName("link"),
	AV_LABEL_LINK: createClassName("label-link"),
	AV_LABEL_TEXT: createClassName("label-text"),
	JELLYFIN_ICON: createClassName("jf-icon"),
	AV_EXISTED: createClassName("existed"),
	AV_BOX: createClassName("box"),
	AV_BOX_HIDDEN: createClassName("hidden"),
	AV_BOX_HIGHLIGHT: createClassName("highlight"),
};

export const HTML_ATTRI = { data, className };
export { DEFAULT_CSS_VAR_PREFIX };
