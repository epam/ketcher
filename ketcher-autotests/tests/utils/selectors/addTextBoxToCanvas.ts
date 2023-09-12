import { Page } from '@playwright/test';
import { clickInTheMiddleOfTheScreen } from '@utils';

export async function addTextBoxToCanvas(page: Page) {
  await page.getByTitle('Add text (Alt+T)').click();
  await clickInTheMiddleOfTheScreen(page);
  await page.getByRole('dialog').getByRole('textbox').click();
}
