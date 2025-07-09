/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import { StructureCheckSetting } from '@tests/pages/constants/structureCheck/Constants';
import { delay, waitForRender, waitForSpinnerFinishedWork } from '@utils/index';

type StructureCheckDialogLocators = {
  closeWindowButton: Locator;
  lastCheckInfo: Locator;
  valenceCheckbox: Locator;
  radicalCheckbox: Locator;
  pseudoatomCheckbox: Locator;
  stereochemistryCheckbox: Locator;
  queryCheckbox: Locator;
  overlappingAtomsCheckbox: Locator;
  overlappingBondsCheckbox: Locator;
  rGroupsCheckbox: Locator;
  chiralityCheckbox: Locator;
  threeDSructureCheckbox: Locator;
  chiralFlag: Locator;
  checkButton: Locator;
  cancelButton: Locator;
  applyButton: Locator;
};

export const StructureCheckDialog = (page: Page) => {
  const locators: StructureCheckDialogLocators = {
    closeWindowButton: page.getByTestId('close-window-button'),
    lastCheckInfo: page.getByTestId('checkInfo-lastCheck'),
    valenceCheckbox: page.getByTestId('checkOptions-input-valence'),
    radicalCheckbox: page.getByTestId('checkOptions-input-radicals'),
    pseudoatomCheckbox: page.getByTestId('checkOptions-input-pseudoatoms'),
    stereochemistryCheckbox: page.getByTestId('checkOptions-input-stereo'),
    queryCheckbox: page.getByTestId('checkOptions-input-query'),
    overlappingAtomsCheckbox: page.getByTestId(
      'checkOptions-input-overlapping_atoms',
    ),
    overlappingBondsCheckbox: page.getByTestId(
      'checkOptions-input-overlapping_bonds',
    ),
    rGroupsCheckbox: page.getByTestId('checkOptions-input-rgroups'),
    chiralityCheckbox: page.getByTestId('checkOptions-input-chiral'),
    threeDSructureCheckbox: page.getByTestId('checkOptions-input-3d'),
    chiralFlag: page.getByTestId('checkOptions-input-chiral_flag'),
    checkButton: page.getByTestId('Check'),
    applyButton: page.getByTestId('Apply'),
    cancelButton: page.getByTestId('Cancel'),
  };

  return {
    ...locators,

    async closeByX() {
      await locators.closeWindowButton.click();
    },

    async cancel() {
      await locators.cancelButton.click();
    },

    async apply() {
      await delay(0.2);
      await waitForRender(page, async () => {
        await locators.applyButton.click();
      });
    },

    async check() {
      await waitForSpinnerFinishedWork(page, async () => {
        await locators.checkButton.click();
      });
    },

    async checkCheckboxes(
      checkboxes: StructureCheckSetting | StructureCheckSetting[],
    ) {
      if (Array.isArray(checkboxes)) {
        for (const checkbox of checkboxes) {
          await page.getByTestId(checkbox).setChecked(true);
        }
      } else {
        await page.getByTestId(checkboxes[0]).setChecked(true);
      }
    },

    async uncheckCheckboxes(
      checkboxes: StructureCheckSetting | StructureCheckSetting[],
    ) {
      if (Array.isArray(checkboxes)) {
        for (const checkbox of checkboxes) {
          await page.getByTestId(checkbox).setChecked(false);
        }
      } else {
        await page.getByTestId(checkboxes[0]).setChecked(false);
      }
    },
  };
};

export type StructureCheckDialogType = ReturnType<typeof StructureCheckDialog>;
