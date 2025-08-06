import { CreateModule } from "@lib/Program";

/** @type {AudioContext} */
let audioContext;
/** @type {MediaStreamAudioSourceNode} */
let source;
/** @type {AnalyserNode} */
let analyser;
/** @type {number} */
let bufferLength;
/** @type {Uint8Array<ArrayBuffer>} */
let dataArray;

function createAudioAnalyser() {
  audioContext = new window.AudioContext();

  async function setupAudio() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    source = audioContext.createMediaStreamSource(stream);

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    bufferLength = analyser.fftSize;
    dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
  }

  return { setupAudio, };
}

export const AUDIO_VIS_SCENE = CreateModule({
  name: "AudioVisScene",
  onLoad: async (ctx) => {
    await createAudioAnalyser().setupAudio();
    console.log(dataArray);
  }
})
