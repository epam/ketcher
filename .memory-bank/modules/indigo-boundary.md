# Indigo boundary

> **Read when:** an import/export bug, a chemistry-calculation mismatch, or anything crossing into
> `ketcher-standalone` (WASM) or a remote Indigo service.
> **Skip when:** the work stays inside rendering, UI state, or the macromolecule editor's own model.

Anchors verified on `a9f02819` (master, 2026-09-18).

## Responsibility

Everything chemical that Ketcher does not compute itself is computed by **Indigo**, reached through
`StructService`. There are two implementations of the same interface and they are not interchangeable
in behaviour, only in shape:

| Mode | Implementation | Where Indigo runs |
| --- | --- | --- |
| standalone | `ketcher-standalone` | Indigo compiled to WASM, inside a Web Worker in the browser |
| remote | `ketcher-core/src/infrastructure/` | HTTP calls to an `indigo-service` deployment (`/v2/indigo/*`) |

Which formats are routed to Indigo at all is invariant **A7** in [../invariants.md](../invariants.md):
only KET and in-limit MOL V2000 are handled locally; everything else — SMILES, InChI, CDX/CDXML, RXN,
SDF, FASTA, HELM, IDT, BILN, MOL V3000 — is Indigo's answer, returned as KET or as a structured error.

## Constraints and traps

**The canvas does not show Indigo's implicit hydrogens.** `Struct` recomputes `implicitH` from its own
JS valence model (`packages/ketcher-core/src/domain/entities/struct.ts#calcImplicitHydrogen`, which
calls `packages/ketcher-core/src/domain/entities/atom.ts#calcValence(` and its per-group helper
`packages/ketcher-core/src/domain/entities/atom.ts#calculateValenceResult`) and overwrites whatever
Indigo returned. A change to Indigo's valence rules is therefore invisible on the canvas and visible only in
exported output. When a ticket says "Ketcher shows the wrong number of hydrogens", first determine
which of the two models produced the number.

**Options are dropped for some worker commands.** In `indigoWorker.ts`, most commands forward
`data.options` into `handle(...)`; `Command.ExplicitHydrogens` passes `undefined`
(`packages/ketcher-standalone/src/infrastructure/services/struct/indigoWorker.ts#case Command.ExplicitHydrogens`), so fold and
unfold explicit hydrogens run with default Indigo options no matter what the caller set. The
neighbouring `Command.GetInChIKey` also passes `undefined`, but legitimately — that call takes no
options. Standalone and remote therefore disagree for this one operation.

**Standalone and remote are two behaviours, not one.** A WASM build and a service deployment can be
different Indigo versions, and only the service applies deployment-level configuration. A bug
reproduced in one mode must be checked in the other before it is attributed to Ketcher.

**The worker bundle hides its own source.** The build inlines the worker into the chunk as a single
base64 literal (~21 MB). Grepping `dist/` for a symbol from the worker finds nothing, and a changed
chunk hash proves only that the bundle changed. To verify a worker-side edit, decode the literal.

## Dependencies / dependents

Depends on: `StructService` and `StructServiceProvider` (`ketcher-core/src/domain/services/`),
`FormatterFactory` (`ketcher-core/src/application/formatters/`), and the KET serializers.

Depended on by: every import/export path, structure check, calculated values, aromatize/dearomatize,
layout and clean-up, explicit-hydrogen fold/unfold, and macromolecule property calculation.

See also [serialization.md](./serialization.md) for the formatter side of the same boundary.
