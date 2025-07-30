import { proxy } from "valtio/vanilla";

export const carKitStore = proxy({
  colorTheme: "dark",
  cars: ["race", "truck", "van"],
  currentCar: "race",
});
