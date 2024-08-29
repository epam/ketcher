import { Page } from '@playwright/test';

export async function pressUndoButton(page: Page) {
  await page.getByTestId('undo').click();
}

export async function pressRedoButton(page: Page) {
  await page.getByTestId('redo').click();
}
