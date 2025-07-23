import "./style.css";
import * as THREE from "three";
import { THREEApp } from "./ThreeApp";

const app = new THREEApp("#webgl-canvas");

app.setScene(({ sceneObjects }) => {
  const scene = new THREE.Scene();

  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshBasicMaterial();
  const mesh = new THREE.Mesh(geo, mat);
  sceneObjects.set("cube", mesh);
  scene.add(sceneObjects.get("cube"));

  return scene;
});

app.onAnimate(({ sceneObjects }) => {
  /** @type {THREE.Mesh} */
  const cube = sceneObjects.get("cube");
  if (cube) {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  }
});

app.start();
