/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import {
  AminoAcidNaturalAnalogue,
  MonomerType,
  NucleotideNaturalAnalogue,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import { waitForRender } from '@utils/common/loaders/waitForRender';
import { LeftToolbar } from '../LeftToolbar';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { clickOnCanvas } from '@utils/clicks';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

type CreateMonomerDialogLocators = {
  typeCombobox: Locator;
  symbolEditbox: Locator;
  nameEditbox: Locator;
  naturalAnalogueCombobox: Locator;
  submitButton: Locator;
  discardButton: Locator;
};

export const CreateMonomerDialog = (page: Page) => {
  const locators: CreateMonomerDialogLocators = {
    typeCombobox: page.getByTestId('type-select'),
    symbolEditbox: page.getByTestId('symbol-input'),
    nameEditbox: page.getByTestId('name-input'),
    naturalAnalogueCombobox: page.getByTestId('natural-analogue-picker'),
    submitButton: page.getByTestId('submit-button'),
    discardButton: page.getByTestId('discard-button'),
  };

  return {
    ...locators,

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
}

export type CreateMonomerDialogType = ReturnType<typeof CreateMonomerDialog>;
