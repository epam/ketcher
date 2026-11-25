# Proposal

## Why

Chemists need frequently used molecular fragments directly on the bottom toolbar, while the built-in set cannot suit every project. Issue [#12722](https://github.com/epam/ketcher/issues/12722) requests configurable templates, including structures supplied from a database or JSON configuration.

## What Changes

- Add the public asynchronous `ketcher.addTemplate(structure, name, group?)` API for named, session-only molecular templates, with `User Templates` as the default group.
- Parse and validate input before adding it to the library, without placing anything on the canvas.
- Display `DB Templates` on the bottom toolbar in insertion order instead of the built-in templates, with horizontal scrolling and a visible Structure Library button.
- Preserve runtime templates during asynchronous library initialization and settings reloads, and release their subscriptions on editor cleanup.
- Document session lifetime, the shared-window event bridge, and the `window.ketcher` preview dependency.
- Keep UI-based toolbar configuration, backend persistence, and runtime shortcut mapping outside this change.

## Capabilities

### New Capabilities

None. Runtime templates extend the existing template-library capability.

### Modified Capabilities

- `templates-and-groups`: Add runtime template configuration, bottom-toolbar selection, validation, and lifecycle scenarios. The behavior owner is `.memory-bank/features/templates-and-groups.md`.

## Impact

- `packages/ketcher-core`: additive public API using the existing structure parser.
- `packages/ketcher-react`: template store, editor cleanup, library name display, bottom-toolbar rendering, and preview cleanup.
- Tests cover the API, library initialization and persistence boundaries, toolbar behavior, group names, and disposal. The existing standalone browser verification demonstrates placement and structure export.
- No new dependencies, storage migration, structure-format change, or shortcut-configuration API.
- This specification is supplied retrospectively for the implementation already in PR [#12886](https://github.com/epam/ketcher/pull/12886). The feature owner was already updated in commit `10b94d1e49`; the delta records the addition relative to the PR base and does not request a second implementation.
