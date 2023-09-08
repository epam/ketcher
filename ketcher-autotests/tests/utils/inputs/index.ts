import { Page, expect } from '@playwright/test';

export async function waitForInputUpdate(page: Page) {
  await expect(
    page.getByTestId('preview-area-text').inputValue.length,
  ).toBeGreaterThan(0);
}
