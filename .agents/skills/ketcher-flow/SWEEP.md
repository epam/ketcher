# Sweep

The **backlog** kind of [SKILL.md](SKILL.md). You take a set of open `Bug` issues through triage, fix, and review, and you end with one PR per **area** and one **brief** per PR. The user reads the briefs. You never merge. _Checks_, _Review_, and _Landing_ in SKILL.md, with [ROLES.md](ROLES.md), [LOCATIONS.md](LOCATIONS.md), and [TRACKER.md](TRACKER.md), apply here as written.

The user is asked at most three times: the input set when it is large (step 2), and the tracker writes and the worktree cleanup, both at the end. Everything else runs without them. Subagents write nothing on GitHub except their branch and PR: every comment and thread reply is a draft in `<run dir>/comments/`, posted in step 10.

## Steps

1. **Follow up on open PRs.** Create the run directory, slug `sweep-<YYYY-MM-DD-HHMM>`. `git fetch origin`, then save the _Checks_ baseline in a clean worktree, `git worktree add --detach <root>/.ketcher-flow/worktrees/baseline <base>`, installed as LOCATIONS.md says. Earlier sweeps' PRs are the open PRs whose branch has a worktree under `.ketcher-flow/worktrees/` (`git worktree list`, then `gh pr list --state open --head <branch>`). For each one with unresolved review threads or a "changes requested" review, dispatch an **implementer** in follow-up mode with [SWEEP-FIX.md](SWEEP-FIX.md), the PR number, and its worktree. Run these in the background and go on to step 2. When one reports, review it as in step 7 and send it the findings. Done when every such PR has its follow-up brief.

2. **Take the input.** When the user named issues, those are the input. Otherwise list open bugs: `gh issue list --state open --search "type:Bug" --limit 500`. Drop issues an open PR already closes (`gh pr list --state open --json closingIssuesReferences`) and issues labeled `waiting user reply` or `Questions remain`. The Ketcher backlog holds hundreds of bugs: when more than 20 remain, show the count by area label and ask the user which to take (an area, a priority, or the 20 newest). Done when you hold the list of bugs to triage.

3. **Triage.** For each bug, create a detached triage worktree, `git worktree add --detach <root>/.ketcher-flow/worktrees/triage-<N> <base>`, and install it as LOCATIONS.md says. Dispatch one **diagnoser** per bug, at most 5 at once since each one builds and may run the app (_Parallel runs_ in [VERIFY.md](VERIFY.md) gives each its port), each with [SWEEP-TRIAGE.md](SWEEP-TRIAGE.md), its issue number, its triage worktree, and the run directory. Done when every bug has an outcome file `<run dir>/<N>.md`.

4. **Group into areas.** Group the `ready` bugs into areas. An area is a set of bugs whose _Where_ sections touch the same module (one `.memory-bank/modules/` doc) or the same `openspec/specs/` capability. A bug that shares nothing with the others is an area of its own. Give each area a short kebab-case slug (`sequence-mode-delete`). Grouping sets the PR boundaries, so a bug that belongs in two areas forces one of them to carry unrelated changes. Done when every `ready` bug is in exactly one area.

5. **Create the worktrees.** You create them, not the implementers. For each area: `git worktree add -b <branch> <root>/.ketcher-flow/worktrees/<slug> <base>`, with the branch named as LOCATIONS.md says (the first issue's number, then the slug), then install it. Done when every area has a worktree.

6. **Fix.** Dispatch one **implementer** per area with [SWEEP-FIX.md](SWEEP-FIX.md), the worktree path, and the area's issue numbers plus each red test from triage. Run at most 3 at once. Start the next area when one finishes. Done when every area's implementer has reported, with each bug committed green or handed to a human.

7. **Verify and review.** For each area with at least one commit, dispatch a **verifier** with [VERIFY.md](VERIFY.md), the area's worktree, and the area's issues as the spec. Then run _Review_ from its worktree, with `<base>` as the branch point and the area's issues as the spec. That area's implementer (resume the same one: it holds the worktree) does the cleanup and fixes each round's findings. Done when _Review_ has stopped for every area. Then tell each implementer to open its PR.

8. **Open the PRs.** The implementer opens its area's PR as SWEEP-FIX.md says. Done when every area with commits has a PR.

9. **Report.** Print, in this order:
   - the follow-up briefs from step 1;
   - the **run report**: one line per bug with its outcome (in PR, with the area; already fixed; stale; handed to a human; self-gated);
   - the brief of each new PR (the top of its body, up to the `---` rule).

10. **Tracker writes and cleanup.** You do this yourself, never a subagent.
    - **Tracker.** `<run dir>/comments/` holds a draft for each `already-fixed`, `stale`, and `handed-to-human` bug, and the follow-up thread replies from step 1. Show them, one line each, and ask once whether to post them, and whether to close the `already-fixed` ones. Post what the user approved, starting each with the line from TRACKER.md.
    - **Worktrees.** List this run's triage worktrees and the area worktrees whose PR is merged (`gh pr list --state merged --head <branch>`). Ask once whether to remove them. On yes: `git worktree remove --force` for the triage and baseline worktrees (red tests are saved as patches), and `git worktree remove`, then `git branch -D <branch>`, for merged ones. A worktree whose branch is not merged stays.
