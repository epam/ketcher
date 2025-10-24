import { Page, Locator } from '@playwright/test';
import { MoleculesFileFormatType } from '../constants/fileFormats/microFileFormats';
import { MacromoleculesFileFormatType } from '../constants/fileFormats/macroFileFormats';
import { delay } from '@utils/canvas';

type SaveStructureDialogLocators = {
  window: Locator;
  fileNameEditbox: Locator;
  fileFormatDropdownList: Locator;
  previewTab: Locator;
  saveStructureTextarea: Locator;
  warningsTab: Locator;
  warningTextarea: Locator;
  copyToClipboardButton: Locator;
  saveToTemplatesButton: Locator;
  saveButton: Locator;
  cancelButton: Locator;
  closeWindowButton: Locator;
};

export const SaveStructureDialog = (page: Page) => {
  const locators: SaveStructureDialogLocators = {
    window: page.getByTestId('save-structure-dialog'),
    fileNameEditbox: page.getByTestId('filename-input'),
    fileFormatDropdownList: page.getByTestId('file-format-list').first(),
    previewTab: page.getByTestId('Preview-tab'),
    saveStructureTextarea: page.getByTestId('preview-area'),
    warningsTab: page.getByTestId('Warnings-tab'),
    warningTextarea: page.getByTestId('WarningTextArea'),
    copyToClipboardButton: page.getByTestId('copy-to-clipboard'),
    saveToTemplatesButton: page.getByTestId('save-to-templates-button'),
    saveButton: page.getByTestId('save-button'),
    cancelButton: page.getByTestId('cancel-button'),
    closeWindowButton: page.getByTestId('close-window-button'),
  };

  return {
    ...locators,

    async chooseFileFormat(
      format: MoleculesFileFormatType | MacromoleculesFileFormatType,
    ) {
      const delayTime = 0.15;
      await locators.fileFormatDropdownList.click();
      await delay(delayTime);
      await page.getByTestId(format).click({ force: true });
      const loadingSpinner = page.getByTestId('loading-spinner');
      if (await loadingSpinner.isVisible()) {
        await loadingSpinner.waitFor({ state: 'hidden' });
      }
    },

    async setFileName(fileName: string) {
      await locators.fileNameEditbox.fill(fileName);
    },

    async getTextAreaValue(): Promise<string> {
      const loadingSpinner = page.getByTestId('loading-spinner');
      if (await loadingSpinner.isVisible()) {
        await loadingSpinner.waitFor({ state: 'hidden' });
      }
      await locators.saveStructureTextarea.waitFor({ state: 'visible' });
      return locators.saveStructureTextarea.inputValue();
    },

    async getWarningTextAreaValue(): Promise<string> {
      const loadingSpinner = page.getByTestId('loading-spinner');
      if (await loadingSpinner.isVisible()) {
        await loadingSpinner.waitFor({ state: 'hidden' });
      }
      await locators.warningTextarea.waitFor({ state: 'visible' });
      return locators.warningTextarea.inputValue();
    },

    async switchToWarningsTab() {
      const loadingSpinner = page.getByTestId('loading-spinner');
      if (await loadingSpinner.isVisible()) {
        await loadingSpinner.waitFor({ state: 'hidden' });
      }
      await locators.warningsTab.click();
      await locators.warningTextarea.first().waitFor({ state: 'visible' });
    },

    async switchToPreviewTab() {
      const loadingSpinner = page.getByTestId('loading-spinner');
      if (await loadingSpinner.isVisible()) {
        await loadingSpinner.waitFor({ state: 'hidden' });
      }
      await locators.previewTab.click();
      await locators.saveStructureTextarea.waitFor({ state: 'visible' });
    },

    async save() {
      await locators.saveButton.click();
    },

    async cancel() {
      await locators.cancelButton.click();
    },

    async close() {
      await locators.closeWindowButton.click();
    },
  };
};

export type SaveStructureDialogType = ReturnType<typeof SaveStructureDialog>;
