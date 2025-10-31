import { Page, Locator, expect } from '@playwright/test';
import { Monomer, PresetType } from '@utils/types';
import {
  FavoriteStarSymbol,
  LibraryTab,
  monomerLibraryTypeLocation,
  RNASection,
  rnaSectionArea,
  rnaTabPresetsSection,
} from '../constants/library/Constants';
import { RNABuilder } from './library/RNABuilder';
import { ContextMenu } from '../common/ContextMenu';
import { waitForRender } from '@utils/common';
import { getCoordinatesOfTheMiddleOfTheCanvas, moveMouseAway } from '@utils';
import { KETCHER_CANVAS } from '../constants/canvas/Constants';
import { Preset } from '../constants/monomers/Presets';

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
        await locators.searchEditbox.waitFor({ state: 'hidden' });
      }
    },

    async showLibrary() {
      if (await locators.showLibraryButton.isVisible()) {
        await locators.showLibraryButton.click();
        await locators.searchEditbox.waitFor({ state: 'visible' });
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

    async clickOnMonomer(monomer: Monomer | PresetType) {
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
        await expect(getElement(libraryTab)).toBeInViewport();
        await getElement(libraryTab).click();
      }
    },

    async isRNASectionOpened(rnaSection: RNASection): Promise<boolean> {
      return await getElement(rnaSectionArea[rnaSection]).isVisible();
    },

    async openRNASection(rnaSection: RNASection) {
      await this.openTab(LibraryTab.RNA);
      if (!(await this.isRNASectionOpened(rnaSection))) {
        await expect(getElement(rnaSection)).toBeInViewport();
        await getElement(rnaSection).click();
      }
    },

    async getMonomerLibraryLocation(monomer: Monomer | PresetType) {
      return monomer.monomerType
        ? monomerLibraryTypeLocation[monomer.monomerType]
        : rnaTabPresetsSection;
    },

    /**
     * Navigates to the tab and section (if applicable) where the monomer is located.
     */
    async goToMonomerLibraryLocation(monomer: Monomer | PresetType) {
      const { libraryTab, rnaSection } = await this.getMonomerLibraryLocation(
        monomer,
      );

      await this.openTab(libraryTab);

      if (rnaSection) {
        await this.openRNASection(rnaSection);
      }
    },

    /**
     * Selects a monomer by navigating to the corresponding tab and clicking on the monomer.
     * If the monomer belongs to an RNA-specific accordion group, it expands the accordion item.
     */
    async selectMonomer(
      monomer: Monomer | PresetType,
      selectOnFavoritesTab = false,
    ) {
      if (selectOnFavoritesTab) {
        await this.openTab(LibraryTab.Favorites);
      } else {
        await this.goToMonomerLibraryLocation(monomer);
      }

      const monomerCard = getElement(monomer.testId);
      const monomerCardBbox = await monomerCard.boundingBox();
      await monomerCard.click({
        position: {
          // eslint-disable-next-line no-magic-numbers
          x: monomerCardBbox?.width ? monomerCardBbox.width / 2 : 0,
          // eslint-disable-next-line no-magic-numbers
          y: monomerCardBbox?.height ? monomerCardBbox.height - 10 : 0,
        },
      });
    },

    /**
     * Hovers a monomer by navigating to the corresponding tab and clicking on the monomer.
     * If the monomer belongs to an RNA-specific accordion group, it expands the accordion item.
     */
    async hoverMonomer(
      monomer: Monomer | PresetType,
      selectOnFavoritesTab = false,
    ) {
      if (selectOnFavoritesTab) {
        await this.openTab(LibraryTab.Favorites);
      } else {
        await this.goToMonomerLibraryLocation(monomer);
      }

      await getElement(monomer.testId).hover();
    },

    getMonomerLibraryCardLocator(monomer: Monomer | PresetType) {
      return getElement(monomer.testId);
    },

    getMonomerHELMAlias(monomer: Monomer | PresetType) {
      return getElement(monomer.testId).getAttribute('data-helm');
    },

    getMonomerAxoLabsAlias(monomer: Monomer | PresetType) {
      return getElement(monomer.testId).getAttribute('data-axolabs');
    },

    getMonomerIDTAliasBase(monomer: Monomer | PresetType) {
      return getElement(monomer.testId).getAttribute('data-idtalias-base');
    },

    getMonomerIDTAliasEp5(monomer: Monomer | PresetType) {
      return getElement(monomer.testId).getAttribute(
        'data-idtalias-modifications-endpoint5',
      );
    },
    getMonomerIDTAliasEp3(monomer: Monomer | PresetType) {
      return getElement(monomer.testId).getAttribute(
        'data-idtalias-modifications-endpoint3',
      );
    },
    getMonomerIDTAliasInternal(monomer: Monomer | PresetType) {
      return getElement(monomer.testId).getAttribute(
        'data-idtalias-modifications-internal',
      );
    },
    getMonomerModificationTypes(monomer: Monomer | PresetType) {
      return getElement(monomer.testId).getAttribute('data-modificationtype');
    },

    async isMonomerExist(
      monomer: Monomer | PresetType,
      selectOnFavoritesTab = false,
    ): Promise<boolean> {
      if (selectOnFavoritesTab) {
        await this.openTab(LibraryTab.Favorites);
      } else {
        await this.goToMonomerLibraryLocation(monomer);
      }

      return await getElement(monomer.testId).isVisible();
    },

    /** Locator of the arrow button (autochain) on the monomer card */
    getMonomerAutochainButton(monomer: Monomer): Locator {
      return page.getByTestId(monomer.testId).locator('.autochain');
    },

    /** Hover over the arrow button on the monomer card */
    async hoverMonomerAutochain(monomer: Monomer) {
      await this.goToMonomerLibraryLocation(monomer);

      const card = page.getByTestId(monomer.testId);
      await card.hover();

      const btn = this.getMonomerAutochainButton(monomer);
      await btn.waitFor({ state: 'visible' });
      await btn.hover();
    },

    /** Click on the arrow button on the monomer card */
    async clickMonomerAutochain(monomer: Monomer) {
      await this.goToMonomerLibraryLocation(monomer);

      const card = page.getByTestId(monomer.testId);
      await card.hover();

      const btn = this.getMonomerAutochainButton(monomer);
      await btn.waitFor({ state: 'visible' });
      await btn.click();
    },

    async dragMonomerOnCanvas(
      monomer: Monomer | PresetType,
      coordinates: { x: number; y: number; fromCenter?: boolean },
      selectOnFavoritesTab = false,
    ) {
      const canvas = await page
        .getByTestId(KETCHER_CANVAS)
        .filter({ has: page.locator(':visible') })
        .boundingBox();
      if (!canvas) {
        throw new Error('Unable to get boundingBox for canvas');
      }
      let x = canvas.x + coordinates.x;
      let y = canvas.y + coordinates.y;

      if (coordinates.fromCenter) {
        const centerOfCanvas = await getCoordinatesOfTheMiddleOfTheCanvas(page);

        x = x + centerOfCanvas.x;
        y = y + centerOfCanvas.y;
      }

      await this.hoverMonomer(monomer, selectOnFavoritesTab);
      await page.mouse.down();
      await page.mouse.move(x, y);
      await waitForRender(page, async () => {
        await page.mouse.up();
      });
    },

    /**
     * Selects a custom preset by navigating to the Presets tab and clicking on the preset.
     */
    async selectCustomPreset(presetTestId: string) {
      await this.goToMonomerLibraryLocation(Preset.A);

      const presetCard = getElement(presetTestId);
      const presetCardBbox = await presetCard.boundingBox();

      await presetCard.click({
        position: {
          // eslint-disable-next-line no-magic-numbers
          x: presetCardBbox?.width ? presetCardBbox.width / 2 : 0,
          // eslint-disable-next-line no-magic-numbers
          y: presetCardBbox?.height ? presetCardBbox.height - 10 : 0,
        },
      });
    },

    async rightClickOnPreset(preset: Monomer) {
      if (preset.monomerType) {
        throw new Error(
          `Given monomer with alias ${preset.alias} is not a Preset`,
        );
      } else {
        await this.goToMonomerLibraryLocation(Preset.A);
        await ContextMenu(page, getElement(preset.testId)).open();
      }
    },

    /**
     * Adds a monomer to favorites by navigating to the corresponding tab and clicking on the monomer's favorite icon.
     * If the monomer belongs to an RNA-specific accordion group, it expands the accordion item.
     */
    async addMonomerToFavorites(monomer: Monomer | PresetType) {
      await this.goToMonomerLibraryLocation(monomer);

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
      monomer: Monomer | PresetType,
      removeFromFavoritesTab = true,
    ) {
      if (removeFromFavoritesTab) {
        await this.openTab(LibraryTab.Favorites);
      } else {
        await this.goToMonomerLibraryLocation(monomer);
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
        await this.selectMonomer(monomer);
      }
    },

    /**
     * Adds multiple monomers to favorites by iterating through the provided list of monomers.
     * For each monomer, it navigates to the corresponding tab, expands the accordion (if needed),
     * and clicks on the monomer's favorite icon.
     */
    async addMonomersToFavorites(monomers: Array<Monomer>) {
      for (const monomer of monomers) {
        await moveMouseAway(page);
        await this.addMonomerToFavorites(monomer);
      }
    },

    /**
     * Removes multiple monomers from favorites by iterating through the provided list of monomers.
     */
    async removeMonomersFromFavorites(monomers: Array<Monomer>) {
      for (const monomer of monomers) {
        await this.removeMonomerFromFavorites(monomer);
      }
    },

    async newPreset() {
      await this.openRNASection(RNASection.Presets);
      await presetsSection.newPresetsButton.click();
    },
  };
};

export type LibraryLocatorsType = ReturnType<typeof Library>;
