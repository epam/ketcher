import { test, expect } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  pasteFromClipboardAndAddToCanvas,
  receiveFileComparisonData,
  saveToFile,
  waitForPageInit,
  openFileAndAddToCanvasAsNewProject,
  readFileContents,
  openPasteFromClipboard,
  pressButton,
} from '@utils';
import { FileType, verifyFile2 } from '@utils/files/receiveFileComparisonData';
import { getCdx } from '@utils/formats';

test.describe('CDX files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('opening cdx files', async ({ page }) => {
    /* 
    Test case: EPMLSOPKET-12514
    Description: Open CDX files
    */
    await openFileAndAddToCanvas('CDX/cdx-expanded-contracted.cdx', page);
    await takeEditorScreenshot(page);
  });

  test('opening cdx files with R-group', async ({ page }) => {
    /* 
    Test case: EPMLSOPKET-6973
    Description: Open CDX files with R-group
    */
    await openFileAndAddToCanvas('CDX/r-group.cdx', page);
    const expectedFile = await getCdx(page);
    await saveToFile('CDX/r-group-expected.cdx', expectedFile);

    const { fileExpected: cdxFileExpected, file: cdxFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/CDX/r-group-expected.cdx',
      });

    expect(cdxFile).toEqual(cdxFileExpected);
    await takeEditorScreenshot(page);
  });

  test('opening cdx files from clipboard', async ({ page }) => {
    /* 
  Test case: EPMLSOPKET-6972, EPMLSOPKET-8929
  Description: Open structure created in another chemical editor from clickboard
  */
    await pasteFromClipboardAndAddToCanvas(
      page,
      // eslint-disable-next-line max-len
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAQCEAClnXYBBmHkAKuSsgHwQBgBAAMOAAIA////////AAAAAAAAAAETAAEAAQABAOIECQBTYW5zU2VyaWYBgAIAAAADgAMAAAAEAhAApR11AQbh4gCrErQB8MAZAQSABAAAAAACCACmm4UBBmHkAAIEAgAGACsEAgABAAAABIAFAAAAAAIIACiYhQHwQBgBAgQCAAcAKwQCAAAAAAAEgAYAAAAAAggApZ12ATJd/gACBAIACAArBAIAAAAAAASABwAAAAACCACnmaMB8EAYAQIEAgAGACsEAgABAAAABIAIAAAAAAIIABC8owEGYeQAAgQCAAYAKwQCAAEAAAAEgAkAAAAAAggAq5KyASdu/gACBAIABgArBAIAAQAAAAWACgAAAAQGBAAGAAAABQYEAAQAAAAABgIAAgABBgIAAAAAAAWACwAAAAQGBAAHAAAABQYEAAUAAAAABgIAAgABBgIAAAAAAAWADAAAAAQGBAAEAAAABQYEAAgAAAAABgIAAQABBgIAAAAAAAWADQAAAAQGBAAFAAAABQYEAAYAAAAABgIAAQABBgIAAAAAAAWADgAAAAQGBAAIAAAABQYEAAkAAAAABgIAAgABBgIAAAAAAAWADwAAAAQGBAAJAAAABQYEAAcAAAAABgIAAQABBgIAAAAAAAAAAAAAAA==',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Open from .cdx file with contracted and expanded functional groups', async ({
    page,
  }) => {
    /* 
    Test case: EPMLSOPKET-6970
    Description: Abbreviation appears contracted.
    */
    await openFileAndAddToCanvas(
      'CDX/functional-group-exp-and-contr.cdx',
      page,
    );
    const expectedFile = await getCdx(page);
    await saveToFile(
      'CDX/functional-group-exp-and-contr-expected.cdx',
      expectedFile,
    );

    const { fileExpected: cdxFileExpected, file: cdxFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDX/functional-group-exp-and-contr-expected.cdx',
      });

    expect(cdxFile).toEqual(cdxFileExpected);
    await takeEditorScreenshot(page);
  });

  test('Open from .cdx file with contracted and expanded Salts and Solvents', async ({
    page,
  }) => {
    /* 
    Test case: EPMLSOPKET-6971
    Description: Abbreviation appears contracted.
    */
    await openFileAndAddToCanvas('CDX/salts-exp-and-contr.cdx', page);
    const expectedFile = await getCdx(page);
    await saveToFile('CDX/salts-exp-and-contr-expected.cdx', expectedFile);

    const { fileExpected: cdxFileExpected, file: cdxFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDX/salts-exp-and-contr-expected.cdx',
      });

    expect(cdxFile).toEqual(cdxFileExpected);
    await takeEditorScreenshot(page);
  });
});

test.describe('CDX files without screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Validate that unsplit nucleotides connected with another nucleotides could be saved to Cdx file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with another nucleotides could be saved to Cdx file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-nucleotides.ket',
      page,
    );
    const expectedFile = await getCdx(page);
    await saveToFile(
      'CDX/unsplit-nucleotides-connected-with-nucleotides.cdx',
      expectedFile,
    );

    const { fileExpected: cdxFileExpected, file: cdxFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDX/unsplit-nucleotides-connected-with-nucleotides.cdx',
      });

    expect(cdxFile).toEqual(cdxFileExpected);
  });

  test('Validate that unsplit nucleotides connected with chems could be saved to Cdx file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with chems could be saved to Cdx file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-chems.ket',
      page,
    );
    const expectedFile = await getCdx(page);
    await saveToFile(
      'CDX/unsplit-nucleotides-connected-with-chems.cdx',
      expectedFile,
    );

    const { fileExpected: cdxFileExpected, file: cdxFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDX/unsplit-nucleotides-connected-with-chems.cdx',
      });

    expect(cdxFile).toEqual(cdxFileExpected);
  });

  test('Validate that unsplit nucleotides connected with bases could be saved to Cdx file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with bases could be saved to Cdx file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-bases.ket',
      page,
    );
    const expectedFile = await getCdx(page);
    await saveToFile(
      'CDX/unsplit-nucleotides-connected-with-bases.cdx',
      expectedFile,
    );

    const { fileExpected: cdxFileExpected, file: cdxFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDX/unsplit-nucleotides-connected-with-bases.cdx',
      });

    expect(cdxFile).toEqual(cdxFileExpected);
  });

  test('Validate that unsplit nucleotides connected with sugars could be saved to Cdx file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with sugars could be saved to Cdx file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-sugars.ket',
      page,
    );
    const expectedFile = await getCdx(page);
    await saveToFile(
      'CDX/unsplit-nucleotides-connected-with-sugars.cdx',
      expectedFile,
    );

    const { fileExpected: cdxFileExpected, file: cdxFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDX/unsplit-nucleotides-connected-with-sugars.cdx',
      });

    expect(cdxFile).toEqual(cdxFileExpected);
  });

  test('Validate that unsplit nucleotides connected with phosphates could be saved to Cdx file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with phosphates could be saved to Cdx file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-phosphates.ket',
      page,
    );
    const expectedFile = await getCdx(page);
    await saveToFile(
      'CDX/unsplit-nucleotides-connected-with-phosphates.cdx',
      expectedFile,
    );

    const { fileExpected: cdxFileExpected, file: cdxFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDX/unsplit-nucleotides-connected-with-phosphates.cdx',
      });

    expect(cdxFile).toEqual(cdxFileExpected);
  });

  test('Validate that unsplit nucleotides connected with peptides could be saved to Cdx file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with peptides could be saved to Cdx file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-peptides.ket',
      page,
    );
    const expectedFile = await getCdx(page);
    await saveToFile(
      'CDX/unsplit-nucleotides-connected-with-peptides.cdx',
      expectedFile,
    );

    const { fileExpected: cdxFileExpected, file: cdxFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDX/unsplit-nucleotides-connected-with-peptides.cdx',
      });

    expect(cdxFile).toEqual(cdxFileExpected);
  });

  test('Validate that simple schema with retrosynthetic arrow could be saved to Cdx file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2097
    Description: Validate that schema schema with retrosynthetic arrow could be saved to Cdx file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/simple-schema-with-retrosynthetic-arrow.ket',
      page,
    );
    const expectedFile = await getCdx(page);
    await saveToFile(
      'CDX/simple-schema-with-retrosynthetic-arrow.cdx',
      expectedFile,
    );

    const { fileExpected: cdxFileExpected, file: cdxFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDX/simple-schema-with-retrosynthetic-arrow.cdx',
      });

    expect(cdxFile).toEqual(cdxFileExpected);
  });

  test('Validate that the schema with retrosynthetic, angel arrows and plus could be saved to Cdx file and loaded back', async ({
    page,
  }) => {
    /*
    * IMPORTANT: Test fails because we have bug https://github.com/epam/Indigo/issues/2205
    Test case: #2097
    Description: Validate that schema with retrosynthetic arrow could be saved to Cdx file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-retrosynthetic-angel-arrows-and-plus.ket',
      page,
    );
    const expectedFile = await getCdx(page);
    await saveToFile(
      'CDX/schema-with-retrosynthetic-angel-arrows-and-plus.cdx',
      expectedFile,
    );

    const { fileExpected: cdxFileExpected, file: cdxFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDX/schema-with-retrosynthetic-angel-arrows-and-plus.cdx',
      });

    expect(cdxFile).toEqual(cdxFileExpected);
  });

  test('Validate that the schema with two retrosynthetic arrows could be saved to Cdx file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2097
    Description: Validate that schema with retrosynthetic arrow could be saved to Cdx file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-two-retrosynthetic-arrows.ket',
      page,
    );
    const expectedFile = await getCdx(page);
    await saveToFile(
      'CDX/schema-with-two-retrosynthetic-arrows.cdx',
      expectedFile,
    );

    const { fileExpected: cdxFileExpected, file: cdxFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDX/schema-with-two-retrosynthetic-arrows.cdx',
      });

    expect(cdxFile).toEqual(cdxFileExpected);
  });

  test('Validate that the schema with reverse retrosynthetic arrow and pluses could be saved to Cdx file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2097
    Description: Validate that schema with retrosynthetic arrow could be saved to Cdx file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-reverse-retrosynthetic-arrow-and-pluses.ket',
      page,
    );
    const expectedFile = await getCdx(page);
    await saveToFile(
      'CDX/schema-with-reverse-retrosynthetic-arrow-and-pluses.cdx',
      expectedFile,
    );

    const { fileExpected: cdxFileExpected, file: cdxFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDX/schema-with-reverse-retrosynthetic-arrow-and-pluses.cdx',
      });

    expect(cdxFile).toEqual(cdxFileExpected);
  });

  test(
    'Validate that the schema with vertical retrosynthetic arrow and pluses could be saved to Cdx file and loaded back',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test case: #2097
    Description: Validate that schema with retrosynthetic arrow could be saved to Cdx file and loaded back
    Test working not in proper way because we have bug https://github.com/epam/Indigo/issues/2219
    After fix we need update file.
    */

      await openFileAndAddToCanvas(
        'KET/schema-with-vertical-retrosynthetic-arrow.ket',
        page,
      );
      const expectedFile = await getCdx(page);
      await saveToFile(
        'CDX/schema-with-vertical-retrosynthetic-arrow.cdx',
        expectedFile,
      );

      const { fileExpected: cdxFileExpected, file: cdxFile } =
        await receiveFileComparisonData({
          page,
          expectedFileName:
            'tests/test-data/CDX/schema-with-vertical-retrosynthetic-arrow.cdx',
        });

      expect(cdxFile).toEqual(cdxFileExpected);
    },
  );

  test(
    'Validate that the schema with diagonal retrosynthetic arrow could be saved to Cdx file and loaded back',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test case: #2097
    Description: Validate that schema with retrosynthetic arrow could be saved to Cdx file and loaded back
    Test working not in proper way because we have bug https://github.com/epam/Indigo/issues/2221
    After fix we need update file.
    */

      await openFileAndAddToCanvas(
        'KET/schema-with-diagonal-retrosynthetic-arrow.ket',
        page,
      );
      const expectedFile = await getCdx(page);
      await saveToFile(
        'CDX/schema-with-diagonal-retrosynthetic-arrow.cdx',
        expectedFile,
      );

      const { fileExpected: cdxFileExpected, file: cdxFile } =
        await receiveFileComparisonData({
          page,
          expectedFileName:
            'tests/test-data/CDX/schema-with-diagonal-retrosynthetic-arrow.cdx',
        });

      expect(cdxFile).toEqual(cdxFileExpected);
    },
  );

  test('Verify that a single reaction containing only reactants can be saved/loaded from CDX with appropriate positions', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Single reaction containing only reactants can be saved/loaded from CDX with appropriate positions.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/reactant-single-reaction.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFile2(
      page,
      'CDX/reactant-single-reaction-expected.cdx',
      FileType.CDX,
    );
    const fileContent = await readFileContents(
      'tests/test-data/CDX/reactant-single-reaction-expected.cdx',
    );
    await openPasteFromClipboard(page, fileContent);
    await pressButton(page, 'Open as New Project');
    await takeEditorScreenshot(page);
  });

  test('Verify that a single reaction containing only products can be saved/loaded from CDX with appropriate positions', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Single reaction containing only products can be saved/loaded from CDX with appropriate positions.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/products-single-reaction.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFile2(
      page,
      'CDX/products-single-reaction-expected.cdx',
      FileType.CDX,
    );
    const fileContent = await readFileContents(
      'tests/test-data/CDX/products-single-reaction-expected.cdx',
    );
    await openPasteFromClipboard(page, fileContent);
    await pressButton(page, 'Open as New Project');
    await takeEditorScreenshot(page);
  });

  test('Verify that a single reaction containing reactants and products with multi-tail arrows (MTA) can be saved/loaded correctly from CDX, ignoring the MTA', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Single reaction containing reactants and products with multi-tail arrows (MTA) can be saved/loaded correctly from CDX, ignoring the MTA.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/ket-cascade-reaction-3-1-2-1-1.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFile2(
      page,
      'CDX/ket-cascade-reaction-3-1-2-1-1-expected.cdx',
      FileType.CDX,
    );
    const fileContent = await readFileContents(
      'tests/test-data/CDX/ket-cascade-reaction-3-1-2-1-1-expected.cdx',
    );
    await openPasteFromClipboard(page, fileContent);
    await pressButton(page, 'Open as New Project');
    await takeEditorScreenshot(page);
  });

  test('Verify that multiple individual reactions (without any cascading) can be saved/loaded from CDX with correct positions', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Multiple individual reactions (without any cascading) can be saved/loaded from CDX with correct positions.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multiple-individual-reactions.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFile2(
      page,
      'CDX/multiple-individual-reactions-expected.cdx',
      FileType.CDX,
    );
    const fileContent = await readFileContents(
      'tests/test-data/CDX/multiple-individual-reactions-expected.cdx',
    );
    await openPasteFromClipboard(page, fileContent);
    await pressButton(page, 'Open as New Project');
    await takeEditorScreenshot(page);
  });

  test('Verify that several cascaded reactions can be saved/loaded from CDX, ignoring multi-tail arrows', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Several cascaded reactions can be saved/loaded from CDX, ignoring multi-tail arrows.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/several-cascade-reactions.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFile2(
      page,
      'CDX/several-cascade-reactions-expected.cdx',
      FileType.CDX,
    );
    const fileContent = await readFileContents(
      'tests/test-data/CDX/several-cascade-reactions-expected.cdx',
    );
    await openPasteFromClipboard(page, fileContent);
    await pressButton(page, 'Open as New Project');
    await takeEditorScreenshot(page);
  });

  test('Verify that a combination of a single reaction and a cascaded reaction can be saved/loaded from CDX with correct positioning, ignoring MTAs', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Combination of a single reaction and a cascaded reaction can be saved/loaded from CDX with correct positioning, ignoring MTAs.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/combination-of-single-and-cascade-reactions.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFile2(
      page,
      'CDX/combination-of-single-and-cascade-reactions-expected.cdx',
      FileType.CDX,
    );
    const fileContent = await readFileContents(
      'tests/test-data/CDX/combination-of-single-and-cascade-reactions-expected.cdx',
    );
    await openPasteFromClipboard(page, fileContent);
    await pressButton(page, 'Open as New Project');
    await takeEditorScreenshot(page);
  });

  test('Verify that a cascade of multiple reactions, each containing reactants and products, saved/loaded properly from CDX, ignoring MTAs', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Cascade of multiple reactions, each containing reactants and products, saved/loaded properly from CDX, ignoring MTAs.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/cascade-of-multiple-reactions.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFile2(
      page,
      'CDX/cascade-of-multiple-reactions-expected.cdx',
      FileType.CDX,
    );
    const fileContent = await readFileContents(
      'tests/test-data/CDX/cascade-of-multiple-reactions-expected.cdx',
    );
    await openPasteFromClipboard(page, fileContent);
    await pressButton(page, 'Open as New Project');
    await takeEditorScreenshot(page);
  });

  test('Verify the saving/loading a pathway with mixed single reactions and cascades from CDX,  MTAs are ignored', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2238
     * Description: Saving/loading a pathway with mixed single reactions and cascades from CDX,  MTAs are ignored.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/pathway-with-mixed-single-reactions-and-cascades.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await verifyFile2(
      page,
      'CDX/pathway-with-mixed-single-reactions-and-cascades-expected.cdx',
      FileType.CDX,
    );
    const fileContent = await readFileContents(
      'tests/test-data/CDX/pathway-with-mixed-single-reactions-and-cascades-expected.cdx',
    );
    await openPasteFromClipboard(page, fileContent);
    await pressButton(page, 'Open as New Project');
    await takeEditorScreenshot(page);
  });
});
