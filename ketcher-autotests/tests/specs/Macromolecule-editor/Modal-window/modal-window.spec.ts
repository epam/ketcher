import { Chem } from '@constants/monomers/Chem';
import { Locator, test } from '@playwright/test';
import {
  addSingleMonomerToCanvas,
  selectMacroBond,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@tests/pages/common/TopLeftToolbar';
import { MacroBondTool } from '@utils/canvas/tools/selectNestedTool/types';

import { goToCHEMTab } from '@utils/macromolecules/library';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
/* eslint-disable no-magic-numbers */

test.describe('Modal window', () => {
  let peptide1: Locator;
  let peptide2: Locator;
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    await goToCHEMTab(page);

    peptide1 = await addSingleMonomerToCanvas(
      page,
      Chem.Test_6_Ch,
      200,
      200,
      0,
    );
    peptide2 = await addSingleMonomerToCanvas(
      page,
      Chem.Test_6_Ch,
      400,
      400,
      1,
    );

    // Select bond tool
    await selectMacroBond(page, MacroBondTool.SINGLE);
  });

  test('"Connect" button is disabled', async ({ page }) => {
    /*
      Description: Bond two monomers and open window. 
      "Connect" button is disabled
      */

    // Create bonds between peptides
    await bondTwoMonomers(
      page,
      peptide1,
      peptide2,
      undefined,
      undefined,
      MacroBondTool.SINGLE,
      false,
      false,
    );
    await takeEditorScreenshot(page);
  });

  test('"Connect" button is active', async ({ page }) => {
    /*
      Description: Bond two monomers and open window. 
      Chose AP.
      "Connect" button is active
      */

    // Create bonds between peptides
    await bondTwoMonomers(
      page,
      peptide1,
      peptide2,
      'R1',
      'R2',
      MacroBondTool.SINGLE,
      true,
      false,
    );
    await takeEditorScreenshot(page);
  });
});
