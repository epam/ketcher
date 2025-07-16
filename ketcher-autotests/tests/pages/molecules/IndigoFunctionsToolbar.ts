/* eslint-disable no-magic-numbers */
import { Page, Locator, expect } from '@playwright/test';
import { waitForSpinnerFinishedWork } from '@utils/common/loaders';

type IndigoFunctionsToolbarLocators = {
  aromatizeButton: Locator;
  dearomatizeButton: Locator;
  layoutButton: Locator;
  cleanUpButton: Locator;
  calculateCIPButton: Locator;
  checkStructureButton: Locator;
  calculatedValuesButton: Locator;
  addRemoveExplicitHydrogensButton: Locator;
  ThreeDViewerButton: Locator;
};

export const IndigoFunctionsToolbar = (page: Page) => {
  const locators: IndigoFunctionsToolbarLocators = {
    aromatizeButton: page.getByTestId('Aromatize button'),
    dearomatizeButton: page.getByTestId('Dearomatize button'),
    layoutButton: page.getByTestId('Layout button'),
    cleanUpButton: page.getByTestId('Clean Up button'),
    calculateCIPButton: page.getByTestId('Calculate CIP button'),
    checkStructureButton: page.getByTestId('Check Structure button'),
    calculatedValuesButton: page.getByTestId('Calculated Values button'),
    addRemoveExplicitHydrogensButton: page.getByTestId(
      'Add/Remove explicit hydrogens button',
    ),
    ThreeDViewerButton: page.getByTestId('3D Viewer button'),
  };

  async function waitForIndigoToLoad() {
    await expect(locators.aromatizeButton).toBeVisible({ timeout: 10000 });
    await expect(locators.aromatizeButton).toBeEnabled({ timeout: 10000 });
  }

  return {
    ...locators,

    async aromatize() {
      await waitForIndigoToLoad();
      await waitForSpinnerFinishedWork(
        page,
        async () => await locators.aromatizeButton.click(),
      );
    },

    async dearomatize() {
      await waitForIndigoToLoad();
      await waitForSpinnerFinishedWork(
        page,
        async () => await locators.dearomatizeButton.click(),
      );
    },

    async layout() {
      await waitForIndigoToLoad();
      await waitForSpinnerFinishedWork(
        page,
        async () => await locators.layoutButton.click(),
      );
    },

    async cleanUp() {
      await waitForIndigoToLoad();
      await waitForSpinnerFinishedWork(
        page,
        async () => await locators.cleanUpButton.click(),
      );
    },

    async calculateCIP() {
      await waitForIndigoToLoad();
      await waitForSpinnerFinishedWork(
        page,
        async () => await locators.calculateCIPButton.click(),
      );
    },

    async checkStructure() {
      await waitForIndigoToLoad();
      await waitForSpinnerFinishedWork(
        page,
        async () => await locators.checkStructureButton.click(),
      );
    },

    async calculatedValues() {
      await waitForSpinnerFinishedWork(
        page,
        async () => await locators.calculatedValuesButton.click(),
      );
    },

    async addRemoveExplicitHydrogens() {
      await waitForIndigoToLoad();
      await waitForSpinnerFinishedWork(
        page,
        async () => await locators.addRemoveExplicitHydrogensButton.click(),
      );
    },

    async ThreeDViewer() {
      await waitForSpinnerFinishedWork(
        page,
        async () => await locators.ThreeDViewerButton.click(),
      );
    },
  };
};

export type IndigoFunctionsToolbarType = ReturnType<
  typeof IndigoFunctionsToolbar
>;
