import { Page } from '@playwright/test';
import {
  selectTopPanelButton,
  pressButton,
  TopPanelButton,
  clickInTheMiddleOfTheScreen,
} from '@utils';

export async function openFile(filename: string, page: Page) {
  const [fileChooser] = await Promise.all([
    // It is important to call waitForEvent before click to set up waiting.
    page.waitForEvent('filechooser'),
    // Opens the file chooser.
    page
      .getByRole('button', { name: 'or drag file here Open from file' })
      .click(),
  ]);
  await fileChooser.setFiles(`tests/test-data/${filename}`);
}
// Open file and put in center of canvas
export async function openFileAndAddToCanvas(filename: string, page: Page) {
  await selectTopPanelButton(TopPanelButton.Open, page);
  await openFile(filename, page);
  await pressButton(page, 'Add to Canvas');
  await clickInTheMiddleOfTheScreen(page);
}
