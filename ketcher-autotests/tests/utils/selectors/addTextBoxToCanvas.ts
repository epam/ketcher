import { Page } from '@playwright/test';
import { clickInTheMiddleOfTheScreen } from '@utils';

/**
 * Click in the Text Tool and put the textbox in center of canvas
 **/

export async function addTextBoxToCanvas(page: Page) {
  await page.getByTitle('Add text (Alt+T)').click();
  await clickInTheMiddleOfTheScreen(page);
  await page.getByRole('dialog').getByRole('textbox').click();
}
