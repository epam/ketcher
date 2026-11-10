# Proposal

## Why

S-groups currently use square brackets only, so users cannot choose the notation appropriate for their structure. Issue [#10469](https://github.com/epam/ketcher/issues/10469) requests square, round, and curly brackets with the same existing S-group behavior and lossless KET persistence.

## What Changes

- Add a horizontal, mutually exclusive "Bracket type" radio picker with `[ ]`, `( )`, and `{ }`, below the existing properties, following the attached UX.
- Include the picker for all non-DATA types in the original requirement, including Query component. Its exclusion from the supplied KET description was a mistake.
- Default new groups and legacy groups without a stored style to square; show the stored style when editing.
- Preserve the shared bracket type and each bracket's supplied position through KET save/load and the applicable editing and history paths.
- Render round and curly brackets in both existing canvas rendering pipelines wherever an S-group already displays brackets. Keep the existing square shape and single-group placement. When multiple visible groups cover the same atoms, separate their bracket pairs while preserving each group's style, hierarchy, labels, and selection.
- Replace the provisional KET `bracketType` property with the corrected `brackets` object. When present, it contains exactly `opening` and `closing`, each carrying an optional `square`, `parenthetic`, or `curly` type and optional position. The two effective types must match; positions remain independent. The earlier `branch` entry was a mistake; reject incomplete pairs and additional brackets. Read the provisional property from files produced by this branch for migration, but write only the new representation.
- Retain supplied positions only while the group's atom positions and membership are unchanged; preserve bracket types when positions are dropped.
- Draw no brackets if either stored bracket position has zero length; do not replace the pair with automatically positioned brackets. Preserve both positions during an unchanged KET round trip. Missing positions continue to request automatic placement.
- Add focused unit coverage and, subject to approval, Playwright coverage and Linux visual baselines.
- Do not implement the Indigo ticket's MOL, CDX/CDXML, PNG, or SVG export changes in this branch, as confirmed by the requester.

## Capabilities

### New Capabilities

None; existing capabilities own the behavior.

### Modified Capabilities

- `templates-and-groups`: S-group bracket selection, editing, reversible changes, and per-bracket canvas rendering.
- `import-export`: lossless supported S-group bracket types and positions in KET, including legacy square defaults.

## Impact

- `ketcher-react`: S-group form schemas, field rendering and styles, localized labels, dialog event/result flow, and dialog tests.
- `ketcher-core`: SGroup attributes, KET types/schema/converters, existing operation/history and cloning paths, Raphael bracket drawing and D3 SGroupRenderer.
- Tests: existing S-group dialog, entity, action/history, KET serializer and rendering suites; approved S-group E2E scenarios.
- No intended changes to chemistry, atom coordinates, group membership, public facade signatures, settings persistence, or format routing. Use supplied bracket positions when both have non-zero length; use the existing automatic placement and same-atom separation rules when positions are absent. Either zero-length position suppresses the pair instead of requesting automatic placement.
- The requester confirmed that opening and closing have the same type in this implementation. Different types within one pair are a future feature, not part of this change. If an imported pair nevertheless has different effective types, report a clear error rather than silently unifying or discarding its data. Different S-groups may still use different types.
- External dependency: [epam/Indigo#3783](https://github.com/epam/Indigo/issues/3783) remains open. The supplied KET contract replaces the earlier provisional one; backend format conversion and backend image rendering must not be reported as supported until Indigo implements and ships its changes.
- Update the owning memory-bank documents when the change is archived, not while this change is in progress.
