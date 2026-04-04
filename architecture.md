# Ketcher Architecture Documentation

## Overview

Ketcher is a web-based chemical structure editor implemented as a TypeScript/React monorepo. The architecture follows clean architecture principles with clear separation between domain logic, application layer, and infrastructure.

## 1. Entry Points

### Main Application Entry Points

**Root Project Entry:**
- `ketcher/package.json` - Monorepo root with npm workspaces configuration

### Package Entry Points

1. **ketcher-core** (Domain & Application Logic)
   - Entry: `packages/ketcher-core/src/index.ts`
   - Exports: Domain entities, serializers, services, application layer (editor, formatters, render), infrastructure services

2. **ketcher-react** (React UI Components)
   - Entry: `packages/ketcher-react/src/index.tsx`
   - Main Component: `packages/ketcher-react/src/Editor.tsx`
   - Exports: Editor component, UI components, Redux store configuration

3. **ketcher-standalone** (Standalone Bundle with Indigo)
   - Entry: `packages/ketcher-standalone/src/index.ts`
   - Provides: Standalone structure service with embedded Indigo WASM/base64 module

4. **ketcher-macromolecules** (Macromolecules Editor)
   - Entry: `packages/ketcher-macromolecules/src/index.tsx`
   - Main Component: `packages/ketcher-macromolecules/src/Editor.tsx`
   - Lazily loaded by ketcher-react to avoid circular dependencies

### Example Applications

1. **example** - Main demo application
   - Entry: `example/src/index.tsx`
   - Routes: Standard app, popup mode, duo mode, closable mode
   - Uses React Router v7 for routing

2. **demo** - Simple demo using Create React App
   - Standard CRA structure

3. **example-ssr** - Next.js SSR example
   - Uses Next.js 16.1.4

4. **ketcher-autotests** - Playwright E2E tests
   - Entry: Various test files using Playwright

## 2. Project Structure

### High-Level Directory Organization

```
ketcher/
├── packages/                    # Core monorepo packages
│   ├── ketcher-core/           # Domain logic, business rules, core entities
│   ├── ketcher-react/          # React UI components, Redux state management
│   ├── ketcher-standalone/     # Standalone bundle with Indigo WASM
│   └── ketcher-macromolecules/ # Macromolecules editor (polymers)
├── example/                     # Main demo application (Vite + Webpack)
├── demo/                        # Simple CRA demo
├── example-ssr/                 # Next.js SSR example
├── ketcher-autotests/          # Playwright E2E tests
├── scripts/                     # Build and utility scripts
├── documentation/               # Documentation files
├── .github/                     # GitHub workflows and CI/CD
└── package.json                 # Monorepo root with workspaces
```

### Package: ketcher-core

**Clean Architecture Layers:**

```
ketcher-core/src/
├── domain/                      # Core business entities (DDD Domain Layer)
│   ├── entities/               # Chemical entities: Atom, Bond, Struct, Molecule, etc.
│   ├── serializers/            # Format parsers: KET, Molfile, SMILES, InChI, etc.
│   ├── services/               # Domain service interfaces
│   ├── helpers/                # Pure domain utility functions
│   ├── constants/              # Domain constants
│   └── types/                  # Domain type definitions
├── application/                 # Application/Use Case Layer
│   ├── editor/                 # Editor state management, history, operations
│   ├── formatters/             # Data transformation logic
│   ├── render/                 # Rendering engine (Raphael.js, SVG)
│   ├── ketcher.ts              # Main Ketcher API facade
│   └── ketcherBuilder.ts       # Builder for Ketcher instance
├── infrastructure/              # Infrastructure Layer
│   └── services/               # External service implementations
│       └── struct/             # Remote/Indigo service integration
└── utilities/                   # Cross-cutting utilities
```

**Key Architectural Patterns:**
- **MVC (Model-View-Controller)**: Clear separation of concerns
- **Clean Architecture**: Domain → Application → Infrastructure layers
- **Dependency Inversion**: Domain interfaces, infrastructure implementations

### Package: ketcher-react

```
ketcher-react/src/
├── Editor.tsx                   # Main Editor component (mode switcher)
├── MicromoleculesEditor.tsx    # Small molecules editor wrapper
├── script/                      # Redux state, business logic
│   ├── ui/                     # UI layer
│   │   ├── views/              # React view components
│   │   │   ├── toolbars/       # Toolbar components
│   │   │   ├── modal/          # Modal dialogs
│   │   │   └── components/     # Reusable UI components
│   │   ├── state/              # Redux store, reducers, actions
│   │   │   ├── action/         # Action creators
│   │   │   ├── modal/          # Modal state management
│   │   │   ├── toolbar/        # Toolbar state
│   │   │   └── index.js        # Store configuration
│   │   ├── builders/           # Builder patterns for editor setup
│   │   └── providers/          # Context providers
│   ├── api.ts                  # Public API surface
│   └── editor/                 # Editor integration logic
├── components/                  # Shared/reusable React components
├── contexts/                    # React Context API
├── hooks/                       # Custom React hooks
└── style/                       # Global styles (LESS)
```

**Redux Architecture:**
- **State Management**: Classic Redux (not Redux Toolkit) for ketcher-react
- **Middleware**: Redux Thunk for async actions, Redux Logger (dev mode)
- **Reducers**: Modular reducers for different concerns (toolbar, modal, editor, options, templates, etc.)

### Package: ketcher-standalone

```
ketcher-standalone/src/
├── index.ts                     # Main entry point
└── infrastructure/
    └── services/
        └── struct/             # Standalone struct service
            ├── StandaloneStructService - Uses Indigo WASM locally
            └── Various Indigo module variants (base64, WASM, with/without render)
```

**Multiple Build Variants:**
- Base64 CJS
- Base64 ESM
- WASM
- Variants with/without render support

### Package: ketcher-macromolecules

```
ketcher-macromolecules/src/
├── Editor.tsx                   # Macromolecules editor component
├── EditorEvents.tsx            # Event handling logic
├── components/                  # UI components specific to polymers
├── state/                       # Redux Toolkit state management
│   ├── store.ts                # Redux Toolkit store configuration
│   ├── common/                 # Common state slices
│   ├── library/                # Monomer library state
│   ├── modal/                  # Modal state
│   └── rna-builder/            # RNA builder state
├── helpers/                     # Helper functions
├── hooks/                       # Custom hooks
└── types/                       # TypeScript types
```

**State Management:**
- Uses **Redux Toolkit** (modern approach, unlike ketcher-react)
- Redux Saga for side effects

## 3. Module Boundaries

### Monorepo Organization

**Package Manager:** npm workspaces (switched from Yarn)

**Workspace Configuration:**
```json
"workspaces": [
  "packages/ketcher-core",
  "packages/ketcher-standalone",
  "packages/ketcher-macromolecules",
  "packages/ketcher-react",
  "ketcher-autotests",
  "example",
  "example-ssr",
  "example-separate-editors",
  "demo"
]
```

### Dependency Graph

**Build Order (critical):**
1. ketcher-core (no dependencies on other packages)
2. ketcher-react + ketcher-standalone (parallel, both depend on ketcher-core)
3. ketcher-macromolecules (depends on ketcher-core + ketcher-react)
4. Examples/Demo (depend on all packages)

**Inter-Package Dependencies:**

1. **ketcher-core**: Independent, no internal package dependencies
2. **ketcher-react**:
   - Depends on: `ketcher-core: "*"`
   - Peer deps: React 18.2+ or 19.0+
3. **ketcher-standalone**:
   - Depends on: `ketcher-core: "*"`, `indigo-ketcher: 1.42.0-rc.1`
4. **ketcher-macromolecules**:
   - Depends on: `ketcher-core: "*"`, `ketcher-react: "*"`
   - Peer deps: React 18.2+ or 19.0+

**Module Resolution:**
- Uses TypeScript path mappings for clean imports
- ketcher-core uses domain-driven aliases: `domain/*`, `application/*`, `infrastructure/*`
- Internal package references use workspace protocol (`*`)

## 4. Key Dependencies

### ketcher-core Dependencies

**Core Libraries:**
- `d3: ^7.8.5` - Data visualization, geometry calculations
- `raphael: ^2.3.0` - SVG rendering library (legacy, being replaced)
- `paper: ^0.12.18` - Canvas/vector graphics library (newer approach)
- `lodash: ^4.17.23` - Utility functions
- `svgpath: ^2.3.1` - SVG path manipulation
- `file-saver: ^2.0.5` - File download functionality

**Build Tools:**
- `rollup: ^2.79.2` - Module bundler
- `typescript: ^4.5.2` - TypeScript compiler
- `ttypescript: ^1.5.13` - TypeScript with custom transformers
- `@babel/*` - Transpilation
- `jest: 26.6.0` - Unit testing

### ketcher-react Dependencies

**UI Framework:**
- `react: ^18.2.0 || ^19.0.0` (peer dependency)
- `react-dom: ^18.2.0 || ^19.0.0` (peer dependency)
- `@mui/material: ^5.18.0` - Material-UI components
- `@emotion/react: ^11.7.1`, `@emotion/styled: ^11.14.1` - CSS-in-JS

**State Management:**
- `redux: ^5.0.1` - State container
- `react-redux: ^9.2.0` - React bindings for Redux
- `redux-thunk: ^3.1.0` - Async action middleware
- `redux-logger: ^3.0.6` - Logging middleware
- `reselect: ^4.0.0` - Memoized selectors

**Rich Text:**
- `draft-js: ^0.11.7` - Rich text editor
- `draft-js-custom-styles: ^2.1.1` - Custom styles for Draft.js

**UI Components:**
- `react-colorful: ^5.4.0` - Color picker
- `react-contexify: ^6.0.0` - Context menus
- `react-dropzone: ^11.7.1` - File upload
- `react-virtualized: ^9.22.6` - Virtualized lists for performance
- `react-intersection-observer: ^9.16.0` - Viewport intersection detection

**3D Visualization:**
- `miew-react: 0.11.0` - 3D molecular viewer

**Other:**
- `ajv: ^8.10.0` - JSON schema validation
- `font-face-observer: ^1.0.0` - Font loading detection

### ketcher-standalone Dependencies

**Chemistry Engine:**
- `indigo-ketcher: 1.42.0-rc.1` - Indigo chemistry toolkit (WASM/JS)
- `ketcher-core: "*"` - Core domain logic

### ketcher-macromolecules Dependencies

**State Management:**
- `@reduxjs/toolkit: ^2.8.2` - Modern Redux with less boilerplate
- `redux-saga: ^1.1.3` - Side effects management

**Visualization:**
- `d3: ^7.9.0` - Data-driven visualizations

**Dependencies:**
- `ketcher-core: "*"`
- `ketcher-react: "*"`

### Example Applications

**example package:**
- `react-app-rewired: ^2.2.1` - Customize CRA without ejecting
- `react-scripts: ^5.0.1` - Create React App build system
- `vite: ^4.5.14` - Fast dev server (development mode)
- `react-router-dom: ^7.13.0` - Routing

**example-ssr:**
- `next: 16.1.4` - Next.js framework for SSR

**ketcher-autotests:**
- `@playwright/test: ^1.44.1` - End-to-end testing framework

## 5. Build System

### Build Tool Strategy

**Package-Level Build:**
- **Rollup** for all library packages (ketcher-core, ketcher-react, ketcher-standalone, ketcher-macromolecules)
- **Jest** for unit testing
- **TypeScript** compiler for type checking

**Application-Level Build:**
- **Vite** - Development server (fast HMR)
- **Webpack** (via react-app-rewired) - Production builds
- **Next.js** - SSR example

### Rollup Configuration Pattern

All packages use similar Rollup setup:

**Output Formats:**
- CommonJS (CJS) - `dist/index.js`
- ES Modules (ESM) - `dist/index.modern.js`
- TypeScript declarations - `dist/index.d.ts`

**Plugins:**
1. `rollup-plugin-delete` - Clean dist folder
2. `rollup-plugin-peer-deps-external` - Externalize peer dependencies
3. `@rollup/plugin-node-resolve` - Resolve node_modules
4. `@rollup/plugin-commonjs` - Convert CJS to ESM
5. `@rollup/plugin-replace` - Environment variable replacement
6. `@rollup/plugin-json` - Import JSON files
7. `rollup-plugin-typescript2` - TypeScript compilation with ttypescript
8. `@rollup/plugin-babel` - Transpilation
9. `rollup-plugin-cleanup` - Code cleanup
10. `@rollup/plugin-strip` - Remove console logs in production
11. `rollup-plugin-postcss` - CSS/LESS processing (ketcher-react, ketcher-macromolecules)
12. `@svgr/rollup` - Import SVG as React components

**Special: ketcher-standalone**
- Multiple build variants (6 builds total):
  - Standard (base64, WASM)
  - Without render support
  - CJS variants
- Web worker support for Indigo WASM

### Vite Configuration (Development)

**Features:**
- Path aliases from tsconfig.json mapped to source files
- Direct source file imports (no dist)
- Fast HMR (Hot Module Replacement)
- SVG as React components
- LESS/CSS processing
- Environment variable injection

**Critical Aliases:**
```javascript
'ketcher-react' → 'packages/ketcher-react/src/index.tsx'
'ketcher-core' → 'packages/ketcher-core/src/index.ts'
'ketcher-standalone' → 'packages/ketcher-standalone/src/index.ts'
'ketcher-macromolecules' → 'packages/ketcher-macromolecules/src/index.tsx'
```

### Webpack Configuration (Production)

**Via react-app-rewired:**
- Customizes Create React App without ejecting
- Additional plugins:
  - `copy-webpack-plugin` - Copy static assets
  - `html-replace-webpack-plugin` - HTML template processing
  - `git-revision-webpack-plugin` - Git version info
  - `webpack-bundle-analyzer` - Bundle size analysis

### Build Scripts

**Root Level:**
```bash
npm run build              # Build all packages + example
npm run build:packages     # Build core → standalone/react → macromolecules
npm run build:core         # Build ketcher-core only
npm run build:standalone   # Build ketcher-standalone only
npm run build:react        # Build ketcher-react only
npm run build:macromolecules # Build ketcher-macromolecules only
```

**Development:**
```bash
npm run serve:remote       # Serve with Indigo service
npm run serve:standalone   # Serve standalone mode
cd example && npm run dev:standalone  # Vite dev server
cd example && npm run start:standalone # Webpack dev server
```

**Testing:**
```bash
npm test                   # Run all tests (prettier, eslint, types, unit)
npm run test:types         # TypeScript type checking
cd ketcher-autotests && npm run test # E2E tests
```

### Code Quality Tools

**Linting:**
- ESLint 8.x with TypeScript parser
- Prettier 2.8.0 for code formatting
- Stylelint for CSS/LESS files

**Pre-commit Hooks:**
- Husky 8.x for Git hooks
- lint-staged for staged files only

## 6. Technology Stack

### Frontend Framework & Libraries

**Core UI:**
- **React 18.2+ / 19.0+** - UI framework (supports both versions)
- **TypeScript 4.5.2+** - Type system
- **Redux** - State management (classic Redux in ketcher-react)
- **Redux Toolkit** - Modern Redux (ketcher-macromolecules)
- **Material-UI 5.18** - UI component library
- **Emotion 11** - CSS-in-JS styling

**Rendering & Graphics:**
- **Raphael.js 2.3** - Legacy SVG rendering
- **Paper.js 0.12.18** - Modern canvas/vector graphics
- **D3.js 7.x** - Data visualization and geometry
- **SVG** - Primary rendering format

**Rich Text & Input:**
- **Draft.js 0.11.7** - Rich text editing for chemical annotations

**3D Visualization:**
- **Miew-react 0.11.0** - WebGL-based 3D molecular viewer

**File Handling:**
- **file-saver** - Client-side file downloads
- **react-dropzone** - Drag-and-drop file upload

### Chemistry Domain

**Chemical Computation:**
- **Indigo 1.42** - Chemistry toolkit (C++ compiled to WASM)
  - Molecule manipulation
  - Structure layout/cleanup
  - Format conversion
  - SMILES/InChI generation
  - Aromatization
  - Substructure search

**Supported Chemical Formats:**
- KET (Ketcher JSON) - Native format
- Molfile V2000/V3000 - Industry standard
- SMILES/SMARTS - Linear notation
- InChI/InChIKey - IUPAC identifiers
- CML - Chemical Markup Language
- CDX/CDXml - ChemDraw formats
- RXN - Reaction format
- SDF - Structure-Data File
- FASTA, HELM, IDT, Sequence - Macromolecule formats

### Build & Development Tools

**Build Systems:**
- **Rollup 2.79** - Library bundler (all packages)
- **Vite 4.5** - Development server
- **Webpack 5** (via react-app-rewired) - Production builds
- **Next.js 16.1** - SSR framework (example-ssr)

**Transpilation:**
- **Babel 7** - JavaScript transpilation
- **TypeScript 4.5** - Type checking and compilation
- **ttypescript** - TypeScript with transformers for path mapping

**CSS/Styling:**
- **LESS 3.12** - CSS preprocessor
- **PostCSS** - CSS transformations
- **Autoprefixer** - Browser prefixes

### Testing

**Unit Testing:**
- **Jest 26.6/27.x** - Test runner
- **ts-jest** - TypeScript support for Jest
- **@testing-library/react** - React component testing
- **jest-mock-extended** - Advanced mocking

**E2E Testing:**
- **Playwright 1.44** - Browser automation
- Docker support for CI/CD testing

**Type Checking:**
- TypeScript compiler (`tsc --noEmit`)

### Code Quality

**Linting:**
- **ESLint 8.x** - JavaScript/TypeScript linter
- **@typescript-eslint** - TypeScript rules
- **eslint-plugin-react** - React-specific rules
- **eslint-plugin-jest** - Jest rules
- **Stylelint 14.x** - CSS/LESS linter

**Formatting:**
- **Prettier 2.8** - Code formatter
- **lint-staged** - Run linters on staged files
- **Husky 8.x** - Git hooks

### DevOps & CI/CD

**Version Control:**
- Git
- GitHub Actions (CI/CD pipelines in `.github/`)

**Containerization:**
- Docker (for autotests)
- docker-compose

**Package Management:**
- **npm 7+** (workspaces)
- Node.js 22+ required

**Utilities:**
- **cross-env** - Cross-platform environment variables
- **npm-run-all** - Run multiple npm scripts
- **serve** - Static file server
- **shx** - Cross-platform shell commands

### Browser Support

**Production:**
- >0.2% market share
- Not dead browsers
- Not Opera Mini

**Development:**
- IE 11 (legacy support)
- Latest Chrome, Firefox, Safari

## 7. Architecture Highlights

### Design Patterns

1. **Clean Architecture** - Clear layer separation (Domain → Application → Infrastructure)
2. **MVC Pattern** - Model (chemical entities), View (SVG rendering), Controller (tools/actions)
3. **Repository Pattern** - Service interfaces in domain, implementations in infrastructure
4. **Builder Pattern** - KetcherBuilder for instance creation
5. **Command Pattern** - Editor operations as commands with undo/redo
6. **Observer Pattern** - Event system for editor changes
7. **State Management** - Redux for UI state, immutable updates

### Key Architectural Decisions

- **Monorepo** - Coordinated development across packages
- **TypeScript** - Type safety for chemical domain complexity
- **Lazy Loading** - Macromolecules editor loaded on demand to avoid circular dependencies
- **Dual Build Mode** - Vite (dev) + Webpack (prod) for optimal DX and UX
- **Modular Services** - Pluggable structure service (remote Indigo vs. standalone WASM)
- **Platform Agnostic Core** - ketcher-core has no UI dependencies
- **Format Agnostic** - Multiple chemical format support through serializers

### Strengths

1. **Separation of Concerns** - Clear boundaries between domain, application, and infrastructure
2. **Testability** - Domain logic independent of UI and external services
3. **Extensibility** - Plugin architecture for structure services
4. **Type Safety** - Full TypeScript coverage reduces runtime errors
5. **Performance** - Lazy loading, virtualized lists, optimized rendering
6. **Developer Experience** - Fast HMR with Vite, comprehensive testing setup

### Areas for Consideration

1. **State Management Inconsistency** - ketcher-react uses classic Redux, ketcher-macromolecules uses Redux Toolkit
2. **Rendering Library Evolution** - Both Raphael.js (legacy) and Paper.js (modern) present, migration in progress
3. **Build Complexity** - Dual build system (Vite + Webpack) adds maintenance overhead
4. **Dependency Age** - Some dependencies (Draft.js 0.11, Jest 26.6) are outdated

## 8. Chemical Domain Model

### Core Entities

- **Struct** - Main data structure representing a chemical structure
- **Atom** - Individual atom with properties (element, charge, isotope, etc.)
- **Bond** - Connection between atoms with type (single, double, triple, aromatic)
- **Fragment** - Group of connected atoms
- **RGroup** - R-group for generic structures
- **SGroup** - Special groups (data, superatom, multiple, repeating, etc.)
- **RxnArrow** - Reaction arrow
- **RxnPlus** - Plus sign in reactions
- **SimpleObject** - Shapes and annotations (text, rectangle, ellipse, etc.)

### Serialization Formats

Each format has dedicated parser/serializer in `domain/serializers/`:
- **ket/** - Ketcher JSON format (native)
- **mol/** - Molfile V2000/V3000
- **smiles/** - SMILES/SMARTS notation
- **inchi/** - InChI/InChIKey
- **cml/** - Chemical Markup Language
- **cdx/** - ChemDraw binary format
- **cdxml/** - ChemDraw XML format
- **rxn/** - Reaction files
- **sdf/** - Structure-Data Files

### Rendering Pipeline

1. **Struct** (domain entity) → **ReStruct** (rendering structure)
2. **ReStruct** → **Render** (Raphael/Paper.js rendering)
3. **Render** → SVG output
4. User interactions → Tool handlers → Editor operations → Struct updates → Re-render

### Editor Operations

All editing operations go through the editor system:
- **Operation** - Base class for all operations
- **Action** - Composite operations with undo/redo support
- **History** - Undo/redo stack management
- **Tool** - User interaction handlers (bond tool, atom tool, etc.)

This architecture supports a complex chemical editor with excellent separation of concerns, testability, and extensibility.
