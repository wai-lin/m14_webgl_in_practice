import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";

export function NewResourceLoader() {
  /** @type {Record<ProgramTypes.ResourceType, THREE.Loader>} */
  const _loaders = {
    texture: new THREE.TextureLoader(),
    gltf: new GLTFLoader(),
  };

  /** @type {Map<string, any>} */
  const _resources = new Map();
  /** @type {ProgramTypes.Resource[]} */
  const _resourcesToLoad = [];

  /**
   * Add a resource to the loader queue.
   * @param {ProgramTypes.Resource[]} resources
   */
  const queueResources = (...resources) => {
    resources.forEach((r) => {
      _resourcesToLoad.push(r);
    });
  };

  /**
   * Get a resource by name.
   * @param {string} name
   */
  const getResource = (name) => {
    return _resources.get(name);
  };

  /**
   * Load all queued resources.
   */
  const loadResources = async () => {
    if (_resourcesToLoad.length === 0) {
      console.warn("No resources to load");
      return;
    }

    const promises = _resourcesToLoad.map((r) => {
      return new Promise((resolve, reject) => {
        const loader = _loaders[r.type];
        if (!loader) {
          console.error(`No loader found for resource type: ${r.type}`);
        }

        loader.load(
          r.url,
          (data) => {
            _resources.set(r.name, data);
            console.log(`Resource loaded: ${r.name}`);
            resolve(data);
          },
          undefined,
          (error) => {
            console.error(`Failed to load resource '${r.name}':`, error);
            if (r.rejectOnFailure) reject(error);
          }
        );
      });
    });

    try {
      await Promise.all(promises);
      console.log("All resources loaded successfully");
    } catch (error) {
      console.error("Error loading resources:", error);
    }
  };

  return {
    queueResources,
    getResource,
    loadResources,
  };
}
