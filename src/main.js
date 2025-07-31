import { ev, EventsManager } from "@lib/Events";
import {
  CameraHelperPlugin,
  DebugToolsPlugin,
  StatsPlugin,
  WindowResizePlugin,
} from "@lib/Plugins";
import { NewProgram } from "@lib/Program";
import { getElementById } from "@lib/utils";
import { CAR_KIT_POSTPROC } from "@post_processors/carkit.postproc";
import { CAR_KIT_SCENE } from "@scenes/carkit.scene";
import { CUBIC_SCENE } from "@scenes/cubic.scene";
import { GRID_CAMERA, GRID_SCENE } from "@scenes/grid.scene";

const canvasEl = getElementById("webgl-canvas");

EventsManager(canvasEl);

// Program
(async () => {
  const pg = NewProgram(canvasEl, "post-processor");

  /***** Plugins *****/
  pg.use(StatsPlugin, DebugToolsPlugin, CameraHelperPlugin, WindowResizePlugin);

  /***** Scenes *****/
  /** Cube **/
  // pg.use(CUBIC_SCENE);
  /** Car Kit **/
  // pg.use(CAR_KIT_SCENE, CAR_KIT_POSTPROC);
  /** Grid Slider **/
  pg.use(GRID_CAMERA, GRID_SCENE);

  pg.run();
})();
