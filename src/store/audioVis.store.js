import { proxy } from "valtio/vanilla";

export const audioVisStore = proxy({
	danceThreshold: { value: 0.05 },
	applicationState: { value: "idle" }, // "idle", "dance"
	audioPlayerStatus: { value: "stopped" }, // "playing", "paused", "stopped"
	elapsedTime: 0, // Time delta for clock updates
	currentWaveDelta: {
		delta: 0, // Rate of change in waveform (0-1)
		amplitude: 0, // Average amplitude/volume (0-1)
		maxAmplitude: 0, // Peak amplitude (0-1)
		energy: 0, // Combined energy metric (0-1)
	},
});
