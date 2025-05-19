/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { TopRightToolbar } from '@tests/pages/molecules/TopRightToolbar';
import {
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  pressButton,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  resetAllSettingsToDefault,
  selectRing,
  RingButton,
  clickInTheMiddleOfTheScreen,
  clickOnAtom,
  waitForPageInit,
} from '@utils';

import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';

async function selectLabelDisplayAtStereogenicCenters(
  page: Page,
  label: string,
) {
  await TopRightToolbar(page).Settings();
  await page.getByText('Stereochemistry', { exact: true }).click();
  await page.getByTestId('stereo-label-style-input-span').click();
  await page.getByRole('option', { name: label }).click();
  await pressButton(page, 'Apply');
}

async function selectColorOfStereogenicCenters(page: Page, color: string) {
  await TopRightToolbar(page).Settings();
  await page.getByText('Stereochemistry', { exact: true }).click();
  await page.getByTestId('color-stereogenic-centers-input-span').click();
  await page.getByRole('option', { name: color }).click();
  await pressButton(page, 'Apply');
}

async function uncheckShowStereoFlag(page: Page) {
  await TopRightToolbar(page).Settings();
  await page.getByText('Stereochemistry', { exact: true }).click();
  await page.getByText('Show the Stereo flags').click();
  await pressButton(page, 'Apply');
}

async function autoFadeCenterLabelsOff(page: Page) {
  await TopRightToolbar(page).Settings();
  await page.getByText('Stereochemistry', { exact: true }).click();
  await page.getByText('Auto fade And/Or center labels').click();
  await pressButton(page, 'Apply');
}

async function editMixedFlagText(page: Page, text: string) {
  await TopRightToolbar(page).Settings();
  await page.getByText('Stereochemistry', { exact: true }).click();
  await page.getByLabel('Text of Mixed flag').click();
  await page.getByLabel('Text of Mixed flag').fill(text);
  await pressButton(page, 'Apply');
}

async function editAbsoluteFlagText(page: Page, text: string) {
  await TopRightToolbar(page).Settings();
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
  await LeftToolbar(page).stereochemistry();
  await page.getByLabel(selectRadioButton).check();

  await pressButton(page, cancelChanges ? 'Cancel' : 'Apply');
}

test.describe('Enhanced Stereochemistry Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('OR stereo mark assignment', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2219
    Description: The 'Enhanced Stereochemistry' window is closed. The 'or1' stereo mark appears
    next to the selected stereocenter.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/stereo-structure-enchanced.mol',
      page,
    );
    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group', true);

    await selectRadioButtonForNewGroup(page, 'Create new OR Group');
    await takeEditorScreenshot(page);
  });

  test('OR stereo mark assignment to two stereocenters', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2219
    Description: The 'or1' and 'or2' stereo marks appear next to the selected stereocenter.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/stereo-structure-enchanced.mol',
      page,
    );
    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');

    await clickOnAtom(page, 'C', 3);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');
    await takeEditorScreenshot(page);
  });

  test('Add to OR stereo mark assignment', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2219
    Description: The 'or1' and 'or2' stereo marks appear next to the selected stereocenter.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/stereo-structure-enchanced.mol',
      page,
    );
    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');

    await clickOnAtom(page, 'C', 4);
    await selectRadioButtonForNewGroup(page, 'Add to OR1Group');
    await takeEditorScreenshot(page);
  });

  test('Add AND and OR stereo mark assignment', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2221
    Description: The '&1' and 'or1' stereo marks appear next to the selected stereocenter.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/stereo-structure-enchanced.mol',
      page,
    );
    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new AND Group');

    await clickOnAtom(page, 'C', 4);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');
    await takeEditorScreenshot(page);
  });

  test('Check Enhanced Stereochemistry modal window', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2221
    Description: The 'Enhanced Stereochemistry' window is opened.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/stereo-structure-enchanced.mol',
      page,
    );
    await clickOnAtom(page, 'C', 1);
    await LeftToolbar(page).stereochemistry();
    await takeEditorScreenshot(page);
  });

  test('Check Enhanced Stereochemistry modal window for two structure with a stereocenter(s)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2222
    Description: The ‘Enhanced Stereochemistry’ window appears when a
    structure(s) with the correct tetrahedral stereochemistry is present on the canvas.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/two-stereostructures.mol',
      page,
    );
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');
    await takeEditorScreenshot(page);
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
    await openFileAndAddToCanvas(
      'Molfiles-V2000/two-stereostructures.mol',
      page,
    );
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + xDelta, y - yDelta, page);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');
    await takeEditorScreenshot(page);
  });

  test('Radio buttons: checked', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2223
    Description: The appropriate radiobutton in the ‘Enhanced Stereochemistry’ window is checked if:
    - all stereocenters in an unselected structure have the same stereo marks;
    - all selected stereocenters have the same stereo marks.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/same-marks-stereostructure.mol',
      page,
    );
    await LeftToolbar(page).stereochemistry();
    await takeEditorScreenshot(page);
  });

  test('Radio buttons: unchecked', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2223
    Description: All radiobuttons in the ‘Enhanced Stereochemistry’ window are unchecked if:
    - all stereocenters in an unselected structure have different stereo marks;
    - the selected stereocenters have different stereo marks.
    */
    await openFileAndAddToCanvas(
      'KET/different-marks-stereostructure.ket',
      page,
    );
    await LeftToolbar(page).stereochemistry();
    await takeEditorScreenshot(page);
  });

  test('AND stereo mark assignment', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2224
    Description: The 'Enhanced Stereochemistry' window is closed. The '&1' stereo mark appears
    next to the selected stereocenter.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/stereo-structure-enchanced.mol',
      page,
    );
    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new AND Group', true);

    await selectRadioButtonForNewGroup(page, 'Create new AND Group');
    await takeEditorScreenshot(page);
  });

  test('AND stereo mark assignment to two stereocenters', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2224
    Description: The '&1' and '&2' stereo marks appear next to the selected stereocenter.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/stereo-structure-enchanced.mol',
      page,
    );
    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new AND Group');

    await clickOnAtom(page, 'C', 3);
    await selectRadioButtonForNewGroup(page, 'Create new AND Group');
    await takeEditorScreenshot(page);
  });

  test('Add to AND stereo mark assignment', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2224
    Description: The '&1' and '&1' stereo marks appear next to the selected stereocenter.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/stereo-structure-enchanced.mol',
      page,
    );
    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new AND Group');

    await clickOnAtom(page, 'C', 4);
    await selectRadioButtonForNewGroup(page, 'Add to AND1Group');
    await takeEditorScreenshot(page);
  });

  test('AND stereo marks - Save as *.ket file and edit', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2261
    Description: The structure is saved/opened correctly as *.ket file.
    All enhanced stereochemistry features are present after opening.
    It's possible to edit the stereo marks assignment after opening the saved file.
    */
    await openFileAndAddToCanvas('KET/stereo-and-structure.ket', page);

    await verifyFileExport(
      page,
      'KET/stereo-and-structure-expected.ket',
      FileType.KET,
    );

    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');

    await clickOnAtom(page, 'C', 4);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');
    await takeEditorScreenshot(page);
  });

  test('OR stereo marks - Save as *.ket file and edit', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2262
    Description: The structure is saved/opened correctly as *.ket file.
    All enhanced stereochemistry features are present after opening.
    It's possible to edit the stereo marks assignment after opening the saved file.
    */
    await openFileAndAddToCanvas('KET/stereo-or-structure.ket', page);

    await verifyFileExport(
      page,
      'KET/stereo-or-structure-expected.ket',
      FileType.KET,
    );

    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new AND Group');

    await clickOnAtom(page, 'C', 4);
    await selectRadioButtonForNewGroup(page, 'Create new AND Group');
    await takeEditorScreenshot(page);
  });

  test('Mixed stereo marks - Save as *.ket file and edit', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2263
    Description: The structure is saved/opened correctly as *.ket file.
    All enhanced stereochemistry features are present after opening.
    It's possible to edit the stereo marks assignment after opening the saved file.
    */
    await openFileAndAddToCanvas('KET/stereo-mixed-structure.ket', page);

    await verifyFileExport(
      page,
      'KET/stereo-mixed-structure-expected.ket',
      FileType.KET,
    );

    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');

    await clickOnAtom(page, 'C', 4);
    await selectRadioButtonForNewGroup(page, 'Create new AND Group');
    await takeEditorScreenshot(page);
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
    await openFileAndAddToCanvas('KET/mixed-and-stereomarks.ket', page);

    await verifyFileExport(
      page,
      'KET/mixed-and-stereomarks-expected.ket',
      FileType.KET,
    );

    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');

    await clickOnAtom(page, 'C', 4);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');
    await takeEditorScreenshot(page);
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
    await openFileAndAddToCanvas('KET/mixed-or-stereomarks.ket', page);

    await verifyFileExport(
      page,
      'KET/mixed-or-stereomarks-expected.ket',
      FileType.KET,
    );

    await clickOnAtom(page, 'C', 1);
    await selectRadioButtonForNewGroup(page, 'Create new AND Group');

    await clickOnAtom(page, 'C', 4);
    await selectRadioButtonForNewGroup(page, 'Create new AND Group');
    await takeEditorScreenshot(page);
  });

  test('Label display styles - Classic', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2267
    Description: The '&1' and 'or1' and 'abs' stereo marks appear next to the selected stereocenter.
    */
    await openFileAndAddToCanvas(
      'KET/different-marks-stereostructure.ket',
      page,
    );
    await selectLabelDisplayAtStereogenicCenters(page, 'Classic');
    await takeEditorScreenshot(page);
  });

  test('Label display styles - On', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2268
    Description: The '&1' and 'or1' and 'abs' stereo marks appear next to the selected stereocenter.
    */
    await openFileAndAddToCanvas(
      'KET/different-marks-stereostructure.ket',
      page,
    );
    await selectLabelDisplayAtStereogenicCenters(page, 'On');
    await takeEditorScreenshot(page);
  });

  test('Label display styles - Off', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2269
    Description: Only stereo flag displays near the structure.
    */
    await openFileAndAddToCanvas(
      'KET/different-marks-stereostructure.ket',
      page,
    );
    await selectLabelDisplayAtStereogenicCenters(page, 'Off');
    await takeEditorScreenshot(page);
  });

  test('Color stereogenic centers - Off', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2270
    Description: When 'Off' is selected - Stereobonds and stereo labels are displayed in black.
    */
    await openFileAndAddToCanvas(
      'KET/different-marks-stereostructure.ket',
      page,
    );
    await selectColorOfStereogenicCenters(page, 'Off');
    await takeEditorScreenshot(page);
  });

  test('Color stereogenic centers - Labels and Bonds', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2270
    Description: When 'Labels and Bonds' is selected - Stereobonds and stereo labels are displayed in color.
    */
    await openFileAndAddToCanvas(
      'KET/different-marks-stereostructure.ket',
      page,
    );
    await selectColorOfStereogenicCenters(page, 'Labels and Bonds');
    await takeEditorScreenshot(page);
  });

  test('Color stereogenic centers - Bonds Only', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2270
    Description: When 'Bonds Only' is selected - Stereobonds are displayed in color
    and stereo labels are displayed in black.
    */
    await openFileAndAddToCanvas(
      'KET/different-marks-stereostructure.ket',
      page,
    );
    await selectColorOfStereogenicCenters(page, 'Bonds Only');
    await takeEditorScreenshot(page);
  });

  test('Hide/show the stereo flag', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2273
    Description: It's possible to hide the stereo flag by selecting the "off"
    option in the "Show the Stereo flags" field.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/stereo-structure-enchanced.mol',
      page,
    );
    await uncheckShowStereoFlag(page);

    await takeEditorScreenshot(page);

    await resetAllSettingsToDefault(page);
    await takeEditorScreenshot(page);
  });

  test('Label display styles - IUPAC style selected by default in settings', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2266
    Description: “IUPAC style” in Label display at stereogenic centers is selected by default.
    */
    await TopRightToolbar(page).Settings();
    await page.getByText('General', { exact: true }).click();
    await page.getByText('Stereochemistry', { exact: true }).click();
    await takeEditorScreenshot(page);
  });

  test('Save in Molfile V2000 - If one of the saved structures had the ABS (Chiral) Flag', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2276
    Description: If one of the saved structures had the ABS (Chiral) Flag, then after
    opening the saved file, all structures will be displayed with the ABS (Chiral) Flags.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/one-structure-with-abs-flag.mol',
      page,
    );
    await verifyFileExport(
      page,
      'Molfiles-V2000/one-structure-with-abs-flag-expected.mol',
      FileType.MOL,
      'v2000',
    );
    await takeEditorScreenshot(page);
  });

  test('Save in Molfile V2000 - If none of the structures had the ABS (Chiral) Flag', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2276
    Description: If none of the structures had the ABS (Chiral) Flag, then after opening
    the saved file, all structures will be displayed with the AND Enantiomer Flags.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/three-structure-enantiomer.mol',
      page,
    );
    await verifyFileExport(
      page,
      'Molfiles-V2000/three-structure-enantiomer-expected.mol',
      FileType.MOL,
      'v2000',
    );
    await takeEditorScreenshot(page);
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
    await openFileAndAddToCanvas(
      'Molfiles-V2000/stereo-structure-enchanced.mol',
      page,
    );
    await LeftToolbar(page).stereochemistry();
    await takeEditorScreenshot(page);
  });

  test('Check modal when AND/OR Group added to structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2277
    Description: 'Add to AND [ ] Group' setting becomes available when at least
    one AND group has been created on the canvas.
    'Add to OR [ ] Group' setting becomes available when at least
    one OR group has been created on the canvas.
    */
    await openFileAndAddToCanvas('KET/mixed-and-or-structure.ket', page);
    await LeftToolbar(page).stereochemistry();
    await takeEditorScreenshot(page);
  });

  test('Auto fade And/Or center labels', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2862
    Description: Labels (&) are colored and color intensity is decreasing with the number.
    */
    await openFileAndAddToCanvas(
      'KET/mixed-with-eight-stereocenters.ket',
      page,
    );
    await takeEditorScreenshot(page);

    await autoFadeCenterLabelsOff(page);
    await takeEditorScreenshot(page);
  });

  test('Edit Absolute flag text', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2863
    Description: Stereo flag is presented as changed - ABS (Chiral)1
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/stereo-structure-enchanced.mol',
      page,
    );
    await editAbsoluteFlagText(page, 'ABS (Chiral)1');
    await takeEditorScreenshot(page);
  });

  test('Edit Mixed flag text', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2863
    Description: Stereo flag - Mixed2
    */
    await editMixedFlagText(page, 'Mixed2');
    await openFileAndAddToCanvas('KET/mixed-and-stereomarks.ket', page);
    await takeEditorScreenshot(page);
  });

  test('No overlapping of Stereo flag and structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2924
    Description: Values 'ABS' and "CH3" aren't overlapped on canvas.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.SingleUp);
    await clickOnAtom(page, 'C', 1);

    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
    await clickOnAtom(page, 'C', 3);
    await takeEditorScreenshot(page);
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
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.SingleUp);
    await clickOnAtom(page, 'C', 1);
    await takeEditorScreenshot(page);
  });
});
