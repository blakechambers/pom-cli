import { DateTime, ensureFile, Interval, resolve } from "../deps.ts";
import { Config } from "./config.ts";

import { Eta } from "jsr:@eta-dev/eta";

interface JournalEntry {
  goal: string;
  alarm: boolean;
  startingTime: Date;
  endingTimePlanned: Date;
  endingTimeActual: Date;
}

// tokens are documented here: https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
function formatDateUsingLuxonDateTimeTokens(date: Date, format: string) {
  return DateTime.fromJSDate(date).toFormat(format);
}

async function renderJsonJournalFile(journalPath: string, data: JournalEntry) {
  return await Deno.writeTextFile(
    journalPath,
    JSON.stringify(data, null, 2),
  );
}

async function renderTemplateJournalFile(
  journalPath: string,
  config: Config,
  data: JournalEntry,
) {
  if (
    !config.templatingEnabled ||
    // TODO: these is because the config is not set to be either jounaled
    //       or not.  Better type checking can solve this.
    !config.journalTemplateFile
  ) throw new Error("Journaling is not enabled");

  // read template file
  // const myTemplate = await Deno.readTextFile(config.journalTemplateFile);

  // calculate interval
  const interval = Interval.fromDateTimes(
    DateTime.fromJSDate(data.startingTime),
    DateTime.fromJSDate(data.endingTimeActual),
  );

  // get views directory by splitting the template file path
  const templateFilePath = config.journalTemplateFile.split("/");
  const templateFileName = templateFilePath.pop() || "";
  const templateDir = templateFilePath.join("/");

  const eta = new Eta({ autoTrim: false, views: templateDir });

  // render template
  const result = eta.render(templateFileName, {
    ...data,
    interval,
    floor: Math.floor,
    formatDateUsingLuxonDateTimeTokens,
  });

  return await Deno.writeTextFile(journalPath, result);
}

async function writeToJournalFile(
  config: Config,
  data: JournalEntry,
): Promise<void> {
  const { startingTime } = data;

  if (
    // TODO: these is because the config is not set to be either jounaled
    //       or not.  Better type checking can solve this.
    !config.journalFile ||
    !config.journalDir
  ) throw new Error("Journaling is not enabled");

  const formattedFilePath = formatDateUsingLuxonDateTimeTokens(
    startingTime,
    config.journalFile,
  );

  const journalPath = resolve(
    config.journalDir,
    formattedFilePath,
  );

  await ensureFile(journalPath); // using this just to make sure the file folders and things are all present

  switch (config.journalFormat) {
    case "json":
      return await renderJsonJournalFile(
        journalPath,
        data,
      );
    case "template":
      return await renderTemplateJournalFile(
        journalPath,
        config,
        data,
      );
    default:
      throw new Error(`Invalid journalFormat: ${config.journalFormat}`);
  }
}

export { writeToJournalFile };
