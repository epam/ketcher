/* eslint-disable no-inline-comments */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@playwright/test';
import {
  takeEditorScreenshot,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  selectFlexLayoutModeTool,
  resetZoomLevelToDefault,
  selectSnakeLayoutModeTool,
  openFileAndAddToCanvasAsNewProjectMacro,
  takePageScreenshot,
  selectSequenceLayoutModeTool,
  openDropdown,
  openFileAndAddToCanvasAsNewProject,
  takeLeftToolbarMacromoleculeScreenshot,
} from '@utils';
import { waitForPageInit } from '@utils/common';
import { selectClearCanvasTool } from '@tests/pages/common/TopLeftToolbar';
import {
  connectMonomersWithBonds,
  getMonomerLocator,
} from '@utils/macromolecules/monomer';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';
import {
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@tests/pages/common/TopRightToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { bondSelectionTool } from '@tests/pages/common/CommonLeftToolbar';
import { Peptides } from '@constants/monomers/Peptides';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';

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

  test('Case 5: System not change monomer position after switching from Molecules to Macromolecules - Sequence', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6802
     * Bug: https://github.com/epam/ketcher/issues/5967
     * Description: System not change monomer position after switching from Molecules to Macromolecules - Sequence.
     * Scenario:
     * 1. Toggle to Macromolecules mode - Flex mode
     * 2. Load from file
     * 3. Toggle to Sequence mode
     * 4. Toggle back to Molecules mode
     * 5. Toggle to Sequence mode
     */
    await selectFlexLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Bugs/System should not change monomer position after switching from Molecules to Macromolecules - Sequence.ket',
      page,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 6: Elliptic arrow icons order is correct at arrow toolbar', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6802
     * Bug: https://github.com/epam/ketcher/issues/5398
     * Description: Elliptic arrow icons order is correct at arrow toolbar.
     * Scenario:
     * 1. Toggle to Molecules mode
     * 2. Open arrow menu in toobar
     */
    await turnOnMicromoleculesEditor(page);
    await openDropdown(page, 'reaction-arrow-open-angle');
    await takeEditorScreenshot(page);
  });

  test('Case 7: Toggling between Flex and Sequence modes not causes loosing layout info', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6802
     * Bug: https://github.com/epam/ketcher/issues/5372
     * Description: Toggling between Flex and Sequence modes not causes loosing layout info.
     * Scenario:
     * 1. Toggle to Macromolecules mode - Flex mode
     * 2. Load from file
     * 3. Toggle to Sequence mode
     * 4. Toggle back to Flex mode
     */
    await turnOnMacromoleculesEditor(page);
    await selectFlexLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Bugs/System should remember the canvas mode on Molecules_Macromolecules mode switch.ket',
      page,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 8: Attachment points can be colored', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6802
     * Bug: https://github.com/epam/ketcher/issues/5605
     * Description: Attachment points can be colored.
     * Scenario:
     * 1. Micro mode
     * 2. Load from file
     * 3. Highlight attachment points
     */
    await turnOnMicromoleculesEditor(page);
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/benzene-ring-with-two-attachment-points.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await page.getByText('R1').click({
      button: 'right',
    });
    await page.getByText('Highlight', { exact: true }).click();
    await page.locator('.css-cyxjjb').click(); // Red
    await page.locator('path').nth(8).click({
      button: 'right',
    });
    await page.getByText('Highlight', { exact: true }).click();
    await page.locator('.css-d1acvy').click(); // Blue
    await takeEditorScreenshot(page);
  });

  test('Case 9: Zoom in automatically upon import of small sequences', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6802
     * Bug: https://github.com/epam/ketcher/issues/5600
     * Description: Zoom in automatically upon import of small sequences.
     * Scenario:
     * 1. Micro mode - Flex mode
     * 2. Load from file
     * 3. Take screenshot
     */
    const files = [
      'KET/Bugs/Example 1.ket',
      'KET//Bugs/Example 2.ket',
      'KET//Bugs/Example 3.ket',
      'KET//Bugs/Example 4.ket',
    ];

    for (const filePath of files) {
      await turnOnMacromoleculesEditor(page);
      await selectFlexLayoutModeTool(page);
      await openFileAndAddToCanvasAsNewProjectMacro(filePath, page);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    }
  });

  test('Case 10: Hand tool in macromolecules mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6802
     * Bug: https://github.com/epam/ketcher/issues/5579
     * Description: Hand tool in macromolecules mode.
     * Scenario:
     * 1. Toggle to Macromolecules mode
     * 2. Check that hand tool is available
     */
    await turnOnMacromoleculesEditor(page);
    const handTool = page.getByTestId('hand');
    await expect(handTool).toBeVisible();
    await expect(handTool).toBeEnabled();
    await expect(handTool).toHaveAttribute('title', 'Hand Tool (Ctrl+Alt+H)');
    await handTool.click();
    await expect(handTool).toHaveClass(/active/);
    await takeLeftToolbarMacromoleculeScreenshot(page);
  });

  test('Case 11: getKet not duplicates items when macro molucules are used', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6802
     * Bug: https://github.com/epam/ketcher/issues/5181
     * Description: getKet not duplicates items when macro molucules are used.
     * Scenario:
     * 1. Load from file
     * 2. Check that getKet not duplicates items
     */
    await turnOnMicromoleculesEditor(page);
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/micro-and-macro-structure.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/Bugs/micro-and-macro-structure-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/micro-and-macro-structure-expected.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Case 12: System remember the canvas mode on Molecules/Macromolecules mode switch (do not switch to Sequernce by default)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6802
     * Bug: https://github.com/epam/ketcher/issues/5370
     * Description: System remember the canvas mode on Molecules/Macromolecules mode switch (do not switch to Sequernce by default).
     * Scenario:
     * 1. Toggle to Macromolecules mode - Flex mode
     * 2. Load from file
     * 3. Toggle to Molecules mode
     * 4. Toggle back to Macromolecules mode
     * 5. System opens Flex mode canvas
     */
    await turnOnMacromoleculesEditor(page);
    await selectFlexLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Bugs/System should remember the canvas mode on Molecules_Macromolecules mode switch.ket',
      page,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await turnOnMicromoleculesEditor(page);
    await turnOnMacromoleculesEditor(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});
