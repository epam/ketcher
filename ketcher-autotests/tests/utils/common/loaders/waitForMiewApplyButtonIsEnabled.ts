import { Page, expect } from '@playwright/test';
import { MiewDialog } from '@tests/pages/molecules/canvas/MiewDialog';

export async function miewApplyButtonIsEnabled(page: Page) {
  const { applyButton } = MiewDialog(page);
  await expect(applyButton).toBeEnabled();
}
