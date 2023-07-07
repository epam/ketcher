/* eslint-disable no-magic-numbers */
import { Page, expect, test } from '@playwright/test';
import {
  selectTopPanelButton,
  openFileAndAddToCanvas,
  TopPanelButton,
  takeEditorScreenshot,
  receiveFileComparisonData,
  saveToFile,
  selectLeftPanelButton,
  LeftPanelButton,
  pressButton,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  resetAllSettingsToDefault,
  selectRing,
  RingButton,
  clickInTheMiddleOfTheScreen,
  selectBond,
  BondTypeName,
  clickOnAtom,
  delay,
  DELAY_IN_SECONDS,
} from '@utils';
import { getKet, getMolfile } from '@utils/formats';

async function selectLabelDisplayAtStereogenicCenters(
  page: Page,
  label: string,
) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await page.getByText('Stereochemistry', { exact: true }).click();
  await pressButton(page, 'IUPAC style');
  await page.getByRole('option', { name: label }).click();
  await pressButton(page, 'Apply');
}

async function selectColorOfStereogenicCenters(page: Page, color: string) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await page.getByText('Stereochemistry', { exact: true }).click();
  await pressButton(page, 'Labels Only');
  await page.getByRole('option', { name: color }).click();
  await pressButton(page, 'Apply');
}

async function uncheckShowStereoFlag(page: Page) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await page.getByText('Stereochemistry', { exact: true }).click();
  await page.getByText('Show the Stereo flags').click();
  await pressButton(page, 'Apply');
}

async function autoFadeCenterLabelsOff(page: Page) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await page.getByText('Stereochemistry', { exact: true }).click();
  await page.getByText('Auto fade And/Or center labels').click();
  await pressButton(page, 'Apply');
}

async function editMixedFlagText(page: Page, text: string) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await page.getByText('Stereochemistry', { exact: true }).click();
  await page.getByLabel('Text of Mixed flag').click();
  await page.getByLabel('Text of Mixed flag').fill(text);
  await pressButton(page, 'Apply');
}

async function editAbsoluteFlagText(page: Page, text: string) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await page.getByText('Stereochemistry', { exact: true }).click();
  await page.getByLabel('Text of Absolute flag').click();
  await page.getByLabel('Text of Absolute flag').fill(text);
  await pressButton(page, 'Apply');
}

async function selectRadioButtonForNewGroup(
  page: Page,
  selectRadioButton: string,
  cancelChanges = false,
) {
  await selectLeftPanelButton(LeftPanelButton.Stereochemistry, page);
  await page.getByLabel(selectRadioButton).check();

  await pressButton(page, cancelChanges ? 'Cancel' : 'Apply');
}

test.describe('Enhanced Stereochemistry Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('OR stereo mark assignment', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2219
    Description: The 'Enhanced Stereochemistry' window is closed. The 'or1' stereo mark appears
    next to the selected stereocenter.
    */
    await openFileAndAddToCanvas('stereo-structure-enchanced.mol', page);
    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group', true);

    await selectRadioButtonForNewGroup(page, 'Create new OR Group');
  });

  test('OR stereo mark assignment to two stereocenters', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2219
    Description: The 'or1' and 'or2' stereo marks appear next to the selected stereocenter.
    */
    await openFileAndAddToCanvas('stereo-structure-enchanced.mol', page);
    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');

    await clickOnAtom(page, 'C', 3);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');
  });

  test('Add to OR stereo mark assignment', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2219
    Description: The 'or1' and 'or2' stereo marks appear next to the selected stereocenter.
    */
    await openFileAndAddToCanvas('stereo-structure-enchanced.mol', page);
    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');

    await clickOnAtom(page, 'C', 4);
    await selectRadioButtonForNewGroup(page, 'Add to OR1Group');
  });

  test('Add AND and OR stereo mark assignment', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2221
    Description: The '&1' and 'or1' stereo marks appear next to the selected stereocenter.
    */
    await openFileAndAddToCanvas('stereo-structure-enchanced.mol', page);
    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new AND Group');

    await clickOnAtom(page, 'C', 4);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');
  });

  test('Check Enhanced Stereochemistry modal window', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2221
    Description: The 'Enhanced Stereochemistry' window is opened.
    */
    await openFileAndAddToCanvas('stereo-structure-enchanced.mol', page);
    await clickOnAtom(page, 'C', 1);
    await selectLeftPanelButton(LeftPanelButton.Stereochemistry, page);
  });

  test('Check Enhanced Stereochemistry modal window for two structure with a stereocenter(s)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2222
    Description: The ‘Enhanced Stereochemistry’ window appears when a
    structure(s) with the correct tetrahedral stereochemistry is present on the canvas.
    */
    await openFileAndAddToCanvas('two-stereostructures.mol', page);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');
  });

  test('(Select part of structure)Check Enhanced Stereochemistry modal window for two structure with a stereocenter(s)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2222
    Description: The '&1' and 'or1' stereo marks appear next to the selected stereocenter.
    And above one structure appears 'Mixed' stereo flag.
    */
    const xDelta = 300;
    const yDelta = 600;
    await openFileAndAddToCanvas('two-stereostructures.mol', page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + xDelta, y - yDelta, page);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');
  });

  test('Radio buttons: checked', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2223
    Description: The appropriate radiobutton in the ‘Enhanced Stereochemistry’ window is checked if:
    - all stereocenters in an unselected structure have the same stereo marks;
    - all selected stereocenters have the same stereo marks.
    */
    await openFileAndAddToCanvas('same-marks-stereostructure.mol', page);
    await selectLeftPanelButton(LeftPanelButton.Stereochemistry, page);
  });

  test('Radio buttons: unchecked', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2223
    Description: All radiobuttons in the ‘Enhanced Stereochemistry’ window are unchecked if:
    - all stereocenters in an unselected structure have different stereo marks;
    - the selected stereocenters have different stereo marks.
    */
    await openFileAndAddToCanvas('different-marks-stereostructure.ket', page);
    await selectLeftPanelButton(LeftPanelButton.Stereochemistry, page);
  });

  test('AND stereo mark assignment', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2224
    Description: The 'Enhanced Stereochemistry' window is closed. The '&1' stereo mark appears
    next to the selected stereocenter.
    */
    await openFileAndAddToCanvas('stereo-structure-enchanced.mol', page);
    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new AND Group', true);

    await selectRadioButtonForNewGroup(page, 'Create new AND Group');
  });

  test('AND stereo mark assignment to two stereocenters', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2224
    Description: The '&1' and '&2' stereo marks appear next to the selected stereocenter.
    */
    await openFileAndAddToCanvas('stereo-structure-enchanced.mol', page);
    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new AND Group');

    await clickOnAtom(page, 'C', 3);
    await selectRadioButtonForNewGroup(page, 'Create new AND Group');
  });

  test('Add to AND stereo mark assignment', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2224
    Description: The '&1' and '&1' stereo marks appear next to the selected stereocenter.
    */
    await openFileAndAddToCanvas('stereo-structure-enchanced.mol', page);
    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new AND Group');

    await clickOnAtom(page, 'C', 4);
    await selectRadioButtonForNewGroup(page, 'Add to AND1Group');
  });

  test('AND stereo marks - Save as *.ket file and edit', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2261
    Description: The structure is saved/opened correctly as *.ket file.
    All enhanced stereochemistry features are present after opening.
    It's possible to edit the stereo marks assignment after opening the saved file.
    */
    await openFileAndAddToCanvas('stereo-and-structure.ket', page);
    const expectedFile = await getKet(page);
    await saveToFile('stereo-and-structure-expected.ket', expectedFile);

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/stereo-and-structure-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);

    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');

    await clickOnAtom(page, 'C', 4);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');
  });

  test('OR stereo marks - Save as *.ket file and edit', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2262
    Description: The structure is saved/opened correctly as *.ket file.
    All enhanced stereochemistry features are present after opening.
    It's possible to edit the stereo marks assignment after opening the saved file.
    */
    await openFileAndAddToCanvas('stereo-or-structure.ket', page);
    const expectedFile = await getKet(page);
    await saveToFile('stereo-or-structure-expected.ket', expectedFile);

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/stereo-or-structure-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);

    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new AND Group');

    await clickOnAtom(page, 'C', 4);
    await selectRadioButtonForNewGroup(page, 'Create new AND Group');
  });

  test('Mixed stereo marks - Save as *.ket file and edit', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2263
    Description: The structure is saved/opened correctly as *.ket file.
    All enhanced stereochemistry features are present after opening.
    It's possible to edit the stereo marks assignment after opening the saved file.
    */
    await openFileAndAddToCanvas('stereo-mixed-structure.ket', page);
    const expectedFile = await getKet(page);
    await saveToFile('stereo-mixed-structure-expected.ket', expectedFile);

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/stereo-mixed-structure-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);

    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');

    await clickOnAtom(page, 'C', 4);
    await selectRadioButtonForNewGroup(page, 'Create new AND Group');
  });

  test('Mixed AND stereo marks - Save as *.ket file and edit', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2264
    Description: The structure is saved/opened correctly as *.ket file.
    All enhanced stereochemistry features are present after opening.
    It's possible to edit the stereo marks assignment after opening the saved file.
    */
    await openFileAndAddToCanvas('mixed-and-stereomarks.ket', page);
    const expectedFile = await getKet(page);
    await saveToFile('mixed-and-stereomarks-expected.ket', expectedFile);

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/mixed-and-stereomarks-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);

    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');

    await clickOnAtom(page, 'C', 4);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');
  });

  test('Mixed OR stereo marks - Save as *.ket file and edit', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2265
    Description: The structure is saved/opened correctly as *.ket file.
    All enhanced stereochemistry features are present after opening.
    It's possible to edit the stereo marks assignment after opening the saved file.
    */
    await openFileAndAddToCanvas('mixed-or-stereomarks.ket', page);
    const expectedFile = await getKet(page);
    await saveToFile('mixed-or-stereomarks-expected.ket', expectedFile);

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/mixed-or-stereomarks-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);

    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new AND Group');

    await clickOnAtom(page, 'C', 4);
    await selectRadioButtonForNewGroup(page, 'Create new AND Group');
  });

  test('Label display styles - Classic', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2267
    Description: The '&1' and 'or1' and 'abs' stereo marks appear next to the selected stereocenter.
    */
    await openFileAndAddToCanvas('different-marks-stereostructure.ket', page);
    await selectLabelDisplayAtStereogenicCenters(page, 'Classic');
  });

  test('Label display styles - On', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2268
    Description: The '&1' and 'or1' and 'abs' stereo marks appear next to the selected stereocenter.
    */
    await openFileAndAddToCanvas('different-marks-stereostructure.ket', page);
    await selectLabelDisplayAtStereogenicCenters(page, 'On');
  });

  test('Label display styles - Off', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2269
    Description: Only stereo flag displays near the structure.
    */
    await openFileAndAddToCanvas('different-marks-stereostructure.ket', page);
    await selectLabelDisplayAtStereogenicCenters(page, 'Off');
  });

  test('Color stereogenic centers - Off', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2270
    Description: When 'Off' is selected - Stereobonds and stereo labels are displayed in black.
    */
    await openFileAndAddToCanvas('different-marks-stereostructure.ket', page);
    await selectColorOfStereogenicCenters(page, 'Off');
  });

  test('Color stereogenic centers - Labels and Bonds', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2270
    Description: When 'Labels and Bonds' is selected - Stereobonds and stereo labels are displayed in color.
    */
    await openFileAndAddToCanvas('different-marks-stereostructure.ket', page);
    await selectColorOfStereogenicCenters(page, 'Labels and Bonds');
  });

  test('Color stereogenic centers - Bonds Only', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2270
    Description: When 'Bonds Only' is selected - Stereobonds are displayed in color
    and stereo labels are displayed in black.
    */
    await openFileAndAddToCanvas('different-marks-stereostructure.ket', page);
    await selectColorOfStereogenicCenters(page, 'Bonds Only');
  });

  test('Hide/show the stereo flag', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2273
    Description: It's possible to hide the stereo flag by selecting the "off"
    option in the "Show the Stereo flags" field.
    */
    await openFileAndAddToCanvas('stereo-structure-enchanced.mol', page);
    await uncheckShowStereoFlag(page);

    await takeEditorScreenshot(page);

    await resetAllSettingsToDefault(page);
  });

  test('Label display styles - IUPAC style selected by default in settings', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2266
    Description: “IUPAC style” in Label display at stereogenic centers is selected by default.
    */
    const deltaX = 0;
    const deltaY = 50;
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('Stereochemistry', { exact: true }).click();
    await page.mouse.wheel(deltaX, deltaY);
    await delay(DELAY_IN_SECONDS.THREE);
  });

  test('Save in Molfile V2000 - If one of the saved structures had the ABS (Chiral) Flag', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2276
    Description: If one of the saved structures had the ABS (Chiral) Flag, then after
    opening the saved file, all structures will be displayed with the ABS (Chiral) Flags.
    */
    await openFileAndAddToCanvas('one-structure-with-abs-flag.mol', page);
    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile('one-structure-with-abs-flag-expected.mol', expectedFile);

    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/one-structure-with-abs-flag-expected.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Save in Molfile V2000 - If none of the structures had the ABS (Chiral) Flag', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2276
    Description: If none of the structures had the ABS (Chiral) Flag, then after opening
    the saved file, all structures will be displayed with the AND Enantiomer Flags.
    */
    await openFileAndAddToCanvas('three-structure-enantiomer.mol', page);
    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile('three-structure-enantiomer-expected.mol', expectedFile);

    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/three-structure-enantiomer-expected.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Check modal when AND/OR Group not added to structure', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2277
    Description: When no AND/OR group is present on the canvas only three settings are available:
    • ABS
    • Create new AND Group
    • Create new OR Group
    */
    await openFileAndAddToCanvas('stereo-structure-enchanced.mol', page);
    await selectLeftPanelButton(LeftPanelButton.Stereochemistry, page);
  });

  test('Check modal when AND/OR Group added to structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2277
    Description: 'Add to AND [ ] Group' setting becomes available when at least
    one AND group has been created on the canvas.
    'Add to OR [ ] Group' setting becomes available when at least
    one OR group has been created on the canvas.
    */
    await openFileAndAddToCanvas('mixed-and-or-structure.ket', page);
    await selectLeftPanelButton(LeftPanelButton.Stereochemistry, page);
  });

  test('Auto fade And/Or center labels', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2862
    Description: Labels (&) are colored and color intensity is decreasing with the number.
    */
    await openFileAndAddToCanvas('mixed-with-eight-stereocenters.ket', page);
    await takeEditorScreenshot(page);

    await autoFadeCenterLabelsOff(page);
  });

  test('Edit Absolute flag text', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2863
    Description: Stereo flag is presented as changed - ABS (Chiral)1
    */
    await openFileAndAddToCanvas('stereo-structure-enchanced.mol', page);
    await editAbsoluteFlagText(page, 'ABS (Chiral)1');
  });

  test('Edit Mixed flag text', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2863
    Description: Stereo flag - Mixed2
    */
    await editMixedFlagText(page, 'Mixed2');
    await openFileAndAddToCanvas('mixed-and-stereomarks.ket', page);
  });

  test('No overlapping of Stereo flag and structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2924
    Description: Values 'ABS' and "CH3" aren't overlapped on canvas.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectBond(BondTypeName.SingleUp, page);
    await clickOnAtom(page, 'C', 1);

    await selectBond(BondTypeName.Single, page);
    await clickOnAtom(page, 'C', 3);
  });

  test('Check removing "Chiral" label from text of absolute flag', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-8917
    Description: Stereo flag is presented as 'ABS' without 'Chiral'
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectBond(BondTypeName.SingleUp, page);
    await clickOnAtom(page, 'C', 1);
  });
});
