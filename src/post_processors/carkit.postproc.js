import { CreateModule } from "@lib/Program";
import { EffectPass, GlitchEffect, PixelationEffect } from "postprocessing";

export const CAR_KIT_POSTPROC = CreateModule({
  name: "CarKitPostProcessor",
  onInit: (ctx) => {
    const glitchEffect = new GlitchEffect();
    const pixelationEffect = new PixelationEffect(6);

    ctx.composer.addPass(new EffectPass(ctx.camera, glitchEffect));
    ctx.composer.addPass(new EffectPass(ctx.camera, pixelationEffect));
  },
});
