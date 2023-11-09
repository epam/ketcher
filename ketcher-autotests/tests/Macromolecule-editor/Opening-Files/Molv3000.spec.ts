import { test } from '@playwright/test';
import {
  TopPanelButton,
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  openFromFileViaClipboard,
  selectTopPanelButton,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

test.describe('MolV300 Files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Import', async ({ page }) => {
    await openFileAndAddToCanvas('Molfiles-V3000/Insulin.mol', page);
    await takeEditorScreenshot(page);
  });

  test('Import with clipboard', async ({ page }) => {
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFromFileViaClipboard(
      'tests/test-data/Molfiles-V3000/Insulin.mol',
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
    await takeEditorScreenshot(page);
  });

  test('Export MolV3000', async ({ page }) => {
    await openFileAndAddToCanvas('KET/monomers-with-bonds.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    const textArea = page.getByTestId('preview-area-text');
    await expect(textArea).toHaveValue();
  });
});
