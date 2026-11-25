# Design

## Context

See `proposal.md` for the motivation and `specs/templates-and-groups/spec.md` for the observable contract. This document records the implementation already committed in `35ff3ba070`, rather than proposing additional product changes. The existing library is loaded asynchronously; replacing it during initialization must not discard templates added by an embedding application.

## Goals / Non-Goals

**Goals:** extend the existing parser, Redux template library, and template-placement tool; preserve initialization, disabled states, built-in shortcuts, and cleanup behavior.

**Non-Goals:** a toolbar configuration UI, database access inside Ketcher, automatic persistence, per-editor isolation within one window, runtime shortcut remapping, or a redesign of the preview service.

## Decisions

### Reuse the public API's parsing boundary

`Ketcher.addTemplate` validates the structure, name, and group, trims the name, and awaits `prepareStructToRender`. Only successful parsing publishes `KETCHER_ADD_TEMPLATE`. Calling `setMolecule` instead would modify the canvas, which violates the addition contract.

### Bridge the API to the existing template store

Store creation subscribes to the window-level event and dispatches `TMPL_ADD`. `AppStore.dispose` removes the listener and clears template state; `initApp` invokes it during cleanup. This preserves the submitted integration without introducing a React dependency into core. An instance-scoped subscription would improve isolation, but requires a separate integration design; the current shared-window behavior is documented explicitly.

### Track runtime membership across library replacement

The store appends runtime entries to `lib` and tracks their identities in `runtimeTemplates`. `TMPL_INIT` merges those identities with the initialized library, deletion removes both memberships, and storage writes exclude runtime entries. This prevents initialization races and accidental persistence without changing existing saved user templates. Redux DevTools sanitizers omit structure payloads from both runtime state and add actions.

### Derive the toolbar from the existing library

`TemplatesList` selects entries whose group is exactly `DB Templates`, otherwise it uses the built-in list. Runtime buttons use their structure and raw display name, preserve template action status, and suppress built-in shortcut labels. Horizontal scrolling and a fixed Structure Library control allow additional entries without limiting the list to the built-in icon count.

### Preserve the submitted preview integration

Each database-template preview uses `window.ketcher.generateImage` with serialized KET input. String results become SVG data URLs; Blob results use object URLs that are revoked on cleanup. Cancellation prevents late results from updating an unmounted preview. Library name fallbacks and group dictionaries also support runtime entries and names such as `constructor` without changing the existing translated UI labels.

## Risks / Trade-offs

- Shared-window events update every active editor in the window → document this behavior and use separate frames for independent libraries.
- Previews depend on `window.ketcher` and its configured service → document the integration requirement and retain button usability if image generation fails.
- One asynchronous preview request per template can be expensive for large libraries → retain cancellation and URL cleanup; performance at database scale has not been measured.
- Runtime entries exist in both the visible library and membership tracking → tests cover initialization, deletion, cleanup, and exclusion from persistence.
- Remote mode, macromolecules mode, and comprehensive format round trips are unverified → the PR states these validation limits. Existing standalone worker timeouts and the Windows build-config path mismatch are not claimed to be fixed.

## Migration Plan

No dependencies, saved-data migration, or format-version changes are required. Existing consumers retain the built-in toolbar until they populate `DB Templates`. Rollback reverts the feature and its documentation together; applications calling the new API must remove or guard those calls.

The feature owner was already updated in commit `10b94d1e49`. This retrospective change records that fact and leaves the existing owner file unchanged. Future archival should reconcile this delta with the owner rather than append duplicate requirements.

## Review map and PR size

At the PR base `c17ce0a9cd`, Danger counts 1,256 changed code lines: 727 in tests and 529 in application source. This is a manually implemented feature, not a toolchain upgrade or an 80% codemod change, so it does not qualify for the repository's large-scale-change protocol. The size warning remains applicable; this addendum does not hide it or add that label. Splitting the published PR requires maintainer agreement on separate API/library and toolbar delivery, and is not performed by this documentation correction.

Read the implementation in this order:

1. `packages/ketcher-core/src/application/ketcher.ts`: public API validation and parse-before-publish behavior.
2. `packages/ketcher-react/src/script/ui/state/index.ts`: event subscription, disposal, and DevTools serialization boundaries.
3. `packages/ketcher-react/src/script/ui/state/templates/index.ts`: initialization, runtime membership, deletion, and persistence.
4. `packages/ketcher-react/src/script/ui/views/toolbars/BottomToolbar/TemplatesList/TemplatesList.tsx`: runtime selection, action status, names, and preview cleanup.
5. `packages/ketcher-react/src/script/ui/views/toolbars/ToolbarGroupItem/ActionButton/ActionButton.tsx`: optional raw-title, custom-icon, and shortcut-display overrides.
6. `packages/ketcher-react/src/script/ui/views/toolbars/BottomToolbar/BottomToolbar.tsx`: scrolling layout and the Structure Library control.
7. `packages/ketcher-react/src/script/ui/utils/index.ts`: group-name handling and prototype-safe dictionary lookup.
