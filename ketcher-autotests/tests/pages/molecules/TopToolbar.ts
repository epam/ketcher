/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import { delay } from '@utils/canvas';
import { waitForSpinnerFinishedWork } from '@utils/common/loaders';

type TopToolbarLocators = {
  copyButton: Locator;
  pasteButton: Locator;
  cutButton: Locator;
};

export const TopToolbar = (page: Page) => {
  const locators: TopToolbarLocators = {
    copyButton: page.getByTestId('copy-button'),
    pasteButton: page.getByTestId('paste-button'),
    cutButton: page.getByTestId('cut-button'),
  };

  return {
    ...locators,

    async copy() {
      await waitForSpinnerFinishedWork(
        page,
        async () => await locators.copyButton.click(),
      );
    },

    async copyAsMOL() {
      await this.expandCopyDropdown();
      await waitForSpinnerFinishedWork(
        page,
        async () => await page.getByTestId('copy-mol-button').click(),
      );
    },

    async copyAsKET() {
      await this.expandCopyDropdown();
      await waitForSpinnerFinishedWork(
        page,
        async () => await page.getByTestId('copy-ket-button').click(),
      );
    },

    async copyAsImage() {
      await this.expandCopyDropdown();
      await waitForSpinnerFinishedWork(
        page,
        async () => await page.getByTestId('copy-image-button').click(),
      );
    },

    async paste() {
      await waitForSpinnerFinishedWork(
        page,
        async () => await locators.pasteButton.click(),
      );
    },

    async cut() {
      await waitForSpinnerFinishedWork(
        page,
        async () => await locators.cutButton.click(),
      );
    },

    async expandCopyDropdown() {
      const copyToolbar = page.getByTestId('selection-toolbar');

      try {
        await delay(0.1);
        await locators.copyButton
          .locator('..')
          .getByTestId('copy-button-dropdown-triangle')
          .click();
        await copyToolbar.waitFor({ state: 'visible', timeout: 5000 });
      } catch (error) {
        console.warn(
          "Copy dropdown section didn't appeared after click in 5 seconds",
        );
      }
    },
  };
};

export type IndigoFunctionsToolbarType = ReturnType<typeof TopToolbar>;
