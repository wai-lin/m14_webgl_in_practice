import * as THREE from "three";
import Stats from "stats.js";
import { OrbitControls } from "three/addons/controls/OrbitControls";
import { CreateModule } from "./Program";

/** @type {Stats} */
let stats;
/**
 * StatsPlugin provides performance statistics.
 *
 * > **IMPORTANT!!!**
 * >
 * > Register this plugin at the very first in the program to ensure it captures the frame.
 */
export const StatsPlugin = CreateModule({
  name: "StatsPlugin",
  onInit: () => {
    stats = new Stats();
    document.body.appendChild(stats.dom);
  },
  onAnimate: (ctx) => {
    stats.begin();
  },
  onAfterAnimate: (ctx) => {
    stats.end();
  },
  // TODO: Toggle Stats with Event Listener
});

/**
 * DebugToolsPlugin provides basic debugging tools.
 *
 * - `OrbitControls` for camera manipulation.
 * - `AxesHelper` for visualizing axes.
 *
 * You can access the `OrbitControls` instance via `ctx.get("OrbitControls")`.
 */
export const DebugToolsPlugin = CreateModule({
  name: "DebugToolsPlugin",
  onInit: (ctx) => {
    const camera = ctx.scene.getObjectByName("MainCamera");
    ctx.provide(
      "OrbitControls",
      new OrbitControls(camera, ctx.webgl.domElement)
    );

    const axesHelper = new THREE.AxesHelper(100);
    ctx.scene.add(axesHelper);
  },
  // TODO: Toggle Debug Tools with Event Listener
});

/**
 * CameraHelperPlugin adds a camera helper to visualize the `PerspectiveCamera`.
 */
export const CameraHelperPlugin = CreateModule({
  name: "CameraHelperPlugin",
  onInit: (ctx) => {
    /** @type {THREE.PerspectiveCamera} */
    const camera = ctx.scene.getObjectByName("MainCamera");
    const helperCamera = camera.clone();
    helperCamera.name = "HelperCamera";

    const cameraHelper = new THREE.CameraHelper(helperCamera);
    ctx.scene.add(cameraHelper);
  },
});
