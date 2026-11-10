# Tasks

Scope: Ketcher #10469 only. Indigo's MOL, CDX/CDXML, and image-export work is excluded.

Dependencies: group 1 establishes the shared attribute; groups 2 and 3 depend on group 1; group 4 depends on group 1 and the approved KET contract; group 5 depends on groups 2-4 and E2E authorization; group 6 integrates the completed implementation. Groups that share source files must execute sequentially. Keep the work on the requested feature branch.

Tasks 1-6 record the earlier implementation and verification against the provisional single-style format. The corrected per-bracket KET contract supersedes that format. Tasks 7-8 track the additional work and verification; the change is not complete until they are finished.

The requester confirmed exactly two bracket entries (`opening` and `closing`), rejected the mistaken `branch` entry, retained Query component support, and selected no bracket drawing when either stored position has zero length. Both brackets use the same effective type in this implementation; their positions remain independent. Mixed-type pairs are a future feature and unexpected mixed input must be rejected with a clear error rather than silently unified.

## 1. Shared style and reversible S-group state

- [x] 1.1 Record approval of the proposed `bracketType: "square" | "round" | "curly"` contract, including square omission and the Indigo compatibility limitation, or revise the planning artifacts for an agreed alternative; verify the accepted contract is explicit in `design.md` before editing serialization.
- [x] 1.2 Add the typed S-group style attribute with square construction defaults; extend the existing entity tests to verify default construction, explicit styles, `getAttrs`, attribute changes, and cloning with remapped atom IDs.
- [x] 1.3 Preserve the style through existing S-group creation/edit actions, including replacement actions, and their inverses; extend the existing S-group action tests to verify undo/redo restores styles without changing membership, coordinates, or unrelated attributes.

## 2. Properties dialog and UX

- [x] 2.1 Add the shared style property after existing fields in each non-DATA `sgroupMap` variant and render a horizontal radio row through the existing form components; extend `sgroup.test.tsx` to verify six supported dialog types, one selected option, square defaults, and DATA exclusion.
- [x] 2.2 Wire typed styles through `structconv.ts`, dialog payloads, and the editor's existing action path; test reopening round/curly groups, applying unrelated edits, cancelling a style change, and retaining a valid style when switching non-DATA variants.
- [x] 2.3 Add localized picker and accessible option names without translating bracket symbols; test keyboard selection, accessible names, and existing dialog validation, and compare the radio layout and field order to the supplied UX.
- [x] 2.4 Run focused React dialog/conversion tests and affected type/lint checks; verify they pass with no regressions to Repeat count, polymer label, Copolymer, Superatom, or DATA behavior.

## 3. Canvas shapes and compatible square behavior

- [x] 3.1 Add a rendering-only helper for mirrored/oriented round and curly paths within the existing bracket envelope; add geometry tests for both sides, rotation, small/tall bounds, and finite coordinates.
- [x] 3.2 Pass the S-group style into Raphael bracket drawing while retaining the square path branch; derive index-label endpoints from existing bracket parameters instead of SVG command indices, and verify existing square paths, repeat labels, and nucleotide icons remain in the same positions.
- [x] 3.3 Use the new curved path helper in D3 `SGroupRenderer` without changing existing square drawing or label/selection rules; add tests proving all styles render and square path/label positions remain unchanged.
- [x] 3.4 Run focused core geometry/rendering tests and affected type/lint checks; verify selection, movement, nesting, expansion/contraction, and render visibility continue to use the existing rules, with the approved same-atom layout exception.
- [x] 3.5 Add and test a shared rendering-only layout for visible bracketed S-groups with identical atom sets, respecting hierarchy and intrinsic group padding; keep unshared brackets unchanged and exclude non-bracketed groups.
- [x] 3.6 Apply the layout in both canvas pipelines, keeping labels, icons, selection, and hover aligned; verify creation, removal, expansion, contraction, undo/redo, and KET round trips do not change chemistry or group styles.

## 4. KET persistence and validation

- [x] 4.1 Extend `KetSGroupNode`, the common S-group schema, and both KET converters with the approved optional style property; extend `KetSerializer.test.ts` to prove round/curly persistence, explicit square reads, square omission, missing-style legacy input, and unchanged DATA output.
- [x] 4.2 Verify the actual serialized representations of Query component, Copolymer, and Nucleotide Component preserve styles, including mixed-style structures; add serializer tests asserting chemistry, membership, coordinates, and other attributes survive a round trip.
- [x] 4.3 Regenerate the runtime validator with `npm run ajv --workspace=ketcher-core`; add invalid-value/type tests using the compiled validator and confirm the existing invalid-KET error path reports unsupported input rather than substituting square.
- [x] 4.4 Run focused serializer/entity/action tests and affected type/lint checks; verify legacy KET and default-square serialized fixtures are unchanged.

## 5. Approved browser regression coverage

- [x] 5.1 Obtain approval before writing Playwright specs; if a new spec file is needed, deliver a test plan using the repository template and obtain separate approval, verifying that both authorizations are recorded before spec code is added.
- [x] 5.2 Extend the existing S-Group Properties page object and approved S-group specs for each dialog's picker, defaults, DATA exclusion, editing, cancellation, undo/redo, and KET reload; verify the focused Chromium scenarios pass and assert actual selected values and KET attributes, not screenshots alone.
- [x] 5.3 Add representative round/curly canvas and dialog visual checks plus square regressions, including rotated/labeled groups and a second-renderer journey; generate only related Linux baselines through the documented Docker workflow and rerun without update mode to verify them.
- [x] 5.4 Extend the approved S-group bracket E2E spec and its test plan with the same-atom SRU/Nucleotide Component case; assert distinct bracket geometry and independent KET styles, and generate the related Linux snapshot.

## 6. Integrated verification

- [x] 6.1 Use `verify-ketcher` on a fresh standalone app to create and edit S-groups through the real dialog; capture before/after KET, screenshots, command steps, and browser errors, and verify only the requested style changes while chemistry, other properties, and coordinates remain equivalent.
- [x] 6.2 Reopen saved KET, check picker and shapes, exercise undo/redo, copying, and a mode switch; record pass/fail/blocked per journey, with remote and Indigo-owned format/image export explicitly not claimed as verified.
- [x] 6.3 Run `npm test`, the focused approved E2E scenarios, and `npx openspec validate add-sgroup-bracket-type --strict`; verify no added failures relative to the pre-implementation baseline and record exact command results.
- [x] 6.4 Verify the supplied same-atom KET in the standalone app, including visible separation and independent editing; record before/after structures, screenshots, and browser errors.

## 7. Supplied KET contract and unambiguous behavior

- [x] 7.1 Replace provisional KET output with a complete `opening` and `closing` pair sharing an effective `square`, `parenthetic`, or `curly` type. Include Query component and exclude only DATA, retain defaults, read the provisional branch format for migration, and prove supported uniform-pair KET round trips through the runtime serializer.
- [x] 7.2 Preserve supplied per-bracket positions in atom coordinates, converting coordinates at the KET boundary and validating complete position sets and endpoint shapes; cover both endpoint orders, unchanged round trips with either or both positions having zero length, and invalid input.
- [x] 7.3 Invalidate the whole position set when a member atom moves or group membership changes, without losing types; cover undo/redo, copying, and both editor modes through the relevant public operations.
- [x] 7.4 Render supported uniform opening and closing pairs when both supplied positions have non-zero length in both canvas pipelines, anchor the label to `closing` when the pair is drawn, and draw no pair or automatic replacement when either stored position has zero length. Test both sides, zero-length positions away from the origin, non-zero vertical brackets, and same-atom layout exclusion for suppressed pairs.
- [x] 7.5 Reject incomplete pairs, `branch` and other third keys, invalid types, different effective types within a pair, and invalid position sets through the existing invalid-KET path; regenerate the compiled validator and prove rejection through the runtime serializer. Verify that an omitted type and explicit `square` are accepted as equivalent.
- [x] 7.6 Update the existing approved Playwright spec and fixtures for the resolved KET and canvas scenarios, and run focused unit, type, lint, and browser checks.

## 8. Uniform-pair and integrated verification

- [x] 8.1 Verify that the picker shows the shared type, a style change updates both bracket entries without moving their stored positions, and different S-groups retain independent styles. Verify that unexpected mixed-type input reports an error without silently changing either type.
- [x] 8.2 Verify the confirmed Query component behavior end to end: the picker remains available, its style survives save/reload and undo/redo with the new KET representation, and DATA remains excluded.
- [x] 8.3 Verify the confirmed zero-length behavior through KET reload, copying, undo/redo, and mode switching for zero-length opening, closing, and both positions; assert no bracket pair is drawn or introduced by unchanged round trips, while groups with no stored positions still receive automatic brackets.
- [x] 8.4 Verify the resolved behavior in the standalone app, including KET round trips, positioning, undo/redo, and mode switching; run the applicable checks and record any remaining limitations.

### Verification results and limitations

- `CI=true npm test` passed after the final fix: 2,226 tests passed and 15 were skipped across the packages.
- `npm run build:core && npm run build:example:standalone` passed. `npm run check:types --workspace=playwright-testing` passed.
- `cd ketcher-autotests && docker compose run --rm -e NUM_WORKERS=1 autotests bash /app/test_run.sh tests/specs/Chromium-popup/Features/10469-sgroup-bracket-type.spec.ts --project=chromium-popup --reporter=line --output=/ketcher/.verify-ketcher/evidence/20261110-100200/browser-results-final` passed all 56 cases. This Linux run used arm64, so it does not prove amd64 CI snapshot equivalence.
- `npx openspec validate --all --strict` passed for all 18 changes and specs.
- Standalone browser verification passed for KET round trips, style edits, positioning, zero-length suppression, copying, undo/redo, and editor-mode switches, including a same-atom superatom viewport regression. Final browser error logs were empty. An earlier separate run recorded an `info operation timeout after 30000ms`; its cause was not established.
- Remote mode and Indigo-owned MOL/CDX/CDXML bracket persistence and backend image rendering were not verified. An additional SMILES export of the sample SRU failed because it has no outgoing bonds; it was not used as evidence for bracket support.
- Different types within one bracket pair are rejected. Distinct S-groups covering the same atoms retain independent styles for now; whether the product should allow that remains a question for the project.

## Workflow follow-up

- Archive the completed change only after implementation and verification; synchronize its deltas into the main specifications.
- At archive, update `.memory-bank/formats/ket-2.0-specification.md` and the relevant serialization, rendering, React UI, and templates/groups owner files; run `npm run check:agent-docs` and strict OpenSpec validation.
- Review the implementation diff and resolve verified findings. Use the repository PR template with `ketcher-pr`, cite #10469, name the updated memory-bank owners, and include "Verified in the app" results and the external Indigo dependency.
- Preserve the newly saved KET files if rolling back code; do not claim compatibility of non-default styles with older readers or Indigo versions.
