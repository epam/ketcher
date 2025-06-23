import { Page, Locator } from '@playwright/test';

type PeptidesTabLocators = {
  isoelectricPointValue: Locator;
  extinctionCoefficientValue: Locator;
  hydrophobicityGraph: Locator;
};

type RNATabLocators = {
  meltingTemperatureValue: Locator;
  unipositiveIonsEditbox: Locator;
  unipositiveIonsUnitsCombobox: Locator;
  oligonucleotidesEditbox: Locator;
  oligonucleotidesUnitsCombobox: Locator;
};

type CalculateVariablesPanelLocators = {
  peptidesTab: Locator & PeptidesTabLocators;
  rnaTab: Locator & RNATabLocators;
  molecularMassValue: Locator;
  molecularMassUnitsCombobox: Locator;
  closeButton: Locator;
};

export const CalculateVariablesPanel = (page: Page) => {
  const peptidesTab: Locator & PeptidesTabLocators = Object.assign(
    page.getByTestId('peptides-properties-tab'),
    {
      isoelectricPointValue: page.getByTestId('Isoelectric Point-value'),
      extinctionCoefficientValue: page.getByTestId(
        'Extinction Coefficient-value',
      ),
      hydrophobicityGraph: page.getByTestId('Hydrophobicity-Chart'),
    },
  );

  const rnaTab: Locator & RNATabLocators = Object.assign(
    page.getByTestId('rna-properties-tab'),
    {
      meltingTemperatureValue: page.getByTestId('Melting-Temperature-value'),
      unipositiveIonsEditbox: page.getByTestId('Unipositive Ions-input'),
      unipositiveIonsUnitsCombobox: page.getByTestId(
        'Unipositive Ions-selector',
      ),
      oligonucleotidesEditbox: page.getByTestId('Oligonucleotides-input'),
      oligonucleotidesUnitsCombobox: page.getByTestId(
        'Oligonucleotides-selector',
      ),
    },
  );

  const locators: CalculateVariablesPanelLocators = {
    peptidesTab,
    rnaTab,
    molecularMassValue: page.getByTestId('Molecular-Mass-Value'),
    molecularMassUnitsCombobox: page.getByTestId('Molecular Mass Unit'),
    closeButton: page.getByTestId('macromolecule-properties-close'),
  };

  return {
    ...locators,

    async close() {
      await locators.closeButton.click();
    },
  };
};

export type CalculateVariablesPanelLocatorsType = ReturnType<
  typeof CalculateVariablesPanel
>;
