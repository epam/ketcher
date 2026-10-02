---
paths:
  - "packages/ketcher-core/src/domain/serializers/**"
  - "packages/ketcher-core/scripts/**"
  - ".memory-bank/formats/**"
description: "KET schema and the client-side serializers"
---

# KET and the client-side serializers

Spec: [.memory-bank/formats/](../../.memory-bank/formats/README.md) — v2.0 is current. Procedure for a
schema or serializer change: the `ketcher-ket-format` skill.

- `ket/schema.json` is the source; `ket/compiledSchema.js` is generated from it by
  `npm run ajv -w ketcher-core` (`scripts/compile-ket-schema.cjs`), is git-ignored, and is imported
  by `ket/validate.ts`. Regenerate after every schema edit.
- `packages/ketcher-core/src/domain/serializers/ket/ketSerializer.ts#KetSerializer` reads through
  `fromKet/` and writes through `toKet/`; both directions change in the same commit, or KET stops
  round-tripping (B2).
- KET is also Indigo's interchange format: every non-local format is converted by Indigo to and from
  KET (A7). A field Indigo does not understand does not survive a conversion to SMILES, MOL V3000,
  CDX, HELM and the rest — plan the Indigo side (`../indigo`) with the change.
- `SdfSerializer` only loads the bundled template libraries; user SDF goes through Indigo (A7).
- Serializer fixtures: `packages/ketcher-core/__tests__/domain/serializers/ket/fixtures/toKet.ts` and
  `toStruct.ts`, about 30 KB each — read the part you need.
