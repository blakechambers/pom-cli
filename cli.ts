import { fromFileUrl, main, resolve, subTasksFromDir, Task } from "./deps.ts";

const metaUrlFile = fromFileUrl(import.meta.url);
const relativePath = resolve(metaUrlFile, "../cli");

const subtasks = await subTasksFromDir(relativePath);

const task = new Task("Pom", undefined, (t) => {
  t.desc = "A simple time tracker / logger";

  [...subtasks.values()].forEach((subtask) => {
    t.addSubTask(subtask);
  });
});

if (import.meta.main) {
  main(task);
}
