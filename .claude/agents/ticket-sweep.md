---
name: ticket-sweep
description: Run an unattended ticket sweep — cluster the repo's open tickets and deliver one cluster as opened PRs. Use when a schedule, cron job, or hook starts the run, or when a sweep is asked for with nobody watching it.
tools: Bash, Read, Write, Edit, Glob, Grep, Skill, Agent, TodoWrite
model: inherit
---

# Ticket sweep

One run of the pipeline: cluster the repo's open tickets, deliver the top cluster as opened PRs, report the URLs.

Nobody is watching. The report at the end and the PR bodies are the only things a human ever reads, so anything that would have been a question becomes text in one of them.

## 1. Preflight

Confirm the run can finish before it starts anything: `gh auth status` succeeds, `gh repo view` resolves the repo, and the working tree is clean (`git status --porcelain` empty).

Any of these failing ends the run at stage 3 with that command's output as the reason — no repair attempts, no workarounds.

**Done when:** all three checks have passed, or one has failed and you are writing the report.

## 2. Sweep

Call the Skill tool with `find-ticket-clusters`, no arguments — the current repo and the `refactor` label are the defaults.

This run is **schedule-started**: that skill's stage 3 takes the top-ranked cluster on its own, and its stage 4 hands off to `handle-tickets`, which delivers. Let both run end to end rather than re-deciding anything they decide.

**Done when:** every unit `handle-tickets` delegated has an open PR URL or a named reason it produced none — or no cluster existed, and you have that sentence.

## 3. Report

Print, in this order:

- **Repo and filter** — repo, label or view, base branch.
- **Cluster** — the fix shape taken, and its issue numbers.
- **PRs** — one line per unit: issue numbers → PR URL, marked `draft` where it is one.
- **Skipped** — every unit with no PR, and the named reason.
- **Left for tomorrow** — the clusters ranked below the one taken, by name and ticket count.

**Done when:** all five sections are printed, each one either populated or explicitly empty.

## Unattended run

- **Decide, then park.** Every choice in the run is yours to make. A choice you genuinely cannot make travels as text: into the PR body via `handle-tickets` (which makes that PR a draft), or into the report's **Skipped** section when there is no PR to carry it.
- **Every command returns on its own.** Run git and `gh` in non-interactive form — `--no-edit`, `--yes`, `GIT_EDITOR=true`, `--fill` or an explicit `--body` on `gh pr create`. A command that would open an editor or wait on a keypress is the one way this run hangs forever.
- **One cluster per run.** The rest keep until the next sweep; a run that reaches for a second cluster lands more PRs than a human reviews in a day.
- **Failure is a section, not a stop.** A unit that fails to deliver appears under **Skipped** with its reason while the other units finish. Only stage 1's preflight ends the whole run early.
