## 1. Context Menu Item Renaming and Restructure

- [ ] 1.1 Rename "Edit Instance" → "Edit Monomer" in `MacromoleculeMenuItems.tsx` and update its `data-testid`
- [ ] 1.2 Rename "Edit All Instances" → "Edit All [code] (n)" in `MacromoleculeMenuItems.tsx`: compute the monomer code and total canvas count and render them in the label (code in bold)
- [ ] 1.3 Restructure the item order and add `<Separator />` elements to match the specified layout: Expand/Collapse → Remove Grouping — Create Monomer — Edit Monomer / Edit All — Delete

## 2. "Remove Grouping" Item

- [ ] 2.1 Create `useRemoveGrouping.ts` hook in `packages/ketcher-react/src/script/ui/views/components/ContextMenu/hooks/` that calls `fromSgroupDeletion()` for each selected monomer SGroup (mirrors `useFunctionalGroupRemove.ts`)
- [ ] 2.2 Add the "Remove Grouping" menu item to `MacromoleculeMenuItems.tsx` with enabled/disabled logic: enabled when right-clicking a non-selected monomer, or when the selection contains at least one monomer
- [ ] 2.3 Verify that removing grouping on a collapsed monomer results in the monomer being expanded before the abbreviation is deleted

## 3. "Create Monomer" Item in Monomer Menu

- [ ] 3.1 Add the "Create Monomer" item to `MacromoleculeMenuItems.tsx` wired to `editor.openMonomerCreationWizard()`
- [ ] 3.2 Implement visibility logic: "Create Monomer" is visible only when the selection contains multiple monomers, or exactly one monomer combined with a non-monomer chemical structure
- [ ] 3.3 Update `MacromoleculeContextMenuProps` in `contextMenu.types.ts` if additional selection metadata is needed to determine "Create Monomer" visibility

## 4. "Edit Monomer" Disabled State and Tooltip

- [ ] 4.1 Implement enabled/disabled state for "Edit Monomer": enabled only when exactly one monomer is in context; disabled when the selection contains more than one monomer
- [ ] 4.2 Add a tooltip to the disabled "Edit Monomer" item (tooltip text per UX specification when available)

## 5. "Edit All [code] (n)" — Label, Count, and Hover Highlighting

- [ ] 5.1 At menu-open time, compute the total count of matching monomers on the canvas (by monomer code, not just selected) and pass it to the menu item label
- [ ] 5.2 Render the monomer code in bold within the "Edit All" label
- [ ] 5.3 Implement `onMouseEnter` / `onMouseLeave` handlers on the "Edit All" menu item that apply a hover highlight CSS class to all matching monomer instances on the canvas

## 6. "Edit All" Confirmation Modal

- [ ] 6.1 Verify that `editor.events.openConfirmationDialog` is accessible from within `ketcher-react` context menu hooks; if not, implement an alternative dialog in `ketcher-react`
- [ ] 6.2 Wire the "Edit All [code] (n)" click handler to dispatch `openConfirmationDialog` with title "Editing monomers" and body "You are going to edit (n) monomers. Are you sure?"
- [ ] 6.3 Only open the monomer creation wizard after the user confirms with "Yes"; do nothing on "Cancel"
- [ ] 6.4 Ensure the count (n) in the modal body matches the count in the menu item label

## 7. "Delete" Item

- [ ] 7.1 Add the "Delete" menu item to `MacromoleculeMenuItems.tsx`; it must always be visible and enabled
- [ ] 7.2 Wire "Delete" to delete the right-clicked monomer plus all other currently selected elements

## 8. Type and Constant Updates

- [ ] 8.1 Update `MacromoleculeContextMenuProps` in `contextMenu.types.ts` to carry any new props required (total monomer count, selection metadata for "Create Monomer")
- [ ] 8.2 Update `ContextMenuTrigger.utils.ts` (`getMenuPropsForClosestItem` / `getMenuPropsForSelection`) to compute and pass the new props when routing to `FOR_MACROMOLECULE`
- [ ] 8.3 Add new `data-testid` constants to `ketcher-autotests/tests/pages/constants/contextMenu/Constants.ts` for all new/renamed menu items: `Edit Monomer`, `Edit All`, `Remove Grouping`, `Create Monomer`, `Delete` (monomer variant)

## 9. Testing

- [ ] 9.1 Write E2E tests (Playwright) for right-clicking a single non-selected monomer — verify full menu structure and item order
- [ ] 9.2 Write E2E tests for "Edit Monomer" enabled/disabled state based on single vs. multi-monomer selection
- [ ] 9.3 Write E2E tests for "Edit All [code] (n)" label content (bold code + correct count) and confirmation modal flow (Yes / Cancel)
- [ ] 9.4 Write E2E tests for "Remove Grouping" — verify grouping is removed and collapsed monomers are expanded
- [ ] 9.5 Write E2E tests for "Create Monomer" visibility conditions (single monomer alone → hidden; multi-monomer selection → visible)
- [ ] 9.6 Write E2E tests for "Delete" — verify deletion of the right-clicked monomer and full selection
