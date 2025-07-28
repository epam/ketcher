/* eslint-disable no-magic-numbers */
import { Page, Locator, expect } from '@playwright/test';
import {
  MolecularMassUnit,
  NucleotideNaturalAnalogCount,
  OligonucleotidesUnit,
  PeptideNaturalAnalogCount,
  UnipositiveIonsUnit,
} from '../constants/calculateVariablesPanel/Constants';
import { waitForCalculateProperties } from '@utils/common/loaders/waitForCalculateProperties';
import { delay } from '@utils/canvas';

type PeptidesTabLocators = {
  isoelectricPointValue: Locator;
  isoelectricPointInfoButton: Locator;
  extinctionCoefficientValue: Locator;
  extinctionCoefficientInfoButton: Locator;
  hydrophobicityInfoButton: Locator;
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
  molecularFormula: Locator;
  molecularMassValue: Locator;
  molecularMassUnitsCombobox: Locator;
  peptidesTab: Locator & PeptidesTabLocators;
  rnaTab: Locator & RNATabLocators;
  closeButton: Locator;
};

export const CalculateVariablesPanel = (page: Page) => {
  const peptidesTab: Locator & PeptidesTabLocators = Object.assign(
    page.getByTestId('peptides-properties-tab'),
    {
      isoelectricPointValue: page.getByTestId('Isoelectric Point-value'),
      isoelectricPointInfoButton: page.getByTestId('Isoelectric Point-info'),
      extinctionCoefficientValue: page.getByTestId(
        'Extinction Coefficient-value',
      ),
      extinctionCoefficientInfoButton: page.getByTestId(
        'Extinction Coef.(1/Mcm)-info',
      ),
      hydrophobicityInfoButton: page.getByTestId('Hydrophobicity-info'),
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
    molecularFormula: page.getByTestId('Gross-formula'),
    molecularMassValue: page.getByTestId('Molecular-Mass-Value'),
    molecularMassUnitsCombobox: page
      .getByTestId('Molecular Mass Unit')
      .getByRole('combobox'),
    closeButton: page.getByTestId('macromolecule-properties-close'),
  };

  return {
    ...locators,

    async close() {
      await locators.closeButton.click();
      await locators.closeButton.waitFor({ state: 'hidden' });
    },

    async getMolecularFormula() {
      return (await locators.molecularFormula.innerText()).replace(
        /(\r\n|\n|\r)/gm,
        '',
      );
    },

    async getMolecularMassValue() {
      await delay(0.2);
      return await locators.molecularMassValue.innerText();
    },

    async setMolecularMassUnits(value: MolecularMassUnit) {
      await locators.molecularMassUnitsCombobox.click();
      await waitForCalculateProperties(
        page,
        async () => {
          await page.getByTestId(value).click();
        },
        5000,
      );
    },

    async getIsoelectricPointValue() {
      return await locators.peptidesTab.isoelectricPointValue.innerText();
    },

    async getExtinctionCoefficientValue() {
      return await locators.peptidesTab.extinctionCoefficientValue.innerText();
    },

    async getMeltingTemperatureValue() {
      return await locators.rnaTab.meltingTemperatureValue.innerText();
    },

    async getUnipositiveIonsValue() {
      return await locators.rnaTab.unipositiveIonsEditbox.getAttribute('value');
    },

    async setUnipositiveIonsValue(value: string) {
      await locators.rnaTab.unipositiveIonsEditbox.click();
      await waitForCalculateProperties(page, async () => {
        await locators.rnaTab.unipositiveIonsEditbox.fill(value);
      });
    },

    async setUnipositiveIonsUnits(value: UnipositiveIonsUnit) {
      await locators.rnaTab.unipositiveIonsUnitsCombobox.click();
      await waitForCalculateProperties(page, async () => {
        await page.getByTestId(value).click();
      });
      // to avoid render problems on quick changing of few unit selectors in row
      // await delay(0.5);
    },

    async getOligonucleotidesValue() {
      return await locators.rnaTab.oligonucleotidesEditbox.getAttribute(
        'value',
      );
    },

    async setOligonucleotidesValue(value: string) {
      await locators.rnaTab.oligonucleotidesEditbox.click();
      await waitForCalculateProperties(page, async () => {
        await locators.rnaTab.oligonucleotidesEditbox.fill(value);
      });
    },

    async setOligonucleotidesUnits(value: OligonucleotidesUnit) {
      await locators.rnaTab.oligonucleotidesUnitsCombobox.click();
      await waitForCalculateProperties(page, async () => {
        await page.getByTestId(value).click();
      });
      // to avoid render problems on quick changing of few unit selectors in row
      // await delay(0.5);
    },

    async getNaturalAnalogCount(
      countValue: PeptideNaturalAnalogCount | NucleotideNaturalAnalogCount,
    ) {
      const naturalAnalog = page.getByTestId(countValue);
      expect(await naturalAnalog.count()).toBeGreaterThan(0);
      return (await naturalAnalog.innerText()).replace(/(\r\n|\n|\r)/gm, '');
    },

    async getPeptideNaturalAnalogCountList() {
      const enumValues = Object.values(PeptideNaturalAnalogCount);
      const counts: string[] = [];

      for (const value of enumValues) {
        const count = await this.getNaturalAnalogCount(value);
        counts.push(count);
      }

      return counts;
    },

    async getNucleotideNaturalAnalogCountList() {
      const enumValues = Object.values(NucleotideNaturalAnalogCount);
      const counts: string[] = [];

      for (const value of enumValues) {
        const count = await this.getNaturalAnalogCount(value);
        counts.push(count);
      }

      return counts;
    },
  };
};

export type CalculateVariablesPanelLocatorsType = ReturnType<
  typeof CalculateVariablesPanel
>;
