# Review

Review runs from the branch's worktree, against the run's spec (the issue, the report, the OpenSpec change, or `target.md`), in this order:

1. **Cleanup.** An **implementer** reads the diff since the branch point against _Write_ in [QUALITY.md](QUALITY.md) and removes what a careful author would not have written: narrating comments, defensive checks inside trusted code, casts that only silence the compiler, leftover debug output. Behavior stays the same and the checks still pass against the baseline. Done when the cleanup is one commit, or the diff had nothing to clean.

2. **Round 1.** The round's **panel** is the **spec reviewer** and the lenses that `node scripts/review-panel.mjs --base <branch point>` prints ([Panel](../../code-review/SKILL.md#panel) in the code-review skill). The spec reviewer is always on it: its dispatch is the spec path and _Review ranking_ in QUALITY.md, and it answers whether the diff does what the spec asks, all of it, and nothing it does not. Tell the user the panel in one line with the file that brought each lens ("Panel: spec, correctness (Editor.ts), code-quality (Editor.ts)"). Dispatch the panel as fresh **reviewers** in parallel on `git diff <branch point>...HEAD`.

   Each lens reviewer reads the [code-review skill](../../code-review/SKILL.md) and its lens file. Every finding follows the [output contract](../../../../.memory-bank/review-workflow.md#output-contract). Check each one against the code as the contract says, and rerun the command a performance or security finding carries. Done when every finding is kept, dropped, or an open question in the report.

3. **Fix.** The flow names which implementer fixes. Blockers and majors are fixed. Batch accepted nits into one commit or decline them. Done when every finding is fixed in a new commit or declined with a one-line reason.

4. **Next round.** Review again with the commit before the fixes as the branch point, so the round reads only the fix diff. Its panel is the spec reviewer, each lens whose finding the fixes address, and the lenses the script prints for the fix diff. Stop when a round has nothing left to act on. After round 3, stop anyway and report the open findings, what kind of failure they point to (a wrong shape, a missing test, a misread spec), and your recommendation.

5. **Verify again.** When the review's fix commits change code that reaches the editor (not only tests, comments, or docs), repeat the flow's verify step on the branch, with the same spec and recipe. Done when the verdict is the same as before review, or the new one is in the report.

Every round goes to fresh reviewers: a **reviewer** reads a diff it did not write ([ROLES.md](../roles/ROLES.md)).

A finding that reveals a new bug is a new scope of kind bug, not work added here: list it in the final report.
