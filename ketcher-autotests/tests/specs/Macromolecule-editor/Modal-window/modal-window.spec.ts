import { Chem } from '@tests/pages/constants/monomers/Chem';
import { Locator, test, expect } from '@fixtures';
import {
  addSingleMonomerToCanvas,
  hideMonomerPreview,
  waitForPageInit,
} from '@utils';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { AttachmentPoint } from '@utils/macromolecules/monomer';
import { AttachmentPointsDialog } from '@tests/pages/macromolecules/canvas/AttachmentPointsDialog';
/* eslint-disable no-magic-numbers */

test.describe('Modal window', () => {
  let chem1: Locator;
  let chem2: Locator;
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).switchToCHEMTab();

    chem1 = await addSingleMonomerToCanvas(page, Chem.Test_6_Ch, 200, 200, 0);
    chem2 = await addSingleMonomerToCanvas(page, Chem.Test_6_Ch, 400, 400, 1);

    // Select bond tool
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
  });

  test('"Connect" button is disabled', async ({ page }) => {
    /*
      Description: Bond two monomers and open window. 
      "Connect" button is disabled
      */

    // Create bonds between CHEMs
    await chem1.hover({ force: true });
    await page.mouse.down();
    await chem2.hover({ force: true });
    await page.mouse.up();
    await hideMonomerPreview(page);
    expect(
      await AttachmentPointsDialog(page).connectButton.isDisabled(),
    ).toBeTruthy();
  });

  test('"Connect" button is active', async ({ page }) => {
    /*
      Description: Bond two monomers and open window. 
      Chose AP.
      "Connect" button is active
      */

    // Create bonds between CHEMs
    await chem1.hover({ force: true });
    await page.mouse.down();
    await chem2.hover({ force: true });
    await page.mouse.up();
    await hideMonomerPreview(page);
    await AttachmentPointsDialog(page).selectAttachmentPoints({
      leftMonomer: AttachmentPoint.R1,
      rightMonomer: AttachmentPoint.R2,
    });

    expect(
      await AttachmentPointsDialog(page).connectButton.isEnabled(),
    ).toBeTruthy();
  });
});
