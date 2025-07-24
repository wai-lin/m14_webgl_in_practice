import Stats from "stats.js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls";

export class THREEApp {
  // CONSTANTS
  #MAX_PIXEL_RATIO = 1.6;
  #DEBUG = false;

  /**
   * Three.js WebGL Renderer
   * @type {THREE.WebGLRenderer}
   */
  #gl;
  /**
   * HTML Canvas Element
   * @type {HTMLCanvasElement}
   */
  #canvas;
  /**
   * Clock for managing time in the application
   * @type {THREE.Clock}
   */
  #clock;
  /**
   * Perspective Camera
   * @type {THREE.PerspectiveCamera}
   */
  #camera;
  /**
   * Application current scene
   * @type {THREE.Scene}
   */
  #scene;
  /**
   * Set animation callback function.
   * This function is called on every animation frame.
   * @type {AppTypes.OnAnimateFn}
   */
  #onAnimate;

  // DEBUGGING TOOLS
  /**
   * Stats.js instance for performance monitoring
   * @type {Stats}
   */
  #stats;
  /**
   * Orbit Controls for the camera
   * @type {OrbitControls | undefined}
   */
  #controls;
  /**
   * Axes Helper for debugging
   * @type {THREE.AxesHelper | undefined}
   */
  #axesHelper;
  /**
   * Camera Helper for debugging
   * @type {THREE.CameraHelper | undefined}
   */
  #cameraHelper;
  /**
   * Helper camera to visualize with CameraHelper
   * @type {THREE.PerspectiveCamera | undefined}
   */
  #helperCamera;

  /**
   * Creates an instance of the ThreeJsApp class.
   * @param {string} canvasId
   */
  constructor(canvasId) {
    const id = (canvasId ?? "").replace("#", "");
    if (id === "") throw new Error("Canvas ID cannot be empty");

    this.#canvas = document.getElementById(id);
    if (!this.#canvas) throw new Error(`Canvas with id ${canvasId} not found`);

    this.#init();
    this.#initEvents();
  }

  // == DEBUGGING TOOLS ==

  /**
   * Enable or disable debugging tools.
   *
   * NOTE: **ORDER MATTERS!!**
   *
   * If you set DEBUG to true, it will initialize the debugging tools.
   *
   * You need to set DEBUG after the `setScene` and `onAnimate` methods are called.
   */
  get DEBUG() {
    return this.#DEBUG;
  }
  set DEBUG(value) {
    this.#DEBUG = value;
    if (this.#DEBUG) {
      this.#setDebugers();
    } else {
      this.#removeDebugers();
    }
  }

  #setDebugers() {
    // STATS
    this.#stats = new Stats();
    document.body.appendChild(this.#stats.dom);

    // CONTROLS
    this.#controls = new OrbitControls(this.#camera, this.#gl.domElement);

    // AXES HELPER
    this.#axesHelper = new THREE.AxesHelper(5);
    this.#scene.add(this.#axesHelper);

    // CAMERA HELPER - Create a separate helper camera to visualize
    this.#helperCamera = new THREE.PerspectiveCamera();
    this.#helperCamera.copy(this.#camera);

    this.#cameraHelper = new THREE.CameraHelper(this.#helperCamera);
    this.#scene.add(this.#cameraHelper);
  }

  #removeDebugers() {
    this.#stats?.end();
    this.#stats = undefined;

    this.#controls?.dispose();
    this.#controls = undefined;

    if (this.#axesHelper) this.#scene.remove(this.#axesHelper);
    if (this.#cameraHelper) this.#scene.remove(this.#cameraHelper);
    this.#helperCamera = undefined;
  }

  // == PRIVATE METHODS ==

  #getContext() {
    /** @type {AppTypes.AppContext} */
    const context = {
      gl: this.#gl,
      canvas: this.#canvas,
      clock: this.#clock,
      camera: this.#camera,
      controls: this.#controls,
      scene: this.#scene,
    };
    return context;
  }

  #init() {
    this.#gl = new THREE.WebGLRenderer({ canvas: this.#canvas });

    // Set the pixel ratio to avoid blurry rendering on high DPI screens
    let pixelRatio = window.devicePixelRatio;
    if (pixelRatio > this.#MAX_PIXEL_RATIO) pixelRatio = this.#MAX_PIXEL_RATIO;
    this.#gl.setPixelRatio(pixelRatio);

    // Set the size of the renderer to match the window size
    this.#gl.setSize(window.innerWidth, window.innerHeight);

    // CLOCK
    this.#clock = new THREE.Clock();

    // CAMERA
    const aspectRatio = window.innerWidth / window.innerHeight;
    this.#camera = new THREE.PerspectiveCamera(75, aspectRatio, 1, 100);
    this.#camera.position.set(0.5, 0.5, 5);
    this.#camera.lookAt(0, 0, 0.5);

    // ENABLE DEBUGGING TOOLS
    if (this.DEBUG) this.#setDebugers();
  }

  #initEvents() {
    window.addEventListener("resize", this.#resize.bind(this));
  }

  #resize() {
    this.#gl.setSize(window.innerWidth, window.innerHeight);

    const aspectRatio = window.innerWidth / window.innerHeight;
    this.#camera.aspect = aspectRatio;
    this.#camera.updateProjectionMatrix();
  }

  #animate() {
    this.#stats?.begin();

    this.#gl.render(this.#scene, this.#camera);

    if (this.#onAnimate)
      this.#onAnimate({
        ...this.#getContext(),
        setScene: this.setScene.bind(this),
      });

    this.#stats?.end();

    window.requestAnimationFrame(this.#animate.bind(this));
  }

  // == PUBLIC METHODS ===

  /**
   * Run the application.
   */
  start() {
    // ANIMATE
    this.#animate();
  }

  /**
   * Sets up the scene with a callback function.
   * @param {AppTypes.SetSceneFn} setupScene
   */
  setScene(setupScene) {
    this.#scene = setupScene(this.#getContext());
  }

  /**
   * Sets the animation callback function.
   * @param {AppTypes.OnAnimateFn} animate
   */
  onAnimate(animate) {
    this.#onAnimate = animate;
  }
}
