/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
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
  const selectDropdownValue = async (locator: Locator, value: string) => {
    await locator.click();
    await page.getByTestId(`${value}-option`).click();
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

    async setAtomType(option: string) {
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

    async setValence(option: string) {
      await selectDropdownValue(locators.valenceSelect, option);
    },

    async setRadical(option: string) {
      await selectDropdownValue(locators.radicalSelect, option);
    },

    async setRingBondCount(option: string) {
      await selectDropdownValue(locators.ringBondCountSelect, option);
    },

    async setHCount(option: string) {
      await selectDropdownValue(locators.hCountSelect, option);
    },

    async setSubstitutionCount(value: string) {
      await selectDropdownValue(locators.substitutionCountInput, value);
    },

    async checkUnsaturated() {
      await locators.unsaturatedCheckbox.check();
    },

    async uncheckUnsaturated() {
      await locators.unsaturatedCheckbox.uncheck();
    },

    async setAromaticity(option: string) {
      await selectDropdownValue(locators.aromaticitySelect, option);
    },

    async setImplicitHCount(option: string) {
      await selectDropdownValue(locators.implicitHCountSelect, option);
    },

    async setRingMembership(option: string) {
      await selectDropdownValue(locators.ringMembershipSelect, option);
    },

    async setRingSize(option: string) {
      await selectDropdownValue(locators.ringSizeSelect, option);
    },

    async setConnectivity(option: string) {
      await selectDropdownValue(locators.connectivitySelect, option);
    },

    async setChirality(option: string) {
      await selectDropdownValue(locators.chiralitySelect, option);
    },

    async setInversion(option: string) {
      await selectDropdownValue(locators.inversionSelect, option);
    },

    async checkExactChange() {
      await locators.exactChangeCheckbox.check();
    },

    async uncheckExactChange() {
      await locators.exactChangeCheckbox.uncheck();
    },

    async checkCustomQuery() {
      await locators.customQueryCheckbox.check();
    },

    async fillCustomQuery(customQuery: string) {
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

export async function selectAtomLabel(page: Page, label: string) {
  const atomProperties = AtomPropertiesDialog(page);
  await atomProperties.setLabel(label);
  await atomProperties.pressApplyButton();
}

export async function fillAliasForAtom(page: Page, alias: string) {
  const atomProperties = AtomPropertiesDialog(page);
  await atomProperties.setAlias(alias);
  await atomProperties.pressApplyButton();
}

export async function fillChargeForAtom(page: Page, charge: string) {
  const atomProperties = AtomPropertiesDialog(page);
  await atomProperties.setCharge(charge);
  await atomProperties.pressApplyButton();
}

export async function fillIsotopeForAtom(page: Page, isotope: string) {
  const atomProperties = AtomPropertiesDialog(page);
  await atomProperties.setIsotope(isotope);
  await atomProperties.pressApplyButton();
}

export async function selectValenceForAtom(page: Page, valence: string) {
  const atomProperties = AtomPropertiesDialog(page);
  await atomProperties.setValence(valence);
  await atomProperties.pressApplyButton();
}

export async function selectRadical(page: Page, radical: string) {
  const atomProperties = AtomPropertiesDialog(page);
  await atomProperties.setRadical(radical);
  await atomProperties.pressApplyButton();
}

export async function selectRingBondCount(page: Page, ringbondcount: string) {
  const atomProperties = AtomPropertiesDialog(page);
  await atomProperties.expandQuerySpecific();
  await atomProperties.setRingBondCount(ringbondcount);
  await atomProperties.pressApplyButton();
}

export async function selectHCount(page: Page, hcount: string) {
  const atomProperties = AtomPropertiesDialog(page);
  await atomProperties.expandQuerySpecific();
  await atomProperties.setHCount(hcount);
  await atomProperties.pressApplyButton();
}

export async function selectSubstitutionCount(
  page: Page,
  substitutioncount: string,
) {
  const atomProperties = AtomPropertiesDialog(page);
  await atomProperties.expandQuerySpecific();
  await atomProperties.setSubstitutionCount(substitutioncount);
  await atomProperties.pressApplyButton();
}

export async function selectAromaticity(page: Page, aromaticity: string) {
  const atomProperties = AtomPropertiesDialog(page);
  await atomProperties.expandQuerySpecific();
  await atomProperties.setAromaticity(aromaticity);
  await atomProperties.pressApplyButton();
}

export async function selectImplicitHCount(page: Page, implicitHCount: string) {
  const atomProperties = AtomPropertiesDialog(page);
  await atomProperties.expandQuerySpecific();
  await atomProperties.setImplicitHCount(implicitHCount);
  await atomProperties.pressApplyButton();
}

export async function selectRingMembership(page: Page, ringMembership: string) {
  const atomProperties = AtomPropertiesDialog(page);
  await atomProperties.expandQuerySpecific();
  await atomProperties.setRingMembership(ringMembership);
  await atomProperties.pressApplyButton();
}

export async function selectRingSize(page: Page, ringSize: string) {
  const atomProperties = AtomPropertiesDialog(page);
  await atomProperties.expandQuerySpecific();
  await atomProperties.setRingSize(ringSize);
  await atomProperties.pressApplyButton();
}

export async function selectConnectivity(page: Page, connectivity: string) {
  const atomProperties = AtomPropertiesDialog(page);
  await atomProperties.expandQuerySpecific();
  await atomProperties.setConnectivity(connectivity);
  await atomProperties.pressApplyButton();
}

export async function selectChirality(page: Page, chirality: string) {
  const atomProperties = AtomPropertiesDialog(page);
  await atomProperties.expandQuerySpecific();
  await atomProperties.setChirality(chirality);
  await atomProperties.pressApplyButton();
}

export async function selectUnsaturated(page: Page) {
  const atomProperties = AtomPropertiesDialog(page);
  await atomProperties.expandQuerySpecific();
  await atomProperties.checkUnsaturated();
  await atomProperties.pressApplyButton();
}

export async function deselectUnsaturated(page: Page) {
  const atomProperties = AtomPropertiesDialog(page);
  await atomProperties.expandQuerySpecific();
  await atomProperties.uncheckUnsaturated();
  await atomProperties.pressApplyButton();
}

export async function selectReactionFlagsInversion(
  page: Page,
  inversion: string,
) {
  const atomProperties = AtomPropertiesDialog(page);
  await atomProperties.expandReactionFlags();
  await atomProperties.setInversion(inversion);
  await atomProperties.pressApplyButton();
}

export async function selectExactChange(page: Page) {
  const atomProperties = AtomPropertiesDialog(page);
  await atomProperties.expandReactionFlags();
  await atomProperties.checkExactChange();
  await atomProperties.pressApplyButton();
}

export async function setCustomQueryForAtom(page: Page, customQuery: string) {
  const atomProperties = AtomPropertiesDialog(page);
  await atomProperties.checkCustomQuery();
  await atomProperties.fillCustomQuery(customQuery);
  await atomProperties.pressApplyButton();
}
