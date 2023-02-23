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

async function writer(text: string) {
  await Deno.write(Deno.stdout.rid, new TextEncoder().encode(`\r${text}`));
}

async function ringBell() {
  await writer("\x07");
}

export { ringBell, thingOnCadence };
