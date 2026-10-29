# Hunt

The **symptoms** kind of [SKILL.md](SKILL.md). The user tested the editor by hand and sends their **symptoms**: what looked wrong, one per line, in their own words. You turn each real bug behind them into a diagnosed issue, then run a batch on those issues.

The hunt itself (steps 1 to 5) is **fast**: it reads `<base>` straight from git, and its only output is issues. Worktrees, builds, tests, app runs, and fixes belong to the batch.

When the user asked for issues only ("just file them"), stop after step 5.

A symptom is what the user saw. It is evidence, not a diagnosis.

## Steps

1. **Split.** Create the run directory, slug `hunt-<YYYY-MM-DD-HHMM>`. Number the symptoms from the user's message, one per line or one per distinct observation, keeping their exact words. Two lines that may share a cause stay separate: only diagnosis can show a shared cause. Done when `<run dir>/symptoms.md` lists every symptom with its number.

2. **Diagnose.** Run `git fetch origin` once, and note the commit it diagnoses against: `git rev-parse <base>`. Every issue this run files carries that sha. Dispatch one **diagnoser** per symptom, all in parallel, each with [HUNT-DIAGNOSE.md](HUNT-DIAGNOSE.md), its symptom number, `<base>`, and the run directory. Done when every symptom has `<run dir>/symptom-<k>.md`.

3. **Merge causes.** Read every symptom file. Symptoms whose `Cause` names the same code and the same wrong behavior become one issue that lists all of them. Duplicates and by-design symptoms get no issue. A wrong merge is the one error here that survives to the batch, where it reads as a bug that was never diagnosed. Done when every symptom maps to exactly one of: a new issue, `duplicate of #N`, or `by design`.

4. **File.** Write each issue to `<run dir>/issues/<k>.md` with the title, labels, and body from _The issue_ below. Show the user the list (title and labels, one line each) and ask once whether to file them all. On yes, create each through TRACKER.md's command. Done when every approved issue exists and you hold its number.

5. **Report.** Print one line per symptom, with the user's words:
   - `→ #N <title>` for a filed issue (add `cause not found` when the cause was not found);
   - `→ duplicate of #N`;
   - `→ by design: <the spec requirement or ADR>`.

6. **Batch.** Read [BATCH.md](BATCH.md) and run it in this run directory from step 1, with the issues filed in step 4 as its input (no large-input ask), minus any whose cause was not found. Triage finds these issues **fresh** from their `Diagnosed against:` stamp. Done when the batch's step 10 is done.

## The issue

**Title**: the wrong behavior as a plain sentence, per TRACKER.md.

**Type and labels**: type `Bug`, plus the area labels for the code the fix lands in.

**Body**:

```markdown
Reported: <the user's words; one line per symptom when several merged>

## The problem

<what is wrong and why, in two to four sentences, carrying the cause, not only the symptom>

## Steps to reproduce

<the structure to load and the user actions, so a `verify-ketcher` run can repeat them>

## Where

- `<file>:<lines>`: <what this code does wrong, one line>

## Unknown

<what the diagnosis could not settle; omit the section when empty>

## Fix direction

- <the change, one bullet per seam it lands on>

## Acceptance

- <checkable behavior after the fix, one per line>
- <a test that covers it>

Diagnosed against: <the sha from step 2>
```

The `Diagnosed against:` line is always the last line. It is how a later batch knows the diagnosis still holds (see _Freshness_ in [TRIAGE.md](TRIAGE.md)), so the work survives a hunt stopped before step 6.

For a cause that was not found: _Where_ lists the places searched and what each one does, and _Unknown_ says the cause was not found and names what would settle it.
