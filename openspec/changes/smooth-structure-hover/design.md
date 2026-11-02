# Design

## Context

Structure Selection finds a fragment as the hover target. Fragment rendering previously delegated hover styling to individual atoms and bonds, producing overlapping plates. The rendering layer already supports creating hover plates for atoms and bonds and combining their paths.

## Goals / Non-Goals

**Goals:**

- Render one united outline for a hovered fragment.
- Keep other hover targets and merge previews unchanged.

**Non-Goals:**

- Change selection, drag, fuse, or export behavior.
- Change hover behavior in macromolecules mode.

## Decisions

- Keep the fragment as the hover target and render its combined path in the fragment renderer. This keeps Structure Selection distinct from merge previews; routing fragments through the existing `merge` hover path changes the preview semantics and styling.
- Build the path from the hovered fragment's atom and internal-bond hover plates, then apply the configured hover style to the combined path. This reuses existing geometry and styling rather than introducing a second outline algorithm.

## Risks / Trade-offs

- [Path union can produce no path for an empty fragment] → Return without drawing when there are no combined paths; empty fragments are not expected to persist.
- [Other fragment hover consumers may observe the united appearance] → Retain fragment-level hover as the shared behavior and verify Structure Selection with its focused rendering and editor tests.

## Migration Plan

No migration is required. The change is a reversible rendering-only update.

## Open Questions

None.
