/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { pasteFromClipboardAndOpenAsNewProjectMacro } from '@utils/files/readFile';
import { MacroFileType, selectAllStructuresOnCanvas } from '@utils/canvas';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';

let page: Page;
test.beforeAll(async ({ initFlexCanvas }) => {
  page = await initFlexCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ FlexCanvas: _ }) => {});

test(`1. Check that after selecting the closed structure, the user able to access the 'Create cyclic structure' option when in Flex mode only`, async ({
  FlexCanvas: _,
}) => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: Check that after selecting the closed structure, the user able to access the 'Create cyclic structure' option when in Flex mode only
   *
   * Case:
   *      1. Open Macromolecules canvas - flex mode
   *      2. Load cyclic peptide HELM 'PEPTIDE1{A.C.D.E.F.G}$PEPTIDE1,PEPTIDE1,6:R2-1:R1$$$V2.0' from clipboard as new project
   *      3. Select the entire structure on the canvas
   *      4. Verify that 'Arrange as a Ring' button is enabled
   *
   * Version 3.11
   */
  await pasteFromClipboardAndOpenAsNewProjectMacro(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{A.C.D.E.F.G}$PEPTIDE1,PEPTIDE1,6:R2-1:R1$$$V2.0',
  );
  expect(MacromoleculesTopToolbar(page).arrangeAsRingButton).toBeDisabled();
  await selectAllStructuresOnCanvas(page);
  expect(MacromoleculesTopToolbar(page).arrangeAsRingButton).toBeEnabled();
});

test(`2. Check that after selecting the closed structure, the user able to access the 'Create cyclic structure' option when in Flex mode only by using hotkeys (Windows - Shift+Alt+c or Mac - Shift+Option+c)`, async ({
  FlexCanvas: _,
}) => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: Check that after selecting the closed structure, the user able to access the 'Create cyclic structure' option when in Flex mode only by using hotkeys (Windows - Shift+Alt+c or Mac - Shift+Option+c)
   *
   * Case:
   *      1. Open Macromolecules canvas - flex mode
   *      2. Load cyclic peptide HELM 'PEPTIDE1{A.C.D.E.F.G}$PEPTIDE1,PEPTIDE1,6:R2-1:R1$$$V2.0' from clipboard as new project
   *      3. Select the entire structure on the canvas
   *      4. Verify that 'Arrange as a Ring' button is enabled
   *
   * Version 3.11
   */
  await pasteFromClipboardAndOpenAsNewProjectMacro(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{A.C.D.E.F.G}$PEPTIDE1,PEPTIDE1,6:R2-1:R1$$$V2.0',
  );
  // NOT FINISHED YET
});
