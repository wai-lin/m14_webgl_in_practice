<script setup lang="ts">
import AudioPlayer from "@components/AudioVisualiser/AudioPlayer.vue";
import WebGL from "@components/WebGL.vue";
import {
	OrbitControlsPlugin,
	StatsPlugin,
	WindowResizePlugin,
} from "@lib/Plugins";
import { AUDIO_VIS_POSTPROC } from "@post_processors/audio_vis.postproc";
import { AUDIO_VIS_SCENE } from "@scenes/audio_vis.scene";

const modules: ProgramTypes.Module[] = [
	/** Debuggers **/
	StatsPlugin,
	OrbitControlsPlugin,
	// AxesHelperPlugin,
	// CameraHelperPlugin,

	/** Helpers **/
	WindowResizePlugin,

	/** Scenes **/
	AUDIO_VIS_SCENE,

	/** Post-Processing **/
	AUDIO_VIS_POSTPROC,
];
</script>

<template>
	<WebGL :modules="modules" />
	<AudioPlayer class="fixed bottom-8 left-8" />
</template>
