import { Page, Locator } from '@playwright/test';
import { Atom } from '../constants/atoms/atoms';

type RightToolbarLocators = {
  hydrogenButton: Locator;
  carbonButton: Locator;
  nitrogenButton: Locator;
  oxygenButton: Locator;
  sulfurButton: Locator;
  phosphorusButton: Locator;
  fluorineButton: Locator;
  chlorineButton: Locator;
  bromineButton: Locator;
  iodineButton: Locator;
  periodicTableButton: Locator;
  anyAtomButton: Locator;
  extendedTableButton: Locator;
};

export const RightToolbar = (page: Page) => {
  const getButton = (dataTestId: string): Locator =>
    page.getByTestId(dataTestId);

  const locators: RightToolbarLocators = {
    hydrogenButton: getButton(Atom.Hydrogen),
    carbonButton: getButton(Atom.Carbon),
    nitrogenButton: getButton(Atom.Nitrogen),
    oxygenButton: getButton(Atom.Oxygen),
    sulfurButton: getButton(Atom.Sulfur),
    phosphorusButton: getButton(Atom.Phosphorus),
    fluorineButton: getButton(Atom.Fluorine),
    chlorineButton: getButton(Atom.Chlorine),
    bromineButton: getButton(Atom.Bromine),
    iodineButton: getButton(Atom.Iodine),
    periodicTableButton: page.getByTestId('period-table'),
    anyAtomButton: page.getByTestId('any-atom'),
    extendedTableButton: page.getByTestId('extended-table'),
  };

  return {
    ...locators,

    async clickAtom(atom: Atom) {
      await getButton(atom).click();
    },

    async periodicTable() {
      await locators.periodicTableButton.click();
    },

    async extendedTable() {
      await locators.extendedTableButton.click();
    },
  };
};

export type RightToolbarType = ReturnType<typeof RightToolbar>;
