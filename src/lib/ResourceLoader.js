import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";

export class ResourceLoader {
  /**
   * @type {Map<string, AppTypes.Resource>}
   */
  #resourceMap = new Map();
  /**
   * @type {Map<string, any>}
   */
  #resources = new Map();

  /**
   * @type {Record<AppTypes.ResourceType, THREE.Loader>}
   */
  #loaders;
  /**
   * @type {'idle' | 'loading' | 'complete' | 'error'}
   */
  #status = "idle";
  /**
   * Progress tracking for loading resources.
   */
  #loadingProgress = { loaded: 0, total: 0 };

  constructor() {
    this.#loaders = {
      texture: new THREE.TextureLoader(),
      gltf: new GLTFLoader(),
    };
  }

  /**
   * Current status of the resource loader.
   * @returns {'idle' | 'loading' | 'complete' | 'error'}
   */
  get status() {
    return this.#status;
  }

  /**
   * Queue resource to loader list.
   * @param {AppTypes.Resource} r
   */
  queueResource(r) {
    if (this.#resourceMap.has(r.name))
      console.warn(`Resource ${r.name} already exists, overwriting`);

    this.#resourceMap.set(r.name, r);
  }

  /**
   * Get resource by name.
   * @param {string} name
   */
  getResource(name) {
    if (!this.#resources.has(name))
      console.warn(`Resource '${name}' not found`);

    return this.#resources.get(name);
  }

  /**
   * Load all resources.
   */
  async load() {
    if (this.#status === "loading") {
      throw new Error("Already loading resources");
    }
    if (this.#status === "complete") {
      console.warn("Resources already loaded");
      return;
    }

    this.#status = "loading";
    const promises = [];

    for (const [name, resource] of this.#resourceMap) {
      const promise = new Promise((resolve, reject) => {
        const onError = (error) => {
          const errorMsg = `Failed to load ${resource.type} resource '${name}' from '${resource.url}'`;
          console.error(errorMsg, error);
          reject(new Error(errorMsg));
        };
        const onProgress = (event) => {
          if (event.lengthComputable) {
            this.#loadingProgress.loaded = event.loaded;
            this.#loadingProgress.total = event.total;
          }
        };
        const onLoad = (data) => {
          this.#resources.set(name, data);
          resolve(data);
        };

        const loader = this.#loaders[resource.type];
        if (loader) {
          loader.load(resource.url, onLoad, onProgress, onError);
        } else {
          const msg = `No loader found for resource type: ${resource.type}`;
          console.error(msg);
          reject(new Error(msg));
        }
      });

      promises.push(promise);
    }

    try {
      await Promise.all(promises);
      this.#status = "complete";
    } catch (error) {
      console.error("Error loading resources:", error);
      this.#status = "error";
    }
  }
}
