import { HOT_KEYS, FILE_SIZE } from "./constant";

/**
 * Jellyfin 相关配置
 * @typedef {Object} JellyfinConfig
 * @property {string} apiKey - 从jellyfin控制台获取的API密钥
 * @property {string} url - 服务器地址
 * @property {string} userId - jellyfin中的用户id
 * @property {string} deviceId - 设备Id
 * @property {string} extraSearchParams - 额外的搜索参数
 * @property {string} extraFetchParams - 额外的fetch参数
 * @property {boolean} sortLabelAsc - 默认从小到大排序
 */

/**
 * HTML 相关配置
 * @typedef {Object} HtmlConfig
 * @property {boolean} filterMagnetFiles - 是否开启过滤磁力文件功能
 * @property {number} filterMagnetFileSize - 过滤磁力文件大小,单位字节(bytes)
 * @property {boolean} hideCollectionAV - 是否显示合集作品
 * @property {string} collectionCodePrefixes - 合集番号前缀
 * @property {string} openSite - 点击番号时的默认跳转链接
 * @property {string} secondarySite - 点击番号时按住shift键时的跳转链接
 * @property {string} fc2Site - 若番号被识别为fc2，默认会跳转到的链接
 * @property {string} secondaryFc2Site - 若番号被识别为fc2，按住shift键时跳转的链接
 * @property {string} emphasisOutlineStyle - 高亮卡片边框样式
 * @property {string} javdbOuPath - javdb中欧美列表页面路径
 */

/**
 * 其他配置
 * @typedef {Object} OtherConfig
 * @property {string} userRegexp - 自定义正则表达式
 * @property {string} userRegColor - 自定义正则匹配的高亮颜色
 */

/**
 * 功能开关配置
 * @typedef {Object} FilterSwitch
 * @property {boolean} enable - 是否开启jellyfin功能
 * @property {boolean} debug - 是否开启调试模式
 */

export const jellyfin = {
	// 从jellyfin 控制台获取
	apiKey: "a4be50c24d0d4278b3142cdaee06577d",
	// 服务器地址
	url: "http://192.168.1.235:8096",
	// jellyfin中的用户id，建议填写，否则一些功能不可用，浏览器控制台输入ApiClient._currentUser.Id获取
	userId: "8169d59d9fb049cba8cdd9c201362997",
	// 设备Id，在jellyfin页面按F12打开控制台，输入ApiClient._deviceId获取
	// 仅在你同时在用 embyToLocalPlayer 插件时需要填写 https://greasyfork.org/zh-CN/scripts/448648-embytolocalplayer/feedback
	// 打开本地播放器时需要该参数
	deviceId: "",
	// 额外的搜索参数，格式为：parentId:xxx;isFavorite:true
	extraSearchParams: "",
	// 额外的fetch参数，格式为：limit:200;parentId:xxx
	// limit不填则默认为200，填入0则获取全部数据
	extraFetchParams: "limit:0",
	// 默认从小到大排序
	sortLabelAsc: true,
};

export const html = {
	// 是否开启过滤磁力文件功能
	filterMagnetFiles: true,
	//单位GB
	filterMagnetFileSize: FILE_SIZE,
	// 若为true，则在页面加载完成后自动触发一次过滤
	// triggerOnload: false,
	// 是否显示合集作品
	hideCollectionAV: false,
	// 合集番号前缀，多个前缀用逗号
	collectionCodePrefixes: "",
	// 点击番号时的默认跳转链接，${code}会被替换为真正的番号
	openSite: "https://www.javbus.com/${code}",
	// 点击番号时按住shift键时的跳转链接
	secondarySite: "https://javdb.com/search?q=${code}",
	// 若番号被识别为fc2，默认会跳转到的链接
	fc2Site: "https://sukebei.nyaa.si/user/offkab?q=${code}",
	// 若番号被识别为fc2，按住shift键时跳转的链接
	secondaryFc2Site: "https://missav.live/search/${code}",

	// 高亮卡片边框样式
	emphasisOutlineStyle: "2px solid red",
	// javdb中欧美列表页面不显示完整番号，需要特殊处理
	// 此处用来定义那些需要特殊处理的页面路径，多个路径用逗号或分号分隔
	javdbOuPath: "/western",
};
export const other = {
	// 自定义正则，匹配优先级最低
	// \d*[a-z]+\d*[-_]s*\d{2,}
	userRegexp: "",
	// 自定义正则匹配的高亮颜色
	userRegColor: "orange",
};

export const filterSwitch = {
	// 是否开启jellyfin功能
	enable: true,

	// 设为true时浏览器控制台会输出log
	debug: false,
};

/**
 * 默认设置项
 * @typedef {FilterSwitch & JellyfinConfig & typeof HOT_KEYS & HtmlConfig & OtherConfig} DefaultSettings
 */

/** @type {DefaultSettings} */
export const defaultSettings = {
	...filterSwitch,

	// ---for jellyfin begin
	...jellyfin,
	//---for jellyfin end

	//----hotkeys
	...HOT_KEYS,
	//---web
	...html,
	...other,
};

export const hotkeys = { ...HOT_KEYS };

export default defaultSettings;
