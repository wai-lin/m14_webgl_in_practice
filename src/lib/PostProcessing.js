import { EffectComposer, RenderPass } from "postprocessing";

/**
 * Create a post-processing composer for the given WebGL renderer, scene, and camera.
 * @param {import("three").WebGLRRenderer} webgl
 * @param {import("three").Scene} scene
 * @param {import("three").Camera} camera
 */
export function CreatePostProcessor(webgl, scene, camera) {
  const composer = new EffectComposer(webgl);
  composer.addPass(new RenderPass(scene, camera));

  return composer;
}
