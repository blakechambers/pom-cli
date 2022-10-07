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

export { thingOnCadence };
