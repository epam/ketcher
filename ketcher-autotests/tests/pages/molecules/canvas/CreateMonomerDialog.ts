/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import {
  AminoAcidNaturalAnalogue,
  ModificationType,
  MonomerType,
  NucleotideNaturalAnalogue,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import {
  waitForCustomEvent,
  waitForRender,
} from '@utils/common/loaders/waitForRender';
import { LeftToolbar } from '../LeftToolbar';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { clickOnCanvas } from '@utils/clicks';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { getBondLocator } from '@utils/macromolecules/polymerBond';
import {
  AttachmentPointAtom,
  AttachmentPointOption,
} from './createMonomer/constants/editConnectionPointPopup/Constants';
import { WarningMessageDialog } from './createMonomer/WarningDialog';
import { delay } from '@utils/canvas';

export enum ModificationTypeDropdown {
  First = 'modificationTypeDropdown1',
  Second = 'modificationTypeDropdown2',
  Third = 'modificationTypeDropdown3',
  Fourth = 'modificationTypeDropdown4',
  Fifth = 'modificationTypeDropdown5',
}

export enum DeleteModificationTypeButton {
  First = 'deleteModificationTypeButton1',
  Second = 'deleteModificationTypeButton2',
  Third = 'deleteModificationTypeButton3',
  Fourth = 'deleteModificationTypeButton4',
  Fifth = 'deleteModificationTypeButton5',
}

type ModificationSectionLocators = {
  modificationTypeDropdown1: Locator;
  modificationTypeDropdown2: Locator;
  modificationTypeDropdown3: Locator;
  modificationTypeDropdown4: Locator;
  modificationTypeDropdown5: Locator;
  deleteModificationTypeButton1: Locator;
  deleteModificationTypeButton2: Locator;
  deleteModificationTypeButton3: Locator;
  deleteModificationTypeButton4: Locator;
  deleteModificationTypeButton5: Locator;
  addModificationTypeButton: Locator;
};

type AliasesSectionLocators = {
  helmAliasEditbox: Locator;
  helmAliasEditboxClearButton: Locator;
};

type CreateMonomerDialogLocators = {
  typeCombobox: Locator;
  symbolEditbox: Locator;
  nameEditbox: Locator;
  naturalAnalogueCombobox: Locator;
  infoIcon: Locator;
  r1ControlGroup: Locator;
  r2ControlGroup: Locator;
  r3ControlGroup: Locator;
  r4ControlGroup: Locator;
  r5ControlGroup: Locator;
  r6ControlGroup: Locator;
  r7ControlGroup: Locator;
  r8ControlGroup: Locator;
  r1NameCombobox: Locator;
  r2NameCombobox: Locator;
  r3NameCombobox: Locator;
  r4NameCombobox: Locator;
  r5NameCombobox: Locator;
  r6NameCombobox: Locator;
  r7NameCombobox: Locator;
  r8NameCombobox: Locator;
  r1AtomCombobox: Locator;
  r2AtomCombobox: Locator;
  r3AtomCombobox: Locator;
  r4AtomCombobox: Locator;
  r5AtomCombobox: Locator;
  r6AtomCombobox: Locator;
  r7AtomCombobox: Locator;
  r8AtomCombobox: Locator;
  r1DeleteButton: Locator;
  r2DeleteButton: Locator;
  r3DeleteButton: Locator;
  r4DeleteButton: Locator;
  r5DeleteButton: Locator;
  r6DeleteButton: Locator;
  r7DeleteButton: Locator;
  r8DeleteButton: Locator;
  modificationSection: Locator & ModificationSectionLocators;
  aliasesSection: Locator & AliasesSectionLocators;
  terminalIndicatorTooltip: Locator;
  submitButton: Locator;
  discardButton: Locator;
};

const createAttachmentPointControlGroupMap = (
  dialogLocators: CreateMonomerDialogLocators,
): Record<AttachmentPointOption, Locator> => ({
  [AttachmentPointOption.R1]: dialogLocators.r1ControlGroup,
  [AttachmentPointOption.R2]: dialogLocators.r2ControlGroup,
  [AttachmentPointOption.R3]: dialogLocators.r3ControlGroup,
  [AttachmentPointOption.R4]: dialogLocators.r4ControlGroup,
  [AttachmentPointOption.R5]: dialogLocators.r5ControlGroup,
  [AttachmentPointOption.R6]: dialogLocators.r6ControlGroup,
  [AttachmentPointOption.R7]: dialogLocators.r7ControlGroup,
  [AttachmentPointOption.R8]: dialogLocators.r8ControlGroup,
});

const createAttachmentPointNameComboboxMap = (
  dialogLocators: CreateMonomerDialogLocators,
): Record<AttachmentPointOption, Locator> => ({
  [AttachmentPointOption.R1]: dialogLocators.r1NameCombobox,
  [AttachmentPointOption.R2]: dialogLocators.r2NameCombobox,
  [AttachmentPointOption.R3]: dialogLocators.r3NameCombobox,
  [AttachmentPointOption.R4]: dialogLocators.r4NameCombobox,
  [AttachmentPointOption.R5]: dialogLocators.r5NameCombobox,
  [AttachmentPointOption.R6]: dialogLocators.r6NameCombobox,
  [AttachmentPointOption.R7]: dialogLocators.r7NameCombobox,
  [AttachmentPointOption.R8]: dialogLocators.r8NameCombobox,
});

const createAttachmentPointAtomComboboxMap = (
  dialogLocators: CreateMonomerDialogLocators,
): Record<AttachmentPointOption, Locator> => ({
  [AttachmentPointOption.R1]: dialogLocators.r1AtomCombobox,
  [AttachmentPointOption.R2]: dialogLocators.r2AtomCombobox,
  [AttachmentPointOption.R3]: dialogLocators.r3AtomCombobox,
  [AttachmentPointOption.R4]: dialogLocators.r4AtomCombobox,
  [AttachmentPointOption.R5]: dialogLocators.r5AtomCombobox,
  [AttachmentPointOption.R6]: dialogLocators.r6AtomCombobox,
  [AttachmentPointOption.R7]: dialogLocators.r7AtomCombobox,
  [AttachmentPointOption.R8]: dialogLocators.r8AtomCombobox,
});

const createAttachmentPointDeleteButtonMap = (
  dialogLocators: CreateMonomerDialogLocators,
): Record<AttachmentPointOption, Locator> => ({
  [AttachmentPointOption.R1]: dialogLocators.r1DeleteButton,
  [AttachmentPointOption.R2]: dialogLocators.r2DeleteButton,
  [AttachmentPointOption.R3]: dialogLocators.r3DeleteButton,
  [AttachmentPointOption.R4]: dialogLocators.r4DeleteButton,
  [AttachmentPointOption.R5]: dialogLocators.r5DeleteButton,
  [AttachmentPointOption.R6]: dialogLocators.r6DeleteButton,
  [AttachmentPointOption.R7]: dialogLocators.r7DeleteButton,
  [AttachmentPointOption.R8]: dialogLocators.r8DeleteButton,
});

const createModificationTypeDropdownMap = (
  section: ModificationSectionLocators,
): Record<ModificationTypeDropdown, Locator> => ({
  [ModificationTypeDropdown.First]: section.modificationTypeDropdown1,
  [ModificationTypeDropdown.Second]: section.modificationTypeDropdown2,
  [ModificationTypeDropdown.Third]: section.modificationTypeDropdown3,
  [ModificationTypeDropdown.Fourth]: section.modificationTypeDropdown4,
  [ModificationTypeDropdown.Fifth]: section.modificationTypeDropdown5,
});
const deleteModificationTypeMap = (
  section: ModificationSectionLocators,
): Record<ModificationTypeDropdown, Locator> => ({
  [ModificationTypeDropdown.First]: section.deleteModificationTypeButton1,
  [ModificationTypeDropdown.Second]: section.deleteModificationTypeButton2,
  [ModificationTypeDropdown.Third]: section.deleteModificationTypeButton3,
  [ModificationTypeDropdown.Fourth]: section.deleteModificationTypeButton4,
  [ModificationTypeDropdown.Fifth]: section.deleteModificationTypeButton5,
});

export const CreateMonomerDialog = (page: Page) => {
  const modificationSection: Locator & ModificationSectionLocators =
    Object.assign(page.getByTestId('modification-types-accordion'), {
      modificationTypeDropdown1: page.getByTestId(
        'modification-type-dropdown-0',
      ),
      modificationTypeDropdown2: page.getByTestId(
        'modification-type-dropdown-1',
      ),
      modificationTypeDropdown3: page.getByTestId(
        'modification-type-dropdown-2',
      ),
      modificationTypeDropdown4: page.getByTestId(
        'modification-type-dropdown-3',
      ),
      modificationTypeDropdown5: page.getByTestId(
        'modification-type-dropdown-4',
      ),
      deleteModificationTypeButton1: page.getByTestId(
        'delete-modification-type-button-0',
      ),
      deleteModificationTypeButton2: page.getByTestId(
        'delete-modification-type-button-1',
      ),
      deleteModificationTypeButton3: page.getByTestId(
        'delete-modification-type-button-2',
      ),
      deleteModificationTypeButton4: page.getByTestId(
        'delete-modification-type-button-3',
      ),
      deleteModificationTypeButton5: page.getByTestId(
        'delete-modification-type-button-4',
      ),
      addModificationTypeButton: page.getByTestId(
        'add-modification-type-button',
      ),
    });
  const aliasesSection: Locator & AliasesSectionLocators = Object.assign(
    page.getByTestId('aliases-accordion'),
    {
      helmAliasEditbox: page.getByTestId('helm-alias-input'),
      helmAliasEditboxClearButton: page
        .getByTestId('helm-alias-input')
        .getByTestId('CloseIcon'),
    },
  );

  const locators: CreateMonomerDialogLocators = {
    typeCombobox: page.getByTestId('type-select'),
    symbolEditbox: page.getByTestId('symbol-input'),
    nameEditbox: page.getByTestId('name-input'),
    naturalAnalogueCombobox: page.getByTestId('natural-analogue-picker'),
    infoIcon: page.getByTestId('attachment-point-info-icon'),
    r1ControlGroup: page.getByTestId('attachment-point-controls-R1'),
    r2ControlGroup: page.getByTestId('attachment-point-controls-R2'),
    r3ControlGroup: page.getByTestId('attachment-point-controls-R3'),
    r4ControlGroup: page.getByTestId('attachment-point-controls-R4'),
    r5ControlGroup: page.getByTestId('attachment-point-controls-R5'),
    r6ControlGroup: page.getByTestId('attachment-point-controls-R6'),
    r7ControlGroup: page.getByTestId('attachment-point-controls-R7'),
    r8ControlGroup: page.getByTestId('attachment-point-controls-R8'),
    r1NameCombobox: page.getByTestId('attachment-point-name-select-R1'),
    r2NameCombobox: page.getByTestId('attachment-point-name-select-R2'),
    r3NameCombobox: page.getByTestId('attachment-point-name-select-R3'),
    r4NameCombobox: page.getByTestId('attachment-point-name-select-R4'),
    r5NameCombobox: page.getByTestId('attachment-point-name-select-R5'),
    r6NameCombobox: page.getByTestId('attachment-point-name-select-R6'),
    r7NameCombobox: page.getByTestId('attachment-point-name-select-R7'),
    r8NameCombobox: page.getByTestId('attachment-point-name-select-R8'),
    r1AtomCombobox: page.getByTestId('attachment-point-atom-select-R1'),
    r2AtomCombobox: page.getByTestId('attachment-point-atom-select-R2'),
    r3AtomCombobox: page.getByTestId('attachment-point-atom-select-R3'),
    r4AtomCombobox: page.getByTestId('attachment-point-atom-select-R4'),
    r5AtomCombobox: page.getByTestId('attachment-point-atom-select-R5'),
    r6AtomCombobox: page.getByTestId('attachment-point-atom-select-R6'),
    r7AtomCombobox: page.getByTestId('attachment-point-atom-select-R7'),
    r8AtomCombobox: page.getByTestId('attachment-point-atom-select-R8'),
    r1DeleteButton: page.getByTestId('attachment-point-delete-button-R1'),
    r2DeleteButton: page.getByTestId('attachment-point-delete-button-R2'),
    r3DeleteButton: page.getByTestId('attachment-point-delete-button-R3'),
    r4DeleteButton: page.getByTestId('attachment-point-delete-button-R4'),
    r5DeleteButton: page.getByTestId('attachment-point-delete-button-R5'),
    r6DeleteButton: page.getByTestId('attachment-point-delete-button-R6'),
    r7DeleteButton: page.getByTestId('attachment-point-delete-button-R7'),
    r8DeleteButton: page.getByTestId('attachment-point-delete-button-R8'),
    modificationSection,
    aliasesSection,
    terminalIndicatorTooltip: page.getByTestId('atom-info-tooltip'),
    submitButton: page.getByTestId('submit-button'),
    discardButton: page.getByTestId('discard-button'),
  };

  const attachmentPointControlGroupByAP =
    createAttachmentPointControlGroupMap(locators);

  const attachmentPointNameComboboxByAP =
    createAttachmentPointNameComboboxMap(locators);

  const attachmentPointAtomComboboxByAP =
    createAttachmentPointAtomComboboxMap(locators);

  const attachmentPointDeleteButtonByAP =
    createAttachmentPointDeleteButtonMap(locators);

  const modificationTypeDropdownByEnum =
    createModificationTypeDropdownMap(modificationSection);

  const deleteModificationTypeButtonEnum =
    deleteModificationTypeMap(modificationSection);

  return {
    ...locators,

    getAttachmentPointControlGroup(ap: AttachmentPointOption) {
      return attachmentPointControlGroupByAP[ap];
    },

    getAttachmentPointNameCombobox(ap: AttachmentPointOption) {
      return attachmentPointNameComboboxByAP[ap];
    },

    getAttachmentPointAtomCombobox(ap: AttachmentPointOption) {
      return attachmentPointAtomComboboxByAP[ap];
    },

    getAttachmentPointDeleteButton(ap: AttachmentPointOption) {
      return attachmentPointDeleteButtonByAP[ap];
    },

    async selectType(option: MonomerType) {
      await locators.typeCombobox.click();
      await page.getByTestId(option).click();
    },

    async setSymbol(value: string) {
      await locators.symbolEditbox.fill(value);
    },

    async setName(value: string) {
      await locators.nameEditbox.fill(value);
    },

    async selectNaturalAnalogue(
      option: AminoAcidNaturalAnalogue | NucleotideNaturalAnalogue,
    ) {
      await locators.naturalAnalogueCombobox.click();
      await page.getByTestId(option).click();
    },

    async changeAttachmentPointName(options: {
      oldName: AttachmentPointOption;
      newName: AttachmentPointOption;
    }) {
      const combobox = attachmentPointNameComboboxByAP[options.oldName];
      await combobox.click();
      await page.getByTestId(options.newName).click();
    },

    async changeAttachmentPointAtom(options: {
      attachmentPointName: AttachmentPointOption;
      newAtom: AttachmentPointAtom;
    }) {
      const combobox =
        attachmentPointAtomComboboxByAP[options.attachmentPointName];
      await combobox.click();
      await page.getByTestId(options.newAtom).first().click();
    },

    async deleteAttachmentPoint(attachmentPointName: AttachmentPointOption) {
      const deleteButton = attachmentPointDeleteButtonByAP[attachmentPointName];
      await waitForRender(page, async () => {
        await deleteButton.click();
      });
    },

    async expandModificationSection() {
      const modificationSectionState = await modificationSection.getAttribute(
        'aria-expanded',
      );
      if (modificationSectionState === 'false') {
        await modificationSection.click();
      }
    },

    async collapseModificationSection() {
      const modificationSectionState = await modificationSection.getAttribute(
        'aria-expanded',
      );
      if (modificationSectionState === 'true') {
        await modificationSection.click();
      }
    },

    async expandAliasesSection() {
      const aliasesSectionState = await aliasesSection.getAttribute(
        'aria-expanded',
      );
      if (aliasesSectionState === 'false') {
        await aliasesSection.click();
      }
      await aliasesSection.helmAliasEditbox.waitFor();
    },

    async collapseAliasesSection() {
      const aliasesSectionState = await aliasesSection.getAttribute(
        'aria-expanded',
      );
      if (aliasesSectionState === 'true') {
        await aliasesSection.click();
      }
    },

    async addModificationType() {
      await this.expandModificationSection();
      await modificationSection.addModificationTypeButton.click();
    },

    async selectModificationType(options: {
      dropdown: ModificationTypeDropdown;
      type: ModificationType;
    }) {
      await this.expandModificationSection();
      const dropdown = modificationTypeDropdownByEnum[options.dropdown];
      while ((await dropdown.isVisible()) === false) {
        await this.addModificationType();
      }
      await dropdown.click();
      const option = page.getByTestId(options.type);
      await option.waitFor();
      await option.click();
    },

    async selectModificationTypes(
      options: (
        | {
            dropdown: ModificationTypeDropdown;
            type: ModificationType;
          }
        | {
            dropdown: ModificationTypeDropdown;
            customModification: string;
          }
      )[],
    ) {
      for (const option of options) {
        if ('type' in option) {
          await this.selectModificationType(option);
        } else {
          await this.setModificationType(option);
        }
      }
    },

    async setModificationType(options: {
      dropdown: ModificationTypeDropdown;
      customModification: string;
    }) {
      await this.expandModificationSection();
      const dropdown = modificationTypeDropdownByEnum[options.dropdown];
      while ((await dropdown.isVisible()) === false) {
        await this.addModificationType();
      }
      await dropdown.click();
      await page.keyboard.type(options.customModification);
      await page.keyboard.press('Escape');
    },

    async deleteModificationType(dropdown: ModificationTypeDropdown) {
      await this.expandModificationSection();
      const deleteButton = deleteModificationTypeButtonEnum[dropdown];
      await deleteButton.click();
    },

    async clearHELMAlias() {
      await this.expandAliasesSection();
      const helmAliasEditbox = aliasesSection.helmAliasEditbox;
      await helmAliasEditbox.click();
      const clearButton = aliasesSection.helmAliasEditboxClearButton;
      await clearButton.click();
    },

    async setHELMAlias(helmAlias: string) {
      await this.expandAliasesSection();
      await this.clearHELMAlias();
      const helmAliasEditbox = aliasesSection.helmAliasEditbox;
      await helmAliasEditbox.click();
      await page.keyboard.type(helmAlias);
      // to avoid helm alias lost on submit due to async validation
      await this.collapseAliasesSection();
      await this.expandAliasesSection();
      await delay(0.3);
    },

    async waitForTerminalIndicatorTooltip(
      options: { state?: 'visible' | 'hidden' } = {},
    ) {
      await locators.terminalIndicatorTooltip.waitFor(options);
    },

    async submit({ ignoreWarning = false } = {}) {
      await waitForRender(page, async () => {
        await locators.submitButton.click();
        if ((await WarningMessageDialog(page).isVisible()) && ignoreWarning) {
          await WarningMessageDialog(page).ok();
        }
      });
    },

    async discard() {
      await locators.discardButton.click();
    },
  };
};

export async function createMonomer(
  page: Page,
  options: {
    type: MonomerType;
    symbol: string;
    name: string;
    naturalAnalogue?: AminoAcidNaturalAnalogue | NucleotideNaturalAnalogue;
    modificationTypes?: (
      | {
          dropdown: ModificationTypeDropdown;
          type: ModificationType;
        }
      | {
          dropdown: ModificationTypeDropdown;
          customModification: string;
        }
    )[];
    HELMAlias?: string;
  },
  ignoreWarning = true,
) {
  const createMonomerDialog = CreateMonomerDialog(page);
  await LeftToolbar(page).createMonomer();
  await createMonomerDialog.selectType(options.type);
  await createMonomerDialog.setSymbol(options.symbol);
  await createMonomerDialog.setName(options.name);
  if (options.naturalAnalogue) {
    await createMonomerDialog.selectNaturalAnalogue(options.naturalAnalogue);
  }
  if (options.modificationTypes) {
    await createMonomerDialog.selectModificationTypes(
      options.modificationTypes,
    );
  }
  if (options.HELMAlias) {
    await createMonomerDialog.setHELMAlias(options.HELMAlias);
  }
  await createMonomerDialog.submit({ ignoreWarning });
}

export async function prepareMoleculeForMonomerCreation(
  page: Page,
  AtomIDsToExclude?: string[],
  BondIDsToExclude?: string[],
) {
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await page.keyboard.down('Shift');
  if (AtomIDsToExclude) {
    for (const atomId of AtomIDsToExclude) {
      await getAtomLocator(page, { atomId: Number(atomId) }).click({
        force: true,
      });
    }
  }
  if (BondIDsToExclude) {
    for (const bondId of BondIDsToExclude) {
      await getBondLocator(page, { bondId: Number(bondId) }).click();
    }
  }
  await page.keyboard.up('Shift');
  await waitForCustomEvent(page, 'monomerCreationEnabled', 200);
}

export type CreateMonomerDialogType = ReturnType<typeof CreateMonomerDialog>;
