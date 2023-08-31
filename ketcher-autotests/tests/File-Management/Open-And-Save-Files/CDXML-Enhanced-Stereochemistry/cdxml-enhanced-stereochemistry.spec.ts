import { Page, expect, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  LeftPanelButton,
  pressButton,
  selectLeftPanelButton,
  receiveFileComparisonData,
  saveToFile,
  clickOnAtom,
} from '@utils';
import { getCdxml } from '@utils/formats';

async function selectRadioButtonForNewGroup(
  page: Page,
  selectRadioButton: string,
  cancelChanges = false,
) {
  await selectLeftPanelButton(LeftPanelButton.Stereochemistry, page);
  await page.getByLabel(selectRadioButton).check();

  await pressButton(page, cancelChanges ? 'Cancel' : 'Apply');
}

test.describe('CDXML Enhanced Stereochemistry', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Adding AND stereo marks to structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4724
    Description: The structure is opened correctly
    New 'And Group' label added to structure.
    */
    await openFileAndAddToCanvas('Molfiles-V2000/stereo-test.mol', page);
    await selectRadioButtonForNewGroup(page, 'Create new AND Group');
  });

  test('Adding OR stereo marks to structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4728
    Description: The structure is opened correctly
    New 'OR Group' label added to structure.
    */
    await openFileAndAddToCanvas('Molfiles-V2000/stereo-test.mol', page);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');
  });

  test('Adding Mixed AND stereo marks to structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4725
    Description: The structure is opened correctly
    'Mixed AND' label added to structure.
    */
    const anyAtom = 2;
    await openFileAndAddToCanvas('Molfiles-V2000/stereo-test.mol', page);
    await clickOnAtom(page, 'C', anyAtom);
    await selectRadioButtonForNewGroup(page, 'Create new AND Group');
  });

  test('Adding Mixed OR stereo marks to structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4726
    Description: The structure is opened correctly
    'Mixed OR' label added to structure.
    */
    const anyAtom = 2;
    await openFileAndAddToCanvas('Molfiles-V2000/stereo-test.mol', page);
    await clickOnAtom(page, 'C', anyAtom);
    await selectRadioButtonForNewGroup(page, 'Create new OR Group');
  });
});

test.describe('CDXML Enhanced Stereochemistry', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('AND stereo marks - Save as *.cdxml file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4724
    Description: The structure is saved/opened correctly as *.cdxml file. 
    All enhanced stereochemistry features are present after opening.
    */
    await openFileAndAddToCanvas('CDXML/stereo-and-structure.cdxml', page);
    const expectedFile = await getCdxml(page);
    await saveToFile('CDXML/stereo-and-structure-expected.cdxml', expectedFile);

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/stereo-and-structure-expected.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
  });

  test('OR stereo marks - Save as *.cdxml file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4728
    Description: The structure is saved/opened correctly as *.cdxml file. 
    All enhanced stereochemistry features are present after opening.
    */
    await openFileAndAddToCanvas('CDXML/stereo-or-structure.cdxml', page);
    const expectedFile = await getCdxml(page);
    await saveToFile('CDXML/stereo-or-structure-expected.cdxml', expectedFile);

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/stereo-or-structure-expected.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
  });

  test('Mixed AND stereo marks - Save as *.cdxml file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4725
    Description: The structure is saved/opened correctly as *.cdxml file. 
    All enhanced stereochemistry features are present after opening.
    */
    await openFileAndAddToCanvas('CDXML/mixed-and-stereo-marks.cdxml', page);
    const expectedFile = await getCdxml(page);
    await saveToFile(
      'CDXML/mixed-and-stereo-marks-expected.cdxml',
      expectedFile,
    );

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/mixed-and-stereo-marks-expected.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
  });

  test('Mixed OR stereo marks - Save as *.cdxml file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4726
    Description: The structure is saved/opened correctly as *.cdxml file. 
    All enhanced stereochemistry features are present after opening.
    */
    await openFileAndAddToCanvas('CDXML/mixed-or-stereo-marks.cdxml', page);
    const expectedFile = await getCdxml(page);
    await saveToFile(
      'CDXML/mixed-or-stereo-marks-expected.cdxml',
      expectedFile,
    );

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/mixed-or-stereo-marks-expected.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
  });

  test('Mixed stereo marks - Save as *.cdxml file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4727
    Description: The structure is saved/opened correctly as *.cdxml file. 
    All enhanced stereochemistry features are present after opening.
    */
    await openFileAndAddToCanvas('CDXML/mixed-stereo-marks.cdxml', page);
    const expectedFile = await getCdxml(page);
    await saveToFile('CDXML/mixed-stereo-marks-expected.cdxml', expectedFile);

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/mixed-stereo-marks-expected.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
  });
});
