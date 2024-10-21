import { Page } from '@playwright/test';

export async function pressUndoButton(page: Page) {
  // await page.getByTestId('undo').click();
  await page.getByRole('button', { name: 'Undo (Ctrl+Z)' }).click();
}

export async function pressRedoButton(page: Page) {
  // await page.getByTestId('redo').click();
  await page.getByRole('button', { name: 'Redo (Ctrl+Shift+Z)' }).click();
}
