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
import { CAR_KIT_POSTPROC } from "./post_processors/carkit.postproc";

(async () => {
  EventsManager();
  const pg = NewProgram("#webgl-canvas", "post-processor");

  // Plugins
  pg.use(StatsPlugin, DebugToolsPlugin, CameraHelperPlugin, WindowResizePlugin);
  // Scene
  pg.use(CAR_KIT_SCENE, CAR_KIT_POSTPROC);

  pg.run();
})();
