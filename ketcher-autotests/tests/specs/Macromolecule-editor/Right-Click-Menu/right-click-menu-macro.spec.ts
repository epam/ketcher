/* eslint-disable no-magic-numbers */
import { Page, expect, test } from '@playwright/test';
import {
  resetZoomLevelToDefault,
  waitForPageInit,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  selectFlexLayoutModeTool,
  takeElementScreenshot,
  selectSnakeLayoutModeTool,
} from '@utils';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { Peptides } from '@constants/monomers/Peptides';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MonomerOption } from '@tests/pages/constants/contextMenu/Constants';

let page: Page;
test.setTimeout(20000);

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();
  await waitForPageInit(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
});

test.afterEach(async () => {
  await page.keyboard.press('Escape');
  await resetZoomLevelToDefault(page);
  await CommonTopLeftToolbar(page).clearCanvas();
});

test.afterAll(async ({ browser }) => {
  const cntxt = page.context();
  await page.close();
  await cntxt.close();
  await browser.contexts().forEach((someContext) => {
    someContext.close();
  });
  // await browser.close();
});

test(`Verify context menu in Snake and Flex modes when right-clicking a monomer (Copy and Delete (Paste disabled))`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7391
   * Test case: Verify context menu in Snake and Flex modes when right-clicking a monomer (Copy and Delete (Paste disabled))
   * Case:
   *      0. Go to Flex mode
   *      1. Load single monomer
   *      2. Right-click on the monomer to open context menu
   *      3. Take menu screenshot to validate options: Copy and Delete (Paste disabled)
   *      4. Go to Snake mode
   *      5. Right-click on the monomer to open context menu
   *      6. Take menu screenshot to validate options: Copy and Delete (Paste disabled)
   *
   * Version 3.6
   */
  const copyOption = page.getByTestId(MonomerOption.Copy);
  const pasteOption = page.getByTestId(MonomerOption.Paste);
  const deleteOption = page.getByTestId(MonomerOption.Delete);

  await selectFlexLayoutModeTool(page);
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{A}$$$$V2.0',
  );
  const peptideA = getMonomerLocator(page, Peptides.A);
  await peptideA.click();
  await ContextMenu(page, peptideA).open();
  await takeElementScreenshot(
    page,
    ContextMenu(page, peptideA).contextMenuBody,
  );
  await expect(copyOption).toBeEnabled();
  await expect(pasteOption).toBeDisabled();
  await expect(deleteOption).toBeEnabled();

  await selectSnakeLayoutModeTool(page);
  await peptideA.click();
  await ContextMenu(page, peptideA).open();
  await takeElementScreenshot(
    page,
    ContextMenu(page, peptideA).contextMenuBody,
  );
  await expect(copyOption).toBeEnabled();
  await expect(pasteOption).toBeDisabled();
  await expect(deleteOption).toBeEnabled();
});

test(`Verify context menu in Snake and Flex modes when right-clicking a part of the chain (Copy and Delete (Paste disabled))`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7391
   * Test case: Verify context menu in Snake and Flex modes when right-clicking a part of the chain (Copy and Delete (Paste disabled))

   * Case:
   *      0. Go to Flex mode
   *      1. Load chain of some monomers
   *      2. Select few monomers in chain (C, D and E)
   *      2. Right-click on selected monomer to open context menu
   *      3. Take menu screenshot to validate options: Copy and Delete (Paste disabled)
   *      4. Go to Snake mode
   *      5. Right-click on the monomer to open context menu
   *      6. Take menu screenshot to validate options: Copy and Delete (Paste disabled)
   *
   * Version 3.6
   */
  const copyOption = page.getByTestId(MonomerOption.Copy);
  const pasteOption = page.getByTestId(MonomerOption.Paste);
  const deleteOption = page.getByTestId(MonomerOption.Delete);
  const peptideC = getMonomerLocator(page, Peptides.C);
  const peptideD = getMonomerLocator(page, Peptides.D);
  const peptideE = getMonomerLocator(page, Peptides.E);

  await selectFlexLayoutModeTool(page);
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{A}$$$$V2.0',
  );
  await page.keyboard.down('Shift');
  await peptideC.click();
  await peptideD.click();
  await peptideE.click();
  await page.keyboard.up('Shift');

  await ContextMenu(page, peptideD).open();
  await takeElementScreenshot(
    page,
    ContextMenu(page, peptideD).contextMenuBody,
  );
  await expect(copyOption).toBeEnabled();
  await expect(pasteOption).toBeDisabled();
  await expect(deleteOption).toBeEnabled();

  await selectSnakeLayoutModeTool(page);
  await page.keyboard.down('Shift');
  await peptideC.click();
  await peptideD.click();
  await peptideE.click();
  await page.keyboard.up('Shift');

  await ContextMenu(page, peptideD).open();
  await takeElementScreenshot(
    page,
    ContextMenu(page, peptideD).contextMenuBody,
  );
  await expect(copyOption).toBeEnabled();
  await expect(pasteOption).toBeDisabled();
  await expect(deleteOption).toBeEnabled();
});
