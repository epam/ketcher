## Context

`useBondSGroupEdit` decides whether **Edit S-Group...** is shown: in `disabled` (which react-contexify calls before `hidden`) it stores `bond.getAttachedSGroups(struct)`, the S-groups that contain both atoms of the bond, and `hidden` reads them. Removing an S-group without touching its atoms is what `fromSgroupDeletion` already does for the Eraser (`eraser.ts`, branch for `sgroups` and `sgroupData`).

## Goals / Non-Goals

**Goals:**

- One menu item that removes the S-group under the right-clicked bond, keeping atoms and bonds.
- The same visibility rules as **Edit S-Group...**, so the two items always appear together.
- A **Remove** button in the S-Group Properties dialog for an existing S-group.

**Non-Goals:**

- Changing the atoms of an S-group. There is no agreed UI for it yet.
- The atom context menu. #2347 adds S-group items there; **Remove S-Group** can follow once it is merged.

## Decisions

### Decision 1: A new hook next to `useBondSGroupEdit`

`useBondSGroupRemove` returns `[handler, disabled, hidden]` like `useBondSGroupEdit`. The handler calls `editor.update(fromSgroupDeletion(restruct, id))`, then clears the selection and refocuses the canvas, as `useAttachmentGroupDelete` does, so the selection never points at the removed S-group.

Alternative considered: put remove into `useBondSGroupEdit`. Rejected because one hook would then return two handlers with different rules for functional groups and monomers.

### Decision 2: Functional groups and monomers are excluded

The Eraser does not delete these directly either: it opens the confirmation dialog that belongs to them. Their context menus already offer **Remove Abbreviation** and **Remove Grouping**, so the bond menu hides **Remove S-Group** for them instead of offering a second path without that dialog.

### Decision 3: No confirmation

Removing the S-group keeps every atom and bond and can be undone in one step, like **Remove Abbreviation** from the functional group menu.

### Decision 4: The dialog returns a remove result

`SGroupTool.sgroupDialog` passes `canRemove` to the dialog when it is opened for an existing S-group. The button resolves the dialog with `{ remove: true }`, and `sgroupDialog` then calls `fromSgroupDeletion` instead of applying the form. The dialog does not open for monomers and generic S-groups, so they get no button.

Alternative considered: delete from inside the dialog component. Rejected because the dialog has no S-group id and all other results of this dialog are applied in `sgroupDialog`.

## Risks / Trade-offs

- The hook duplicates the bond lookup from `useBondSGroupEdit`. #2347 moves that lookup into shared hooks; when both land, **Remove S-Group** should move onto them too.
