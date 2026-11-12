## Context

Clipboard paste and import placement need a temporary visual representation that follows the cursor without becoming part of the drawing model. Flex mode requires explicit placement, while snake and sequence modes retain their existing direct-placement behavior.

## Goals / Non-Goals

**Goals:**

- Reuse one placement tool for clipboard and import previews.
- Keep preview rendering separate from persisted entities and undo history.
- Place clipboard content as one undoable action and select it; place imported content without selecting it.
- Cancel outstanding asynchronous clipboard work when the user changes tools, layouts, or documents.

**Non-Goals:**

- Changing direct-paste behavior in snake or sequence mode.
- Changing **Open as New** or clipboard serialization formats.
- Adding a new dependency.

## Decisions

### Decision 1 — Render the detached structure through a separate renderer manager

The preview uses its own renderers and SVG group, registered as a transient view. This keeps preview entities out of the live model, exports, and history; the placement tool discards the preview when it is destroyed.

### Decision 2 — Share placement behavior while preserving caller-specific selection

Clipboard paste and **Add to Canvas** use the same cursor-following placement flow. The caller supplies whether placed entities should be selected, preserving the existing difference between paste and import.

### Decision 3 — Cancel paste work with an abort signal

An abort signal spans clipboard reads, text extraction, and format conversion. Mode and document transitions cancel both pending work and an active placement tool, preventing late results from restoring a cancelled preview.
