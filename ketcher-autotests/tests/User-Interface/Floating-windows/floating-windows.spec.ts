import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectTopPanelButton,
  waitForPageInit,
  TopPanelButton,
  readFileContents,
  openFile,
  pressButton,
  FILE_TEST_DATA,
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  pasteFromClipboard,
  pasteFromClipboardAndAddToCanvas,
  waitForLoad,
} from '@utils';

async function openFileViaClipboard(filename: string, page: Page) {
  const fileContent = await readFileContents(filename);
  await page.getByText('Paste from clipboard').click();
  await page.getByRole('dialog').getByRole('textbox').fill(fileContent);
}

async function editText(page: Page, text: string) {
  await page.getByTestId('openStructureModal').getByRole('textbox').click();
  await page.keyboard.press('Home');
  await page.keyboard.insertText(text);
}

test.describe('Floating windows', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Open structure: Opening the text file', async ({ page }) => {
    // Test case: EPMLSOPKET-4004
    // Verify adding text file and ability of editing it
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFileViaClipboard('tests/test-data/Txt/kecther-text.txt', page);
    await editText(page, '  NEW TEXT   ');
  });

  test('Open structure: Errors of input (text file)', async ({ page }) => {
    // Test case: EPMLSOPKET-4007
    // Verify if adding incorrect text file triggers Error message
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('Txt/incorect-text.txt', page);
    await pressButton(page, 'Add to Canvas');
  });

  test('Calculate values (data on canvas)', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-3998
      Description: verify the floating window with calculated values 
    */
    await openFileAndAddToCanvas('Molfiles-V2000/bicycle.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('Calculated values: check accuracy', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-3999(1)
      Description: verify 0 decimal places after the dot for calculated values 
    */
    await openFileAndAddToCanvas('Molfiles-V2000/bicycle.mol', page);
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
    await openFileAndAddToCanvas('Molfiles-V2000/bicycle.mol', page);
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
      Description: Change dedcimal places
    */
    await openFileAndAddToCanvas('KET/calculated-values-chain.ket', page);
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
      Test case: EPMLSOPKET-4005, EPMLSOPKET-4009
      Description: open text file via "open file" 
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('CML/cml-molecule.cml', page);
  });

  test('Paste from clipboard', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4006
      Description: place structure via paste from clipboard 
    */
    await pasteFromClipboardAndAddToCanvas(
      page,
      'InChI=1S/C12H16/c1-10-7-8-12(9-10)11-5-3-2-4-6-11/h2-6,10,12H,7-9H2,1H3',
    );
  });

  test('Paste from clipboard/bad data', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4008
      Description: Bad data via paste from clipboard 
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await page.getByText('Paste from clipboard').click();
    await pasteFromClipboard(page, 'VAAA==');
    await pressButton(page, 'Add to Canvas');
  });

  test('Paste from clipboard as a new project', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4011
      Description: place structure via paste from clipboard 
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await page.getByText('Paste from clipboard').click();
    await pasteFromClipboard(
      page,
      FILE_TEST_DATA.benzeneArrowBenzeneReagentHclV2000,
    );
    await waitForLoad(page, () => {
      pressButton(page, 'Open as New Project');
    });
    await clickInTheMiddleOfTheScreen(page);
  });
});
