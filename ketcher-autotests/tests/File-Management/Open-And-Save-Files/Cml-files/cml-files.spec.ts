import { Page, expect, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  receiveFileComparisonData,
  openFileAndAddToCanvas,
  saveToFile,
  waitForPageInit,
  openFileAndAddToCanvasAsNewProject,
} from '@utils';
import { getCml } from '@utils/formats';

async function openFileAddToCanvasTakeScreenshot(page: Page, fileName: string) {
  await openFileAndAddToCanvas(fileName, page);
  await takeEditorScreenshot(page);
}

test.describe('CML files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Open and Save files - CML - CML for empty canvas', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1944
     * Description: Save a clear canvas in CML format with preset parameters:
     * The input field contains <?xml version="1.0" ?> <cml> <molecule title="" /> </cml>.
     */

    const { fileExpected: cmlFileExpected, file: cmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/CML/cml-12492-compare.cml',
      });
    // comparing cml file with golden cml file
    expect(cmlFile).toEqual(cmlFileExpected);
  });

  test('Open and Save file - CML - CML for structure', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1945
     * Description: Saved cml file with structure is compering with paste cml structure golden file
     */
    await openFileAddToCanvasTakeScreenshot(page, 'CML/cml-molecule.cml');
    // check that structure opened from file is displayed correctly

    const expectedFile = await getCml(page);
    await saveToFile('CML/cml-molecule-expected.cml', expectedFile);
    const { file: cmlFile, fileExpected: cmlFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/CML/cml-molecule-expected.cml',
      });
    // comparing cml file with golden cml file

    expect(cmlFile).toEqual(cmlFileExpected);
  });

  test('Open and Save file - CML - CML for some structures', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1946
     * Description: Saved cml file with structure is compering with paste cml 3 structures
     */
    await openFileAddToCanvasTakeScreenshot(page, 'CML/cml-1946.cml');
    // check that structure opened from file is displayed correctly

    const expectedFile = await getCml(page);
    await saveToFile('CML/cml-1946-expected.cml', expectedFile);
    const { file: cmlFile, fileExpected: cmlFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/CML/cml-1946-expected.cml',
      });
    // comparing cml file with golden cml file

    expect(cmlFile).toEqual(cmlFileExpected);
  });

  test('Open and Save file - CML - CML for reaction', async ({ page }) => {
    /**
   * Test case: EPMLSOPKET-1947
    Description: Saved cml file with structure is compering with paste reaction from rxn file
  */
    await openFileAddToCanvasTakeScreenshot(
      page,
      'Rxn-V2000/cml-1947-reaction.rxn',
    );
    // check that structure opened from file is displayed correctly

    const expectedFile = await getCml(page);
    await saveToFile('CML/cml-1947-reaction-expected.cml', expectedFile);
    const { file: cmlFile, fileExpected: cmlFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/CML/cml-1947-reaction-expected.cml',
      });
    // comparing cml file with golden cml file

    expect(cmlFile).toEqual(cmlFileExpected);
  });

  test('Open and Save file - CML - CML for R-group and other features', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1948
     * Description: Saved cml file with structure is compering with paste R-group from a mol file
     */

    await openFileAddToCanvasTakeScreenshot(
      page,
      'Molfiles-V2000/cml-1948-R-group.mol',
    );
    // check that structure opened from file is displayed correctly

    const expectedFile = await getCml(page);
    await saveToFile('CML/cml-1948-r-group-expected.cml', expectedFile);
    const { file: cmlFile, fileExpected: cmlFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/CML/cml-1948-r-group-expected.cml',
      });
    // comparing cml file with golden cml file

    expect(cmlFile).toEqual(cmlFileExpected);
  });

  test('Validate that unsplit nucleotides connected with peptides could be saved to CML file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with peptides could be saved to CML file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-peptides.ket',
      page,
    );
    const expectedFile = await getCml(page);
    await saveToFile(
      'CML/unsplit-nucleotides-connected-with-peptides.cml',
      expectedFile,
    );
    const { fileExpected: cmlFileExpected, file: cmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CML/unsplit-nucleotides-connected-with-peptides.cml',
      });

    expect(cmlFile).toEqual(cmlFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'CML/unsplit-nucleotides-connected-with-peptides.cml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with nucleotides could be saved to CML file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with nucleotides could be saved to CML file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-nucleotides.ket',
      page,
    );
    const expectedFile = await getCml(page);
    await saveToFile(
      'CML/unsplit-nucleotides-connected-with-nucleotides.cml',
      expectedFile,
    );
    const { fileExpected: cmlFileExpected, file: cmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CML/unsplit-nucleotides-connected-with-nucleotides.cml',
      });

    expect(cmlFile).toEqual(cmlFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'CML/unsplit-nucleotides-connected-with-nucleotides.cml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with chems could be saved to CML file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with chems could be saved to CML file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-chems.ket',
      page,
    );
    const expectedFile = await getCml(page);
    await saveToFile(
      'CML/unsplit-nucleotides-connected-with-chems.cml',
      expectedFile,
    );
    const { fileExpected: cmlFileExpected, file: cmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CML/unsplit-nucleotides-connected-with-chems.cml',
      });

    expect(cmlFile).toEqual(cmlFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'CML/unsplit-nucleotides-connected-with-chems.cml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with bases could be saved to CML file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with bases could be saved to CML file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-bases.ket',
      page,
    );
    const expectedFile = await getCml(page);
    await saveToFile(
      'CML/unsplit-nucleotides-connected-with-bases.cml',
      expectedFile,
    );
    const { fileExpected: cmlFileExpected, file: cmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CML/unsplit-nucleotides-connected-with-bases.cml',
      });

    expect(cmlFile).toEqual(cmlFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'CML/unsplit-nucleotides-connected-with-bases.cml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with sugars could be saved to CML file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with sugars could be saved to CML file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-sugars.ket',
      page,
    );
    const expectedFile = await getCml(page);
    await saveToFile(
      'CML/unsplit-nucleotides-connected-with-sugars.cml',
      expectedFile,
    );
    const { fileExpected: cmlFileExpected, file: cmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CML/unsplit-nucleotides-connected-with-sugars.cml',
      });

    expect(cmlFile).toEqual(cmlFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'CML/unsplit-nucleotides-connected-with-sugars.cml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with phosphates could be saved to CML file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with phosphates could be saved to CML file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-phosphates.ket',
      page,
    );
    const expectedFile = await getCml(page);
    await saveToFile(
      'CML/unsplit-nucleotides-connected-with-phosphates.cml',
      expectedFile,
    );
    const { fileExpected: cmlFileExpected, file: cmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CML/unsplit-nucleotides-connected-with-phosphates.cml',
      });

    expect(cmlFile).toEqual(cmlFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'CML/unsplit-nucleotides-connected-with-phosphates.cml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the simple schema with retrosynthetic arrow could be saved to CML file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4985
    Description: Validate that the schema with retrosynthetic arrow could be saved to CML file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/simple-schema-with-retrosynthetic-arrow.ket',
      page,
    );
    const expectedFile = await getCml(page);
    await saveToFile(
      'CML/simple-schema-with-retrosynthetic-arrow.cml',
      expectedFile,
    );
    const { fileExpected: cmlFileExpected, file: cmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CML/simple-schema-with-retrosynthetic-arrow.cml',
      });

    expect(cmlFile).toEqual(cmlFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'CML/simple-schema-with-retrosynthetic-arrow.cml',
      page,
    );
    await takeEditorScreenshot(page);
  });
});
