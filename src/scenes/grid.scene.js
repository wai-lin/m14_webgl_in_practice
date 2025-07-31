import { ev } from "@lib/Events";
import { CreateModule } from "@lib/Program";
import gsap from "gsap";
import { damp } from "maath/easing";
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

// ========================================
// Scene Objects
// ========================================
const circleGeo = new THREE.CircleGeometry();

function createCirclePlane() {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial();
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
    const { group: circlePlane, material, helpers } = createCirclePlane();
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

    // Initialize helper position
    helpers.position.copy(circlePlane.position);

    // Scale the circle (smaller relative to cell size for proper gaps)
    circlePlane.scale.set(cellSize * 0.4, cellSize * 0.4, 1);

    // Color variation based on grid position
    material.color.r = (col / (cols - 1)) * 0.8 + 0.2; // Red varies by column
    material.color.g = (row / (rows - 1)) * 0.8 + 0.2; // Green varies by row
    material.color.b = 0.3; // Constant blue component

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

function updateGrid(items, bounds, delta) {
  items.forEach((circlePlane) => {
    wrapBounds(circlePlane, bounds);

    const helpers = circlePlane.userData.helpers;
    // Smooth animation
    damp(circlePlane.position, "x", helpers.position.x, 0.1, delta);
    damp(circlePlane.position, "y", helpers.position.y, 0.1, delta);
  });
}

// ========================================
// Scene
// ========================================
export const GRID_CAMERA = CreateModule({
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
export const GRID_SCENE = CreateModule({
  name: "GridScene",
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
    if (gridData) {
      updateGrid(gridData.items, gridData.bounds, delta);
    }
  },
});
