import audioVisFragment from "@glsl/audio_vis/index.frag";
import audioVisVertex from "@glsl/audio_vis/index.vert";
import { CreateModule } from "@lib/Program";
import { NewResourceLoader } from "@lib/ResourceLoader";
import { attachShader } from "@lib/utils";
import { audioVisStore as store } from "@store/audioVis.store";
import * as THREE from "three";
import { subscribe } from "valtio/vanilla";

// ========================================
// Variables
// ========================================
const CONSTANTS = {
	bgColor: {
		light: "#f8fafc",
		dark: "#0f172b",
	},
	spotLightColor: "#faffd0",
};

/** @type {THREE.AnimationMixer} */
let animationMixer;
/** @type {Record<string, THREE.AnimationAction>} */
const animationActions = {};

// ========================================
// Resource Loader
// ========================================
const resources = NewResourceLoader();
resources.queueResources({
	name: "soldier",
	type: "gltf",
	url: "/dance/models/soldier.glb",
	rejectOnFailure: true,
});

// ========================================
// Functions
// ========================================
/**
 * Adds lights to the scene.
 * @param {ProgramTypes.Context} ctx
 */
function addLights(ctx) {
	/// Add Hemisphere Light
	const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
	hemiLight.position.set(0, 20, 0);
	ctx.scene.add(hemiLight);
}

/**
 * Adds a ground plane to the scene.
 * @param {ProgramTypes.Context} ctx
 */
function addGroundPlane(ctx) {
	const mesh = new THREE.Mesh(
		new THREE.CircleGeometry(30, 30),
		new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false }),
	);
	mesh.rotation.x = -Math.PI / 2;
	mesh.receiveShadow = true;
	ctx.scene.add(mesh);
}

/**
 * Adds a model to the scene.
 * @param {ProgramTypes.Context} ctx
 */
function addModel(ctx) {
	/** @type {import("three/addons/loaders/GLTFLoader.js").GLTF} */
	const character = resources.getResource("soldier");
	const model = character.scene;
	model.name = "soldier";
	model.position.set(0, 0, 0);
	model.traverse((child) => {
		if (child?.isMesh) {
			/** @type {THREE.MeshPhysicalMaterial} */
			const material = child.material;
			material.onBeforeCompile = (shader) => {
				child.material.userData.shader = shader;

				attachShader({
					vertexShader: audioVisVertex,
					fragmentShader: audioVisFragment,
					uniforms: {
						u_Time: 0,
						u_AudioDelta: 0,
						u_AudioAmplitude: 0,
						u_AudioEnergy: 0,
					},
				})(shader);
			};
		}
	});
	ctx.scene.add(model);
}

/**
 * Adds animation actions to the model.
 * @param {ProgramTypes.Context} ctx
 */
function addAnimationActions(ctx) {
	/** @type {import("three/addons/loaders/GLTFLoader.js").GLTF} */
	const character = resources.getResource("soldier");
	const model = ctx.scene.getObjectByName("soldier");
	const animations = character.animations;

	animationMixer = new THREE.AnimationMixer(model);
	animations.forEach((animation) => {
		const action = animationMixer.clipAction(animation);
		animationActions[animation.name] = action;
		action.play();
	});
	// TODO: Add idle animation
}

/**
 * Switches between animations based on audio delta value
 */
function autoAnimateBaseOnWaveForm() {
	if (store.audioPlayerStatus !== "playing") {
		Object.values(animationActions).forEach((action) => {
			action.weight = 0;
		});
		return;
	}

	const waveForm = store.currentWaveDelta;
	const shouldSlowDance = waveForm.delta < 0.05;

	const slowDanceMoves = ["chicken", "hiphop"];
	const bigDanceMoves = ["gangnam_style", "shuffling"];

	slowDanceMoves.forEach((key) => {
		animationActions[key].weight = shouldSlowDance ? 1 : 0;
	});
	bigDanceMoves.forEach((key) => {
		animationActions[key].weight = shouldSlowDance ? 0 : 1;
	});
}

// ========================================
// Scene
// ========================================
export const AUDIO_VIS_SCENE = CreateModule({
	name: "AudioVisScene",
	onLoad: async (ctx) => {
		await resources.loadResources();
	},
	onInit: (ctx) => {
		const scene = ctx.scene;
		scene.background = new THREE.Color(CONSTANTS.bgColor.light);

		/// Set Camera
		const camera = ctx.camera;
		camera.position.set(2, 3, 3);
		camera.lookAt(0, 0, 0);

		addLights(ctx);
		addGroundPlane(ctx);
		addModel(ctx);
		addAnimationActions(ctx);
	},
	onEventListener: (ctx) => {
		// TODO: Play idle animation when audio is not playing
		const character = ctx.scene.getObjectByName("soldier");

		subscribe(store, () => {
			character.traverse((child) => {
				if (child?.isMesh) {
					/** @type {THREE.WebGLProgramParametersWithUniforms} */
					const shader = child.material.userData.shader;
					const uniforms = shader.uniforms;

					uniforms.u_Time.value = store.elapsedTime;
					uniforms.u_AudioDelta.value = store.currentWaveDelta.delta;
					uniforms.u_AudioAmplitude.value = store.currentWaveDelta.amplitude;
					uniforms.u_AudioEnergy.value = store.currentWaveDelta.energy;
				}
			});
		});
	},
	onAnimate: (ctx) => {
		if (animationMixer) animationMixer.update(ctx.clock.getDelta());
		store.elapsedTime = ctx.clock.getElapsedTime();
		autoAnimateBaseOnWaveForm();
	},
});
