import BaseWebHelper from "./baseWebHelper";
import Fc2Helper from "./fc2Helper";
import JavBusHelper from "./javbusHelper";
import JavdbHelper from "./javdbHelper";
import JavLibraryHelper from "./javlibraryHelper";
import JinjierHelper from "./jinjierHelper";
import { SITE_NAMES } from "../../comm/constant";

const { JAVBUS, JAVDB, JAVLIBRARY, JINJIER, FC2 } = SITE_NAMES;

// 创建站点助手 Map
const SITE_HELPERS = new Map([
	[JAVBUS, JavBusHelper],
	[JAVDB, JavdbHelper],
	[JINJIER, JinjierHelper],
	[FC2, Fc2Helper],
	[JAVLIBRARY, JavLibraryHelper],
]);

export {
	BaseWebHelper,
	Fc2Helper,
	JavBusHelper,
	JavdbHelper,
	JavLibraryHelper,
	JinjierHelper,
	SITE_HELPERS,
};
