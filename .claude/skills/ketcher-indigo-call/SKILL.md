---
name: ketcher-indigo-call
description: "Add or change an Indigo-backed operation in Ketcher across StructService, the remote REST client and the standalone WASM worker, and verify it in both modes. Use when Ketcher needs a new or changed Indigo computation or conversion."
argument-hint: "<operation, e.g. 'expose Indigo X' or 'pass option Y to convert'>"
---

# An Indigo-backed operation, end to end

Target: **$ARGUMENTS**. Read [modules/indigo-boundary.md](../../../.memory-bank/modules/indigo-boundary.md)
first. The contract has one interface and two implementations that must stay equivalent; a change
made in only one of them is the most common source of "works in standalone, broken in remote".

## 1. The contract — ketcher-core

- Method and its `…Data`/`…Result` types on
  `packages/ketcher-core/src/domain/services/struct/structService.types.ts#export interface StructService`.
- The facade most callers use: `packages/ketcher-core/src/application/indigo.ts#export class Indigo`.

## 2. Remote mode — ketcher-core

`packages/ketcher-core/src/infrastructure/services/struct/remoteStructService.ts#export class RemoteStructService`
calls `indigoCall(...)` against `apiPath` + `indigo/<endpoint>`. Remote mode talks to the legacy
indigo-service (`/v2/indigo/*`, in the Indigo checkout at
`../indigo/utils/indigo-service/backend/service/v2/indigo_api.py`), not to the newer `api/http`
service. An endpoint that does not exist there has to be added on the Indigo side first.

## 3. Standalone mode — ketcher-standalone

1. `Command.X` and `WorkerEvent.X` in
   `packages/ketcher-standalone/src/infrastructure/services/struct/indigoWorker.types.ts#export const enum Command`,
   with a `…CommandData` type.
2. A `case Command.X` in
   `packages/ketcher-standalone/src/infrastructure/services/struct/indigoWorker.ts#self.onmessage`
   that calls the `indigo-ketcher` module and **passes `data.options`**. `Command.ExplicitHydrogens`
   passes `undefined` although its service method accepts options — that is the bug, do not copy it;
   `Command.GetInChIKey` passes `undefined` legitimately, because `getInChIKey(struct)` has no options.
3. The method on
   `packages/ketcher-standalone/src/infrastructure/services/struct/standaloneStructService.ts#class IndigoService implements StructService`
   posts the command and resolves on the matching `WorkerEvent`.
4. The function must exist in the WASM API
   (`../indigo/api/wasm/indigo-ketcher/indigo-ketcher.cpp`) of the pinned `indigo-ketcher` version
   in `packages/ketcher-standalone/package.json`. A new function means an Indigo release and a
   deliberate version bump here.

## 4. The caller

A UI command goes through a thunk (`packages/ketcher-react/src/script/ui/state/server/index.js#serverTransform`
and `script/ui/action/server.ts`); a public API method goes on
`packages/ketcher-core/src/application/ketcher.ts#export class Ketcher`. Indigo reports failures as a
structured error: surface the message to the user, never swallow it or replace it with a generic one.

## 5. Verify in both modes

- Unit: mock the service (`mock<StructService>()` from `jest-mock-extended`) and assert the call and
  the handling of both a result and an error.
- Standalone: `npm run dev:standalone -w example`, exercise the feature.
- Remote: the same with `dev:remote` against a running indigo-service (see the local
  `ketcher-local-env` skill for the testbed on this machine).
- A difference between the two modes is a bug in this change until proven otherwise.
