import { Page, Locator } from '@playwright/test';
import { waitForSpinnerFinishedWork } from '@utils/common/loaders';

type IndigoFunctionsToolbarLocators = {
  aromatizeButton: Locator;
};

export const IndigoFunctionsToolbar = (page: Page) => {
  if (!page || typeof page.getByTestId !== 'function') {
    throw new Error('Page parameter is required');
  }
  const locators: IndigoFunctionsToolbarLocators = {
    aromatizeButton: page.getByTestId('Aromatize button'),
  };

  return {
    ...locators,

    async aromatize() {
      await waitForSpinnerFinishedWork(
        page,
        async () => await locators.aromatizeButton.click(),
      );
    },
  };
};

export type IndigoFunctionsToolbarType = ReturnType<
  typeof IndigoFunctionsToolbar
>;
