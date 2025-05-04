import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectTopPanelButton,
  waitForPageInit,
  TopPanelButton,
  openFile,
  FILE_TEST_DATA,
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  pasteFromClipboardAndAddToCanvas,
  pasteFromClipboardAndOpenAsNewProject,
  readFileContent,
} from '@utils';
import { OpenStructureDialog } from '@tests/pages/common/OpenStructureDialog';
import { PasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';
import { closeErrorAndInfoModals } from '@utils/common/helpers';
import { rightToolbar } from '@tests/pages/molecules/RightToolbar';
import { TopLeftToolbar } from '@tests/pages/common/TopLeftToolbar';

async function editText(page: Page, text: string) {
  await page.getByTestId('openStructureModal').getByRole('textbox').click();
  await page.keyboard.press('Home');
  await page.keyboard.insertText(text);
}

test.describe('Floating windows', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Open structure: Opening the text file', async ({ page }) => {
    // Test case: EPMLSOPKET-4004
    // Verify adding text file and ability of editing it
    await TopLeftToolbar(page).openFile();
    const fileContent = await readFileContent('Txt/kecther-text.txt');
    await OpenStructureDialog(page).pasteFromClipboard();
    await PasteFromClipboardDialog(page).openStructureTextarea.fill(
      fileContent,
    );

    await editText(page, '  NEW TEXT   ');
    await takeEditorScreenshot(page);
  });

  test('Open structure: Errors of input (text file)', async ({ page }) => {
    // Test case: EPMLSOPKET-4007
    // Verify if adding incorrect text file triggers Error message
    const addToCanvasButton = PasteFromClipboardDialog(page).addToCanvasButton;

    await TopLeftToolbar(page).openFile();
    await openFile('Txt/incorect-text.txt', page);
    await addToCanvasButton.click();
    await takeEditorScreenshot(page);
  });

  test('Calculate values (data on canvas)', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-3998
      Description: verify the floating window with calculated values 
    */
    await openFileAndAddToCanvas('Molfiles-V2000/bicycle.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
    await takeEditorScreenshot(page);
  });

  test('Calculated values: check accuracy', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-3999(1)
      Description: verify 0 decimal places after the dot for calculated values 
    */
    await openFileAndAddToCanvas('Molfiles-V2000/bicycle.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
    await page.getByTestId('Molecular Weight-select').click();
    await page.getByRole('option', { name: '0' }).click();
    await page.getByTestId('Exact Mass-select').click();
    await page.getByRole('option', { name: '0' }).click();
    await takeEditorScreenshot(page);
  });

  test('Calculated values: check accuracy 2', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-3999(2)
      Description: verify 7 decimal places after the dot for calculated values 
    */
    await openFileAndAddToCanvas('Molfiles-V2000/bicycle.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
    await page.getByTestId('Molecular Weight-select').click();
    await page.getByRole('option', { name: '7' }).click();
    await page.getByTestId('Exact Mass-select').click();
    await page.getByRole('option', { name: '7' }).click();
    await takeEditorScreenshot(page);
  });

  test('Calculate values: verify UI (empty canvas)', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4002
      Description: verify empty fields in floating window for empty canvas 
    */
    await selectTopPanelButton(TopPanelButton.Calculated, page);
    await takeEditorScreenshot(page);
  });

  test('Open structure: Open window', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4003
      Description: verify floating window for 
      open/drag file or paste from clipboard 
    */
    await TopLeftToolbar(page).openFile();
    await takeEditorScreenshot(page);
  });

  test('Floating windows - Extended table: Verify UI', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4010
      Description: verify visual representation of "Extended" table 
    */
    const extendedTableButton = rightToolbar(page).extendedTableButton;

    await extendedTableButton.click();
    await takeEditorScreenshot(page);
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
    await takeEditorScreenshot(page);
  });

  test('Opening text file', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4005, EPMLSOPKET-4009
      Description: open text file via "open file" 
    */
    await TopLeftToolbar(page).openFile();
    await openFile('CML/cml-molecule.cml', page);
    await takeEditorScreenshot(page);
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
    await takeEditorScreenshot(page);
  });

  test('Paste from clipboard/bad data', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4008
      Description: Bad data via paste from clipboard 
    */
    await pasteFromClipboardAndAddToCanvas(page, 'VAAA==', false);
    await takeEditorScreenshot(page);
    await closeErrorAndInfoModals(page);
  });

  test('Paste from clipboard as a new project', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4011
      Description: place structure via paste from clipboard 
    */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      FILE_TEST_DATA.benzeneArrowBenzeneReagentHclV2000,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });
});
