/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { ExtendedTableButton } from '@tests/pages/constants/extendedTableWindow/Constants';
import {
  ExtendedTableDialog,
  selectExtendedTableElement,
} from '@tests/pages/molecules/canvas/ExtendedTableDialog';
import { takeEditorScreenshot, takeElementScreenshot } from '@utils/canvas';
import {
  clickOnMiddleOfCanvas,
  moveMouseAway,
  pasteFromClipboardAndOpenAsNewProject,
  waitForRender,
} from '@utils/index';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MicroAtomOption } from '@tests/pages/constants/contextMenu/Constants';
import { AtomPropertiesDialog } from '@tests/pages/molecules/canvas/AtomPropertiesDialog';
import { AtomType } from '@tests/pages/constants/atomProperties/Constants';

let page: Page;
test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

test(
  '1. Verify that the star atom is added to the special nodes section of the extended table and tooltip text for the star atom reads: Any atom, including hydrogen',
  { tag: ['@chromium-popup'] },
  async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5553
     * Description: Verify that the star atom is added to the special nodes section of the extended table
     *              and tooltip text for the star atom reads: "Any atom, including hydrogen."
     * Case:
     *      1. Open Extended table dialog
     *      2. Hover mouse over * star atom in the special nodes section
     *      3. Validate that the tooltip text reads: "Any atom, including hydrogen."
     */
    await RightToolbar(page).extendedTable();
    const starAtomButton = page.getByTestId(ExtendedTableButton.STAR);
    await starAtomButton.hover();
    await expect(starAtomButton).toHaveAttribute(
      'title',
      'Any atom, including hydrogen',
    );
    await ExtendedTableDialog(page).cancel();
  },
);

test(
  '2. Verify the reorganization of the special nodes section of the extended table matches the mockup',
  { tag: ['@chromium-popup'] },
  async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5553
     * Description: Verify the reorganization of the special nodes section of the extended table matches the mockup
     * Case:
     *      1. Open Extended table dialog
     *      2. Take a screenshot of the extended table dialog to validate the UX
     */
    await RightToolbar(page).extendedTable();
    await takeElementScreenshot(
      page,
      ExtendedTableDialog(page).extendedTableWindow,
    );
    await ExtendedTableDialog(page).cancel();
  },
);

test(
  '3. Verify the star atom can be added to the canvas using the extended table',
  { tag: ['@chromium-popup'] },
  async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5553
     * Description: Verify the star atom can be added to the canvas using the extended table
     * Case:
     *      1. Add star atom to the canvas using the extended table dialog
     *      2. Take a canvas screenshot to validate it is added correctly
     */
    await CommonTopRightToolbar(page).setZoomInputValue('400');
    await selectExtendedTableElement(page, ExtendedTableButton.STAR);
    await clickOnMiddleOfCanvas(page);
    await page.keyboard.press('Escape');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  },
);

test(
  '4. Verify the star atom can be added to the canvas using the hotkey (Shift+8)',
  { tag: ['@chromium-popup'] },
  async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5553
     * Description: Verify the star atom can be added to the canvas using the hotkey (Shift+8)
     * Case:
     *      1. Add star atom to the canvas using Shift+8 hotkey
     *      2. Take a canvas screenshot to validate it is added correctly
     */
    await CommonTopRightToolbar(page).setZoomInputValue('400');
    await page.keyboard.press('Shift+8');
    await clickOnMiddleOfCanvas(page);
    await page.keyboard.press('Escape');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  },
);

test(
  '5. Verify that the existing atom can be replaced with star atom on the canvas by right-click menu',
  { tag: ['@chromium-popup'] },
  async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5553
     * Description: Verify that the existing atom can be replaced with star atom on the canvas by right-click menu
     * Case:
     *      1. Put test molecule on the canvas
     *      2. Right-click on the atom and select "Edit" from the context menu
     *      3. In appeared Atom properties dialog change atom type to "Special"
     *      4. Press Edit button (pencil icon)
     *      5. In appeared Extended table dialog select "Star" atom
     *      6. Click "Add" button
     *      7. Take a canvas screenshot to validate the atom is replaced with star atom
     */
    await CommonTopRightToolbar(page).setZoomInputValue('400');
    await pasteFromClipboardAndOpenAsNewProject(page, 'C1C=CC=CN=1');
    const atomToReplace = await page.getByText('N', { exact: true }).first();
    await ContextMenu(page, atomToReplace).click(MicroAtomOption.Edit);
    await AtomPropertiesDialog(page).selectAtomType(AtomType.Special);
    await AtomPropertiesDialog(page).editLabel();
    await ExtendedTableDialog(page).clickExtendedTableElement(
      ExtendedTableButton.STAR,
    );
    await ExtendedTableDialog(page).add();
    await AtomPropertiesDialog(page).apply();
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  },
);

test(
  '6. Verify that the existing atom can be replaced with star atom on the canvas by the hotkey (Shift+8)',
  { tag: ['@chromium-popup'] },
  async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5553
     * Description: Verify that the existing atom can be replaced with star atom on the canvas by the hotkey (Shift+8)
     * Case:
     *      1. Put test molecule on the canvas
     *      2. Right-click on the atom and select "Edit" from the context menu
     *      3. In appeared Atom properties dialog change atom type to "Special"
     *      4. Press Edit button (pencil icon)
     *      5. In appeared Extended table dialog select "Star" atom
     *      6. Click "Add" button
     *      7. Take a canvas screenshot to validate the atom is replaced with star atom
     */

    await CommonTopRightToolbar(page).setZoomInputValue('400');
    await pasteFromClipboardAndOpenAsNewProject(page, 'C1C=CC=CN=1');
    const atomToReplace = page.getByText('N', { exact: true }).first();
    await page.keyboard.press('Shift+8');
    await waitForRender(page, async () => {
      await atomToReplace.click();
    });
    await page.keyboard.press('Escape');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  },
);
