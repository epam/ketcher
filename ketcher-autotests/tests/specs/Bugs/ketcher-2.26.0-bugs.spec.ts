/* eslint-disable no-inline-comments */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { test, Page, expect } from '@fixtures';
import {
  takeEditorScreenshot,
  resetZoomLevelToDefault,
  pasteFromClipboardAndAddToCanvas,
  pressButton,
  clickInTheMiddleOfTheScreen,
  enableViewOnlyModeBySetOptions,
  disableViewOnlyModeBySetOptions,
  openFileAndAddToCanvasAsNewProject,
  BondType,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  takeLeftToolbarScreenshot,
  keyboardTypeOnCanvas,
  openFileAndAddToCanvasAsNewProjectMacro,
  waitForMonomerPreview,
  dragMouseTo,
  openFileAndAddToCanvasMacro,
  clickOnCanvas,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  cutToClipboardByKeyboard,
  moveMouseToTheMiddleOfTheScreen,
  copyToClipboardByIcon,
  moveMouseAway,
  getCachedBodyCenter,
  RxnFileFormat,
  SdfFileFormat,
  RdfFileFormat,
  MolFileFormat,
} from '@utils';
import { resetCurrentTool } from '@utils/canvas/tools/resetCurrentTool';
import { selectAllStructuresOnCanvas } from '@utils/canvas';
import { waitForRender } from '@utils/common';
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
import {
  getMonomerLocator,
  getSymbolLocator,
} from '@utils/macromolecules/monomer';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { ArrowType } from '@tests/pages/constants/arrowSelectionTool/Constants';
import { getBondLocator } from '@utils/macromolecules/polymerBond';
import {
  setSettingsOption,
  setSettingsOptions,
  SettingsDialog,
} from '@tests/pages/molecules/canvas/SettingsDialog';
import {
  AtomsSetting,
  BondsSetting,
  FontOption,
  GeneralSetting,
  ImageResolutionOption,
  MeasurementUnit,
  SettingsSection,
} from '@tests/pages/constants/settingsDialog/Constants';
import { MiewDialog } from '@tests/pages/molecules/canvas/MiewDialog';
import { MacromoleculesFileFormatType } from '@tests/pages/constants/fileFormats/macroFileFormats';
import { Library } from '@tests/pages/macromolecules/Library';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import {
  HighlightOption,
  MacroBondOption,
  MicroAtomOption,
  MicroBondOption,
  MultiTailedArrowOption,
  QueryAtomOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { expandMonomer } from '@utils/canvas/monomer/helpers';
import { getBondByIndex } from '@utils/canvas/bonds';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviation';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';

async function removeTail(page: Page, tailName: string, index?: number) {
  const tailElement = page.getByTestId(tailName);
  const n = index ?? 0;
  await waitForRender(page, async () => {
    await ContextMenu(page, tailElement.nth(n)).click(
      MultiTailedArrowOption.RemoveTail,
    );
  });
}

let page: Page;
test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});

test.describe('Ketcher bugs in 2.26.0', () => {
  test.afterEach(async () => {
    await closeErrorAndInfoModals(page);
    await resetZoomLevelToDefault(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).reset();
    await SettingsDialog(page).apply();
    await CommonTopLeftToolbar(page).clearCanvas();
    await processResetToDefaultState(test.info(), page);
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
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ImageResolution,
      ImageResolutionOption.High,
    );
    await SettingsDialog(page).apply();
    await setSettingsOptions(page, [
      {
        option: BondsSetting.BondThicknessUnits,
        value: MeasurementUnit.Px,
      },
      { option: BondsSetting.BondThickness, value: '2.6' },
    ]);
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page);
    await SaveStructureDialog(page).cancel();
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
    const applyButton = MiewDialog(page).applyButton;
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
      page,
      'KET/equilibrium-arrows.ket',
    );
    await takeEditorScreenshot(page);
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setACSSettings();
    await SettingsDialog(page).apply();
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
      page,
      'KET/chain-with-wedge-bond.ket',
    );
    await takeEditorScreenshot(page);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 2);
    await ContextMenu(page, point).click(MicroBondOption.ChangeDirection);
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
      page,
      'KET/structure-with-attachments-points.ket',
    );
    await takeEditorScreenshot(page);
    await setSettingsOptions(page, [
      {
        option: BondsSetting.BondThicknessUnits,
        value: MeasurementUnit.Px,
      },
      { option: BondsSetting.BondThickness, value: '6' },
    ]);
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
      page,
      'KET/micro-structure-with-isomerism.ket',
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
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await page.mouse.wheel(0, 400);
    await takeEditorScreenshot(page, {
      mask: [SettingsDialog(page).resetButton],
    });
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
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/reaction-saved-to-MOL-V3000-expected.mol',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 10: ketcher.getMolfile() not stopped working for macro canvas with peptides', async ({
    SnakeCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5634
     * Description: ketcher.getMolfile() not stopped working for macro canvas with peptides.
     * Scenario:
     * 1. Go to Macro - Snake mode
     * 2. Load from file
     * 3. Save to MOL V3000
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/snake-mode-peptides-on-canvas.mol',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'Molfiles-V3000/snake-mode-peptides-on-canvas-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/snake-mode-peptides-on-canvas-expected.mol',
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
      page,
      'KET/one-attachment-point-added-in-micro-mode.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'SDF/one-attachment-point-added-in-micro-mode-expected.sdf',
      FileType.SDF,
      SdfFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/one-attachment-point-added-in-micro-mode-expected.sdf',
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
      page,
      'KET/reaction-cant-save-to-MDL-RXN-V3000.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'Rxn-V3000/reaction-cant-save-to-MDL-RXN-V3000-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V3000/reaction-cant-save-to-MDL-RXN-V3000-expected.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 13: Able to load variant CHEM from HELM - system not throws an error: Convert error! {}', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5711
     * Description: Able to load variant CHEM from HELM - system not throws an error: Convert error! {}.
     * Scenario:
     * 1. Toggle to Macro - Flex
     * 2. Load from HELM
     * 3. Take screenshot
     */
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

  test('Case 14: Able to load variant phosphate from HELM - system not throws an error: Convert error! {}', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5710
     * Description: Able to load variant phosphate from HELM - system not throws an error: Convert error! {}.
     * Scenario:
     * 1. Toggle to Macro - Flex
     * 2. Load from HELM
     * 3. Take screenshot
     */
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

  test('Case 15: Able to load variant sugar from HELM - system not throws an error: Convert error! {}', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5709
     * Description: Able to load variant sugar from HELM - system not throws an error: Convert error! {}.
     * Scenario:
     * 1. Toggle to Macro - Flex
     * 2. Load from HELM
     * 3. Take screenshot
     */
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

    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 0 }),
    ).hover([MicroAtomOption.QueryProperties, QueryAtomOption.HCount]);
    await takeEditorScreenshot(page);
    await page.getByTestId(QueryAtomOption.SubstitutionCount).hover();
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
    await SettingsDialog(page).setOptionValue(BondsSetting.BondLength, '50');
    await SettingsDialog(page).setOptionValue(BondsSetting.BondSpacing, '50');
    await SettingsDialog(page).apply();
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page);
    await SaveStructureDialog(page).cancel();
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
      page,
      'KET/chain-with-singleup-bond.ket',
    );
    await takeEditorScreenshot(page);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 2);
    await ContextMenu(page, point).click([
      MicroBondOption.Highlight,
      HighlightOption.Green,
    ]);
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
      page,
      'KET/chain-with-double-bond.ket',
    );
    await takeEditorScreenshot(page);
    const point = await getBondByIndex(page, { type: BondType.DOUBLE }, 0);
    await ContextMenu(page, point).click([
      MicroBondOption.Highlight,
      HighlightOption.Red,
    ]);
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
      page,
      'KET/chain-with-double-bond.ket',
    );
    await takeEditorScreenshot(page);

    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 0 }),
    ).click([MicroBondOption.Highlight, HighlightOption.Red]);
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

  test('Case 22: O and U sumbols are supported in sequence mode', async ({
    SequenceCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5621
     * Description: O and U sumbols are supported in sequence mode.
     * Scenario:
     * 1. Toggle to Macro - Sequence mode -> Switch to PEP (Peptides)
     * 2. Start new sequence
     * 3. Add O and U symbols to the sequence
     */
    await MacromoleculesTopToolbar(page).peptides();
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
    const setACSSettings = SettingsDialog(page).setACSSettingsButton;
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await TopRightToolbar(page).Settings({ waitForFontListLoad: true });
    await expect(setACSSettings).toBeVisible();
    await expect(setACSSettings).toHaveText('Set ACS Settings');
    await takeEditorScreenshot(page, {
      mask: [SettingsDialog(page).resetButton],
    });
  });

  test('Case 24: Bond/monomer tooltip preview placed correct in on edge cases', async ({
    FlexCanvas: _,
  }) => {
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
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Bond tooltip preview placed wrong in on edge cases.ket',
    );
    await CommonTopRightToolbar(page).setZoomInputValue('75');
    await resetCurrentTool(page);
    await getMonomerLocator(page, Peptide.Cys_Bn).hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
    await getMonomerLocator(page, Sugar._25mo3r).hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
    await getMonomerLocator(page, Phosphate.msp).hover();
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
    const middleOfTheScreen = await getCachedBodyCenter(page);
    await waitForRender(page, async () => {
      await ContextMenu(page, middleOfTheScreen).click(
        MultiTailedArrowOption.AddNewTail,
      );
    });
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

  test('Case 26: Edit Connection points dialog cant cause invalid connection between monomers', async ({
    FlexCanvas: _,
  }) => {
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
    await openFileAndAddToCanvasMacro(page, 'KET/two-nucleotides.ket');
    await ContextMenu(page, bondLine).click(
      MacroBondOption.EditConnectionPoints,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
    await page.getByRole('button', { name: 'R2' }).first().click();
    await page.getByRole('button', { name: 'R1' }).nth(1).click();
    await pressButton(page, 'Reconnect');
    await ContextMenu(page, bondLine).click(
      MacroBondOption.EditConnectionPoints,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
    });
  });

  test('Case 27: Atom/Bond selection not remains on the canvas after clear canvas', async ({
    FlexCanvas: _,
  }) => {
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
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Bond properties are not implemented.ket',
    );
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await resetZoomLevelToDefault(page);
    await takeEditorScreenshot(page);
  });

  test('Case 28: Cursor position is correct when editing sequence in Macro mode', async ({
    SequenceCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5725
     * Description: Cursor position is correct when editing sequence in Macro mode.
     * Scenario:
     * 1. Open Ketcher and switch to Macro mode
     * 2. Add a sequence of monomers to the canvas
     * 3. Right-click on a monomer ( or double click ) in the sequence (e.g., the 8th monomer) and start editing the sequence
     */
    await keyboardTypeOnCanvas(page, 'AAAAAAAAAAAAA');
    await page.keyboard.press('Escape');
    await resetZoomLevelToDefault(page);
    await getSymbolLocator(page, {
      symbolAlias: 'A',
      nodeIndexOverall: 7,
    }).dblclick();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 29: Bonds between micro and macro structures can be selected and deleted in Macro mode', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5686
     * Description: Bonds between micro and macro structures can be selected and deleted in Macro mode
     * Scenario:
     * 1. Open Ketcher and switch to Macro mode
     * 2. Open a file with a macro structure that has bonds to micro structures
     * 3. Select all structures on the canvas
     * 4. Delete the selected structures
     * 5. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Bonds between micro and macro structures can be selected and deleted.ket',
    );
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
  });

  test('Case 30: Micro structures connected to polymer chains are shown on Sequence mode canvas', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5673
     * Description: Micro structures connected to polymer chains are shown on Sequence mode canvas
     * Scenario:
     * 1. Open Ketcher and switch to Macro mode - Flex
     * 2. Open a file with a macro structure that has bonds to micro structures
     * 3. Switch to Macro mode - Sequence
     * 4. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Micro structures connected to polymer chains are not shown on Sequence mode canvas.ket',
    );
    await takeEditorScreenshot(page);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await takeEditorScreenshot(page);
  });

  test('Case 31: Moving of selected microstructures on macro canvas works correct', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5659
     * Description: Moving of selected microstructures on macro canvas works correct
     * Scenario:
     * 1. Open Ketcher and switch to Macro mode - Flex
     * 2. Load a file with microstructures on macro canvas
     * 3. Select all (press Ctrl+A)
     * 4. Move selected structures to the right
     * 5. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Bond properties are not implemented.ket',
    );
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await page
      .locator('g')
      .filter({ hasText: /^NH2$/ })
      .locator('rect')
      .nth(1)
      .hover();
    await dragMouseTo(600, 350, page);
    await takeEditorScreenshot(page);
  });

  test('Case 32: Atoms and bonds is highlighted when the whole molecule with atoms is choosen', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5668
     * Description: Atoms and bonds is highlighted when the whole molecule with atoms is choosen
     * Scenario:
     * 1. Open Ketcher Micro mode
     * 2. Load a file
     * 3. Select all
     * 4. Highlight the selected structure
     * 5. Take screenshot
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/benzene-ring-with-atoms.ket',
    );
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'N', atomId: 0 }),
    ).click([MicroBondOption.Highlight, HighlightOption.Green]);
    await clickOnCanvas(page, 100, 100, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Case 33: Able to select Erase tool after expanding macromolecule abbreviation in Micro mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5662
     * Description: Able to select Erase tool after expanding macromolecule abbreviation in Micro mode
     * Scenario:
     * 1. Open Ketcher Micro mode
     * 2. Load a file
     * 3. Expand macromolecule abbreviation
     * 4. Select Erase tool
     * 5. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/monomers-cycled.ket',
    );
    await takeEditorScreenshot(page);
    await expandMonomer(page, getAbbreviationLocator(page, { name: '1Nal' }));
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await takeLeftToolbarScreenshot(page);
  });

  test('Case 34: Clear canvas work for micro structures on macro mode', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5657
     * Description: Clear canvas work for micro structures on macro mode
     * Scenario:
     * 1. Toggle to Macro - Flex mode
     * 2. Load from file
     * 3. Press Clear canvas button
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Bond properties are not implemented.ket',
    );
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
  });

  test('Case 35: The reaction with catalysts is displayed correct with ACS style setting and after layout', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5650
     * Description: The reaction with catalysts is displayed correct with ACS style setting and after layout.
     * Scenario:
     * 1. Add reaction to the Canvas
     * 2. Click on ACS Style button in the Settings
     * 3. Click on Apply button in the Settings
     * 4. Click on layout
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/error with cat and arr.ket',
    );
    await takeEditorScreenshot(page);
    await TopRightToolbar(page).Settings({ waitForFontListLoad: true });
    await SettingsDialog(page).setACSSettings();
    await SettingsDialog(page).apply();
    await pressButton(page, 'OK');
    await takeEditorScreenshot(page);
  });

  test('Case 36: After save and load a MOL V3000 file in macro and micro mode, bond connections are not changed, and the microstructures are not shifted', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5887
     * Description: After save and load a MOL V3000 file in macro and micro mode, bond connections are not changed, and the microstructures are not shifted.
     * Scenario:
     * 1. Open file in micro mode
     * 2. Switch to Macro mode->Flex mode
     * 3. Save to MOL V3000
     * 4. Open saved file
     * 5. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/monomers-connected-to-microstructures.ket',
    );
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    await verifyFileExport(
      page,
      'Molfiles-V3000/monomers-connected-to-microstructures-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/monomers-connected-to-microstructures-expected.mol',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 37: Loading a KET file in macro mode, bond connections are preserved and microstructures are not shifted', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5886
     * Description: Loading a KET file in macro mode, bond connections are preserved and microstructures are not shifted.
     * Scenario:
     * 1. Open file in macro mode->Flex mode
     * 2. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/monomers-connected-to-microstructures.ket',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 38: R-Group fragment labels font size defined by Sub Font size property at Settings', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5836
     * Description: R-Group fragment labels font size defined by Sub Font size property at Settings.
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Go to Settings - General tab
     * 4. Set Font size to 30 pt, Sub font size to 30 pt and Font to Courier New
     * 5. Click on layout Apply
     * 6. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/R-Group fragment labels font size defined by Sub Font size property at Settings.ket',
    );
    await takeEditorScreenshot(page);
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.Font,
      FontOption.CourierNew,
    );
    await SettingsDialog(page).apply();
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.FontSizeUnits,
        value: MeasurementUnit.Pt,
      },
      {
        option: GeneralSetting.FontSize,
        value: '30',
      },
      {
        option: GeneralSetting.SubFontSizeUnits,
        value: MeasurementUnit.Pt,
      },
      {
        option: GeneralSetting.SubFontSize,
        value: '30',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Case 39: S-Group (Data type) Field value label font size uses Settings - Font size property value instead of Sub font size one', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5834
     * Description: S-Group (Data type) Field name and value labels remain unchanged and controlled by Sub font size setting.
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Go to Settings - General tab
     * 4. Set Font size to 20 pt
     * 5. Click on layout Apply
     * 6. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Group (Data type) Field value label font size.ket',
    );
    await takeEditorScreenshot(page);
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.FontSizeUnits,
        value: MeasurementUnit.Pt,
      },
      {
        option: GeneralSetting.FontSize,
        value: '20',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Case 40: Importing functional groups (e.g. Boc, Bn, CF3) not ignores drawing settings (e.g. ACS style)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5833
     * Description: Importing functional groups (e.g. Boc, Bn, CF3) not ignores drawing settings (e.g. ACS style).
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Go to Settings - General tab
     * 4. Set Font size to 30 pt and Font to Courier New
     * 5. Click on layout Apply
     * 6. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Importing functional groups (e.g. Boc, Bn, CF3) ignores drawing settings (e.g. ACS style) and is bolded.ket',
    );
    await takeEditorScreenshot(page);
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.Font,
      FontOption.CourierNew,
    );
    await SettingsDialog(page).apply();
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.FontSizeUnits,
        value: MeasurementUnit.Pt,
      },
      {
        option: GeneralSetting.FontSize,
        value: '30',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Case 41: System opens correct context menu for monomers on micro canvas if clicked on atom or bond', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5809
     * Description: System opens correct context menu for monomers on micro canvas if clicked on atom or bond.
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Right click on appeared monomer and click on Expand monomer at context menu
     * 4. Right click on any bond or atom
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/5. Unsplit nucleotide 5hMedC (from library).ket',
    );
    await takeEditorScreenshot(page);
    await expandMonomer(page, getAbbreviationLocator(page, { name: '5hMedC' }));
    await takeEditorScreenshot(page);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'N', atomId: 13 }),
    ).open();
    await takeEditorScreenshot(page);
  });

  test('Case 42: After bulk deletion of monomer abbreviations, Undo not returns expanded monomers', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5699
     * Description: After bulk deletion of monomer abbreviations, Undo not returns expanded monomers.
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Select all monomers on the canvas
     * 4. Erase selected monomers
     * 5. Press Undo
     * 6. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/monomers-cycled.ket');
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test('Case 43: Consistent behavior of copy-paste and cut-paste operations with macromolecule abbreviations', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5674
     * Description: All selected macromolecule abbreviations should be copied or cut and pasted consistently, maintaining their original structure and positioning.
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Select all monomers on the canvas
     * 4. Select all abbreviations and copy/paste
     * 5. Select all abbreviations and cut/paste
     * 6. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/not-cycled-sequence.ket',
    );
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, 500, 650, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await takeEditorScreenshot(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, 500, 550, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Case 44: The diagonal bond in the molecule is displayed correct with ACS style', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5685
     * Description: The diagonal bond in the molecule is displayed correct with ACS style.
     * Scenario:
     * 1. Add reaction to the Canvas
     * 2. Click on ACS Style button in the Settings
     * 3. Click on Apply button in the Settings
     * 4. Click on layout
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/The diagonal bond in the molecule is displayed incorrect with ACS style.ket',
    );
    await takeEditorScreenshot(page);
    await TopRightToolbar(page).Settings({ waitForFontListLoad: true });
    await SettingsDialog(page).setACSSettings();
    await SettingsDialog(page).apply();
    await pressButton(page, 'OK');
    await takeEditorScreenshot(page);
  });

  test('Case 45: Open Angel Arrows not changed to Multi-tail arrow after layout', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/Indigo/issues/2496
     * Description: Open Angel Arrows not changed to Multi-tail arrow after layout.
     * Scenario:
     * 1. Add reaction to the Canvas
     * 2. Click on layout
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Open Angel Arrows changed to Multi-tail arrow after layout.ket',
    );
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Case 46: The atom is not colored with the parameter render-coloring=false when saving to png or svg', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/Indigo/issues/2441
     * Description: The atom is not colored with the parameter render-coloring=false when saving to png or svg.
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Go to Settings - General tab
     * 4. Switch Atom coloring to off in the Settings
     * 5. Click on Apply
     * 6. Save to PNG (or SVG)
     * 7. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-ring-with-colored-atoms.ket',
    );
    await takeEditorScreenshot(page);
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(GeneralSetting.AtomColoring);
    await SettingsDialog(page).apply();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page);
    await SaveStructureDialog(page).cancel();
  });

  test('Case 47: "Unordered_map::at: key not found" error is not displayed after adding of specific reactions from the RDF file', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/Indigo/issues/2411
     * Description: "Unordered_map::at: key not found" error is not displayed after adding of specific reactions from the RDF file.
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProject(page, 'RDF-V2000/issue-load.rdf');
    await takeEditorScreenshot(page);
  });

  test('Case 48: System shouldnt allow user to export alternatives ambiguous monomers to IDT (since only mixtures are supported)', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/Indigo/issues/2440
     * Description: System shouldnt allow user to export alternatives ambiguous monomers to IDT (since only mixtures are supported).
     * System throws an error: Alternatives ambiguous monomers on the canvas souldn't be saved to IDT, only mixtures allowed
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Load from file
     * 3. Click on Save to IDT
     * 4. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous DNA Bases (alternatives).ket',
    );
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.IDT,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 49: The reaction with reverse retrosynthetic arrow is displayed correct after clicking on Aromatize, Dearomatize, Calculate CIP, Add explicit hydrogens', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/Indigo/issues/2409
     * Description: The reaction with reverse retrosynthetic arrow is displayed correct after clicking on Aromatize, Dearomatize, Calculate CIP, Add explicit hydrogens
     * The reaction is not changed the direction and location and Aromatize, Dearonatize, Calculate CIP, Add explicit hydrogens are applied correctly
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Click on Aromatize
     * 4. Click on Dearomatize
     * 5. Click on Calculate CIP
     * 6. Click on Add explicit hydrogens
     * 7. Take screenshot
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/error with aromatize v2.ket',
    );
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).aromatize();
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).dearomatize();
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).addRemoveExplicitHydrogens();
    await takeEditorScreenshot(page);
  });

  // test('Case 50: The retrosynthetic arrow is displayed when export file in CDXML format and arrow is vertical', async () => {
  //   /*
  //    * Test case: https://github.com/epam/ketcher/issues/6947
  //    * Bug: https://github.com/epam/Indigo/issues/2219
  //    * Description: The retrosynthetic arrow is displayed when export file in CDXML format and arrow is vertical
  //    * Scenario:
  //    * 1. Go to Micro
  //    * 2. Load from file
  //    * 3. Click on Aromatize
  //    * 4. Click on Dearomatize
  //    * 5. Click on Calculate CIP
  //    * 6. Click on Add explicit hydrogens
  //    * 7. Take screenshot
  //    */
  //   await openFileAndAddToCanvasAsNewProjectMacro(page, 'KET/arr vert.ket');
  //   await takeEditorScreenshot(page);
  //   await verifyFileExport(
  //     page,
  //     'CDXML/arr vert-expected.cdxml',
  //     FileType.CDXML,
  //   );
  //   await openFileAndAddToCanvasAsNewProject(
  //     page,
  //     'CDXML/arr vert-expected.cdxml',
  //   );
  //   await takeEditorScreenshot(page);
  // });

  // test('Case 51: Reaction loaded without changing order of components for CDXML format and two retrosynthetic arrows', async () => {
  //   /*
  //    * Test case: https://github.com/epam/ketcher/issues/6947
  //    * Bug: https://github.com/epam/Indigo/issues/2217
  //    * Description: Reaction loaded without changing order of components for CDXML format and two retrosynthetic arrows
  //    * Scenario:
  //    * 1. Go to Micro
  //    * 2. Load from file
  //    * 3. Export to CDXML
  //    * 4. Load exported file
  //    * 5. Take screenshot
  //    */
  //   await openFileAndAddToCanvasAsNewProject(page, 'KET/4 mol.ket');
  //   await takeEditorScreenshot(page);
  //   await verifyFileExport(page, 'CDXML/4 mol-expected.cdxml', FileType.CDXML);
  //   await openFileAndAddToCanvasAsNewProject(
  //     page,
  //     'CDXML/4 mol-expected.cdxml',
  //   );
  //   await takeEditorScreenshot(page);
  // });

  test('Case 52: Arrow not changes direction after loading saved RXN single reaction if the elements were too close to single arrow on save', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/Indigo/issues/2493
     * Description: Arrow not changes direction after loading saved RXN single reaction if the elements were too close to single arrow on save
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Export to RXN
     * 4. Load exported file
     * 5. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/elements-too-close-to-single-arrow.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'Rxn-V3000/elements-too-close-to-single-arrow-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V3000/elements-too-close-to-single-arrow-expected.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 53: The arrow is displayed In the right direction after importing from rxn file', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/Indigo/issues/2479
     * Description: The arrow is displayed In the right direction after importing from rxn file
     * Scenario:
     * 1. Go to Micro
     * 2. Load from RXN file
     * 5. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/The error is displayed to another side after importing from rxn file.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 54: The arrow is displayed correct (right direction) when import from rxn file', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/Indigo/issues/2478
     * Description: The arrow is displayed correct (right direction) when import from rxn file
     * Scenario:
     * 1. Go to Micro
     * 2. Load from RXN file
     * 5. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/The arrow is displayed incorrect when import from rxn file.rxn',
    );
    await takeEditorScreenshot(page);
  });

  // test('Case 55: Able to save canvas to CDX - system not throws an error: Convert error! array: invalid index 2 (size=2)', async () => {
  //   /*
  //    * Test case: https://github.com/epam/ketcher/issues/6947
  //    * Bug: https://github.com/epam/Indigo/issues/2558
  //    * Description: Able to save canvas to CDX - system not throws an error: Convert error! array: invalid index 2 (size=2)
  //    * Scenario:
  //    * 1. Go to Micro
  //    * 2. Load from file
  //    * 3. Export to CDX
  //    * 4. Load exported file
  //    * 5. Take screenshot
  //    */
  //   await openFileAndAddToCanvasAsNewProject(page, 'KET/4 mol.ket');
  //   await takeEditorScreenshot(page);
  //   await verifyFileExport(page, 'CDX/4 mol-expected.cdx', FileType.CDX);
  //   const fileContent = await readFileContent('CDX/4 mol-expected.cdx');
  //   await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
  //   await takeEditorScreenshot(page);
  // });

  test('Case 56: Correct length of Multi-Tailed Arrow and Single arrow after loading from RDF', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/Indigo/issues/2555
     * Description: Correct length of Multi-Tailed Arrow and Single arrow after loading from RDF
     * Scenario:
     * 1. Go to Micro
     * 2. Load from RDF file
     * 3. Export to KET
     * Total length of Multi-Tailed Arrow is 7
     * Length of tail is 0.5
     * Length of head arrow is 6.5
     * Total length of the single arrow is 7
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'RDF-V2000/rdf-rxn-v2000-cascade-reaction-2-1-1.rdf',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/rdf-rxn-v2000-cascade-reaction-2-1-1-expected(2).ket',
      FileType.KET,
    );
  });

  test('Case 57: Can correctly save specific cascade reaction with 3 tails to RDF V3000', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/Indigo/issues/2551
     * Description: Can correctly save specific cascade reaction with 3 tails to RDF V3000
     * Scenario:
     * 1. Go to Micro
     * 2. Load from KET file
     * 3. Export to RDF V3000
     * 4. Load exported file
     * 5. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/ket-cascade-reaction-tails-5-with-pluses (1).ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'RDF-V3000/ket-cascade-reaction-tails-5-with-pluses (1)-expected.rdf',
      FileType.RDF,
      RdfFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'RDF-V3000/ket-cascade-reaction-tails-5-with-pluses (1)-expected.rdf',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 58: Specific 1:1 reaction is added to Canvas from RXN with correct positions of elements', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/Indigo/issues/2531
     * Description: Specific 1:1 reaction is added to Canvas from RXN with correct positions of elements
     * Scenario:
     * 1. Go to Micro
     * 2. Load from RXN file
     * 3. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProject(page, 'Rxn-V2000/rxn-1x1.rxn');
    await takeEditorScreenshot(page);
  });

  test('Case 59: The reaction with reaction mapping tool is displayed correct with ACS Style settings', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/Indigo/issues/2501
     * Description: The reaction with reaction mapping tool is displayed correct with ACS Style settings
     * Scenario:
     * 1. Go to Micro
     * 2. Load from KET file
     * 3. Click on ACS Style button in the Settings
     * 4. Click on Apply button in the Settings
     * 5. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/The reaction with reaction mapping tool is displayed incorrect.ket',
    );
    await takeEditorScreenshot(page);
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setACSSettings();
    await SettingsDialog(page).apply();
    await pressButton(page, 'OK');
    await takeEditorScreenshot(page);
  });

  test('Case 60: Single reaction with Multi-Tailed arrow is not corrupted after loading from RXN if the elements were too close to arrow on save', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/Indigo/issues/2485
     * Description: Single reaction with Multi-Tailed arrow is not corrupted after loading from RXN if the elements were too close to arrow on save
     * Scenario:
     * 1. Go to Micro
     * 2. Load from KET file
     * 3. Click on Save to RXN
     * 4. Copy RXN from the preview and paste to Canvas
     * 5. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/elements were too close to arrow on save.ket',
    );
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.MDLRxnfileV3000,
    );
    await moveMouseToTheMiddleOfTheScreen(page);
    await copyToClipboardByIcon(page);
    await closeErrorAndInfoModals(page);
    await pasteFromClipboardByKeyboard(page);
    await moveMouseAway(page);
    await clickOnCanvas(page, 300, 200, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Case 61: When several reactions on canvas are positioned one under another, reaction(s) can be saved correctly to RXN V2000', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/Indigo/issues/2454
     * Description: When several reactions on canvas are positioned one under another, reaction(s) can be saved correctly to RXN V2000
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Export to RXN
     * 4. Load exported file
     * 5. Take screenshot
     * Only one reaction should be saved to RXN (the set of separate reactions should be saved to RDF)
     */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/ket-issue-2.ket');
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'Rxn-V2000/ket-issue-2-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/ket-issue-2-expected.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 62: When several reactions on canvas are positioned one under another, reaction(s) can be saved correctly to RDF V3000', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/Indigo/issues/2454
     * Description: When several reactions on canvas are positioned one under another, reaction(s) can be saved correctly to RDF V3000
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Export to RDF
     * 4. Load exported file
     * 5. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/ket-issue-2.ket');
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'RDF-V3000/ket-issue-2-expected.rdf',
      FileType.RDF,
      RdfFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'RDF-V3000/ket-issue-2-expected.rdf',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 63: Reactions not change the ordering on canvas after layout', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/Indigo/issues/2452
     * Description: Reactions not change the ordering on canvas after layout
     * Scenario:
     * 1. Go to Micro
     * 2. Load from file
     * 3. Press Layout button
     * 4. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/2-reactions.ket');
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Case 64: Sub font size is correct when save to PNG', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/Indigo/issues/2446
     * Description: Sub font size is correct when save to PNG.
     * Scenario:
     * 1. Open Micro
     * 2. Add Chain to Canvas
     * 3. Go to Settings - General tab
     * 4. Set 30 pt to the Sub Font size in the Settings
     * 5. Click on Apply
     * 6. Save to PNG
     * 7. Take screenshot
     */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/simple-chain.ket');
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(GeneralSetting.SubFontSize, '30');
    await SettingsDialog(page).apply();
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await takeEditorScreenshot(page);
    await SaveStructureDialog(page).cancel();
  });

  test('Case 65: System should throw an error in case of wrong IUBcode', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/Indigo/issues/2331
     * Description: System should throw an error in case of wrong IUBcode.
     * Scenario:
     * 1. Toggle to Macro - Flex mode
     * 2. Load IDT from paste from clipboard way: (YY:00330067)
     */
    await pasteFromClipboardAndAddToCanvas(page, '(YY:00330067)', true);
    await takeEditorScreenshot(page);
  });

  test('Case 66: Sugar R should not save in the IDT format', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/Indigo/issues/2122
     * Description: Sugar R should not save in the IDT format.
     * Scenario:
     * 1. Toggle to Macro - Flex mode
     * 2. Add Sugar R to Canvas
     * 3. Save to IDT
     * 4. Take screenshot
     */
    await Library(page).dragMonomerOnCanvas(Sugar.R, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.IDT,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});
