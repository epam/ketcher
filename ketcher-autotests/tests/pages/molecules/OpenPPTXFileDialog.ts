import { Page, Locator } from '@playwright/test';

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
      await locators.addToCanvasButton.click();
    },

    async pressOpenAsNewProjectButton() {
      await locators.openAsNewProjectButton.click();
    },

    async pressCancelButton() {
      await locators.cancelButton.click();
    },
  };
};

export async function selectStructureInPPTXDialog(
  page: Page,
  id: number,
  action?: 'AddToCanvas' | 'OpenAsNewProject' | 'Cancel',
) {
  await page.getByTestId(`cdx-structure-${id}`).click();
  const dialog = OpenPPTXFileDialog(page);
  if (action === 'AddToCanvas') {
    await dialog.pressAddToCanvasButton();
  } else if (action === 'OpenAsNewProject') {
    await dialog.pressOpenAsNewProjectButton();
  } else if (action === 'Cancel') {
    await dialog.pressCancelButton();
  }
}

export type OpenPPTXFileDialogType = ReturnType<typeof OpenPPTXFileDialog>;
