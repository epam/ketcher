import { Page, Locator } from '@playwright/test';
import {
  FunctionalGroupsTabItems,
  LibraryTemplate,
  SaltsAndSolventsTabItems,
  TabSection,
  TemplateLibraryTabItems,
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
  closeWindowButton: Locator;
  searchEditBox: Locator;
  templateLibraryTab: Locator & TemplateLibraryTabLocators;
  functionalGroupTab: Locator;
  saltsAndSalventsTab: Locator;
  saveToSdfButton: Locator;
};

export const StructureLibraryDialog = (page: Page) => {
  const getElement = (dataTestId: string): Locator =>
    page.getByTestId(dataTestId);

  const templateLibraryTab: Locator & TemplateLibraryTabLocators =
    Object.assign(page.getByTestId(TabSection.TemplateLibraryTab), {
      alphaDSugarsSection: page.getByTestId(
        TemplateLibraryTabItems.AlphaDSugars,
      ),
      aromaticsSection: page.getByTestId(TemplateLibraryTabItems.Aromatics),
      betaDSugarsSection: page.getByTestId(TemplateLibraryTabItems.BetaDSugars),
      bicyclesSection: page.getByTestId(TemplateLibraryTabItems.Bicycles),
      bridgedPolycyclicsSection: page.getByTestId(
        TemplateLibraryTabItems.BridgedPolycyclics,
      ),
      crownEthersSection: page.getByTestId(TemplateLibraryTabItems.CrownEthers),
      dAminoAcidsSection: page.getByTestId(TemplateLibraryTabItems.DAminoAcids),
      dSugarsSection: page.getByTestId(TemplateLibraryTabItems.DSugars),
      heterocyclicRingsSection: page.getByTestId(
        TemplateLibraryTabItems.HeterocyclicRings,
      ),
      lAminoAcidsSection: page.getByTestId(TemplateLibraryTabItems.LAminoAcids),
      nucleobasesSection: page.getByTestId(TemplateLibraryTabItems.Nucleobases),
      ringsSection: page.getByTestId(TemplateLibraryTabItems.Rings),
      sugarsSection: page.getByTestId(TemplateLibraryTabItems.Sugars),
      threeDTemplatesSection: page.getByTestId(
        TemplateLibraryTabItems.ThreeDTemplates,
      ),
    });

  const locators: StructureLibraryDialogLocators = {
    closeWindowButton: page.getByTestId('close-window-button'),
    searchEditBox: page.getByTestId('template-search-input'),
    templateLibraryTab,
    functionalGroupTab: page.getByTestId(TabSection.FunctionalGroupsTab),
    saltsAndSalventsTab: page.getByTestId(TabSection.SaltsAndSolventsTab),
    saveToSdfButton: page.getByTestId('save-to-sdf-button'),
  };

  return {
    ...locators,

    async close() {
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

    async isSectionOpened(sectionName: LibraryTemplate): Promise<boolean> {
      const ariaExpanded = await getElement(sectionName).getAttribute(
        'aria-expanded',
      );
      return ariaExpanded === 'true';
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

    async setSearchValue(value = '') {
      await locators.searchEditBox.fill(value);
    },

    async getSearchValue(): Promise<string | null> {
      return await locators.searchEditBox.inputValue();
    },

    async openTemplateLibrarySection(name: TemplateLibraryTabItems) {
      await page.getByTestId(name).click();
    },

    async addTemplateToCanvas(
      sectionName: TemplateLibraryTabItems,
      templateName: LibraryTemplate,
    ) {
      if (!(await this.isTabOpened(TabSection.TemplateLibraryTab))) {
        await this.switchToTemplateLibraryTab();
      }
      await this.openTemplateLibrarySection(sectionName);
      await page.getByTestId(templateName).click();
    },

    async editTemplate(
      sectionName: TemplateLibraryTabItems,
      templateName: LibraryTemplate,
    ) {
      if (!(await this.isTabOpened(TabSection.TemplateLibraryTab))) {
        await this.switchToTemplateLibraryTab();
      }
      await this.openTemplateLibrarySection(sectionName);
      await page.getByTestId(templateName).getByLabel('button').click();
    },

    async addFunctionalGroupToCanvas(cardName: FunctionalGroupsTabItems) {
      if (!(await this.isTabOpened(TabSection.FunctionalGroupsTab))) {
        await this.switchToFunctionalGroupTab();
      }
      await page.getByTestId(cardName).click();
    },

    async addSaltsAndSolventsToCanvas(cardName: SaltsAndSolventsTabItems) {
      if (!(await this.isTabOpened(TabSection.SaltsAndSolventsTab))) {
        await this.switchToSaltsAndSolventsTab();
      }
      await page.getByTestId(cardName).click();
    },

    async clickSaveToSdfButton() {
      await locators.saveToSdfButton.click();
    },
  };
};

export type StructureLibraryDialogType = ReturnType<
  typeof StructureLibraryDialog
>;
