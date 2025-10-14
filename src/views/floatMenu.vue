<template>
	<fixed-float-menu
		direction="bottom"
		:draggable="true"
		:auto-adjust="true"
		@menu-show="onMenuShow"
		@menu-hide="onMenuHide"
		@position-change="onPositionChange">
		<n-icon>
			<img :src="menuIcon" alt="菜单图标" />
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
						<n-icon>
							<img
								:src="getIconSrc(obj)"
								:alt="obj.tooltip || '菜单项图标'"
								@error="handleIconError(obj)" />
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

// 图标导入
import menuIcon from "../assets/menu.svg";
import settingsIcon from "../assets/settings.svg";
import batchOpenIcon from "../assets/batchOpen.svg";
import hideAVIcon from "../assets/hideAV.svg";
import showAVIcon from "../assets/showAV.svg";

// 状态管理
const state = {
	isCollectionHidden: false,
};

const emit = defineEmits(["open-setting"]);

// 菜单项处理函数
const batchOpenLink = async () => {};

const toggleCollection = () => {
	state.isCollectionHidden = !state.isCollectionHidden;
	console.log(state.isCollectionHidden ? "隐藏合集作品" : "显示合集作品");
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
			default: batchOpenIcon,
		},
	},
	{
		id: "toggle-collection",
		tooltip: computed(() =>
			state.isCollectionHidden ? "显示合集作品" : "隐藏合集作品"
		),
		handler: toggleCollection,
		icon: {
			default: showAVIcon,
			active: hideAVIcon,
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
			default: settingsIcon,
			// 没有 active 图标，使用默认图标
		},
		stateKey: "isSettingsOpen",
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
		console.error(`执行 ${item.tooltip} 时出错:`, error);
	}
};

const handleIconError = (item) => {
	console.warn(`图标加载失败: ${item.tooltip}`);
};

// 事件处理
const onMenuShow = () => {
	console.log("菜单显示");
};

const onMenuHide = () => {
	console.log("菜单隐藏");
};

const onPositionChange = (position) => {
	console.log("位置改变:", position);
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
