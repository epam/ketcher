import { Page } from '@playwright/test';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';

export async function selectElementFromExtendedTable(
  page: Page,
  element: string,
  button: string,
) {
  const extendedTableButton = RightToolbar(page).extendedTableButton;

  await extendedTableButton.click();
  await page.getByRole('button', { name: element, exact: true }).click();
  await page.getByRole('button', { name: button, exact: true }).click();
}
