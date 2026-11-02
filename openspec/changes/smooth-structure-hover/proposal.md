# Proposal

## Why

Structure Selection currently highlights the atoms and bonds in a structure separately, leaving overlapping hover fills. A single smooth outline makes the hovered structure easier to distinguish and matches the established S-group hover treatment.

## What Changes

- Draw the hovered structure as one united outline in molecules mode with the Structure Selection tool.
- Preserve existing hover behavior for bond, atom, and fuse previews.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `selection`: specify the unified hover outline for structures under the Structure Selection tool.

## Impact

- `ketcher-core` fragment hover rendering and `ketcher-react` Structure Selection hover targeting.
- Unit and screenshot tests for the rendered hover appearance.
- No public API, serialization, or dependency changes.
