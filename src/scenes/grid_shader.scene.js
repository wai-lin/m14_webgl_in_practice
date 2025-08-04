import glitchFragment from "@/glsl/glitch/index.frag";
import glitchVertex from "@/glsl/glitch/index.vert";
import { ev } from "@lib/Events";
import { CreateModule } from "@lib/Program";
import { NewResourceLoader } from "@lib/ResourceLoader";
import gsap from "gsap";
import * as THREE from "three";

// ========================================
// Variables
// ========================================
const CONSTANTS = {
  bgColor: {
    light: "#f8fafc",
    dark: "#0f172b",
  },
};

const resources = NewResourceLoader();
resources.queueResources(
  {
    name: "t-1",
    type: "texture",
    url: "https://images.pexels.com/photos/1983037/pexels-photo-1983037.jpeg?_gl=1*1ykzbsg*_ga*NTg3NjY0Mzk2LjE3NTQwNjI2NTQ.*_ga_8JE65Q40S6*czE3NTQzMjg2NDIkbzMkZzEkdDE3NTQzMjk3MDUkajgkbDAkaDA.",
  },
  {
    name: "t-2",
    type: "texture",
    url: "https://images.pexels.com/photos/1425146/pexels-photo-1425146.jpeg?_gl=1*1k4oud1*_ga*NTg3NjY0Mzk2LjE3NTQwNjI2NTQ.*_ga_8JE65Q40S6*czE3NTQzMjg2NDIkbzMkZzEkdDE3NTQzMjk3MzEkajQ2JGwwJGgw",
  },
  {
    name: "t-3",
    type: "texture",
    url: "https://images.pexels.com/photos/774448/pexels-photo-774448.jpeg?_gl=1*1530u16*_ga*NTg3NjY0Mzk2LjE3NTQwNjI2NTQ.*_ga_8JE65Q40S6*czE3NTQzMjg2NDIkbzMkZzEkdDE3NTQzMjk2OTUkajE4JGwwJGgw",
  },
  {
    name: "t-4",
    type: "texture",
    url: "https://images.pexels.com/photos/859895/pexels-photo-859895.jpeg?_gl=1*1u633x4*_ga*NTg3NjY0Mzk2LjE3NTQwNjI2NTQ.*_ga_8JE65Q40S6*czE3NTQzMjg2NDIkbzMkZzEkdDE3NTQzMjk3MTgkajU5JGwwJGgw",
  },
  {
    name: "t-5",
    type: "texture",
    url: "https://images.pexels.com/photos/1573424/pexels-photo-1573424.jpeg?_gl=1*1wsiq5v*_ga*NTg3NjY0Mzk2LjE3NTQwNjI2NTQ.*_ga_8JE65Q40S6*czE3NTQzMjg2NDIkbzMkZzEkdDE3NTQzMjk2ODkkajI0JGwwJGgw",
  },
  {
    name: "t-6",
    type: "texture",
    url: "https://images.pexels.com/photos/159613/ghettoblaster-radio-recorder-boombox-old-school-159613.jpeg?_gl=1*udpm0y*_ga*NTg3NjY0Mzk2LjE3NTQwNjI2NTQ.*_ga_8JE65Q40S6*czE3NTQzMjg2NDIkbzMkZzEkdDE3NTQzMjk2NzckajM2JGwwJGgw",
  },
  {
    name: "t-7",
    type: "texture",
    url: "https://images.pexels.com/photos/253096/pexels-photo-253096.jpeg?_gl=1*epn5dr*_ga*NTg3NjY0Mzk2LjE3NTQwNjI2NTQ.*_ga_8JE65Q40S6*czE3NTQzMzI1ODEkbzQkZzEkdDE3NTQzMzI1ODIkajU5JGwwJGgw",
  },
  {
    name: "t-8",
    type: "texture",
    url: "https://images.pexels.com/photos/1841120/pexels-photo-1841120.jpeg?_gl=1*1d35tix*_ga*NTg3NjY0Mzk2LjE3NTQwNjI2NTQ.*_ga_8JE65Q40S6*czE3NTQzMzI1ODEkbzQkZzEkdDE3NTQzMzI2MTUkajI2JGwwJGgw",
  },
  {
    name: "t-9",
    type: "texture",
    url: "https://images.pexels.com/photos/6976094/pexels-photo-6976094.jpeg?_gl=1*itf1d6*_ga*NTg3NjY0Mzk2LjE3NTQwNjI2NTQ.*_ga_8JE65Q40S6*czE3NTQzMzI1ODEkbzQkZzEkdDE3NTQzMzI1OTYkajQ1JGwwJGgw",
  }
);
const getImageKey = gsap.utils.wrap([
  "t-1",
  "t-2",
  "t-3",
  "t-4",
  "t-5",
  "t-6",
  "t-7",
  "t-8",
  "t-9",
]);

// ========================================
// Scene Objects
// ========================================
const circleGeo = new THREE.CircleGeometry();

function createCirclePlane(key = "t-1") {
  const group = new THREE.Group();

  /** @type {THREE.Texture} */
  const texture = resources.getResource(key);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = texture.minFilter = THREE.LinearFilter;

  // Create shader material with glitch effect
  const material = new THREE.ShaderMaterial({
    vertexShader: glitchVertex,
    fragmentShader: glitchFragment,
    uniforms: {
      uTime: { value: 0.0 },
      uColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
      uImage: { value: texture },
    },
  });

  const mesh = new THREE.Mesh(circleGeo, material);
  group.add(mesh);

  // Add helper position for smooth animations
  const helpers = {
    position: new THREE.Vector3(0, 0, 0),
  };

  return { group, material, helpers };
}

function createCircleGrid() {
  const group = new THREE.Group();
  group.name = "CircleGrid";
  const items = [];

  // Grid configuration
  const cols = 15;
  const rows = 15;
  const amount = cols * rows;
  const cellSize = 2;

  for (let i = 0; i < amount; i++) {
    // Create circle mesh
    const {
      group: circlePlane,
      material,
      helpers,
    } = createCirclePlane(getImageKey(i));
    circlePlane.name = `Circle-${i}`;
    circlePlane.userData = { helpers }; // Store helpers for later access

    // Calculate grid position
    const row = Math.floor(i / cols);
    const col = i % cols;

    // Center grid shift - this centers the entire grid at origin
    const shiftX = (cols - 1) * cellSize * 0.5;
    const shiftY = (rows - 1) * cellSize * 0.5;

    // Position calculation
    const x = col * cellSize - shiftX;
    const y = row * cellSize - shiftY;

    // Set position
    circlePlane.position.x = x;
    circlePlane.position.y = y;

    // Calculate distance from center for cone effect
    const distanceFromCenter = Math.sqrt(x * x + y * y);
    const maxDistance = Math.sqrt(shiftX * shiftX + shiftY * shiftY);
    const normalizedDistance = distanceFromCenter / maxDistance;
    const zDepth = -normalizedDistance * 10;
    circlePlane.position.z = zDepth;

    // Initialize helper position
    helpers.position.copy(circlePlane.position);

    // Scale the circle (smaller relative to cell size for proper gaps)
    circlePlane.scale.set(cellSize * 0.4, cellSize * 0.4, 1);

    group.add(circlePlane);
    items.push(circlePlane);
  }

  // Calculate bounds
  const bounds = {
    x: { min: -Infinity, max: Infinity },
    y: { min: -Infinity, max: Infinity },
  };

  const cz = cellSize * 0.5;
  bounds.x.min =
    items.reduce((min, el) => Math.min(min, el.position.x), Infinity) - cz;
  bounds.x.max =
    items.reduce((max, el) => Math.max(max, el.position.x), -Infinity) + cz;
  bounds.y.min =
    items.reduce((min, el) => Math.min(min, el.position.y), Infinity) - cz;
  bounds.y.max =
    items.reduce((max, el) => Math.max(max, el.position.y), -Infinity) + cz;

  return { group, items, bounds };
}

// ========================================
// Scene Objects Interactions
// ========================================
function wrapBounds(circlePlane, bounds) {
  const helpers = circlePlane.userData.helpers;
  const hp = helpers.position;
  const pos = circlePlane.position;

  const resetX = hp.x > bounds.x.max || hp.x < bounds.x.min;
  const resetY = hp.y > bounds.y.max || hp.y < bounds.y.min;

  if (resetX) {
    hp.x = gsap.utils.wrap(bounds.x.min, bounds.x.max, hp.x);
    pos.x = hp.x;
  }

  if (resetY) {
    hp.y = gsap.utils.wrap(bounds.y.min, bounds.y.max, hp.y);
    pos.y = hp.y;
  }
}

function onDragGrid(items, e) {
  items.forEach((circlePlane) => {
    const helpers = circlePlane.userData.helpers;
    helpers.position.x += e.delta[0] * 0.01; // Scale down the movement
    helpers.position.y += -e.delta[1] * 0.01; // Invert Y for natural movement
  });
}

function onWheelGrid(items, e) {
  items.forEach((circlePlane) => {
    const helpers = circlePlane.userData.helpers;
    helpers.position.x += e.delta[0] * 0.008; // Slower wheel movement
    helpers.position.y += -e.delta[1] * 0.008;
  });
}

function updateGrid(items, bounds, delta, time) {
  items.forEach((circlePlane) => {
    wrapBounds(circlePlane, bounds);

    const helpers = circlePlane.userData.helpers;
    // Smooth animation
    circlePlane.position.x = THREE.MathUtils.damp(
      circlePlane.position.x,
      helpers.position.x,
      10,
      delta
    );
    circlePlane.position.y = THREE.MathUtils.damp(
      circlePlane.position.y,
      helpers.position.y,
      10,
      delta
    );

    // ReCalculate distance from center for cone effect
    const distanceFromCenter = Math.sqrt(
      circlePlane.position.x * circlePlane.position.x +
        circlePlane.position.y * circlePlane.position.y
    );

    // Recalculate cone effect depth
    // Calculate max distance based on bounds
    const maxX = Math.max(Math.abs(bounds.x.min), Math.abs(bounds.x.max));
    const maxY = Math.max(Math.abs(bounds.y.min), Math.abs(bounds.y.max));
    const maxDistance = Math.sqrt(maxX * maxX + maxY * maxY);
    const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
    const zDepth = -normalizedDistance * 10;

    circlePlane.position.z = THREE.MathUtils.damp(
      circlePlane.position.z,
      zDepth,
      10,
      delta
    );

    // Update shader time uniform for glitch animation
    const material = circlePlane.children[0].material;
    if (material.uniforms && material.uniforms.uTime) {
      material.uniforms.uTime.value = time;
    }
  });
}

// ========================================
// Scene
// ========================================
export const GRID_SHADER_CAMERA = CreateModule({
  name: "GridCamera",
  onInit: (ctx) => {
    const camera = ctx.camera;
    camera.position.set(0, 0, 10); // Position camera directly above the grid
    camera.lookAt(0, 0, 0); // Make sure camera is looking straight down at origin
    camera.fov = 45; // Smaller FOV reduces perspective distortion
    camera.near = 0.1;
    camera.far = 100;
    camera.updateProjectionMatrix();
  },
  onEventListener: (ctx) => {
    const camera = ctx.camera;
    ev.on("onWindowResize", (e) => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });
  },
});

let gridData = null;
export const GRID_SHADER_SCENE = CreateModule({
  name: "GridScene",
  onLoad: async () => {
    await resources.loadResources();
  },
  onInit: (ctx) => {
    ctx.scene.background = new THREE.Color(CONSTANTS.bgColor.dark);

    const { group, items, bounds } = createCircleGrid();
    ctx.scene.add(group);

    // Store grid data for interactions
    gridData = { items, bounds };
  },
  onEventListener: (ctx) => {
    ev.on("onCanvasDrag", (state) => {
      if (gridData) {
        onDragGrid(gridData.items, state);
      }
    });

    ev.on("onCanvasWheel", (state) => {
      if (gridData) {
        onWheelGrid(gridData.items, state);
      }
    });
  },
  onAnimate: (ctx) => {
    const delta = ctx.clock.getDelta();
    const elapsedTime = ctx.clock.getElapsedTime();
    if (gridData) {
      updateGrid(gridData.items, gridData.bounds, delta, elapsedTime);
    }
  },
});
