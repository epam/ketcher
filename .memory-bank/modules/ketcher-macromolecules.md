# ketcher-macromolecules

> React UI package for the macromolecules (polymer) editor.

## Responsibility

Provides the React + Redux + MUI component tree that hosts the D3/SVG-based macromolecule editor. Manages the polymer canvas, monomer library, layout modes, sequence editing, and all macromolecule-specific UI.

## Public Interfaces

- Default export from `src/index.tsx` — `Editor` component. Props:
  - `ketcherId: string` — ID linking to the `Ketcher` instance in `ketcherProvider`
  - `togglerComponent?: JSX.Element` — the mode-toggle button injected by `ketcher-react`
  - `isMacromoleculesEditorTurnedOn?: boolean`
  - `monomersLibraryUpdate / monomersLibraryReplace` — library customization
  - `onInit(editor: CoreEditor): void` — callback after editor is ready

## Internal Structure

```
src/
├── Editor.tsx              # Root: Provider, ThemeProvider, canvas setup, CoreEditor creation
├── EditorEvents.tsx        # Wires CoreEditor events to Redux actions
├── state/
│   ├── common/
│   │   └── editorSlice.ts  # Primary Redux slice: editor, layout, tool, preview
│   ├── library/            # Monomer library search/filter state
│   ├── modal/              # Modals state
│   └── rna-builder/        # RNA builder panel state
├── components/
│   ├── monomerLibrary/     # Monomer panel (search, tabs, items)
│   ├── TopMenuComponent/   # Top toolbar (file ops, undo/redo, zoom)
│   ├── LeftMenuComponent/  # Left toolbar (tool selection)
│   ├── contextMenu/        # Right-click context menus
│   ├── modal/              # All dialogs (error, RNA builder, bond creation, etc.)
│   ├── Layout/             # Canvas + sidepanel layout wrappers
│   ├── Ruler/              # Chain-length ruler overlay
│   ├── ZoomControls/       # Zoom in/out/fit buttons
│   ├── FloatingTools/      # Context-sensitive floating toolbar
│   └── shared/             # Reusable components (monomer avatars, styled toasts, etc.)
├── hooks/                  # Custom React hooks (useLoading, useSetRnaPresets, hotkeys, …)
└── theming/                # MUI theme, Emotion global styles, defaultTheme
```

## State Management

Uses **Redux Toolkit** with a single `store` (`src/state/store.ts`). Key in `editorSlice.ts`:

- `editor: CoreEditor | undefined` — reference to the active `CoreEditor`
- `activeTool: string` — name of the currently selected tool
- `editorLayoutMode: LayoutMode` — `flex-layout-mode | snake-layout-mode | sequence-layout-mode`
- `editorLineLength: EditorLineLength` — chain length for snake layout
- `preview: EditorStatePreview` — monomer/bond hover previews
- `monomerLibraryLoadError` — error from monomer library loading

## Layout Modes (Macromolecules)

Three layout modes managed by `BaseMode` subclasses:

| Mode                   | Class          | Description                              |
| ---------------------- | -------------- |------------------------------------------|
| `flex-layout-mode`     | `FlexMode`     | Free-form 2D canvas placement            |
| `snake-layout-mode`    | `SnakeMode`    | Auto-arranged snake-like layouted chains |
| `sequence-layout-mode` | `SequenceMode` | Text-editor-like sequence input/editing  |

Mode is stored in Redux and triggers `CoreEditor.onSelectMode()` which switches the active `BaseMode`.

## Dependencies

- `ketcher-core` (all domain and application types)
- `ketcher-react` (imports `EditorClassName`)
- React, Redux Toolkit, MUI, Emotion, react-redux
- `d3` (for SVG manipulation)

## Dependents

- End-user applications (embed via the default export)

## Assumptions & Constraints

- The `CoreEditor` instance is created inside this package (in `Editor.tsx`) and stored both in the Redux slice and via `setEditorInstance()` singleton.
- All canvas event handling is delegated through `CoreEditor.events` (an `IEditorEvents` object), not through React synthetic events.
- The monomer library panel interacts with `CoreEditor.monomersLibrary` directly (not through Redux).
- SVG avatars (SVG icons for monomers on the canvas) are rendered as inline SVG components: `PeptideAvatar`, `ChemAvatar`, `SugarAvatar`, `PhosphateAvatar`, `RNABaseAvatar`, etc.
