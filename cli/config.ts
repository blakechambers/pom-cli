import type { ConfigurableTimerOpts, TimerOpts } from "./timer.ts";

class ConfigLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigLoadError";
  }
}

class Config {
  duration: string;
  focus: string;
  alarm: boolean;
  journalDir?: string;
  journalFile?: string;
  journalFormat: string;
  journalTemplateFile?: string;
  journalingEnabled: boolean;
  templatingEnabled: boolean;

  constructor(options: Partial<TimerOpts>) {
    this.duration = options.duration || "25m";
    this.focus = options.focus || "";
    this.alarm = options.alarm ? Boolean(options.alarm) : true;
    this.journalDir = options.journalDir || undefined;
    this.journalFile = options.journalFile || "yyyyMMddHHmmss'.json'";
    this.journalTemplateFile = options.journalTemplateFile || undefined;
    this.journalFormat = options.journalFormat || "json"; // default to json

    // ensure format valid
    if (this.journalFormat !== "json" && this.journalFormat !== "template") {
      throw new ConfigLoadError(
        `Invalid journal format: ${this.journalFormat}. Must be either 'json' or 'template'.`,
      );
    }

    // ensure template file is present if format is template
    if (
      this.journalFormat === "template" &&
      !this.journalTemplateFile
    ) {
      throw new ConfigLoadError(
        "journalTemplateFile must be provided if journalFormat is set to 'template'",
      );
    }

    this.journalingEnabled = Boolean(
      this.journalDir && this.journalFile && this.journalFormat,
    );

    this.templatingEnabled = Boolean(this.journalTemplateFile);
  }
}

async function loadConfigFromOptions({
  config: configPath,
  ...cliRequestedOptions
}: Partial<ConfigurableTimerOpts>): Promise<Config> {
  let fileContents: string;

  if (!configPath) {
    return new Config(cliRequestedOptions);
  }

  try {
    fileContents = await Deno.readTextFile(configPath);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new ConfigLoadError("config file does not exist");
    }
    throw error;
  }

  let configDefaultOptions: Partial<TimerOpts>;

  try {
    configDefaultOptions = JSON.parse(fileContents) as Partial<TimerOpts>;
  } catch (error) {
    console.log({ error });
    throw new ConfigLoadError("config file is not a valid json file");
  }

  // remove any undefined values from the cli options
  const cliRequestedOptionsWithoutUndefinedValues = Object.fromEntries(
    Object.entries(cliRequestedOptions).filter(([_, v]) => v != null),
  );

  // merge the config file options with the cli options. cli options take precedence
  const configOptions = {
    ...configDefaultOptions,
    ...cliRequestedOptionsWithoutUndefinedValues,
  };

  return new Config(configOptions);
}

export { Config, ConfigLoadError, loadConfigFromOptions };
