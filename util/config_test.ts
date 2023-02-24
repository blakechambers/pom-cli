/*
this file tests the contents of the config.ts file.

the test should model the following cases:
- the config file does not exist for the specified path
- the config file exists, but is not a valid json file
- the config file exists, and is a valid json file, but does not contain the required configuration (cases for each of the config options)
- the config file exists, and is a valid json file, and contains the required configuration
*/
import { assertEquals, assertThrowsAsync } from "../test_deps.ts";
import {
  fromFileUrl,
  normalize,
  relative,
  resolve,
} from "https://deno.land/std/path/mod.ts";
import { ConfigLoadError, loadConfigFromFile } from "./config.ts";

const { test } = Deno;

test("config file does not exist", async () => {
  await assertThrowsAsync(
    async () => {
      await loadConfigFromFile("made-up-config-path.json");
    },
    ConfigLoadError,
    "config file does not exist",
  );
});

test("config file exists, but is not a valid json file", async () => {
  await assertThrowsAsync(
    async () => {
      await loadConfigFromFile(
        resolve(
          fromFileUrl(import.meta.url),
          "..",
          "./test_data/invalid_json.json",
        ),
      );
    },
    ConfigLoadError,
    "config file is not a valid json file",
  );
});

test("config file exists, and is a valid json file, but does not contain the required configuration", async () => {
  await assertThrowsAsync(
    async () => {
      await loadConfigFromFile(
        resolve(
          fromFileUrl(import.meta.url),
          "..",
          "./test_data/invalid_config.json",
        ),
      );
    },
    ConfigLoadError,
    "config file is missing required configuration",
  );
});

test("config file exists, and is a valid json file, and contains the required configuration", async () => {
  const config = await loadConfigFromFile(
    resolve(
      fromFileUrl(import.meta.url),
      "..",
      "./test_data/valid_config.json",
    ),
  );

  // given config

  // {
  //   "journalDir": "/path/to/journal/directory",
  //   "journalFile": "journal-file-name",
  //   "journalFormat": "json",
  //   "journalTemplateFile": "template-file-name"
  // }

  assertEquals(config.journalDir, "/path/to/journal/directory");
  assertEquals(config.journalFile, "journal-file-name");
  assertEquals(config.journalFormat, "json");
  assertEquals(config.journalTemplateFile, "template-file-name");
  assertEquals(config.journalingEnabled, true);
  assertEquals(config.templatingEnabled, true);
});
