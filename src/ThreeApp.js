import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls";

export class THREEApp {
  // CONSTANTS
  #MAX_PIXEL_RATIO = 1.6;

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
   * Perspective Camera
   * @type {THREE.PerspectiveCamera}
   */
  #camera;
  /**
   * Orbit Controls for the camera
   * @type {OrbitControls}
   */
  #controls;
  /**
   * Application current scene
   * @type {THREE.Scene}
   */
  #scene;
  /**
   * Objects in the scene.
   * @type {Map<string, any>}
   */
  #sceneObjects = new Map();
  /**
   * Set animation callback function.
   * This function is called on every animation frame.
   * @type {import("./types").OnAnimateFn}
   */
  #onAnimate;

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

  /**
   * Run the application.
   */
  start() {
    // ANIMATE
    this.#animate();
  }

  /**
   * Sets up the scene with a callback function.
   * @param {import("./types").SetSceneFn} setupScene
   */
  setScene(setupScene) {
    this.#scene = setupScene(this.#getContext());
  }

  /**
   * Sets the animation callback function.
   * @param {import("./types").OnAnimateFn} animate
   */
  onAnimate(animate) {
    this.#onAnimate = animate;
  }

  #getContext() {
    /** @type {import('./types').AppContext} */
    const context = {
      gl: this.#gl,
      canvas: this.#canvas,
      camera: this.#camera,
      controls: this.#controls,
      scene: this.#scene,
      sceneObjects: this.#sceneObjects,
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

    // CAMERA
    const aspectRatio = window.innerWidth / window.innerHeight;
    this.#camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    this.#camera.position.set(0, 0, 5);
    this.#camera.lookAt(0, 0, 0);

    // CONTROLS
    this.#controls = new OrbitControls(this.#camera, this.#gl.domElement);
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
    this.#gl.render(this.#scene, this.#camera);

    if (this.#onAnimate) this.#onAnimate(this.#getContext());

    window.requestAnimationFrame(this.#animate.bind(this));
  }
}
