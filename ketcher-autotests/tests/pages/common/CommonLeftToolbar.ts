import { type Page } from '@playwright/test';
import { waitForRender } from '@utils/common/loaders/waitForRender';
import { SelectionToolType } from '../constants/areaSelectionTool/Constants';
import {
  MacroBondType,
  MicroBondType,
} from '../constants/bondSelectionTool/Constants';

export const commonLeftToolbarLocators = (page: Page) => ({
  handToolButton: page.getByTestId('hand'),
  areaSelectionDropdownButton: page.getByTestId('select-rectangle'),
  areaSelectionDropdownExpandButton: page
    .getByTestId('select-drop-down-button')
    .getByTestId('dropdown-expand'),
  eraseButton: page.getByTestId('erase'),
  bondSelectionDropdownButton: page.getByTestId('bonds-drop-down-button'),
  bondSelectionDropdownExpandButton: page
    .getByTestId('bonds-drop-down-button')
    .getByTestId('dropdown-expand'),
});

export async function selectHandTool(page: Page) {
  const handToolButton = commonLeftToolbarLocators(page).handToolButton;
  await handToolButton.click();
}

export async function selectAreaSelectionTool(
  page: Page,
  toolType: SelectionToolType,
) {
  const areaSelectionDropdownButton =
    commonLeftToolbarLocators(page).areaSelectionDropdownButton;
  const areaSelectionDropdownExpandButton =
    commonLeftToolbarLocators(page).areaSelectionDropdownExpandButton;

  if (await areaSelectionDropdownExpandButton.isVisible()) {
    // Here we are in the micro mode
    await areaSelectionDropdownExpandButton.click();
    await page.getByTestId(toolType).first().click();
  } else {
    // Here we are in the macro mode, only one tool is available
    await areaSelectionDropdownButton.click();
  }
}

export async function selectEraseTool(page: Page) {
  const eraseToolButton = commonLeftToolbarLocators(page).eraseButton;
  await waitForRender(page, async () => {
    await eraseToolButton.click();
  });
}

export async function expandBondSelectionDropdown(page: Page) {
  const bondSelectionDropdownExpandButton =
    commonLeftToolbarLocators(page).bondSelectionDropdownExpandButton;
  await selectHandTool(page);
  const bondSelectionDropdownButton =
    commonLeftToolbarLocators(page).bondSelectionDropdownButton;
  await bondSelectionDropdownButton.click({ force: true });
  await bondSelectionDropdownButton.click({ force: true });

  if (await bondSelectionDropdownExpandButton.isVisible()) {
    // alternative way to open the dropdown
    await bondSelectionDropdownExpandButton.click({ force: true });
  }
}

export async function bondSelectionTool(
  page: Page,
  bondType: MacroBondType | MicroBondType,
) {
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      await expandBondSelectionDropdown(page);
      await page.getByTestId(bondType).first().click({ force: true });
      return;
    } catch (error) {
      attempts++;
      console.warn('Unable to click on the bond type button, retrying...');
    }
  }
}
