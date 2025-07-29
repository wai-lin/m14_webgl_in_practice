import "./style.css";
import { NewProgram } from "./lib/Program";
import {
  CameraHelperPlugin,
  DebugToolsPlugin,
  StatsPlugin,
  WindowResizePlugin,
} from "./lib/Plugins";
import { EventsManager } from "./lib/Events";
import { CAR_KIT_SCENE } from "./scenes/carkit.scene";

(async () => {
  EventsManager();
  const pg = NewProgram("#webgl-canvas");

  // Plugins
  pg.use(StatsPlugin, DebugToolsPlugin, CameraHelperPlugin, WindowResizePlugin);
  // Scene
  pg.use(CAR_KIT_SCENE);

  pg.run();
})();
