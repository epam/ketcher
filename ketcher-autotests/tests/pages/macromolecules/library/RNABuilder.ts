import { Page, Locator, expect } from '@playwright/test';
import { moveMouseAway } from '@utils/moveMouseAway';

type RNABuilderLocators = {
  rnaBuilderSection: Locator;
  nameYourStructureEditbox: Locator;
  sugarSlot: Locator;
  baseSlot: Locator;
  phosphateSlot: Locator;
  cancelButton: Locator;
  saveButton: Locator;
  addToPresetsButton: Locator;
  duplicateAndEditButton: Locator;
  editButton: Locator;
};

export const RNABuilder = (page: Page) => {
  const locators: RNABuilderLocators = {
    rnaBuilderSection: page.getByTestId('rna-builder-expand-button'),
    nameYourStructureEditbox: page.getByTestId('name-your-structure-editbox'),
    sugarSlot: page.getByTestId('rna-builder-slot--sugar'),
    baseSlot: page.getByTestId('rna-builder-slot--base'),
    phosphateSlot: page.getByTestId('rna-builder-slot--phosphate'),
    cancelButton: page.getByTestId('cancel-btn'),
    saveButton: page.getByTestId('save-btn'),
    addToPresetsButton: page.getByTestId('add-to-presets-btn'),
    duplicateAndEditButton: page.getByTestId('duplicate-btn'),
    editButton: page.getByTestId('edit-btn'),
  };

  return {
    ...locators,

    async expand() {
      const isExpanded = await page
        .getByTestId('rna-editor-expanded')
        .isVisible();
      if (!isExpanded) {
        await locators.rnaBuilderSection.click();
      }
    },

    async collapse() {
      const isExpanded = await page
        .getByTestId('rna-editor-expanded')
        .isVisible();
      if (isExpanded) {
        await locators.rnaBuilderSection.click();
      }
    },

    async selectSugarSlot() {
      await moveMouseAway(page);
      await expect(locators.sugarSlot).toBeInViewport();
      await locators.sugarSlot.click();
    },

    async selectBaseSlot() {
      await moveMouseAway(page);
      await expect(locators.baseSlot).toBeInViewport();
      await locators.baseSlot.click();
    },

    async selectPhosphateSlot() {
      await moveMouseAway(page);
      await expect(locators.phosphateSlot).toBeInViewport();
      await locators.phosphateSlot.click();
    },

    async addToPresets() {
      await moveMouseAway(page);
      await expect(locators.addToPresetsButton).toBeInViewport();
      await locators.addToPresetsButton.click();
    },

    async save() {
      await moveMouseAway(page);
      await locators.saveButton.click();
    },

    async cancel() {
      await moveMouseAway(page);
      await locators.cancelButton.click();
    },

    async duplicateAndEdit() {
      await moveMouseAway(page);
      await locators.duplicateAndEditButton.click();
    },

    async edit() {
      await moveMouseAway(page);
      await locators.editButton.click();
    },
  };
};

export type RNABuilderType = ReturnType<typeof RNABuilder>;
