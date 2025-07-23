import "./style.css";
import { THREEApp } from "./lib/ThreeApp";
import { animateCubicScene, createCubicScene } from "./scenes/cubic.scene";

const app = new THREEApp("#webgl-canvas");
app.DEBUG = true; // Enable debug mode for development
app.setScene(createCubicScene);
app.onAnimate(animateCubicScene);
app.start();
