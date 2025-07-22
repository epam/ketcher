import { Page, Locator } from '@playwright/test';
import { waitForRender } from '@utils/common/loaders/waitForRender';
import { Library } from '../macromolecules/Library';
import { Mode } from '../constants/commonTopRightToolbar/Constants';
import { MacromoleculesTopToolbar } from '../macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '../constants/macromoleculesTopToolbar/Constants';

type CommonTopRightToolbarLocators = {
  ketcherModeSwitcherCombobox: Locator;
  fullScreenButton: Locator;
  helpButton: Locator;
  aboutButton: Locator;
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
    ketcherModeSwitcherCombobox: page
      .getByTestId('polymer-toggler')
      .filter({ has: page.locator(':visible') }),
    fullScreenButton: page
      .getByTestId('fullscreen-mode-button')
      .filter({ has: page.locator(':visible') }),
    helpButton: page.getByTestId('help-button'),
    aboutButton: page.getByTestId('about-button'),
    zoomSelector: page
      .getByTestId('zoom-selector')
      .filter({ has: page.locator(':visible') }),
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

    async help() {
      await locators.helpButton.click();
    },

    async about() {
      await locators.aboutButton.click();
    },

    async setZoomInputValue(value: string) {
      await locators.zoomSelector.click();
      await zoomLocators.zoomValueEditbox.fill(value);
      await waitForRender(page, async () => {
        await page.keyboard.press('Enter');
      });
      await locators.zoomSelector.click({ force: true, delay: 100 });
      await zoomLocators.zoomOutButton.waitFor({ state: 'detached' });
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
        disableChainLengthRuler?: boolean;
        disableAutozoom?: boolean;
      } = {
        enableFlexMode: true,
        goToPeptides: true,
        disableChainLengthRuler: true,
        disableAutozoom: true,
      },
    ) {
      if (options.disableChainLengthRuler !== false) {
        await page.evaluate(() => {
          // Temporary solution to disable chain length  ruler for the macro editor in e2e tests
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          window._ketcher_isChainLengthRulerDisabled = true;
        });
      }

      const switcher = locators.ketcherModeSwitcherCombobox;
      await switcher.waitFor({ state: 'visible' });
      await switcher.click();
      const macroOption = page.getByTestId(Mode.Macromolecules);
      await macroOption.waitFor({ state: 'visible' });
      await macroOption.click();
      await MacromoleculesTopToolbar(
        page,
      ).switchLayoutModeDropdownButton.waitFor({ state: 'visible' });

      if (options.enableFlexMode) {
        await MacromoleculesTopToolbar(page).selectLayoutModeTool(
          LayoutMode.Flex,
        );
      } else if (options.goToPeptides) {
        await Library(page).switchToPeptidesTab();
      } else {
        await Library(page).rnaTab.nucleotidesSection.waitFor({
          state: 'visible',
        });
      }

      if (options.disableAutozoom !== false) {
        await page.evaluate(() => {
          // Temporary solution to disable autozoom for the macro editor in e2e tests
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          window._ketcher_isAutozoomDisabled = true;
        });
      }
    },

    async turnOnMicromoleculesEditor() {
      const switcher = locators.ketcherModeSwitcherCombobox;
      await switcher.waitFor({ state: 'visible' });
      await switcher.click();

      const microOption = page.getByTestId(Mode.Molecules);
      await microOption.waitFor({ state: 'visible' });
      await microOption.click();
    },
  };
};

export type CommonTopRightToolbarType = ReturnType<
  typeof CommonTopRightToolbar
>;
