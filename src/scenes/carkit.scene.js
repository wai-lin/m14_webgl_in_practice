import { ev } from "../lib/Events";
import { CreateModule } from "../lib/Program";
import { NewResourceLoader } from "../lib/ResourceLoader";
import * as THREE from "three";
import { carKitStore as STATE } from "../store/carkit.store";
import { subscribe } from "valtio/vanilla";

// ========================================
// Variables
// ========================================
const CONSTANTS = {
  bgColor: {
    light: "#f8fafc",
    dark: "#0f172b",
  },
};

const SCENE_OBJECTS = {
  plane: new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshStandardMaterial({
      color: CONSTANTS.bgColor[STATE.colorTheme],
    })
  ),
};

// ========================================
// Resource Loader
// ========================================
const resourceLoader = NewResourceLoader();
resourceLoader.queueResources(
  {
    name: "race",
    url: "/kenney_car-kit/Models/GLB/race.glb",
    type: "gltf",
  },
  {
    name: "truck",
    url: "/kenney_car-kit/Models/GLB/truck.glb",
    type: "gltf",
  },
  {
    name: "van",
    url: "/kenney_car-kit/Models/GLB/van.glb",
    type: "gltf",
  }
);

// ========================================
// Scene UI
// ========================================
function createCarKitUI() {
  const alert = document.createElement("div");
  alert.classList.add("alert");
  alert.innerHTML = `<p>
  <strong>Car Kit Scene</strong> - Press <kbd>SPACE</kbd> to change the car model.
</p>`;

  const colorThemeBtn = document.createElement("button");
  alert.appendChild(colorThemeBtn);
  colorThemeBtn.classList.add("color-theme-btn");
  colorThemeBtn.innerText = "Color Theme";
  colorThemeBtn.addEventListener("click", () => {
    STATE.colorTheme = STATE.colorTheme === "light" ? "dark" : "light";
  });

  document.body.appendChild(alert);
}

// ========================================
// Scene
// ========================================
export const CAR_KIT_SCENE = CreateModule({
  name: "CarKitScene",
  onLoad: async () => {
    await resourceLoader.loadResources();
  },
  onInit: (ctx) => {
    createCarKitUI();

    const bgColor = CONSTANTS.bgColor[STATE.colorTheme];

    const scene = ctx.scene;
    scene.background = new THREE.Color(bgColor);

    // Enable shadows
    ctx.webgl.shadowMap.enabled = true;
    ctx.webgl.shadowMap.type = THREE.PCFSoftShadowMap;

    // Cars
    STATE.cars.forEach((carName) => {
      const car = resourceLoader.getResource(carName);
      car.scene.name = carName;
      // Enable shadows for all meshes in the car model
      car.scene.traverse((child) => {
        if (child?.isMesh) child.castShadow = true;
      });
      scene.add(car.scene);
      car.scene.visible = car.scene.name === STATE.currentCar;
    });

    // Plane
    const plane = SCENE_OBJECTS.plane;
    plane.name = "Plane";
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
  },
  onEventListener: (ctx) => {
    const scene = ctx.scene;

    ev.on("onKeyDown", (e) => {
      if (e.code === "Space") {
        const currentIndex = STATE.cars.indexOf(STATE.currentCar);
        const nextIndex = (currentIndex + 1) % STATE.cars.length;
        const nextCarName = STATE.cars[nextIndex];
        STATE.currentCar = nextCarName;

        STATE.cars.forEach((carName) => {
          const car = scene.getObjectByName(carName);
          if (car) car.visible = car.name === nextCarName;
        });
      }
    });

    subscribe(STATE, () => {
      const bgColor = CONSTANTS.bgColor[STATE.colorTheme];
      const newColor = new THREE.Color(bgColor);

      // TODO: animate background color change with gsap

      const scene = ctx.scene;
      scene.background = newColor;

      const plane = SCENE_OBJECTS.plane;
      plane.material.color.set(newColor);
    });
  },
  onAnimate: (ctx) => {
    /** @type {THREE.Scene} */
    const car = ctx.scene.getObjectByName(STATE.currentCar);
    const plane = SCENE_OBJECTS.plane;

    const deltaTime = ctx.clock.getDelta();
    const rotationSpeed = 0.5;

    if (car) car.rotation.y += deltaTime * rotationSpeed; // Rotate the car
    plane.rotation.z += deltaTime * rotationSpeed; // Rotate the plane along with the car
  },
});
