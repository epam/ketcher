/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-magic-numbers */
import { Page, test } from '@fixtures';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { TopRightToolbar } from '@tests/pages/molecules/TopRightToolbar';
import {
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  clickInTheMiddleOfTheScreen,
  MolFileFormat,
} from '@utils';

import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import {
  resetSettingsValuesToDefault,
  setSettingsOption,
  SettingsDialog,
} from '@tests/pages/molecules/canvas/SettingsDialog';
import {
  ColorStereogenicCentersOption,
  LabelDisplayAtStereogenicCentersOption,
  SettingsSection,
  StereochemistrySetting,
} from '@tests/pages/constants/settingsDialog/Constants';
import {
  EnhancedStereochemistry,
  applyEnhancedStereochemistry,
} from '@tests/pages/molecules/canvas/EnhancedStereochemistry';
import { EnhancedStereochemistryRadio } from '@tests/pages/constants/EnhancedStereochemistry/Constants';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';

let page: Page;
test.describe('Enhanced Stereochemistry Tool', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });
  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});
  test.afterEach(async () => {
    if (await EnhancedStereochemistry(page).isVisible()) {
      await EnhancedStereochemistry(page).closeWindow();
    }
  });

  test('OR stereo mark assignment', async () => {
    /*
    Test case: EPMLSOPKET-2219
    Description: The 'Enhanced Stereochemistry' window is closed. The 'or1' stereo mark appears
    next to the selected stereocenter.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/stereo-structure-enchanced.mol',
    );
    await getAtomLocator(page, { atomLabel: 'C', atomId: 21 }).click({
      force: true,
    });
    await LeftToolbar(page).stereochemistry();
    await EnhancedStereochemistry(page).selectCreateNewOrGroup();
    await EnhancedStereochemistry(page).cancel();

    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewOrGroup,
    });
    await takeEditorScreenshot(page);
  });

  test('OR stereo mark assignment to two stereocenters', async () => {
    /*
    Test case: EPMLSOPKET-2219
    Description: The 'or1' and 'or2' stereo marks appear next to the selected stereocenter.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/stereo-structure-enchanced.mol',
    );
    await getAtomLocator(page, { atomLabel: 'C', atomId: 21 }).click({
      force: true,
    });
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewOrGroup,
    });

    await getAtomLocator(page, { atomLabel: 'C', atomId: 20 }).click({
      force: true,
    });
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewOrGroup,
    });
    await takeEditorScreenshot(page);
  });

  test('Add to OR stereo mark assignment', async () => {
    /*
    Test case: EPMLSOPKET-2219
    Description: The 'or1' and 'or2' stereo marks appear next to the selected stereocenter.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/stereo-structure-enchanced.mol',
    );
    await getAtomLocator(page, { atomLabel: 'C', atomId: 21 }).click({
      force: true,
    });
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewOrGroup,
    });

    await getAtomLocator(page, { atomLabel: 'C', atomId: 18 }).click({
      force: true,
    });
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.AddToOrGroup,
    });
    await takeEditorScreenshot(page);
  });

  test('Add AND and OR stereo mark assignment', async () => {
    /*
    Test case: EPMLSOPKET-2221
    Description: The '&1' and 'or1' stereo marks appear next to the selected stereocenter.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/stereo-structure-enchanced.mol',
    );
    await getAtomLocator(page, { atomLabel: 'C', atomId: 21 }).click({
      force: true,
    });
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewAndGroup,
    });

    await getAtomLocator(page, { atomLabel: 'C', atomId: 18 }).click({
      force: true,
    });
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewOrGroup,
    });
    await takeEditorScreenshot(page);
  });

  test('Check Enhanced Stereochemistry modal window', async () => {
    /*
    Test case: EPMLSOPKET-2221
    Description: The 'Enhanced Stereochemistry' window is opened.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/stereo-structure-enchanced.mol',
    );
    await getAtomLocator(page, { atomLabel: 'C', atomId: 21 }).click({
      force: true,
    });
    await LeftToolbar(page).stereochemistry();
    await takeEditorScreenshot(page);
  });

  test('Check Enhanced Stereochemistry modal window for two structure with a stereocenter(s)', async () => {
    /*
    Test case: EPMLSOPKET-2222
    Description: The ‘Enhanced Stereochemistry’ window appears when a
    structure(s) with the correct tetrahedral stereochemistry is present on the canvas.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/two-stereostructures.mol',
    );
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewOrGroup,
    });
    await takeEditorScreenshot(page);
  });

  test('(Select part of structure)Check Enhanced Stereochemistry modal window for two structure with a stereocenter(s)', async () => {
    /*
    Test case: EPMLSOPKET-2222
    Description: The '&1' and 'or1' stereo marks appear next to the selected stereocenter.
    And above one structure appears 'Mixed' stereo flag.
    */
    const xDelta = 300;
    const yDelta = 600;
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/two-stereostructures.mol',
    );
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + xDelta, y - yDelta, page);
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewOrGroup,
    });
    await takeEditorScreenshot(page);
  });

  test('Radio buttons: checked', async () => {
    /*
    Test case: EPMLSOPKET-2223
    Description: The appropriate radiobutton in the ‘Enhanced Stereochemistry’ window is checked if:
    - all stereocenters in an unselected structure have the same stereo marks;
    - all selected stereocenters have the same stereo marks.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/same-marks-stereostructure.mol',
    );
    await LeftToolbar(page).stereochemistry();
    await takeEditorScreenshot(page);
  });

  test('Radio buttons: unchecked', async () => {
    /*
    Test case: EPMLSOPKET-2223
    Description: All radiobuttons in the ‘Enhanced Stereochemistry’ window are unchecked if:
    - all stereocenters in an unselected structure have different stereo marks;
    - the selected stereocenters have different stereo marks.
    */
    await openFileAndAddToCanvas(
      page,
      'KET/different-marks-stereostructure.ket',
    );
    await LeftToolbar(page).stereochemistry();
    await takeEditorScreenshot(page);
  });

  test('AND stereo mark assignment', async () => {
    /*
    Test case: EPMLSOPKET-2224
    Description: The 'Enhanced Stereochemistry' window is closed. The '&1' stereo mark appears
    next to the selected stereocenter.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/stereo-structure-enchanced.mol',
    );
    await getAtomLocator(page, { atomLabel: 'C', atomId: 21 }).click({
      force: true,
    });
    await LeftToolbar(page).stereochemistry();
    await EnhancedStereochemistry(page).selectCreateNewAndGroup();
    await EnhancedStereochemistry(page).cancel();

    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewAndGroup,
    });
    await takeEditorScreenshot(page);
  });

  test('AND stereo mark assignment to two stereocenters', async () => {
    /*
    Test case: EPMLSOPKET-2224
    Description: The '&1' and '&2' stereo marks appear next to the selected stereocenter.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/stereo-structure-enchanced.mol',
    );
    await getAtomLocator(page, { atomLabel: 'C', atomId: 21 }).click({
      force: true,
    });
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewAndGroup,
    });

    await getAtomLocator(page, { atomLabel: 'C', atomId: 20 }).click({
      force: true,
    });
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewAndGroup,
    });
    await takeEditorScreenshot(page);
  });

  test('Add to AND stereo mark assignment', async () => {
    /*
    Test case: EPMLSOPKET-2224
    Description: The '&1' and '&1' stereo marks appear next to the selected stereocenter.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/stereo-structure-enchanced.mol',
    );
    await getAtomLocator(page, { atomLabel: 'C', atomId: 21 }).click({
      force: true,
    });
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewAndGroup,
    });

    await getAtomLocator(page, { atomLabel: 'C', atomId: 18 }).click({
      force: true,
    });
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.AddToAndGroup,
    });
    await takeEditorScreenshot(page);
  });

  test('AND stereo marks - Save as *.ket file and edit', async () => {
    /*
    Test case: EPMLSOPKET-2261
    Description: The structure is saved/opened correctly as *.ket file.
    All enhanced stereochemistry features are present after opening.
    It's possible to edit the stereo marks assignment after opening the saved file.
    */
    await openFileAndAddToCanvas(page, 'KET/stereo-and-structure.ket');

    await verifyFileExport(
      page,
      'KET/stereo-and-structure-expected.ket',
      FileType.KET,
    );

    await getAtomLocator(page, { atomLabel: 'C', atomId: 21 }).click({
      force: true,
    });
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewOrGroup,
    });

    await getAtomLocator(page, { atomLabel: 'C', atomId: 18 }).click({
      force: true,
    });
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewOrGroup,
    });
    await takeEditorScreenshot(page);
  });

  test('OR stereo marks - Save as *.ket file and edit', async () => {
    /*
    Test case: EPMLSOPKET-2262
    Description: The structure is saved/opened correctly as *.ket file.
    All enhanced stereochemistry features are present after opening.
    It's possible to edit the stereo marks assignment after opening the saved file.
    */
    await openFileAndAddToCanvas(page, 'KET/stereo-or-structure.ket');

    await verifyFileExport(
      page,
      'KET/stereo-or-structure-expected.ket',
      FileType.KET,
    );

    await getAtomLocator(page, { atomLabel: 'C', atomId: 21 }).click({
      force: true,
    });
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewAndGroup,
    });

    await getAtomLocator(page, { atomLabel: 'C', atomId: 18 }).click({
      force: true,
    });
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewAndGroup,
    });
    await takeEditorScreenshot(page);
  });

  test('Mixed stereo marks - Save as *.ket file and edit', async () => {
    /*
    Test case: EPMLSOPKET-2263
    Description: The structure is saved/opened correctly as *.ket file.
    All enhanced stereochemistry features are present after opening.
    It's possible to edit the stereo marks assignment after opening the saved file.
    */
    await openFileAndAddToCanvas(page, 'KET/stereo-mixed-structure.ket');

    await verifyFileExport(
      page,
      'KET/stereo-mixed-structure-expected.ket',
      FileType.KET,
    );

    await getAtomLocator(page, { atomLabel: 'C', atomId: 21 }).click({
      force: true,
    });
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewOrGroup,
    });

    await getAtomLocator(page, { atomLabel: 'C', atomId: 18 }).click({
      force: true,
    });
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewAndGroup,
    });
    await takeEditorScreenshot(page);
  });

  test('Mixed AND stereo marks - Save as *.ket file and edit', async () => {
    /*
    Test case: EPMLSOPKET-2264
    Description: The structure is saved/opened correctly as *.ket file.
    All enhanced stereochemistry features are present after opening.
    It's possible to edit the stereo marks assignment after opening the saved file.
    */
    await openFileAndAddToCanvas(page, 'KET/mixed-and-stereomarks.ket');

    await verifyFileExport(
      page,
      'KET/mixed-and-stereomarks-expected.ket',
      FileType.KET,
    );

    await getAtomLocator(page, { atomLabel: 'C', atomId: 21 }).click({
      force: true,
    });
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewOrGroup,
    });

    await getAtomLocator(page, { atomLabel: 'C', atomId: 18 }).click({
      force: true,
    });
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewOrGroup,
    });
    await takeEditorScreenshot(page);
  });

  test('Mixed OR stereo marks - Save as *.ket file and edit', async () => {
    /*
    Test case: EPMLSOPKET-2265
    Description: The structure is saved/opened correctly as *.ket file.
    All enhanced stereochemistry features are present after opening.
    It's possible to edit the stereo marks assignment after opening the saved file.
    */
    await openFileAndAddToCanvas(page, 'KET/mixed-or-stereomarks.ket');

    await verifyFileExport(
      page,
      'KET/mixed-or-stereomarks-expected.ket',
      FileType.KET,
    );

    await getAtomLocator(page, { atomLabel: 'C', atomId: 21 }).click({
      force: true,
    });
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewAndGroup,
    });

    await getAtomLocator(page, { atomLabel: 'C', atomId: 18 }).click({
      force: true,
    });
    await applyEnhancedStereochemistry(page, {
      selectRadioButton: EnhancedStereochemistryRadio.CreateNewAndGroup,
    });
    await takeEditorScreenshot(page);
  });

  test('Label display styles - Classic', async () => {
    /*
    Test case: EPMLSOPKET-2267
    Description: The '&1' and 'or1' and 'abs' stereo marks appear next to the selected stereocenter.
    */
    await openFileAndAddToCanvas(
      page,
      'KET/different-marks-stereostructure.ket',
    );
    await setSettingsOption(
      page,
      StereochemistrySetting.LabelDisplayAtStereogenicCenters,
      LabelDisplayAtStereogenicCentersOption.Classic,
    );
    await takeEditorScreenshot(page);
  });

  test('Label display styles - On', async () => {
    /*
    Test case: EPMLSOPKET-2268
    Description: The '&1' and 'or1' and 'abs' stereo marks appear next to the selected stereocenter.
    */
    await openFileAndAddToCanvas(
      page,
      'KET/different-marks-stereostructure.ket',
    );
    await setSettingsOption(
      page,
      StereochemistrySetting.LabelDisplayAtStereogenicCenters,
      LabelDisplayAtStereogenicCentersOption.On,
    );
    await takeEditorScreenshot(page);
  });

  test('Label display styles - Off', async () => {
    /*
    Test case: EPMLSOPKET-2269
    Description: Only stereo flag displays near the structure.
    */
    await openFileAndAddToCanvas(
      page,
      'KET/different-marks-stereostructure.ket',
    );
    await setSettingsOption(
      page,
      StereochemistrySetting.LabelDisplayAtStereogenicCenters,
      LabelDisplayAtStereogenicCentersOption.Off,
    );
    await takeEditorScreenshot(page);
  });

  test('Color stereogenic centers - Off', async () => {
    /*
    Test case: EPMLSOPKET-2270
    Description: When 'Off' is selected - Stereobonds and stereo labels are displayed in black.
    */
    await openFileAndAddToCanvas(
      page,
      'KET/different-marks-stereostructure.ket',
    );
    await setSettingsOption(
      page,
      StereochemistrySetting.ColorStereogenicCenters,
      ColorStereogenicCentersOption.Off,
    );
    await takeEditorScreenshot(page);
  });

  test('Color stereogenic centers - Labels and Bonds', async () => {
    /*
    Test case: EPMLSOPKET-2270
    Description: When 'Labels and Bonds' is selected - Stereobonds and stereo labels are displayed in color.
    */
    await openFileAndAddToCanvas(
      page,
      'KET/different-marks-stereostructure.ket',
    );
    await setSettingsOption(
      page,
      StereochemistrySetting.ColorStereogenicCenters,
      ColorStereogenicCentersOption.LabelsAndBonds,
    );
    await takeEditorScreenshot(page);
  });

  test('Color stereogenic centers - Bonds Only', async () => {
    /*
    Test case: EPMLSOPKET-2270
    Description: When 'Bonds Only' is selected - Stereobonds are displayed in color
    and stereo labels are displayed in black.
    */
    await openFileAndAddToCanvas(
      page,
      'KET/different-marks-stereostructure.ket',
    );
    await setSettingsOption(
      page,
      StereochemistrySetting.ColorStereogenicCenters,
      ColorStereogenicCentersOption.BondsOnly,
    );
    await takeEditorScreenshot(page);
  });

  test('Hide/show the stereo flag', async () => {
    /*
    Test case: EPMLSOPKET-2273
    Description: It's possible to hide the stereo flag by selecting the "off"
    option in the "Show the Stereo flags" field.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/stereo-structure-enchanced.mol',
    );
    await setSettingsOption(page, StereochemistrySetting.ShowTheStereoFlags);
    await takeEditorScreenshot(page);

    await resetSettingsValuesToDefault(page);
    await takeEditorScreenshot(page);
  });

  test('Label display styles - IUPAC style selected by default in settings', async () => {
    /*
    Test case: EPMLSOPKET-2266
    Description: “IUPAC style” in Label display at stereogenic centers is selected by default.
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).reset();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Stereochemistry);
    await takeEditorScreenshot(page);
  });

  test('Save in Molfile V2000 - If one of the saved structures had the ABS (Chiral) Flag', async () => {
    /*
    Test case: EPMLSOPKET-2276
    Description: If one of the saved structures had the ABS (Chiral) Flag, then after
    opening the saved file, all structures will be displayed with the ABS (Chiral) Flags.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/one-structure-with-abs-flag.mol',
    );
    await verifyFileExport(
      page,
      'Molfiles-V2000/one-structure-with-abs-flag-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('Save in Molfile V2000 - If none of the structures had the ABS (Chiral) Flag', async () => {
    /*
    Test case: EPMLSOPKET-2276
    Description: If none of the structures had the ABS (Chiral) Flag, then after opening
    the saved file, all structures will be displayed with the AND Enantiomer Flags.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/three-structure-enantiomer.mol',
    );
    await verifyFileExport(
      page,
      'Molfiles-V2000/three-structure-enantiomer-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('Check modal when AND/OR Group not added to structure', async () => {
    /*
    Test case: EPMLSOPKET-2277
    Description: When no AND/OR group is present on the canvas only three settings are available:
    • ABS
    • Create new AND Group
    • Create new OR Group
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/stereo-structure-enchanced.mol',
    );
    await LeftToolbar(page).stereochemistry();
    await takeEditorScreenshot(page);
  });

  test('Check modal when AND/OR Group added to structure', async () => {
    /*
    Test case: EPMLSOPKET-2277
    Description: 'Add to AND [ ] Group' setting becomes available when at least
    one AND group has been created on the canvas.
    'Add to OR [ ] Group' setting becomes available when at least
    one OR group has been created on the canvas.
    */
    await openFileAndAddToCanvas(page, 'KET/mixed-and-or-structure.ket');
    await LeftToolbar(page).stereochemistry();
    await takeEditorScreenshot(page);
  });

  test('Auto fade And/Or center labels', async () => {
    /*
    Test case: EPMLSOPKET-2862
    Description: Labels (&) are colored and color intensity is decreasing with the number.
    */
    await openFileAndAddToCanvas(
      page,
      'KET/mixed-with-eight-stereocenters.ket',
    );
    await takeEditorScreenshot(page);

    await setSettingsOption(
      page,
      StereochemistrySetting.AutoFadeAndOrCenterLabels,
    );
    await takeEditorScreenshot(page);
  });

  test('Edit Absolute flag text', async () => {
    /*
    Test case: EPMLSOPKET-2863
    Description: Stereo flag is presented as changed - ABS (Chiral)1
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/stereo-structure-enchanced.mol',
    );
    await setSettingsOption(
      page,
      StereochemistrySetting.TextOfAbsoluteFlag,
      'ABS (Chiral)1',
    );
    await takeEditorScreenshot(page);
  });

  test('Edit Mixed flag text', async () => {
    /*
    Test case: EPMLSOPKET-2863
    Description: Stereo flag - Mixed2
    */
    await setSettingsOption(
      page,
      StereochemistrySetting.TextOfMixedFlag,
      'Mixed2',
    );
    await openFileAndAddToCanvas(page, 'KET/mixed-and-stereomarks.ket');
    await takeEditorScreenshot(page);
  });

  test('No overlapping of Stereo flag and structure', async () => {
    /*
    Test case: EPMLSOPKET-2924
    Description: Values 'ABS' and "CH3" aren't overlapped on canvas.
    */
    await BottomToolbar(page).clickRing(RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).bondTool(MicroBondType.SingleUp);
    await getAtomLocator(page, { atomLabel: 'C', atomId: 10 }).click({
      force: true,
    });

    await CommonLeftToolbar(page).bondTool(MicroBondType.Single);
    await getAtomLocator(page, { atomLabel: 'C', atomId: 8 }).click({
      force: true,
    });

    await takeEditorScreenshot(page);
  });

  test('Check removing "Chiral" label from text of absolute flag', async () => {
    /*
    Test case: EPMLSOPKET-8917
    Description: Stereo flag is presented as 'ABS' without 'Chiral'
    */
    await BottomToolbar(page).clickRing(RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).bondTool(MicroBondType.SingleUp);
    await getAtomLocator(page, { atomLabel: 'C', atomId: 10 }).click({
      force: true,
    });
    await takeEditorScreenshot(page);
  });
});
