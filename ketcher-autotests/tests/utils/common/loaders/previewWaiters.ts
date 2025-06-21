import { Page } from '@playwright/test';

export async function waitForMonomerPreviewMicro(page: Page) {
  await page
    .getByTestId('monomer-preview-micro')
    .waitFor({ state: 'visible', timeout: 5000 });
}
