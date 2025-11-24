/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import { test } from '@fixtures';
import { pasteFromClipboardAndOpenAsNewProjectMacro } from '@utils/files/readFile';
import { selectAllStructuresOnCanvas } from '@utils/canvas';

let page: Page;
test.beforeAll(async ({ initFlexCanvas }) => {
  page = await initFlexCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ FlexCanvas: _ }) => {});

test(`1. Check that after selecting the closed structure, the user able to access the 'Create cyclic structure' option when in Flex mode only`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: Check that after selecting the closed structure, the user able to access the 'Create cyclic structure' option when in Flex mode only
   *
   * Case:
   *      1. Open Macromolecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set mandatory fields in Create Monomer dialog for amino acid monomer
   *      5. Set modification type by clicking on + Add modification type and selecting Citrullination type from dropdown
   *      6. Press Submit button
   *      7. Switch to Macromolecules mode
   *      8. Verify that the created monomer is present on the canvas
   *      9. Hover the monomer and open the tooltip
   *     10. Verify that the modification type is displayed in the tooltip
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProjectMacro(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{A}|RNA1{R(A)}$$$$V2.0',
  );
  await selectAllStructuresOnCanvas(page);
});
