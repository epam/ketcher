/* eslint-disable no-magic-numbers */
import { Locator, Page } from '@playwright/test';
import { NucleotidePresetTab } from './constants/nucleiotidePresetSection/Constants';
import { NucleotideNaturalAnalogue } from '@tests/pages/constants/createMonomerDialog/Constants';
import { selectAtomAndBonds } from '../CreateMonomerDialog';

type AliasesSectionLocators = {
  helmAliasEditbox: Locator;
  helmAliasEditboxClearButton: Locator;
};

type PresetTabLocators = {
  nameEditbox: Locator;
};

type BaseTabLocators = {
  maskAsBaseButton: Locator;
  symbolEditbox: Locator;
  nameEditbox: Locator;
  naturalAnalogueCombobox: Locator;
  aliasesSection: Locator & AliasesSectionLocators;
};

type SugarTabLocators = {
  maskAsSugarButton: Locator;
  symbolEditbox: Locator;
  nameEditbox: Locator;
  aliasesSection: Locator & AliasesSectionLocators;
};
type PhosphateTabLocators = {
  maskAsPhosphateButton: Locator;
  symbolEditbox: Locator;
  nameEditbox: Locator;
  aliasesSection: Locator & AliasesSectionLocators;
};

type NucleotidePresetSectionLocators = {
  presetTab: Locator & PresetTabLocators;
  baseTab: Locator & BaseTabLocators;
  sugarTab: Locator & SugarTabLocators;
  phosphateTab: Locator & PhosphateTabLocators;
};

export const NucleotidePresetSection = (page: Page) => {
  const locators: NucleotidePresetSectionLocators = {
    presetTab: Object.assign(page.getByTestId(NucleotidePresetTab.Preset), {
      nameEditbox: page.getByTestId('code-input'),
    }),

    baseTab: Object.assign(page.getByTestId(NucleotidePresetTab.Base), {
      maskAsBaseButton: page.getByTestId('Mark-as-base-button'),
      symbolEditbox: page.getByTestId('symbol-input'),
      nameEditbox: page.getByTestId('name-input'),
      naturalAnalogueCombobox: page.getByTestId('natural-analogue-picker'),
      aliasesSection: Object.assign(page.getByTestId('aliases-accordion'), {
        helmAliasEditbox: page.getByTestId('helm-alias-input'),
        helmAliasEditboxClearButton: page
          .getByTestId('helm-alias-input')
          .getByTestId('CloseIcon'),
      }),
    }),

    sugarTab: Object.assign(page.getByTestId(NucleotidePresetTab.Sugar), {
      maskAsSugarButton: page.getByTestId('Mark-as-sugar-button'),
      symbolEditbox: page.getByTestId('symbol-input'),
      nameEditbox: page.getByTestId('name-input'),
      aliasesSection: Object.assign(page.getByTestId('aliases-accordion'), {
        helmAliasEditbox: page.getByTestId('helm-alias-input'),
        helmAliasEditboxClearButton: page
          .getByTestId('helm-alias-input')
          .getByTestId('CloseIcon'),
      }),
    }),

    phosphateTab: Object.assign(
      page.getByTestId(NucleotidePresetTab.Phosphate),
      {
        maskAsPhosphateButton: page.getByTestId('Mark-as-phosphate-button'),
        symbolEditbox: page.getByTestId('symbol-input'),
        nameEditbox: page.getByTestId('name-input'),
        aliasesSection: Object.assign(page.getByTestId('aliases-accordion'), {
          helmAliasEditbox: page.getByTestId('helm-alias-input'),
          helmAliasEditboxClearButton: page
            .getByTestId('helm-alias-input')
            .getByTestId('CloseIcon'),
        }),
      },
    ),
  };

  return {
    ...locators,

    async isTabOpened(tab: NucleotidePresetTab) {
      const tabButton = page.getByTestId(tab);
      const ariaSelected = await tabButton.getAttribute('aria-selected');
      return ariaSelected === 'true';
    },

    async openTab(tab: NucleotidePresetTab) {
      if (!(await this.isTabOpened(tab))) {
        await page.getByTestId(tab).click();
      }
    },

    async openAliasesSection(tab: NucleotidePresetTab) {
      switch (tab) {
        case NucleotidePresetTab.Preset:
          throw new Error('Preset tab does not have Aliases section');
        case NucleotidePresetTab.Base:
          if (
            (await locators.baseTab.aliasesSection.getAttribute(
              'aria-expanded',
            )) === 'false'
          ) {
            await locators.baseTab.aliasesSection.click();
          }
          break;
        case NucleotidePresetTab.Sugar:
          if (
            (await locators.sugarTab.aliasesSection.getAttribute(
              'aria-expanded',
            )) === 'false'
          ) {
            await locators.sugarTab.aliasesSection.click();
          }
          break;
        case NucleotidePresetTab.Phosphate:
          if (
            (await locators.phosphateTab.aliasesSection.getAttribute(
              'aria-expanded',
            )) === 'false'
          ) {
            await locators.phosphateTab.aliasesSection.click();
          }
          break;
      }
    },

    async setName(value: string) {
      await this.openTab(NucleotidePresetTab.Preset);
      await locators.presetTab.nameEditbox.fill(value);
    },

    async markAsBase() {
      await this.openTab(NucleotidePresetTab.Base);
      await locators.baseTab.maskAsBaseButton.click();
    },

    async markAsSugar() {
      await this.openTab(NucleotidePresetTab.Sugar);
      await locators.sugarTab.maskAsSugarButton.click();
    },

    async markAsPhosphate() {
      await this.openTab(NucleotidePresetTab.Phosphate);
      await locators.phosphateTab.maskAsPhosphateButton.click();
    },

    async setupBase(options: {
      atomIds: number[];
      bondIds: number[];
      symbol?: string;
      name?: string;
      naturalAnalogue?: NucleotideNaturalAnalogue;
      HELMAlias?: string;
    }) {
      await this.openTab(NucleotidePresetTab.Base);
      await selectAtomAndBonds(page, {
        atomIds: options.atomIds,
        bondIds: options.bondIds,
      });
      await this.markAsBase();

      if (options.symbol) {
        await locators.baseTab.symbolEditbox.fill(options.symbol);
      }
      if (options.name) {
        await locators.baseTab.nameEditbox.fill(options.name);
      }
      if (options.naturalAnalogue) {
        await locators.baseTab.naturalAnalogueCombobox.click();
        await page.getByTestId(options.naturalAnalogue).click();
      }
      if (options.HELMAlias) {
        await this.openAliasesSection(NucleotidePresetTab.Base);
        await locators.baseTab.aliasesSection.helmAliasEditbox.click();
        await page.keyboard.type(options.HELMAlias);
      }
    },

    async setupSugar(options: {
      atomIds: number[];
      bondIds: number[];
      symbol?: string;
      name?: string;
      HELMAlias?: string;
    }) {
      await this.openTab(NucleotidePresetTab.Sugar);
      await selectAtomAndBonds(page, {
        atomIds: options.atomIds,
        bondIds: options.bondIds,
      });
      await this.markAsSugar();

      if (options.symbol) {
        await locators.sugarTab.symbolEditbox.fill(options.symbol);
      }
      if (options.name) {
        await locators.sugarTab.nameEditbox.fill(options.name);
      }
      if (options.HELMAlias) {
        await this.openAliasesSection(NucleotidePresetTab.Sugar);
        await locators.sugarTab.aliasesSection.helmAliasEditbox.click();
        await page.keyboard.type(options.HELMAlias);
      }
    },

    async setupPhosphate(options: {
      atomIds: number[];
      bondIds: number[];
      symbol?: string;
      name?: string;
      HELMAlias?: string;
    }) {
      await this.openTab(NucleotidePresetTab.Phosphate);
      await selectAtomAndBonds(page, {
        atomIds: options.atomIds,
        bondIds: options.bondIds,
      });
      await this.markAsPhosphate();

      if (options.symbol) {
        await locators.phosphateTab.symbolEditbox.fill(options.symbol);
      }
      if (options.name) {
        await locators.phosphateTab.nameEditbox.fill(options.name);
      }
      if (options.HELMAlias) {
        await this.openAliasesSection(NucleotidePresetTab.Phosphate);
        await locators.phosphateTab.aliasesSection.helmAliasEditbox.click();
        await page.keyboard.type(options.HELMAlias);
      }
    },
  };
};
