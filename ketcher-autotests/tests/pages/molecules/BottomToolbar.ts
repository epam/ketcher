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

    async Benzene() {
      await locators.benzeneButton.click();
    },

    async Cyclopentadiene() {
      await locators.cyclopentadieneButton.click();
    },

    async Cyclohexane() {
      await locators.cyclohexaneButton.click();
    },

    async Cyclopentane() {
      await locators.cyclopentaneButton.click();
    },

    async Cyclopropane() {
      await locators.cyclopropaneButton.click();
    },

    async Cyclobutane() {
      await locators.cyclobutaneButton.click();
    },

    async Cycloheptane() {
      await locators.cycloheptaneButton.click();
    },

    async Cyclooctane() {
      await locators.cyclooctaneButton.click();
    },

    async StructureLibrary() {
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

export async function openStructureLibrary(page: Page) {
  await BottomToolbar(page).StructureLibrary();
}

export async function selectRingButton(page: Page, name: RingButton) {
  await BottomToolbar(page).clickRing(name);
}

export async function drawBenzeneRing(page: Page) {
  await BottomToolbar(page).clickRing(RingButton.Benzene);
  await clickInTheMiddleOfTheScreen(page);
  await page.keyboard.press('Escape');
}

export async function drawCyclohexaneRing(page: Page) {
  await BottomToolbar(page).clickRing(RingButton.Cyclohexane);
  await clickInTheMiddleOfTheScreen(page);
}

export async function drawCyclopentadieneRing(page: Page) {
  await BottomToolbar(page).clickRing(RingButton.Cyclopentadiene);
  await clickInTheMiddleOfTheScreen(page);
}

export type BottomToolbarType = ReturnType<typeof BottomToolbar>;
