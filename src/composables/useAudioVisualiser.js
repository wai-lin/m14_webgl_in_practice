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

function useAudioVisualiser() {
  audioContext = new window.AudioContext();

  async function getFromMicrophone() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    source = audioContext.createMediaStreamSource(stream);

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    bufferLength = analyser.fftSize;
    dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
  }

  return { getFromMicrophone, };
}

export {
  audioContext,
  source,
  analyser,
  bufferLength,
  dataArray,
  useAudioVisualiser,
};
