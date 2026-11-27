import { Page, Locator } from '@playwright/test';
import { waitForRender } from '@utils/index';
import { getCanvasByMode } from '@utils/canvas/canvasLocators';
import {
  AntisenseStrandType,
  LayoutMode,
} from '../constants/macromoleculesTopToolbar/Constants';
import { waitForCalculateProperties } from '@utils/common/loaders/waitForCalculateProperties';
import { waitForLayoutModeSwitch } from '@utils/common/loaders/waitForLayoutModeSwitch';

type MacromoleculesTopToolbarLocators = {
  arrangeAsRingButton: Locator;
  createAntisenseStrandDropdownButton: Locator;
  createAntisenseStrandDropdownExpandButton: Locator;
  arrangeAsARingButton: Locator;
  calculatePropertiesButton: Locator;
  syncSequenceEditModeButton: Locator;
  switchLayoutModeDropdownButton: Locator;
  switchLayoutModeDropdownExpandButton: Locator;
  rnaButton: Locator;
  dnaButton: Locator;
  peptidesButton: Locator;
  arrowScrollLeftButton: Locator;
  arrowScrollRightButton: Locator;
};

export const MacromoleculesTopToolbar = (page: Page) => {
  const locators: MacromoleculesTopToolbarLocators = {
    arrangeAsRingButton: page.getByTestId('arrange-ring'),
    createAntisenseStrandDropdownButton: page.getByTestId('antisenseRnaStrand'),
    createAntisenseStrandDropdownExpandButton: page
      .getByTestId('Create Antisense Strand')
      .getByTestId('dropdown-expand'),
    arrangeAsARingButton: page.getByTestId('arrange-ring'),
    calculatePropertiesButton: page.getByTestId(
      'calculate-macromolecule-properties-button',
    ),
    syncSequenceEditModeButton: page.getByTestId('sync_sequence_edit_mode'),
    switchLayoutModeDropdownButton: page.getByTestId('layout-mode'),
    switchLayoutModeDropdownExpandButton: page
      .getByTestId('layout-mode')
      .getByTestId('dropdown-expand'),
    rnaButton: page.getByTestId('RNABtn'),
    dnaButton: page.getByTestId('DNABtn'),
    peptidesButton: page.getByTestId('PEPTIDEBtn'),
    arrowScrollLeftButton: page.getByTestId('arrow-scroll-left-button'),
    arrowScrollRightButton: page.getByTestId('arrow-scroll-right-button'),
  };

  const pageObject = {
    ...locators,

    async createAntisenseStrand() {
      await waitForRender(page, async () => {
        await locators.createAntisenseStrandDropdownButton.click();
      });
    },

    async expandCreateAntisenseStrandDropdown() {
      const createAntisenseStrandDropdown = page.getByTestId(
        'multi-tool-dropdown',
      );

      try {
        await locators.createAntisenseStrandDropdownExpandButton.click({
          force: true,
        });
        await page.waitForTimeout(0.1 * 1000);
        await createAntisenseStrandDropdown.waitFor({
          state: 'visible',
          timeout: 5000,
        });
      } catch (_error) {
        console.warn(
          "Create Antisense Strand Tools Section didn't appeared after click in 5 seconds, trying one more time...",
        );
        await locators.createAntisenseStrandDropdownExpandButton.click({
          force: true,
        });
        await page.waitForTimeout(0.1 * 1000);
        await createAntisenseStrandDropdown.waitFor({
          state: 'visible',
          timeout: 5000,
        });
      }
    },

    async selectAntisenseStrand(
      antisenseStrandType: AntisenseStrandType = AntisenseStrandType.RNA,
    ) {
      await pageObject.expandCreateAntisenseStrandDropdown();
      await waitForRender(page, async () => {
        await page.getByTestId(antisenseStrandType).first().click();
      });
    },

    async arrangeAsARing() {
      await waitForRender(page, async () => {
        await locators.arrangeAsARingButton.click();
      });
    },

    async calculateProperties(options: { timeout?: number } = {}) {
      await waitForCalculateProperties(
        page,
        async () => {
          await locators.calculatePropertiesButton.click();
        },
        options.timeout,
      );
    },

    async turnSyncEditModeOn() {
      const currentState =
        await locators.syncSequenceEditModeButton.getAttribute('data-isactive');
      if (currentState !== 'true') {
        await locators.syncSequenceEditModeButton.click();
      }
    },

    async turnSyncEditModeOff() {
      const currentState =
        await locators.syncSequenceEditModeButton.getAttribute('data-isactive');
      if (currentState !== 'false') {
        await locators.syncSequenceEditModeButton.click();
      }
    },

    async expandSwitchLayoutModeDropdown() {
      const switchLayoutModeDropdown = page.getByTestId('multi-tool-dropdown');

      try {
        await locators.switchLayoutModeDropdownButton.click();
        await page.waitForTimeout(0.1 * 1000);
        await switchLayoutModeDropdown.waitFor({
          state: 'visible',
          timeout: 5000,
        });
      } catch (_error) {
        console.warn(
          "Layout Mode Dropdown Section didn't appeared after click in 5 seconds, trying one more time...",
        );
        await locators.switchLayoutModeDropdownExpandButton.click({
          force: true,
        });
        await page.waitForTimeout(0.1 * 1000);
        await switchLayoutModeDropdown.waitFor({
          state: 'visible',
          timeout: 5000,
        });
      }
    },

    async selectLayoutModeTool(layoutMode: LayoutMode) {
      if ((await this.getActiveLayoutMode()) === layoutMode) {
        return;
      }

      const layoutOption = page.getByTestId(layoutMode);
      const switchLayoutModeDropdown = page
        .getByTestId('multi-tool-dropdown')
        .filter({ has: layoutOption });
      const layoutModeButton = switchLayoutModeDropdown.getByTestId(layoutMode);
      if (!(await layoutModeButton.isVisible())) {
        await pageObject.expandSwitchLayoutModeDropdown();
      }
      const ketcherId = await locators.switchLayoutModeDropdownButton.evaluate(
        (element) =>
          element
            .closest('[data-ketcher-editor]')
            ?.getAttribute('data-ketcher-id'),
      );
      if (!ketcherId) {
        throw new Error('Cannot identify the active Ketcher editor.');
      }
      await waitForLayoutModeSwitch(
        page,
        () => layoutModeButton.click(),
        layoutMode,
        ketcherId,
      );
      await switchLayoutModeDropdown.waitFor({ state: 'detached' });
    },

    async getActiveLayoutMode(): Promise<LayoutMode | null> {
      const layout = await getCanvasByMode(page, 'macromolecules').getAttribute(
        'data-canvaslayout',
      );

      switch (layout) {
        case 'flex':
          return LayoutMode.Flex;
        case 'snake':
          return LayoutMode.Snake;
        case 'sequence':
          return LayoutMode.Sequence;
        default:
          return null;
      }
    },

    async rna() {
      await locators.rnaButton.click();
    },

    async dna() {
      await locators.dnaButton.click();
    },

    async peptides() {
      await locators.peptidesButton.click();
    },

    async arrowScrollLeft() {
      return locators.arrowScrollLeftButton.click();
    },

    async arrowScrollRight() {
      return locators.arrowScrollRightButton.click();
    },
  };

  return pageObject;
};

export type MacromoleculesTopToolbarType = ReturnType<
  typeof MacromoleculesTopToolbar
>;
