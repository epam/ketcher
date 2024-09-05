import { test, expect } from '@playwright/test';
import {
  AtomButton,
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  TopPanelButton,
  selectTopPanelButton,
  selectAtomInToolbar,
  selectLeftPanelButton,
  LeftPanelButton,
  receiveFileComparisonData,
  saveToFile,
  waitForPageInit,
  openFileAndAddToCanvasAsNewProject,
} from '@utils';
import { getCdxml } from '@utils/formats';

test.describe('Tests for API setMolecule/getMolecule', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Paste CDXML', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-2956
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('CDXML/cdxml-2956.cdxml', page);
    // check that structure opened from file is displayed correctly
  });

  test('Open CDXML by Open Structure', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-3086
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('CDXML/cdxml-3086.cdxml', page);
    // check that structure opened from file is displayed correctly
  });

  test('Open/Import structure while opening a CDXML file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-4712
     * Description: Open/Import structure while openning a CDXML file
     */
    await selectAtomInToolbar(AtomButton.Hydrogen, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.ReactionPlusTool, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.ArrowOpenAngleTool, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectAtomInToolbar(AtomButton.Hydrogen, page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Open structure in another editor', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-4713
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('CDXML/cdxml-4713.cdxml', page);
  });

  test('Text tool - Save as .cdxml file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-4714
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('CDXML/cdxml-4714.cdxml', page);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
  });

  test('Simple Objects - Delete file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-4715
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('CDXML/cdxml-4715.cdxml', page);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
  });

  test('Clear Canvas - Structure is opened from .cdxml file', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-4716
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('CDXML/cdxml-4716.cdxml', page);

    await selectTopPanelButton(TopPanelButton.Clear, page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);
    await page.keyboard.press('Control+Delete');
  });

  test('Functional Groups - Open from .cdxml file with contracted and expanded function', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-4717
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('CDXML/cdxml-4717.cdxml', page);
    // check that structure opened from file is displayed correctly
  });

  test('Open/save/open cdxml file with structure', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-4718
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('CDXML/cdxml-4718-structures.cdxml', page);
    // check that structure opened from file is displayed correctly
  });

  test('Save/Open file - Save *.cdxml file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-6969
     * Description: Open/Import structure CDXML file
     */
    await openFileAndAddToCanvas('CDXML/cdxml-6969.cdxml', page);
    const expectedFile = await getCdxml(page);
    await saveToFile('CDXML/cdxml-6969-expected.cdxml', expectedFile);

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/CDXML/cdxml-6969-expected.cdxml',
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

  test('Validate that the simple schema with retrosynthetic arrow could be saved to Cdxml file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2097
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

    await openFileAndAddToCanvasAsNewProject(
      'CDXML/simple-schema-with-retrosynthetic-arrow.cdxml',
      page,
    );
  });

  test('Validate that the schema with retrosynthetic, angel arrows and plus could be saved to Cdxml file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2097
    Description: Validate that schema with retrosynthetic arrow could be saved to Cdxml file and loaded back

    Valence is not displayed. After fixing https://github.com/epam/Indigo/issues/2205 need to update a screenshot.
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-retrosynthetic-angel-arrows-and-plus.ket',
      page,
    );
    const expectedFile = await getCdxml(page);
    await saveToFile(
      'CDXML/schema-with-retrosynthetic-angel-arrows-and-plus.cdxml',
      expectedFile,
    );

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/schema-with-retrosynthetic-angel-arrows-and-plus.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'CDXML/schema-with-retrosynthetic-angel-arrows-and-plus.cdxml',
      page,
    );
  });

  test('Validate that the schema with two retrosynthetic arrows could be saved to Cdxml file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2097
    Description: Validate that schema with retrosynthetic arrow could be saved to Cdxml file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-two-retrosynthetic-arrows.ket',
      page,
    );
    const expectedFile = await getCdxml(page);
    await saveToFile(
      'CDXML/schema-with-two-retrosynthetic-arrows.cdxml',
      expectedFile,
    );

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/schema-with-two-retrosynthetic-arrows.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);

    await openFileAndAddToCanvasAsNewProject(
      'CDXML/schema-with-two-retrosynthetic-arrows.cdxml',
      page,
    );
  });

  test(
    'Validate that the schema with reverse retrosynthetic arrow and pluses could be saved to Cdxml file and loaded back',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test case: #2097
    Description: Validate that schema with retrosynthetic arrow could be saved to Cdxml file and loaded back
    Test working not in proper way because we have bug https://github.com/epam/Indigo/issues/2311 
    After fix we need update screenshot
    */

      await openFileAndAddToCanvas(
        'KET/schema-with-reverse-retrosynthetic-arrow-and-pluses.ket',
        page,
      );
      const expectedFile = await getCdxml(page);
      await saveToFile(
        'CDXML/schema-with-reverse-retrosynthetic-arrow-and-pluses.cdxml',
        expectedFile,
      );

      const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
        await receiveFileComparisonData({
          page,
          expectedFileName:
            'tests/test-data/CDXML/schema-with-reverse-retrosynthetic-arrow-and-pluses.cdxml',
        });

      expect(cdxmlFile).toEqual(cdxmlFileExpected);

      await openFileAndAddToCanvasAsNewProject(
        'CDXML/schema-with-reverse-retrosynthetic-arrow-and-pluses.cdxml',
        page,
      );
    },
  );

  test(
    'Validate that the schema with vertical retrosynthetic arrow could be saved to Cdxml file and loaded back',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test case: #2097
    Description: Validate that schema with retrosynthetic arrow could be saved to Cdxml file and loaded back
    Test working not in proper way because we have bug https://github.com/epam/Indigo/issues/2219
    After fix we need update file and screenshot.
    */

      await openFileAndAddToCanvas(
        'KET/schema-with-vertical-retrosynthetic-arrow.ket',
        page,
      );
      const expectedFile = await getCdxml(page);
      await saveToFile(
        'CDXML/schema-with-vertical-retrosynthetic-arrow.cdxml',
        expectedFile,
      );

      const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
        await receiveFileComparisonData({
          page,
          expectedFileName:
            'tests/test-data/CDXML/schema-with-vertical-retrosynthetic-arrow.cdxml',
        });

      expect(cdxmlFile).toEqual(cdxmlFileExpected);

      await openFileAndAddToCanvasAsNewProject(
        'CDXML/schema-with-vertical-retrosynthetic-arrow.cdxml',
        page,
      );
    },
  );

  test(
    'Validate that the schema with diagonal retrosynthetic arrow could be saved to Cdxml file and loaded back',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test case: #2097
    Description: Validate that schema with retrosynthetic arrow could be saved to Cdxml file and loaded back
    Test working not in proper way because we have bug https://github.com/epam/Indigo/issues/2221
    After fix we need update file and screenshot.
    */

      await openFileAndAddToCanvas(
        'KET/schema-with-diagonal-retrosynthetic-arrow.ket',
        page,
      );
      const expectedFile = await getCdxml(page);
      await saveToFile(
        'CDXML/schema-with-diagonal-retrosynthetic-arrow.cdxml',
        expectedFile,
      );

      const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
        await receiveFileComparisonData({
          page,
          expectedFileName:
            'tests/test-data/CDXML/schema-with-diagonal-retrosynthetic-arrow.cdxml',
        });

      expect(cdxmlFile).toEqual(cdxmlFileExpected);

      await openFileAndAddToCanvasAsNewProject(
        'CDXML/schema-with-diagonal-retrosynthetic-arrow.cdxml',
        page,
      );
    },
  );
});
