import { CreatePostProcessor } from "./PostProcessing";
import * as THREE from "three";

const _hooksRunner = (hooks = []) => {
  return (ctx) => {
    for (const hook of hooks) {
      hook?.(ctx);
    }
  };
};

const _asyncHooksRunner = (hooks = []) => {
  return async (ctx) => {
    for (const hook of hooks) {
      await hook?.(ctx);
    }
  };
};

/**
 * Creates a module for the program.
 * @type {ProgramTypes.CreateModuleFn}
 */
export const CreateModule = (config) => {
  return {
    name: config.name,
    onLoad: config.onLoad ?? undefined,
    onInit: config.onInit ?? undefined,
    onEventListener: config.onEventListener ?? undefined,
    onAnimate: config.onAnimate ?? undefined,
    onAfterAnimate: config.onAfterAnimate ?? undefined,
  };
};

/**
 * Creates a new three.js program instance.
 * @param {string} canvasId
 * @param {"webgl" | "post-processor"} [renderer="webgl"]
 */
export function NewProgram(canvasId, renderer = "webgl") {
  const _contextMap = new Map();
  const _modules = [];

  // Constants
  const MIN_PIXEL_RATIO = 1;
  const MAX_PIXEL_RATIO = 1.6;

  // Internal Variables
  /** @type {THREE.Scene} */
  let _scene;
  /** @type {THREE.PerspectiveCamera} */
  let _camera;
  /** @type {THREE.WebGLRenderer} */
  let _webgl;
  /** @type {HTMLCanvasElement} */
  let _canvasEl;
  /** @type {THREE.Clock} */
  let _clock;
  /** @type {import("postprocessing").EffectComposer} */
  let _composer;

  const _provide = (key, value) => {
    _contextMap.set(key, value);
  };

  const _get = (key) => {
    return _contextMap.get(key);
  };

  /**
   * Get the current context.
   * @returns {ProgramTypes.Context}
   */
  const _getContext = () => ({
    scene: _scene,
    camera: _camera,
    webgl: _webgl,
    canvasEl: _canvasEl,
    clock: _clock,
    composer: _composer,
    provide: _provide,
    get: _get,
  });

  const _coreInit = () => {
    const id = (canvasId ?? "").replace("#", "");
    if (id === "") throw new Error("Canvas ID must be provided");

    _canvasEl = document.getElementById(id);
    if (!_canvasEl) throw new Error(`Canvas with ID ${id} not found`);

    let pixelRatio = THREE.MathUtils.clamp(
      window.devicePixelRatio,
      MIN_PIXEL_RATIO,
      MAX_PIXEL_RATIO
    );

    // Main WebGL Renderer
    _webgl = new THREE.WebGLRenderer({ canvas: _canvasEl });
    _webgl.setSize(window.innerWidth, window.innerHeight);
    _webgl.setPixelRatio(pixelRatio);

    // Initialize the scene, camera, and clock
    _scene = new THREE.Scene();
    _clock = new THREE.Clock();

    // CAMERA
    const aspectRatio = window.innerWidth / window.innerHeight;
    _camera = new THREE.PerspectiveCamera(75, aspectRatio);
    _camera.position.set(0.5, 0.5, 5);
    _camera.lookAt(0, 0, 0);
    _camera.name = "MainCamera";
    _scene.add(_camera);

    // POST PROCESSOR
    _composer = CreatePostProcessor(_webgl, _scene, _camera);
  };

  const use = (...modules) => _modules.push(...modules);

  /**
   * Runs the program in an animation loop.
   * The program runs the following order of lifecycle:
   *
   * - onLoad
   * - onInit
   * - onEventListener
   * - Animation Loop
   *   - onAnimate
   *   - RenderScene
   *   - onAfterAnimate
   */
  const run = async () => {
    _coreInit();
    await _asyncHooksRunner(_modules.map((m) => m.onLoad))(_getContext());
    await _asyncHooksRunner(_modules.map((m) => m.onInit))(_getContext());
    await _asyncHooksRunner(_modules.map((m) => m.onEventListener))(
      _getContext()
    );

    /// Cache the lifecycle hooks to
    /// avoid recreating the hooks arrays on each frame

    // First-In,First-Out
    const onAnimates = _modules.map((p) => p.onAnimate);
    // First-In,Last-Out
    const onAfterAnimates = _modules.map((p) => p.onAfterAnimate).reverse();

    const _animate = () => {
      _hooksRunner(onAnimates)(_getContext());

      if (renderer === "webgl") _webgl.render(_scene, _camera);
      if (renderer === "post-processor") _composer.render();

      _hooksRunner(onAfterAnimates)(_getContext());
      window.requestAnimationFrame(_animate);
    };

    _animate();
  };

  return {
    use,
    run,
  };
}
