---
name: ketcher-ket-format
description: "Add or change a field or entity in the KET format: spec, schema, compiled validator, both serializer directions, model, Indigo's KET loader and saver, fixtures and round-trip tests. Use for any KET schema or serializer change."
argument-hint: "<field or entity to add or change>"
---

# Changing the KET format

Target: **$ARGUMENTS**. KET is Ketcher's file format **and** the interchange format with Indigo: every
non-local format is converted by Indigo to and from KET (A7). A field only Ketcher knows survives a
KET save and disappears in every other format.

## Order of work

1. **Spec** — the section in [.memory-bank/formats/ket-2.0-specification.md](../../../.memory-bank/formats/ket-2.0-specification.md)
   (40 KB: grep the object you change), and its change list. New fields are optional, so older
   documents still load.
2. **Schema** — `packages/ketcher-core/src/domain/serializers/ket/schema.json`, then
   `npm run ajv -w ketcher-core` to regenerate the git-ignored `compiledSchema.js` that
   `ket/validate.ts` imports. Without the regeneration the validator silently checks the old schema.
3. **Deserialize** — `ket/fromKet/` for the entity, wired through
   `packages/ketcher-core/src/domain/serializers/ket/ketSerializer.ts#KetSerializer`
   (`deserializeMicromolecules` for molecules, `deserializeToDrawingEntities` for macromolecules).
4. **Serialize** — `ket/toKet/` in the same commit. One direction without the other breaks B2.
5. **Model** — the entity field, its `clone()`, and — if the user can edit it — an operation
   (the `ketcher-model-change` skill).
6. **Indigo** — the KET loader and saver in the Indigo checkout:
   `../indigo/core/indigo-core/molecule/src/molecule_json_loader.cpp` and `molecule_json_saver.cpp`.
   Without them the field is lost on every SMILES, MOL V3000, CDX, HELM… path. Coordinate the Indigo
   change and the `indigo-ketcher` version that carries it.

## Tests

- Fixtures in `packages/ketcher-core/__tests__/domain/serializers/ket/fixtures/` (`toKet.ts`,
  `toStruct.ts`, ~30 KB each — read the part you need) and a round trip in
  `packages/ketcher-core/__tests__/domain/serializers/ket/KetSerializer.test.ts`.
- A document without the new field still loads (backward compatibility).
- E2E: a file round trip with `verifyFileExport` (see
  [testing-e2e.md](../../../.memory-bank/testing-e2e.md)) for anything user-visible.
- Finish with `/ketcher-verify`; it regenerates the compiled schema when it is older than
  `schema.json`.
