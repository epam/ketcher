import { Page, Locator } from '@playwright/test';
import {
  FunctionalGroupsTabItems,
  LibraryTemplate,
  SaltsAndSolventsTabItems,
  TabSection,
  TemplateLibraryTab,
} from '@tests/pages/constants/structureLibraryDialog/Constants';

type TemplateLibraryTabLocators = {
  alphaDSugarsSection: Locator;
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
  window: Locator;
  closeWindowButton: Locator;
  searchEditBox: Locator;
  templateLibraryTab: Locator & TemplateLibraryTabLocators;
  functionalGroupTab: Locator;
  saltsAndSalventsTab: Locator;
  saveToSdfButton: Locator;
  deleteTemplateButton: Locator;
};

export const StructureLibraryDialog = (page: Page) => {
  const getElement = (dataTestId: string): Locator =>
    page.getByTestId(dataTestId);

  const templateLibraryTab: Locator & TemplateLibraryTabLocators =
    Object.assign(page.getByTestId(TabSection.TemplateLibrary), {
      alphaDSugarsSection: page.getByTestId(TemplateLibraryTab.AlphaDSugars),
      aromaticsSection: page.getByTestId(TemplateLibraryTab.Aromatics),
      betaDSugarsSection: page.getByTestId(TemplateLibraryTab.BetaDSugars),
      bicyclesSection: page.getByTestId(TemplateLibraryTab.Bicycles),
      bridgedPolycyclicsSection: page.getByTestId(
        TemplateLibraryTab.BridgedPolycyclics,
      ),
      crownEthersSection: page.getByTestId(TemplateLibraryTab.CrownEthers),
      dAminoAcidsSection: page.getByTestId(TemplateLibraryTab.DAminoAcids),
      dSugarsSection: page.getByTestId(TemplateLibraryTab.DSugars),
      heterocyclicRingsSection: page.getByTestId(
        TemplateLibraryTab.HeterocyclicRings,
      ),
      lAminoAcidsSection: page.getByTestId(TemplateLibraryTab.LAminoAcids),
      nucleobasesSection: page.getByTestId(TemplateLibraryTab.Nucleobases),
      ringsSection: page.getByTestId(TemplateLibraryTab.Rings),
      sugarsSection: page.getByTestId(TemplateLibraryTab.Sugars),
      threeDTemplatesSection: page.getByTestId(
        TemplateLibraryTab.ThreeDTemplates,
      ),
    });

  const locators: StructureLibraryDialogLocators = {
    window: page.getByTestId('attach-dialog'),
    closeWindowButton: page.getByTestId('close-window-button'),
    searchEditBox: page.getByTestId('template-search-input'),
    templateLibraryTab,
    functionalGroupTab: page.getByTestId(TabSection.FunctionalGroups),
    saltsAndSalventsTab: page.getByTestId(TabSection.SaltsAndSolvents),
    saveToSdfButton: page.getByTestId('save-to-sdf-button'),
    deleteTemplateButton: page.getByTestId('delete-template-button'),
  };

  const pageObject = {
    ...locators,

    async closeWindow() {
      await locators.closeWindowButton.click();
    },

    async switchToTab(tabLocator: Locator, tabSection: TabSection) {
      if ((await tabLocator.getAttribute('aria-selected')) !== 'true') {
        await pageObject.openTab(tabSection);
      }
    },

    async isTabOpened(tabSection: TabSection): Promise<boolean> {
      const ariaSelected =
        await getElement(tabSection).getAttribute('aria-selected');
      return ariaSelected === 'true';
    },

    async isSectionOpened(sectionName: TemplateLibraryTab): Promise<boolean> {
      const ariaExpanded =
        await getElement(sectionName).getAttribute('aria-expanded');
      return ariaExpanded === 'true';
    },

    async openSection(sectionName: TemplateLibraryTab) {
      if (!(await pageObject.isTabOpened(TabSection.TemplateLibrary))) {
        await pageObject.switchToTemplateLibraryTab();
      }
      if (!(await pageObject.isSectionOpened(sectionName))) {
        await getElement(sectionName).click();
      }
    },

    async openTab(tabSection: TabSection) {
      if (!(await pageObject.isTabOpened(tabSection))) {
        await getElement(tabSection).click();
        // Wait for the content to load after switching tabs
        await page.waitForTimeout(250);
      }
    },

    async switchToTemplateLibraryTab() {
      await pageObject.switchToTab(
        locators.templateLibraryTab,
        TabSection.TemplateLibrary,
      );
    },

    async switchToFunctionalGroupTab() {
      await pageObject.switchToTab(
        locators.functionalGroupTab,
        TabSection.FunctionalGroups,
      );
    },

    async switchToSaltsAndSolventsTab() {
      await pageObject.switchToTab(
        locators.saltsAndSalventsTab,
        TabSection.SaltsAndSolvents,
      );
    },

    async clickSearch() {
      await locators.searchEditBox.click();
    },

    async setSearchValue(value = '') {
      await locators.searchEditBox.fill(value);
    },

    async openTemplateLibrarySection(sectionName: TemplateLibraryTab) {
      if (!(await pageObject.isSectionOpened(sectionName))) {
        await page.getByTestId(sectionName).click();
      }
    },

    async selectTemplate(
      sectionName: TemplateLibraryTab,
      templateName: LibraryTemplate | string,
    ) {
      if (!(await pageObject.isTabOpened(TabSection.TemplateLibrary))) {
        await pageObject.switchToTemplateLibraryTab();
      }
      if (!(await pageObject.isSectionOpened(sectionName))) {
        await pageObject.openTemplateLibrarySection(sectionName);
      }
      await page.getByTestId(templateName).click();
    },

    async editTemplate(
      sectionName: TemplateLibraryTab,
      templateName: LibraryTemplate,
    ) {
      if (!(await pageObject.isTabOpened(TabSection.TemplateLibrary))) {
        await pageObject.switchToTemplateLibraryTab();
      }
      await pageObject.openTemplateLibrarySection(sectionName);
      await page
        .getByTestId(templateName)
        .locator('..')
        .getByTestId('edit-template-button')
        .click();
    },

    async deleteMyTemplate() {
      await locators.deleteTemplateButton.click();
    },

    async selectFunctionalGroup(cardName: FunctionalGroupsTabItems) {
      if (!(await pageObject.isTabOpened(TabSection.FunctionalGroups))) {
        await pageObject.switchToFunctionalGroupTab();
      }
      await page.getByTestId(cardName).click();
    },

    async selectSaltsAndSolvents(cardName: SaltsAndSolventsTabItems) {
      if (!(await pageObject.isTabOpened(TabSection.SaltsAndSolvents))) {
        await pageObject.switchToSaltsAndSolventsTab();
      }
      await page.getByTestId(cardName).click();
    },

    async saveToSdf() {
      await locators.saveToSdfButton.click();
    },
  };

  return pageObject;
};

export type StructureLibraryDialogType = ReturnType<
  typeof StructureLibraryDialog
>;
