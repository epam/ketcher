import { Page, Locator } from '@playwright/test';
import { Monomer } from '@utils/types';

type PresetsSectionLocators = {
  newPresetsButton: Locator;
};

type RNABuilderLocators = {
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

type RNATabLocators = {
  rnaBuilderSection: Locator & RNABuilderLocators;
  presetsSection: Locator & PresetsSectionLocators;
  sugarsSection: Locator;
  basesSection: Locator;
  phosphatesSection: Locator;
  nucleotidesSection: Locator;
};

type LibraryLocators = {
  searchEditbox: Locator;
  hideLibraryButton: Locator;
  showLibraryButton: Locator;
  favoritesTab: Locator;
  peptidesTab: Locator;
  rnaTab: Locator & RNATabLocators;
  chemTab: Locator;
};

export const Library = (page: Page) => {
  const getElement = (dataTestId: string): Locator =>
    page.getByTestId(dataTestId);

  const rnaBuilderSection: RNABuilderLocators = {
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

  const presetsSection: PresetsSectionLocators = {
    newPresetsButton: page.getByTestId('new-preset-button'),
  };

  const rnaTab: RNATabLocators = {
    rnaBuilderSection: page.getByTestId(
      'rna-builder-expand-button',
    ) as Locator & typeof rnaBuilderSection,
    presetsSection: page.getByTestId('summary-Presets') as Locator &
      typeof presetsSection,
    sugarsSection: page.getByTestId('summary-Sugars'),
    basesSection: page.getByTestId('summary-Bases'),
    phosphatesSection: page.getByTestId('summary-Phosphates'),
    nucleotidesSection: page.getByTestId('summary-Nucleotides'),
  };

  const locators: LibraryLocators = {
    searchEditbox: page.getByTestId('monomer-library-input'),
    hideLibraryButton: page.getByTestId('hide-monomer-library'),
    showLibraryButton: page.getByTestId('show-monomer-library'),
    favoritesTab: page.getByTestId('FAVORITES-TAB'),
    peptidesTab: page.getByTestId('PEPTIDES-TAB'),
    rnaTab: page.getByTestId('PEPTIDES-TAB') as Locator & typeof rnaTab,
    chemTab: page.getByTestId('CHEM-TAB'),
  };

  return {
    ...locators,

    async hideLibrary() {
      if (await locators.hideLibraryButton.isVisible()) {
        await locators.hideLibraryButton.click();
      }
    },

    async showLibrary() {
      if (await locators.showLibraryButton.isVisible()) {
        await locators.showLibraryButton.click();
      }
    },

    async switchToFavoridesTab() {
      await locators.favoritesTab.click();
    },

    async switchToPeptidesTab() {
      await locators.peptidesTab.click();
    },

    async switchToRNATab() {
      await locators.rnaTab.click();
    },

    async switchToCHEMTab() {
      await locators.chemTab.click();
    },

    async clickOnMonomer(monomer: Monomer) {
      await getElement(monomer.testId).click();
    },

    async setSearchValue(value = '') {
      await locators.searchEditbox.fill(value);
    },

    async getSearchValue(): Promise<string | null> {
      return await locators.searchEditbox.inputValue();
    },
  };
};

// export async function openPPTXFile(
//   page: Page,
//   filePath: string,
//   numberOf: {
//     Structure: number;
//   } = { Structure: 1 },
//   action: Action,
// ) {
//   await CommonTopLeftToolbar(page).openFile();
//   await waitForSpinnerFinishedWork(page, async () => {
//     await openFile(filePath, page);
//   });
//   const openPPTXFileDialog = OpenPPTXFileDialog(page);
//   if (numberOf.Structure !== 1) {
//     await openPPTXFileDialog.selectStructure(numberOf);
//   }
//   if (action === Action.AddToCanvas) {
//     await openPPTXFileDialog.pressAddToCanvasButton();
//   } else if (action === Action.OpenAsNewProject) {
//     await openPPTXFileDialog.pressOpenAsNewProjectButton();
//   }
// }

export type LibraryLocatorsType = ReturnType<typeof Library>;
