import { assertEquals } from "../test_deps.ts";
import {
  durationStringToMilliseconds,
  millisecondsToString,
} from "./time_string_parsing.ts";

const { test } = Deno;

test({
  name:
    "durationStringToMilliseconds - should convert a time formatted string to the number of milliseconds",
  fn: () => {
    assertEquals(durationStringToMilliseconds("1ms"), 1);
    assertEquals(durationStringToMilliseconds("1s"), 1000);
    assertEquals(durationStringToMilliseconds("1m"), 60000);
    assertEquals(durationStringToMilliseconds("1h"), 3600000);
  },
});

test({
  name:
    "millisecondsToString - variations of time (ms, s, m, h) should be converted to a human readable string",
  fn: () => {
    assertEquals(millisecondsToString(1), "1 millisecond");
    assertEquals(millisecondsToString(1000), "1 second");
    assertEquals(millisecondsToString(60000), "1 minute");
    assertEquals(millisecondsToString(3600000), "1 hour");

    //pluralization
    assertEquals(millisecondsToString(2), "2 milliseconds");
    assertEquals(millisecondsToString(2000), "2 seconds");
    assertEquals(millisecondsToString(120000), "2 minutes");
    assertEquals(millisecondsToString(7200000), "2 hours");
  },
});

test({
  name: "millisecondsToString - rounding",
  fn: () => {
    assertEquals(millisecondsToString(999), "999 milliseconds");
    assertEquals(millisecondsToString(1001), "1 second");
    assertEquals(millisecondsToString(60001), "1 minute");
    assertEquals(millisecondsToString(3600001), "1 hour");
  },
});
