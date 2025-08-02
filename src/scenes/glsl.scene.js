import fragmentShader from "@/glsl/index.frag";
import vertexShader from "@/glsl/index.vert";
import { CreateModule } from "@lib/Program";
import GUI from "lil-gui";
import * as THREE from "three";

const SCENE_OBJECTS = {
  sphere: new THREE.Mesh(
    new THREE.SphereGeometry(1, 15, 15),
    new THREE.ShaderMaterial({
      wireframe: false,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        uTime: { value: 0.0 },
        uColor: { value: new THREE.Color("#fa8072") },
        uIntensity: { value: 1.0 },
      },
    })
  ),
};

// GUI controls
const guiParams = {
  color: "#fa8072",
  intensity: 1.0,
  animationSpeed: 2.0,
};

export const GLSL_SCENE = CreateModule({
  name: "GlslScene",
  onInit: (ctx) => {
    const scene = ctx.scene;

    scene.background = new THREE.Color("#0f172b");

    const sphere = SCENE_OBJECTS.sphere;
    sphere.name = "Sphere";
    sphere.scale.set(1, 1, 1);
    sphere.position.set(0, 0, 0);
    scene.add(SCENE_OBJECTS.sphere);

    // Setup GUI
    const gui = new GUI();

    gui
      .addColor(guiParams, "color")
      .name("Sphere Color")
      .onChange((value) => {
        sphere.material.uniforms.uColor.value.setHex(value.replace("#", "0x"));
      });

    gui
      .add(guiParams, "intensity", 0.0, 3.0)
      .name("Color Intensity")
      .onChange((value) => {
        sphere.material.uniforms.uIntensity.value = value;
      });

    gui.add(guiParams, "animationSpeed", 0.5, 5.0).name("Animation Speed");
  },
  onAnimate: (ctx) => {
    const delta = ctx.clock.getDelta();
    const elapsedTime = ctx.clock.getElapsedTime();

    const sphere = SCENE_OBJECTS.sphere;
    if (sphere.material.uniforms && sphere.material.uniforms.uTime) {
      sphere.material.uniforms.uTime.value =
        elapsedTime * guiParams.animationSpeed;
    }
  },
});
