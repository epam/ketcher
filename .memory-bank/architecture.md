# Architecture

> How is the system organized?

## Overview

Ketcher is a web-based chemical structure editor built as a TypeScript/React monorepo (npm workspaces). It supports two editing domains:

- **Micromolecules mode** — classic 2D small-molecule/reaction editor (atoms, bonds, SGroups, R-Groups, etc.)
- **Macromolecules mode** — polymer/sequence editor for peptides, RNA, DNA, and CHEM monomers

The two modes coexist in the same browser tab. Switching between them is controlled via the `ModeControl` toggle component or ketcher api. Each mode has its own editor instance, renderer, and state management, but they share a single `Ketcher` facade and the `ketcher-core` domain/application layer.

---

## Package Structure

```
packages/
├── ketcher-core/         # Domain model, application logic, serializers, renderers
├── ketcher-react/        # React UI for micromolecules editor (small molecules)
├── ketcher-macromolecules/ # React UI for macromolecules editor (polymers)
└── ketcher-standalone/   # Standalone bundle: Indigo WASM + ketcher-core glue
```

## Subsystems

### 1. `ketcher-core`

The shared foundation that both UI packages build on. It owns the entire domain model (atoms, bonds, monomers, chains), both rendering pipelines, all serializers and format converters, the editor and history machinery, and the Indigo service abstraction — everything that is not React UI.

```
ketcher-core/src/
├── application/      # Editor, renderers, formatters
│   ├── editor/       # CoreEditor, EditorHistory, tools, operations, modes
│   ├── render/       # Raphael (micro) & D3/SVG (macro) renderers
│   ├── formatters/   # Read/write molecule data in various formats
│   ├── indigo.ts     # Thin wrapper over StructService (chemistry backend)
│   ├── ketcher.ts    # Public Ketcher facade (API surface)
│   └── ketcherBuilder.ts / ketcherProvider.ts
├── domain/           # Pure domain model
│   ├── entities/     # Struct, Atom, Bond, BaseMonomer, PolymerBond, DrawingEntitiesManager, …
│   ├── serializers/  # KET, MOL, SDF serializers
│   ├── services/     # StructService interface, StructServiceProvider
│   ├── constants/    # Elements, monomers, layout constants
│   └── helpers/      # Pure helpers (monomers, rna, attachmentPoints, …)
├── infrastructure/   # StructService HTTP implementations (remote mode)
├── utilities/        # KetcherLogger, SettingsManager, clipboard, SVG utils
└── types/            # Shared TypeScript type declarations
```

### 2. `ketcher-react`

- React wrapper around the micromolecules (Raphael-based) editor
- `Editor.tsx` — top-level component
- `MicromoleculesEditor.tsx` — mounts the Raphael canvas and Redux store
- `script/editor/Editor.ts` — editor instance (wraps Raphael render + tool system)
- `script/ui/` — all React UI: toolbars, dialogs, state (Redux), hotkeys

### 3. `ketcher-macromolecules`

- React + Redux Toolkit + MUI
- `Editor.tsx` — creates `CoreEditor`, owns the D3/SVG canvas, mounts Redux store
- `state/common/editorSlice.ts` — primary Redux slice (editor instance, layout mode, tools, preview, line-length)
- `components/` — MonomerLibrary, ContextMenu, TopMenu, LeftMenu, ZoomControls, Ruler, Modals, etc.

### 4. `ketcher-standalone`

- Bundles Indigo WASM and registers a `StandaloneStructService` as `StructService`
- Allows Ketcher to run entirely in the browser with no self-hosted backend
- Entry: `src/index.ts` / `src/infrastructure/services/`

---

## Key Interactions

**Event flow** — see [editor-engine deep-dive](./modules/editor-engine.md) for full details.

When the user interacts with the canvas (click, drag, key press), the editor captures the raw DOM event and forwards it through its event bus to the active mode and the active tool. The tool is responsible for deciding what should happen: it validates and interprets the event data, asks the drawing-entities manager to build a Command (a grouped set of reversible operations), then hands that Command to the history (so the action can be undone) and to the renderers manager (so the canvas updates to reflect the change).

```
User gesture (click / drag / key)
        │
        ▼
   SVG canvas DOM event
        │
        ▼
   Editor event bus
        │
        ├──────────────────────────────────┐
        ▼                                  ▼
  active Mode                        active Tool
                                (interprets the event,
                                validates, calculates)
                                           │
                                           │
                                           ▼
                               DrawingEntitiesManager
                               builds  Command
                               (grouped reversible operations)
                                           │
                              ┌────────────┴────────────┐
                              ▼                         ▼
                        EditorHistory            RenderersManager
                        push to                  execute Command →
                        undo/redo stack          update SVG canvas
```

**Format conversion flow** — see [serialization deep-dive](./modules/serialization.md) for full details.

When the user exports or imports a structure, the formatter factory picks the right strategy based on the requested format. KET and MOL V2000 are handled by Ketcher itself. Every other format (SMILES, InChI, HELM, FASTA, and so on) is routed through Indigo — either a remote server or the embedded WASM build. In that case the model is first serialized to KET (the universal interchange format), sent to Indigo for conversion, and the result is returned. Import is the mirror: non-local formats are sent to Indigo, which returns KET, and KET is then deserialized into the internal model.

```
                    Export                               Import
                    ──────                               ──────

  internal model                               input string (any supported format)
        │                                                │
        ▼                                                ▼
  formatter factory                           format detection
  picks strategy                              picks strategy
        │                                                │
        ├── KET / MOL V2000 ──► local serializer         ├── KET / MOL V2000 ──► local deserializer
        │                            │                   │                            │
        └── other formats ──► Indigo (HTTP / WASM)       └── other formats ──► Indigo (HTTP / WASM)
                                     │                                               │
                              convert to target format                        convert to KET
                                     │                                               │
                               output string                               KET deserializer
                                                                                     │
                                                                           internal model (Struct / DEM)
```