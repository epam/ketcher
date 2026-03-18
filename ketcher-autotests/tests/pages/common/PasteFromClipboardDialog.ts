/* eslint-disable no-inline-comments */
import { Page, Locator } from '@playwright/test';
import { MacroFileType } from '@utils/canvas/types';
import {
  SequenceMonomerType,
  PeptideLetterCodeType,
} from '../constants/monomers/Constants';
import {
  waitForLoad,
  waitForLoadAndRender,
} from '@utils/common/loaders/waitForLoad/waitForLoad';

type PasteFromClipboardDialogLocators = {
  addToCanvasButton: Locator;
  openAsNewButton: Locator;
  contentTypeSelector: Locator;
  monomerTypeSelector: Locator;
  peptideLettersCodeSelector: Locator;
  openStructureTextarea: Locator;
  closeWindowButton: Locator;
  cancelButton: Locator;
};

export const PasteFromClipboardDialog = (page: Page) => {
  const locators: PasteFromClipboardDialogLocators = {
    addToCanvasButton: page.getByTestId('add-to-canvas-button'),
    openAsNewButton: page.getByTestId('open-as-new-button'),
    contentTypeSelector: page.getByTestId('dropdown-select'),
    monomerTypeSelector: page.getByTestId('dropdown-select-type'),
    peptideLettersCodeSelector: page.getByTestId(
      'dropdown-select-peptide-letters-format',
    ),
    openStructureTextarea: page.getByTestId('open-structure-textarea'),
    closeWindowButton: page.getByTestId('close-window-button'),
    cancelButton: page.getByTestId('cancel-button'),
  };

  return {
    ...locators,

    async selectContentType(contentType: MacroFileType) {
      const contentTypeOption = page.getByText(contentType, { exact: true });
      await locators.contentTypeSelector.waitFor({ state: 'visible' });
      if (await contentTypeOption.isHidden()) {
        await locators.contentTypeSelector.click();
        const listbox = page.getByRole('listbox');
        await listbox.waitFor({ state: 'visible' });
        await contentTypeOption.click();
        if (await listbox.isVisible()) {
          await contentTypeOption.click(); /* retry */
        }
      }
    },

    async selectMonomerType(typeDropdownOption: SequenceMonomerType) {
      await locators.monomerTypeSelector.click();
      const menuLocator = page.locator('#menu-');
      await menuLocator.getByText(typeDropdownOption).click();
    },

    async selectPeptideLetterType(letterCode: PeptideLetterCodeType) {
      await locators.peptideLettersCodeSelector.click();
      const menuLocator = page.locator('#menu-');
      await menuLocator.getByText(letterCode).click();
    },

    async fillTextArea(text: string) {
      locators.openStructureTextarea.fill(text);
    },

    async addToCanvas(
      option: { errorMessageExpected: boolean } = {
        errorMessageExpected: false,
      },
    ) {
      if (option.errorMessageExpected) {
        await waitForLoad(page, async () => {
          await PasteFromClipboardDialog(page).addToCanvasButton.click();
        });
      } else {
        await waitForLoadAndRender(page, async () => {
          await PasteFromClipboardDialog(page).addToCanvasButton.click();
        });
      }
    },

    async openAsNew(
      option: { errorMessageExpected: boolean } = {
        errorMessageExpected: false,
      },
    ) {
      if (option.errorMessageExpected) {
        await waitForLoad(page, async () => {
          await PasteFromClipboardDialog(page).openAsNewButton.click();
        });
      } else {
        await waitForLoadAndRender(page, async () => {
          await PasteFromClipboardDialog(page).openAsNewButton.click();
        });
      }
    },

    async closeWindow() {
      await PasteFromClipboardDialog(page).closeWindowButton.click();
    },

    async cancel() {
      await PasteFromClipboardDialog(page).cancelButton.click();
    },
  };
};

export type PasteFromClipboardDialogType = ReturnType<
  typeof PasteFromClipboardDialog
>;
