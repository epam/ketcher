import { test } from '@fixtures';
import { waitForPageInit } from '@utils/common';
import { openFileAndAddToCanvasMacro, takeEditorScreenshot } from '@utils';
import {
  bondTwoMonomers,
  getBondLocator,
} from '@utils/macromolecules/polymerBond';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';
import { getMonomerLocator } from '@utils/macromolecules/monomer';

test.describe('Macromolecules connect phosphate and sugar', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  });

  test('Open file and connect phosphate and sugar', async ({ page }) => {
    await openFileAndAddToCanvasMacro(
      page,
      'KET/connection-of-phosphate-and-sugar.ket',
    );

    await CommonLeftToolbar(page).bondTool(MacroBondType.Single);

    const firstRsp = getMonomerLocator(page, { monomerAlias: `Rsp` }).first();
    const sugar = getMonomerLocator(page, { monomerAlias: `5A6` }).first();

    await bondTwoMonomers(page, firstRsp, sugar);

    await getBondLocator(page, {}).nth(1).hover({ force: true });
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await takeEditorScreenshot(page);
  });
});
