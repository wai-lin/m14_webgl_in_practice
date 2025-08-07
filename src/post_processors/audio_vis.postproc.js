import { CreateModule } from "@lib/Program";
import { EffectPass, PixelationEffect } from "postprocessing";

// TODO: CRT effect
const pixelationEffect = new PixelationEffect(2);

export const AUDIO_VIS_POSTPROC = CreateModule({
	name: "AudioVisPostProcessor",
	onInit: (ctx) => {
		ctx.composer.addPass(new EffectPass(ctx.camera, pixelationEffect));
	},
});
