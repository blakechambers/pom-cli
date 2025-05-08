// bell_test.ts
import { assertEquals } from "../test_deps.ts";
import { ringBell, thingOnCadence } from "./bell.ts";

Deno.test("thingOnCadence: invokes callback once when endTime is in the past", async () => {
  let called = 0;
  const cb = async () => {
    called++;
  };

  // endTime 1 second ago → should fire immediately
  const endTime = new Date(Date.now() - 1_000);
  const tick = thingOnCadence(endTime, cb);

  await tick();
  assertEquals(called, 1);

  // next tick (timeIndex was advanced by 3s) → shouldn't fire yet
  await tick();
  assertEquals(called, 1);
});

Deno.test("ringBell: writes a carriage return + bell character to stdout", async () => {
  const originalStdout = Deno.stdout;
  const chunks: Uint8Array[] = [];

  // @ts-ignore: monkey-patch for test
  Deno.stdout = {
    write(chunk: Uint8Array): Promise<number> {
      chunks.push(chunk);
      return Promise.resolve(chunk.length);
    },
    // include whatever other props exist to satisfy the runtime
    writable: originalStdout.writable,
    close(): void {},
  } as unknown;

  await ringBell();

  // restore
  // @ts-ignore
  Deno.stdout = originalStdout;

  // concatenate all chunks into one Uint8Array
  const totalLen = chunks.reduce((sum, c) => sum + c.length, 0);
  const buf = new Uint8Array(totalLen);
  let offset = 0;
  for (const c of chunks) {
    buf.set(c, offset);
    offset += c.length;
  }

  const output = new TextDecoder().decode(buf);
  // writer always prefixes "\r"
  assertEquals(output, "\r\x07");
});
