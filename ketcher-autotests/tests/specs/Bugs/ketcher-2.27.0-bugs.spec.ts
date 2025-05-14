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
  selectLeftPanelButton,
  LeftPanelButton,
  pressButton,
  openSettings,
  openBondsSettingsSection,
  scrollToDownInSetting,
  setHashSpacingValue,
  takeMonomerLibraryScreenshot,
  selectAllStructuresOnCanvas,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  clickOnCanvas,
} from '@utils';
import { waitForPageInit } from '@utils/common';
import {
  connectMonomersWithBonds,
  getMonomerLocator,
} from '@utils/macromolecules/monomer';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { Peptides } from '@constants/monomers/Peptides';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { goToPeptidesTab } from '@utils/macromolecules/library';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { TopLeftToolbar } from '@tests/pages/common/TopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/TopRightToolbar';

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
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
  });

  test.afterEach(async ({ context: _ }, testInfo) => {
    await TopLeftToolbar(page).clearCanvas();
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
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
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
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
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
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
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
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
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
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
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
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
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
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    const handTool = CommonLeftToolbar(page).handToolButton;
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
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
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
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await selectFlexLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Bugs/System should remember the canvas mode on Molecules_Macromolecules mode switch.ket',
      page,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 13: Applying Enhanced Stereochemistry to monomers not causes its disappear from the canvas', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6802
     * Bug: https://github.com/epam/ketcher/issues/4936
     * Description: Applying Enhanced Stereochemistry to monomers not causes its disappear from the canvas.
     * Scenario:
     * 1. Go to Molecules mode
     * 2. Load from file
     * 3. Press Stereochemistry button and press Apply button in appeared dialog
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/Two nucleotides.ket',
      page,
    );
    await selectLeftPanelButton(LeftPanelButton.Stereochemistry, page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Case 14: Apply new hash spacing setting to canvas', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6802
     * Bug: https://github.com/epam/ketcher/issues/5354
     * Description: Apply new hash spacing setting to canvas.
     * Scenario:
     * 1. Go to Molecules mode
     * 2. Load from file
     * 3. Apply new hash spacing setting to canvas
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/bond-with-hash-spacing.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await openSettings(page);
    await openBondsSettingsSection(page);
    await scrollToDownInSetting(page);
    await setHashSpacingValue(page, '10');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Case 15: Preview tooltip work for monomers at Molecules mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6802
     * Bug: https://github.com/epam/ketcher/issues/5793
     * Description: Preview tooltip work for monomers at Molecules mode.
     * Scenario:
     * 1. Go to Molecules mode
     * 2. Load from file
     * 3. Hover mouse over label
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/1. Peptide X (ambiguouse, alternatives, from library).ket',
      page,
    );
    await page.getByText('X').hover();
    await takeEditorScreenshot(page);
  });

  test('Case 16: Search of ambiguous monomers work correct', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6802
     * Bug: https://github.com/epam/ketcher/issues/5564
     * Description: Search of ambiguous monomers work correct.
     * Scenario:
     * 1. Toggle to Macro - Flex mode
     * 2. Open Library, go to Peptides tab
     * 3. Search J
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await goToPeptidesTab(page);
    const rnaLibrarySearch = page.getByTestId('monomer-library-input');
    await rnaLibrarySearch.fill('J');
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 17: Hydrogen bonds are not missed after Copy/paste', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6802
     * Bug: https://github.com/epam/ketcher/issues/5940
     * Description: Hydrogen bonds are not missed after Copy/paste.
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Load from file
     * 3. Press Ctrl+A to select all
     * 4. Press Ctrl+C to copy
     * 5. Press Ctrl+V to paste
     * 6. Check that hydrogen bonds are not missed
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/Copy_paste operation works wrong (copy only two hydrogen bonds and drops others).ket',
      page,
    );
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 18: Deleting a monomer also deletes its hydrogen bonds', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6802
     * Bug: https://github.com/epam/ketcher/issues/5941
     * Description: Deleting a monomer also deletes its hydrogen bonds.
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Load from file
     * 3. Deleted peptides
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/Copy_paste operation works wrong (copy only two hydrogen bonds and drops others).ket',
      page,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonLeftToolbar(page).selectEraseTool();
    await getMonomerLocator(page, Peptides._1Nal).click();
    await getMonomerLocator(page, Peptides.A).click();
    await getMonomerLocator(page, Peptides.D).first().click();
    await getMonomerLocator(page, Peptides.C).first().click();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 19: Ability to focus on the drawing entity within expanded S-group/monomer bounding box', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6802
     * Bug: https://github.com/epam/ketcher/issues/5910
     * Description: Ability to focus on the drawing entity within expanded S-group/monomer bounding box.
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Click on the monomer 2Nal and expand it
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      'KET/Bugs/circle-peptides-one-expanded.ket',
      page,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await page.getByText('2Nal').click({ button: 'right' });
    await page.getByText('Expand monomer').click();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 20: Delete of micromolecules bonds in macro mode works correct', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6802
     * Bug: https://github.com/epam/ketcher/issues/5949
     * Description: Delete of micromolecules bonds in macro mode works correct.
     * Scenario:
     * 1. Go to Macro - Flex
     * 2. Load from file
     * 3. Delete few bonds
     * We have a bug https://github.com/epam/ketcher/issues/6993
     * After fixing it we need to update screenshots
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Bugs/Delete of micromolecules bonds works wrong (or doesnt work).ket',
      page,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonLeftToolbar(page).selectEraseTool();
    await clickOnCanvas(page, 570, 400);
    await clickOnCanvas(page, 600, 360);
    await clickOnCanvas(page, 600, 420);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});
