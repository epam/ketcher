/* eslint-disable no-inline-comments */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@playwright/test';
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
} from '@utils';
import { waitForPageInit } from '@utils/common';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';
import { TopLeftToolbar } from '@tests/pages/common/TopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/TopRightToolbar';
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

async function setHighResolution(page: Page) {
  await page.getByText('low').click();
  await page.getByTestId('high-option').click();
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
    await processResetToDefaultState(testInfo, page);
    await TopLeftToolbar(page).clearCanvas();
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
    await TopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page);
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
});
