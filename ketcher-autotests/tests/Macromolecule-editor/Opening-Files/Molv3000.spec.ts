import { test, expect } from '@playwright/test';
import {
  TopPanelButton,
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  openFromFileViaClipboard,
  readFileContents,
  selectTopPanelButton,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import {
  chooseFileFormat,
  turnOnMacromoleculesEditor,
} from '@utils/macromolecules';

function removeNotComparableData(file: string) {
  return file
    .split('\n')
    .filter((_, lineNumber) => lineNumber !== 1)
    .join('\n');
}

const topLeftCorner = -300;

test.describe('MolV300 Files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Import', async ({ page }) => {
    await openFileAndAddToCanvas(
      'Molfiles-V3000/monomers-and-chem.mol',
      page,
      topLeftCorner,
      topLeftCorner,
    );
    await takeEditorScreenshot(page);
  });

  test('Import with clipboard', async ({ page }) => {
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFromFileViaClipboard(
      'tests/test-data/Molfiles-V3000/monomers-and-chem.mol',
      page,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Import incorrect data', async ({ page }) => {
    const randomText = 'asjfnsalkfl';
    await selectTopPanelButton(TopPanelButton.Open, page);
    await page.getByTestId('paste-from-clipboard-button').click();
    await page.getByTestId('open-structure-textarea').fill(randomText);
    await page.getByTestId('add-to-canvas-button').click();
    await takeEditorScreenshot(page);
  });

  test('Export MolV3000', async ({ page }) => {
    await openFileAndAddToCanvas('KET/monomers-and-chem.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'MDL Molfile V3000');

    const textArea = page.getByTestId('preview-area-text');
    const file = await readFileContents(
      'tests/test-data/Molfiles-V3000/monomers-and-chem.mol',
    );
    const expectedData = removeNotComparableData(file);
    const valueInTextarea = removeNotComparableData(
      await textArea.inputValue(),
    );
    await expect(valueInTextarea).toBe(expectedData);
  });
});
