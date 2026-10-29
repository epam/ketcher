# Drag-Drop Bond Establishment

Building polymer chains required the user to drag a monomer from the library to place it, then manually draw a bond with the Bond tool. This two-step flow was slow when assembling long sequences. This feature extends drag-and-drop so that releasing a dragged item near a free attachment point automatically creates a polymer bond.

Spec: [openspec/specs/drag-drop-bond-establishment/spec.md](../../openspec/specs/drag-drop-bond-establishment/spec.md)

## Limitations

- In Flex mode the dropped monomer is snapped to bond-length distance from the target; it does not land exactly at the cursor position.
- Hydrogen bonds cannot be established via drag-drop.
- Drag-drop bonding is only available between library items and canvas monomers, not between two existing canvas monomers.

## Related

- Feature: [macromolecules](./macromolecules.md)
- Feature: [monomer-replacement-drag-drop](../../openspec/changes/archive/2026-08-13-monomer-replacement-drag-drop/)
- Module: [editor-engine](../modules/editor-engine.md)
