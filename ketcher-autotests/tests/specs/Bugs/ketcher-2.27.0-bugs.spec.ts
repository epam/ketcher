/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  selectFlexLayoutModeTool,
  resetZoomLevelToDefault,
} from '@utils';
import { waitForPageInit } from '@utils/common';
import { selectClearCanvasTool } from '@tests/pages/common/TopLeftToolbar';
import { connectMonomersWithBonds } from '@utils/macromolecules/monomer';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';
import { turnOnMacromoleculesEditor } from '@tests/pages/common/TopRightToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';

let page: Page;

test.describe('Ketcher bugs in 2.27.0', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page, {
      enableFlexMode: false,
      goToPeptides: false,
    });
  });

  test.afterEach(async ({ context: _ }, testInfo) => {
    await selectClearCanvasTool(page);
    await resetZoomLevelToDefault(page);
    await processResetToDefaultState(testInfo, page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  test('Case 1: Able to establish hydrogen bond connection if monomer has no free attachment points', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6802
     * Bug: https://github.com/epam/ketcher/issues/5935
     * Description: Able to establish hydrogen bond connection if monomer has no free attachment points.
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Load from HELM
     * 3. Try to establish hydrogen bond connection between Cys_Bn and Chg peptides
     */
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.[Cys_Bn].[AspOMe]}|PEPTIDE2{F.[Chg].[His1Bn]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair$$$V2.0',
    );
    await connectMonomersWithBonds(
      page,
      ['Cys_Bn', 'Chg'],
      MacroBondType.Hydrogen,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});
