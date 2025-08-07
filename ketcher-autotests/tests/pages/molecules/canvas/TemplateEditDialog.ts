/* eslint-disable prettier/prettier */
/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import { waitForRender } from '@utils/common';

type TemplateEditDialogLocators = {
  dialog: Locator;
  closeWindowButton: Locator;
  moleculeNameInput: Locator;
  selectedAttachmentPoints: Locator;
  cancelButton: Locator;
  editButton: Locator;
  canvas: Locator;
};
export const TemplateEditDialog = (page: Page) => {
  const locators: TemplateEditDialogLocators = {
    dialog: page.getByTestId('attach-dialog'),
    closeWindowButton: page.getByTestId('close-window-button'),
    moleculeNameInput: page.getByTestId('name-input'),
    selectedAttachmentPoints: page.getByTestId('attach-output'),
    cancelButton: page.getByTestId('template-cancel-button'),
    editButton: page.getByTestId('template-edit-button'),
    canvas: page.getByTestId('canvas'),
  };

  return {
    ...locators,

    async close() {
      await locators.closeWindowButton.click();
    },
    async edit() {
      await waitForRender(page, async () => {
        await locators.editButton.click({ force: true });
      });
    },
    async cancel() {
      await locators.cancelButton.click({ force: true });
    },
    async setMoleculeName(name: string) {
      await locators.moleculeNameInput.fill(name);
    },
    async getMoleculeName(): Promise<string> {
      return await locators.moleculeNameInput.inputValue();
    },
  };
};

export type TemplateEditDialogType = ReturnType<typeof TemplateEditDialog>;
