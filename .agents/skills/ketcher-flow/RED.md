# Go red

How every flow proves a bug before fixing it. You end with a **red** loop: a **tight** loop that goes red on this bug and that you can run on demand.

The bug's description is evidence, not diagnosis: it says what someone saw, never what is wrong. A guess at the cause is a lead to check.

## Steps

The loop discipline is the vendored `diagnosing-bugs` skill ([its SKILL.md](../diagnosing-bugs/SKILL.md)): run its Phases 1 and 2 (build a tight loop, reproduce and minimise), and Phases 3 and 4 when the cause is not plain from the trace. This file adds what Ketcher gives those phases. Where they differ, this file wins.

1. **Read the area.** Its `GLOSSARY.md` is [glossary.md](../../../.memory-bank/glossary.md) here, and its ADRs live in [adr/](../../../.memory-bank/adr/). Also read [domain.md](../../../.memory-bank/domain.md) and the `modules/` doc of the area, and use their terms.

2. **Reproduce in the app.** When the bug shows in the editor, reproduce it with `verify-ketcher` ([its SKILL.md](../verify-ketcher/SKILL.md)) on `<base>`: load the structure the issue gives, do the steps, and export. This is the skill's headless-browser loop, already built. Save the evidence to `<run dir>/repro/<issue or topic>/`. When other agents drive the app at the same time, follow _Parallel runs_ in [VERIFY.md](VERIFY.md). Skip this step for a bug outside the editor (a build, an API call with no UI, a type).

3. **Push the loop down** to a failing Jest test at the lowest seam that reaches the bug: a serializer, a domain entity, an operation, a hook, a component. Trace from the toolbar button or dialog through the editor tool and the operation to the entity or serializer behind it, noting each `file:line`. When the bug names `file:line` sites, aim the test there first. The red you build now is the red the fix turns green.

   When the bug lives only in rendering or in a browser interaction, push the loop to the **pure decision** behind it (the function that computes the position, the label, the selection). When nothing pure decides it, the `verify-ketcher` recipe from step 2 is the loop, and the regression test is a Playwright spec. `AGENTS.md` says to ask the user before writing one, per _Asking the user_ in [ROLES.md](ROLES.md).

4. **Check the reason.** The test is red for the reason the bug gives, not for a missing import or a typo.

The skill tells you to ask the user when no loop can be built, and to show hypotheses before testing them. As a subagent, put both in your report instead, per _Asking the user_ in ROLES.md.

Done when both hold:

- A loop goes **red** on this bug, and you can run it on demand.
- You can name the cause in one line and point at the file and line.

If the loop stays green everywhere you can reach, the behavior is by design (check the [OpenSpec specs](../../../openspec/specs/) and the [ADRs](../../../.memory-bank/adr/)) or the description is about something else. Show what you ran. The flow that sent you here says what happens next.

## Turning it green

Fix test-first with the vendored `tdd` skill ([its SKILL.md](../tdd/SKILL.md)), starting from this red. Its seams count as confirmed when the flow already agreed them: the report's **What** for a bug, the ticket's shape for a task, the triage outcome in a sweep. Ask about seams only outside those. The refactoring it leaves out of the loop happens in _Review_ in [SKILL.md](SKILL.md).

Change the code at the root cause (_Fixes_ in [QUALITY.md](QUALITY.md)) until the red test passes, then run the package's whole suite (`cd packages/<name> && npm run test:unit`). Mock only what [testing.md](../../../.memory-bank/testing/testing.md) allows. Done when the red test and the suite pass, and the `[DEBUG-...]` probes from the diagnosis are gone (`git grep -n "DEBUG-"`).
