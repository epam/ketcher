import { Page } from '@playwright/test';
import { TextEditorDialog } from '@tests/pages/molecules/canvas/TextEditorDialog';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { clickInTheMiddleOfTheScreen } from '@utils';

export async function addTextBoxToCanvas(page: Page) {
  await LeftToolbar(page).text();
  await clickInTheMiddleOfTheScreen(page);
  await TextEditorDialog(page).clickTextEditor();
}

export async function addTextToCanvas(
  page: Page,
  text: string,
  x?: number,
  y?: number,
) {
  await LeftToolbar(page).text();
  if (x !== undefined && y !== undefined) {
    await page.mouse.click(x, y);
  } else {
    await clickInTheMiddleOfTheScreen(page);
  }
  await TextEditorDialog(page).setText(text);
}
