import { ResourceLoader } from "../lib/ResourceLoader";
import * as THREE from "three";

const SCENE_OBJECTS = {
  plane: new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshStandardMaterial({ color: "#a5b7d3" })
  ),
};

const resources = new ResourceLoader();
resources.queueResource({
  name: "race",
  url: "/kenney_car-kit/Models/GLB/race.glb",
  type: "gltf",
});
resources.queueResource({
  name: "truck",
  url: "/kenney_car-kit/Models/GLB/truck.glb",
  type: "gltf",
});
resources.queueResource({
  name: "van",
  url: "/kenney_car-kit/Models/GLB/van.glb",
  type: "gltf",
});

// ========================================
// States
// ========================================
const state = {
  cars: ["race", "truck", "van"],
  currentCar: "race",
};

// ========================================
// Scene Functions
// ========================================
/**
 * Change active car on space key press.
 * @param {THREE.Scene} scene
 */
function changeCarOnSpaceKeyPress(scene) {
  document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      const currentIndex = state.cars.indexOf(state.currentCar);
      const nextIndex = (currentIndex + 1) % state.cars.length;
      const nextCarName = state.cars[nextIndex];
      state.currentCar = nextCarName;

      state.cars.forEach((carName) => {
        const car = scene.getObjectByName(carName);
        if (car) car.visible = car.name === nextCarName;
      });
    }
  });
}

export function createCarKitUI() {
  const alert = document.createElement("div");
  alert.classList.add("alert");
  alert.innerHTML = `<strong>Car Kit Scene</strong> - Press <kbd>SPACE</kbd> to change the car model.`;
  document.body.appendChild(alert);
}

/** @type {AppTypes.SetSceneFn} */
export async function createCarKitScene(ctx) {
  await resources.load();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0f172b");

  // Enable shadows
  ctx.gl.shadowMap.enabled = true;
  ctx.gl.shadowMap.type = THREE.PCFSoftShadowMap;

  // Cars
  state.cars.forEach((carName) => {
    const car = resources.getResource(carName);
    car.scene.name = carName;
    // Enable shadows for all meshes in the car model
    car.scene.traverse((child) => {
      if (child?.isMesh) child.castShadow = true;
    });
    scene.add(car.scene);
    car.scene.visible = car.scene.name === state.currentCar;
  });

  // Plane
  const plane = SCENE_OBJECTS.plane;
  plane.receiveShadow = true;
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane);

  // Spot Light
  const spotLight = new THREE.SpotLight();
  spotLight.color.set(new THREE.Color("#ffffff"));
  spotLight.castShadow = true;
  spotLight.position.set(0, 5, 0);
  spotLight.target.position.set(0, 0, 0);
  spotLight.intensity = 100;
  spotLight.angle = Math.PI / 6;
  spotLight.penumbra = 0.1;
  spotLight.decay = 2;
  spotLight.distance = 200;
  // Configure shadow properties
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.shadow.camera.near = 0.5;
  spotLight.shadow.camera.far = 50;

  scene.add(spotLight);
  scene.add(spotLight.target);

  // Ambient Light
  const ambiLight = new THREE.AmbientLight();
  scene.add(ambiLight);

  // Camera
  ctx.camera.position.set(1, 2, 3);
  ctx.camera.lookAt(0, 0, 0);

  // Listen for space key press to change car
  changeCarOnSpaceKeyPress(scene);

  return scene;
}

/** @type {AppTypes.OnAnimateFn} */
export function animateCarKitScene(ctx) {
  /** @type {THREE.Scene} */
  const car = ctx.scene.getObjectByName(state.currentCar);
  const plane = SCENE_OBJECTS.plane;

  const deltaTime = ctx.clock.getDelta();
  const rotationSpeed = 0.5;

  car.rotation.y += deltaTime * rotationSpeed; // Rotate the car
  plane.rotation.z += deltaTime * rotationSpeed; // Rotate the plane along with the car
}
