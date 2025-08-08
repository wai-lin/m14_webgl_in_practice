<script setup lang="ts">
import { EventsManager } from "@lib/Events";
import { NewProgram } from "@lib/Program";
import { useTemplateRef, watch } from "vue";

const props = defineProps<{
	modules: ProgramTypes.Module[];
}>();

const canvasElement = useTemplateRef("webgl-canvas");

watch(canvasElement, (canvasElement) => {
	// Don't run if canvasElement is not defined
	if (!canvasElement) return;

	/// Inisialize global events listeners
	EventsManager(canvasElement);

	/// Create a new WebGL program
	const p = NewProgram(canvasElement, "post-processor");

	/***** Modules *****/
	p.use(...props.modules);

	p.run();
});
</script>

<template>
	<canvas ref="webgl-canvas"></canvas>
</template>
