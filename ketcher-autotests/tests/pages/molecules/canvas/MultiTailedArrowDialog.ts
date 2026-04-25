import { Page } from '@playwright/test';

export function MultiTailedArrowDialog(page: Page) {
  const dialog = page.locator('[role="dialog"]').filter({ hasText: /tail/i });

  return {
    async setNumberOfTails(count: number) {
      const input = dialog.locator('input[name="tails"], input[placeholder*="tail"], input[label*="tail"]').first();
      await input.fill(String(count));
    },

    async setSpineLength(length: number) {
      const input = dialog.locator('input[name="spineLength"], input[placeholder*="spine"], input[label*="spine"]').first();
      await input.fill(String(length));
    },

    async confirm() {
      const applyBtn = dialog.locator('button:has-text("Apply"), button:has-text("OK"), button[type="submit"]').first();
      await applyBtn.click();
    },

    async cancel() {
      const cancelBtn = dialog.locator('button:has-text("Cancel")').first();
      await cancelBtn.click();
    },
  };
}