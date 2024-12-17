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
  bondsSettings,
  setBondLengthOptionUnit,
  setBondLengthValue,
  pressButton,
  openSettings,
  setReactionMarginSizeOptionUnit,
  setReactionMarginSizeValue,
  selectAllStructuresOnCanvas,
  selectClearCanvasTool,
} from '@utils';
import { FileType, verifyFile2 } from '@utils/files/receiveFileComparisonData';
import { getCdxml } from '@utils/formats';
import { pressUndoButton } from '@utils/macromolecules/topToolBar';

test.describe('Tests for API setMolecule/getMolecule', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Paste CDXML', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-2956
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('CDXML/cdxml-2956.cdxml', page);
    // check that structure opened from file is displayed correctly
    await takeEditorScreenshot(page);
  });

  test('Open CDXML by Open Structure', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-3086
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('CDXML/cdxml-3086.cdxml', page);
    // check that structure opened from file is displayed correctly
    await takeEditorScreenshot(page);
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
    await takeEditorScreenshot(page);
  });

  test('Open structure in another editor', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-4713
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('CDXML/cdxml-4713.cdxml', page);
    await takeEditorScreenshot(page);
  });

  test('Text tool - Save as .cdxml file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-4714
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('CDXML/cdxml-4714.cdxml', page);
    await selectAllStructuresOnCanvas(page);
    await page.keyboard.press('Delete');
    await takeEditorScreenshot(page);
  });

  test('Simple Objects - Delete file', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-4715
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('CDXML/cdxml-4715.cdxml', page);
    await selectAllStructuresOnCanvas(page);
    await page.keyboard.press('Delete');
    await takeEditorScreenshot(page);
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

    await pressUndoButton(page);
    await selectClearCanvasTool(page);
    await takeEditorScreenshot(page);
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
    await takeEditorScreenshot(page);
  });

  test('Open/save/open cdxml file with structure', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-4718
     * Description: Open/Import structure while openning a CDXML file
     */
    await openFileAndAddToCanvas('CDXML/cdxml-4718-structures.cdxml', page);
    // check that structure opened from file is displayed correctly
    await takeEditorScreenshot(page);
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
    await takeEditorScreenshot(page);
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
    await takeEditorScreenshot(page);
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
    await takeEditorScreenshot(page);
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
    await takeEditorScreenshot(page);
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
    await takeEditorScreenshot(page);
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
    await takeEditorScreenshot(page);
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
    await takeEditorScreenshot(page);
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
    await takeEditorScreenshot(page);
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
    await takeEditorScreenshot(page);
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
      await takeEditorScreenshot(page);
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
      await takeEditorScreenshot(page);
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
      await takeEditorScreenshot(page);
    },
  );

  test('The Bond length setting with pt option is applied, click on layout and it should be save to CDXML specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied, click on layout and it should be save to CDXML specification
  */
    await openFileAndAddToCanvas('KET/layout-with-catalyst.ket', page);
    await openSettings(page);
    await bondsSettings(page);
    await setBondLengthOptionUnit(page, 'pt-option');
    await setBondLengthValue(page, '54.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
    const expectedFile = await getCdxml(page);
    await saveToFile(
      'CDXML/layout-with-catalyst-pt-bond-lengh.cdxml',
      expectedFile,
    );

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/layout-with-catalyst-pt-bond-lengh.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'CDXML/layout-with-catalyst-pt-bond-lengh.cdxml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('The Reaction component margin size setting with px option is applied, click on layout and it should be save to CDXML specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Reaction component margin size setting is applied, click on layout and it should be save to CDX specification
  */
    await openFileAndAddToCanvas('KET/layout-with-catalyst.ket', page);
    await openSettings(page);
    await setReactionMarginSizeOptionUnit(page, 'px-option');
    await setReactionMarginSizeValue(page, '7.8');
    await pressButton(page, 'Apply');
    await pressButton(page, 'OK');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
    const expectedFile = await getCdxml(page);
    await saveToFile(
      'CDXML/layout-with-catalyst-px-margin-size.cdxml',
      expectedFile,
    );

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/layout-with-catalyst-px-margin-size.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'CDXML/layout-with-catalyst-px-margin-size.cdxml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('The ACS setting is applied, click on layout and it should be save to CDXML specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/ketcher/issues/5156
  Description: add new option ACS style and check saving to different format
  Need to update screenshots after implementing https://github.com/epam/ketcher/issues/5650 and 
  https://github.com/epam/Indigo/issues/2458
  */
    await openFileAndAddToCanvas('KET/layout-with-dif-elements.ket', page);
    await openSettings(page);
    await pressButton(page, 'Set ACS Settings');
    await pressButton(page, 'Apply');
    await pressButton(page, 'OK');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
    const expectedFile = await getCdxml(page);
    await saveToFile(
      'CDXML/layout-with-dif-elements-acs-style.cdxml',
      expectedFile,
    );

    const { fileExpected: cdxmlFileExpected, file: cdxmlFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDXML/layout-with-dif-elements-acs-style.cdxml',
      });

    expect(cdxmlFile).toEqual(cdxmlFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'CDXML/layout-with-dif-elements-acs-style.cdxml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that a single reaction containing only reactants can be saved/loaded from CDXML with appropriate positions', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Single reaction containing only reactants can be saved/loaded from CDXML with appropriate positions.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/reactant-single-reaction.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFile2(
      page,
      'CDXML/reactant-single-reaction-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      'CDXML/reactant-single-reaction-expected.cdxml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that a single reaction containing only products can be saved/loaded from CDXML with appropriate positions', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Single reaction containing only products can be saved/loaded from CDXML with appropriate positions.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/products-single-reaction.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFile2(
      page,
      'CDXML/products-single-reaction-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      'CDXML/products-single-reaction-expected.cdxml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that a single reaction containing reactants and products with multi-tail arrows (MTA) can be saved/loaded correctly from CDXML, ignoring the MTA', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Verify that a single reaction containing reactants and products with multi-tail arrows (MTA) can be saved/loaded correctly from CDXML, ignoring the MTA.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/ket-cascade-reaction-3-1-2-1-1.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFile2(
      page,
      'CDXML/ket-cascade-reaction-3-1-2-1-1-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      'CDXML/ket-cascade-reaction-3-1-2-1-1-expected.cdxml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that multiple individual reactions (without any cascading) can be saved/loaded from CDXML with correct positions', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Multiple individual reactions (without any cascading) can be saved/loaded from CDXML with correct positions.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multiple-individual-reactions.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFile2(
      page,
      'CDXML/multiple-individual-reactions-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      'CDXML/multiple-individual-reactions-expected.cdxml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that several cascaded reactions can be saved/loaded from CDXML, ignoring multi-tail arrows', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Several cascaded reactions can be saved/loaded from CDXML, ignoring multi-tail arrows.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/several-cascade-reactions.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFile2(
      page,
      'CDXML/several-cascade-reactions-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      'CDXML/several-cascade-reactions-expected.cdxml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that a combination of a single reaction and a cascaded reaction can be saved/loaded from CDXML with correct positioning, ignoring MTAs', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Combination of a single reaction and a cascaded reaction can be saved/loaded from CDXML with correct positioning, ignoring MTAs.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/combination-of-single-and-cascade-reactions.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFile2(
      page,
      'CDXML/combination-of-single-and-cascade-reactions-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      'CDXML/combination-of-single-and-cascade-reactions-expected.cdxml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that a cascade of multiple reactions, each containing reactants and products, saved/loaded properly from CDXML, ignoring MTAs', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Cascade of multiple reactions, each containing reactants and products, saved/loaded properly from CDXML, ignoring MTAs.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/cascade-of-multiple-reactions.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFile2(
      page,
      'CDXML/cascade-of-multiple-reactions-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      'CDXML/cascade-of-multiple-reactions-expected.cdxml',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify the saving/loading a pathway with mixed single reactions and cascades from CDXML,  MTAs are ignored', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Saving/loading a pathway with mixed single reactions and cascades from CDXML,  MTAs are ignored.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/pathway-with-mixed-single-reactions-and-cascades.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFile2(
      page,
      'CDXML/pathway-with-mixed-single-reactions-and-cascades-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      'CDXML/pathway-with-mixed-single-reactions-and-cascades-expected.cdxml',
      page,
    );
    await takeEditorScreenshot(page);
  });
});
