# Design

## Context

See [proposal.md](proposal.md) for motivation and the user-confirmed Ketcher-only scope.

Approval recorded on 2026-11-05: the requester approved this plan and the proposed KET contract, authorized related Playwright tests and snapshots, and selected direct work on the current feature branch without unnecessary subagents. A new E2E spec file still requires the repository's separate test-plan approval.

On 2026-11-06, the requester chose to visually separate the brackets of distinct S-groups covering the same atoms, rather than prohibit those groups. The requester also approved updating these artifacts and extending the existing E2E spec and snapshots.

On 2026-11-09, the requester supplied an initial per-bracket KET fragment and approved updating these artifacts, retaining read compatibility with the provisional branch format, and extending the existing Playwright spec. The project subsequently confirmed that each set contains exactly `opening` and `closing`; the fragment's `branch` entry was a mistake, and incomplete or additional brackets must be rejected.

The requester also confirmed that Query component retains its picker and KET bracket data; its exclusion from the earlier description was a mistake. If either stored bracket position has zero length, draw neither bracket and do not compute a replacement pair. This supersedes the earlier fragment's zero-length fallback rule.

The requester confirmed that opening and closing have the same type in this implementation. Different types within one pair are a future feature. If an imported pair nevertheless has different effective types, report a clear error instead of silently unifying or discarding data. The UI offers one type for the pair rather than independent side controls. Separate S-groups can still have different types.

- `SGroup.data` in `packages/ketcher-core/src/domain/entities/sgroup.ts` holds attributes. `getAttrs`, `setAttr`, and `SGroup.clone` already copy arbitrary attributes; `SGroupAttr` participates in reversible edits.
- The React properties dialog delegates non-DATA fields to `SGroupFieldset`, which enumerates the relevant `sgroupMap` schema properties. Its six non-DATA choices include Copolymer. Existing form radio support is available through `Field`, `SelectCheckbox`, and `Input`.
- `structconv.ts` translates editor attributes to form values and back. The editor tool forwards the resulting attributes into existing S-group actions, including creation/deletion replacement paths.
- KET uses `KetSGroupNode`, the common S-group schema definition, `sgroupToKet`, and `sgroupToStruct`. Runtime validation imports `compiledSchema.js`, generated using `npm run ajv --workspace=ketcher-core`; updating only `schema.json` is insufficient.
- Raphael draws square paths through `draw.bracket` and `ReSGroup`; D3's `SGroupRenderer.appendBracket` draws its own square path.
- Raphael's index-label placement currently indexes the square SVG path's line commands. Round/curly paths cannot safely be substituted without decoupling those label anchors from command indices.
- Existing specifications have no bracket picker or bracket-style KET requirement. This change adds requirements to the existing `templates-and-groups` and `import-export` capabilities, without replacing their other guarantees.
- Indigo owns the requested non-KET format and image-export support. Its ticket remains open; the requester supplied the KET field and value encoding separately.

## Goals / Non-Goals

**Goals:**

- Keep one authoritative bracket representation in the model, with the same effective type and separate records and optional positions for exactly the opening and closing brackets.
- Preserve square output and existing automatic positioning when a visible group does not share its exact atom membership with another visible bracketed group.
- Visually distinguish groups that have identical atom membership without changing their membership, hierarchy, styles, or serialized structures.
- Make curved shape geometry independent of interaction and label geometry.
- Ensure both rendering pipelines consume the same per-bracket data and render the closing bracket's label at its actual position.
- Validate the actual UI state, saved KET, and visible geometry, not just existence of a new field.

**Non-Goals:**

- No Indigo implementation or dependency upgrade as a substitute for its open ticket.
- No MOL V2000/V3000, CDX/CDXML, PNG/SVG export feature work or source-format parsing workarounds.
- No change to bracket visibility except the confirmed suppression of a pair with at least one stored zero-length position; no changes to which groups may be nested, contraction, group chemistry, repeat expansion, format routing, global settings, or facade signatures.
- No repair of unrelated renderer model-mutation debt or existing schema problems.

## Decisions

### 1. Typed S-group bracket state

Represent a present bracket set with exactly two records, `opening` and `closing`, each with an optional type and optional endpoints. Both records have the same effective type after applying the square default, but their endpoints remain independent. A missing bracket set means the existing automatic square default. A present set with either record missing, a third key such as `branch`, or different effective types is rejected rather than silently altered.

Keep the UI's existing `round` terminology separate from the KET spelling `parenthetic` through a typed conversion at the serialization boundary. The single-style picker must not become a second independently mutable source of truth for the bracket records.

Use reversible operations and deep cloning for bracket state so nested records and endpoints are not shared across copies. A move of a member atom, or a membership change, invalidates the entire set of stored positions but retains the types. Undo and redo must restore the corresponding state. This invalidation also applies to zero-length positions; they are stored coordinates, not a separate permanent hide setting. Do not directly mutate live model state from React or a renderer.

Alternative: keep the style in UI-only state or rendering settings. Rejected because styles belong to individual groups and must survive history, copying, and KET round trips.

### 2. KET contract and coordinate preservation

The supplied wire contract represents the bracket set on an eligible S-group:

```json
{
  "type": "SRU",
  "atoms": [0, 1],
  "brackets": {
    "opening": { "type": "parenthetic" },
    "closing": { "type": "parenthetic" }
  }
}
```

- Both bracket records are required when `brackets` is present; no third record is allowed. Each can have an optional type and position; absent type means square. Their effective types must match, so an omitted type and an explicit `square` are equivalent. An absent `brackets` object means automatic square brackets.
- Positions have `start` and `end` points in atom coordinates. Convert their Y coordinates consistently with the atoms at the KET boundary, accept either endpoint order, and keep the values across lossless reads and writes while valid.
- Positions are present for both records or neither. Missing positions request automatic placement using the stored type; either stored zero-length position suppresses the entire bracket pair instead. Preserve both stored positions during an unchanged round trip, including when one or both have zero length and both types are square. Reject malformed shapes, incomplete pairs, third keys, invalid enum values, differing effective types, and partial position sets through the existing invalid-KET path.
- Never write `brackets` for DATA. Query component uses the same bracket representation as other eligible groups. Nucleotide Component continues to use its existing superatom/class representation.
- For files written by the earlier uncommitted branch implementation, read `bracketType` when `brackets` is absent, mapping `round` to `parenthetic`; never write the provisional property. When both are present, `brackets` wins.
- Regenerate the compiled validator with the repository script and test the actual runtime validation boundary.

Mixed-type pairs are outside this implementation and must not be silently normalized. A position has zero length when its start and end points have the same x and y coordinates; equal x coordinates alone are valid for a vertical bracket.

### 3. Reuse the existing form radio path

Keep the existing radio path and horizontal row for uniform bracket types, including Query component. Its selected style must survive the same KET and history paths as other eligible groups. For supported uniform pairs, a picker selection updates both records without changing stored positions merely because the type changes.

Localize "Bracket type" and accessible style names in the existing locale resources, keeping visible `[ ]`, `( )`, and `{ }` symbols language-independent. Make the radio group keyboard-operable and give each choice an accessible name.

Reject mixed-type pairs during import; do not add independent per-side controls or a mixed picker state in this scope. Entering DATA hides the picker and does not apply a new bracket attribute to DATA.

Alternative: a separate dialog or a dropdown. Rejected because the supplied UX specifies a radio row in the current properties dialog.

### 4. Shape-only shared curved geometry

Retain existing square path branches and their coordinate formatting. Add a small rendering-only helper for the new round and curly paths, consumed by Raphael and D3. Supply the calculated endpoint, center, width, height, and orientation vectors. Do not move atoms to accommodate bracket styles; apply the layout exception below only to visible groups with identical atom membership.

Round brackets use smooth outward curves with inward-facing endpoints. Curly brackets use smooth upper and lower lobes with a center cusp. The left and right shapes are mirrored using the existing bracket orientation; the same construction must work for rotated groups and small or tall bracket boxes. Curve control points must stay within their assigned bracket envelope, so changing only the style does not change hit/selection extents.

Remove Raphael index-label dependence on `getPath()[1]`/`getPath()[2]`: compute the same original upper/lower endpoints from bracket parameters, preserving its orientation and offset rules. D3 already positions labels from bracket parameters. Assert square label positions before and after this refactor, including rotated groups, repeat labels, and nucleotide-component icons.

Distinguish absent positions from a stored pair containing a zero-length position before automatic layout. Both renderers must suppress the bracket pair in the latter case without deleting the S-group, mutating its coordinates, or substituting a computed pair. When both supplied positions have non-zero length, draw the brackets at those positions and derive the closing label anchor from that geometry.

Alternative: curved paths that mimic the square path's command indices. Rejected as brittle: curve commands expose control points rather than the label anchors, and future path changes would break indexing again. Changing only Raphael is also rejected because a KET structure can be displayed by the second renderer.

### 4.1 Separate groups with identical atom membership

When two or more visible bracketed S-groups with automatic placement contain exactly the same atom set, assign them distinct nested bracket envelopes in their existing hierarchy order. The layout must account for different intrinsic group padding, keep a visible gap on both sides, and separate the top and bottom label anchors. DATA, contracted, zero-length-suppressed, or otherwise non-bracketed groups must not consume a bracket position. Explicit file positions must not be shifted by this automatic separation.

Use the same rendering-only layout decision in Raphael and D3. Keep the drawn bracket, its labels and icons, and its interaction and hover geometry aligned. Recompute the layout when groups are added, removed, expanded, contracted, undone, or redone. A group without a visible same-atom peer keeps its original box and placement.

The layout is derived from existing groups; it must not change atoms, bonds, group membership, style, or KET data. This is a targeted exception to the original no-position-change goal, not a change to which S-groups are allowed or how nesting works.

Copying and KET serialization reconstruct the S-group hierarchy as groups are
inserted into a cloned structure. For groups with identical atom sets, clone
their parents before their children, while keeping unrelated groups and DATA
groups in their existing positions. Undoing removal must also restore explicit
parent and child links when the parent has ID `0`.

### 5. Focused behavior and visual verification

- Extend the existing React `sgroup.test.tsx` suite for every non-DATA choice, DATA exclusion, default selection, editing, cancellation, and existing validation.
- Extend S-group entity/action and KET tests for default construction, cloning, reversible edits, each supported style, documents containing different styles across separate groups, legacy input, special group representations, and invalid values. Verify that a mixed-type pair is rejected and an omitted type is equivalent to explicit square.
- Exercise complete uniform bracket pairs and their supplied positions through the serializer and both renderers, including endpoint order, movement, membership changes, and undo/redo. Verify that a zero-length opening, closing, or both suppresses the pair across unchanged KET round trips while missing positions still produce automatic brackets. Include zero-length positions away from the origin and non-zero vertical brackets.
- Verify Query component's picker and KET persistence, DATA exclusion, and errors for incomplete pairs or additional keys such as `branch` through the real runtime serializer.
- Add rendering tests for curves, mirror/orientation behavior, label anchors, and unchanged square paths in both pipelines.
- Cover identical-atom groups with different and matching styles, more than two groups, different intrinsic padding, and group removal/undo; assert both distinct geometry and independent KET state.
- With user approval, extend existing S-group E2E scenarios and their page object rather than introducing a new test framework. New spec files require a separately approved test plan. Generate only directly affected Linux snapshots through the documented Docker workflow.
- Verify in the standalone app using the properties dialog. Export KET before and after style edits; prove the style changed while chemistry, membership, other attributes, and coordinates stayed unchanged. Reopen the saved KET and verify picker and geometry. Exercise undo/redo and one mode switch. Capture screenshots and errors.

## Risks / Trade-offs

- [A file contains a mixed-type pair supported only by future work] -> Report a clear import error rather than silently changing the file's meaning; do not claim mixed-type pairs are supported.
- [A zero-length position is mistaken for a missing position] -> Retain both explicit positions and test that either zero-length side suppresses the pair in both renderers before and after an unchanged KET round trip; automatic fallback remains for absent positions.
- [Old Indigo drops or rejects new KET fields] -> Keep default square output unchanged, document the external dependency, and distinguish local KET/canvas verification from backend conversions.
- [Curve paths invalidate label anchors] -> Anchor labels to existing geometry, not path command indices; test square positions as a regression.
- [A creation/edit/copy or special-type conversion drops the style] -> Cover actual attribute and serialization flows, not just a renderer supplied with a mock style.
- [Separated brackets and their hit areas diverge] -> Keep the paths inside their assigned envelopes and update their label, selection, and hover geometry together.
- [New controls affect existing dialog snapshots] -> Update only related baselines, retaining field order, validation, and DATA layout.
- [Compiled schema is stale] -> Regenerate with the repository script before validation tests.

## Migration Plan

Legacy documents without bracket data remain square. Read the provisional `bracketType` used by this branch for migration, but emit only the supplied `brackets` representation. Land the resolved model, UI, renderers, KET validation, and tests together so persisted brackets can be read and displayed consistently.

Rollback the code change without rewriting users' files. KET containing non-default styles may be ignored or rejected by older readers; retain those files intact and document that older software is not guaranteed to preserve the newly introduced style.

At archive, update the KET 2.0 field reference and the owning serialization, rendering, UI, and feature documentation. Do not update the current-behavior memory bank before implementation and verification.
