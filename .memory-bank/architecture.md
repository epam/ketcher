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

```mermaid
flowchart TD
    A["User gesture (click / drag / key)"] --> B[SVG canvas DOM event]
    B --> C[Editor event bus]
    C --> D[active Mode]
    C --> E[active Tool]

    subgraph command-cycle["Command cycle"]
        F[DrawingEntitiesManager]
        G[EditorHistory]
        H[RenderersManager]
    end

    D -->|"build Command"| F
    D -->|"push to undo/redo"| G
    D -->|"update canvas"| H
    E -->|"build Command"| F
    E -->|"push to undo/redo"| G
    E -->|"update canvas"| H

    D:::note
    E:::note
    F:::note
    G:::note
    H:::note

    classDef note fill:#fafafa
```

- **active Tool** — interprets the event, validates, calculates
- **DrawingEntitiesManager** — builds a Command (grouped reversible operations)
- **EditorHistory** — pushes Command to undo/redo stack
- **RenderersManager** — executes Command, updates SVG canvas

**Format conversion flow** — see [serialization deep-dive](./modules/serialization.md) for full details.

When the user exports or imports a structure, the formatter factory picks the right strategy based on the requested format. KET and MOL V2000 are handled by Ketcher itself. Every other format (SMILES, InChI, HELM, FASTA, and so on) is routed through Indigo — either a remote server or the embedded WASM build. In that case the model is first serialized to KET (the universal interchange format), sent to Indigo for conversion, and the result is returned. Import is the mirror: non-local formats are sent to Indigo, which returns KET, and KET is then deserialized into the internal model.

```mermaid
flowchart LR
    subgraph Export
        IM[internal model] --> FF1[formatter factory]
        FF1 -->|KET / MOL V2000| LS[local serializer]
        FF1 -->|other formats| IND1[Indigo HTTP/WASM]
        LS --> OS1[output string]
        IND1 -->|convert to target format| OS1
    end

    subgraph Import
        IS[input string] --> FD[format detection]
        FD -->|KET / MOL V2000| LD[local deserializer]
        FD -->|other formats| IND2[Indigo HTTP/WASM]
        IND2 -->|convert to KET| KD[KET deserializer]
        LD --> MDL[internal model]
        KD --> MDL
    end
```
