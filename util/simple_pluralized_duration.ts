import { plural, singular } from "../deps.ts";

function fixedWhenNeeded(num: number, places: number) {
  const factor = (10 * places);

  return Math.round(num * factor) / factor;
}

function simplePuralizedDuration(num: number, text: string) {
  if (num === 1) {
    return `${fixedWhenNeeded(num, 2)} ${singular(text)}`;
  } else {
    return `${fixedWhenNeeded(num, 2)} ${plural(text)}`;
  }
}

export { simplePuralizedDuration };
