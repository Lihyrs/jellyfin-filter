<!-- AppWrapper.vue -->
<script setup>
import { NNotificationProvider, NDialogProvider } from "naive-ui";
import App from "./App.vue";
</script>

<template>
	<n-notification-provider>
		<n-dialog-provider><App /></n-dialog-provider>
	</n-notification-provider>
</template>


