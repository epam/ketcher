# Small change

The **small** kind of [SKILL.md](SKILL.md): one reason, one PR, and no user sees a difference. Most Ketcher `Task` issues are this kind: a lint-rule cleanup, an `any` removal, a rename, copy, config, a dependency bump, docs. _Checks_, _Review_, and _Landing_ in SKILL.md, with [LOCATIONS.md](LOCATIONS.md) and [TRACKER.md](TRACKER.md), apply here as written.

You run it yourself, without subagents, until review. There is no gate: the PR review is the checkpoint.

The existing tests and the type check hold the behavior. A small change that needs new tests to hold it is a refactor: switch to [REFACTOR.md](REFACTOR.md) and say so.

## Steps

1. **Scope.** Create the run directory, slug `small-<issue number>` or `small-<topic>`. Read the issue with its comments. Write the scope in `<run dir>/scope.md`: the reason in one line, the files or the lint rule it covers, and what stays out. For a lint-rule cleanup, list every violation with `npx eslint <paths> --rule '<rule>: error'` or the package's lint script. Done when `scope.md` names every file the change will touch.

   When the scope qualifies as a large-scale change (_Qualifies_ in the [protocol](../../../.memory-bank/review-workflow.md#large-scale-change-protocol)), follow the protocol: usually split by package, one PR each.

2. **Branch.** Create the branch as _Branches_ in LOCATIONS.md says, and save the _Checks_ baseline.

3. **Change.** Make the change, per _Write_ in [QUALITY.md](QUALITY.md), and nothing outside `scope.md`. A fault you find on the way is a new scope: note it for the report. Done when every file in `scope.md` is done and the checks pass against the baseline.

4. **Verify.** When the change can reach the editor (a component, a dependency the app loads, a style), follow [VERIFY.md](VERIFY.md) yourself on the features it touches. Otherwise the verdict is `n/a` with the reason.

5. **Review.** Run _Review_ from SKILL.md with `scope.md` and the issue as the spec. You do the cleanup and the fixes yourself. One round is often enough: stop when a round has nothing to act on.

6. **Land** as SKILL.md says, with `Closes #N` when there is an issue. Report: the PR, the checks, the verify verdict, and any new scopes found.
