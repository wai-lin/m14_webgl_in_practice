import "./style.css";
import { NewProgram } from "./lib/Program";
import {
  CameraHelperPlugin,
  DebugToolsPlugin,
  StatsPlugin,
} from "./lib/Plugins";
import { EventsManager } from "./lib/Events";
import { CAR_KIT_SCENE } from "./scenes/carkit.scene";

(async () => {
  const { listenEvents } = EventsManager();
  listenEvents();

  const pg = NewProgram("#webgl-canvas");

  // Register plugins
  pg.use(StatsPlugin, DebugToolsPlugin, CameraHelperPlugin);

  // Register scene
  pg.use(CAR_KIT_SCENE);

  pg.run();
})();
