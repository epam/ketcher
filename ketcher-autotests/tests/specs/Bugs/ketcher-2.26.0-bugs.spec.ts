/* eslint-disable no-inline-comments */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Page, test, expect, Locator } from '@playwright/test';
import {
  takeEditorScreenshot,
  resetZoomLevelToDefault,
  pasteFromClipboardAndAddToCanvas,
  openBondsSettingsSection,
  scrollToDownInSetting,
  setBondThicknessOptionUnit,
  setBondThicknessValue,
  pressButton,
  clickInTheMiddleOfTheScreen,
  enableViewOnlyModeBySetOptions,
  disableViewOnlyModeBySetOptions,
  openFileAndAddToCanvasAsNewProject,
  clickOnBond,
  BondType,
  selectSnakeLayoutModeTool,
  selectFlexLayoutModeTool,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  clickOnAtom,
  setBondLengthValue,
  setBondSpacingValue,
  resetAllSettingsToDefault,
  takeLeftToolbarScreenshot,
  keyboardTypeOnCanvas,
  selectSequenceLayoutModeTool,
  openFileAndAddToCanvasAsNewProjectMacro,
  resetCurrentTool,
  waitForMonomerPreview,
  dragMouseTo,
  selectAllStructuresOnCanvas,
  openFileAndAddToCanvasMacro,
} from '@utils';
import { waitForPageInit, waitForRender } from '@utils/common';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import {
  drawBenzeneRing,
  selectRingButton,
} from '@tests/pages/molecules/BottomToolbar';
import { TopRightToolbar } from '@tests/pages/molecules/TopRightToolbar';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { closeErrorAndInfoModals } from '@utils/common/helpers';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { switchToPeptideMode } from '@utils/macromolecules/sequence';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { Peptides } from '@constants/monomers/Peptides';
import { Phosphates } from '@constants/monomers/Phosphates';
import { Sugars } from '@constants/monomers/Sugars';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { ArrowType } from '@tests/pages/constants/arrowSelectionTool/Constants';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

async function setHighResolution(page: Page) {
  await page.getByText('low').click();
  await page.getByTestId('high-option').click();
}

async function removeTail(page: Page, tailName: string, index?: number) {
  const tailElement = page.getByTestId(tailName);
  if (index !== undefined) {
    await tailElement.nth(index).click({ force: true, button: 'right' });
  } else {
    await tailElement.first().click({ force: true, button: 'right' });
  }
  await waitForRender(page, async () => {
    await page.getByText('Remove tail').click();
  });
}

async function openEditConnectionPointsMenu(page: Page, bondLine: Locator) {
  await bondLine.click({ button: 'right', force: true });
  await page.getByText('Edit Connection Points...').click();
}

let page: Page;

test.describe('Ketcher bugs in 2.26.0', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
  });

  test.afterEach(async ({ context: _ }, testInfo) => {
    await closeErrorAndInfoModals(page);
    await resetZoomLevelToDefault(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await processResetToDefaultState(testInfo, page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  test('Case 1: The options for layout about smart-layout, aromatize-skip-superatoms and etc is sent as not undefined', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5635
     * Description: The options for layout about smart-layout, aromatize-skip-superatoms and etc is sent as not undefined.
     * Scenario:
     * 1. Go to Micro
     * 2. Paste from clipboard
     * 3. Take screenshot
     */
    await pasteFromClipboardAndAddToCanvas(
      page,
      'C1CC=CC=CC=CCC=CC=CC=CCC=CC=C1 |c:2,11,16,t:4,6,9,13,18|',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 2: The picture is correct when image resolution high and bond thickness changing', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5610
     * Description: The picture is correct when image resolution high and bond thickness changing.
     * Scenario:
     * 1. Add benzene ring to the Canvas
     * 2. Set image resolution High in the Settings
     * 3. Set bond thickness 2.6 pt in the Settings in the Bond section
     * 4. Click on Apply button
     * 5. Save to png (or svg)
     */
    await drawBenzeneRing(page);
    await TopRightToolbar(page).Settings();
    await setHighResolution(page);
    await openBondsSettingsSection(page);
    await scrollToDownInSetting(page);
    await setBondThicknessOptionUnit(page, 'px-option');
    await setBondThicknessValue(page, '2.6');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page);
    await SaveStructureDialog(page).cancel();
    await resetAllSettingsToDefault(page);
  });

  test('Case 3: The 3D View allow manipulation of the structure in "View Only" mode but button Apply disabled', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5582
     * Description: The 3D View allow manipulation of the structure in "View Only" mode but button Apply disabled.
     * Scenario:
     * 1. Add benzene ring to the Canvas
     * 2. Switch to "View Only" mode. ketcher.editor.options({ viewOnlyMode: true })
     * 3. Activate the "3D Viewer"
     * 4. Attempt to manipulate the structure using the 3D Viewer and press Apply button.
     */
    const applyButton = page.getByTestId('miew-modal-button');
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await enableViewOnlyModeBySetOptions(page);
    await IndigoFunctionsToolbar(page).ThreeDViewer();
    await expect(applyButton).toBeDisabled();
    await takeEditorScreenshot(page);
    await closeErrorAndInfoModals(page);
    await disableViewOnlyModeBySetOptions(page);
  });

  test('Case 4: The arrows are displayed correctly when applying the default size and ACS style', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5559
     * Description: The arrows are displayed correctly when applying the default size and ACS style.
     * Scenario:
     * 1. Add arrow to the Canvas
     * 2. Open the "Settings" window
     * 3. Set the "Arrow" style to "ACS"
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/equilibrium-arrows.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await TopRightToolbar(page).Settings({ waitForFontListLoad: true });
    await pressButton(page, 'Set ACS Settings');
    await pressButton(page, 'Apply');
    await pressButton(page, 'OK');
    await takeEditorScreenshot(page);
  });

  test('Case 5: White screen is not displayed after change direction of wedge bond', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5536
     * Description: White screen is not displayed after change direction of wedge bond.
     * Scenario:
     * 1. Add chain with wedge bond to the Canvas
     * 2. Change direction of wedge bond
     * 3. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/chain-with-wedge-bond.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickOnBond(page, BondType.SINGLE, 2, 'right');
    await page.getByText('Change direction').click();
    await takeEditorScreenshot(page);
  });

  test('Case 6: Settings for the "attachment point tool" update with changed pixel settings', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/4983
     * Description: Settings for the "attachment point tool" update with changed pixel settings.
     * Scenario:
     * 1. Add a single bond and an attachment point to a drawing
     * 2. Go to Settings->Bonds and change the 'Bond thickness' parameter (e.g. increase up to 6)
     * 3. See that line width of the single bond has been updated accordingly while line width of the attachment point remain the same.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/structure-with-attachments-points.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await TopRightToolbar(page).Settings();
    await openBondsSettingsSection(page);
    await scrollToDownInSetting(page);
    await setBondThicknessOptionUnit(page, 'px-option');
    await setBondThicknessValue(page, '6');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await resetAllSettingsToDefault(page);
  });

  test('Case 7: Correct stereo-label placement for (E) and (Z)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/4757
     * Description: Correct stereo-label placement for (E) and (Z).
     * Scenario:
     * 1. Go to Ketcher micromolecules mode
     * 2. Draw any structure containing cis/trans isomerism
     * 3. Select Calculate CIP
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/micro-structure-with-isomerism.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('Case 8: Default values for bond settings (at least for bond) not corrupted and not become wrong', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5649
     * Description: Default values for bond settings (at least for bond) not corrupted and not become wrong.
     * Scenario:
     * 1. Go to Ketcher micromolecules mode
     * 2. Go to Setting - Bond section
     */
    await TopRightToolbar(page).Settings();
    await openBondsSettingsSection(page);
    await scrollToDownInSetting(page);
    await takeEditorScreenshot(page);
  });

  test('Case 9: The reaction can be saved to MOL V3000', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5653
     * Description: The reaction can be saved to MOL V3000.
     * Scenario:
     * 1. Go to Ketcher micromolecules mode
     * 2. Add to the Canvas a molecule
     * 3. Save to MOL V3000
     */
    await pasteFromClipboardAndAddToCanvas(
      page,
      'CC(=O)O[C@@H](C)[C@H](O)Cn1cnc2c1ncnc2N',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'Molfiles-V3000/reaction-saved-to-MOL-V3000-expected.mol',
      FileType.MOL,
      'v3000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Molfiles-V3000/reaction-saved-to-MOL-V3000-expected.mol',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Case 10: ketcher.getMolfile() not stopped working for macro canvas with peptides', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5634
     * Description: ketcher.getMolfile() not stopped working for macro canvas with peptides.
     * Scenario:
     * 1. Go to Macro - Snake mode
     * 2. Load from file
     * 3. Save to MOL V3000
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await selectSnakeLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProject(
      'Molfiles-V3000/snake-mode-peptides-on-canvas.mol',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'Molfiles-V3000/snake-mode-peptides-on-canvas-expected.mol',
      FileType.MOL,
      'v3000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Molfiles-V3000/snake-mode-peptides-on-canvas-expected.mol',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Case 11: Export to SDF V3000 not returns SDF V2000', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5652
     * Description: Export to SDF V3000 not returns SDF V2000, it should be SDF V3000.
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Save to SDF V3000
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      'KET/one-attachment-point-added-in-micro-mode.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'SDF/one-attachment-point-added-in-micro-mode-expected.sdf',
      FileType.SDF,
      'v3000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'SDF/one-attachment-point-added-in-micro-mode-expected.sdf',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Case 12: The reaction can be saved to MDL RXN V3000 (not returns RXN V2000 instead)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5651
     * Description: The reaction can be saved to MDL RXN V3000 (not returns RXN V2000 instead).
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Save to MDL RXN V3000
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/reaction-cant-save-to-MDL-RXN-V3000.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'Rxn-V3000/reaction-cant-save-to-MDL-RXN-V3000-expected.rxn',
      FileType.RXN,
      'v3000',
    );
    await openFileAndAddToCanvasAsNewProject(
      'Rxn-V3000/reaction-cant-save-to-MDL-RXN-V3000-expected.rxn',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Case 13: Able to load variant CHEM from HELM - system not throws an error: Convert error! {}', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5711
     * Description: Able to load variant CHEM from HELM - system not throws an error: Convert error! {}.
     * Scenario:
     * 1. Toggle to Macro - Flex
     * 2. Load from HELM
     * 3. Take screenshot
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'CHEM1{([4aPEGMal],[4FB])}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 14: Able to load variant phosphate from HELM - system not throws an error: Convert error! {}', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5710
     * Description: Able to load variant phosphate from HELM - system not throws an error: Convert error! {}.
     * Scenario:
     * 1. Toggle to Macro - Flex
     * 2. Load from HELM
     * 3. Take screenshot
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)([bnn],[bP])}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 15: Able to load variant sugar from HELM - system not throws an error: Convert error! {}', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5709
     * Description: Able to load variant sugar from HELM - system not throws an error: Convert error! {}.
     * Scenario:
     * 1. Toggle to Macro - Flex
     * 2. Load from HELM
     * 3. Take screenshot
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await selectFlexLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{([25d3r],[25mo3r])(A)P}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 16: No overlapping UI elements in Query Properties right-click menu', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5615
     * Description: No overlapping UI elements in Query Properties right-click menu.
     * Scenario:
     * 1. Open Micro
     * 2. Right-click and select Query Properties -> H count or Substitution count (in my case)
     * 3. Take screenshot
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await drawBenzeneRing(page);
    await clickOnAtom(page, 'C', 0, 'right');
    await page.getByText('Query properties').click();
    await page.getByText('H count', { exact: true }).hover();
    await takeEditorScreenshot(page);
    await page.getByText('Substitution count').hover();
    await takeEditorScreenshot(page);
  });

  test('Case 17: Bond spacing is correct after saving in PNG (svg)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5628
     * Description: Bond spacing is correct after saving in PNG (svg).
     * Scenario:
     * 1. Open Micro
     * 2. Add benzene ring
     * 3. Set bond length 50 px in the Settings on the Bond section
     * 4. Set bond spacing 50%
     * 5. Save to PNG (or SVG)
     */
    await drawBenzeneRing(page);
    await TopRightToolbar(page).Settings();
    await openBondsSettingsSection(page);
    await setBondLengthValue(page, '50');
    await scrollToDownInSetting(page);
    await setBondSpacingValue(page, '50');
    await pressButton(page, 'Apply');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page);
    await SaveStructureDialog(page).cancel();
    await resetAllSettingsToDefault(page);
  });

  test('Case 18: Single up bond is being painted over correctly', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5606
     * Description: Single up bond is being painted over correctly.
     * Scenario:
     * 1. Open Micro
     * 2. Add file with single up bond
     * 3. Highlight the bond
     * 4. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/chain-with-singleup-bond.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickOnBond(page, BondType.SINGLE, 2, 'right');
    await page.getByText('Highlight', { exact: true }).click();
    await page.locator('.css-1pz88a0').click(); // Green color
    await takeEditorScreenshot(page);
  });

  test('Case 19: The double bond is colored properly', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5598
     * Description: The double bond is colored properly.
     * Scenario:
     * 1. Open Micro
     * 2. Add file with double bond
     * 3. Highlight the bond
     * 4. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/chain-with-double-bond.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickOnBond(page, BondType.DOUBLE, 0, 'right');
    await page.getByText('Highlight', { exact: true }).click();
    await page.locator('.css-cyxjjb').click(); // Red color
    await takeEditorScreenshot(page);
  });

  test('Case 20: The atom is completely colored', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5597
     * Description: The atom is completely colored.
     * Scenario:
     * 1. Open Micro
     * 2. Add file
     * 3. Highlight the atom
     * 4. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/chain-with-double-bond.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickOnAtom(page, 'C', 0, 'right');
    await page.getByText('Highlight', { exact: true }).click();
    await page.locator('.css-cyxjjb').click(); // Red color
    await takeEditorScreenshot(page);
  });

  test('Case 21: If switch to View Only Mode with Fragment Selection you can change or select another selection mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5581
     * Description: If switch to View Only Mode with Fragment Selection you can change or select another selection mode.
     * Scenario:
     * 1. Open Ketcher in normal mode.
     * 2. Use the Selection Tool and choose the "Fragment selection".
     * 3. Switch to "View Only" mode. ketcher.editor.options({ viewOnlyMode: true })
     * 4. Change the selection mode.
     */
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
    await enableViewOnlyModeBySetOptions(page);
    await takeLeftToolbarScreenshot(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await takeLeftToolbarScreenshot(page);
    await disableViewOnlyModeBySetOptions(page);
  });

  test('Case 22: O and U sumbols are supported in sequence mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5621
     * Description: O and U sumbols are supported in sequence mode.
     * Scenario:
     * 1. Toggle to Macro - Sequence mode -> Switch to PEP (Peptides)
     * 2. Start new sequence
     * 3. Add O and U symbols to the sequence
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await selectSequenceLayoutModeTool(page);
    await switchToPeptideMode(page);
    await keyboardTypeOnCanvas(page, 'OU');
    await takeEditorScreenshot(page);
  });

  test('Case 23: Set a new name for the button ACS style', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5561
     * Description: Set a new name for the button ACS style. A new name for button should be "Set ACS Settings"
     * Scenario:
     * 1. Toggle to Micro
     * 2. Press Settings
     * 3. Check that the button name is "Set ACS Settings"
     */
    const setACSSettings = page.getByTestId('acs-style-button');
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await TopRightToolbar(page).Settings({ waitForFontListLoad: true });
    await expect(setACSSettings).toBeVisible();
    await expect(setACSSettings).toHaveText('Set ACS Settings');
    await takeEditorScreenshot(page);
  });

  test('Case 24: Bond/monomer tooltip preview placed correct in on edge cases', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5557
     * Description: Bond/monomer tooltip preview placed correct in on edge cases
     * Scenario:
     * 1. Toggle to Macro - Flex mode
     * 2. Load from file
     * 3. Hover over the bond/monomer
     * 4. Take screenshot
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Bond tooltip preview placed wrong in on edge cases.ket',
      page,
    );
    await CommonTopRightToolbar(page).setZoomInputValue('75');
    await resetCurrentTool(page);
    await getMonomerLocator(page, Peptides.Cys_Bn).hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
    await getMonomerLocator(page, Sugars._25mo3r).hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
    await getMonomerLocator(page, Phosphates.msp).hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Case 25: The tail of Multi-Tailed Arrow is added to the proper place on the Spine after the Redo action of removing the tail if the length of the spine were changed', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5548
     * Description: The tail of Multi-Tailed Arrow is added to the proper place on the Spine after the Redo action of removing the tail if the length of the spine were changed
     * Scenario:
     * 1. Add default Multi-Tailed Arrow to Canvas
     * 2. Add a new tail by right-clicking on the Spine
     * 3. Change the length of the spine by pulling the bottom tail down
     * 4. Right-click on the middle tail
     * 5. Click on Remove tail - tail is removed
     * 6. Click on Undo
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await LeftToolbar(page).selectArrowTool(ArrowType.MultiTailedArrow);
    await clickInTheMiddleOfTheScreen(page);
    await clickInTheMiddleOfTheScreen(page, 'right', {
      waitForMergeInitialization: true,
    });
    await page.getByText('Add new tail').click();
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await selectAllStructuresOnCanvas(page);
    await page.getByTestId('bottomTail-move').hover({ force: true });
    await dragMouseTo(200, 500, page);
    await takeEditorScreenshot(page);
    await removeTail(page, 'tails-0-move');
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test('Case 26: Edit Connection points dialog cant cause invalid connection between monomers', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5205
     * Description: Edit Connection points dialog cant cause invalid connection between monomers
     * Scenario:
     * 1. Go to Macro mode
     * 2. Load from file
     * 3. Open Edit Connection points dialog
     * 4. Click on ALREADY selected connection points
     * 5. Press Reconnect button
     * 6. Open Edit Connection points dialog again
     * 7. Take screenshot
     */
    const bondLine = getBondLocator(page, {});
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    await openFileAndAddToCanvasMacro('KET/two-nucleotides.ket', page);
    await openEditConnectionPointsMenu(page, bondLine);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    await page.getByRole('button', { name: 'R2' }).first().click();
    await page.getByRole('button', { name: 'R1' }).nth(1).click();
    await pressButton(page, 'Reconnect');
    await openEditConnectionPointsMenu(page, bondLine);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
  });

  test('Case 27: Atom/Bond selection not remains on the canvas after clear canvas', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5788
     * Description: Atom/Bond selection not remains on the canvas after clear canvas
     * Scenario:
     * 1. Toggle to Macro - Flex mode
     * 2. Load from file
     * 3. Select all
     * 4. Press Clear canvas button
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Bond properties are not implemented.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
  });
});
