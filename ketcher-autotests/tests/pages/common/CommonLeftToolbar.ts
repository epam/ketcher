import { type Page } from '@playwright/test';
import { waitForRender } from '@utils/common/loaders/waitForRender';
import { SelectionToolType } from '../constants/selectionTool/Constants';

export const commonLeftToolbarLocators = (page: Page) => ({
  // LeftPanelButton.HandTool
  handToolButton: page.getByTestId('hand'),
  areaSelectionDropdownButton: page.getByTestId('select-rectangle'),
  areaSelectionDropdownExpandButton: page
    .getByTestId('select-drop-down-button')
    .getByTestId('dropdown-expand'),
  eraseButton: page.getByTestId('erase'),
  // bonds-in-toolbar - micro
  // bonds-drop-down-button - macro

  // bond-tool-submenu - macro
  bondSelector: page.getByTestId('undo'),
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
  const bondToolButton = commonLeftToolbarLocators(page).eraseButton;
  await waitForRender(page, async () => {
    await bondToolButton.click();
  });
}
