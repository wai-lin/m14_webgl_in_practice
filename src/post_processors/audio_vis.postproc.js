import postprocFrag from "@glsl/audio_vis/postproc.frag";
import postprocVert from "@glsl/audio_vis/postproc.vert";
import { CreateModule } from "@lib/Program";
import { audioVisStore as store } from "@store/audioVis.store";
import { PixelationEffect, ShaderPass } from "postprocessing";
import * as THREE from "three";
import { subscribe } from "valtio/vanilla";

const material = new THREE.ShaderMaterial({
	uniforms: {
		u_Texture: { value: null },
		u_BarrelStrength: { value: 0.94 },
		u_AudioDelta: { value: 0.0 },
		u_AudioThresholdExceed: { value: false },
		u_AudioPlaying: { value: false },
	},
	vertexShader: postprocVert,
	fragmentShader: postprocFrag,
});

const pixelationEffect = new PixelationEffect(2);
let chromaPass;

export const AUDIO_VIS_POSTPROC = CreateModule({
	name: "AudioVisPostProcessor",
	onInit: (ctx) => {
		ctx.composer.addPass(new ShaderPass(material, "u_Texture"));
	},
	onEventListener: (ctx) => {
		subscribe(store.audioPlayerStatus, () => {
			const isAudioPlaying = store.audioPlayerStatus.value === "playing";
			material.uniforms.u_AudioPlaying.value = isAudioPlaying;
		});

		subscribe(store.currentWaveDelta, () => {
			const hasExceededThreshold =
				store.currentWaveDelta.delta > store.danceThreshold.value;
			if (hasExceededThreshold)
				console.log("Audio threshold exceeded:", store.currentWaveDelta.delta);

			material.uniforms.u_AudioThresholdExceed.value = hasExceededThreshold;
			material.uniforms.u_AudioDelta.vallue = store.currentWaveDelta.delta;
		});
	},
});
