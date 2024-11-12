import { Page } from '@playwright/test';
import { waitForRender } from '@utils/common/loaders/waitForRender';

export async function pressUndoButton(page: Page) {
  await waitForRender(page, async () => {
    await page.getByTestId('undo').click();
  });
}

export async function pressRedoButton(page: Page) {
  await waitForRender(page, async () => {
    await page.getByTestId('redo').click();
  });
}
