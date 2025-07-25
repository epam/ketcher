/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
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
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { CalculatedValuesDialog } from '@tests/pages/molecules/canvas/CalculatedValuesDialog';

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
    await CommonTopLeftToolbar(page).openFile();
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

    await CommonTopLeftToolbar(page).openFile();
    await openFile(page, 'Txt/incorect-text.txt');
    await addToCanvasButton.click();
    await takeEditorScreenshot(page);
  });

  test('Calculate values (data on canvas)', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-3998
      Description: verify the floating window with calculated values 
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/bicycle.mol');
    await IndigoFunctionsToolbar(page).calculatedValues();
    await takeEditorScreenshot(page);
  });

  test('Calculated values: check accuracy', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-3999(1)
      Description: verify 0 decimal places after the dot for calculated values 
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/bicycle.mol');
    await IndigoFunctionsToolbar(page).calculatedValues();
    await CalculatedValuesDialog(page).selectMolecularWeightDecimalPlaces(0);
    await CalculatedValuesDialog(page).selectExactMassDecimalPlaces(0);
    await takeEditorScreenshot(page);
  });

  test('Calculated values: check accuracy 2', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-3999(2)
      Description: verify 7 decimal places after the dot for calculated values 
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/bicycle.mol');
    await IndigoFunctionsToolbar(page).calculatedValues();
    await CalculatedValuesDialog(page).selectMolecularWeightDecimalPlaces(7);
    await CalculatedValuesDialog(page).selectExactMassDecimalPlaces(7);
    await takeEditorScreenshot(page);
  });

  test('Calculate values: verify UI (empty canvas)', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4002
      Description: verify empty fields in floating window for empty canvas 
    */
    await IndigoFunctionsToolbar(page).calculatedValues();
    await takeEditorScreenshot(page);
  });

  test('Open structure: Open window', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4003
      Description: verify floating window for 
      open/drag file or paste from clipboard 
    */
    await CommonTopLeftToolbar(page).openFile();
    await takeEditorScreenshot(page);
  });

  test('Floating windows - Extended table: Verify UI', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4010
      Description: verify visual representation of "Extended" table 
    */
    const extendedTableButton = RightToolbar(page).extendedTableButton;

    await extendedTableButton.click();
    await takeEditorScreenshot(page);
  });

  test('Calculated Values', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4000
      Description: Change dedcimal places
    */
    await openFileAndAddToCanvas(page, 'KET/calculated-values-chain.ket');
    await IndigoFunctionsToolbar(page).calculatedValues();
    await CalculatedValuesDialog(page).selectMolecularWeightDecimalPlaces(4);
    await CalculatedValuesDialog(page).selectExactMassDecimalPlaces(1);
    await CalculatedValuesDialog(page).closeByX();
    await IndigoFunctionsToolbar(page).calculatedValues();
    await takeEditorScreenshot(page);
  });

  test('Opening text file', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4005, EPMLSOPKET-4009
      Description: open text file via "open file" 
    */
    await CommonTopLeftToolbar(page).openFile();
    await openFile(page, 'CML/cml-molecule.cml');
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
    await pasteFromClipboardAndAddToCanvas(page, 'VAAA==', true);
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
