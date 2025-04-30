import { Page } from '@playwright/test';

export const topRightToolbar = (page: Page) => {
  const settingsButton = page.getByTestId('settings-button');
  const helpButton = page.getByTestId('help-button');
  const aboutButton = page.getByTestId('about-button');

  return {
    settingsButton,
    helpButton,
    aboutButton,
    selectAboutButton: async () => {
      await aboutButton.click();
    },
  };
};
