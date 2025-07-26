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
      clock: THREE.Clock;
      camera: THREE.PerspectiveCamera;
      controls: OrbitControls;
      scene: THREE.Scene;
    };

    export type SetSceneArgs = AppContext;
    export type SetSceneFn = (
      context: SetSceneArgs
    ) => THREE.Scene | Promise<THREE.Scene>;

    export type OnAnimateArgs = PrettyObject<
      AppContext & { setScene: SetSceneFn }
    >;
    export type OnAnimateFn = (context: OnAnimateArgs) => void;

    export type ResourceType = "gltf" | "texture";
    export type Resource = {
      type: ResourceType;
      name: string;
      url: string;
    };
  }
}
