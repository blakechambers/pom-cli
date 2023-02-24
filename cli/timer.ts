import { ArgTypes, buildTask, lineWriter, red, ringBell } from "../deps.ts";
import { thingOnCadence } from "../util/bell.ts";
import { Config, loadConfigFromOptions } from "../util/config.ts";
import {
  durationStringToMilliseconds,
  millisecondsToString,
} from "../util/time_string_parsing.ts";
import { writeToJournalFile } from "../journalFile.ts";

interface TimerOpts {
  duration: string;
  focus: string;
  alarm: boolean;
  journalDir: string;
  journalFile: string;
  journalFormat: string;
  journalTemplateFile: string;
}

interface ConfigurableTimerOpts extends TimerOpts {
  config: string;
}

async function timer(
  options: ConfigurableTimerOpts,
): Promise<void> {
  const config = await loadConfigFromOptions(options);

  const {
    duration,
    focus,
    alarm,
  } = config;

  console.log("[CONFIG]", config);

  const durationInMilliseconds = durationStringToMilliseconds(duration);

  const startingTime = new Date();
  const endingTime = new Date(startingTime.getTime() + durationInMilliseconds);
  const allowOvertime = alarm;

  const bar = new ProgressBar(startingTime, endingTime, allowOvertime);

  const outputText = `
[focus block]
start: ${startingTime.toLocaleTimeString()} – ${endingTime.toLocaleTimeString()} (duration ${
    millisecondsToString(durationInMilliseconds)
  })
focus:

${focus}
`;
  console.log(outputText);

  Deno.addSignalListener("SIGINT", async () => {
    if (config.journalingEnabled) {
      await recordSessionEnd({
        config,
        focus,
        alarm,
        startingTime,
        endingTimePlanned: endingTime,
      });
    }

    Deno.exit();
  });

  const conditionallyRingBell = thingOnCadence(endingTime, ringBell);

  await lineWriter(async (writer) => {
    for await (const entry of bar.eachDisplayWindow()) {
      if (entry.isOvertime()) {
        conditionallyRingBell();

        await writer(
          `${entry.formattedTimeRemaining()} goal: ${focus} (${
            red(`overtime: ${entry.formattedOvertime()}`)
          })`,
        );
      } else {
        await writer(`${entry.formattedTimeRemaining()} goal: ${focus}`);
      }
    }
  });

  if (config.journalingEnabled) {
    await recordSessionEnd({
      config,
      focus,
      alarm,
      startingTime,
      endingTimePlanned: endingTime,
    });
  }
}

interface EndSessionOptions {
  config: Config;
  focus: string;
  alarm: boolean;
  startingTime: Date;
  endingTimePlanned: Date;
}

async function recordSessionEnd(
  { config, focus, alarm, startingTime, endingTimePlanned }: EndSessionOptions,
) {
  const endingTimeActual = new Date();

  await writeToJournalFile(config, {
    goal: focus,
    alarm,
    startingTime,
    endingTimePlanned,
    endingTimeActual,
  });
}

function sleepUntil(timeFuture: Date) {
  return new Promise((resolve) => {
    const timeNow = new Date();

    setTimeout(resolve, timeFuture.getTime() - timeNow.getTime());
  });
}

class ProgressBar {
  startTime: Date;
  endTime: Date;
  allowOvertime: boolean;

  constructor(startTime: Date, endTime: Date, allowOvertime: boolean) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.allowOvertime = allowOvertime;
  }

  async *eachDisplayWindow() {
    const updateOffsetMilliseconds = 100;
    const timeIndex = new Date();

    while (this.allowOvertime || (timeIndex < this.endTime)) {
      timeIndex.setMilliseconds(
        timeIndex.getMilliseconds() + updateOffsetMilliseconds,
      );
      await sleepUntil(timeIndex);

      yield this;
    }
  }

  isOvertime(): boolean {
    const endTimeOffset = this.endTime.getTime();
    const currentTimeOffset = new Date().getTime();

    return currentTimeOffset > endTimeOffset;
  }

  formattedTimeRemaining(): string {
    // const startTimeOffset = this.startTime.getTime();
    const endTimeOffset = this.endTime.getTime();
    const currentTimeOffset = new Date().getTime();

    const currentOrEndDuration = currentTimeOffset > endTimeOffset
      ? currentTimeOffset
      : endTimeOffset;

    const millisecondsRemaining = currentOrEndDuration - currentTimeOffset;

    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);

    // here, I'm adding a second because of how toTimeString will always round
    // down. For example, imagine a one second timer.  On the first render frame,
    // you would likely be dealing with a clock with 990ms remaining.
    //
    // toTimeString would always display "0s" in this case.
    //
    // Instead, we add a second forcing the display to show "1s remaining" for
    // the full second.  The moment it changes display, the timer would be over.
    const midPlus = new Date(midnight.getTime() + millisecondsRemaining + 999);

    // we just want the time component, not the timezone and offset.
    const formattedOut = midPlus.toTimeString().replace(
      /.*(\d{2}:\d{2}:\d{2}).*/,
      "$1",
    );

    return formattedOut;
  }

  formattedOvertime(): string {
    // const startTimeOffset = this.startTime.getTime();
    const endTimeOffset = this.endTime.getTime();
    const currentTimeOffset = new Date().getTime();

    const millisecondsOver = currentTimeOffset - endTimeOffset;

    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);

    const midPlus = new Date(midnight.getTime() + millisecondsOver);
    const formattedOut = midPlus.toTimeString().replace(
      /.*(\d{2}:\d{2}:\d{2}).*/,
      "$1",
    );

    return formattedOut;
  }
}

const task = buildTask(timer, (t) => {
  t.desc = "start a simple timer";

  t.addOption("duration", (o) => {
    o.desc =
      "How long do you want the timer to run for (in minutes). Passing 30s will translate to 30 seconds. Defaults to 25 minutes.";
    o.required = false;

    o.type = ArgTypes.String;
  });

  t.addOption("focus", (a) => {
    a.desc = "What are you focusing on";
    a.required = false;

    a.type = ArgTypes.String;
  });

  t.addOption("alarm", (o) => {
    o.desc = "will the timer ring an alarm when complete. Defaults to 'true'";
    o.required = false;

    o.type = ArgTypes.Boolean;
  });

  t.addOption("journalDir", (a) => {
    a.desc = "Record the session by creating files in this directory";
    a.required = false;

    a.type = ArgTypes.String;
  });

  t.addOption("journalFile", (a) => {
    a.desc =
      "A templated file path to create the journal file in. Uses luxon tokens to format the path.  New directories will be created if they don't exist.  Defaults to `yyyyMMddHHmmss'.json'`";
    a.required = false;

    a.type = ArgTypes.String;
  });

  t.addOption("journalFormat", (a) => {
    a.desc =
      "The format of the journal file.  Allowed options are `json` or `template`.  Defaults to `json`";
    a.required = false;

    a.type = ArgTypes.String;
  });

  t.addOption("journalTemplateFile", (a) => {
    a.desc =
      "A file path to a template file to use when creating the journal file.  This is not required if `journalFormat` is set to `json`";
    a.required = false;

    a.type = ArgTypes.String;
  });

  t.addOption("config", (o) => {
    o.desc = "Config for the timer";

    o.required = false;
    o.type = ArgTypes.String;
  });
});

export default timer;
export { task };
export type { ConfigurableTimerOpts, TimerOpts };
