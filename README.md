# pom-cli

Usage

```
cd ~/projects/process
deno run --allow-read=/Users/blakechambers/projects/deno/pom-cli,. --unstable ~/projects/deno/pom-cli/cli.ts help
```

### Using a config.json

To simplify configuration, you can use `--config` to set default parameters for
the timer. Assuming you have a file in `~/.pom-cli.json, containing:

```json
{
  "alarm": true,
  "journalDir": "~/Desktop",
  "journalFile": "yyyyMMddHHmmss'.md'",
  "journalFormat": "template",
  "journalTemplateFile": "~/Desktop/template.yml"
}
```

These options will set defaults for the values passed to the timer.

The result of the timer usage will result in "journals" of the timer being
recorded.

Goal:

A light weight time and focus management tool.

- pom start
  - start timer for $duration to focus on that goal
  - when done loop until program is killed
  - when killed, capture the end state.
  - record the end state in a journal file

Goals:

Ideas / Icebox:

- get it published
  - add a configuration file
    - ~/.blah for configuring default bits in the flow
  - test and trial the install flow
  - ship the libraries that are dependencies of this
    - hort
- add a workflow mode to use standard pom like flows (e.g. 25m, 5m break, etc)
- get it tested
  - things recently added:
    - journal behavior
    - various lib/util functions
    - alarm functionality
