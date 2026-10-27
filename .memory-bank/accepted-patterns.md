# Accepted patterns

Patterns that an AI reviewer must not flag. Each entry says where the pattern appears, why the repo accepts it, and one example. A new instance of a pattern that is not listed here is reviewed as usual.

## Architecture

### Domain files that import from application

**Where:** 43 files under `packages/ketcher-core/src/domain/`, for example `packages/ketcher-core/src/domain/AttachmentPoint.ts`.
**Why it is accepted:** These imports predate rule R1 in review-rules.md. Moving them is a separate refactor. Flag only new imports of this kind.
**Example:** `import { provideEditorInstance } from 'application/editor/editorSingleton';` at `packages/ketcher-core/src/domain/AttachmentPoint.ts:1`.

## Naming

### `ReBondEndpoint.a`

**Where:** `a: BondEndpoint;` in `packages/ketcher-core/src/application/render/restruct/rebondEndpoint.ts:22`, and `a: Atom;` in the `ReAtom` class at `packages/ketcher-core/src/application/render/restruct/reatom.ts:87`.
**Why it is accepted:** The render objects use `a` for the wrapped model object. Renaming it is a cross-file change, not a fix for the reviewed diff, so do not flag the name as an abbreviation (R10 in review-rules.md).
**Example:** `const elem = Elements.get(this.a.label);` at `packages/ketcher-core/src/application/render/restruct/reatom.ts:1120`.

## React and UI

### Class components

**Where:** The 12 files that extend `Component` or `PureComponent`, all under `packages/ketcher-react/src/`, for example `packages/ketcher-react/src/script/ui/Portal/Portal.tsx`.
**Why it is accepted:** They predate rule R12 in review-rules.md. Do not ask for a conversion in a change that does not touch their logic. New UI code uses function components.
**Example:** `class Portal extends Component<Props> {` at `packages/ketcher-react/src/script/ui/Portal/Portal.tsx:34`.

## Tests

### Empty object pattern in Playwright fixtures

**Where:** Fixture definitions in `ketcher-autotests/tests/fixtures/`, for example `ketcher-autotests/tests/fixtures/utilsFixtures.ts:18` and `ketcher-autotests/tests/fixtures/commonPageObjectFixtures.ts:25`.
**Why it is accepted:** Playwright passes the fixtures object as the first argument of a fixture, and a fixture that uses no other fixture takes `{}` there. Lint passes on `utilsFixtures.ts`.
**Example:** `resetClipboard: async ({}, use) => {` at `ketcher-autotests/tests/fixtures/utilsFixtures.ts:18`.

### Raw getByTestId in existing specs

**Where:** 45 of the 309 spec files under `ketcher-autotests/tests/specs/`, for example `ketcher-autotests/tests/specs/Macromolecule-editor/Snake-Mode/snake-bond-tool.spec.ts:154-155`.
**Why it is accepted:** These calls predate rule R15 in review-rules.md, and their migration is pending. Flag raw calls in spec code that a change adds or rewrites. The conventions are in `.memory-bank/testing/testing.md`.
**Example:** `const flexModeButton = page.getByTestId('flex-layout-mode');` at `ketcher-autotests/tests/specs/Macromolecule-editor/Snake-Mode/snake-bond-tool.spec.ts:154`.

## Lint and types

### Underscore prefix on unused names

**Where:** Unused parameters and variables in `packages/ketcher-core/src/`, for example `packages/ketcher-core/src/application/render/restruct/refrag.ts:109`.
**Why it is accepted:** The lint config exempts names that start with `_` for arguments, variables, and caught errors (`eslint.config.mjs:117-123`). Do not ask to drop the prefix.
**Example:** `draw(_render: Render): null {` at `packages/ketcher-core/src/application/render/restruct/refrag.ts:109`.

### Empty function bodies

**Where:** No-op callbacks and defaults in `packages/ketcher-react/src/`, for example `packages/ketcher-react/src/MicromoleculesEditor.tsx:51`.
**Why it is accepted:** `@typescript-eslint/no-empty-function` is off (`eslint.config.mjs:112`), and a no-op default is intentional.
**Example:** `const setServerRef = useRef<(structService: Api) => void>(() => {});` at `packages/ketcher-react/src/MicromoleculesEditor.tsx:51`.

### interface and type aliases for object shapes

**Where:** Object shapes across `packages/ketcher-core/src/domain/`.
**Why it is accepted:** The repo uses both forms, and no lint rule or doc prefers one. Do not ask to convert either.
**Example:** `export interface AtomProperties {` at `packages/ketcher-core/src/domain/entities/CoreAtom.ts:20`, and `export type Neighbor = {` at `packages/ketcher-core/src/domain/entities/struct.ts:52`.

## Dependencies

### lodash imports

**Where:** `lodash` is a declared dependency of all four packages, for example `packages/ketcher-core/package.json:57`, and source files under `packages/` import it in 84 files.
**Why it is accepted:** It is an existing dependency, so using it adds nothing new to review. Do not flag it as a library the project does not use.
**Example:** `import { isNumber, uniqueId } from 'lodash';` at `packages/ketcher-core/src/application/ketcher.ts:70`.

## Commits and agents

### Unattended ticket agents commit and open pull requests

**Where:** `.claude/agents/ticket-implementer.md` (section 3, "Open the PR", line 33), `.claude/agents/ticket-sweep.md`, and `.claude/skills/handle-tickets/SKILL.md`.
**Why it is accepted:** This is a decided exception to the rule that agents ask before they commit. It covers these three unattended agents only. Every other agent still asks first.
**Example:** `.claude/agents/ticket-implementer.md:33` directs the agent to open the PR, with its commit and push done unattended.
