# Snapshots

A change that alters what the canvas draws also alters reference screenshots, the PNGs beside each spec under `ketcher-autotests/tests`. They exist only as Linux PNGs made in Docker ([testing.md](../../../.memory-bank/testing/testing.md), _Docker_), so the Playwright shards in CI fail after the PR opens. Judge each failure before you update anything. Run this from the branch's worktree.

1. **List the failures.** Wait for the Playwright shards with your tool's way to wait on a PR's checks, and read the failed jobs' logs. Done when you hold the failing tests as `file:line`, one list per project (`chromium`, `chromium-popup`).

   When the report says the change touches every drawing of something (a label rule, a color, a bond length), run that area's screenshot specs in Docker before you open the PR, to find the failures early.

2. **Judge each failing screenshot.** Look at the expected and actual PNGs. A difference that is exactly what an **Acceptance** line of the report says is intended: update it. Any other difference is a regression: fix the code, or stop and ask when the cause is a product choice. A failure that also happens on `<base>` is pre-existing: name it. Done when each failure is marked intended, regression, or pre-existing.

3. **Docker.** Run `docker info`. When it fails, set Docker up as _Docker_ in testing.md says: ask the user once before you install anything, hand them any step that needs `sudo` or an administrator, and note whether you started the daemon. The worktree needs `ketcher-autotests/.env` made from `.env.example` and `example/dist` built from the branch (`npm run build`). Then run `npm run docker:build` in its `ketcher-autotests`. Done when `docker info` and the build succeed.

4. **Prove Docker draws what CI draws.** Take one failing spec. Run it with `docker-compose run --rm autotests bash /app/test_run.sh --project=chromium --retries=0 "<file>:<line>"` on a `<base>` build (a detached worktree), then on the branch. Done when it passes on `<base>` and fails on the branch with the pixel counts CI printed. Other counts mean other images: stop and report.

5. **Regenerate.** Run the same command per project with `--update-snapshots=changed` and every target as one quoted argument (some paths contain spaces). Run it first with `--list`: the total must be near the failing count, and a whole-suite total means the list is broken. Call `docker-compose` directly, not `npm run docker:update` (testing.md says why).
   Done when the run reports no failures and `git status --short` shows only the PNGs of listed specs. Restore anything else with `git checkout`. Regenerating a PNG writes no spec, so it needs no ask (`AGENTS.md`, E2E tests). Changing a spec does.

6. **Commit and prove.** Commit as `#<issue> - Update <area> snapshots for <change>`, push, and go to step 1. Under "Verified in the app", list the updated specs, what changed, and the **Acceptance** line it matches.

7. **Clean up.** Done when this run leaves behind no container, no Docker virtual machine it started, and no stray file:
   - Stop a runtime you started once no container runs (`colima stop`, or quit Docker Desktop). Keep the images: pulling them again takes minutes.
   - Leave `docker system prune` and `docker image prune -a`: they remove the user's other images.
   - Remove the `<base>` worktree of step 4, and in the worktree's `ketcher-autotests` the `build/` folder and crash dumps (`core`).

Done when every Playwright shard that passes on `<base>` passes on the branch, or the failure is named as pre-existing, and the cleanup is done. After two rounds that still fail, stop and report the failing specs and what you tried.
