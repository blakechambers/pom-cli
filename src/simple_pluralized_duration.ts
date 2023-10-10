import { plural, singular } from "../deps.ts";

function fixedWhenNeeded(num: number, places: number) {
  const factor = (10 * places);

  return Math.round(num * factor) / factor;
}

function simplePuralizedDuration(num: number, text: string) {
  const fixed = fixedWhenNeeded(num, 2);

  if (fixed === 1) {
    return `${fixed} ${singular(text)}`;
  } else {
    return `${fixed} ${plural(text)}`;
  }
}

export { simplePuralizedDuration };
