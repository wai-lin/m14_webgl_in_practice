import { EventsManager } from "@lib/Events";
import {
  CameraHelperPlugin,
  DebugToolsPlugin,
  StatsPlugin,
  WindowResizePlugin,
} from "@lib/Plugins";
import { NewProgram } from "@lib/Program";
import { getElementById } from "@lib/utils";
import { GRID_SHADER_CAMERA, GRID_SHADER_SCENE } from "@scenes/grid_shader.scene";


const canvasEl = getElementById("webgl-canvas");

EventsManager(canvasEl);

// Program
(async () => {
  const pg = NewProgram(canvasEl, "post-processor");

  /***** Plugins *****/
  pg.use(
    /** Debuggers **/
    StatsPlugin,
    DebugToolsPlugin,
    CameraHelperPlugin,
    /** Helpers **/
    WindowResizePlugin
  );

  /***** Scenes *****/
  pg.use(
    /** Cube **/
    // CUBIC_SCENE,
    /** Car Kit **/
    // CAR_KIT_SCENE,
    // CAR_KIT_POSTPROC,
    /** Grid Slider **/
    // GRID_CAMERA,
    // GRID_SCENE,
    /** Glsl **/
    // GLSL_SCENE
    /** Grid Shader Slider **/
    GRID_SHADER_CAMERA,
    GRID_SHADER_SCENE,
  );

  pg.run();
})();
