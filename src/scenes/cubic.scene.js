import * as THREE from "three";

/** @type {THREEApp.SetSceneFn} */
export function createCubicScene(ctx) {
  const scene = new THREE.Scene();

  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshBasicMaterial();
  const mesh = new THREE.Mesh(geo, mat);
  ctx.sceneObjects.set("cube", mesh);
  scene.add(ctx.sceneObjects.get("cube"));

  return scene;
}

/** @type {THREEApp.OnAnimateFn} */
export function animateCubicScene(ctx) {
  /** @type {THREE.Mesh} */
  const cube = ctx.sceneObjects.get("cube");
  if (cube) {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  }
}
