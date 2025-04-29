import { type Page } from '@playwright/test';

export const openStructureDialog = (page: Page) => ({
  pasteFromClipboardButton: page.getByTestId('paste-from-clipboard-button'),
  openFromFileButton: page.getByTestId('open-from-file-button'),
  openFromImageButton: page.getByTestId('open-from-image-button'),
  closeWindowButton: page.getByTestId('close-window-button'),
});
