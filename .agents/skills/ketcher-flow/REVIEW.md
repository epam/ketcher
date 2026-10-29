# Review

Review runs from the branch's worktree, against the run's spec (the issue, the report, the OpenSpec change, or `target.md`), in this order:

1. **Cleanup.** An **implementer** reads the diff since the branch point against _Write_ in [QUALITY.md](QUALITY.md) and removes what a careful author would not have written: narrating comments, defensive checks inside trusted code, casts that only silence the compiler, leftover debug output. Behavior stays the same and the checks still pass against the baseline. Done when the cleanup is one commit, or the diff had nothing to clean.

2. **Round 1.** Pick the round's **panel** from the table below by reading `git diff <branch point>...HEAD`, and tell the user the panel in one line, naming who is off the panel and why ("Panel: spec, code-quality. No render or tool code, no input parsing, no public API"). Dispatch the panel as fresh **reviewers** in parallel on that diff.

   A bug run's panel starts from the spec reviewer alone, and each other reviewer joins only when the diff clearly matches its bug trigger. In every other kind, a reviewer whose trigger might match is on the panel.

   | Reviewer                                                           | On the panel when the diff                                                                                                                                               | Joins a bug panel when the diff                                                                                                                          |
   | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | **spec reviewer**                                                  | always. Its dispatch is the spec path and _Review ranking_ in QUALITY.md: does the diff do what the spec asks, all of it, and nothing it does not?                       | always                                                                                                                                                   |
   | [code-quality](../code-review/code-quality.md)                     | changes code, tests included                                                                                                                                             | adds structure that outlives the fix: a new file, helper, parameter, or a branch in shared code                                                          |
   | [performance](../code-review/performance.md)                       | changes rendering, a tool or pointer handler, a loop over atoms, bonds, or monomers, a call to Indigo, or an import in a published package                               | adds work that grows with the structure: a loop over atoms, bonds, or monomers, a call inside one, a call to Indigo, or an import in a published package |
   | [documentation-accuracy](../code-review/documentation-accuracy.md) | changes behavior a user can see, a package's exports, a public interface named in a `.memory-bank/modules/` doc, KET reading or writing, or a README example             | makes a statement false in `openspec/specs/`, an ADR, a `.memory-bank/modules/` doc, or a README example                                                 |
   | [security](../code-review/security.md)                             | changes an HTML sink, code built from a string, the reading of opened, pasted, or dropped text, a handler on the Indigo worker boundary, or a service URL, key, or token | the same as the column before                                                                                                                            |

   Each reviewer reads the [code-review skill](../code-review/SKILL.md) and the lens file its row links. Every finding follows the [output contract](../../../.memory-bank/review-workflow.md#output-contract). Check each one against the code and drop those whose failing scenario does not hold. A **performance** or **security** finding also carries a command and its output (a failing test, a repro script, a measurement): rerun it, and keep the finding when the output shows the failure. A finding with no run goes in the report as an open question, not as a fix. Done when every finding is kept or dropped.

3. **Fix.** The flow names which implementer fixes. Blockers and majors are fixed. Batch accepted nits into one commit or decline them. Done when every finding is fixed in a new commit or declined with a one-line reason.

4. **Next round.** Review again with the commit before the fixes as the branch point, so the round reads only the fix diff. Its panel is the spec reviewer, each reviewer whose finding the fixes address, and any reviewer whose trigger the fix diff matches. Stop when a round has nothing left to act on. After round 3, stop anyway and report the open findings, what kind of failure they point to (a wrong shape, a missing test, a misread spec), and your recommendation.

5. **Verify again.** When the review's fix commits change code that reaches the editor (not only tests, comments, or docs), repeat the flow's verify step on the branch, with the same spec and recipe. Done when the verdict is the same as before review, or the new one is in the report.

Every round goes to fresh reviewers: a **reviewer** reads a diff it did not write ([ROLES.md](ROLES.md)).

A finding that reveals a new bug is a new scope of kind bug, not work added here: list it in the final report.
