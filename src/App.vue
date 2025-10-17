<script setup>
import { provide, ref, inject, onMounted, computed, watch } from "vue";
import { useNotification } from "naive-ui";
import {
	FILTER_AV_HOT_KEY,
	RECOVER_HOT_KEY,
	FETCH_AVS_HOT_KEY,
	GET_COLLECTION_HOT_KEY,
	GLOBAL_STORE_KEY,
} from "./comm/constant";
import { useGlobalStore } from "./store/global";

import SettingModal from "./components/modal/Setting.vue";
import floatMenu from "./views/floatMenu.vue";
import Jellyfin from "./services/Jellyfin";
import FilterHelper from "./helpers/filterHelper";
import getCode from "./utils/getCode";
import KeysEvent from "./lib/KeysEvent";
import { notificationManager as $notification } from "./lib/Notification";
import useCreatePersistedDataShower from "./lib/PersistedDataShower";
import logger from "./lib/Logger";

const emit = defineEmits(["restart"]);

const globalStore = useGlobalStore();
const settingModalShow = ref(!true);
const highlightedAVs = ref(new Set());

let webHelper = null;

const $logger = inject("$logger");
$logger.setLevel("debug");

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
	const url = window.location.href;
	if (!filterHelper?.isUrlSupported(url)) {
		$logger.warn("还没有支持该网站");
		return;
	}

	filterHelper.init(window.location.href);
	webHelper = filterHelper.getCurrentPageHelper();

	if (webHelper) {
		// 初始化 CSS 变量
		webHelper.setCssVariable("outline", emphasisOutlineStyle.value);
	}
	keysEvent.on(FETCH_AVS_HOT_KEY.key, getItemsFromJellyfin);
	keysEvent.on(FILTER_AV_HOT_KEY.key, filter);
	keysEvent.on(RECOVER_HOT_KEY.key, recover);
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

const filter = async function () {
	$logger.debug("begin filter");
	const webHelper = filterHelper.getCurrentPageHelper();
	const webCodes = webHelper.findcode();

	if (webCodes) {
		// 修复：正确的 Map 和 Set 合并语法
		globalStore.updateWebBoxes(
			new Map([...globalStore.web.boxes, ...webCodes])
		);
		globalStore.updateWebCodes(
			// 修复：正确的方法名
			new Set([...globalStore.web.codes, ...webCodes.keys()])
		);
	}
	$logger.debug("webCode:", webCodes);
	if (globalStore.jellyfin.codes.size === 0) {
		await getItemsFromJellyfin();
	}
	if (webCodes && globalStore.jellyfin.codes.size) {
		const jfCodes = new Set(globalStore.jellyfin.codes);
		// logger.debug("check exist:", jfCodes);
		const existCodes = filterHelper.getExistCodes(
			new Set(webCodes.keys()), // 修复：方法调用需要括号
			jfCodes
		);
		logger.debug("check exist:", jfCodes, "--", existCodes);
		if (existCodes.size === 0) return;

		let boxes = [];
		let codeEles = [];

		Array.from(existCodes).forEach((k) => {
			const { box, codeElement } = webCodes.get(k) || {};
			if (box) boxes.push(box);
			if (codeElement) codeEles.push(codeElement);
		});
		// const boxes = Array.from(existCodes) // 修复：将 Set 转为数组
		// 	.map((k) => {
		// 		const obj = webCodes.get(k);
		// 		return {
		// 			box: obj?.box,
		// 		};
		// 	})
		// 	.filter(Boolean);
		if (boxes.length === 0) {
			// 修复：检查数组长度而不是布尔值
			$logger.warn("没有找到作品元素");
			return;
		}
		logger.debug("exist boxes: ", boxes);

		webHelper.highlightExisted(boxes);
		highlightedAVs.value = new Set(boxes);

		if (codeEles.length === 0) {
			// 修复：检查数组长度而不是布尔值
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
	const webHelpter = filterHelper.getCurrentPageHelper();
	webHelpter.unHightExisted(Array.from(highlightedAVs.value));
};
</script>

<template>
	<setting-modal
		v-model:show="settingModalShow"
		v-model:model-value="globalStore.$state.settings"></setting-modal>
	<float-menu @open-setting="handleOpenSetting"></float-menu>
</template>

<style lang="less"></style>
