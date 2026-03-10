# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ketcher** is an open-source web-based chemical structure editor for drawing and editing molecular structures, reactions, and macromolecules. Built with TypeScript, React, and Redux, it follows an MVC architecture pattern with clean architecture principles.

**📐 For detailed architecture documentation, see [architecture.md](./architecture.md)**

## Monorepo Structure

This is an **npm workspaces** monorepo with 4 core packages:

1. **ketcher-core** - Domain logic (no UI dependencies)
2. **ketcher-standalone** & **ketcher-react** (parallel build)
3. **ketcher-macromolecules** - Polymer/RNA editor

**Build order**: core → standalone/react → macromolecules

Additional workspaces: `example/`, `demo/`, `ketcher-autotests/`, `example-ssr/`, `example-separate-editors/`

## Prerequisites

- **Node.js >= 22**
- **npm >= 7**
- **IMPORTANT**: This project switched from Yarn to npm. Do not use Yarn.

## Common Commands

### Installation
```bash
# ALWAYS run from root directory
npm install
```

### Building

```bash
# Build all packages and example
npm run build

# Build individual packages (in dependency order)
npm run build:core
npm run build:standalone  # or build:react (can run in parallel)
npm run build:macromolecules
npm run build:packages    # All packages in correct order
npm run build:example
npm run build:demo
```

### Development

**Quick start with Vite (recommended for development):**
```bash
cd example
npm run dev:standalone  # Standalone mode
npm run dev:remote      # Remote mode (with Indigo service)
```

**Development with watch mode (for library development):**
```bash
# Terminal 1: Watch ketcher-core
cd packages/ketcher-core
npm start

# Terminal 2: Watch ketcher-react (or ketcher-standalone)
cd packages/ketcher-react
npm start

# Terminal 3: Watch ketcher-standalone
cd packages/ketcher-standalone
npm start

# Terminal 4: Start example app with Webpack
cd example
npm run start:standalone  # or start:remote
```

**IMPORTANT**: Vite is used for fast development, but react-app-rewired (Webpack) is used for production builds. Always verify changes work with Webpack (`npm run build`) before creating PRs.

### Serving Built Application

```bash
npm run serve:remote      # Serve with remote Indigo service
npm run serve:standalone  # Serve standalone version
npm run serve            # Serve both
npm run serve:demo       # Serve demo
```

### Testing

```bash
# Run all tests (prettier, eslint, types, unit) for all packages
npm run test

# Run type checking across all workspaces
npm run test:types

# Run unit tests in specific package
cd packages/ketcher-core
npm run test:unit

# Run settings tests specifically
cd packages/ketcher-core
npm run test:unit -- src/application/settings

cd packages/ketcher-react
npm run test:unit -- hooks/__tests__/useSettings.test.tsx
npm run test:unit -- __tests__/settings-integration.test.tsx

# Run E2E tests with Playwright
cd ketcher-autotests
npm run test
npm run test:debug       # Debug mode
npm run test:update      # Update snapshots
npm run test:trace       # With trace
```

### Code Quality

```bash
# Linting
npm run test:eslint              # From package directory
npm run test:eslint:fix          # Auto-fix issues

# Prettier
npm run prettier:write           # Format code

# Stylelint (for packages with CSS/LESS)
npm run test:stylelint
npm run stylelint:fix
```

## Architecture & Domain Concepts

**For complete architectural details, see [architecture.md](./architecture.md)** - covers entry points, module boundaries, dependencies, build system, and technology stack.

### MVC Pattern

- **Model**: Chemical objects (atoms, bonds, molecules, reactions, monomers) with coordinates in **Angstrom-like units**
- **View**: SVG-based rendering (Raphael.js legacy, Paper.js modern)
- **Controller**: User actions, tools (atom tool, bond tool, selection, etc.), interaction logic

### State Management

- **ketcher-react**: Classic Redux with Redux Thunk
- **ketcher-macromolecules**: Redux Toolkit with Redux Saga
- **IMPORTANT**: Never mutate Redux state directly - use immutable patterns
- Atoms and bonds use **Ketcher's internal IDs**, not arbitrary numbers

### Core Architecture (Clean Architecture)

**ketcher-core** follows clean architecture with three layers:
- `domain/` - Chemical entities, serializers, pure business logic
- `application/` - Editor operations, formatters, rendering engine, **settings service**
- `infrastructure/` - External service implementations (Indigo service)

### Settings Architecture (NEW - 2026-03)

**Centralized settings management** moved from ketcher-react to ketcher-core:

- **Location**: `packages/ketcher-core/src/application/settings/`
- **Service**: `SettingsService` - Instance-based, event-driven, platform-agnostic
- **Storage**: Pluggable adapters (LocalStorage, Memory, custom)
- **Validation**: Ajv JSON Schema with strict type checking


**Settings Categories:**
- `editor` - Editor behavior (rotation, selection, warnings)
- `render` - Visual rendering (colors, fonts, bonds, atoms)
- `server` - Server communication options
- `debug` - Debug visualization flags
- `miew` - 3D viewer settings
- `macromolecules` - Polymer/RNA editor settings

**Access via Ketcher instance:**
```typescript
const settings = ketcher.settings.getSettings();
await ketcher.settings.updateSettings({ rotationStep: 30, atomColoring: false });
await ketcher.settings.loadPreset('acs');
```

**React Integration:**
```typescript
const { settings, updateSettings, loadPreset } = useSettings();
```

**Bidirectional Sync Pattern:**
- Core SettingsService is source of truth
- React hook subscribes to core events
- Updates sync to Redux for backward compatibility
- No infinite loops via careful event handling

### Chemical Format Support

Supports 10+ formats including Molfile V2000/V3000, KET (native), SMILES/SMARTS, InChI, CDX/CDXml, CML, RXN, SDF, FASTA, HELM. See [architecture.md](./architecture.md) for complete list.

### Indigo Service

Ketcher uses the **Indigo Service** for server-side operations (structure cleanup, layout, aromatization, format conversion). Configure via:
- `apiPath` prop on `<Editor>` component
- Query parameter: `?api_path=<indigo-service-url>`

## TypeScript Standards

- Use **strict mode** TypeScript
- Prefer union types, mapped types, and generics over `any`
- Do not use React class components (use functional components)
- Follow existing patterns in the codebase

## Code Patterns to Follow

### DO:
- Use pure functions for calculations and transformations
- Maintain immutability when working with model objects
- Reference existing Ketcher services, helpers, actions, and controllers
- Keep coordinates in Angstrom units
- Use Ketcher's internal atom/bond IDs
- Provide clear comments for complex chemical logic (stereochemistry, valence, etc.)
- Use `await` with `KetcherBuilder.build()` - it's async (changed 2026-03)
- Access settings via `ketcher.settings` or `useSettings()` hook (not Redux directly)
- Subscribe to settings changes via `settingsService.subscribe()` for reactive updates
- Use `DeepPartial<Settings>` for partial settings updates

### DO NOT:
- Mutate Redux state directly
- Introduce new libraries without discussion (project uses specific versions)
- Use React class components
- Use "magic numbers" without explanation
- Simplify chemical logic incorrectly (stereochemistry, valence validation)
- Violate MVC boundaries (controller should not manipulate model internals directly)
- Make changes requiring other libraries (e.g., MobX, RxJS, jQuery)
- Update settings directly in Redux - use SettingsService or useSettings() hook
- Create infinite update loops when syncing between Core and Redux

## Important Notes

- **Build order matters**: Always build `ketcher-core` first, then `ketcher-react`/`ketcher-standalone`, then `ketcher-macromolecules`
- **npm only**: Project no longer uses Yarn
- **Async build() (BREAKING CHANGE - 2026-03)**: `KetcherBuilder.build()` is now async. Use `await builder.build()` instead of `builder.build()`
- **Settings**: Centralized in ketcher-core. Use `ketcher.settings` API or `useSettings()` hook. See `packages/ketcher-core/src/application/settings/README.md` for complete documentation
- **Macromolecules mode**: Can be disabled with `disableMacromoleculesEditor` prop on `<Editor>` component
- **Custom buttons**: Can add custom toolbar buttons via `customButtons` prop and listen to `CUSTOM_BUTTON_PRESSED` events
- **API methods**: Ketcher exposes methods like `getSmiles()`, `getMolfile()`, `setMolecule()`, `addFragment()`, etc.
- **Events**: Can subscribe to `'change'` and `'libraryUpdate'` events via `ketcher.editor.subscribe()`

## File Locations

- Package sources: `packages/{package-name}/src/`
- Example applications: `example/`, `demo/`
- E2E tests: `ketcher-autotests/`
- Build outputs: `packages/{package-name}/dist/`

## References

- **[architecture.md](./architecture.md)** - Complete architecture analysis: entry points, modules, dependencies, build system
- **[packages/ketcher-core/src/application/settings/README.md](./packages/ketcher-core/src/application/settings/README.md)** - Settings module documentation with API reference, examples, and best practices
- README.md - User-facing documentation and API reference
- DEVNOTES.md - Detailed development setup and build instructions
- .github/copilot-instructions.md - Code generation guidelines and patterns
- KET_FORMAT_SPECIFICATION.md - Complete specification for the KET (Ketcher) JSON format
- KETCHER_API_SPECIFICATION.md - Complete JavaScript API specification with methods, events, and examples
- EXECUTIVE_SUMMARY.md - Settings refactoring project summary (business value, metrics, deployment)
- SETTINGS_REFACTORING_COMPLETE.md - Complete technical documentation of settings refactoring project
