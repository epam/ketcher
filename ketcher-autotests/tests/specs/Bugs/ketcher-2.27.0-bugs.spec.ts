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
  selectSnakeLayoutModeTool,
  openFileAndAddToCanvasAsNewProjectMacro,
  takePageScreenshot,
} from '@utils';
import { waitForPageInit } from '@utils/common';
import { selectClearCanvasTool } from '@tests/pages/common/TopLeftToolbar';
import {
  connectMonomersWithBonds,
  getMonomerLocator,
} from '@utils/macromolecules/monomer';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';
import { turnOnMacromoleculesEditor } from '@tests/pages/common/TopRightToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { bondSelectionTool } from '@tests/pages/common/CommonLeftToolbar';
import { Peptides } from '@constants/monomers/Peptides';

async function connectMonomerToAtom(page: Page) {
  await getMonomerLocator(page, Peptides.A).hover();
  await page
    .getByTestId('monomer')
    .locator('g')
    .filter({ hasText: 'R2' })
    .locator('path')
    .hover();
  await page.mouse.down();
  await page.locator('g').filter({ hasText: /^H2N$/ }).locator('rect').hover();
  await page.mouse.up();
}

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

  test('Case 2: Error message is correct if user tries to establish hydrogen bond if it is already exist', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6802
     * Bug: https://github.com/epam/ketcher/issues/5933
     * Description: Error message is correct if user tries to establish hydrogen bond if it is already exist.
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Load from HELM
     * 3. Try to establish hydrogen connection between peptides one more time
     */
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A}|PEPTIDE2{[1Nal]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair$$$V2.0',
    );
    await connectMonomersWithBonds(page, ['A', '1Nal'], MacroBondType.Hydrogen);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 3: Able to connect monomer to molecule in snake mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6802
     * Bug: https://github.com/epam/ketcher/issues/5970
     * Description: Able to connect monomer to molecule in snake mode.
     * Scenario:
     * 1. Go to Macro - Snake mode <--- IMPORTANT!
     * 2. Load from file
     * 3. Select Single Bond tool
     * 4. Try to establish connection between monomer and molecule
     */
    await selectSnakeLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Bugs/Unable to connect monomer to molecule in snake mode.ket',
      page,
    );
    await bondSelectionTool(page, MacroBondType.Single);
    await connectMonomerToAtom(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 4: Load from file having only micro structures on macro canvas not causes unnecessary zoom up to 200% and not shift molecule to top left angle', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6802
     * Bug: https://github.com/epam/ketcher/issues/5969
     * Description: Load from file having only micro structures on macro canvas not causes unnecessary zoom up to 200% and not shift molecule to top left angle.
     * Scenario:
     * 1. Go to Macro - Flex!
     * 2. Load from file
     * 3. Take screenshot
     */
    await selectFlexLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Bugs/Benzene ring.ket',
      page,
    );
    await takePageScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});
