import "./style.css";
import { NewProgram } from "./lib/Program";
import { CUBIC_SCENE } from "./scenes/cubic.scene";
import {
  CameraHelperPlugin,
  DebugToolsPlugin,
  StatsPlugin,
} from "./lib/Plugins";
import { EventsManager } from "./lib/Events";

(async () => {
  const { listenEvents } = EventsManager();
  listenEvents();

  const pg = NewProgram("#webgl-canvas");

  // Register plugins
  pg.use(StatsPlugin, DebugToolsPlugin, CameraHelperPlugin);

  // Register scene
  pg.use(CUBIC_SCENE);

  pg.run();
})();
