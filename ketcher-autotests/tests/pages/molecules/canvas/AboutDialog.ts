import { Page, Locator } from '@playwright/test';

type AboutDialogLocators = {
  closeWindowButton: Locator;
  okButton: Locator;
  buildVersion: Locator;
  buildTime: Locator;
  buildIndigoVersion: Locator;
};

export const AboutDialog = (page: Page) => {
  const locators: AboutDialogLocators = {
    closeWindowButton: page.getByTestId('close-window-button'),
    okButton: page.getByTestId('ok-button'),
    buildVersion: page.getByTestId('build-version'),
    buildTime: page.getByTestId('build-time'),
    buildIndigoVersion: page.getByTestId('build-indigo-version'),
  };

  return {
    ...locators,

    async closeByX() {
      await locators.closeWindowButton.click();
    },

    async closeByOk() {
      await locators.okButton.click();
    },
  };
};

export type AboutDialogType = ReturnType<typeof AboutDialog>;
