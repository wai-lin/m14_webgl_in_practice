<script setup lang="ts">
import { EventsManager } from "@lib/Events";
import {
  CameraHelperPlugin,
  DebugToolsPlugin,
  StatsPlugin,
  WindowResizePlugin,
} from "@lib/Plugins";
import { NewProgram } from "@lib/Program";
import { useTemplateRef, watch } from "vue";

type ModuleReturnType = ReturnType<ProgramTypes.CreateModuleFn>;
const props = defineProps<{
  modules: ModuleReturnType[];
}>();

const canvasElement = useTemplateRef("webgl-canvas");

watch(canvasElement, (canvasElement) => {
  // Don't run if canvasElement is not defined
  if (!canvasElement) return;

  /// Inisialize global events listeners
  EventsManager(canvasElement);

  /// Create a new WebGL program
  const p = NewProgram(canvasElement, "post-processor");

  /***** Plugins *****/
  p.use(
    /** Debuggers **/
    StatsPlugin,
    DebugToolsPlugin,
    CameraHelperPlugin,
    /** Helpers **/
    WindowResizePlugin
  );

  /***** Modules *****/
  p.use(...props.modules);

  p.run();
});
</script>

<template>
  <canvas ref="webgl-canvas"></canvas>
  <slot />
</template>
