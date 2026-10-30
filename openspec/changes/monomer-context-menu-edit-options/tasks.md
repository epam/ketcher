## 1. Context Menu Item Renaming and Restructure

- [x] 1.1 Rename "Edit Instance" → "Edit Monomer" in `MacromoleculeMenuItems.tsx` and update its `data-testid`
- [x] 1.2 Rename "Edit All Instances" → "Edit All [code] (n)" in `MacromoleculeMenuItems.tsx`: compute the monomer code and total canvas count and render them in the label (code in bold)
- [x] 1.3 Restructure the item order and add `<Separator />` elements to match the specified layout: Expand/Collapse → Remove Grouping — Create Monomer — Edit Monomer / Edit All — Delete

## 2. "Remove Grouping" Item

- [x] 2.1 Create `useRemoveGrouping.ts` hook in `packages/ketcher-react/src/script/ui/views/components/ContextMenu/hooks/` that calls `fromSgroupDeletion()` for each selected monomer SGroup (mirrors `useFunctionalGroupRemove.ts`)
- [x] 2.2 Add the "Remove Grouping" menu item to `MacromoleculeMenuItems.tsx` with enabled/disabled logic: enabled when right-clicking a non-selected monomer, or when the selection contains at least one monomer
- [x] 2.3 Verify that removing grouping on a collapsed monomer results in the monomer being expanded before the abbreviation is deleted

## 3. "Create Monomer" Item in Monomer Menu

- [x] 3.1 Add the "Create Monomer" item to `MacromoleculeMenuItems.tsx` wired to `editor.openMonomerCreationWizard()`
- [x] 3.2 Implement visibility logic: "Create Monomer" is visible only when the selection contains multiple monomers, or exactly one monomer combined with a non-monomer chemical structure
- [x] 3.3 Update `MacromoleculeContextMenuProps` in `contextMenu.types.ts` if additional selection metadata is needed to determine "Create Monomer" visibility

## 4. "Edit Monomer" Disabled State and Tooltip

- [x] 4.1 Implement enabled/disabled state for "Edit Monomer": enabled only when exactly one monomer is in context; disabled when the selection contains more than one monomer
- [x] 4.2 Add a tooltip to the disabled "Edit Monomer" item (tooltip text per UX specification when available)

## 5. "Edit All [code] (n)" — Label, Count, and Hover Highlighting

- [x] 5.1 At menu-open time, compute the total count of matching monomers on the canvas (by monomer code, not just selected) and pass it to the menu item label
- [x] 5.2 Render the monomer code in bold within the "Edit All" label
- [x] 5.3 Implement `onMouseEnter` / `onMouseLeave` handlers on the "Edit All" menu item that apply a hover highlight CSS class to all matching monomer instances on the canvas

## 6. "Edit All" Confirmation Modal

- [x] 6.1 Verify that `editor.events.openConfirmationDialog` is accessible from within `ketcher-react` context menu hooks; if not, implement an alternative dialog in `ketcher-react`
- [x] 6.2 Wire the "Edit All [code] (n)" click handler to dispatch `openConfirmationDialog` with title "Editing monomers" and body "You are going to edit (n) monomers. Are you sure?"
- [x] 6.3 Only open the monomer creation wizard after the user confirms with "Yes"; do nothing on "Cancel"
- [x] 6.4 Ensure the count (n) in the modal body matches the count in the menu item label

## 7. "Delete" Item

- [x] 7.1 Add the "Delete" menu item to `MacromoleculeMenuItems.tsx`; it must always be visible and enabled
- [x] 7.2 Wire "Delete" to delete the right-clicked monomer plus all other currently selected elements

## 8. Type and Constant Updates

- [x] 8.1 Update `MacromoleculeContextMenuProps` in `contextMenu.types.ts` to carry any new props required (total monomer count, selection metadata for "Create Monomer")
- [x] 8.2 Update `ContextMenuTrigger.utils.ts` (`getMenuPropsForClosestItem` / `getMenuPropsForSelection`) to compute and pass the new props when routing to `FOR_MACROMOLECULE`
- [x] 8.3 Add new `data-testid` constants to `ketcher-autotests/tests/pages/constants/contextMenu/Constants.ts` for all new/renamed menu items: `Edit Monomer`, `Edit All`, `Remove Grouping`, `Create Monomer`, `Delete` (monomer variant)

## 10. "Edit All" and "Remove Grouping" Disabled State for Unknown and Ambiguous Monomers

- [x] 10.1 Add `unknownOrAmbiguousMonomer` flag to `MacromoleculeMenuItems.tsx`: true when the sgroup is not a `MonomerMicromolecule`, or the monomer is ambiguous (`isAmbiguousMonomerLibraryItem`), or the monomer is unresolved (`props.unresolved`)
- [x] 10.2 Apply `disabled={unknownOrAmbiguousMonomer}` and a tooltip to the "Edit All" `<Item>` component
- [x] 10.3 Apply `disabled={unknownOrAmbiguousMonomer}` and a tooltip to the "Remove Grouping" `<Item>` component

## 9. Testing

- [x] 9.1 Write E2E tests (Playwright) for right-clicking a single non-selected monomer — verify full menu structure and item order
- [x] 9.2 Write E2E tests for "Edit Monomer" enabled/disabled state based on single vs. multi-monomer selection
- [x] 9.3 Write E2E tests for "Edit All [code] (n)" label content (bold code + correct count) and confirmation modal flow (Yes / Cancel)
- [x] 9.4 Write E2E tests for "Remove Grouping" — verify grouping is removed and collapsed monomers are expanded
- [x] 9.5 Write E2E tests for "Create Monomer" visibility conditions (single monomer alone → hidden; multi-monomer selection → visible)
- [x] 9.6 Write E2E tests for "Delete" — verify deletion of the right-clicked monomer and full selection
