import "./style.css";
import { THREEApp } from "./lib/ThreeApp";
import {
  createCarKitScene,
  animateCarKitScene,
  createCarKitUI,
} from "./scenes/carkit.scene";

(async () => {
  const app = new THREEApp("#webgl-canvas");

  await app.setScene(createCarKitScene);
  app.onAnimate(animateCarKitScene);

  app.DEBUG = true; // Enable debug mode for development
  //  ^^^ order matters! Make sure to set this after `setScene` and `onAnimate`

  app.start();

  createCarKitUI();
})();
