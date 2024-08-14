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
  waitForPageInit,
  waitForRender,
} from '@utils';
import { getCdxml } from '@utils/formats';

async function selectRadioButtonForNewGroup(
  page: Page,
  selectRadioButton: string,
  cancelChanges = false,
) {
  await selectLeftPanelButton(LeftPanelButton.Stereochemistry, page);
  await page.getByLabel(selectRadioButton).check();

  await waitForRender(page, async () => {
    await pressButton(page, cancelChanges ? 'Cancel' : 'Apply');
  });
}

test.describe('CDXML Enhanced Stereochemistry', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
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
    await waitForPageInit(page);
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

  test('Validate that unsplit nucleotides connected with another nucleotides could be saved to Cdxml file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with another nucleotides could be saved to Cdxml file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-nucleotides.ket',
      page,
    );
    const expectedFile = await getCdxml(page);
    await saveToFile(
      'CDXML/unsplit-nucleotides-connected-with-nucleotides.cdxml',
      expectedFile,
    );

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/unsplit-nucleotides-connected-with-nucleotides.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
  });

  test('Validate that unsplit nucleotides connected with chems could be saved to Cdxml file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with chems could be saved to Cdxml file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-chems.ket',
      page,
    );
    const expectedFile = await getCdxml(page);
    await saveToFile(
      'CDXML/unsplit-nucleotides-connected-with-chems.cdxml',
      expectedFile,
    );

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/unsplit-nucleotides-connected-with-chems.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
  });

  test('Validate that unsplit nucleotides connected with bases could be saved to Cdxml file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with bases could be saved to Cdxml file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-bases.ket',
      page,
    );
    const expectedFile = await getCdxml(page);
    await saveToFile(
      'CDXML/unsplit-nucleotides-connected-with-bases.cdxml',
      expectedFile,
    );

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/unsplit-nucleotides-connected-with-bases.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
  });

  test('Validate that unsplit nucleotides connected with sugars could be saved to Cdxml file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with sugars could be saved to Cdxml file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-sugars.ket',
      page,
    );
    const expectedFile = await getCdxml(page);
    await saveToFile(
      'CDXML/unsplit-nucleotides-connected-with-sugars.cdxml',
      expectedFile,
    );

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/unsplit-nucleotides-connected-with-sugars.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
  });

  test('Validate that unsplit nucleotides connected with phosphates could be saved to Cdxml file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with phosphates could be saved to Cdxml file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-phosphates.ket',
      page,
    );
    const expectedFile = await getCdxml(page);
    await saveToFile(
      'CDXML/unsplit-nucleotides-connected-with-phosphates.cdxml',
      expectedFile,
    );

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/unsplit-nucleotides-connected-with-phosphates.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
  });

  test('Validate that unsplit nucleotides connected with peptides could be saved to Cdxml file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with peptides could be saved to Cdxml file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-peptides.ket',
      page,
    );
    const expectedFile = await getCdxml(page);
    await saveToFile(
      'CDXML/unsplit-nucleotides-connected-with-peptides.cdxml',
      expectedFile,
    );

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/unsplit-nucleotides-connected-with-peptides.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
  });

  test('Validate that simple schema with retrosynthetic arrow could be saved to Cdxml file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that schema with retrosynthetic arrow could be saved to Cdxml file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/simple-schema-with-retrosynthetic-arrow.ket',
      page,
    );
    const expectedFile = await getCdxml(page);
    await saveToFile(
      'CDXML/simple-schema-with-retrosynthetic-arrow.cdxml',
      expectedFile,
    );

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/simple-schema-with-retrosynthetic-arrow.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
  });
});
