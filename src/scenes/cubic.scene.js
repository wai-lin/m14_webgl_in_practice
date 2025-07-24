import { rangeTimedScale } from "../lib/utils";
import * as THREE from "three";

const SCENE_OBJECTS = {
  cube: new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial()
  ),
};

/** @type {AppTypes.SetSceneFn} */
export function createCubicScene(ctx) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0f172b");

  scene.add(SCENE_OBJECTS.cube);
  return scene;
}

/** @type {AppTypes.OnAnimateFn} */
export function animateCubicScene(ctx) {
  const cube = SCENE_OBJECTS.cube;

  // Rotate the cube
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  // Animate scaling between 0.5 and 1.2
  const ocilTime = Math.sin(ctx.clock.getElapsedTime());
  const scale = rangeTimedScale(ocilTime, 0.5, 1.2);
  cube.scale.setScalar(scale);
}
