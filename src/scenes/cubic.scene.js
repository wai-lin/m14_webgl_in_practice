import { rangeTimedScale } from "../lib/utils";
import { CreateModule } from "../lib/Program";
import * as THREE from "three";

const SCENE_OBJECTS = {
  cube: new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial()
  ),
};

export const CUBIC_SCENE = CreateModule({
  name: "CubicScene",
  onInit(ctx) {
    ctx.scene.background = new THREE.Color("#0f172b");
    ctx.scene.add(SCENE_OBJECTS.cube);
  },
  onAnimate(ctx) {
    const cube = SCENE_OBJECTS.cube;

    // Rotate the cube
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // Animate scaling between 0.5 and 1.2
    const oscillationTime = Math.sin(ctx.clock.getElapsedTime());
    const scale = rangeTimedScale(oscillationTime, 0.5, 1.2);
    cube.scale.setScalar(scale);
  },
});
