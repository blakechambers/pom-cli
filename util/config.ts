interface ConfigOptions {
  journalDir?: string;
  journalFile?: string;
  journalFormat?: string;
  journalTemplateFile?: string;
}

// ConfigLoadError
//
// ConfigLoadError is an error that is thrown when the config file is not
// found, or is not a valid JSON file, or does not contain the required
// configuration.
//
class ConfigLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigLoadError";
  }
}

class Config {
  journalDir: string;
  journalFile: string;
  journalFormat: string;
  journalTemplateFile: string;
  journalingEnabled: boolean;
  templatingEnabled: boolean;

  constructor(options: ConfigOptions) {
    this.journalDir = options.journalDir || "";
    this.journalFile = options.journalFile || "";
    this.journalTemplateFile = options.journalTemplateFile || "json"; // default to json
    this.journalFormat = options.journalFormat || "";

    // ensure format valid
    if (this.journalFormat !== "json" && this.journalFormat !== "template") {
      throw new Error(
        `Invalid journal format: ${this.journalFormat}. Must be either 'json' or 'template'.`,
      );
    }

    this.journalingEnabled = Boolean(
      this.journalDir && this.journalFile && this.journalFormat,
    );

    this.templatingEnabled = Boolean(this.journalTemplateFile);
  }
}

// loadConfigFromFile accepts a deno file path, builds a config from
// configuration specified in the file, and returns a new Config object.
//
// The file must be a valid JSON file, and must contain the following
// configuration:
// {
//   "journalDir": "/path/to/journal/directory",
//   "journalFile": "journal-file-name",
//   "journalFormat": "json",
//   "journalTemplateFile": "template-file-name"
// }
//
// The journalFormat must be either 'json' or 'template'.
// The journalTemplateFile is optional, and only required if journalFormat
// is set to 'template'.  If journalFormat is set to 'template', then
// journalTemplateFile must be specified.
//
// ### Json Formatted output
//
// If journalFormat is set to 'json', then the journalFile will write a
// jsonified version of the `JournalEntry` to the file.
//
// ### Templating
//
// The journalTemplateFile is a eta template file.  The template accepts the
// `JournalEntry` object as a parameter.  It's not the responsibility of the loader to validate the templates structure.
//
// Conditions to handle:
// 1. If the file does not exist, throw a ConfigLoadError.
// 2. If the file exists, but is not a valid JSON file, throw a ConfigLoadError.
// 3. If the file exists, and is a valid JSON file, but does not contain
//    the required configuration, throw a ConfigLoadError.
//
async function loadConfigFromFile(filePath: string): Promise<Config> {
  let fileContents: string;

  try {
    fileContents = await Deno.readTextFile(filePath);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new ConfigLoadError("config file does not exist");
    }
    throw error;
  }

  let configOptions: ConfigOptions;

  try {
    configOptions = JSON.parse(fileContents) as ConfigOptions;
  } catch (error) {
    console.log({ error });
    throw new ConfigLoadError("config file is not a valid json file");
  }

  let config: Config;

  //try to load the config into a Config object
  try {
    config = new Config(configOptions);
  } catch (error) {
    throw new ConfigLoadError("config file is missing required configuration");
  }

  return config;
}

export { Config, ConfigLoadError, loadConfigFromFile };
