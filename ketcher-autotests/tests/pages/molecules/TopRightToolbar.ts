import { Page, Locator } from '@playwright/test';

type TopRightToolbarLocators = {
  settingsButton: Locator;
  helpButton: Locator;
  aboutButton: Locator;
};

export const TopRightToolbar = (page: Page) => {
  const locators: TopRightToolbarLocators = {
    settingsButton: page.getByTestId('settings-button'),
    helpButton: page.getByTestId('help-button'),
    aboutButton: page.getByTestId('about-button'),
  };

  return {
    ...locators,

    async Settings() {
      await locators.settingsButton.click();
    },

    async Help() {
      await locators.helpButton.click();
    },

    async About() {
      await locators.aboutButton.click();
    },
  };
};

export type TopRightToolbarType = ReturnType<typeof TopRightToolbar>;
