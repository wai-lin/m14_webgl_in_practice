import { proxy } from "valtio/vanilla";

export const STORE = proxy({
  debug: { enabled: false },
});

window.ProgramState = STORE;
