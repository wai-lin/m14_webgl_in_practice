import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls";

type PrettyObject<G> = {
  [K in keyof G]: G[K];
};

declare global {
  namespace AppTypes {
    export type AppContext = {
      gl: THREE.WebGLRenderer;
      canvas: HTMLCanvasElement;
      camera: THREE.PerspectiveCamera;
      controls: OrbitControls;
      scene: THREE.Scene;
      sceneObjects: Map<string, any>;
    };

    export type SetSceneArgs = AppContext;
    export type SetSceneFn = (context: SetSceneArgs) => THREE.Scene;

    export type OnAnimateArgs = PrettyObject<
      AppContext & { setScene: SetSceneFn }
    >;
    export type OnAnimateFn = (context: OnAnimateArgs) => void;
  }
}
