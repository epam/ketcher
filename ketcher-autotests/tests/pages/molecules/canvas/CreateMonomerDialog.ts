/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import {
  AminoAcidNaturalAnalogue,
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
  AttachmentPointName,
} from './createMonomer/constants/editConnectionPointPopup/Constants';

type CreateMonomerDialogLocators = {
  typeCombobox: Locator;
  symbolEditbox: Locator;
  nameEditbox: Locator;
  naturalAnalogueCombobox: Locator;
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
  submitButton: Locator;
  discardButton: Locator;
};

const createAttachmentPointNameComboboxMap = (
  dialogLocators: CreateMonomerDialogLocators,
): Record<AttachmentPointName, Locator> => ({
  [AttachmentPointName.R1]: dialogLocators.r1NameCombobox,
  [AttachmentPointName.R2]: dialogLocators.r2NameCombobox,
  [AttachmentPointName.R3]: dialogLocators.r3NameCombobox,
  [AttachmentPointName.R4]: dialogLocators.r4NameCombobox,
  [AttachmentPointName.R5]: dialogLocators.r5NameCombobox,
  [AttachmentPointName.R6]: dialogLocators.r6NameCombobox,
  [AttachmentPointName.R7]: dialogLocators.r7NameCombobox,
  [AttachmentPointName.R8]: dialogLocators.r8NameCombobox,
});

const createAttachmentPointAtomComboboxMap = (
  dialogLocators: CreateMonomerDialogLocators,
): Record<AttachmentPointName, Locator> => ({
  [AttachmentPointName.R1]: dialogLocators.r1AtomCombobox,
  [AttachmentPointName.R2]: dialogLocators.r2AtomCombobox,
  [AttachmentPointName.R3]: dialogLocators.r3AtomCombobox,
  [AttachmentPointName.R4]: dialogLocators.r4AtomCombobox,
  [AttachmentPointName.R5]: dialogLocators.r5AtomCombobox,
  [AttachmentPointName.R6]: dialogLocators.r6AtomCombobox,
  [AttachmentPointName.R7]: dialogLocators.r7AtomCombobox,
  [AttachmentPointName.R8]: dialogLocators.r8AtomCombobox,
});

export const CreateMonomerDialog = (page: Page) => {
  const locators: CreateMonomerDialogLocators = {
    typeCombobox: page.getByTestId('type-select'),
    symbolEditbox: page.getByTestId('symbol-input'),
    nameEditbox: page.getByTestId('name-input'),
    naturalAnalogueCombobox: page.getByTestId('natural-analogue-picker'),
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
    submitButton: page.getByTestId('submit-button'),
    discardButton: page.getByTestId('discard-button'),
  };

  const attachmentPointNameComboboxByPoint =
    createAttachmentPointNameComboboxMap(locators);

  const attachmentPointAtomComboboxByPoint =
    createAttachmentPointAtomComboboxMap(locators);

  return {
    ...locators,

    getAttachmentPointNameCombobox(point: AttachmentPointName) {
      return attachmentPointNameComboboxByPoint[point];
    },

    getAttachmentPointAtomCombobox(point: AttachmentPointName) {
      return attachmentPointAtomComboboxByPoint[point];
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
      oldName: AttachmentPointName;
      newName: AttachmentPointName;
    }) {
      const combobox = attachmentPointNameComboboxByPoint[options.oldName];
      await combobox.click();
      await page.getByTestId(options.newName).click();
    },

    async changeAttachmentPointAtom(options: {
      attachmentPointName: AttachmentPointName;
      newAtom: AttachmentPointAtom;
    }) {
      const combobox =
        attachmentPointAtomComboboxByPoint[options.attachmentPointName];
      await combobox.click();
      await page.getByTestId(options.newAtom).click();
    },

    async submit() {
      await waitForRender(page, async () => {
        await locators.submitButton.click();
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
  },
) {
  const createMonomerDialog = CreateMonomerDialog(page);
  await LeftToolbar(page).createMonomer();
  await createMonomerDialog.selectType(options.type);
  await createMonomerDialog.setSymbol(options.symbol);
  await createMonomerDialog.setName(options.name);
  if (options.naturalAnalogue) {
    await createMonomerDialog.selectNaturalAnalogue(options.naturalAnalogue);
  }
  await createMonomerDialog.submit();
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
