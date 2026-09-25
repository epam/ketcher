---
name: ketcher-unit-tests
description: "Write or extend Jest unit tests in ketcher-core, ketcher-react or ketcher-macromolecules: where the file goes so it is collected, which exemplar to copy, how to run only it. Use when a change needs unit coverage."
argument-hint: "<source file or behaviour to cover>"
---

# Unit tests in the Ketcher packages

Target: **$ARGUMENTS**. Per-package facts (collection patterns, setup files, prerequisites) are in
[.memory-bank/testing.md](../../../.memory-bank/testing.md); this skill is the procedure.

## 1. Put the file where Jest collects it

| Package | File location | Not collected |
| --- | --- | --- |
| ketcher-core | `packages/ketcher-core/__tests__/<same path as in src>/<Name>.{test,spec}.ts`, or a `__tests__/` folder next to the source | anything outside a `__tests__` folder, everything under `fixtures/`, and every `.tsx` test |
| ketcher-react | next to the source: `<Name>.{test,spec}.{ts,tsx}` under `src/` | files outside `src/` |
| ketcher-macromolecules | next to the source: `<Name>.{test,spec}.{ts,tsx}` under `src/` | files outside `src/` |

A test in the wrong place is not a failing test — it silently never runs. Confirm the new file
appears in `npx jest --listTests`, run from the package directory.

## 2. Copy the closest exemplar

| Covering | Start from |
| --- | --- |
| a micro operation (`BaseOperation`) | `packages/ketcher-core/__tests__/application/editor/operations/TextUpdate.test.ts` |
| the macro model (`DrawingEntitiesManager`, commands) | `packages/ketcher-core/__tests__/domain/entities/drawingEntitiesManager.test.ts` |
| undo/redo | `packages/ketcher-core/__tests__/application/editor/EditorHistory.test.ts` |
| KET serialization | `packages/ketcher-core/__tests__/domain/serializers/ket/KetSerializer.test.ts` with fixtures in `ket/fixtures/` |
| a react component | `packages/ketcher-react/src/script/ui/views/modal/components/InfoModal/InfoModal.test.tsx` |
| a macromolecules component with store and theme | `packages/ketcher-macromolecules/src/components/monomerLibrary/monomerLibraryItem/MonomerItem.test.tsx` |

The two core model and serializer exemplars are 15 KB each: read the imports and one `describe`
block, not the whole file.

## 3. What a good test here checks

- **Model changes** — execute, then invert, then compare with the starting state: that is the only
  thing that proves undo works (A2, B1). Assert on the model, not on renderer internals.
- **Serializers** — serialize → deserialize → equivalent structure (B2), plus the exact KET for a new
  field.
- **Components** — render, act through `@testing-library/user-event`, assert on what the user sees
  (role, text, `data-testid`). In macromolecules wrap with the globals `withThemeProvider` /
  `withThemeAndStoreProvider` from `src/setupTests.tsx`.
- Mocks: `jest-mock-extended` in core (`mock<StructService>()` for Indigo calls); macromolecules
  already replaces `ketcher-react` and `react-contexify` from `src/testMocks/`. Never call a real
  Indigo from a unit test.

## 4. Run only what you wrote

```sh
npm run build:core          # once, before react or macromolecules tests
cd packages/<package> && npx jest <path/to/Name.test.ts>
```

Then `/ketcher-verify` for the touched files — but note that ESLint's config ignores every test file,
so only Prettier and `tsc` really cover them; review the test code yourself. Report the exact command
and the pass/fail counts; a test you did not run is reported as not run.
