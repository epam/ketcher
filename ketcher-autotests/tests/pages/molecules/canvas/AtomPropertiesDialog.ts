/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import {
  AtomPropertiesSettings,
  Inversion,
  Aromaticity,
  AtomType,
  Chirality,
  Connectivity,
  HCount,
  ImplicitHCount,
  Radical,
  RingBondCount,
  RingMembership,
  RingSize,
  SubstitutionCount,
  Valence,
} from '@tests/pages/constants/atomProperties/Constants';
import { delay } from '@utils/canvas';
import { waitForRender } from '@utils/common';

type GeneralProperties = {
  generalSection: Locator;
  generalWrapper: Locator;
  atomTypeSelect: Locator;
  labelInput: Locator;
  numberInput: Locator;
  aliasInput: Locator;
  chargeInput: Locator;
  isotopeInput: Locator;
  valenceSelect: Locator;
  radicalSelect: Locator;
};

type QuerySpecificProperties = {
  querySpecificSection: Locator;
  querySpecificWrapper: Locator;
  ringBondCountSelect: Locator;
  hCountSelect: Locator;
  substitutionCountInput: Locator;
  unsaturatedCheckbox: Locator;
  aromaticitySelect: Locator;
  implicitHCountSelect: Locator;
  ringMembershipSelect: Locator;
  ringSizeSelect: Locator;
  connectivitySelect: Locator;
  chiralitySelect: Locator;
};

type ReactionFlags = {
  reactionFlagsSection: Locator;
  reactionFlagsWrapper: Locator;
  inversionSelect: Locator;
  exactChangeCheckbox: Locator;
};

type CustomQuery = {
  customQueryCheckbox: Locator;
  customQueryTextArea: Locator;
};

type AtomPropertiesDialogLocators = GeneralProperties &
  QuerySpecificProperties &
  ReactionFlags &
  CustomQuery & {
    closeWindowButton: Locator;
    applyButton: Locator;
    cancelButton: Locator;
  };

export const AtomPropertiesDialog = (page: Page) => {
  const selectDropdownValue = async (
    locator: Locator,
    valueLocatorString: string,
  ) => {
    await locator.click();
    await page.getByTestId(valueLocatorString).click();
  };

  const locators: AtomPropertiesDialogLocators = {
    generalSection: page.getByTestId('General-wrapper'),
    generalWrapper: page.getByTestId('General-wrapper'),
    atomTypeSelect: page.getByTestId('atom-input-span'),
    labelInput: page.getByTestId('label-input'),
    numberInput: page.getByTestId(''),
    aliasInput: page.getByTestId('alias-input-span'),
    chargeInput: page.getByTestId('charge-input-span'),
    isotopeInput: page.getByTestId('isotope-input-span'),
    valenceSelect: page.getByTestId('explicitValence-input-span'),
    radicalSelect: page.getByTestId('radical-input-span'),

    querySpecificSection: page.getByTestId('Query specific-section'),
    querySpecificWrapper: page.getByTestId('Query specific-wrapper'),
    ringBondCountSelect: page.getByTestId('ringBondCount-input-span'),
    hCountSelect: page.getByTestId('hCount-input-span'),
    substitutionCountInput: page.getByTestId('substitutionCount-input-span'),
    unsaturatedCheckbox: page.getByTestId('unsaturatedAtom-input'),
    aromaticitySelect: page.getByTestId('aromaticity-input-span'),
    implicitHCountSelect: page.getByTestId('implicitHCount-input-span'),
    ringMembershipSelect: page.getByTestId('ringMembership-input-span'),
    ringSizeSelect: page.getByTestId('ringSize-input-span'),
    connectivitySelect: page.getByTestId('connectivity-input-span'),
    chiralitySelect: page.getByTestId('chirality-input-span'),

    reactionFlagsSection: page.getByTestId('Reaction flags-section'),
    reactionFlagsWrapper: page.getByTestId('Reaction flags-wrapper'),
    inversionSelect: page.getByTestId('inversion-input-span'),
    exactChangeCheckbox: page.getByTestId('exactChangeFlag-input'),

    customQueryCheckbox: page.getByTestId('custom-query-checkbox'),
    customQueryTextArea: page.getByTestId('atom-custom-query'),

    closeWindowButton: page.getByTestId('close-window-button'),
    applyButton: page.getByTestId('OK'),
    cancelButton: page.getByTestId('Cancel'),
  };

  return {
    ...locators,

    async setOptions(options: AtomPropertiesSettings) {
      const setOptionalProperty = async (
        value: any,
        set: (value: any) => Promise<void>,
      ) => {
        if (value) await set(value);
      };

      if (options.GeneralProperties) {
        const generalProperties = options.GeneralProperties;
        await setOptionalProperty(generalProperties.AtomType, this.setAtomType);
        await setOptionalProperty(generalProperties.Label, this.setLabel);
        await setOptionalProperty(generalProperties.Alias, this.setAlias);
        await setOptionalProperty(generalProperties.Charge, this.setCharge);
        await setOptionalProperty(generalProperties.Isotope, this.setIsotope);
        await setOptionalProperty(generalProperties.Valence, this.setValence);
        await setOptionalProperty(generalProperties.Radical, this.setRadical);
      }
      if (options.QuerySpecificProperties) {
        await this.expandQuerySpecific();

        const querySpecificProperties = options.QuerySpecificProperties;
        await setOptionalProperty(
          querySpecificProperties.RingBondCount,
          this.setRingBondCount,
        );
        await setOptionalProperty(
          querySpecificProperties.HCount,
          this.setHCount,
        );
        await setOptionalProperty(
          querySpecificProperties.SubstitutionCount,
          this.setSubstitutionCount,
        );
        await setOptionalProperty(
          querySpecificProperties.UnsaturatedCheckbox,
          this.setUnsaturated,
        );
        await setOptionalProperty(
          querySpecificProperties.Aromaticity,
          this.setAromaticity,
        );
        await setOptionalProperty(
          querySpecificProperties.ImplicitHCount,
          this.setImplicitHCount,
        );
        await setOptionalProperty(
          querySpecificProperties.RingMembership,
          this.setRingMembership,
        );
        await setOptionalProperty(
          querySpecificProperties.RingSize,
          this.setRingSize,
        );
        await setOptionalProperty(
          querySpecificProperties.Connectivity,
          this.setConnectivity,
        );
        await setOptionalProperty(
          querySpecificProperties.Chirality,
          this.setChirality,
        );
      }
      if (options.ReactionFlags) {
        await this.expandReactionFlags();

        const reactionFlagsProperties = options.ReactionFlags;
        await setOptionalProperty(
          reactionFlagsProperties.Inversion,
          this.setInversion,
        );
        await setOptionalProperty(
          reactionFlagsProperties.ExactChangeCheckbox,
          this.setExactChange,
        );
      }
      if (options.CustomQuery) {
        const customQueryProperties = options.CustomQuery;
        await setOptionalProperty(
          customQueryProperties.CustomQueryCheckbox,
          this.setCustomQueryCheckbox,
        );
        await setOptionalProperty(
          customQueryProperties.CustomQueryTextArea,
          this.setCustomQueryText,
        );
      }
      await this.pressApplyButton();
    },

    async closeByX() {
      await locators.closeWindowButton.click();
    },

    async pressApplyButton() {
      await delay(0.2);
      await waitForRender(page, async () => {
        await locators.applyButton.click();
      });
    },

    async pressCancelButton() {
      await locators.cancelButton.click();
    },

    async setAtomType(option: AtomType) {
      await selectDropdownValue(locators.atomTypeSelect, option);
    },

    async setLabel(value: string) {
      await locators.labelInput.fill(value);
    },

    async setNumber(value: string) {
      await locators.numberInput.fill(value);
    },

    async setAlias(value: string) {
      await locators.aliasInput.fill(value);
    },

    async setCharge(value: string) {
      await locators.chargeInput.fill(value);
    },

    async hoverCharge() {
      await locators.chargeInput.hover();
    },

    async setIsotope(value: string) {
      await locators.isotopeInput.fill(value);
    },

    async hoverIsotope() {
      await locators.isotopeInput.hover();
    },

    async setValence(option: Valence) {
      await selectDropdownValue(locators.valenceSelect, option);
    },

    async setRadical(option: Radical) {
      await selectDropdownValue(locators.radicalSelect, option);
    },

    async setRingBondCount(option: RingBondCount) {
      await selectDropdownValue(locators.ringBondCountSelect, option);
    },

    async setHCount(option: HCount) {
      await selectDropdownValue(locators.hCountSelect, option);
    },

    async setSubstitutionCount(value: SubstitutionCount) {
      await selectDropdownValue(locators.substitutionCountInput, value);
    },

    async setUnsaturated(checked: boolean) {
      await locators.unsaturatedCheckbox.setChecked(checked);
    },

    async setAromaticity(option: Aromaticity) {
      await selectDropdownValue(locators.aromaticitySelect, option);
    },

    async setImplicitHCount(option: ImplicitHCount) {
      await selectDropdownValue(locators.implicitHCountSelect, option);
    },

    async setRingMembership(option: RingMembership) {
      await selectDropdownValue(locators.ringMembershipSelect, option);
    },

    async setRingSize(option: RingSize) {
      await selectDropdownValue(locators.ringSizeSelect, option);
    },

    async setConnectivity(option: Connectivity) {
      await selectDropdownValue(locators.connectivitySelect, option);
    },

    async setChirality(option: Chirality) {
      await selectDropdownValue(locators.chiralitySelect, option);
    },

    async setInversion(option: Inversion) {
      await selectDropdownValue(locators.inversionSelect, option);
    },

    async setExactChange(checked: boolean) {
      await locators.exactChangeCheckbox.setChecked(checked);
    },

    async setCustomQueryCheckbox(checked: boolean) {
      await locators.customQueryCheckbox.setChecked(checked);
    },

    async setCustomQueryText(customQuery: string) {
      await locators.customQueryTextArea.fill(customQuery);
    },

    async expandQuerySpecific() {
      const querySpecificSectionClasses =
        await locators.querySpecificWrapper.getAttribute('class');
      const isQuerySpecificCollapsed =
        querySpecificSectionClasses?.includes('hidden');
      if (isQuerySpecificCollapsed) {
        await locators.querySpecificSection.click();
      }
    },

    async expandReactionFlags() {
      const reactionFlagsSectionClasses =
        await locators.reactionFlagsWrapper.getAttribute('class');
      const isreactionFlagsCollapsed =
        reactionFlagsSectionClasses?.includes('hidden');
      if (isreactionFlagsCollapsed) {
        await locators.reactionFlagsSection.click();
      }
    },
  };
};

export type AtomPropertiesDialogType = ReturnType<typeof AtomPropertiesDialog>;
