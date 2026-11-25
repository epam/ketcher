# Tasks

This checklist records the implementation already in `35ff3ba070` and the documentation in `10b94d1e49`. Checked implementation items refer to the existing code and saved verification results; they are not a claim that the full repository CI passed. The present correction adds only this OpenSpec package.

## 1. Public API and library lifecycle

- [x] 1.1 Add parse-before-publish input validation and named template additions; verified by the 20 tests in `packages/ketcher-core/__tests__/application/addTemplate.test.ts`.
- [x] 1.2 Preserve runtime entries across initialization and settings reloads, and exclude them from persisted user templates; verified by `state/templates/addTemplate.test.ts` and `state/templates/runtimeInitialization.test.ts`.
- [x] 1.3 Remove template-event subscriptions on editor cleanup and sanitize runtime structures for DevTools; verified by `App/initApp.templates.test.tsx` and `state/index.test.js`.
- [x] 1.4 Document API inputs, error handling, session lifetime, and shared-window integration; verified against `documentation/add-template.md` and the existing feature-owner update.

## 2. Bottom toolbar and library presentation

- [x] 2.1 Render database templates in insertion order with scrolling and the Structure Library control; verified in the standalone browser session and toolbar source inspection.
- [x] 2.2 Preserve hidden and disabled states, literal names, and the built-in shortcut fallback; verified by `BottomToolbar/TemplatesList/TemplatesList.test.tsx`.
- [x] 2.3 Preserve runtime library names and unusual group names; verified by `dialog/template/TemplateTable.runtime.test.tsx` and `utils/templateGroups.test.ts`.
- [x] 2.4 Release preview object URLs and ignore late results after cleanup; verified by inspection of `TemplatePreview`, with the global-preview dependency documented in the API guide.

## 3. Integration evidence

- [x] 3.1 Run the focused API/library/UI checks and the full React unit suite; saved results show 52 focused tests passed and 687 React tests passed with one skipped.
- [x] 3.2 Verify standalone molecules-mode placement without modifying the canvas during addition; saved browser exports show `C1CC1`, three atoms and three bonds, with no captured browser errors. The screenshot is attached to PR #12886.
- [x] 3.3 Record validation limits in the PR and design: standalone worker timeouts, the Windows build-config path mismatch, and unverified remote/macromolecules modes and comprehensive format round trips.

## 4. Retrospective specification correction

- [x] 4.1 Supply the proposal, design, behavioral delta, and this evidence-linked checklist; verified that they describe the committed implementation and the original issue's API-based configuration scope.
- [x] 4.2 Validate the OpenSpec package and repository specification checks, check formatting, and confirm locally that the missing-feature-spec Danger failure is removed: strict validation passed for this change and all six active changes, all six archived changes passed, Prettier passed, and the local Danger rules returned zero failures with the two existing size/reviewer warnings.

## Workflow follow-up

- Commit and push the validated documentation to the existing `upload` branch, then inspect the rerun of Danger on PR #12886.
- Request a maintainer review using the PR's reviewer selector if repository permissions allow it; otherwise let a maintainer arrange assignment. No review request has been sent by this correction.
- Keep the size warning visible and use the review map in `design.md` to discuss any requested split with maintainers.
- Archive only after review requirements are satisfied, using the repository's `--skip-specs` archive workflow and reconciling the delta with the feature owner that is already updated.
