/*
this file tests the contents of the config.ts file.

the test should model the following cases:
- the config file does not exist for the specified path
- the config file exists, but is not a valid json file
- the config file exists, and is a valid json file, but does not contain the required configuration (cases for each of the config options)
- the config file exists, and is a valid json file, and contains the required configuration
- cli requested options override the config file options

Existing fixtures:
- test_data/invalid_json.json
- test_data/valid_config.json

Expected error messages:
- ConfigLoadError, config file does not exist
- ConfigLoadError, config file is not a valid json file
- ConfigLoadError, config file is missing required configuration
*/
import { assertEquals, assertThrows, assertThrowsAsync } from "../test_deps.ts";
import { fromFileUrl, resolve } from "https://deno.land/std/path/mod.ts";
import { Config, ConfigLoadError, loadConfigFromOptions } from "./config.ts";

const { test } = Deno;

test("config file does not exist", async () => {
  const configPath = resolve(
    fromFileUrl(import.meta.url),
    "../test_data/does_not_exist.json",
  );

  await assertThrowsAsync(
    async () => {
      await loadConfigFromOptions({ config: configPath });
    },
    ConfigLoadError,
    "config file does not exist",
  );
});

test("config file is not a valid json file", async () => {
  const configPath = resolve(
    fromFileUrl(import.meta.url),
    "../test_data/invalid_json.json",
  );

  await assertThrowsAsync(
    async () => {
      await loadConfigFromOptions({ config: configPath });
    },
    ConfigLoadError,
    "config file is not a valid json file",
  );
});

test("config.jounalFormat = template missing other required options", () => {
  assertThrows(
    () => {
      new Config({ journalFormat: "template" });
    },
    ConfigLoadError,
  );
});

test("cli requested options override the config file options", async () => {
  const configPath = resolve(
    fromFileUrl(import.meta.url),
    "../test_data/config_with_template_option_set.json",
  );

  // cli requested options override the config file options
  const config = await loadConfigFromOptions({
    config: configPath,
    journalFormat: "json",
  });

  assertEquals(config.journalFormat, "json");
});

test("omiting nulls from cli options", async () => {
  const configPath = resolve(
    fromFileUrl(import.meta.url),
    "../test_data/valid_config.json",
  );

  const config = await loadConfigFromOptions({
    config: configPath,
    journalDir: undefined,
  });

  assertEquals(config.journalDir, "/path/to/journal/directory");
});
