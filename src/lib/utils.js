import { STORE } from "./store";

export function rangeTimedScale(ocillatedTime, min, max) {
	const normalizedScale = (ocillatedTime + 1) * 0.5;
	return normalizedScale * (max - min) + min;
}

/**
 * Gets the element by ID.
 * @param {string} id
 */
export function getElementById(id) {
	const elementId = (id ?? "").replace("#", "");
	if (elementId === "") throw new Error("Element ID must be provided");

	const el = document.getElementById(elementId);
	if (!el) throw new Error(`Element with ID ${id} not found`);

	return el;
}

/** @type {ProgramTypes.AttachShaderFn} */
export function attachShader(options) {
	/**
	 * Split shader code into variables, functions and logic sections.
	 * @param {string} glsl
	 */
	const splitShaderCode = (glsl) => {
		// variables declaration
		// starts with /// #variables
		// and ends with /// #end-variables
		const variablesRegex =
			/\/\/\/\s*#variables\s*([\s\S]*?)\/\/\/\s*#end-variables/g;
		const match = variablesRegex.exec(glsl);
		let variables = match ? match[1] : "";

		// functions declaration
		// starts with /// #functions
		// and ends with /// #end-functions
		const functionsRegex =
			/\/\/\/\s*#functions\s*([\s\S]*?)\/\/\/\s*#end-functions/g;
		const functionsMatch = functionsRegex.exec(glsl);
		let functions = functionsMatch ? functionsMatch[1] : "";

		// logic section
		// starts with /// #shader
		// and ends with /// #end-shader
		const logicRegex = /\/\/\/\s*#shader\s*([\s\S]*?)\/\/\/\s*#end-shader/g;
		const logicMatch = logicRegex.exec(glsl);
		let shaderCode = logicMatch ? logicMatch[1] : "";

		return { variables, functions, shaderCode };
	};

	/**
	 * @param {import("three").WebGLProgramParametersWithUniforms} shader
	 */
	const onBeforeCompile = (shader) => {
		if (options.uniforms) {
			Object.entries(options.uniforms).forEach(([key, value]) => {
				shader.uniforms[key] = { value };
			});
		}

		if (options.vertexShader) {
			const { variables, functions, shaderCode } = splitShaderCode(
				options.vertexShader,
			);
			if (variables.trim() !== "")
				shader.vertexShader = shader.vertexShader.replace(
					"#include <common>",
					"\n\n" + variables + "\n#include <common>",
				);
			if (functions.trim() !== "")
				shader.vertexShader = shader.vertexShader.replace(
					"void main() {",
					"\n\n" + functions + "\nvoid main() {\n",
				);
			if (shaderCode.trim() !== "")
				shader.vertexShader = shader.vertexShader.replace(
					"#include <begin_vertex>",
					"#include <begin_vertex>\n\n" + shaderCode + "\n",
				);
		}

		if (options.fragmentShader) {
			const { variables, functions, shaderCode } = splitShaderCode(
				options.fragmentShader,
			);
			if (variables.trim() !== "")
				shader.fragmentShader = shader.fragmentShader.replace(
					"#include <common>",
					"\n\n" + variables + "\n#include <common>",
				);
			if (functions.trim() !== "")
				shader.fragmentShader = shader.fragmentShader.replace(
					"void main() {",
					"\n\n" + functions + "\nvoid main() {\n",
				);
			if (shaderCode.trim() !== "")
				shader.fragmentShader = shader.fragmentShader.replace(
					"#include <dithering_fragment>",
					"#include <dithering_fragment>\n\n" + shaderCode + "\n",
				);
		}

		if (STORE.debug.enabled) {
			console.log(shader.uniforms);
			console.log(shader.vertexShader);
			console.log(shader.fragmentShader);
		}
	};

	return onBeforeCompile;
}
