import { test, expect } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  pasteFromClipboardAndAddToCanvas,
  receiveFileComparisonData,
  saveToFile,
} from '@utils';
import { waitForPageInit } from '@utils/common/loaders/waitForPageInit';
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
