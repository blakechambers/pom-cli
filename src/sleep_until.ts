export function sleepUntil(timeFuture: Date) {
  return new Promise((resolve) => {
    const timeNow = new Date();

    setTimeout(resolve, timeFuture.getTime() - timeNow.getTime());
  });
}
