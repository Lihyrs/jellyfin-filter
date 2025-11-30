export const GLOBAL_STORE_KEY = "globalStore";
export const UNITS = {
	B: 1,
	KB: 1024,
	MB: 1024 * 1024,
	GB: 1024 * 1024 * 1024,
	TB: 1024 * 1024 * 1024 * 1024,
	PB: 1024 * 1024 * 1024 * 1024 * 1024,
	EB: 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
};
export const FILE_SIZE = 2 * UNITS.GB;

// 自定义快捷键，可以是任意长度的字母或数字
export const FILTER_AV_HOT_KEY = { name: "filterAVHotKey", key: "ee" };
// 脚本会改变页面的原有结构，此处定义可使页面恢复原状的快捷键
export const RECOVER_HOT_KEY = { name: "recoverHotKey", key: "ss" };
// 获取jellyfin数据快捷键
export const FETCH_AVS_HOT_KEY = { name: "fetchAvsHotKey", key: "@@" };
// 获取jellyfin合集信息
export const GET_COLLECTION_HOT_KEY = {
	name: "getCollectionHotKey",
	key: "!!",
};

export const HOT_KEYS = Object.fromEntries(
	[
		FILTER_AV_HOT_KEY,
		RECOVER_HOT_KEY,
		FETCH_AVS_HOT_KEY,
		GET_COLLECTION_HOT_KEY,
	].map(({ name, key }) => [name, key])
);
