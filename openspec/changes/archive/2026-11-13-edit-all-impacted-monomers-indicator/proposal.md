## Why

Hovering _Edit All [code] (count)_ in the macromolecules context menu shows which monomers the edit will change by putting them into their normal hover state. On some monomer shape colours that highlight is barely visible, and in Sequence mode it looks different from the other indicators. _Modify amino acids_ already marks the monomers it will change with a dedicated indicator, and #12191 asks to reuse it.

## What Changes

- Hovering _Edit All [code] (count)_ marks every monomer it will edit with the _Modify amino acids_ indicator: a ring around each monomer in Flex and Snake modes, a highlighted tile behind each symbol in Sequence mode.
- The monomers' own hover state is no longer changed by hovering the menu item.
- The marks disappear when the pointer leaves the item, when the menu closes, and when the item is chosen. A disabled item marks nothing, as before.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `macromolecules`: the hover indication of _Edit All_ in the requirement "Editing canvas monomers".

## Impact

- **`ketcher-macromolecules`**: the Edit All hover helper in the context menu shows the existing transient view instead of setting hover state.
- **`ketcher-core`**: none. The transient view used by _Modify amino acids_ is reused unchanged.
- No format, API or saved-state change. One E2E screenshot baseline (the Edit All hover test of the monomer-editing spec) changes.
