import { ensureFile, resolve } from "./deps.ts";

interface JournalEntry {
  goal: string;
  alarm: boolean;
  startingTime: Date;
  endingTimePlanned: Date;
  endingTimeActual: Date;
}

async function writeToJournalFile(journalDir: string, data: JournalEntry) {
  const { startingTime } = data;

  const formattedDateFragment = [
    startingTime.getFullYear(),
    (startingTime.getMonth() + 1).toString().padStart(2, "0"),
    startingTime.getDate().toString().padStart(2, "0"),
  ].join(".");

  const formattedTimeFragment = [
    startingTime.getHours().toString().padStart(2, "0"),
    startingTime.getMinutes().toString().padStart(2, "0"),
    startingTime.getSeconds().toString().padStart(2, "0"),
  ].join(".");

  const journalPath = resolve(
    journalDir,
    formattedDateFragment,
    `pom.${formattedTimeFragment}.json`,
  );

  await ensureFile(journalPath); // using this just to make sure the file folders and things are all present
  await Deno.writeTextFile(journalPath, JSON.stringify(data, null, 2));
}

export { writeToJournalFile };
