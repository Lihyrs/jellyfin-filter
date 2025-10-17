<script setup>
import { provide, ref, inject, onMounted, nextTick } from "vue";
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

const globalStore = useGlobalStore();
const settingModalShow = ref(!true);
const noop = () => {};

const emit = defineEmits(["restart"]);

const $logger = inject("$logger");
$logger.setLevel("debug");

// 在 setup 中获取通知实例
const notification = useNotification();
$notification.setNotification(notification);
const persDataShower = useCreatePersistedDataShower(globalStore);

provide(GLOBAL_STORE_KEY, globalStore);

const handleOpenSetting = () => {
	settingModalShow.value = true;
};
const keysEvent = new KeysEvent({ debug: true });

const jellyfin = new Jellyfin(
	globalStore.settings.url,
	globalStore.settings.apiKey,
	globalStore.settings.userId
);

const filterHelper = new FilterHelper();

onMounted(async () => {
	const url = window.location.href;
	if (!filterHelper.isUrlSupported(url)) {
		$logger.info("还没有支持该网站");
		return;
	}
	filterHelper.init(window.location.href);
	keysEvent.on(FETCH_AVS_HOT_KEY.key, getItemsFromJellyfin);
	keysEvent.on(FILTER_AV_HOT_KEY.key, filter);
	keysEvent.on(RECOVER_HOT_KEY.key, recover);
	await nextTick();
	globalStore.$reset();
	// persDataShower.showPersistedData();
	setTimeout(() => {
		persDataShower.showPersistedData();
	}, 100);
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
	const webCodes = filterHelper.getCodeFormPage();
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
		const existCodes = filterHelper.getExistCodes(
			new Set(webCodes.keys()), // 修复：方法调用需要括号
			jfCodes
		);

		if (existCodes.size === 0) return;
		const boxes = Array.from(existCodes) // 修复：将 Set 转为数组
			.map((k) => webCodes.get(k)?.box)
			.filter(Boolean);
		if (boxes.length === 0) {
			// 修复：检查数组长度而不是布尔值
			$logger.warn("没有找到作品元素");
			return;
		}
		filterHelper.setHighlightStyle(
			boxes,
			globalStore.settings.emphasisOutlineStyle
		);
	} else if (!webCodes) {
		$logger.warn("页面上没有找到番号");
	}
};

const recover = function () {
	filterHelper.clearHighlightStyle();
};
</script>

<template>
	<setting-modal
		v-model:show="settingModalShow"
		v-model:model-value="globalStore.$state.settings"></setting-modal>
	<float-menu @open-setting="handleOpenSetting"></float-menu>
</template>

<style scoped></style>
