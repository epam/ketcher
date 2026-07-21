# ketcher-react

> React UI package for the micromolecules (small molecule) editor.

## Responsibility

Provides the React component tree that hosts the Raphael-based 2D small molecule editor. Also acts as the **integration host** that lazily mounts `ketcher-macromolecules` alongside itself and manages the mode toggle between small-molecule and polymer editing.

## Public Interfaces

- `Editor` (default export from `src/index.tsx`) — top-level React component. Accepts:
  - `structServiceProvider` — remote or standalone chemistry backend
  - `errorHandler` — optional error callback
  - `onInit(ketcher: Ketcher)` — called after Ketcher is ready
  - `disableMacromoleculesEditor?: boolean` — opt out of macro mode
  - `monomersLibraryUpdate?: string | JSON` — load/merge custom monomer library
  - `monomersLibraryReplace?: string | JSON` — replace entire monomer library
- `MicromoleculesEditor` — inner component that mounts the Raphael canvas and Redux store
- `EditorClassName` — CSS class name constant used by `ketcher-macromolecules` to find the editor root DOM node

## Internal Structure

```
src/
├── Editor.tsx              # Top-level: toggles micro ↔ macro, lazy-loads macro package
├── MicromoleculesEditor.tsx # Redux Provider + Raphael canvas mount
├── script/
│   ├── api.ts             # ketcherBuilder entry point (creates Ketcher + Editor instances)
│   ├── editor/
│   │   ├── Editor.ts      # Micromolecules editor controller (wraps Raphael, tools, selection)
│   │   └── tool/          # 30+ tool implementations (atom, bond, sgroup, template, erase, etc.)
│   ├── ui/
│   │   ├── views/
│   │   │   ├── toolbars/  # LeftToolbar, TopToolbar, BottomToolbar, RightToolbar, FloatingTools
│   │   │   ├── modal/     # All dialog windows (settings, templates, sgroup, etc.)
│   │   │   └── Editor.jsx # Legacy JSX editor view
│   │   ├── state/         # Redux slices (editor, options, modal, server, templates, hotkeys, …)
│   │   └── dialog/        # Dialog-specific logic
│   └── providers/         # React context providers
└── components/            # Shared React components (toolbar items, icons, etc.)
```

## State Management

Uses **Redux** (via `react-redux`). Key slices in `src/script/ui/state/`:

- `editor/` — current tool, selection, view state
- `options/` — settings/options dialog state
- `modal/` — open dialogs
- `server/` — async request state (debounce/cancel on structure service calls)
- `templates/` — template library
- `toolbar/` — toolbar item enabled/disabled state

## Dependencies

- `ketcher-core` (domain + application layer)
- React, Redux, redux-toolkit
- Less (CSS preprocessor, compiled at build time)
- Rollup (build)

## Dependents

- `ketcher-macromolecules` (imports `EditorClassName` and the `Ketcher` type)
- End-user applications (embed the `Editor` component)

## Assumptions & Constraints

- The `Editor.tsx` file manages the `window.isPolymerEditorTurnedOn` global flag. This is used to turn on/off some functionality in ketcher (f.e. some api methods, events). It is bad practice and should be refactored in the future to get rid of this flag.
- `ketcher-macromolecules` is imported dynamically (`React.lazy`) to avoid a circular dependency. If changed to a static import, the circular dependency must be resolved first.
- The Redux store in `ketcher-react` is **separate** from the Redux store in `ketcher-macromolecules` — they do not share state.
