import { Page, expect, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  receiveFileComparisonData,
  openFileAndAddToCanvas,
  saveToFile,
  waitForPageInit,
  openFileAndAddToCanvasAsNewProject,
  setReactionMarginSizeOptionUnit,
  bondsDefaultSettings,
  setBondLengthOptionUnit,
  setBondLengthValue,
  pressButton,
  selectTopPanelButton,
  TopPanelButton,
  setReactionMarginSizeValue,
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

  test('The Bond length setting with px option is applied, click on layout and it should be save to CML specification', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/2176
    Description: Add new settings for ACS style for convert and layout functions
    The Bond length setting is applied, click on layout and it should be save to CML specification
    */
    await openFileAndAddToCanvas('KET/layout-with-catalyst.ket', page);
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'px-option');
    await setBondLengthValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCml(page);
    await saveToFile(
      'CML/layout-with-catalyst-inch-bond-lengh-px-bond-lengh.cml',
      expectedFile,
    );
    const { fileExpected: cmlFileExpected, file: cmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CML/layout-with-catalyst-px-bond-lengh.cml',
      });

    expect(cmlFile).toEqual(cmlFileExpected);
  });

  test('The Bond length setting with pt option is applied, click on layout and it should be save to CML specification', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/2176
    Description: Add new settings for ACS style for convert and layout functions
    The Bond length setting is applied, click on layout and it should be save to CML specification
    */
    await openFileAndAddToCanvas('KET/layout-with-diagonally-arrow.ket', page);
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'pt-option');
    await setBondLengthValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCml(page);
    await saveToFile(
      'CML/layout-with-diagonally-arrow-pt-bond-lengh.cml',
      expectedFile,
    );
    const { fileExpected: cmlFileExpected, file: cmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CML/layout-with-diagonally-arrow-pt-bond-lengh.cml',
      });

    expect(cmlFile).toEqual(cmlFileExpected);
  });

  test('The Bond length setting with cm option is applied, click on layout and it should be save to CML specification', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/2176
    Description: Add new settings for ACS style for convert and layout functions
    The Bond length setting is applied, click on layout and it should be save to CML specification
    */
    await openFileAndAddToCanvas('KET/layout-with-dif-elements.ket', page);
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'cm-option');
    await setBondLengthValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCml(page);
    await saveToFile(
      'CML/layout-with-dif-elements-cm-bond-lengh.cml',
      expectedFile,
    );
    const { fileExpected: cmlFileExpected, file: cmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CML/layout-with-dif-elements-cm-bond-lengh.cml',
      });

    expect(cmlFile).toEqual(cmlFileExpected);
  });

  test('The Bond length setting with inch option is applied, click on layout and it should be save to CML specification', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/2176
    Description: Add new settings for ACS style for convert and layout functions
    The Bond length setting is applied, click on layout and it should be save to CML specification
    */
    await openFileAndAddToCanvas('KET/layout-with-long-molecule.ket', page);
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'inch-option');
    await setBondLengthValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCml(page);
    await saveToFile(
      'CML/layout-with-long-molecule-inch-bond-lengh.cml',
      expectedFile,
    );
    const { fileExpected: cmlFileExpected, file: cmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CML/layout-with-long-molecule-inch-bond-lengh.cml',
      });

    expect(cmlFile).toEqual(cmlFileExpected);
  });

  test('The Reaction component margin size setting with px option is applied, click on layout and it should be save to CML specification', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/2176
    Description: Add new settings for ACS style for convert and layout functions
    The Reaction component margin size setting is applied, click on layout and it should be save to CML specification
    */
    await openFileAndAddToCanvas('KET/layout-with-catalyst.ket', page);
    await bondsDefaultSettings(page);
    await setReactionMarginSizeOptionUnit(page, 'px-option');
    await setReactionMarginSizeValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCml(page);
    await saveToFile(
      'CML/layout-with-catalyst-px-margin-size.cml',
      expectedFile,
    );
    const { fileExpected: cmlFileExpected, file: cmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CML/layout-with-catalyst-px-margin-size.cml',
      });

    expect(cmlFile).toEqual(cmlFileExpected);
  });

  test('The Reaction component margin size setting with pt option is applied, click on layout and it should be save to CML specification', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/2176
    Description: Add new settings for ACS style for convert and layout functions
    The Reaction component margin size setting is applied, click on layout and it should be save to CML specification
    */
    await openFileAndAddToCanvas('KET/layout-with-diagonally-arrow.ket', page);
    await bondsDefaultSettings(page);
    await setReactionMarginSizeOptionUnit(page, 'pt-option');
    await setReactionMarginSizeValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCml(page);
    await saveToFile(
      'CML/layout-with-diagonally-arrow-pt-margin-size.cml',
      expectedFile,
    );
    const { fileExpected: cmlFileExpected, file: cmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CML/layout-with-diagonally-arrow-pt-margin-size.cml',
      });

    expect(cmlFile).toEqual(cmlFileExpected);
  });

  test('The Reaction component margin size setting with cm option is applied, click on layout and it should be save to CML specification', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/2176
    Description: Add new settings for ACS style for convert and layout functions
    The Reaction component margin size setting is applied, click on layout and it should be save to CML specification
    */
    await openFileAndAddToCanvas('KET/layout-with-dif-elements.ket', page);
    await bondsDefaultSettings(page);
    await setReactionMarginSizeOptionUnit(page, 'cm-option');
    await setReactionMarginSizeValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCml(page);
    await saveToFile(
      'CML/layout-with-dif-elements-cm-margin-size.cml',
      expectedFile,
    );
    const { fileExpected: cmlFileExpected, file: cmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CML/layout-with-dif-elements-cm-margin-size.cml',
      });

    expect(cmlFile).toEqual(cmlFileExpected);
  });

  test('The Reaction component margin size setting with inch option is applied, click on layout and it should be save to CML specification', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/2176
    Description: Add new settings for ACS style for convert and layout functions
    The Reaction component margin size setting is applied, click on layout and it should be save to CML specification
    */
    await openFileAndAddToCanvas('KET/layout-with-long-molecule.ket', page);
    await bondsDefaultSettings(page);
    await setReactionMarginSizeOptionUnit(page, 'inch-option');
    await setReactionMarginSizeValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCml(page);
    await saveToFile(
      'CML/layout-with-long-molecule-inch-margin-size.cml',
      expectedFile,
    );
    const { fileExpected: cmlFileExpected, file: cmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CML/layout-with-long-molecule-inch-margin-size.cml',
      });

    expect(cmlFile).toEqual(cmlFileExpected);
  });
});
