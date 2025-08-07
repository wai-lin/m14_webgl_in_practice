import { EffectComposer } from "postprocessing";
import * as THREE from "three";

export { };

type PrettyObject<G> = {
	[K in keyof G]: G[K];
};

declare global {
	namespace ProgramTypes {
		export type Context = {
			scene: THREE.Scene;
			camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
			webgl: THREE.WebGLRenderer;
			canvasEl: HTMLCanvasElement;
			clock: THREE.Clock;
			composer: EffectComposer;
			provide: (name: string, value: any) => void;
			get: <V = any>(name: string) => V | undefined;
		};

		export type OnLoadFn = (ctx: Context) => void | Promise<void>;
		export type OnInitFn = (ctx: Context) => void | Promise<void>;
		export type OnEventListenerFn = (ctx: Context) => void | Promise<void>;
		export type OnAnimateFn = (ctx: Context) => void;
		export type OnAfterAnimateFn = (ctx: Context) => void;

		export type ModuleOptions = {
			name: string;
			onLoad?: OnLoadFn;
			onInit?: OnInitFn;
			onEventListener?: OnEventListenerFn;
			onAnimate?: OnAnimateFn;
			onAfterAnimate?: OnAfterAnimateFn;
		};
		export type CreateModuleFn = (config: ModuleOptions) => ModuleOptions;
		export type Module = ReturnType<CreateModuleFn>;

		type OnBeforeCompileFn = (
			shader: THREE.WebGLProgramParametersWithUniforms,
		) => void;
		export type CustomShaderOptions = {
			uniforms?: Record<string, any>;
			vertexShader?: string;
			fragmentShader?: string;
		};
		export type AttachShaderFn = (
			options: CustomShaderOptions,
		) => OnBeforeCompileFn;

		// === Resources ===
		export type ResourceType = "gltf" | "texture";
		export type Resource = {
			type: ResourceType;
			name: string;
			url: string;
			rejectOnFailure?: boolean;
		};
		export type GetResourceFn = (name: string) => any;
	}
}
