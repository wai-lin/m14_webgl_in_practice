<script setup lang="ts">
import AudioPlayer from "@components/AudioVisualiser/AudioPlayer.vue";
import WebGL from "@components/WebGL.vue";
import { AUDIO_VIS_SCENE } from "@scenes/audio_vis.scene";

const modules: ProgramTypes.Module[] = [
	// CAR_KIT_SCENE,
	// CAR_KIT_POSTPROC,
	// GRID_SHADER_CAMERA,
	// GRID_SHADER_SCENE,
	AUDIO_VIS_SCENE,
];
</script>

<template>
	<WebGL :modules="modules">
		<!-- <CarKitUI /> -->
	</WebGL>
	<AudioPlayer class="fixed bottom-8 left-8" />
</template>
