## Context

The _Edit All_ menu item comes from the monomer-creation part of the macromolecules context menus (`useMonomerCreationMenu`), shared by the selected-monomers menu (Flex and Snake) and the sequence-item menu. On hover it called `highlightMonomers`, which turned on each monomer's hover state and redrew it, and returned a function that restored it.

_Modify amino acids_ marks its monomers through the transient drawing layer: `transientDrawingView.showModifyAminoAcidsView({ monomersToModify })`, then `update()`, and the matching hide on mouse-out. That view draws a ring of the selection radius around each monomer in Flex and Snake, and a tile behind each symbol in Sequence mode. Nothing in it is specific to peptides, and every monomer of a sequence node shares the node's renderer, so it marks monomers of any class.

## Goals / Non-Goals

**Goals:**

- Mark the monomers _Edit All_ will change with the same indicator as _Modify amino acids_, in Flex, Snake and Sequence modes.
- Keep every existing hide path: pointer leaving the item, menu closing, choosing the item, unmounting the menu.

**Non-Goals:**

- Changing which monomers _Edit All_ targets, or when the item is enabled.
- Changing the indicator itself or how _Modify amino acids_ uses it.
- Renaming the transient view to a generic name.

## Decisions

### Decision 1: Reuse the existing transient view

`highlightMonomers` takes the editor and shows the existing view, returning a function that hides it. The caller keeps the returned clean-up as before, so the hide paths do not change.

**Alternative considered**: a new transient view for _Edit All_. Rejected: the requirement is the same indicator, and a second view would duplicate its drawing code.

### Decision 2: Keep the view's name

The view stays `ModifyAminoAcidsView`. A generic name would read better now that two items use it, but renaming moves the change into `ketcher-core` (class, params type, manager methods, editor call site) for no behaviour change.

## Risks / Trade-offs

- Both menu items show the view under one name. Only one menu item can be hovered at a time, and every path hides the view on leave or close, so they do not overwrite each other.
- In Sequence mode the tile covers the symbol, as it already does for _Modify amino acids_.
