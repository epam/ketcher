import { Page } from '@playwright/test';

export async function pressCancelAtEditAbbreviationDialog(page: Page) {
  await page.getByRole('button', { name: 'Cancel' }).click();
}

export async function pressRemoveAbbreviationAtEditAbbreviationDialog(
  page: Page,
) {
  await page.getByRole('button', { name: 'Remove Abbreviation' }).click();
}
