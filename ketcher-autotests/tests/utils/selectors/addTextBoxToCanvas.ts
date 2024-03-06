import { Page } from '@playwright/test';
import { clickInTheMiddleOfTheScreen } from '@utils';

export async function addTextBoxToCanvas(page: Page) {
  await page.getByTestId('text').click();
  await clickInTheMiddleOfTheScreen(page);
  await page.getByRole('dialog').getByRole('textbox').click();
}
