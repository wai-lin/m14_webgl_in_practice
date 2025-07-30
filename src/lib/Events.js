import mitt from "mitt";
import { STORE } from "./store";

/**
 * All events that can be emitted by the application.
 * @typedef Events
 * @property {UIEvent} onWindowResize - Triggered when the window is resized.
 * @property {KeyboardEvent} onKeyDown - Triggered when a key is pressed down.
 */

/**
 * Event emitter for the application.
 * @type {import("mitt").Emitter<Events>}
 */
export const ev = mitt();

/**
 * EventsManager is responsible for managing application-wide events.
 */
export function EventsManager() {
  const url = new URL(window.location.href);
  if (url.searchParams.get("debug") === "true") {
    STORE.debug.enabled = true;
  } else {
    STORE.debug.enabled = false;
  }

  addEventListener("resize", (e) => ev.emit("onWindowResize", e));
  addEventListener("keydown", (e) => ev.emit("onKeyDown", e));
}
