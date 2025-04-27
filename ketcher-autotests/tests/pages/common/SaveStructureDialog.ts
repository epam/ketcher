import { type Page } from '@playwright/test';
import { MoleculesFileFormatType } from '../constants/fileFormats/microFileFormats';
import { MacromoleculesFileFormatType } from '../constants/fileFormats/macroFileFormats';
import { delay } from '@utils/canvas';

export const saveStructureDialog = (page: Page) => ({
  fileNameEditbox: page.getByTestId('filename-input'),
  fileFormatDropdonwList: page.getByTestId('file-format-list').first(),

  // preview tab is available only in Micromolecules mode
  previewTab: page.getByTestId('preview-tab'),
  saveStructureTextarea: page.getByTestId('preview-area-text'),
  // warnings tab and warning text area is available only in Micromolecules mode
  warningsTab: page.getByTestId('warnings-tab'),
  warningTextarea: page.getByTestId('WarningTextArea'),
  copyToClipboardButton: page.getByTestId('copy-to-clipboard'),

  // Save to Templates button exists only in Micromolecules mode
  saveToTemplatesButton: page.getByTestId('save-to-templates-button'),

  saveButton: page.getByTestId('save-button'),
  cancelButton: page.getByTestId('cancel-button'),
  closeWindowButton: page.getByTestId('close-window-button'),
});

export async function chooseFileFormat(
  page: Page,
  fileFomat: MoleculesFileFormatType | MacromoleculesFileFormatType,
) {
  const delayTime = 0.15;
  const fileFormatDropdonwList =
    saveStructureDialog(page).fileFormatDropdonwList;

  await fileFormatDropdonwList.click();
  // waiting when the list of file formats is opened and operational (i.e. animation is finished)
  await delay(delayTime);

  await page.getByTestId(fileFomat).click({ force: true });
}

export async function setFileName(page: Page, fileName: string) {
  const fileNameEditbox = saveStructureDialog(page).fileNameEditbox;
  await fileNameEditbox.fill(fileName);
}

export async function getTextAreaValue(page: Page) {
  const saveStructureTextarea = saveStructureDialog(page).saveStructureTextarea;
  const loadingSpinner = page.locator('.loading-spinner');

  await saveStructureTextarea.waitFor({ state: 'visible' });
  if (await loadingSpinner.isVisible()) {
    await loadingSpinner.waitFor({ state: 'detached' });
  }
  return saveStructureTextarea.inputValue();
}

export async function getWarningTextAreaValue(page: Page) {
  const warningTextarea = saveStructureDialog(page).warningTextarea;
  const loadingSpinner = page.locator('.loading-spinner');

  await warningTextarea.waitFor({ state: 'visible' });
  if (await loadingSpinner.isVisible()) {
    await loadingSpinner.waitFor({ state: 'detached' });
  }
  return warningTextarea.inputValue();
}
