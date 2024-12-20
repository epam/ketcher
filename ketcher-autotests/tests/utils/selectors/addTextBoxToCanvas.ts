import { Page } from '@playwright/test';
import { clickInTheMiddleOfTheScreen } from '@utils';

export async function addTextBoxToCanvas(page: Page) {
  await page.getByTestId('text').click();
  await clickInTheMiddleOfTheScreen(page);
  await page.getByRole('dialog').getByRole('textbox').click();
}

export async function addTextToCanvas(
  page: Page,
  text: string,
  x?: number,
  y?: number,
) {
  await page.getByTestId('text').click();
  if (x !== undefined && y !== undefined) {
    await page.mouse.click(x, y);
  } else {
    await clickInTheMiddleOfTheScreen(page);
  }
  const textBox = page.getByRole('dialog').getByRole('textbox');
  await textBox.click();
  await textBox.fill(text);
}
