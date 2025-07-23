import "./style.css";
import { THREEApp } from "./ThreeApp";
import { animateCubicScene, createCubicScene } from "./scenes/cubic.scene";

const app = new THREEApp("#webgl-canvas");
app.setScene(createCubicScene);
app.onAnimate(animateCubicScene);
app.start();
