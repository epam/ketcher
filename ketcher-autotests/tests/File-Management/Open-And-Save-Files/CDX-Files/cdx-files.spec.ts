import { test, expect } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  pasteFromClipboardAndAddToCanvas,
  receiveFileComparisonData,
  saveToFile,
  waitForPageInit,
  selectTopPanelButton,
  TopPanelButton,
  pressButton,
  setReactionMarginSizeValue,
  setReactionMarginSizeOptionUnit,
  bondsSettings,
  setBondLengthValue,
  setBondLengthOptionUnit,
} from '@utils';
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

  test.fail(
    'Validate that the schema with retrosynthetic, angel arrows and plus could be saved to Cdx file and loaded back',
    async ({ page }) => {
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
    },
  );

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

  test('The Bond length setting with px option is applied, click on layout and it should be save to CDX specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied, click on layout and it should be save to CDX specification
  */
    await openFileAndAddToCanvas('KET/layout-with-catalyst.ket', page);
    await bondsSettings(page);
    await setBondLengthOptionUnit(page, 'px-option');
    await setBondLengthValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCdx(page);
    await saveToFile(
      'CDX/layout-with-catalyst-px-bond-lengh.cdx',
      expectedFile,
    );

    const { fileExpected: cdxFileExpected, file: cdxFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDX/layout-with-catalyst-px-bond-lengh.cdx',
      });

    expect(cdxFile).toEqual(cdxFileExpected);
  });

  test('The Bond length setting with pt option is applied, click on layout and it should be save to CDX specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied, click on layout and it should be save to CDX specification
  */
    await openFileAndAddToCanvas('KET/layout-with-diagonally-arrow.ket', page);
    await bondsSettings(page);
    await setBondLengthOptionUnit(page, 'pt-option');
    await setBondLengthValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCdx(page);
    await saveToFile(
      'CDX/layout-with-diagonally-arrow-pt-bond-lengh.cdx',
      expectedFile,
    );

    const { fileExpected: cdxFileExpected, file: cdxFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDX/layout-with-diagonally-arrow-pt-bond-lengh.cdx',
      });

    expect(cdxFile).toEqual(cdxFileExpected);
  });

  test('The Bond length setting with cm option is applied, click on layout and it should be save to CDX specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied, click on layout and it should be save to CDX specification
  */
    await openFileAndAddToCanvas('KET/layout-with-dif-elements.ket', page);
    await bondsSettings(page);
    await setBondLengthOptionUnit(page, 'cm-option');
    await setBondLengthValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCdx(page);
    await saveToFile(
      'CDX/layout-with-dif-elements-cm-bond-lengh.cdx',
      expectedFile,
    );

    const { fileExpected: cdxFileExpected, file: cdxFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDX/layout-with-dif-elements-cm-bond-lengh.cdx',
      });

    expect(cdxFile).toEqual(cdxFileExpected);
  });

  test('The Bond length setting with inch option is applied, click on layout and it should be save to CDX specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied, click on layout and it should be save to CDX specification
  */
    await openFileAndAddToCanvas('KET/layout-with-long-molecule.ket', page);
    await bondsSettings(page);
    await setBondLengthOptionUnit(page, 'inch-option');
    await setBondLengthValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCdx(page);
    await saveToFile(
      'CDX/layout-with-long-molecule-inch-bond-lengh.cdx',
      expectedFile,
    );

    const { fileExpected: cdxFileExpected, file: cdxFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDX/layout-with-long-molecule-inch-bond-lengh.cdx',
      });

    expect(cdxFile).toEqual(cdxFileExpected);
  });

  test('The Reaction component margin size setting with px option is applied, click on layout and it should be save to CDX specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Reaction component margin size setting is applied, click on layout and it should be save to CDX specification
  */
    await openFileAndAddToCanvas('KET/layout-with-catalyst.ket', page);
    await bondsSettings(page);
    await setReactionMarginSizeOptionUnit(page, 'px-option');
    await setReactionMarginSizeValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCdx(page);
    await saveToFile(
      'CDX/layout-with-catalyst-px-margin-size.cdx',
      expectedFile,
    );

    const { fileExpected: cdxFileExpected, file: cdxFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDX/layout-with-catalyst-px-margin-size.cdx',
      });

    expect(cdxFile).toEqual(cdxFileExpected);
  });

  test('The Reaction component margin size setting with pt option is applied, click on layout and it should be save to CDX specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Reaction component margin size setting is applied, click on layout and it should be save to CDX specification
  */
    await openFileAndAddToCanvas('KET/layout-with-diagonally-arrow.ket', page);
    await bondsSettings(page);
    await setReactionMarginSizeOptionUnit(page, 'pt-option');
    await setReactionMarginSizeValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCdx(page);
    await saveToFile(
      'CDX/layout-with-diagonally-arrow-pt-margin-size.cdx',
      expectedFile,
    );

    const { fileExpected: cdxFileExpected, file: cdxFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDX/layout-with-diagonally-arrow-pt-margin-size.cdx',
      });

    expect(cdxFile).toEqual(cdxFileExpected);
  });

  test('The Reaction component margin size setting with cm option is applied, click on layout and it should be save to CDX specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Reaction component margin size setting is applied, click on layout and it should be save to CDX specification
  */
    await openFileAndAddToCanvas('KET/layout-with-dif-elements.ket', page);
    await bondsSettings(page);
    await setReactionMarginSizeOptionUnit(page, 'cm-option');
    await setReactionMarginSizeValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCdx(page);
    await saveToFile(
      'CDX/layout-with-dif-elements-cm-margin-size.cdx',
      expectedFile,
    );

    const { fileExpected: cdxFileExpected, file: cdxFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDX/layout-with-dif-elements-cm-margin-size.cdx',
      });

    expect(cdxFile).toEqual(cdxFileExpected);
  });

  test('The Reaction component margin size setting with inch option is applied, click on layout and it should be save to CDX specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Reaction component margin size setting is applied, click on layout and it should be save to CDX specification
  */
    await openFileAndAddToCanvas('KET/layout-with-long-molecule.ket', page);
    await bondsSettings(page);
    await setReactionMarginSizeOptionUnit(page, 'inch-option');
    await setReactionMarginSizeValue(page, '7.8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    const expectedFile = await getCdx(page);
    await saveToFile('CDX/layout-with-long-molecule.cdx', expectedFile);

    const { fileExpected: cdxFileExpected, file: cdxFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDX/layout-with-long-molecule-inch-margin-size.cdx',
      });

    expect(cdxFile).toEqual(cdxFileExpected);
  });

  test('The ACS setting is applied, click on layout and it should be save to CDX specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/ketcher/issues/5156
  Description: add new option AVS style and check saving to different format
  */
    await openFileAndAddToCanvas('KET/layout-with-dif-elements.ket', page);
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await pressButton(page, 'ACS Style');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
    const expectedFile = await getCdx(page);
    await saveToFile(
      'CDX/layout-with-dif-elements-acs-style.cdx',
      expectedFile,
    );

    const { fileExpected: cdxFileExpected, file: cdxFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/CDX/layout-with-dif-elements-acs-style.cdx',
      });

    expect(cdxFile).toEqual(cdxFileExpected);
  });
});
