import { Page } from '@playwright/test';
import { turnOnMacromoleculesEditor } from '.';
import { RNA_TAB } from '@constants/testIdConstants';

export async function toggleRnaBuilderAccordion(page: Page) {
  await page.getByText('RNA Builder').locator('button').click();
}

export async function gotoRNA(page: Page) {
  await turnOnMacromoleculesEditor(page);
  await page.getByTestId(RNA_TAB).click();
  await toggleRnaBuilderAccordion(page);
}
