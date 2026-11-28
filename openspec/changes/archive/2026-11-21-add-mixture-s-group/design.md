# Design

## Context

- `SGroup.TYPES` already lists `MIX` and `FOR`, and the Molfile reader accepts both, but their post-load handlers are empty, the Molfile writer has no entry for them (saving throws), the KET schema and the renderer's list of bracketed types do not include them, and `supportedSGroupTypes` in `ketcher-react` leaves them out, which is what triggers the "Unsupported S-group type" question.
- The dialog is built from the `sgroup` schema in `struct-schema.ts`: one `oneOf` entry per type, keyed by `type`. `queryComponent` and `nucleotideComponent` are entries that do not map one-to-one to a Molfile type.
- Copolymer (`COP`) is the closest existing type: brackets, a subtype shown at the lower right of the closing bracket, and a `Subtype` selector.

## Goals / Non-Goals

**Goals:**

- One dialog type, two S-group types in the model, matching Molfile and the Indigo issue ("ordered and unordered mixtures remain distinct").
- Reuse the Copolymer paths for rendering and the generic (`GEN`) paths for Molfile save and load.

**Non-Goals:**

- `Component` S-groups and component order (#10459).
- Selector labels with abbreviations (#10457).
- Any Indigo change.

## Decisions

1. **Model: two S-group types, `FOR` and `MIX`.** The subtype is the S-group's type, not a data field. Alternative: one type `MIX` with `data.subtype`. Rejected: it needs a translation at every file boundary and cannot represent a file's `FOR` without one.
2. **Dialog: one schema entry `mixture`** with a required property `mixtureType` (`enum: ['FOR', 'MIX']`, shown as `Subtype` with the names `Ordered` / `Unordered`, no `default`). The form converter (`fromSgroup` / `toSgroup` in `structconv.ts`) maps in both directions: an existing `FOR` or `MIX` group opens as `{ type: 'mixture', mixtureType: <its type> }`, and a dialog result of `mixture` becomes the type in `mixtureType`. The property is not named `subtype` because Copolymer already has a `subtype` and the form keeps a value whose name exists in the newly selected type; a shared name left Apply disabled after switching from Mixture to Copolymer. Alternative: two entries in the type list. Rejected: the issue asks for one `Mixture` entry.
3. **Bracket abbreviation in this change.** `resgroup.ts` sets `lowerIndexText` to `f` or `mix`, as it does for the Copolymer subtype on master. The issue ties this to #10457, but nothing in that PR is needed for it.
4. **KET: `type: "FOR"` / `"MIX"` with `atoms` only**, added to the schema's type enum. Indigo's KET form is not published yet (epam/Indigo#3773); the Molfile codes are the most likely choice and are the cheapest to change later.
5. **Molfile:** V2000 is read and written by Ketcher: post-load and save reuse the generic handlers, as `COP` does for post-load, and the type code is written as is. V3000 goes through Indigo, which already keeps `MIX` and `FOR` (checked in the app with the bundled standalone Indigo).
6. **Editing replaces the group** through the existing add-then-delete path, so undo and redo need no new operation.

## Risks / Trade-offs

- [A mixture inside a mixture, listed inner first in a KET file, loads with duplicated atoms] → this is the nested S-group load bug that exists for every S-group type; it is fixed separately, and the nested-mixture scenario holds once that fix is merged.

- [Indigo rejects or drops `MIX`/`FOR` in KET until its issue is done] → checked with the bundled standalone Indigo: layout, SMILES, CML, CDXML and Molfile V3000 work and keep the group. A remote Indigo of another version is not checked.
- [Indigo picks different KET names] → only the KET serializer and schema change; covered by one round-trip test.
- [Dropdown order when #10459 lands] → `Component` is inserted before `Mixture`; no conflict beyond one line.
- [Subtype with no default is new for this form] → a unit test covers "Apply disabled until a subtype is selected".
