import { AV_CODE_REG_EXP } from "../comm/constant";
import logger from "../lib/Logger";
/**
 *
 * @param {string} text
 * @param {RegExp} userReg default ""
 * @returns {object{type:string,code:string}}
 */
function getCode(text, userReg = "") {
	logger.debug("getCode");
	let ret = {
			type: "",
			code: "",
		},
		tmp,
		match;

	// 先检查用户自定义正则
	if (userReg) {
		try {
			const userMatch = text.match(new RegExp(userReg, "i"));
			if (userMatch) {
				ret.code = userMatch[0].toUpperCase();
				ret.type = "user";
				return ret;
			}
		} catch (error) {
			logger.error("用户正则表达式错误:", error);
		}
	}
	// logger.debug("--->", Object.entries(AV_CODE_REG_EXP));
	for (const [type, reg] of Object.entries(AV_CODE_REG_EXP)) {
		if (type === "ou" && text.includes("-sample")) return null;

		// logger.debug(text, "--", type, "--", reg);

		if (Array.isArray(reg)) {
			for (const r of reg) {
				// logger.debug("--->in array: ", r);
				match = text.match(r);
				if (match) {
					return _doGetCode(type, match);
				}
			}
		} else {
			match = text.match(reg);
			if (match) return _doGetCode(type, match);
		}
	}

	return null; // 没有找到匹配
}

function _doGetCode(type, match) {
	let ret = {
		type: type,
		code: "",
	};

	let code = "";
	switch (type) {
		case "uncensored":
			code = match[1] + match[2];
			break;
		case "num2":
			// 20210710-001 -> 071021-001
			const num2Match = match[0].match(/20(\d{2})(\d{4})-(\d+)/);
			if (num2Match) {
				code = `${num2Match[1]}${num2Match[2]}-${num2Match[3]}`;
			} else {
				code = match[0];
			}
			break;
		case "ou":
			code = match[0];
			break;
		case "fc2":
			code = `FC2-${match[1]}`;
			break;
		default:
			// 对于其他类型，使用分组匹配
			if (match[1] && match[2]) {
				code = `${match[1]}-${match[2]}`;
			} else {
				code = match[0];
			}
	}
	if (code) {
		ret.code = code.toUpperCase();
		return ret;
	}
	return null;
}

export default getCode;
