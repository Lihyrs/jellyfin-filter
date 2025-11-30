<script setup>
import {
	provide,
	ref,
	inject,
	onMounted,
	computed,
	watch,
	onUnmounted,
} from "vue";
import { useNotification, useDialog } from "naive-ui";
import {
	FILTER_AV_HOT_KEY,
	RECOVER_HOT_KEY,
	FETCH_AVS_HOT_KEY,
	GET_COLLECTION_HOT_KEY,
	GLOBAL_STORE_KEY,
	FILE_SIZE,
} from "./comm/constant";
import { useGlobalStore } from "./store/global";

import SettingModal from "./components/modal/Settings.vue";
import floatMenu from "./views/floatMenu.vue";
import Jellyfin from "./services/Jellyfin";
import FilterHelper from "./helpers/filterHelper";
import getCode from "./utils/getCode";
import KeysEvent from "./lib/KeysEvent";
import { notificationManager as $notification } from "./lib/Notification";
import isValidUrl from "./utils/isValidUrl";
import { batchOpenTab } from "./utils/batchOpenTab";
import { convertToBytes, convertToGB } from "./utils/convert";
import { UNITS } from "./comm/constant";
import logger from "./lib/Logger";
// import logger from "./lib/Logger";
// import logger from "loglevel";

const emit = defineEmits(["restart"]);

const globalStore = useGlobalStore();
const settingModalShow = ref(!true);
const highlightedAVs = ref(new Set());
const curBoxSelector = ref("");
const curCodeSelector = ref("");
const collectAVs = ref(new Set());
const isCollectAVsHidden = ref(false);
const keyEventHandler = new Set();
const isFilterMagnetFile = ref(globalStore.settings.filterMagnetFiles);

let magnets = {};
const filterMagnets = new Set();

const openedBox = new Set();

const dialog = useDialog();

let webHelper = null;

const $logger = inject("$logger");
$logger.setLevel(globalStore.settings.debug ? "debug" : "info");

// 在 setup 中获取通知实例
const notification = useNotification();
$notification.setNotification(notification);
// const persDataShower = useCreatePersistedDataShower(globalStore);

provide(GLOBAL_STORE_KEY, globalStore);

const filterHelper = new FilterHelper();

// 创建响应式的 emphasisOutlineStyle
const emphasisOutlineStyle = computed({
	get: () => globalStore.settings.emphasisOutlineStyle,
	set: (value) => globalStore.updateSetting("emphasisOutlineStyle", value),
});

const finalFiltrFileSize = computed({
	get: () => globalStore.settings.filterMagnetFileSize,
	set: (val) => globalStore.updateSetting("filterMagnetFileSize", val),
});

const avBoxes = computed({
	get: () => {
		const getBox = function (arr) {
			return arr
				.map(({ box }) => {
					return box;
				})
				.filter(Boolean);
		};

		let ret = getBox(Array.from(globalStore.web.boxes.values()));
		if (!ret.length) {
			const tmp = findCurrentPageCodes();
			ret = getBox(Array.from(tmp?.values()));
		}
		return Array.from(ret);
	},
});

const handleOpenSetting = () => {
	settingModalShow.value = true;
};
const keysEvent = new KeysEvent({ debug: true });

const jellyfin = new Jellyfin(
	globalStore.settings.url,
	globalStore.settings.apiKey,
	globalStore.settings.userId
);

onMounted(() => {
	const { href: url, host } = window.location;
	if (!filterHelper?.isUrlSupported(url)) {
		$logger.warn("还没有支持该网站");
		return;
	}

	globalStore.updateWebHost(host);

	filterHelper.init(window.location.href);
	webHelper = filterHelper.getCurrentPageHelper();

	if (webHelper) {
		// 初始化 CSS 变量
		webHelper.setCssVariable("outline", emphasisOutlineStyle.value);
		curBoxSelector.value = webHelper.boxSelector;
		curCodeSelector.value = webHelper.codeSelector;
	}
	const fetchH = keysEvent.on(FETCH_AVS_HOT_KEY.key, getItemsFromJellyfin);
	const filterH = keysEvent.on(FILTER_AV_HOT_KEY.key, filter);
	const recoverH = keysEvent.on(RECOVER_HOT_KEY.key, recover);
	registerMenuCommand();
	keyEventHandler.add(fetchH);
	keyEventHandler.add(filterH);
	keyEventHandler.add(recoverH);

	setTimeout(() => {
		if (isFilterMagnetFile.value) {
			handleFilterMagnetFile(true);
		}
	}, 500);
});

onUnmounted(() => {
	keyEventHandler.values.forEach((h) => {
		if (h) keysEvent.off(h);
	});
});

// 监听 emphasisOutlineStyle 变化
watch(emphasisOutlineStyle, (newValue, oldValue) => {
	if (webHelper && newValue !== oldValue) {
		$logger.debug(`emphasisOutlineStyle 变更: ${oldValue} -> ${newValue}`);
		webHelper.setCssVariable("outline", newValue);
	}
});

const getItemsFromJellyfin = async function () {
	$logger.debug("get items from jellyfin");
	try {
		const items = await jellyfin.fetchItems(
			globalStore.settings.extraFetchParams
		);
		if (items) {
			let codes = new Set();
			items.forEach((item) => {
				const obj = getCode(item.Name);
				if (obj) {
					codes.add(obj.code);
				}
			});
			globalStore.mergeJellyfin({
				originItem: items,
				codes,
			});

			$notification.success({
				title: "从jellyfin获取数据",
				content: `已获取${items.length}个作品`,
			});
		}
	} catch (e) {
		$notification.error({
			title: "从jellyfin获取数据出错",
			content: e.message,
		});
	}
};

const findCurrentPageCodes = function () {
	const webCodes = filterHelper.findCurrentPageCodes();
	if (webCodes) {
		globalStore.updateWebBoxes(
			new Map([...globalStore.web.boxes, ...webCodes])
		);
		globalStore.updateWebCodes(
			new Set([...globalStore.web.codes, ...webCodes.keys()])
		);

		findCollectAV();
	}

	return webCodes || null;
};

const findCollectAV = function () {
	const codePrefixes = globalStore.settings.collectionCodePrefixes.split(",");
	if (codePrefixes.length == 0) return;
	const reg = new RegExp(`^[${codePrefixes.join("|")}]`, "i");
	const codes = Array.from(globalStore.web.codes);
	codes.forEach((code) => {
		if (reg.test(code)) {
			collectAVs.value.add(code);
		}
	});
};

const filter = async function () {
	$logger.debug("begin filter");
	const webHelper = filterHelper.getCurrentPageHelper();
	const webCodes = findCurrentPageCodes();

	$logger.debug("webCode:", webCodes);
	if (globalStore.jellyfin.codes.size === 0) {
		await getItemsFromJellyfin();
	}
	if (webCodes && globalStore.jellyfin.codes.size) {
		const jfCodes = new Set(globalStore.jellyfin.codes);
		let webBoxes = [];
		let webCodeSet = new Set();
		webCodes.forEach((v, k) => {
			const { box } = v;
			if (box) webBoxes.push(box);
			webCodeSet.add(k);
		});
		$logger.debug("web--->:", webCodes, webBoxes, webCodeSet);
		webHelper.highlight(webBoxes);
		highlightedAVs.value = new Set(webBoxes);
		const existCodes = filterHelper.getExistCodes(webCodeSet, jfCodes);
		$logger.debug("check exist:", jfCodes, "--", existCodes);
		if (existCodes.size === 0) {
			$logger.debug("not exist-->", webBoxes);
			return;
		}

		let boxes = [];
		let codeEles = [];

		Array.from(existCodes).forEach((k) => {
			const { box, codeElement } = webCodes.get(k) || {};
			if (box) boxes.push(box);
			if (codeElement) codeEles.push(codeElement);
		});
		if (boxes.length === 0) {
			$logger.warn("没有找到作品元素");
			return;
		}
		$logger.debug("exist boxes: ", boxes);
		webHelper.addExisted(boxes);

		if (codeEles.length === 0) {
			$logger.warn("没有找到番号元素");
			return;
		}
	} else if (!webCodes) {
		$logger.warn("页面上没有找到番号");
	} else {
		$logger.warn("没有获取到jellyfin的数据，请检查设置或网络");
	}
};

const recover = function () {
	const webHelper = filterHelper.getCurrentPageHelper();
	webHelper.unHighlight(highlightedAVs.value);
	highlightedAVs.value.clear();
};

const batchOpenLink = async function (delay = 1500, maxTab = 5) {
	const webHelper = filterHelper.getCurrentPageHelper();

	// 获取要处理的 boxes
	let boxes = webHelper.getHighlighted();
	if (!boxes?.size) {
		boxes = new Set(avBoxes.value);
	}

	const finalBoxes = Array.from(boxes).filter(Boolean);

	if (finalBoxes.length === 0) {
		$logger.log("未找到任何可点击的链接");
		$notification.info({
			title: "提示",
			content: "未找到任何可点击的链接",
		});
		return;
	}

	// 提取链接的优化版本
	const links = new Set();
	finalBoxes.forEach((box) => {
		let href;
		if (box.tagName.toLowerCase() === "a" && box.hasAttribute("href")) {
			href = box.href;
		} else {
			const link = box.querySelector("a[href]");
			href = link?.href;
		}

		// 验证链接有效性
		if (href && isValidUrl(href)) {
			links.add(href);
		}
	});

	if (links.size === 0) {
		$logger.warn("未提取到有效链接");
		return;
	}

	// 检查是否有重复链接
	const isDisjoint = openedBox.isDisjointFrom(links);

	const add2OpenedBox = function (link) {
		openedBox.add(link);
	};

	if (!isDisjoint) {
		const newLinks = links.difference(openedBox);

		dialog.warning({
			title: "发现重复链接",
			content: `找到 ${links.size} 个链接，其中 ${newLinks.size} 个未打开过。是否打开所有链接（包括已打开过的）？`,
			positiveText: "打开所有",
			negativeText: "仅打开新的",
			neutralText: "取消",
			draggable: true,
			onPositiveClick: () => {
				_doBatchOpenTab(Array.from(links), { success: add2OpenedBox });
			},
			onNegativeClick: () => {
				if (newLinks.size > 0) {
					_doBatchOpenTab(Array.from(links), {
						success: add2OpenedBox,
					});
				} else {
					$notification.info({
						title: "提示",
						content: "没有新的链接可打开",
					});
				}
			},
		});
	} else {
		_doBatchOpenTab(Array.from(links), { success: add2OpenedBox });
	}
};

const _doBatchOpenTab = async function (links, options = {}) {
	const { delay = 1500, maxTab = 5, success, failed } = options;
	const ret = await batchOpenTab(links, delay, maxTab, {
		success,
		failed,
	});

	return ret;
};

const handleToggleColle = function () {
	const webHelper = filterHelper.getCurrentPageHelper();
	const finalBoxes = Array.from(collectAVs.value.values());
	if (finalBoxes.length === 0) {
		dialog.warning({
			title: "警告",
			content: "没有合集番号前缀",
		});
		return;
	}
	if (isCollectAVsHidden.value) {
		webHelper.showElements(finalBoxes);
		isCollectAVsHidden.value = false;
	} else {
		webHelper.hideElements(finalBoxes);
		isCollectAVsHidden.value = true;
	}
};

const registerMenuCommand = function () {
	const events = [["设置", showSettingsModal]];
	events.forEach(([title, cb]) =>
		GM_registerMenuCommand(title, () => cb(title))
	);
	// GM_registerMenuCommand(title, () => cb(title));
};
const showSettingsModal = function () {
	settingModalShow.value = true;
};
const handleSettingsSubmit = function (newSettings) {
	$logger.setLevel(newSettings.debug ? "debug" : "info");
	globalStore.updateSettings(newSettings);
};
const handleFilterMagnetFile = function (newValue) {
	const webHelper = filterHelper.getCurrentPageHelper();
	const magnetLinks = webHelper.findMagnetLinks();
	if (!magnetLinks) {
		$notification.warn({
			content: "该页面没有磁力链接",
		});
		return;
	}
	if (magnetLinks.magnets.length === 0) return;
	magnets = magnetLinks;
	logger.debug("magnets: ", magnets);
	filterMagnets.clear();
	magnetLinks.magnets.forEach((magnet) => {
		if (magnet.sizeInBytes < globalStore.settings.filterMagnetFileSize) {
			filterMagnets.add(magnet.boxElement);
		}
	});
	logger.debug("filterMagnets: ", filterMagnets);
	if (filterMagnets.size === 0) return;
	// if (isFilterMagnetFile.value == newValue) return;
	if (!newValue) {
		webHelper.showElements(Array.from(filterMagnets));
		isFilterMagnetFile.value = false;
	} else {
		webHelper.hideElements(Array.from(filterMagnets));
		isFilterMagnetFile.value = true;
	}
	// logger.debug("isFilterMagnetFile: ", isFilterMagnetFile.value);
};
</script>

<template>
	<setting-modal
		v-model:show="settingModalShow"
		:settings="globalStore.settings"
		@submit="handleSettingsSubmit"></setting-modal>
	<float-menu
		@open-setting="handleOpenSetting"
		@batch-open-link="batchOpenLink"
		@toggle-colle="handleToggleColle"
		@filter-magnet-file="handleFilterMagnetFile"
		:filter-file-size="finalFiltrFileSize"
		:is-collection-hidden="isCollectAVsHidden"
		:is-filter-magnet-file="isFilterMagnetFile"></float-menu>
</template>
