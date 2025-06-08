import { Page, Locator } from '@playwright/test';
import { Monomer } from '@utils/types';
import {
  FavoriteStarSymbol,
  LibraryTab,
  monomerLibraryTypeLocation,
  MonomerTypeLocation,
  RNASection,
  rnaSectionArea,
} from '../constants/library/Constants';
import { RNABuilder } from './library/RNABuilder';

type PresetsSectionLocators = {
  newPresetsButton: Locator;
};

type RNATabLocators = {
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

  // const getMonomerLibraryLocation = (monomer: Monomer): LibraryMonomerType => {
  //   for (const [monomerTypeKey, monomers] of Object.entries(
  //     monomerTabMapping,
  //   )) {
  //     if (monomers?.some((m) => m.alias === monomer.alias)) {
  //       return monomerTypeKey as unknown as LibraryMonomerType;
  //     }
  //   }
  //   throw new Error(
  //     `Monomer with alias ${monomer.alias} not found in any tab group`,
  //   );
  // };

  const presetsSection: Locator & PresetsSectionLocators = Object.assign(
    page.getByTestId(RNASection.Presets),
    {
      newPresetsButton: page.getByTestId('new-preset-button'),
    },
  );

  const rnaTab: Locator & RNATabLocators = Object.assign(
    page.getByTestId(LibraryTab.RNA),
    {
      presetsSection,
      sugarsSection: page.getByTestId(RNASection.Sugars),
      basesSection: page.getByTestId(RNASection.Bases),
      phosphatesSection: page.getByTestId(RNASection.Phosphates),
      nucleotidesSection: page.getByTestId(RNASection.Nucleotides),
    },
  );

  const locators: LibraryLocators = {
    searchEditbox: page.getByTestId('monomer-library-input'),
    hideLibraryButton: page.getByTestId('hide-monomer-library'),
    showLibraryButton: page.getByTestId('show-monomer-library'),
    favoritesTab: page.getByTestId(LibraryTab.Favorites),
    peptidesTab: page.getByTestId(LibraryTab.Peptides),
    rnaTab,
    chemTab: page.getByTestId(LibraryTab.CHEM),
  };

  const rnaBuilder = RNABuilder(page);

  return {
    ...locators,

    rnaBuilder,

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

    async switchToFavoritesTab() {
      if (
        (await locators.favoritesTab.getAttribute('aria-selected')) !== 'true'
      ) {
        await this.openTab(LibraryTab.Favorites);
      }
    },

    async switchToPeptidesTab() {
      if (
        (await locators.peptidesTab.getAttribute('aria-selected')) !== 'true'
      ) {
        await this.openTab(LibraryTab.Peptides);
      }
    },

    async switchToRNATab() {
      if ((await locators.rnaTab.getAttribute('aria-selected')) !== 'true') {
        await this.openTab(LibraryTab.RNA);
      }
    },

    async switchToCHEMTab() {
      if ((await locators.chemTab.getAttribute('aria-selected')) !== 'true') {
        await this.openTab(LibraryTab.CHEM);
      }
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

    async isTabOpened(libraryTab: LibraryTab): Promise<boolean> {
      const ariaSelected = await getElement(libraryTab).getAttribute(
        'aria-selected',
      );
      return ariaSelected === 'true';
    },

    async openTab(libraryTab: LibraryTab) {
      if (!(await this.isTabOpened(libraryTab))) {
        await getElement(libraryTab).click();
      }
    },

    async isRNASectionOpened(rnaSection: RNASection): Promise<boolean> {
      return await getElement(rnaSectionArea[rnaSection]).isVisible();
    },

    async openRNASection(rnaSection: RNASection) {
      await this.openTab(LibraryTab.RNA);
      if (!(await this.isRNASectionOpened(rnaSection))) {
        await getElement(rnaSection).click();
      }
    },

    async goToMonomerLocation(monomerTypeLocation: MonomerTypeLocation) {
      const { libraryTab, rnaSection } = monomerTypeLocation;

      await this.openTab(libraryTab);

      if (rnaSection) {
        await this.openRNASection(rnaSection);
      }
    },

    /**
     * Selects a monomer by navigating to the corresponding tab and clicking on the monomer.
     * If the monomer belongs to an RNA-specific accordion group, it expands the accordion item.
     */
    async selectMonomer(monomer: Monomer, selectOnFavoritesTab = false) {
      const location = monomer.monomerType
        ? monomerLibraryTypeLocation[monomer.monomerType]
        : {
            libraryTab: LibraryTab.RNA,
            rnaSection: RNASection.Presets,
          };

      if (selectOnFavoritesTab) {
        this.openTab(LibraryTab.Favorites);
      } else {
        await this.goToMonomerLocation(location);
      }

      await getElement(monomer.testId).click();
    },

    /**
     * Hovers a monomer by navigating to the corresponding tab and clicking on the monomer.
     * If the monomer belongs to an RNA-specific accordion group, it expands the accordion item.
     */
    async hoverMonomer(monomer: Monomer, selectOnFavoritesTab = false) {
      const location = monomer.monomerType
        ? monomerLibraryTypeLocation[monomer.monomerType]
        : {
            libraryTab: LibraryTab.RNA,
            rnaSection: RNASection.Presets,
          };

      if (selectOnFavoritesTab) {
        this.openTab(LibraryTab.Favorites);
      } else {
        await this.goToMonomerLocation(location);
      }

      await getElement(monomer.testId).hover();
    },

    /**
     * Selects a custom preset by navigating to the Presets tab and clicking on the preset.
     */
    async selectCustomPreset(presetTestId: string) {
      const presetLocation = {
        libraryTab: LibraryTab.RNA,
        rnaSection: RNASection.Presets,
      };
      await this.goToMonomerLocation(presetLocation);
      await page.getByTestId(presetTestId).click();
    },

    /**
     * Adds a monomer to favorites by navigating to the corresponding tab and clicking on the monomer's favorite icon.
     * If the monomer belongs to an RNA-specific accordion group, it expands the accordion item.
     */
    async addMonomerToFavorites(monomer: Monomer) {
      const location = monomerLibraryTypeLocation[monomer.monomerType];
      await this.goToMonomerLocation(location);

      const favoritesStar = page
        .getByTestId(monomer.testId)
        .getByText(FavoriteStarSymbol);
      const isFavorite = (await favoritesStar.getAttribute('class'))?.includes(
        'visible',
      );

      if (!isFavorite) {
        await favoritesStar.click();
      }
    },

    /**
     * Removes a monomer from favorites by navigating to the Favorites tab and clicking on the monomer's favorite icon.
     */
    async removeMonomerFromFavorites(
      monomer: Monomer,
      removeFromFavoritesTab = true,
    ) {
      if (removeFromFavoritesTab) {
        this.openTab(LibraryTab.Favorites);
      } else {
        const location = monomerLibraryTypeLocation[monomer.monomerType];
        await this.goToMonomerLocation(location);
      }

      const favoritesStar = page
        .getByTestId(monomer.testId)
        .getByText(FavoriteStarSymbol);
      const isFavorite = (await favoritesStar.getAttribute('class'))?.includes(
        'visible',
      );

      if (isFavorite) {
        await favoritesStar.click();
      }
    },

    /**
     * Selects multiple monomers by iterating through the provided list of monomers.
     * For each monomer, it navigates to the corresponding tab and clicks on the monomer.
     * If a monomer belongs to an RNA-specific accordion group, it expands the accordion item.
     */
    async selectMonomers(monomers: Array<Monomer>) {
      for (const monomer of monomers) {
        this.selectMonomer(monomer);
      }
    },

    /**
     * Adds multiple monomers to favorites by iterating through the provided list of monomers.
     * For each monomer, it navigates to the corresponding tab, expands the accordion (if needed),
     * and clicks on the monomer's favorite icon.
     */
    async addMonomersToFavorites(monomers: Array<Monomer>) {
      for (const monomer of monomers) {
        this.addMonomerToFavorites(monomer);
      }
    },

    /**
     * Removes multiple monomers from favorites by iterating through the provided list of monomers.
     */
    async removeMonomersFromFavorites(monomers: Array<Monomer>) {
      for (const monomer of monomers) {
        this.removeMonomerFromFavorites(monomer);
      }
    },

    async newPreset() {
      await this.openRNASection(RNASection.Presets);
      await presetsSection.newPresetsButton.click();
    },
  };
};

export type LibraryLocatorsType = ReturnType<typeof Library>;
