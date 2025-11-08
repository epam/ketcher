import { Chem } from '@tests/pages/constants/monomers/Chem';
import { Locator, test, expect } from '@fixtures';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import {
  AttachmentPoint,
  getMonomerLocator,
} from '@utils/macromolecules/monomer';
import { AttachmentPointsDialog } from '@tests/pages/macromolecules/canvas/AttachmentPointsDialog';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
/* eslint-disable no-magic-numbers */

test.describe('Modal window', () => {
  let chem1: Locator;
  let chem2: Locator;
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).switchToCHEMTab();

    await Library(page).dragMonomerOnCanvas(Chem.Test_6_Ch, {
      x: 200,
      y: 200,
    });
    chem1 = getMonomerLocator(page, Chem.Test_6_Ch).nth(0);
    await Library(page).dragMonomerOnCanvas(Chem.Test_6_Ch, {
      x: 400,
      y: 400,
    });
    chem2 = getMonomerLocator(page, Chem.Test_6_Ch).nth(1);
    // Select bond tool
    await CommonLeftToolbar(page).bondTool(MacroBondType.Single);
  });

  test('"Connect" button is disabled', async ({ page }) => {
    /*
      Description: Bond two monomers and open window. 
      "Connect" button is disabled
      */

    // Create bonds between CHEMs
    await bondTwoMonomers(page, chem1, chem2);
    await MonomerPreviewTooltip(page).hide();
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
    await bondTwoMonomers(page, chem1, chem2);
    await MonomerPreviewTooltip(page).hide();
    await AttachmentPointsDialog(page).selectAttachmentPoints({
      leftMonomer: AttachmentPoint.R1,
      rightMonomer: AttachmentPoint.R2,
    });

    expect(
      await AttachmentPointsDialog(page).connectButton.isEnabled(),
    ).toBeTruthy();
  });
});
