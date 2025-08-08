import Stats from "stats.js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { subscribe } from "valtio/vanilla";
import { ev } from "./Events";
import { CreateModule } from "./Program";
import { STORE } from "./store";

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
		if (STORE.debug.enabled) {
			stats = new Stats();
			document.body.appendChild(stats.dom);
		}

		subscribe(STORE.debug, (state) => {
			if (STORE.debug.enabled) {
				stats = new Stats();
				if (document.body.contains(stats.dom))
					document.body.removeChild(stats.dom);
				document.body.appendChild(stats.dom);
			} else {
				document.body.removeChild(stats.dom);
				stats = null;
			}
		});
	},
	onAnimate: (ctx) => {
		if (stats) stats.begin();
	},
	onAfterAnimate: (ctx) => {
		if (stats) stats.end();
	},
});

/**
 * OrbitControlsPlugin provides orbit controls for the camera.
 */
export const OrbitControlsPlugin = CreateModule({
	name: "OrbitControlsPlugin",
	onInit: (ctx) => {
		const camera = ctx.scene.getObjectByName("MainCamera");
		const orbitControls = new OrbitControls(camera, ctx.webgl.domElement);
		orbitControls.enabled = STORE.debug.enabled;
		ctx.provide("OrbitControls", orbitControls);

		subscribe(STORE.debug, () => {
			orbitControls.enabled = STORE.debug.enabled;
		});
	},
});

/**
 * AxesHelperPlugin adds an axes helper to visualize the scene axes.
 */
export const AxesHelperPlugin = CreateModule({
	name: "AxesHelperPlugin",
	onInit: (ctx) => {
		const axesHelper = new THREE.AxesHelper(100);
		axesHelper.name = "AxesHelper";
		axesHelper.visible = STORE.debug.enabled;
		ctx.scene.add(axesHelper);

		subscribe(STORE.debug, () => {
			axesHelper.visible = STORE.debug.enabled;
		});
	},
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
		cameraHelper.visible = STORE.debug.enabled;
		ctx.scene.add(cameraHelper);

		subscribe(STORE.debug, () => {
			cameraHelper.visible = STORE.debug.enabled;
		});
	},
});

export const WindowResizePlugin = CreateModule({
	name: "WindowResizePlugin",
	onEventListener: (ctx) => {
		ev.on("onWindowResize", (e) => {
			// Update the size of the WebGL context
			ctx.webgl.setSize(window.innerWidth, window.innerHeight);

			// Update the size of the composer
			if (ctx.composer)
				ctx.composer.setSize(window.innerWidth, window.innerHeight);

			// Update the camera aspect ratio and projection matrix
			const aspect = window.innerWidth / window.innerHeight;
			const mainCamera = ctx.scene.getObjectByName("MainCamera");
			if (mainCamera) {
				mainCamera.aspect = aspect;
				mainCamera.updateProjectionMatrix();
			}
		});
	},
});
