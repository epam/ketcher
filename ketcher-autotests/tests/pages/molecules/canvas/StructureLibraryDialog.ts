import { Page, Locator } from '@playwright/test';

type AlphaDSugarsOptionLocators = {
  alphaDAllopyranose: Locator;
  alphaDAltropyranose: Locator;
  alphaDArabinofuranose: Locator;
  alphaDArabinopyranose: Locator;
  alphaDErythrofuranose: Locator;
  alphaDGalactopyranose: Locator;
  alphaDGlucopyranose: Locator;
  alphaDGulopyranose: Locator;
  alphaDIdopyranose: Locator;
  alphaDLyxofuranose: Locator;
  alphaDLyxopyranose: Locator;
  alphaDMannopyranose: Locator;
  alphaDPsicofuranose: Locator;
  alphaDRibofuranose: Locator;
  alphaDRibopyranose: Locator;
  alphaDSorbofuranose: Locator;
  alphaDTagatofuranose: Locator;
  alphaDTalopyranose: Locator;
  alphaDThreofuranose: Locator;
  alphaDXylofuranose: Locator;
  alphaDXylopyranose: Locator;
};

type TemplateLibraryTabLocators = {
  alphaDSugarsSection: Locator & AlphaDSugarsOptionLocators;
  aromaticsSection: Locator;
  betaDSugarsSection: Locator;
  bicyclesSection: Locator;
  bridgedPolycyclicsSection: Locator;
  crownEthersSection: Locator;
  dAminoAcidsSection: Locator;
  dSugarsSection: Locator;
  heterocyclicRingsSection: Locator;
  lAminoAcidsSection: Locator;
  nucleobasesSection: Locator;
  ringsSection: Locator;
  sugarsSection: Locator;
  threeDTemplatesSection: Locator;
};

type StructureLibraryDialogLocators = {
  closeWindowButton: Locator;
  searchInput: Locator;
  saveToSdfButton: Locator;
};

export const StructureLibraryDialog = (page: Page) => {
  const locators: StructureLibraryDialogLocators = {
    closeWindowButton: page.getByTestId('close-window-button'),
    searchInput: page.getByTestId('template-search-input'),
    saveToSdfButton: page.getByTestId('save-to-sdf-button'),
  };
  return {
    ...locators,

    async close() {
      await locators.closeWindowButton.click();
    },
  };
};

export type StructureLibraryDialogType = ReturnType<
  typeof StructureLibraryDialog
>;
