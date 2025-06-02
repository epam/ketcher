import { Page, Locator } from '@playwright/test';
import { waitForSpinnerFinishedWork } from '@utils/common/loaders/waitForSpinnerFinishedWork/waitForSpinnerFinishedWork';
import { CommonTopLeftToolbar } from '../common/CommonTopLeftToolbar';
import { openFile } from '@utils/files';

export enum Action {
  AddToCanvas = 'AddToCanvas',
  OpenAsNewProject = 'OpenAsNewProject',
  Cancel = 'Cancel',
}

type OpenPPTXFileDialogLocators = {
  closeWindowButton: Locator;
  addToCanvasButton: Locator;
  openAsNewProjectButton: Locator;
  cancelButton: Locator;
};

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
      await waitForSpinnerFinishedWork(page, async () => {
        await locators.cancelButton.click();
      });
    },
  };
};

export async function selectStructure(
  page: Page,
  options: {
    Structure: number;
    action?: Action;
  },
) {
  await waitForSpinnerFinishedWork(page, async () => {
    await page.getByTestId(`cdx-structure-${options.Structure}`).click();
  });
  const dialog = OpenPPTXFileDialog(page);
  if (options.action === Action.AddToCanvas) {
    await dialog.pressAddToCanvasButton();
  } else if (options.action === Action.OpenAsNewProject) {
    await dialog.pressOpenAsNewProjectButton();
  } else if (options.action === Action.Cancel) {
    await dialog.pressCancelButton();
  }
}

export async function openPPTXFile(
  page: Page,
  filePath: string,
  options?: {
    Structure?: number;
    action?: Action;
  },
) {
  await CommonTopLeftToolbar(page).openFile();
  await waitForSpinnerFinishedWork(page, async () => {
    await openFile(filePath, page);
  });
  if (options?.Structure !== undefined) {
    await selectStructure(page, {
      Structure: options.Structure,
      action: options.action,
    });
  }
}

export type OpenPPTXFileDialogType = ReturnType<typeof OpenPPTXFileDialog>;
