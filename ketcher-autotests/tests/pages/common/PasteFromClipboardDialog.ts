import { type Page } from '@playwright/test';
import { MacroFileType } from '@utils/canvas/types';
import {
  SequenceMonomerType,
  PeptideLetterCodeType,
} from '../constants/monomers/Constants';

export const pasteFromClipboardDialog = (page: Page) => ({
  addToCanvasButton: page.getByTestId('add-to-canvas-button'),
  openAsNewButton: page.getByTestId('open-as-new-button'),

  // type selector exists only in Macromolecules mode
  contentTypeSelector: page.getByTestId('dropdown-select'),
  monomerTypeSelector: page.getByTestId('dropdown-select-type'),
  peptideLettersCodeSelector: page.getByTestId(
    'dropdown-select-peptide-letters-format',
  ),

  openStructureTextarea: page.getByTestId('open-structure-textarea'),
  closeWindowButton: page.getByTestId('close-window-button'),
  // Cancel exists only in Micromolecules mode
  cancelButton: page.getByTestId('cancel-button'),
});

export async function contentTypeSelection(
  page: Page,
  contentType: MacroFileType,
) {
  const contentTypeSelector =
    pasteFromClipboardDialog(page).contentTypeSelector;
  // waiting for type selection combobox to appear
  await contentTypeSelector.waitFor({ state: 'visible' });
  await contentTypeSelector.click();
  // waiting for list of formats to appear
  const listbox = page.getByRole('listbox');
  await listbox.waitFor({ state: 'visible' });
  await page.getByText(contentType).click();
  // trying to retry click if the listbox is still visible after the click (e.g. click was not successful)
  if (await listbox.isVisible()) {
    await page.getByText(contentType).click();
  }
}

export async function monomerTypeSelection(
  page: Page,
  typeDropdownOption: SequenceMonomerType,
) {
  const monomerTypeSelector =
    pasteFromClipboardDialog(page).monomerTypeSelector;

  await monomerTypeSelector.click();
  const menuLocator = page.locator('#menu-');
  await menuLocator.getByText(typeDropdownOption).click();
}

export async function peptideLetterTypeSelection(
  page: Page,
  peptideLetterCodeType: PeptideLetterCodeType,
) {
  const peptideLettersCodeSelector =
    pasteFromClipboardDialog(page).peptideLettersCodeSelector;

  await peptideLettersCodeSelector.click();
  const menuLocator = page.locator('#menu-');
  await menuLocator.getByText(peptideLetterCodeType).click();
}
