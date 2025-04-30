import { Page, Locator } from '@playwright/test';
import { Atom } from '../constants/atoms/atoms';

export const rightToolbar = (page: Page) => {
  const getButton = (dataTestId: string): Locator =>
    page.getByTestId(dataTestId);

  return {
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

    clickAtom: async (atom: Atom) => {
      await getButton(atom).click();
    },
  };
};
