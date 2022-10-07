# pom-cli

Usage

```
cd ~/projects/process
deno run --allow-read=/Users/blakechambers/projects/deno/pom-cli,. --unstable ~/projects/deno/pom-cli/cli.ts help
```

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
