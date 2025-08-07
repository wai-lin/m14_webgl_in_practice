<script setup>
import { audioVisStore } from "@store/audioVis.store.js";
import { onMounted, reactive, ref, useTemplateRef } from "vue";

/** @type {AudioContext} */
let audioContext;
/** @type {AudioBufferSourceNode} */
let source;
/** @type {AnalyserNode} */
let analyser;
/** @type {number} */
let bufferLength;
/** @type {import("vue").Ref<Uint8Array<ArrayBuffer>>} */
let dataArray = ref(new Uint8Array());

const waveformCanvas = useTemplateRef("waveform-canvas");
const audioSource = useTemplateRef("audio-source");
const audioElement = useTemplateRef("audio-element");

// Create a reactive snapshot of the store for Vue
const audioData = reactive({ ...audioVisStore.currentWaveDelta });

function drawWaveform() {
	if (!waveformCanvas.value || !analyser) return;

	// Continue drawing regardless of play state to maintain the loop
	requestAnimationFrame(drawWaveform);

	// Only process and draw when playing
	if (audioVisStore.audioPlayerStatus.value !== "playing") {
		// Clear canvas when not playing
		const canvas = waveformCanvas.value;
		const c = canvas.getContext("2d");
		c.fillStyle = "black";
		c.fillRect(0, 0, canvas.width, canvas.height);
		return;
	}

	const canvas = waveformCanvas.value;
	const c = canvas.getContext("2d");

	analyser.getByteTimeDomainData(dataArray.value);

	// Calculate wave delta for shader effects
	let totalDelta = 0;
	let maxAmplitude = 0;
	let avgAmplitude = 0;

	for (let i = 0; i < bufferLength; i++) {
		const normalized = (dataArray.value[i] - 128) / 128.0; // Convert to -1 to 1 range
		const amplitude = Math.abs(normalized);
		avgAmplitude += amplitude;
		maxAmplitude = Math.max(maxAmplitude, amplitude);

		// Calculate delta from previous sample for frequency change detection
		if (i > 0) {
			const prevNormalized = (dataArray.value[i - 1] - 128) / 128.0;
			totalDelta += Math.abs(normalized - prevNormalized);
		}
	}

	avgAmplitude /= bufferLength;
	const normalizedDelta = totalDelta / bufferLength;

	// Assign values directly to the store for proper Valtio reactivity
	const waveDelta = {
		delta: Number(normalizedDelta.toPrecision(6)),
		amplitude: Number(avgAmplitude.toPrecision(6)),
		maxAmplitude: Number(maxAmplitude.toPrecision(6)),
		energy: Number((avgAmplitude * normalizedDelta).toPrecision(6)),
	};

	audioVisStore.currentWaveDelta.delta = waveDelta.delta;
	audioVisStore.currentWaveDelta.amplitude = waveDelta.amplitude;
	audioVisStore.currentWaveDelta.maxAmplitude = waveDelta.maxAmplitude;
	audioVisStore.currentWaveDelta.energy = waveDelta.energy;

	audioData.delta = waveDelta.delta;
	audioData.amplitude = waveDelta.amplitude;
	audioData.maxAmplitude = waveDelta.maxAmplitude;
	audioData.energy = waveDelta.energy;

	c.fillStyle = "black";
	c.fillRect(0, 0, canvas.width, canvas.height);

	c.lineWidth = 2;
	c.strokeStyle = "lime";

	c.beginPath();

	const sliceWidth = (canvas.width * 1.0) / bufferLength;
	let x = 0;

	for (let i = 0; i < bufferLength; i++) {
		const v = dataArray.value[i] / 128.0;
		const y = (v * canvas.height) / 2;

		if (i === 0) c.moveTo(x, y);
		else c.lineTo(x, y);

		x += sliceWidth;
	}

	c.lineTo(canvas.width, canvas.height / 2);
	c.stroke();
}

/**
 * Sets up audio context and analyser for a given audio URL
 * @param {string} audioUrl - The URL of the audio file
 */
const setupAudioAnalysis = async (audioUrl) => {
	if (audioContext) audioContext.close();
	audioContext = new window.AudioContext();

	// Set the audio element source
	if (audioSource.value) {
		audioSource.value.src = audioUrl;
		audioElement.value.load();
	}

	// Set up analyser
	analyser = audioContext.createAnalyser();
	analyser.fftSize = 2048;
	bufferLength = analyser.fftSize;
	dataArray.value = new Uint8Array(bufferLength);

	// Connect audio element to analyser for visualization
	const audioElementSource = audioContext.createMediaElementSource(
		audioElement.value,
	);
	audioElementSource.connect(analyser);
	analyser.connect(audioContext.destination);
};

/**
 * Loads the default crab rave audio
 */
const loadDefaultAudio = async () => {
	try {
		const defaultAudioUrl = "/dance/songs/crab-rave.mp3";
		await setupAudioAnalysis(defaultAudioUrl);
		console.log("Default audio loaded successfully");
	} catch (error) {
		console.error("Failed to load default audio:", error);
	}
};

/**
 * @param {Event} event
 */
const onFileChange = async (event) => {
	/** @type {File} */
	const audioFile = event.target.files[0];
	if (!audioFile) return;

	// Create object URL for the audio element
	const audioUrl = URL.createObjectURL(audioFile);
	await setupAudioAnalysis(audioUrl);
};

const onAudioPlay = () => {
	if (audioContext && audioContext.state === "suspended") {
		audioContext.resume();
	}

	if (analyser && bufferLength > 0) {
		drawWaveform();
	} else {
		console.warn(
			"Cannot start waveform drawing - analyser or buffer not ready",
		);
	}
};

const onPlaying = () => {
	audioVisStore.applicationState.value = "dance";
	audioVisStore.audioPlayerStatus.value = "playing";
};

const onPause = () => {
	audioVisStore.applicationState.value = "idle";
	audioVisStore.audioPlayerStatus.value = "paused";
};

// Load default audio when component mounts
onMounted(() => {
	loadDefaultAudio();
});
</script>

<template>
	<article
		class="bg-base-100 border-base-200 flex size-fit flex-col items-stretch gap-4 rounded-xl border-2 p-4"
	>
		<canvas ref="waveform-canvas" class="rounded-xl bg-black"></canvas>

		<audio
			ref="audio-element"
			controls
			@playing="onPlaying"
			@pause="onPause"
			@play="onAudioPlay"
		>
			<source ref="audio-source" type="audio/mpeg" />
			Your browser does not support the audio element.
		</audio>

		<input
			type="file"
			accept="audio/*"
			class="file-input file-input-accent file-input-ghost"
			@change="onFileChange"
		/>

		<!-- <pre>{{ JSON.stringify(audioData, null, 2) }}</pre> -->
	</article>
</template>
