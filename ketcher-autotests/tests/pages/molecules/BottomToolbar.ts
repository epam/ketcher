import { Page, Locator } from '@playwright/test';

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
  const locators: BottomToolbarLocators = {
    benzeneButton: page.getByTestId('template-0'),
    cyclopentadieneButton: page.getByTestId('template-1'),
    cyclohexaneButton: page.getByTestId('template-2'),
    cyclopentaneButton: page.getByTestId('template-3'),
    cyclopropaneButton: page.getByTestId('template-4'),
    cyclobutaneButton: page.getByTestId('template-5'),
    cycloheptaneButton: page.getByTestId('template-6'),
    cyclooctaneButton: page.getByTestId('template-7'),
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
  };
};

export async function openStructureLibrary(page: Page) {
  await BottomToolbar(page).StructureLibrary();
}

export type RingButton =
  | 'Benzene'
  | 'Cyclopentadiene'
  | 'Cyclohexane'
  | 'Cyclopentane'
  | 'Cyclopropane'
  | 'Cyclobutane'
  | 'Cycloheptane'
  | 'Cyclooctane';

export const ringToLocator: Record<RingButton, keyof BottomToolbarLocators> = {
  Benzene: 'benzeneButton',
  Cyclopentadiene: 'cyclopentadieneButton',
  Cyclohexane: 'cyclohexaneButton',
  Cyclopentane: 'cyclopentaneButton',
  Cyclopropane: 'cyclopropaneButton',
  Cyclobutane: 'cyclobutaneButton',
  Cycloheptane: 'cycloheptaneButton',
  Cyclooctane: 'cyclooctaneButton',
};

export async function selectRingButton(page: Page, name: RingButton) {
  const toolbar = BottomToolbar(page);
  await toolbar[ringToLocator[name]].click();
}

export type BottomToolbarType = ReturnType<typeof BottomToolbar>;
