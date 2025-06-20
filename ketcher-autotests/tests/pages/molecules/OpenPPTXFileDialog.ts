import { Page, Locator } from '@playwright/test';
import { waitForSpinnerFinishedWork } from '@utils/common/loaders/waitForSpinnerFinishedWork/waitForSpinnerFinishedWork';
import { CommonTopLeftToolbar } from '../common/CommonTopLeftToolbar';
import { openFile } from '@utils/files';

type OpenPPTXFileDialogLocators = {
  closeWindowButton: Locator;
  addToCanvasButton: Locator;
  openAsNewProjectButton: Locator;
  cancelButton: Locator;
};

export enum Action {
  AddToCanvas,
  OpenAsNewProject,
}

export const OpenPPTXFileDialog = (page: Page) => {
  const locators: OpenPPTXFileDialogLocators = {
    closeWindowButton: page.getByTestId('close-window-button'),
    addToCanvasButton: page.getByTestId('add-to-canvas-button'),
    openAsNewProjectButton: page.getByTestId('open-as-new-button'),
    cancelButton: page.getByTestId('cancel-button'),
  };

  return {
    ...locators,

    async closeByX() {
      await locators.closeWindowButton.click();
    },

    async pressAddToCanvasButton() {
      await waitForSpinnerFinishedWork(page, async () => {
        await locators.addToCanvasButton.click();
      });
    },

    async pressOpenAsNewProjectButton() {
      await waitForSpinnerFinishedWork(page, async () => {
        await locators.openAsNewProjectButton.click();
      });
    },

    async pressCancelButton() {
      await locators.cancelButton.click();
    },

    async selectStructure(numberOf: { Structure: number }) {
      await waitForSpinnerFinishedWork(page, async () => {
        await page.getByTestId(`cdx-structure-${numberOf.Structure}`).click();
      });
    },
  };
};

export async function openPPTXFile(
  page: Page,
  filePath: string,
  numberOf: {
    Structure: number;
  } = { Structure: 1 },
  action: Action,
) {
  await CommonTopLeftToolbar(page).openFile();
  await waitForSpinnerFinishedWork(page, async () => {
    await openFile(page, filePath);
  });
  const openPPTXFileDialog = OpenPPTXFileDialog(page);
  if (numberOf.Structure !== 1) {
    await openPPTXFileDialog.selectStructure(numberOf);
  }
  if (action === Action.AddToCanvas) {
    await openPPTXFileDialog.pressAddToCanvasButton();
  } else if (action === Action.OpenAsNewProject) {
    await openPPTXFileDialog.pressOpenAsNewProjectButton();
  }
}

export type OpenPPTXFileDialogType = ReturnType<typeof OpenPPTXFileDialog>;
