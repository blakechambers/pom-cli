const BELL_CHAR = "\x07";

interface AsyncCBProc {
  (): Promise<void>;
}

function thingOnCadence(endTime: Date, func: AsyncCBProc): () => void {
  const bellSecondsOffset = 3;
  const timeIndex = new Date(endTime.getTime());

  return async () => {
    const currentTime = new Date();
    if (currentTime > timeIndex) {
      await func();
      timeIndex.setSeconds(
        timeIndex.getSeconds() + bellSecondsOffset,
      );
    }
  };
}

async function writer(text: string): Promise<void> {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(`\r${text}`);
  await Deno.stdout.write(bytes); // :contentReference[oaicite:0]{index=0}
}

async function ringBell(): Promise<void> {
  await writer(BELL_CHAR);
}

export { ringBell, thingOnCadence };
