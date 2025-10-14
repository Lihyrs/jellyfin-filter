[file name]: FixedFloatMenu.vue [file content begin]
<template>
	<div
		class="floating-menu-container"
		:style="containerStyle"
		ref="container"
		@mousedown="startDrag">
		<div
			class="float-main-menu-btn"
			@mouseenter="showMenu"
			@mouseleave="hideMenu">
			<slot></slot>
		</div>

		<div
			class="sub-menu"
			:class="[`sub-menu-${actualDirection}`, { active: isMenuActive }]"
			@mouseenter="showMenu"
			@mouseleave="hideMenu"
			ref="subMenu">
			<slot name="menu"></slot>
		</div>
	</div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, nextTick } from "vue";

export default {
	name: "FloatingMenu",

	props: {
		// 菜单显示方向：left, right, top, bottom
		direction: {
			type: String,
			default: "bottom",
			validator: (value) =>
				["left", "right", "top", "bottom"].includes(value),
		},
		// 初始位置
		initialPosition: {
			type: Object,
			default: () => ({ x: 20, y: 20 }),
		},
		// 是否可拖拽
		draggable: {
			type: Boolean,
			default: true,
		},
		// 是否启用智能方向调整
		autoAdjust: {
			type: Boolean,
			default: true,
		},
	},

	setup(props, { emit }) {
		const container = ref(null);
		const subMenu = ref(null);
		let closeTimeout = null;
		let isDragging = false;
		let dragStartX = 0;
		let dragStartY = 0;
		let initialLeft = props.initialPosition.x;
		let initialTop = props.initialPosition.y;

		// 响应式数据
		const isMenuActive = ref(false);
		const position = ref({
			x: initialLeft,
			y: initialTop,
		});
		const actualDirection = ref(props.direction);

		// 容器样式
		const containerStyle = computed(() => ({
			left: `${position.value.x}px`,
			top: `${position.value.y}px`,
		}));

		// 计算可用空间并调整方向
		const calculateAvailableSpace = () => {
			if (!subMenu.value || !container.value) return props.direction;

			const containerRect = container.value.getBoundingClientRect();
			const subMenuRect = subMenu.value.getBoundingClientRect();

			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;

			// 计算各个方向的可用空间
			const space = {
				top: containerRect.top,
				bottom: viewportHeight - containerRect.bottom,
				left: containerRect.left,
				right: viewportWidth - containerRect.right,
			};

			// 计算菜单在各个方向需要的最小空间
			const menuWidth = subMenuRect.width;
			const menuHeight = subMenuRect.height;

			const requiredSpace = {
				top: menuHeight + 60, // 60px 是主按钮到菜单的距离
				bottom: menuHeight + 60,
				left: menuWidth + 60,
				right: menuWidth + 60,
			};

			// 检查首选方向是否有足够空间
			if (space[props.direction] >= requiredSpace[props.direction]) {
				return props.direction;
			}

			// 如果没有足够空间，选择空间最大的方向
			const availableDirections = Object.entries(space)
				.filter(([dir, space]) => space >= requiredSpace[dir])
				.sort((a, b) => b[1] - a[1]);

			if (availableDirections.length > 0) {
				return availableDirections[0][0];
			}

			// 如果所有方向空间都不足，选择相对空间最大的方向
			const bestDirection = Object.entries(space).sort(
				(a, b) => b[1] - a[1]
			)[0][0];

			return bestDirection;
		};

		// 显示菜单
		const showMenu = async () => {
			clearTimeout(closeTimeout);

			if (props.autoAdjust) {
				// 先显示菜单以计算尺寸
				isMenuActive.value = true;
				await nextTick();

				// 计算最佳方向
				actualDirection.value = calculateAvailableSpace();
			} else {
				actualDirection.value = props.direction;
			}

			isMenuActive.value = true;
			emit("menu-show");
		};

		// 隐藏菜单（带延迟）
		const hideMenu = () => {
			closeTimeout = setTimeout(() => {
				isMenuActive.value = false;
				emit("menu-hide");
			}, 300);
		};

		// 开始拖拽
		const startDrag = (e) => {
			if (
				!props.draggable ||
				e.target.closest(".sub-menu") ||
				e.target
					.closest(".float-main-menu-btn")
					?.classList.contains("active")
			) {
				return;
			}

			isDragging = true;
			dragStartX = e.clientX - position.value.x;
			dragStartY = e.clientY - position.value.y;

			document.addEventListener("mousemove", onDrag);
			document.addEventListener("mouseup", stopDrag);

			e.preventDefault();
		};

		// 拖拽中
		const onDrag = (e) => {
			if (!isDragging) return;

			const newX = e.clientX - dragStartX;
			const newY = e.clientY - dragStartY;

			// 限制在可视区域内
			const maxX =
				window.innerWidth - (container.value?.offsetWidth || 50);
			const maxY =
				window.innerHeight - (container.value?.offsetHeight || 50);

			position.value.x = Math.max(0, Math.min(newX, maxX));
			position.value.y = Math.max(0, Math.min(newY, maxY));
		};

		// 停止拖拽
		const stopDrag = () => {
			isDragging = false;
			document.removeEventListener("mousemove", onDrag);
			document.removeEventListener("mouseup", stopDrag);
			emit("position-change", position.value);
		};

		// 点击外部关闭菜单
		const handleClickOutside = (e) => {
			if (!e.target.closest(".floating-menu-container")) {
				hideMenu();
			}
		};

		// 窗口大小变化时重新计算方向
		const handleResize = () => {
			if (isMenuActive.value && props.autoAdjust) {
				actualDirection.value = calculateAvailableSpace();
			}
		};

		onMounted(() => {
			document.addEventListener("click", handleClickOutside);
			window.addEventListener("resize", handleResize);
		});

		onUnmounted(() => {
			document.removeEventListener("click", handleClickOutside);
			window.removeEventListener("resize", handleResize);
			document.removeEventListener("mousemove", onDrag);
			document.removeEventListener("mouseup", stopDrag);
			clearTimeout(closeTimeout);
		});

		return {
			container,
			subMenu,
			isMenuActive,
			actualDirection,
			containerStyle,
			showMenu,
			hideMenu,
			startDrag,
		};
	},
};
</script>

<style scoped>
.floating-menu-container {
	position: fixed;
	z-index: 1000;
	cursor: move;
	user-select: none;
}

.floating-menu-container:not(.dragging) .float-main-menu-btn {
	cursor: pointer;
}

.float-main-menu-btn {
	width: 50px;
	height: 50px;
	border-radius: 50%;
	background: #fff;
	border: none;
	font-size: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.float-main-menu-btn:hover,
.float-main-menu-btn.active {
	transform: scale(1.1);
}

.sub-menu {
	position: absolute;
	background: white;
	border-radius: 8px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
	padding: 8px;
	opacity: 0;
	visibility: hidden;
	transition: all 0.3s ease;
	display: flex;
	gap: 8px;
	z-index: 1001;
}

/* 方向样式 */
.sub-menu-top {
	bottom: 60px;
	right: 0;
	transform: translateY(10px);
	flex-direction: column;
}

.sub-menu-bottom {
	top: 60px;
	right: 0;
	transform: translateY(-10px);
	flex-direction: column;
}

.sub-menu-left {
	right: 60px;
	bottom: 0;
	transform: translateX(10px);
	flex-direction: row;
}

.sub-menu-right {
	left: 60px;
	bottom: 0;
	transform: translateX(-10px);
	flex-direction: row;
}

.sub-menu.active {
	opacity: 1;
	visibility: visible;
	transform: translate(0, 0);
}
</style>
[file content end]
