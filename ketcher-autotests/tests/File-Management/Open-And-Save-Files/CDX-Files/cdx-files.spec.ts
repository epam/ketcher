import { test, expect } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  pasteFromClipboardAndAddToCanvas,
  receiveFileComparisonData,
  saveToFile,
  waitForPageInit,
} from '@utils';
import { getCdx } from '@utils/formats';

test.describe('CDX files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('opening cdx files', async ({ page }) => {
    /* 
    Test case: EPMLSOPKET-12514
    Description: Open CDX files
    */
    await openFileAndAddToCanvas('CDX/cdx-expanded-contracted.cdx', page);
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
});
