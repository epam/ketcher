import { expect, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  waitForPageInit,
  pasteFromClipboardAndAddToCanvas,
  pasteFromClipboardAndOpenAsNewProject,
  getSmarts,
  openFileAndAddToCanvas,
  saveToFile,
  receiveFileComparisonData,
  openFileAndAddToCanvasAsNewProject,
} from '@utils';

test.describe('Loading SMARTS files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Loading SMARTS with custom query', async ({ page }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/1358
    Description: [!#6,!#7,!#8] should be loaded as custom query without any error
    */
    const smartsStringToPaste = '[!#6,!#7,!#8]';
    await pasteFromClipboardAndOpenAsNewProject(page, smartsStringToPaste);
  });

  test('Loading SMARTS with aromatic atom list', async ({ page }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/1332
    Description: c1-[#6]=[#6]-[#6]=[#6]-[c,n]=1 should be loaded as benzene with aromatic atom list (carbon and nitrogen)
    */
    const smartsStringToPaste = 'c1-[#6]=[#6]-[#6]=[#6]-[c,n]=1';
    await pasteFromClipboardAndAddToCanvas(page, smartsStringToPaste, false);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Validate that unsplit nucleotides connected with chems could be saved to SMARTS file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with chems could be saved to SMARTS file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-chems.ket',
      page,
    );
    const expectedFile = await getSmarts(page);
    await saveToFile(
      'SMARTS/unsplit-nucleotides-connected-with-chems.smarts',
      expectedFile,
    );
    const { fileExpected: smartsFileExpected, file: smartsFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/SMARTS/unsplit-nucleotides-connected-with-chems.smarts',
      });

    expect(smartsFile).toEqual(smartsFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'SMARTS/unsplit-nucleotides-connected-with-chems.smarts',
      page,
    );
  });

  test('Validate that unsplit nucleotides connected with nucleotides could be saved to SMARTS file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with nucleotides could be saved to SMARTS file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-nucleotides.ket',
      page,
    );
    const expectedFile = await getSmarts(page);
    await saveToFile(
      'SMARTS/unsplit-nucleotides-connected-with-nucleotides.smarts',
      expectedFile,
    );
    const { fileExpected: smartsFileExpected, file: smartsFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/SMARTS/unsplit-nucleotides-connected-with-nucleotides.smarts',
      });

    expect(smartsFile).toEqual(smartsFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'SMARTS/unsplit-nucleotides-connected-with-nucleotides.smarts',
      page,
    );
  });

  test('Validate that unsplit nucleotides connected with bases could be saved to SMARTS file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with bases could be saved to SMARTS file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-bases.ket',
      page,
    );
    const expectedFile = await getSmarts(page);
    await saveToFile(
      'SMARTS/unsplit-nucleotides-connected-with-bases.smarts',
      expectedFile,
    );
    const { fileExpected: smartsFileExpected, file: smartsFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/SMARTS/unsplit-nucleotides-connected-with-bases.smarts',
      });

    expect(smartsFile).toEqual(smartsFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'SMARTS/unsplit-nucleotides-connected-with-bases.smarts',
      page,
    );
  });

  test('Validate that unsplit nucleotides connected with sugars could be saved to SMARTS file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with sugars could be saved to SMARTS file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-sugars.ket',
      page,
    );
    const expectedFile = await getSmarts(page);
    await saveToFile(
      'SMARTS/unsplit-nucleotides-connected-with-sugars.smarts',
      expectedFile,
    );
    const { fileExpected: smartsFileExpected, file: smartsFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/SMARTS/unsplit-nucleotides-connected-with-sugars.smarts',
      });

    expect(smartsFile).toEqual(smartsFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'SMARTS/unsplit-nucleotides-connected-with-sugars.smarts',
      page,
    );
  });

  test('Validate that unsplit nucleotides connected with phosphates could be saved to SMARTS file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with phosphates could be saved to SMARTS file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-phosphates.ket',
      page,
    );
    const expectedFile = await getSmarts(page);
    await saveToFile(
      'SMARTS/unsplit-nucleotides-connected-with-phosphates.smarts',
      expectedFile,
    );
    const { fileExpected: smartsFileExpected, file: smartsFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/SMARTS/unsplit-nucleotides-connected-with-phosphates.smarts',
      });

    expect(smartsFile).toEqual(smartsFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'SMARTS/unsplit-nucleotides-connected-with-phosphates.smarts',
      page,
    );
  });

  test('Validate that unsplit nucleotides connected with peptides could be saved to SMARTS file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with peptides could be saved to SMARTS file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-peptides.ket',
      page,
    );
    const expectedFile = await getSmarts(page);
    await saveToFile(
      'SMARTS/unsplit-nucleotides-connected-with-peptides.smarts',
      expectedFile,
    );
    const { fileExpected: smartsFileExpected, file: smartsFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/SMARTS/unsplit-nucleotides-connected-with-peptides.smarts',
      });

    expect(smartsFile).toEqual(smartsFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'SMARTS/unsplit-nucleotides-connected-with-peptides.smarts',
      page,
    );
  });

  test('Validate that the simple schema with retrosynthetic arrow could be saved to SMARTS file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that the schema with retrosynthetic arrow could be saved to SMARTS file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/simple-schema-with-retrosynthetic-arrow.ket',
      page,
    );
    const expectedFile = await getSmarts(page);
    await saveToFile(
      'SMARTS/simple-schema-with-retrosynthetic-arrow.smarts',
      expectedFile,
    );
    const { fileExpected: smartsFileExpected, file: smartsFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/SMARTS/simple-schema-with-retrosynthetic-arrow.smarts',
      });

    expect(smartsFile).toEqual(smartsFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'SMARTS/simple-schema-with-retrosynthetic-arrow.smarts',
      page,
    );
  });
});
