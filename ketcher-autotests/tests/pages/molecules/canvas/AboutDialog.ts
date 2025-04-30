import { type Page } from '@playwright/test';

export const aboutDialogLocators = (page: Page) => ({
  closeWindowButton: page.getByTestId('close-window-button'),
  okButton: page.getByTestId('ok-button'),
  buildVersion: page.getByTestId('build-version'),
  buildTime: page.getByTestId('build-time'),
  buildIndigoVersion: page.getByTestId('build-indigo-version'),
});

export async function closeAboutDialogByCloseWindowButton(page: Page) {
  await aboutDialogLocators(page).closeWindowButton.click();
}

export async function closeAboutDialogByOkButton(page: Page) {
  await aboutDialogLocators(page).okButton.click();
}
