export const AV_CODE_REG_EXP = {
	fc2: /(?<![a-z\d])(?:fc2?)\s*[-_]?\s*(?:ppv)?\s*[-_]?\s*(\d{6,8})/i,
	ou: /[a-z\d-]+(?:\.\d{2}){3}/i,
	num2: /(?<![a-z\d])(\d{4,8})[-_](\d{2,4})(?!-\d{2,})/i,
	special:
		/(?<![a-z\d])(s2mbd|t28|t|t38|\d{2}id|mcb3dbd|sm3d2dbd|s2mcr|s2m|91cm|spermmania|fellatiojapan|handjobjapan|cw3d2dbd|mk3d2dbd)[-_](\d{2,6})(?![a-z\d]|\.com)/i,
	uncensored: /(?<![a-z\d])([nk])(\d{3,6})(?![a-z\d]|\.com)/i,
	censored: [
		/(?<=[\W_]\d{3}|^\d{3}|[\W_]|^)(?!(?:vip|top|com)[^a-z])([a-z]{2,9})\s*[-_]\s*(s*\d{2,6})(?!\d|\.com)/i,
		/(?<=[\W_]\d{3}|^\d{3}|[\W_]|^)(?!(?:vip|top|com)[^a-z])([a-z]{3,9})\s*(?:[-_]||0*)?\s*(s*\d{3,6})(hhb\d?|mhb\d?|hd\d?|pl|ps)?(?![a-z\d]|\.com)/i,
	],
};

export const LINK_REG_EXP = {
	magnet: /magnet:\?xt=urn:btih:(?:[\da-f]{40}|[2-7a-z]{32})/i,
	ed2k: /ed2k:\/\/(?:\|.+)+\|\//i,
};

export const FILE_SIZE_REG_EXP = /^\s*(\d+(?:\.\d+)?)\s*([KMGTPE]?B)\s*$/i;

export const COLLECT_AV_CODE_REG_EXP = /[a-zA-Z]/;
