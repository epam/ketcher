## Why

Users cannot find a way to remove an S-group once it is added, while keeping its atoms and bonds (#4677). The Eraser does this when the user clicks the S-group's bracket or data label, but nothing in the menus or the S-Group Properties dialog points to it. The bond context menu already offers **Attach S-Group...** and **Edit S-Group...** (#1996); it should also offer **Remove S-Group**, and the S-Group Properties dialog should offer removal too, as the issue asks.

## What Changes

- The bond context menu in Molecules mode gets **Remove S-Group**, placed after **Edit S-Group...**.
- It deletes the S-group that contains the bond and keeps its atoms and bonds. It is one undo step.
- It is shown and enabled by the same rules as **Edit S-Group...**: hidden when the bond is in no S-group or in a superatom without a label, disabled when the bond is in more than one S-group or when several bonds are in the menu.
- It is hidden for functional groups and monomers, which have their own items (**Remove Abbreviation**, **Remove Grouping**), and disabled while the monomer creation wizard is open.
- The S-Group Properties dialog gets a **Remove** button when it is opened for an existing S-group. It removes that S-group and keeps its atoms and bonds.
- New translation keys `components:contextMenu.removeSGroup` and `dialogs:toolbox.sgroupDialog.removeButton` in every locale.

Out of scope, left for a follow-up on #4677: changing which atoms belong to an existing S-group, and the atom context menu (its S-group items are added by #2347).

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `templates-and-groups`: adds a requirement for removing an S-group from the bond context menu.

## Impact

- `ketcher-react`: `ContextMenu/menuItems/BondMenuItems.tsx`, new `ContextMenu/hooks/useBondSGroupRemove.ts`, `dialog/toolbox/sgroup.tsx`, `editor/tool/sgroup.ts`, `locales/*/components.json`, `locales/*/dialogs.json`.
- Uses the existing `fromSgroupDeletion` action. No `ketcher-core` change, no file format change, no public API change.
