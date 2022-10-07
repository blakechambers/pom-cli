import { simplePuralizedDuration } from "./simple_pluralized_duration.ts";

const MS = {
  inSecond: 1000,
  inMinute: 60 * 1000,
  inHour: 60 * 60 * 1000,
};

function durationStringToMilliseconds(durString: string): number {
  const regex = /^(\d+(\.\d+)?)(m|ms|s|h)$/;

  const matchData = durString.match(regex);

  if (!matchData) {
    throw new Error(
      "regex must be in the format 30s.  supports milliseconds (ms), seconds (s), minutes (m), and hours (h)",
    );
  }

  const [_, numberStr, _floatingFragment, unit] = matchData;
  const number = parseFloat(numberStr);

  switch (unit) {
    case "ms":
      return number;
    case "s":
      return number * MS.inSecond;
    case "m":
      return number * MS.inMinute;
    case "h":
      return number * MS.inHour;
    default:
      throw new Error("panic – should not be accessible");
  }
}

function millisecondsToString(ms: number) {
  if (ms < MS.inSecond) {
    return simplePuralizedDuration(ms, "milliseconds");
  } else if (ms < MS.inMinute) {
    return simplePuralizedDuration(
      ms / MS.inSecond,
      "seconds",
    );
  } else if (ms < MS.inHour) {
    return simplePuralizedDuration(
      ms / MS.inMinute,
      "minutes",
    );
  } else {
    return simplePuralizedDuration(ms / MS.inHour, "hours");
  }
}

export { durationStringToMilliseconds, millisecondsToString };
