import audioVisFragment from "@glsl/audio_vis/index.frag";
import audioVisVertex from "@glsl/audio_vis/index.vert";
import { CreateModule } from "@lib/Program";
import { NewResourceLoader } from "@lib/ResourceLoader";
import { STORE as programStore } from "@lib/store";
import { attachShader } from "@lib/utils";
import { audioVisStore as store } from "@store/audioVis.store";
import gsap from "gsap";
import { GUI } from "lil-gui";
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
	cameraPosition: {
		idleMode: [0, 1.3, 1.6],
		danceMode: [2, 3, 3],
	},
	cameraLookAt: {
		idleMode: [0, 1, 0],
		danceMode: [0, 0, 0],
	},
};

/** @type {THREE.AnimationMixer} */
let animationMixer;
/** @type {Record<string, THREE.AnimationAction>} */
const animationActions = {};
/** @type {THREE.SpotLight} */
let audioReactiveLight;
/** @type {"idle" | "slow_dance" | "big_dance"} */
let currentAnimation = "idle";
/** @type {GUI} */
let gui;

// ========================================
// Resource Loader
// ========================================
const resources = NewResourceLoader();
resources.queueResources(
	{
		name: "galaxy",
		type: "texture",
		url: "/dance/textures/galaxy_opt.jpg",
	},
	{
		name: "soldier",
		type: "gltf",
		url: "/dance/models/soldier_compressed.glb",
		rejectOnFailure: true,
	},
);

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
	hemiLight.name = "hemisphere_light";
	hemiLight.position.set(0, 20, 0);
	ctx.scene.add(hemiLight);

	/// Add Spot Light (following carkit pattern)
	audioReactiveLight = new THREE.SpotLight();
	audioReactiveLight.color.set(new THREE.Color(CONSTANTS.spotLightColor));
	audioReactiveLight.castShadow = true;
	audioReactiveLight.position.set(0, 5, 0);
	audioReactiveLight.target.position.set(0, 0, 0);
	audioReactiveLight.intensity = 120;
	audioReactiveLight.angle = Math.PI / 5;
	audioReactiveLight.penumbra = 0.01;
	audioReactiveLight.decay = 2.2;
	audioReactiveLight.distance = 200;

	// Configure shadow properties (matching carkit)
	audioReactiveLight.shadow.mapSize.width = 512;
	audioReactiveLight.shadow.mapSize.height = 512;
	audioReactiveLight.shadow.camera.near = 0.5;
	audioReactiveLight.shadow.camera.far = 50;
	audioReactiveLight.name = "audio_reactive_light";

	ctx.scene.add(audioReactiveLight);
	ctx.scene.add(audioReactiveLight.target);

	/// Add Ambient Light (like carkit)
	const ambiLight = new THREE.AmbientLight();
	ctx.scene.add(ambiLight);
}

/**
 * Adds a ground plane to the scene.
 * @param {ProgramTypes.Context} ctx
 */
function addGroundPlane(ctx) {
	const texture = resources.getResource("galaxy");

	const mesh = new THREE.Mesh(
		new THREE.CircleGeometry(30, 30),
		new THREE.MeshStandardMaterial({
			map: texture,
			// color: new THREE.Color(CONSTANTS.bgColor.dark),
		}),
	);
	mesh.rotation.x = -Math.PI / 2;
	mesh.receiveShadow = true;
	mesh.name = "ground_plane";
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
			child.castShadow = true;

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
						u_AudioPlaying: false,
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
}

/**
 * Creates GUI controls for animation weights
 */
function createAnimationGUI() {
	// Clean up existing GUI if it exists
	if (gui) {
		gui.destroy();
	}

	gui = new GUI({ title: "Animation Actions" });

	Object.keys(animationActions).forEach((actionName) => {
		const action = animationActions[actionName];
		gui.add(action, "weight", 0, 1, 0.001).name(actionName).listen().disable();
	});
}

/**
 * Updates audio-reactive lighting effects
 */
function updateAudioReactiveLighting() {
	if (!audioReactiveLight) return;

	const waveForm = store.currentWaveDelta;

	// Adjust light intensity based on audio amplitude
	const baseIntensity = 120;
	const intensityMultiplier = 1 + waveForm.amplitude * 2;
	audioReactiveLight.intensity = baseIntensity * intensityMultiplier;

	// Slightly move light position based on audio energy
	const time = store.elapsedTime;
	const energyOffset = waveForm.energy * 1.5;
	audioReactiveLight.position.x = Math.sin(time * 0.5) * energyOffset;
	audioReactiveLight.position.z = Math.cos(time * 0.3) * energyOffset;

	// Change light color hue based on audio delta
	const hue = (waveForm.delta * 360 + time * 10) % 360;
	audioReactiveLight.color.setHSL(hue / 360, 0.8, 0.6);

	// Slightly adjust spotlight angle based on audio energy
	const baseAngle = Math.PI / 6;
	const angleVariation = waveForm.energy * 0.2;
	audioReactiveLight.angle = baseAngle + angleVariation;
}

/**
 * Switches between animations based on audio delta value
 */
function autoAnimateBaseOnWaveForm() {
	if (store.audioPlayerStatus.value !== "playing") {
		Object.values(animationActions).forEach((action) => {
			const isIdleAction = action._clip.name.includes("idle");
			if (isIdleAction && action.weight !== 1) {
				gsap.to(action, {
					weight: 1,
					duration: 0.2,
					ease: "power2.inOut",
				});
			}
			if (!isIdleAction && action.weight !== 0) {
				gsap.to(action, {
					weight: 0,
					duration: 0.2,
					ease: "power2.inOut",
				});
			}
		});
		currentAnimation = "idle";
		return;
	}

	const waveForm = store.currentWaveDelta;
	const shouldSlowDance = waveForm.delta < 0.05;
	const targetAnimation = shouldSlowDance ? "slow_dance" : "big_dance";

	// Only trigger crossfade if animation type has changed
	if (currentAnimation !== targetAnimation) {
		const idleActions = ["neutral_idle", "happy_idle"];
		const slowDanceMoves = ["chicken"];
		const bigDanceMoves = ["gangnam_style"];

		idleActions.forEach((key) => {
			gsap.to(animationActions[key], {
				weight: 0,
				duration: 0.5,
				ease: "power2.inOut",
			});
		});

		// Crossfade to slow dance moves
		if (targetAnimation === "slow_dance") {
			slowDanceMoves.forEach((key) => {
				gsap.to(animationActions[key], {
					weight: 1,
					duration: 2,
					ease: "power2.inOut",
				});
			});
			bigDanceMoves.forEach((key) => {
				gsap.to(animationActions[key], {
					weight: 0,
					duration: 2,
					ease: "power2.inOut",
				});
			});
		}

		// Crossfade to big dance moves
		if (targetAnimation === "big_dance") {
			bigDanceMoves.forEach((key) => {
				gsap.to(animationActions[key], {
					weight: 1,
					duration: 0.5,
					ease: "power2.inOut",
				});
			});
			slowDanceMoves.forEach((key) => {
				gsap.to(animationActions[key], {
					weight: 0,
					duration: 0.5,
					ease: "power2.inOut",
				});
			});
		}

		currentAnimation = targetAnimation;
	}
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
		const galaxyTexture = resources.getResource("galaxy");
		galaxyTexture.colorSpace = THREE.SRGBColorSpace;
		galaxyTexture.magFilter = galaxyTexture.minFilter = THREE.LinearFilter;

		/// Enable shadows
		ctx.webgl.shadowMap.enabled = true;
		ctx.webgl.shadowMap.type = THREE.PCFSoftShadowMap;

		/// Set Background Color
		const scene = ctx.scene;
		scene.background = galaxyTexture;
		scene.fog = new THREE.Fog(new THREE.Color("#060c15"), 0, 20);
		// scene.background = new THREE.Color(CONSTANTS.bgColor.dark);

		/// Set Camera
		const camera = ctx.camera;
		camera.position.set(...CONSTANTS.cameraPosition.idleMode);
		camera.lookAt(...CONSTANTS.cameraLookAt.idleMode);

		addLights(ctx);
		addGroundPlane(ctx);
		addModel(ctx);
		addAnimationActions(ctx);
		if (programStore.debug.enabled) createAnimationGUI();
	},
	onEventListener: (ctx) => {
		const camera = ctx.camera;
		const character = ctx.scene.getObjectByName("soldier");

		subscribe(programStore.debug, () => {
			if (!programStore.debug.enabled) gui?.destroy();
			else createAnimationGUI();
		});

		// Play idle animation when audio is not playing
		subscribe(store.applicationState, () => {
			if (store.applicationState.value === "idle") {
				currentAnimation = "idle";
				Object.values(animationActions).forEach((action) => {
					const isIdleAction = action._clip.name.includes("idle");
					gsap.to(action, {
						weight: isIdleAction ? 1 : 0,
						duration: 0.5,
						ease: "power2.inOut",
					});
				});
			}
		});

		// Change camera position and lookAt
		// with transition based on application state
		subscribe(store.applicationState, () => {
			if (store.applicationState.value === "dance") {
				// Create temporary camera for calculating target rotation
				const tempCamera = new THREE.PerspectiveCamera();
				tempCamera.position.set(...CONSTANTS.cameraPosition.danceMode);
				tempCamera.lookAt(...CONSTANTS.cameraLookAt.danceMode);

				// Animate position and rotation simultaneously
				gsap.to(camera.position, {
					x: CONSTANTS.cameraPosition.danceMode[0],
					y: CONSTANTS.cameraPosition.danceMode[1],
					z: CONSTANTS.cameraPosition.danceMode[2],
					duration: 1,
					ease: "power2.out",
				});

				gsap.to(camera.rotation, {
					x: tempCamera.rotation.x,
					y: tempCamera.rotation.y,
					z: tempCamera.rotation.z,
					duration: 1,
					ease: "power2.out",
				});
			} else {
				// Create temporary camera for calculating target rotation
				const tempCamera = new THREE.PerspectiveCamera();
				tempCamera.position.set(...CONSTANTS.cameraPosition.idleMode);
				tempCamera.lookAt(...CONSTANTS.cameraLookAt.idleMode);

				// Animate position and rotation simultaneously
				gsap.to(camera.position, {
					x: CONSTANTS.cameraPosition.idleMode[0],
					y: CONSTANTS.cameraPosition.idleMode[1],
					z: CONSTANTS.cameraPosition.idleMode[2],
					duration: 1,
					ease: "power2.out",
				});

				gsap.to(camera.rotation, {
					x: tempCamera.rotation.x,
					y: tempCamera.rotation.y,
					z: tempCamera.rotation.z,
					duration: 1,
					ease: "power2.out",
				});
			}
		});

		// Update audio-reactive shader uniforms
		subscribe(store, () => {
			character.traverse((child) => {
				if (child?.isMesh) {
					/** @type {THREE.WebGLProgramParametersWithUniforms} */
					const shader = child.material.userData.shader;
					const uniforms = shader?.uniforms;

					uniforms.u_Time.value = store.elapsedTime;
					uniforms.u_AudioDelta.value = store.currentWaveDelta.delta;
					uniforms.u_AudioAmplitude.value = store.currentWaveDelta.amplitude;
					uniforms.u_AudioEnergy.value = store.currentWaveDelta.energy;
					uniforms.u_AudioPlaying.value =
						store.audioPlayerStatus.value === "playing";
				}
			});

			// Update GUI controllers to reflect current animation weights
		});
	},
	onAnimate: (ctx) => {
		if (animationMixer) animationMixer.update(ctx.clock.getDelta());
		store.elapsedTime = ctx.clock.getElapsedTime();
		autoAnimateBaseOnWaveForm();
		updateAudioReactiveLighting();
	},
	onDestroy: () => {
		// Clean up GUI when scene is destroyed
		if (gui) {
			gui.destroy();
			gui = null;
		}
		guiControllers = {};
	},
});
