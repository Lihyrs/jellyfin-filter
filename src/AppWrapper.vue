<!-- AppWrapper.vue -->
<script setup>
import { NNotificationProvider } from "naive-ui";
import App from "./App.vue";
</script>

<template>
	<n-notification-provider>
		<App />
	</n-notification-provider>
</template>
