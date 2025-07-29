import mitt from "mitt";

/**
 * All events that can be emitted by the application.
 * @typedef Events
 * @property {UIEvent} resize - Triggered when the window is resized.
 */

/**
 * EventsManager is responsible for managing application-wide events.
 */
export function EventsManager() {
  /** @type {import("mitt").Emitter<Events>} */
  const emitter = mitt();

  const listenEvents = () => {
    emitter.on("resize", (e) => {
      console.log("Window resized:", e);
    });
  };

  return {
    emitter,
    listenEvents,
  };
}
