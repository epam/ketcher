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
    Object.assign(page.getByTestId(TabSection.TemplateLibraryTab), {
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
    functionalGroupTab: page.getByTestId(TabSection.FunctionalGroupsTab),
    saltsAndSalventsTab: page.getByTestId(TabSection.SaltsAndSolventsTab),
    saveToSdfButton: page.getByTestId('save-to-sdf-button'),
    deleteTemplateButton: page.getByTestId('delete-template-button'),
  };

  return {
    ...locators,

    async closeWindow() {
      await locators.closeWindowButton.click();
    },

    async switchToTab(tabLocator: Locator, tabSection: TabSection) {
      if ((await tabLocator.getAttribute('aria-selected')) !== 'true') {
        await this.openTab(tabSection);
      }
    },

    async isTabOpened(tabSection: TabSection): Promise<boolean> {
      const ariaSelected = await getElement(tabSection).getAttribute(
        'aria-selected',
      );
      return ariaSelected === 'true';
    },

    async isSectionOpened(sectionName: TemplateLibraryTab): Promise<boolean> {
      const ariaExpanded = await getElement(sectionName).getAttribute(
        'aria-expanded',
      );
      return ariaExpanded === 'true';
    },

    async openSection(sectionName: TemplateLibraryTab) {
      if (!(await this.isSectionOpened(sectionName))) {
        await getElement(sectionName).click();
      }
    },

    async openTab(tabSection: TabSection) {
      if (!(await this.isTabOpened(tabSection))) {
        await getElement(tabSection).click();
      }
    },

    async switchToTemplateLibraryTab() {
      await this.switchToTab(
        locators.templateLibraryTab,
        TabSection.TemplateLibraryTab,
      );
    },

    async switchToFunctionalGroupTab() {
      await this.switchToTab(
        locators.functionalGroupTab,
        TabSection.FunctionalGroupsTab,
      );
    },

    async switchToSaltsAndSolventsTab() {
      await this.switchToTab(
        locators.saltsAndSalventsTab,
        TabSection.SaltsAndSolventsTab,
      );
    },

    async clickSearch() {
      await locators.searchEditBox.click();
    },

    async setSearchValue(value = '') {
      await locators.searchEditBox.fill(value);
    },

    async openTemplateLibrarySection(sectionName: TemplateLibraryTab) {
      if (!(await this.isSectionOpened(sectionName))) {
        await page.getByTestId(sectionName).click();
      }
    },

    async addTemplate(
      sectionName: TemplateLibraryTab,
      templateName: LibraryTemplate,
    ) {
      if (!(await this.isTabOpened(TabSection.TemplateLibraryTab))) {
        await this.switchToTemplateLibraryTab();
      }
      if (!(await this.isSectionOpened(sectionName))) {
        await this.openTemplateLibrarySection(sectionName);
      }
      await page.getByTestId(templateName).click();
    },

    async editTemplate(
      sectionName: TemplateLibraryTab,
      templateName: LibraryTemplate,
    ) {
      if (!(await this.isTabOpened(TabSection.TemplateLibraryTab))) {
        await this.switchToTemplateLibraryTab();
      }
      await this.openTemplateLibrarySection(sectionName);
      await page
        .getByTestId(templateName)
        .locator('..')
        .getByTestId('edit-template-button')
        .click();
    },

    async deleteMyTemplate() {
      await locators.deleteTemplateButton.click();
    },

    async addFunctionalGroup(cardName: FunctionalGroupsTabItems) {
      if (!(await this.isTabOpened(TabSection.FunctionalGroupsTab))) {
        await this.switchToFunctionalGroupTab();
      }
      await page.getByTestId(cardName).click();
    },

    async addSaltsAndSolvents(cardName: SaltsAndSolventsTabItems) {
      if (!(await this.isTabOpened(TabSection.SaltsAndSolventsTab))) {
        await this.switchToSaltsAndSolventsTab();
      }
      await page.getByTestId(cardName).click();
    },

    async saveToSdfButton() {
      await locators.saveToSdfButton.click();
    },
  };
};

export type StructureLibraryDialogType = ReturnType<
  typeof StructureLibraryDialog
>;
