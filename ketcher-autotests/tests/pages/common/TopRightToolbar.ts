import { Page, Locator, expect } from '@playwright/test';
import { selectFlexLayoutModeTool } from '@utils/canvas/tools';
import { goToPeptidesTab } from '@utils/macromolecules/library';
import { waitForRender } from '@utils/common/loaders/waitForRender';

type CommonTopRightToolbarLocators = {
  ketcherModeSwitcherCombobox: Locator;
  fullScreenButton: Locator;
  zoomSelector: Locator;
};

type ZoomDropdownLocators = {
  zoomValueEditbox: Locator;
  zoomOutButton: Locator;
  zoomInButton: Locator;
  zoomDefaultButton: Locator;
};

export const CommonTopRightToolbar = (page: Page) => {
  const locators: CommonTopRightToolbarLocators = {
    ketcherModeSwitcherCombobox: page.getByTestId('polymer-toggler:visible'),
    fullScreenButton: page.getByTestId('fullscreen-mode-button'),
    zoomSelector: page.getByTestId('zoom-selector'),
  };

  const zoomLocators: ZoomDropdownLocators = {
    zoomValueEditbox: page.getByTestId('zoom-value'),
    zoomOutButton: page.getByTestId('zoom-out'),
    zoomInButton: page.getByTestId('zoom-in'),
    zoomDefaultButton: page.getByTestId('zoom-default'),
  };

  return {
    ...locators,
    ...zoomLocators,

    async setZoomInputValue(value: string) {
      await locators.zoomSelector.click();
      await zoomLocators.zoomValueEditbox.fill(value);
      await waitForRender(page, async () => {
        await page.keyboard.press('Enter');
      });
    },

    async selectZoomOutTool(count = 1) {
      await locators.zoomSelector.click();
      for (let i = 0; i < count; i++) {
        await waitForRender(page, async () => {
          await zoomLocators.zoomOutButton.click();
        });
      }
      await locators.zoomSelector.click({ force: true });
      await zoomLocators.zoomOutButton.waitFor({ state: 'detached' });
    },

    async selectZoomInTool(count = 1) {
      await locators.zoomSelector.click();
      for (let i = 0; i < count; i++) {
        await waitForRender(page, async () => {
          await zoomLocators.zoomInButton.click();
        });
      }
      await locators.zoomSelector.click({ force: true });
      await zoomLocators.zoomInButton.waitFor({ state: 'detached' });
    },

    async resetZoom() {
      await locators.zoomSelector.click();
      await waitForRender(page, async () => {
        await zoomLocators.zoomDefaultButton.click();
      });
      await locators.zoomSelector.click({ force: true });
      await zoomLocators.zoomDefaultButton.waitFor({ state: 'detached' });
    },
    async turnOnMacromoleculesEditor(
      options: {
        enableFlexMode?: boolean;
        goToPeptides?: boolean;
      } = { enableFlexMode: true, goToPeptides: true },
    ) {
      const switcher = locators.ketcherModeSwitcherCombobox;
      expect(switcher).toBeVisible();
      await switcher.click();
      const macroOption = page.getByTestId('macromolecules_mode');
      expect(macroOption).toBeVisible();
      await macroOption.click();

      expect(page.getByTestId('layout-mode')).toBeVisible();

      if (options.enableFlexMode) {
        await selectFlexLayoutModeTool(page);
      } else if (options.goToPeptides) {
        await goToPeptidesTab(page);
      } else {
        await page
          .getByTestId('summary-Nucleotides')
          .waitFor({ state: 'visible' });
      }

      await page.evaluate(() => {
        // Temporary solution to disable autozoom for the polymer editor in e2e tests
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window._ketcher_isAutozoomDisabled = true;
      });
    },

    async turnOnMicromoleculesEditor() {
      const switcher = locators.ketcherModeSwitcherCombobox;
      expect(switcher).toBeVisible();
      await switcher.click();
      const microOption = page.getByTestId('molecules_mode');
      expect(microOption).toBeVisible();
      await microOption.click();
    },
  };
};

export type CommonTopRightToolbarType = ReturnType<
  typeof CommonTopRightToolbar
>;
