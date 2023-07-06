import { test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  TopPanelButton,
  selectTopPanelButton,
  delay,
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  DELAY_IN_SECONDS,
  pasteFromClipboardAndAddToCanvas,
} from '@utils';

test.describe('CDX files', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await delay(DELAY_IN_SECONDS.TWO);
    await takeEditorScreenshot(page);
  });

  test.fixme('opening cdx files', async ({ page }) => {
    /* 
    Test case: EPMLSOPKET-12514
    Description: Open CDX files
    */
    await openFileAndAddToCanvas('cdx-expanded-contracted.cdx', page);
  });

  test.fixme('opening cdx files with R-group', async ({ page }) => {
    /* 
    Test case: EPMLSOPKET-6973
    Description: Open CDX files with R-group
    */
    await openFileAndAddToCanvas('cdx_file.cdx', page);
  });

  test('opening cdx files from clickboard', async ({ page }) => {
    /* 
  Test case: EPMLSOPKET-6972
  Description: Open structure created in ChemDraw from clickboard
  */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await page.getByText('Paste from clipboard').click();
    await pasteFromClipboardAndAddToCanvas(
      page,
      // eslint-disable-next-line max-len
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAQCEAClnXYBBmHkAKuSsgHwQBgBAAMOAAIA////////AAAAAAAAAAETAAEAAQABAOIECQBTYW5zU2VyaWYBgAIAAAADgAMAAAAEAhAApR11AQbh4gCrErQB8MAZAQSABAAAAAACCACmm4UBBmHkAAIEAgAGACsEAgABAAAABIAFAAAAAAIIACiYhQHwQBgBAgQCAAcAKwQCAAAAAAAEgAYAAAAAAggApZ12ATJd/gACBAIACAArBAIAAAAAAASABwAAAAACCACnmaMB8EAYAQIEAgAGACsEAgABAAAABIAIAAAAAAIIABC8owEGYeQAAgQCAAYAKwQCAAEAAAAEgAkAAAAAAggAq5KyASdu/gACBAIABgArBAIAAQAAAAWACgAAAAQGBAAGAAAABQYEAAQAAAAABgIAAgABBgIAAAAAAAWACwAAAAQGBAAHAAAABQYEAAUAAAAABgIAAgABBgIAAAAAAAWADAAAAAQGBAAEAAAABQYEAAgAAAAABgIAAQABBgIAAAAAAAWADQAAAAQGBAAFAAAABQYEAAYAAAAABgIAAQABBgIAAAAAAAWADgAAAAQGBAAIAAAABQYEAAkAAAAABgIAAgABBgIAAAAAAAWADwAAAAQGBAAJAAAABQYEAAcAAAAABgIAAQABBgIAAAAAAAAAAAAAAA==',
    );
    await clickInTheMiddleOfTheScreen(page);
  });
});
