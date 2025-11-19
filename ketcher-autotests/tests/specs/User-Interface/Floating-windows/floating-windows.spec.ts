/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@fixtures';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFile,
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  pasteFromClipboardAndAddToCanvas,
  pasteFromClipboardAndOpenAsNewProject,
  readFileContent,
} from '@utils';
import { OpenStructureDialog } from '@tests/pages/common/OpenStructureDialog';
import { PasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { CalculatedValuesDialog } from '@tests/pages/molecules/canvas/CalculatedValuesDialog';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';

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
    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('C20H25N3O');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '323.440',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '323.200',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue('C 74.3 H 7.8 N 13.0 O 5.0');
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
    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('C20H25N3O');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '323',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '323',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue('C 74.3 H 7.8 N 13.0 O 5.0');
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
    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('C20H25N3O');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '323.4399935',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '323.1997615',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue('C 74.3 H 7.8 N 13.0 O 5.0');
  });

  test('Calculate values: verify UI (empty canvas)', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4002
      Description: verify empty fields in floating window for empty canvas 
    */
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('Chemical Formula:');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toBeEmpty();
    await expect(CalculatedValuesDialog(page).exactMassInput).toBeEmpty();
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toBeEmpty();
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
    await RightToolbar(page).extendedTable();
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
    await CalculatedValuesDialog(page).closeWindow();
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('C7H16');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '100.2050',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '100.1',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue('C 83.9 H 16.1');
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
    const errorMessage = await ErrorMessageDialog(page).getErrorMessage();
    expect(errorMessage).toContain(
      "Convert error!\nGiven string could not be loaded as (query or plain) molecule or reaction, see the error messages: 'molecule auto loader: SMILES loader: 'A' specifier is allowed only for query molecules', 'scanner: BufferScanner::read() error', 'scanner: BufferScanner::read() error', 'molecule auto loader: SMILES loader: unexpected end of input', 'molecule auto loader: SMILES loader: 'A' specifier is allowed only for query molecules', 'scanner: BufferScanner::read() error'",
    );
    await ErrorMessageDialog(page).close();
    await PasteFromClipboardDialog(page).cancel();
  });

  test('Paste from clipboard as a new project', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4011
      Description: place structure via paste from clipboard 
    */
    const fileContent = await readFileContent(
      'Rxn-V2000/benzene-arrow-benzene-reagent-hcl.rxn',
    );
    await pasteFromClipboardAndOpenAsNewProject(page, fileContent);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });
});
