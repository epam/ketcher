# Small change

The **small** kind of [SKILL.md](SKILL.md): one reason, one PR, and no user sees a difference.

You run it yourself, without subagents, until review, and go on without asking.

The existing tests and the type check hold the behavior. A small change that needs new tests to hold it is a refactor: switch to [REFACTOR.md](REFACTOR.md) and say so.

## Steps

1. **Scope.** Create the run directory, slug `small-<issue number>` or `small-<topic>`. Read the issue with its comments. Write the scope in `<run dir>/scope.md`: the reason in one line, the files or the lint rule it covers, and what stays out. For a lint-rule cleanup, list every violation with `npx eslint <paths> --rule '<rule>: error'` or the package's lint script. Done when `scope.md` names every file the change will touch.

   When the scope qualifies as a large-scale change (_Qualifies_ in the [protocol](../../../.memory-bank/review-workflow.md#large-scale-change-protocol)), follow the protocol: usually split by package, one PR each.

2. **Branch.** Create the branch as _Branches_ in LOCATIONS.md says, and save the _Checks_ baseline.

3. **Change.** Make the change inside `scope.md`, per _Write_ in [QUALITY.md](QUALITY.md). A fault you find on the way is a new scope: note it for the report. Done when every file in `scope.md` is done and the checks pass against the baseline.

4. **Verify.** When the change can reach the editor (a component, a dependency the app loads, a style), follow [VERIFY.md](VERIFY.md) yourself on the features it touches. Otherwise the verdict is `n/a` with the reason. Done when you hold the verdict.

5. **Review.** Follow [REVIEW.md](REVIEW.md) with `scope.md` and the issue as the spec. You do the cleanup and the fixes yourself. Done when REVIEW.md's rounds have stopped.

6. **Land** as SKILL.md says. Report: the PR, the checks, the verify verdict, and any new scopes found.
