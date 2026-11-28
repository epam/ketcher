# Tasks

## 1. Core: model, rendering, files

- [x] 1.1 Draw brackets for `MIX` and `FOR` and set the lower-right text to `mix` / `f` in `resgroup.ts` and `SGroupRenderer.ts`; verified by a unit test of the abbreviation helper and in the app (3.2)
- [x] 1.2 KET: add `MIX` and `FOR` to the type enum in `schema.json` and regenerate `compiledSchema.js` (the serializer already writes and reads type and atoms for any type); verified by a KET round-trip unit test
- [x] 1.3 Molfile V2000: replace the empty `MIX` / `FOR` post-load handlers and add both types to `prepareForSaving` and `saveToMolfile`, reusing the generic handlers; verified by unit tests that save and reload V2000 and keep type and atoms

## 2. React: dialog and form converter

- [x] 2.1 Add the `mixture` entry after `SUP` in the `sgroup` schema with a required `mixtureType` (`FOR`, `MIX`, no default, shown as `Subtype`) and the `en`, `es`, `zh-CN` strings; verified in `sgroup.test.tsx`: type order, both options, Apply disabled until a subtype is selected
- [x] 2.2 Map between the dialog and the model in `fromSgroup` / `toSgroup` (`structconv.ts`): open `FOR` / `MIX` as `mixture` with its subtype, create the type named by `mixtureType`, and refuse an unknown one; verified in `structconv.test.ts`
- [x] 2.3 Add `MIX` and `FOR` to `supportedSGroupTypes`; verified in the app: a KET and a Molfile with mixtures load with no unsupported-type question

## 3. Verification

- [x] 3.1 `npm run test:types` passes. Unit tests pass: `ketcher-core` (all), `ketcher-react` 654 passed. The `ketcher-react` tests read the built `ketcher-core`, so build core first
- [x] 3.2 In the app: create an unordered mixture over two structures (one S-group), edit it to ordered, undo and redo, save and reopen as KET, Molfile V2000 and V3000; screenshots taken
- [x] 3.3 In the app with standalone Indigo: layout, SMILES, CML, CDXML and Molfile V3000 work on a structure with a mixture, and the group is kept
