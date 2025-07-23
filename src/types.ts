import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls";

export type AppContext = {
  gl: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  scene: THREE.Scene;
  sceneObjects: Map<string, any>;
};

export type SetSceneFn = (context: AppContext) => THREE.Scene;
export type OnAnimateFn = (context: AppContext) => void;
