/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';

type CalculatedValuesDialogLocators = {
  window: Locator;
  closeWindowButton: Locator;
  chemicalFormulaInput: Locator;
  molecularWeightInput: Locator;
  molecularWeightSelect: Locator;
  exactMassInput: Locator;
  exactMassSelect: Locator;
  elementalAnalysisInput: Locator;
  closeButton: Locator;
};

export const CalculatedValuesDialog = (page: Page) => {
  const selectDropdownValue = async (locator: Locator, value: string) => {
    await locator.click();
    await page.getByTestId(`${value}-option`).click();
  };

  const locators: CalculatedValuesDialogLocators = {
    window: page.getByTestId('analyse-dialog'),
    closeWindowButton: page.getByTestId('close-window-button'),
    chemicalFormulaInput: page.getByTestId('Chemical Formula-wrapper'),
    molecularWeightInput: page.getByTestId('Molecular Weight-input'),
    molecularWeightSelect: page.getByTestId('Molecular Weight-select'),
    exactMassInput: page.getByTestId('Exact Mass-input'),
    exactMassSelect: page.getByTestId('Exact Mass-select'),
    elementalAnalysisInput: page.getByTestId('Elemental Analysis-input'),
    closeButton: page.getByTestId('OK'),
  };

  return {
    ...locators,

    async closeWindow() {
      await locators.closeWindowButton.click();
    },

    async selectMolecularWeightDecimalPlaces(decimalPlacesValue: number) {
      await selectDropdownValue(
        locators.molecularWeightSelect,
        decimalPlacesValue.toString(),
      );
    },

    async selectExactMassDecimalPlaces(decimalPlacesValue: number) {
      await selectDropdownValue(
        locators.exactMassSelect,
        decimalPlacesValue.toString(),
      );
    },

    async close() {
      await locators.closeButton.click();
    },
  };
};

export type CalculatedValuesDialogType = ReturnType<
  typeof CalculatedValuesDialog
>;
