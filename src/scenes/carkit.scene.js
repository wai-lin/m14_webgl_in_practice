import { ev } from "@lib/Events";
import { CreateModule } from "@lib/Program";
import { NewResourceLoader } from "@lib/ResourceLoader";
import { carKitStore as STATE } from "@store/carkit.store";
import gsap from "gsap";
import * as THREE from "three";
import { subscribe } from "valtio/vanilla";

// ========================================
// Variables
// ========================================
const CONSTANTS = {
  bgColor: {
    light: "#f8fafc",
    dark: "#0f172b",
  },
  spotLightColor: "#faffd0",
};

const SCENE_OBJECTS = {
  plane: new THREE.Mesh(
    new THREE.CircleGeometry(30, 30),
    new THREE.MeshStandardMaterial({
      color: CONSTANTS.bgColor[STATE.colorTheme.value],
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
  const html = `<div
  role="alert"
  class="alert alert-info max-w-fit w-full items-end absolute bottom-4 right-4 z-50"
>
  <div class="text-left">
    <h3 class="font-bold">Car Kit Scene</h3>
    <div class="text-sm">Press <kbd class="kbd text-white">SPACE</kbd> to change the car model.</div>
  </div>
  <button id="change-color-theme-btn" class="btn btn-xs">Change Color Theme</button>
</div>`;
  document.body.insertAdjacentHTML("beforeend", html);

  document
    .getElementById("change-color-theme-btn")
    .addEventListener("click", () => {
      STATE.colorTheme.value =
        STATE.colorTheme.value === "light" ? "dark" : "light";
    });
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

    const bgColor = CONSTANTS.bgColor[STATE.colorTheme.value];

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

      if (car.scene.name === STATE.currentCar) {
        // Show the current car with entrance animation
        car.scene.visible = true;
        car.scene.scale.set(0, 0, 0); // Start from scale 0
        car.scene.rotation.y = 0; // Reset rotation

        // Entrance animation for the initial car
        gsap.to(car.scene.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
        });

        gsap.to(car.scene.rotation, {
          y: Math.PI * 2, // 360 degrees
          duration: 0.8,
          ease: "power2.out",
        });
      } else {
        car.scene.visible = false;
      }
    });

    // Plane
    const plane = SCENE_OBJECTS.plane;
    plane.name = "Plane";
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    // Spot Light
    const spotLight = new THREE.SpotLight();
    spotLight.color.set(new THREE.Color(CONSTANTS.spotLightColor));
    spotLight.castShadow = true;
    spotLight.position.set(0, 5, 0);
    spotLight.target.position.set(0, 0, 0);
    spotLight.intensity = 120;
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
          if (car && car.name !== nextCarName) {
            car.visible = false; // Hide other cars
          }
          if (car && car.name === nextCarName) {
            // Show and animate the new car
            car.visible = true;
            car.scale.set(0, 0, 0); // Start from scale 0
            car.rotation.y = 0; // Reset rotation

            // Entrance animation: scale from 0 and 360° rotation
            gsap.to(car.scale, {
              x: 1,
              y: 1,
              z: 1,
              duration: 0.8,
              ease: "back.out(1.7)",
            });

            gsap.to(car.rotation, {
              y: Math.PI * 2, // 360 degrees
              duration: 0.8,
              ease: "power2.out",
            });
          }
        });
      }
    });

    subscribe(STATE.colorTheme, () => {
      const bgColor = CONSTANTS.bgColor[STATE.colorTheme.value];
      const newColor = new THREE.Color(bgColor);

      const scene = ctx.scene;
      const plane = SCENE_OBJECTS.plane;

      gsap.to(scene.background, {
        r: newColor.r,
        g: newColor.g,
        b: newColor.b,
        duration: 0.5,
        ease: "power1.inOut",
      });
      gsap.to(plane.material.color, {
        r: newColor.r,
        g: newColor.g,
        b: newColor.b,
        duration: 0.5,
        ease: "power1.inOut",
      });
    });
  },
  onAnimate: (ctx) => {
    /** @type {THREE.Scene} */
    const car = ctx.scene.getObjectByName(STATE.currentCar);
    const plane = SCENE_OBJECTS.plane;

    const deltaTime = ctx.clock.getDelta();
    const rotationSpeed = 0.5;

    if (car) car.rotation.y += deltaTime * rotationSpeed; // Rotate the car
  },
});
