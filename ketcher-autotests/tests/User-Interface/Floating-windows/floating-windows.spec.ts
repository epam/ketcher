import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectTopPanelButton,
  waitForPageInit,
  TopPanelButton,
  readFileContents,
  openFile,
  pressButton,
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
});
