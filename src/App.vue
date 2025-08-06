<script setup lang="ts">
import WebGL from "@components/WebGL.vue";
import { GRID_SHADER_CAMERA, GRID_SHADER_SCENE } from "@scenes/grid_shader.scene";

const modules: ProgramTypes.Module[] = [
  // CAR_KIT_SCENE,
  // CAR_KIT_POSTPROC,
  GRID_SHADER_CAMERA,
  GRID_SHADER_SCENE,
  ];
</script>

<template>
  <WebGL :modules="modules">
    <!-- <CarKitUI /> -->
  </WebGL>
</template>
