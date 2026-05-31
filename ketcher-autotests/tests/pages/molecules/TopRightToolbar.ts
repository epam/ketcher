import { Page, Locator } from '@playwright/test';

type TopRightToolbarLocators = {
  settingsButton: Locator;
};

export const TopRightToolbar = (page: Page) => {
  const locators: TopRightToolbarLocators = {
    settingsButton: page.getByTestId('settings-button'),
  };

  return {
    ...locators,

    async Settings(options?: { waitForFontListLoad: boolean }) {
      await locators.settingsButton.click();
      if (options?.waitForFontListLoad) {
        // Wait while system loads list of values (i.e. Arial in particular) in Font combobox
        await page.waitForSelector('div[role="combobox"]', {
          state: 'attached',
        });
        await page.waitForSelector('div[role="combobox"]:has-text("Arial")', {
          timeout: 5000,
        });
      }
    },
  };
};

export type TopRightToolbarType = ReturnType<typeof TopRightToolbar>;
