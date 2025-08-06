<script setup lang="ts">
import { carKitStore } from "@store/carkit.store";
import { Teleport } from "vue";

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
      class="alert alert-info max-w-fit w-full items-end absolute bottom-4 right-4 z-50"
    >
      <div class="text-left">
        <h3 class="font-bold">Car Kit Scene</h3>
        <div class="text-sm">
          Press <kbd class="kbd text-white">SPACE</kbd> to change the car model.
        </div>
      </div>
      <button class="btn btn-xs" @click="onColorThemeChange">
        Change Color Theme
      </button>
    </div>
  </Teleport>
</template>
