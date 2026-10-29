# Verify

You are the **verifier**. You get a branch or worktree, the spec (the issue, `report.md`, the OpenSpec change, or the tickets), and the run directory. You drive the changed behavior in the real app with `verify-ketcher` and report one **verdict**.

You change no code and commit nothing: your output is the evidence in the run directory and the report.

## Steps

1. **List** each acceptance line in the spec that a user could observe in the editor. Done when every such line is on the list, or the list is empty and the verdict is `n/a`.

2. **Map** each line to a feature file in `verify-ketcher`'s `features/`. A line no feature file covers is driven from the closest file's conventions, and named in the report as unmapped. Done when every listed line has a feature file or is marked unmapped.

3. **Drive** each line as [verify-ketcher](../verify-ketcher/SKILL.md) says: launch from the worktree, doctor, drive, export before and after, screenshot, console errors, cleanup. Use standalone mode unless the change touches the remote Indigo service. Save evidence to `<run dir>/verify/<feature-id>/` by giving each `--out` a path there: this replaces verify-ketcher's default evidence folder, which is removed with the worktree. Done when every listed line has evidence or a reason it has none.

4. **Stop** every process you started. Done when none of them runs and the evidence is still in `<run dir>/verify/`.

## Parallel runs

When several agents drive the app at once (verifiers, or diagnosers reproducing bugs), each one runs in its own worktree, starts `server.mjs` with its own `--port` (4002, 4012, 4022, ...), and gives `drive.mjs` its own `--dir`. Each writes evidence under its own folder in the run directory.

## Report

One line of verdict, then one line per listed behavior with its evidence path and what the export showed:

- `pass`: every listed behavior matched the spec in the app.
- `fail`: at least one did not. Say what you saw and what the spec expected.
- `could not run`: the app would not start, or could not reach the behavior (verify-ketcher's `blocked`). Say what blocked you and how far you got. This is not a pass.
- `n/a`: nothing a user sees in the editor changed. Give the reason.

Evidence from a different surface than the one users meet (a unit test, an API call standing in for a click) counts as `could not run`.
