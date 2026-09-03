---
name: find-ticket-clusters
description: 'Cluster a repo''s open tickets into batches one fix shape resolves, then hand a cluster to handle-tickets. Use when checking for work worth batching, on a scheduled sweep for refactor and lint tickets, or against a named label or tracker view.'
argument-hint: '[tracker view | label] [repo]'
---

# Find ticket clusters

Finds the **clusters** among a repo's open tickets — sets of tickets that one fix shape resolves, in several places — and hands one to `handle-tickets`.

This skill reads; `handle-tickets` writes. Assignment, board moves, branches, and PRs all belong to `handle-tickets`.

## 1. Read the tickets

The current repository is the scope. Resolve it with `gh repo view` and search there; widen to an org-level tracker view only when an argument names one.

The `refactor` label is the default filter. An argument naming a label or a tracker view replaces it — say which filter you applied either way.

Send one **search sub-agent** to do the reading. It pulls every open, unassigned item in scope (`gh issue list --label <label>`, or `gh project item-list <number> --owner <org>` for a named view), opens each body, and returns one compact line per ticket: number, title, and the fix that body prescribes. The bodies stay in its context; only the lines come back — the fix a ticket prescribes lives in its body, and the title carries only the symptom.

**Done when:** every open item in scope appears in your working list with its number, its title, and the fix its body prescribes.

## 2. Cluster

A **cluster** is two or more tickets that one fix shape resolves. Group stage 1's list by fix shape, reading for:

- the same lint rule or check name quoted in the body
- the same named anti-pattern or code smell
- the same remedy sentence, repeated against a different path
- the same package or subsystem

A ticket whose fix shape no other ticket shares goes to `unclustered`, and stays there.

**Done when:** every ticket from stage 1 sits in exactly one cluster or in `unclustered`, and each cluster is named by the fix shape its members share.

## 3. Choose

Rank clusters by how uniformly their members quote the same remedy — the most uniform cluster is the one a single sub-agent brief covers without per-ticket special-casing. Then, by how this run started:

- **A human started it** — present the clusters (fix shape, ticket count, files touched) and ask which to take.
- **A schedule started it** — take the top-ranked cluster, one per run. One cluster a day lands a reviewable number of PRs; the rest keep until tomorrow's sweep.

**Done when:** exactly one cluster is chosen, or the column held no cluster at all — say so and stop.

## 4. Hand off

Call the Skill tool with `handle-tickets`, passing the chosen cluster's issue numbers and repo. Its stage 1 still runs — it resolves the base branch too — but the cluster *is* the resolved batch, so the open/unassigned filter needs no re-running.

**Done when:** `handle-tickets` has been called with the cluster's issue numbers and repo.
