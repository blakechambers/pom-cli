export {
  assertThrowsAsync,
} from "https://deno.land/std@0.106.0/testing/asserts.ts";
export {
  assert,
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.200.0/assert/mod.ts";

import { fromFileUrl, resolve } from "https://deno.land/std/path/mod.ts";

const TEST_DATA_DIR = "src/test_data";

export function testDataPath(path: string): string {
  return resolve(
    fromFileUrl(import.meta.url),
    `../${TEST_DATA_DIR}/${path}`,
  );
}
