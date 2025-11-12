import { Page, Locator } from '@playwright/test';
import { clickInTheMiddleOfTheScreen } from '@utils/clicks';
import { RingButton } from '../constants/ringButton/Constants';

type BottomToolbarLocators = {
  benzeneButton: Locator;
  cyclopentadieneButton: Locator;
  cyclohexaneButton: Locator;
  cyclopentaneButton: Locator;
  cyclopropaneButton: Locator;
  cyclobutaneButton: Locator;
  cycloheptaneButton: Locator;
  cyclooctaneButton: Locator;
  structureLibraryButton: Locator;
};

export const BottomToolbar = (page: Page) => {
  const getButton = (dataTestId: string): Locator =>
    page.getByTestId(dataTestId);

  const locators: BottomToolbarLocators = {
    benzeneButton: page.getByTestId(RingButton.Benzene),
    cyclopentadieneButton: page.getByTestId(RingButton.Cyclopentadiene),
    cyclohexaneButton: page.getByTestId(RingButton.Cyclohexane),
    cyclopentaneButton: page.getByTestId(RingButton.Cyclopentane),
    cyclopropaneButton: page.getByTestId(RingButton.Cyclopropane),
    cyclobutaneButton: page.getByTestId(RingButton.Cyclobutane),
    cycloheptaneButton: page.getByTestId(RingButton.Cycloheptane),
    cyclooctaneButton: page.getByTestId(RingButton.Cyclooctane),
    structureLibraryButton: page.getByTestId('template-lib'),
  };

  return {
    ...locators,

    async benzene() {
      await locators.benzeneButton.click();
    },

    async cyclopentadiene() {
      await locators.cyclopentadieneButton.click();
    },

    async cyclohexane() {
      await locators.cyclohexaneButton.click();
    },

    async cyclopentane() {
      await locators.cyclopentaneButton.click();
    },

    async cyclopropane() {
      await locators.cyclopropaneButton.click();
    },

    async cyclobutane() {
      await locators.cyclobutaneButton.click();
    },

    async cycloheptane() {
      await locators.cycloheptaneButton.click();
    },

    async cyclooctane() {
      await locators.cyclooctaneButton.click();
    },

    async structureLibrary() {
      await locators.structureLibraryButton.click();
    },

    async clickRing(RingButton: RingButton) {
      await getButton(RingButton).click();
    },

    getButtonLocator(RingButton: RingButton): Locator {
      return getButton(RingButton);
    },
  };
};

export async function drawBenzeneRing(page: Page) {
  await BottomToolbar(page).clickRing(RingButton.Benzene);
  await clickInTheMiddleOfTheScreen(page);
  await page.keyboard.press('Escape');
}

export type BottomToolbarType = ReturnType<typeof BottomToolbar>;
