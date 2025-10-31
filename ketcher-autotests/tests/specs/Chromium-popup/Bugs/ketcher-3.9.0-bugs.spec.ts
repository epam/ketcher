/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
import { test, expect } from '@fixtures';
import { Page } from '@playwright/test';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import {
  MacroFileType,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  selectAllStructuresOnCanvas,
  ZoomOutByKeyboard,
} from '@utils';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

let page: Page;

test.describe('Ketcher bugs in 3.9.0: ', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: Tooltip shown and addition not allowed when multiple monomers with free R2 are selected', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8351
     * Bug: https://github.com/epam/ketcher/issues/7700
     * Description:  System allow to delete monomers leaving connected bonds on the canvas
     * Scenario:
     * 1. Go to Macromolecules mode - Flex canvas (empty)
     * 2. Load from HELM: RNA1{d([Hyp])p.r(A)p.d([Hyp])p.r(A)p.d([Hyp])}$$$$V2.0
     * 3. Press Erase button
     * 4. Press Ctrl+a key to select structure on the canvas
     * 5. Click on all dR monomers
     * 6. Verify that bonds connected to deleted monomers are also deleted
     */
    await ZoomOutByKeyboard(page, { repeat: 2 });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{d([Hyp])p.r(A)p.d([Hyp])p.r(A)p.d([Hyp])}$$$$V2.0',
    );
    await CommonLeftToolbar(page).erase();
    await selectAllStructuresOnCanvas(page);
    const dRMonomers = getMonomerLocator(page, Sugar.dR);
    const dRMonomerCount = await dRMonomers.count();
    for (let index = 0; index < dRMonomerCount; index += 1) {
      await dRMonomers.first().click();
    }
    for (const bondId of [41, 42, 46, 47, 48, 52, 53]) {
      const bondLocator = getBondLocator(page, { bondId });
      expect(await bondLocator.count()).toBe(0);
    }
  });
});
