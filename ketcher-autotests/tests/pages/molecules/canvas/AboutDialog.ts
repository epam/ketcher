import { type Page } from '@playwright/test';

export const aboutDialogLocators = (page: Page) => ({
  aboutButton: page.getByTestId('about-button'),
  closeWindowButton: page.getByTestId('close-window-button'),
  okButton: page.getByTestId('ok-button'),
  buildVersion: page.getByTestId('build-version'),
  buildTime: page.getByTestId('build-time'),
  buildIndigoVersion: page.getByTestId('build-indigo-version'),
});

export async function selectAboutButton(page: Page) {
  await aboutDialogLocators(page).aboutButton.click();
}

export async function closeAboutDialogByCloseWindowButton(page: Page) {
  await aboutDialogLocators(page).closeWindowButton.click();
}

export async function closeAboutDialogByOkButton(page: Page) {
  await aboutDialogLocators(page).okButton.click();
}
