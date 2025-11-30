<template>
	<fixed-float-menu
		direction="bottom"
		:draggable="true"
		:auto-adjust="true"
		@position-change="onPositionChange"
		@direction-change="onDirectionChange">
		<n-icon size="30">
			<img :src="ICONS.menu" alt="菜单图标" />
		</n-icon>

		<template #menu>
			<n-tooltip
				v-for="(obj, index) in menuItems"
				:key="getItemKey(obj, index)"
				trigger="hover"
				:placement="getTooltipPlacement(obj)"
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
import { computed, defineEmits, ref } from "vue";
import FixedFloatMenu from "../components/FixedFloatMenu.vue";
import { ICONS } from "../comm/constant";

// 状态管理
// const state = ref({
// 	isCollectionHidden: false,
// });

const props = defineProps({
	isCollectionHidden: {
		type: Boolean,
		default: false,
	},
});

// 菜单方向状态
const menuDirection = ref("bottom");

const emit = defineEmits([
	"open-setting",
	"batch-open-link",
	"toggle-colle",
	"update:isCollectionHidden",
]);

// 菜单项处理函数
const batchOpenLink = async () => {
	emit("batch-open-link");
};

const toggleCollection = () => {
	// state.value.isCollectionHidden = !state.value.isCollectionHidden;
	// 触发双向绑定更新
	emit("update:isCollectionHidden", !props.isCollectionHidden);
	// 同时触发原有事件（如果需要）
	emit("toggle-colle");
};

const openSetting = () => {
	// state.value.isSettingsOpen = true;
	emit("open-setting");
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
			() => (props.isCollectionHidden ? "显示" : "隐藏") + "合集作品"
		),
		handler: toggleCollection,
		icon: {
			default: ICONS.showAVS,
			active: ICONS.hideAVS,
		},
		// stateKey: "isCollectionHidden",
	},
	{
		id: "settings",
		tooltip: "设置",
		handler: openSetting,
		icon: {
			default: ICONS.settings,
		},
	},
];

// 计算属性
const menuItems = computed(() => menuItemsConfig);

// 根据菜单方向和排列方式计算 tooltip 位置
const getTooltipPlacement = (item, index) => {
	const direction = menuDirection.value;

	// 如果是水平排列的菜单（左右方向）
	if (direction === "left" || direction === "right") {
		// 水平排列时，根据按钮位置决定 tooltip 方向
		return "top"; // 或者根据索引决定
	}

	// 如果是垂直排列的菜单（上下方向）
	if (direction === "top" || direction === "bottom") {
		// 垂直排列时，根据按钮位置决定 tooltip 方向
		return "left"; // 或者根据索引决定
	}

	return "bottom"; // 默认
};

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
	// 使用 props 中的值
	return props[item.stateKey];
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

const onPositionChange = (position) => {
	console.log("位置改变:", position);
};

// 处理菜单方向变化
const onDirectionChange = (direction) => {
	console.log("菜单方向改变:", direction);
	menuDirection.value = direction;
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

img {
	width: 28px;
	height: 28px;
	display: block;
	object-fit: contain;
}
</style>
