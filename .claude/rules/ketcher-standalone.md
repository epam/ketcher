---
paths:
  - "packages/ketcher-standalone/**"
description: "ketcher-standalone: the Indigo WASM worker protocol and its build variants"
---

# ketcher-standalone

Read [modules/indigo-boundary.md](../../.memory-bank/modules/indigo-boundary.md) before changing
anything here; the build is described in
[modules/ketcher-standalone.md](../../.memory-bank/modules/ketcher-standalone.md).

## One operation, three places here — and a twin in remote mode

An Indigo-backed operation is a `Command` and a `WorkerEvent` in
`packages/ketcher-standalone/src/infrastructure/services/struct/indigoWorker.types.ts#export const enum Command`,
a `case` in `packages/ketcher-standalone/src/infrastructure/services/struct/indigoWorker.ts#self.onmessage`,
and a method of
`packages/ketcher-standalone/src/infrastructure/services/struct/standaloneStructService.ts#class IndigoService`.
The same method exists in the `StructService` interface and in the remote implementation in
ketcher-core — standalone and remote are two behaviours of one contract, changed together.
Checklist: the `ketcher-indigo-call` skill.

- Forward `data.options` into the handler. `Command.ExplicitHydrogens` passes `undefined` although
  `toggleExplicitHydrogens(data, options?)` accepts options — that is the bug, do not copy the line.
  `Command.GetInChIKey` passes `undefined` legitimately: `getInChIKey(struct)` takes no options.
- `indigo-ketcher` is pinned to an exact version; bump it deliberately and say so in the PR.

## Build

Six Rollup runs chosen by `INDIGO_MODULE_NAME`: base64 (ESM and CJS), base64 without render (ESM and
CJS), wasm, and wasm without render. The base64 variants inline the worker as one ~20 MB literal —
grepping `dist/` for worker code finds nothing, and reading a `dist/*.js` file costs the whole
literal. The package has no unit tests (`jest --passWithNoTests`).
