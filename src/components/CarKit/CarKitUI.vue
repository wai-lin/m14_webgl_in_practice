<script setup lang="ts">
import { carKitStore } from "@store/carkit.store";

const onColorThemeChange = () => {
	if (carKitStore.colorTheme.value === "light") {
		carKitStore.colorTheme.value = "dark";
	} else {
		carKitStore.colorTheme.value = "light";
	}
};
</script>

<template>
	<Teleport to="body">
		<div
			role="alert"
			class="alert alert-warning absolute right-4 bottom-4 z-50 w-full max-w-fit items-end"
		>
			<div class="text-left">
				<h3 class="font-bold">Car Kit Scene</h3>
				<div class="text-sm">
					Press <kbd class="kbd text-base-content">SPACE</kbd> to change the car
					model.
				</div>
			</div>
			<button class="btn btn-xs" @click="onColorThemeChange">
				Change Color Theme
			</button>
		</div>
	</Teleport>
</template>
