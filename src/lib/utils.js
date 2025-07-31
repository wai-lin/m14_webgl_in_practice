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
