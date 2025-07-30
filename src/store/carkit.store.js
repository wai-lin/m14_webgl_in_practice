import { proxy } from "valtio/vanilla";

export const carKitStore = proxy({
  colorTheme: { value: "dark" },
  cars: ["race", "truck", "van"],
  currentCar: "race",
});
