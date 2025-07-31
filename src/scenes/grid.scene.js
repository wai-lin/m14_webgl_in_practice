import { ev } from "@lib/Events";
import { CreateModule } from "@lib/Program";
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
  return { group, material };
}

function createCircleGrid() {
  const group = new THREE.Group();
  const items = [];

  // Grid configuration
  const cols = 15;
  const rows = 15;
  const amount = cols * rows;
  const cellSize = 2;

  for (let i = 0; i < amount; i++) {
    // Create circle mesh
    const { group: circlePlane, material } = createCirclePlane();

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

    // Scale the circle (smaller relative to cell size for proper gaps)
    circlePlane.scale.set(cellSize * 0.4, cellSize * 0.4, 1);

    // Color variation based on grid position
    material.color.r = (col / (cols - 1)) * 0.8 + 0.2; // Red varies by column
    material.color.g = (row / (rows - 1)) * 0.8 + 0.2; // Green varies by row
    material.color.b = 0.3; // Constant blue component

    group.add(circlePlane);
    items.push(circlePlane);
  }

  return { group, items };
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

export const GRID_SCENE = CreateModule({
  name: "GridScene",
  onInit: (ctx) => {
    ctx.scene.background = new THREE.Color(CONSTANTS.bgColor.dark);

    const { group } = createCircleGrid();
    ctx.scene.add(group);
  },
});
