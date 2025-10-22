/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { selectAllStructuresOnCanvas } from '@utils/canvas';
import { clickOnCanvas, dragMouseTo } from '@utils/index';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import {
  ConnectionPointOption,
  MicroAtomOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';

let page: Page;
test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

test(`1. Verify that options/toolbar icons are now enabled for atoms in create monomer wizard: in the right-click menu, only options Edit and Delete are enabled`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8340
   * Description: Verify that options/toolbar icons are now enabled for atoms in create monomer wizard: in the right-click menu, only options Edit and Delete are enabled
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. r-click on a terminal atom on canvas
   *      6. Verify that context menu option Edit and Delete are enabled
   *
   * Version 3.9
   */

  await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(500, 250, page);

  const targetAtom = getAtomLocator(page, { atomLabel: 'C' }).first();

  await ContextMenu(page, targetAtom).open();

  await expect(page.getByTestId(MicroAtomOption.Edit)).toBeEnabled();
  await expect(page.getByTestId(MicroAtomOption.Delete)).toBeEnabled();

  await clickOnCanvas(page, 0, 0);
  await CreateMonomerDialog(page).discard();
});
