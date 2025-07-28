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
  GeneralPropertiesSettings,
  QuerySpecificPropertiesSettings,
  ReactionFlagsPropertiesSettings,
  CustomQueryPropertiesSettings,
} from '@tests/pages/constants/atomProperties/Constants';
import { PeriodicTableElement } from '@tests/pages/constants/periodicTableDialog/Constants';
import { delay } from '@utils/canvas';
import { waitForRender } from '@utils/common';

type GeneralProperties = {
  generalSection: Locator;
  generalWrapper: Locator;
  atomTypeDropdown: Locator;
  editButton: Locator;
  labelInput: Locator;
  numberReadonlyInput: Locator;
  listReadonlyInput: Locator;
  notListCheckbox: Locator;
  specialInput: Locator;
  aliasInput: Locator;
  chargeInput: Locator;
  isotopeInput: Locator;
  valenceDropdown: Locator;
  radicalDropdown: Locator;
};

type QuerySpecificProperties = {
  querySpecificSection: Locator;
  querySpecificWrapper: Locator;
  ringBondCountDropdown: Locator;
  hCountDropdown: Locator;
  substitutionCountInput: Locator;
  unsaturatedCheckbox: Locator;
  aromaticityDropdown: Locator;
  implicitHCountDropdown: Locator;
  ringMembershipDropdown: Locator;
  ringSizeDropdown: Locator;
  connectivityDropdown: Locator;
  chiralityDropdown: Locator;
};

type ReactionFlags = {
  reactionFlagsSection: Locator;
  reactionFlagsWrapper: Locator;
  inversionDropdown: Locator;
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

  const ifNotNull = async (set: (value: any) => Promise<void>, value: any) => {
    if (value !== undefined) await set(value);
  };

  const locators: AtomPropertiesDialogLocators = {
    generalSection: page.getByTestId('General-wrapper'),
    generalWrapper: page.getByTestId('General-wrapper'),
    atomTypeDropdown: page.getByTestId('atom-input-span'),
    editButton: page.getByTestId('edit-button'),
    labelInput: page.getByTestId('label-input'),
    numberReadonlyInput: page.getByTestId('element-number'),
    listReadonlyInput: page.getByTestId('atomList-input'),
    notListCheckbox: page.getByTestId('notList-input'),
    specialInput: page.getByTestId('pseudo-input'),
    aliasInput: page.getByTestId('alias-input-span'),
    chargeInput: page.getByTestId('charge-input-span'),
    isotopeInput: page.getByTestId('isotope-input-span'),
    valenceDropdown: page.getByTestId('explicitValence-input-span'),
    radicalDropdown: page.getByTestId('radical-input-span'),

    querySpecificSection: page.getByTestId('Query specific-section'),
    querySpecificWrapper: page.getByTestId('Query specific-wrapper'),
    ringBondCountDropdown: page.getByTestId('ringBondCount-input-span'),
    hCountDropdown: page.getByTestId('hCount-input-span'),
    substitutionCountInput: page.getByTestId('substitutionCount-input-span'),
    unsaturatedCheckbox: page.getByTestId('unsaturatedAtom-input'),
    aromaticityDropdown: page.getByTestId('aromaticity-input-span'),
    implicitHCountDropdown: page.getByTestId('implicitHCount-input-span'),
    ringMembershipDropdown: page.getByTestId('ringMembership-input-span'),
    ringSizeDropdown: page.getByTestId('ringSize-input-span'),
    connectivityDropdown: page.getByTestId('connectivity-input-span'),
    chiralityDropdown: page.getByTestId('chirality-input-span'),

    reactionFlagsSection: page.getByTestId('Reaction flags-section'),
    reactionFlagsWrapper: page.getByTestId('Reaction flags-wrapper'),
    inversionDropdown: page.getByTestId('inversion-input-span'),
    exactChangeCheckbox: page.getByTestId('exactChangeFlag-input'),

    customQueryCheckbox: page.getByTestId('custom-query-checkbox'),
    customQueryTextArea: page.getByTestId('atom-custom-query'),

    closeWindowButton: page.getByTestId('close-window-button'),
    applyButton: page.getByTestId('OK'),
    cancelButton: page.getByTestId('Cancel'),
  };

  return {
    ...locators,

    // prettier-ignore
    async setOptions(options: AtomPropertiesSettings) {
      await ifNotNull(p => this.setGeneralProperties(p), options.GeneralProperties);
      await ifNotNull(p => this.setQuerySpecificProperties(p), options.QuerySpecificProperties);
      await ifNotNull(p => this.setReactionFlagsProperties(p), options.ReactionFlags);
      await ifNotNull(p => this.setCustomQueryProperties(p), options.CustomQuery);
      await this.pressApplyButton();
    },

    // prettier-ignore
    async setGeneralProperties(generalProperties: GeneralPropertiesSettings) {
      if (generalProperties.Label) {
        await ifNotNull(p => this.selectAtomType(p), AtomType.Single);
        await ifNotNull(p => this.fillLabel(p), generalProperties.Label);
      } else if (generalProperties.List || generalProperties.NotListCheckbox) {
        await ifNotNull(p => this.selectAtomType(p), AtomType.List);
        await ifNotNull(p => this.selectAtomsList(p), generalProperties.List);
        await ifNotNull(p => this.setNotListCheckbox(p), generalProperties.NotListCheckbox);
      } else if (generalProperties.Special) {
        await ifNotNull(p => this.selectAtomType(p), AtomType.Special);
        await ifNotNull(p => this.fillSpecial(p), generalProperties.Special);
      } else if (generalProperties.AtomType) {
        await ifNotNull(p => this.selectAtomType(p), generalProperties.AtomType);
      }
      await ifNotNull(p => this.fillAlias(p), generalProperties.Alias);
      await ifNotNull(p => this.fillCharge(p), generalProperties.Charge);
      await ifNotNull(p => this.fillIsotope(p), generalProperties.Isotope);
      await ifNotNull(p => this.selectValence(p), generalProperties.Valence);
      await ifNotNull(p => this.selectRadical(p), generalProperties.Radical);
    },

    // prettier-ignore
    async setQuerySpecificProperties(
      querySpecificProperties: QuerySpecificPropertiesSettings,
    ) {
      await this.expandQuerySpecific();
      await ifNotNull(p => this.selectRingBondCount(p), querySpecificProperties.RingBondCount);
      await ifNotNull(p => this.selectHCount(p), querySpecificProperties.HCount);
      await ifNotNull(p => this.selectSubstitutionCount(p), querySpecificProperties.SubstitutionCount);
      await ifNotNull(p => this.setUnsaturatedCheckbox(p), querySpecificProperties.UnsaturatedCheckbox);
      await ifNotNull(p => this.selectAromaticity(p), querySpecificProperties.Aromaticity);
      await ifNotNull(p => this.selectImplicitHCount(p), querySpecificProperties.ImplicitHCount);
      await ifNotNull(p => this.selectRingMembership(p), querySpecificProperties.RingMembership);
      await ifNotNull(p => this.selectRingSize(p), querySpecificProperties.RingSize);
      await ifNotNull(p => this.selectConnectivity(p), querySpecificProperties.Connectivity);
      await ifNotNull(p => this.selectChirality(p), querySpecificProperties.Chirality);
    },

    // prettier-ignore
    async setReactionFlagsProperties(
      reactionFlagsProperties: ReactionFlagsPropertiesSettings,
    ) {
      await this.expandReactionFlags();
      await ifNotNull(p => this.selectInversion(p), reactionFlagsProperties.Inversion);
      await ifNotNull(p => this.setExactChangeCheckbox(p), reactionFlagsProperties.ExactChangeCheckbox);
    },

    // prettier-ignore
    async setCustomQueryProperties(
      customQueryProperties: CustomQueryPropertiesSettings,
    ) {
      await ifNotNull(p => this.setCustomQueryCheckbox(p), customQueryProperties.CustomQueryCheckbox);
      await ifNotNull(p => this.fillCustomQueryText(p), customQueryProperties.CustomQueryTextArea);
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

    async selectAtomType(option: AtomType) {
      await selectDropdownValue(locators.atomTypeDropdown, option);
    },

    async openTable() {
      await locators.editButton.click();
    },

    async fillLabel(value: string) {
      await locators.labelInput.fill(value);
    },

    async getNumber() {
      await locators.numberReadonlyInput.textContent();
    },

    async selectAtomsList(value: {
      AtomsList: PeriodicTableElement[];
      SelectAtoms: (atomsList: PeriodicTableElement[]) => Promise<void>;
    }) {
      await this.openTable();
      await value.SelectAtoms(value.AtomsList);
    },

    async getList() {
      await locators.listReadonlyInput.textContent();
    },

    async setNotListCheckbox(checked: boolean) {
      await locators.notListCheckbox.setChecked(checked);
    },

    async fillSpecial(value: string) {
      await locators.specialInput.fill(value);
    },

    async fillAlias(value: string) {
      await locators.aliasInput.fill(value);
    },

    async fillCharge(value: string) {
      await locators.chargeInput.fill(value);
    },

    async hoverCharge() {
      await locators.chargeInput.hover();
    },

    async fillIsotope(value: string) {
      await locators.isotopeInput.fill(value);
    },

    async hoverIsotope() {
      await locators.isotopeInput.hover();
    },

    async selectValence(option: Valence) {
      await selectDropdownValue(locators.valenceDropdown, option);
    },

    async selectRadical(option: Radical) {
      await selectDropdownValue(locators.radicalDropdown, option);
    },

    async selectRingBondCount(option: RingBondCount) {
      await selectDropdownValue(locators.ringBondCountDropdown, option);
    },

    async selectHCount(option: HCount) {
      await selectDropdownValue(locators.hCountDropdown, option);
    },

    async selectSubstitutionCount(value: SubstitutionCount) {
      await selectDropdownValue(locators.substitutionCountInput, value);
    },

    async setUnsaturatedCheckbox(checked: boolean) {
      await locators.unsaturatedCheckbox.setChecked(checked);
    },

    async selectAromaticity(option: Aromaticity) {
      await selectDropdownValue(locators.aromaticityDropdown, option);
    },

    async selectImplicitHCount(option: ImplicitHCount) {
      await selectDropdownValue(locators.implicitHCountDropdown, option);
    },

    async selectRingMembership(option: RingMembership) {
      await selectDropdownValue(locators.ringMembershipDropdown, option);
    },

    async selectRingSize(option: RingSize) {
      await selectDropdownValue(locators.ringSizeDropdown, option);
    },

    async selectConnectivity(option: Connectivity) {
      await selectDropdownValue(locators.connectivityDropdown, option);
    },

    async selectChirality(option: Chirality) {
      await selectDropdownValue(locators.chiralityDropdown, option);
    },

    async selectInversion(option: Inversion) {
      await selectDropdownValue(locators.inversionDropdown, option);
    },

    async setExactChangeCheckbox(checked: boolean) {
      await locators.exactChangeCheckbox.setChecked(checked);
    },

    async setCustomQueryCheckbox(checked: boolean) {
      await locators.customQueryCheckbox.setChecked(checked);
    },

    async fillCustomQueryText(customQuery: string) {
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
