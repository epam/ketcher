# Go red

How every flow proves a bug before fixing it. You end with a **red** loop: a **tight** loop that goes red on this bug and that you can run on demand.

The bug's description is evidence, not diagnosis: it says what someone saw, never what is wrong. A guess at the cause is a lead to check.

## Steps

1. **Reproduce.** When the bug shows in the editor, reproduce it with `verify-ketcher` ([its SKILL.md](../verify-ketcher/SKILL.md)) on `<base>`: load the structure the issue gives, do the steps, and export. Save the evidence to `<run dir>/repro/<issue or topic>/`. When other agents drive the app at the same time, follow _Parallel runs_ in [VERIFY.md](VERIFY.md). The exported structure that disagrees with the issue's expected result is your first observation. Skip this step for a bug outside the editor (a build, an API call with no UI, a type).

2. **Trace.** Follow the symptom from what the user sees to the code that decides it: the toolbar button or dialog, the editor tool, the operation, the domain entity or serializer behind it. Note each `file:line` on the way. Read [domain.md](../../../.memory-bank/domain.md), [glossary.md](../../../.memory-bank/glossary.md), and the `modules/` doc of the area first, and use their terms.

3. **Build the loop** as a failing Jest test at the lowest seam that reaches the bug: a serializer, a domain entity, an operation, a hook, a component. The red you build now is the red the fix turns green. When the bug names `file:line` sites, aim the test there first.

   When the bug lives only in rendering or in a browser interaction no unit test reaches, push the loop down to the **pure decision** behind it (the function that computes the position, the label, the selection). When nothing pure decides it, the `verify-ketcher` recipe from step 1 is the loop, and the regression test is a Playwright spec. `AGENTS.md` says to ask the user before writing one: ask when you are the orchestrator, and as a subagent report "E2E spec needed" with the recipe, per _Asking the user_ in [ROLES.md](ROLES.md).

4. **Check the reason.** The test is red for the reason the bug gives, not for a missing import or a typo.

Done when both hold:

- A loop goes **red** on this bug, and you can run it on demand.
- You can name the cause in one line and point at the file and line.

If the loop stays green everywhere you can reach, the behavior is by design (check the [OpenSpec specs](../../../openspec/specs/) and the [ADRs](../../../.memory-bank/adr/)) or the description is about something else. Show what you ran. The flow that sent you here says what happens next.

## Turning it green

The fix is test-first from that red: change the code at the root cause (_Fixes_ in [QUALITY.md](QUALITY.md)) until the red test passes, then run the package's whole suite (`cd packages/<name> && npm run test:unit`). Each new behavior the fix needs gets its own failing test first. Done when the red test and the suite pass.
