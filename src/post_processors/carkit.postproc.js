import { EffectPass, GlitchEffect, PixelationEffect } from "postprocessing";
import { CreateModule } from "../lib/Program";
import { ev } from "../lib/Events";
import { carKitStore as STATE } from "../store/carkit.store";
import { subscribe } from "valtio/vanilla";

export const CAR_KIT_POSTPROC = CreateModule({
  name: "CarKitPostProcessor",
  onInit: (ctx) => {
    const glitchEffect = new GlitchEffect();
    const pixelationEffect = new PixelationEffect(6);

    ctx.composer.addPass(new EffectPass(ctx.camera, glitchEffect));
    ctx.composer.addPass(new EffectPass(ctx.camera, pixelationEffect));
  },
});
