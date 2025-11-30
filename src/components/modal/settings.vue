<template>
	<n-modal v-model:show="showModal" transform-origin="center">
		<n-card title="设置" class="setting-card">
			<n-form label-placement="left" :model="localSettings">
				<n-grid class="setting-group" :cols="2" :x-gap="24">
					<n-gi v-for="(value, key) in filterSwitch" :key="key">
						<n-form-item
							class="setting-item"
							:show-feedback="false"
							v-if="typeof value === 'boolean'"
							:label="key">
							<n-switch v-model:value="localSettings[key]" />
						</n-form-item>
						<n-form-item
							class="setting-item"
							:show-feedback="false"
							v-else-if="typeof value === 'string'"
							:label="key">
							<n-input
								type="text"
								v-model:value="localSettings[key]"></n-input>
						</n-form-item>
					</n-gi>
				</n-grid>

				<n-grid class="setting-group" :cols="2" :x-gap="24">
					<n-gi v-for="(value, key) in jellyfin" :key="key">
						<n-form-item
							class="setting-item"
							:show-feedback="false"
							v-if="typeof value === 'boolean'"
							:label="key">
							<n-switch v-model:value="localSettings[key]" />
						</n-form-item>
						<n-form-item
							class="setting-item"
							:show-feedback="false"
							v-else-if="typeof value === 'string'"
							:label="key">
							<n-input
								type="text"
								v-model:value="localSettings[key]"></n-input>
						</n-form-item>
					</n-gi>
				</n-grid>
				<n-grid class="setting-group" :cols="2" :x-gap="24">
					<n-gi v-for="(value, key) in html" :key="key">
						<!-- 特殊处理 filterMagnetFileSize -->
						<n-form-item
							class="setting-item"
							:show-feedback="false"
							v-if="key === 'filterMagnetFileSize'"
							:label="key">
							<n-input
								type="number"
								v-model:value="filterMagnetFileSizeGB"
								@update:value="handleFileSizeUpdate"
								:min="0"
								:step="0.1"
								placeholder="输入文件大小(GB)">
								<template #suffix>GB</template>
							</n-input>
						</n-form-item>
						<n-form-item
							class="setting-item"
							:show-feedback="false"
							v-else-if="typeof value === 'boolean'"
							:label="key">
							<n-switch v-model:value="localSettings[key]" />
						</n-form-item>
						<n-form-item
							class="setting-item"
							:show-feedback="false"
							v-else-if="typeof value === 'string'"
							:label="key">
							<n-input
								type="text"
								v-model:value="localSettings[key]"></n-input>
						</n-form-item>
					</n-gi>
				</n-grid>

				<n-grid class="setting-group" :cols="2" :x-gap="24">
					<n-gi v-for="(value, key) in other" :key="key">
						<n-form-item
							class="setting-item"
							:show-feedback="false"
							v-if="typeof value === 'boolean'"
							:label="key">
							<n-switch v-model:value="localSettings[key]" />
						</n-form-item>
						<n-form-item
							class="setting-item"
							:show-feedback="false"
							v-else-if="typeof value === 'string'"
							:label="key">
							<n-input
								type="text"
								v-model:value="localSettings[key]"></n-input>
						</n-form-item>
					</n-gi>
				</n-grid>

				<n-grid class="setting-group" :cols="2" :x-gap="24">
					<n-gi v-for="(value, key) in hotkeys" :key="key">
						<n-form-item
							class="setting-item"
							:show-feedback="false"
							v-if="typeof value === 'boolean'"
							:label="key">
							<n-switch v-model:value="localSettings[key]" />
						</n-form-item>
						<n-form-item
							class="setting-item"
							:show-feedback="false"
							v-else-if="typeof value === 'string'"
							:label="key">
							<n-input
								type="text"
								v-model:value="localSettings[key]"></n-input>
						</n-form-item>
					</n-gi>
				</n-grid>

				<n-grid class="setting-group" :cols="1" :x-gap="24">
					<n-gi>
						<n-form-item
							class="setting-item"
							:show-feedback="false">
							<n-button class="sub-btn" @click="handleSubmit">
								确定
							</n-button>
							<n-button @click="hide">取消</n-button>
						</n-form-item>
					</n-gi>
				</n-grid>
			</n-form>
		</n-card>
	</n-modal>
</template>

<script setup>
import {
	NForm,
	NModal,
	NButton,
	NSwitch,
	NFormItem,
	NInput,
	NCard,
	NGrid,
	NGi,
} from "naive-ui";
import { ref, watch } from "vue";
import {
	jellyfin,
	html,
	hotkeys,
	filterSwitch,
	other,
	defaultSettings,
} from "../../comm/defaultSettings";
import { convertToGB, convertToBytes } from "../../utils/convert";
import { UNITS } from "../../comm/constant";

// Props
const props = defineProps({
	settings: {
		type: Object,
		required: true,
	},
	show: {
		type: Boolean,
		default: false,
	},
});

// Emits
const emit = defineEmits(["update:show", "submit", "cancel"]);

// 根据 props.settings 初始化本地状态
const localSettings = ref({ ...defaultSettings, ...props.settings });
const filterMagnetFileSizeGB = ref(
	convertToGB(localSettings.value.filterMagnetFileSize)
);

// 监听 show prop 的变化
const showModal = ref(props.show);
watch(
	() => props.show,
	(newValue) => {
		showModal.value = newValue;
	}
);

// 监听内部 showModal 的变化并通知父组件
watch(showModal, (newValue) => {
	emit("update:show", newValue);
});

const handleFileSizeUpdate = (gbValue) => {
	if (gbValue === null || gbValue === undefined || gbValue === "") {
		filterMagnetFileSizeGB.value = 0;
		localSettings.value.filterMagnetFileSize = 0;
		return;
	}
	const bytes = convertToBytes(gbValue, UNITS.GB);
	filterMagnetFileSizeGB.value = gbValue; // 保持GB值不变
	localSettings.value.filterMagnetFileSize = bytes;
};

const handleSubmit = () => {
	if (filterMagnetFileSizeGB.value !== undefined) {
		const bytes = convertToBytes(filterMagnetFileSizeGB.value, UNITS.GB);
		localSettings.value.filterMagnetFileSize = bytes;
	}
	emit("submit", { ...localSettings.value });
	showModal.value = false;
};

const hide = () => {
	showModal.value = false;
	emit("cancel");
};

const show = () => {
	showModal.value = true;
};
</script>

<style scoped>
.setting-card {
	padding: 10px;
	max-width: 70%;
}

.setting-group {
	border: 1px solid #656060;
	margin-bottom: 10px;
	padding: 10px;
}

.setting-group:last-child {
	border: unset;
}
.setting-group:last-child .setting-item {
	display: flex;
	justify-content: center;
}
.setting-item {
	margin: 5px 0;
}
.sub-btn {
	margin-right: 20px;
}
</style>
