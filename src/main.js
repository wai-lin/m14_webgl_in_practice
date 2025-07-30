import { EventsManager } from "@lib/Events";
import {
  CameraHelperPlugin,
  DebugToolsPlugin,
  StatsPlugin,
  WindowResizePlugin,
} from "@lib/Plugins";
import { NewProgram } from "@lib/Program";
import { CAR_KIT_POSTPROC } from "@post_processors/carkit.postproc";
import { CAR_KIT_SCENE } from "@scenes/carkit.scene";
import "./style.css";

(async () => {
  EventsManager();
  const pg = NewProgram("#webgl-canvas", "post-processor");

  // Plugins
  pg.use(StatsPlugin, DebugToolsPlugin, CameraHelperPlugin, WindowResizePlugin);
  // Scene
  pg.use(CAR_KIT_SCENE, CAR_KIT_POSTPROC);

  pg.run();
})();
