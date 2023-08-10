import { test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  takeEditorScreenshot,
  pasteFromClipboardAndAddToCanvas,
  openFileAndAddToCanvas,
  openFile,
  FILE_TEST_DATA,
  pasteFromClipboard,
  waitForLoad,
  pressButton,
} from '@utils';

test.describe('Click and drag FG on canvas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    // await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Calculate values (data on canvas)', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-3998
      Description: verify the floating window with calculated values 
    */
    await openFileAndAddToCanvas('bicycle.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('Calculated values: check accuracy', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-3999(1)
      Description: verify 0 decimal places after the dot for calculated values 
    */
    await openFileAndAddToCanvas('bicycle.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
    await page
      .getByRole('listitem')
      .filter({ hasText: 'Molecular Weight:Decimal places3' })
      .getByRole('button', { name: '3' })
      .click();
    await page.getByRole('option', { name: '0' }).click();
    await page.getByRole('button', { name: '3', exact: true }).click();
    await page.getByRole('option', { name: '0' }).click();
  });

  test('Calculated values: check accuracy 2', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-3999(2)
      Description: verify 7 decimal places after the dot for calculated values 
    */
    await openFileAndAddToCanvas('bicycle.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
    await page
      .getByRole('listitem')
      .filter({ hasText: 'Molecular Weight:Decimal places3' })
      .getByRole('button', { name: '3' })
      .click();
    await page.getByRole('option', { name: '7' }).click();
    await page.getByRole('button', { name: '3', exact: true }).click();
    await page.getByRole('option', { name: '7' }).click();
  });

  test('Calculate values: verify UI (empty canvas)', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4002
      Description: verify empty fields in floating window for empty canvas 
    */
    // await page.getByRole('button',
    // { name: 'Calculated Values (Alt+C)' }).click();
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('Open structure: Open window', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4003
      Description: verify floating window for 
      open/drag file or paste from clipboard 
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
  });

  test('Floating windows - Extended table: Verify UI', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4010
      Description: verify visual representation of "Extended" table 
    */
    await page.getByTestId('extended-table').click();
  });

  test('Calculated Values', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4000
      Description: Chamge dedcimal places
    */
    await openFileAndAddToCanvas('calculated-values-chain.ket', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
    await page.getByText('Decimal places3').first().click();
    await page.getByRole('option', { name: '4' }).click();
    await page.getByText('Decimal places3').click();
    await page.getByRole('option', { name: '1' }).click();
    await page.keyboard.press('Escape');
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('Opening text file', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4005
      Description: open text file via "open file" 
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('cml-1945.cml', page);
  });

  test('Paste from clipboard', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4006
      Description: place structure via paste from clipboard 
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await page.getByText('Paste from clipboard').click();
    /*  eslint max-len: ["error", { "ignoreStrings": true }] */
    await pasteFromClipboardAndAddToCanvas(
      page,
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAQCEAClnXYBBmHkAKuSsgHwQBgBAAMOAAIA////////AAAAAAAAAAETAAEAAQABAOIECQBTYW5zU2VyaWYBgAIAAAADgAMAAAAEAhAApR11AQbh4gCrErQB8MAZAQSABAAAAAACCACmm4UBBmHkAAIEAgAGACsEAgABAAAABIAFAAAAAAIIACiYhQHwQBgBAgQCAAcAKwQCAAAAAAAEgAYAAAAAAggApZ12ATJd/gACBAIACAArBAIAAAAAAASABwAAAAACCACnmaMB8EAYAQIEAgAGACsEAgABAAAABIAIAAAAAAIIABC8owEGYeQAAgQCAAYAKwQCAAEAAAAEgAkAAAAAAggAq5KyASdu/gACBAIABgArBAIAAQAAAAWACgAAAAQGBAAGAAAABQYEAAQAAAAABgIAAgABBgIAAAAAAAWACwAAAAQGBAAHAAAABQYEAAUAAAAABgIAAgABBgIAAAAAAAWADAAAAAQGBAAEAAAABQYEAAgAAAAABgIAAQABBgIAAAAAAAWADQAAAAQGBAAFAAAABQYEAAYAAAAABgIAAQABBgIAAAAAAAWADgAAAAQGBAAIAAAABQYEAAkAAAAABgIAAgABBgIAAAAAAAWADwAAAAQGBAAJAAAABQYEAAcAAAAABgIAAQABBgIAAAAAAAAAAAAAAA==',
    );
  });

  test('Paste from clipboard/bad data', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4008
      Description: bad data via paste from clipboard 
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await page.getByText('Paste from clipboard').click();
    await pasteFromClipboardAndAddToCanvas(
      page,
      // eslint-disable-next-line max-len
      'VAAA==',
    );
  });

  test('Opening text file/placeholder', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4009
      Description: open text file via "open file", check loading
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('cml-1945.cml', page);
  });
  test('Paste from clipboard as a new project', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4011
      Description: place structure via paste from clipboard 
    */
    await pasteFromClipboard(
      page,
      FILE_TEST_DATA.benzeneArrowBenzeneReagentHclV2000,
    );
    await waitForLoad(page, () => {
      pressButton(page, 'Open as New Project');
    });
  });
});
