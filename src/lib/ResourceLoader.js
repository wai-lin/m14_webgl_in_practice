import * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export function NewResourceLoader() {
	/** @type {Record<ProgramTypes.ResourceType, THREE.Loader>} */
	const _loaders = {
		texture: new THREE.TextureLoader(),
		gltf: new GLTFLoader().setDRACOLoader(
			new DRACOLoader().setDecoderPath("/draco/"),
		),
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
					const error = new Error(
						`No loader found for resource type: ${r.type}`,
					);
					console.error(error.message);
					if (r.rejectOnFailure) reject(error);
					else resolve(null);
					return;
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
						else resolve(null); // Don't reject, just resolve with null
					},
				);
			});
		});

		try {
			const results = await Promise.allSettled(promises);

			// Check if any critical resources (rejectOnFailure: true) failed
			const criticalFailures = results
				.map((result, index) => ({ result, resource: _resourcesToLoad[index] }))
				.filter(
					({ result, resource }) =>
						result.status === "rejected" && resource.rejectOnFailure,
				);

			if (criticalFailures.length > 0) {
				const failedNames = criticalFailures.map(
					({ resource }) => resource.name,
				);
				throw new Error(
					`Critical resources failed to load: ${failedNames.join(", ")}`,
				);
			}

			const successCount = results.filter(
				(r) => r.status === "fulfilled",
			).length;
			const failureCount = results.filter(
				(r) => r.status === "rejected",
			).length;

			console.log(
				`Resources loaded: ${successCount} successful, ${failureCount} failed`,
			);
		} catch (error) {
			console.error("Error loading resources:", error);
			throw error; // Re-throw for critical failures
		} finally {
			// Clear the queue after loading
			_resourcesToLoad.length = 0;
		}
	};

	return {
		queueResources,
		getResource,
		loadResources,
	};
}
