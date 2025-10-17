<template>
	<fixed-float-menu
		direction="bottom"
		:draggable="true"
		:auto-adjust="true"
		@position-change="onPositionChange">
		<n-icon size="30">
			<img :src="ICONS.menu" alt="菜单图标" />
		</n-icon>

		<template #menu>
			<n-tooltip
				v-for="(obj, index) in menuItems"
				:key="getItemKey(obj, index)"
				trigger="hover"
				:placement="tooltipPlacement"
				:disabled="!obj.tooltip">
				<template #trigger>
					<n-button
						circle
						:type="getButtonType(obj)"
						:disabled="obj.disabled"
						:loading="obj.loading"
						@click="handleItemClick(obj)">
						<n-icon size="28px">
							<img
								:src="getIconSrc(obj)"
								:alt="obj.tooltip || '菜单项图标'" />
						</n-icon>
					</n-button>
				</template>
				{{ obj.tooltip }}
			</n-tooltip>
		</template>
	</fixed-float-menu>
</template>

<script setup>
import { NButton, NIcon, NTooltip } from "naive-ui";
import { computed, defineEmits } from "vue";
import FixedFloatMenu from "../components/FixedFloatMenu.vue";
import { ICONS } from "../comm/constant";

// 状态管理
const state = {
	isCollectionHidden: false,
};

const emit = defineEmits(["open-setting"]);

// 菜单项处理函数
const batchOpenLink = async () => {};

const toggleCollection = () => {
	state.isCollectionHidden = !state.isCollectionHidden;
	$logger.log(state.isCollectionHidden ? "隐藏合集作品" : "显示合集作品");
};

const openSetting = () => {
	state.isSettingsOpen = true;
	emit("open-setting");
	// 打开设置面板的逻辑
};
// 菜单项配置
const menuItemsConfig = [
	{
		id: "batch-open",
		tooltip: "批量打开作品",
		handler: batchOpenLink,
		icon: {
			default: ICONS.batchOpenLink,
		},
	},
	{
		id: "toggle-collection",
		tooltip: computed(
			() => (state.isCollectionHidden ? "显示" : "隐藏") + "合集作品"
		),
		handler: toggleCollection,
		icon: {
			default: ICONS.showAVS,
			active: ICONS.hideAVS,
		},
		stateKey: "isCollectionHidden",
		// type: computed(() =>
		// 	state.isCollectionHidden ? "warning" : "default"
		// ),
	},
	{
		id: "settings",
		tooltip: "设置",
		handler: openSetting,
		icon: {
			default: ICONS.settings,
			// 没有 active 图标，使用默认图标
		},
		// type: computed(() => (state.isSettingsOpen ? "primary" : "default")),
	},
];

// 计算属性
const menuItems = computed(() => menuItemsConfig);
const tooltipPlacement = computed(() => "left");

// 方法
const getItemKey = (item, index) => item.id || index;

const getIconSrc = (item) => {
	// 如果有 active 图标且对应状态为 true，使用 active 图标
	if (item.icon.active && getItemState(item)) {
		return item.icon.active;
	}
	// 否则使用默认图标
	return item.icon.default;
};

const getItemState = (item) => {
	return state[item.stateKey];
};

const getButtonType = (item) => {
	if (item.type && typeof item.type === "function") {
		return item.type.value;
	}
	return item.type || "default";
};

const handleItemClick = async (item) => {
	if (item.disabled || item.loading?.value) return;

	try {
		await item.handler();
	} catch (error) {
		$logger.error(`执行 ${item.tooltip} 时出错:`, error);
	}
};

// const handleIconError = (item) => {
// 	// $logger.warn(`图标加载失败: ${item.tooltip}`);
// };

// // 事件处理
// const onMenuShow = () => {
// 	// $logger.log("菜单显示");
// };

// const onMenuHide = () => {
// 	// $logger.log("菜单隐藏");
// };

const onPositionChange = (position) => {
	// $logger.log("位置改变:", position);
};
</script>

<style scoped>
/* 自定义样式 */
.n-button {
	transition: all 0.3s ease;
}

.n-button:hover {
	transform: scale(1.05);
}

/* img {
	width: 28px;
	height: 28px;
} */

/* .n-button[disabled] {
	opacity: 0.6;
	cursor: not-allowed;
} */

/* 图标样式 */
/* .n-icon img {
	display: block;
	width: 20px;
	height: 20px;
	object-fit: contain;
} */
</style>
