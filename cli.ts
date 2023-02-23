import { main, Task } from "./deps.ts";
import { task as timerTask } from "./cli/timer.ts";

const task = new Task("Pom", undefined, (t) => {
  t.desc = "A simple time tracker / logger";

  t.addSubTask(timerTask);
});

if (import.meta.main) {
  main(task);
}
