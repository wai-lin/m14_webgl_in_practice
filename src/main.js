import "./style.css";
import { THREEApp } from "./lib/ThreeApp";
import { animateCubicScene, createCubicScene } from "./scenes/cubic.scene";

const app = new THREEApp("#webgl-canvas");

app.setScene(createCubicScene);
app.onAnimate(animateCubicScene);

app.DEBUG = true; // Enable debug mode for development
//  ^^^ order matters! Make sure to set this after `setScene` and `onAnimate`

app.start();
