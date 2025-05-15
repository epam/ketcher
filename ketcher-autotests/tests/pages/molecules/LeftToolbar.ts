import { Page, Locator } from '@playwright/test';
import { RGroupType } from '../constants/rGroupSelectionTool/Constants';
import { ArrowType } from '../constants/arrowSelectionTool/Constants';
import { ReactionMappingType } from '../constants/reactionMappingTool/Constants';
import { ShapeType } from '../constants/shapeSelectionTool/Constants';

type LeftToolbarLocators = {
  chainButton: Locator;
  stereochemestryButton: Locator;
  chargePlusButton: Locator;
  chargeMinusButton: Locator;
  sGroupButton: Locator;
  rGroupToolsButton: Locator;
  reactionPlusToolButton: Locator;
  arrowToolsButton: Locator;
  reactionMappingToolsButton: Locator;
  shapeToolsButton: Locator;
  addTextButton: Locator;
  addImageButton: Locator;
};

export const LeftToolbar = (page: Page) => {
  const locators: LeftToolbarLocators = {
    chainButton: page.getByTestId('chain'),
    stereochemestryButton: page.getByTestId('enhanced-stereo'),
    chargePlusButton: page.getByTestId('charge-plus'),
    chargeMinusButton: page.getByTestId('charge-minus'),
    sGroupButton: page.getByTestId('sgroup'),
    rGroupToolsButton: page.getByTestId('rgroup-drop-down-button'),
    reactionPlusToolButton: page.getByTestId('reaction-plus'),
    arrowToolsButton: page.getByTestId('arrows-drop-down-button'),
    reactionMappingToolsButton: page.getByTestId(
      'reaction-mapping-tools-drop-down-button',
    ),
    shapeToolsButton: page.getByTestId('shapes-drop-down-button'),
    addTextButton: page.getByTestId('text'),
    addImageButton: page.getByTestId('images'),
  };

  return {
    ...locators,

    async chain() {
      await locators.chainButton.click();
    },

    async stereochemestry() {
      await locators.stereochemestryButton.click();
    },

    async chargePlus() {
      await locators.chargePlusButton.click();
    },

    async chargeMinus() {
      await locators.chargeMinusButton.click();
    },

    async sGroup() {
      await locators.sGroupButton.click();
    },

    async expandRGroupToolsDropdown() {
      const rGroupToolbar = page.getByTestId('multi-tool-dropdown');

      await locators.rGroupToolsButton.getByTestId('dropdown-expand').click();
      await rGroupToolbar.waitFor({ state: 'visible' });
    },

    async selectRGroupTool(rGroupType: RGroupType) {
      await this.expandRGroupToolsDropdown();
      await page.getByTestId(rGroupType).first().click();
    },

    async reactionPlusTool() {
      await locators.reactionPlusToolButton.click();
    },

    async expandArrowToolsDropdown() {
      const arrowToolbar = page.getByTestId('multi-tool-dropdown');

      await locators.arrowToolsButton.getByTestId('dropdown-expand').click();
      await arrowToolbar.waitFor({ state: 'visible' });
    },

    async selectArrowTool(arrowType: ArrowType) {
      await this.expandArrowToolsDropdown();
      await page.getByTestId(arrowType).first().click();
    },

    async expandReactionMappingToolsDropdown() {
      const reactionMappingToolbar = page.getByTestId('multi-tool-dropdown');

      await locators.reactionMappingToolsButton
        .getByTestId('dropdown-expand')
        .click();
      await reactionMappingToolbar.waitFor({ state: 'visible' });
    },

    async selectReactionMappingTool(reactionMappingType: ReactionMappingType) {
      await this.expandReactionMappingToolsDropdown();
      await page.getByTestId(reactionMappingType).first().click();
    },

    async expandShapeToolsDropdown() {
      const shapeToolbar = page.getByTestId('multi-tool-dropdown');

      await locators.shapeToolsButton.getByTestId('dropdown-expand').click();
      await shapeToolbar.waitFor({ state: 'visible' });
    },

    async selectShapeTool(shapeType: ShapeType) {
      await this.expandShapeToolsDropdown();
      await page.getByTestId(shapeType).first().click();
    },

    async text() {
      await locators.addTextButton.click();
    },

    async image() {
      await locators.addImageButton.click();
    },
  };
};

export type LeftToolbarType = ReturnType<typeof LeftToolbar>;
