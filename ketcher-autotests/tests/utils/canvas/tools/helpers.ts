/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import {
  MacromoleculesTopPanelButton,
  selectOption,
  SequenceType,
  waitForRender,
} from '@utils';
import { selectButtonByTitle } from '@utils/clicks/selectButtonByTitle';
import { clickOnFileFormatDropdown } from '@utils/formats';
import {
  AtomButton,
  BondIds,
  LeftPanelButton,
  MacromoleculesLeftPanelButton,
  RingButton,
  TopPanelButton,
} from '@utils/selectors';

/**
 * Selects an atom from Atom toolbar
 * Usage: await selectAtom(AtomButton.Carbon, page)
 **/
export async function selectAtom(type: AtomButton, page: Page) {
  await selectButtonByTitle(type, page);
}

/**
 *  Select button from left panel
 * Usage: await selectTool(LeftPanelButton.HandTool, page)
 */
export async function selectTool(
  type: LeftPanelButton | MacromoleculesTopPanelButton,
  page: Page,
) {
  await selectButtonByTitle(type, page);
}

/**
 * Select button from top panel
 * Usage: await selectAction(TopPanelButton.Open, page)
 */
export async function selectAction(type: TopPanelButton, page: Page) {
  await selectButtonByTitle(type, page);
}

/**
 * Usage: await selectAtomInToolbar(AtomButton.Carbon, page)
 * Select an atom from Atom toolbar
 * **/
export async function selectAtomInToolbar(atomName: AtomButton, page: Page) {
  const atomButton = page.locator(`button[title*="${atomName}"]`);
  await atomButton.click();
}

export async function selectSingleBondTool(page: Page) {
  const bondToolButton = page.getByTestId('single-bond');
  await bondToolButton.click();
}

export async function openLayoutModeMenu(page: Page) {
  const modeSelectorButton = await page.getByTestId('layout-mode');
  await modeSelectorButton.click();
}

export async function hideLibrary(page: Page) {
  const hideLibraryLink = await page.getByText('Hide');
  const isVisible = await hideLibraryLink.isVisible();
  if (isVisible) {
    await hideLibraryLink.click();
  }
}

export async function showLibrary(page: Page) {
  const showLibraryButton = await await page.getByText('Show Library');
  const isVisible = await showLibraryButton.isVisible();
  if (isVisible) {
    await showLibraryButton.click();
  }
}

export async function selectSnakeLayoutModeTool(page: Page) {
  await openLayoutModeMenu(page);
  const snakeModeButton = page.getByTestId('snake-layout-mode').first();

  await snakeModeButton.waitFor({ state: 'visible' });
  await snakeModeButton.click();
}

export async function selectSequenceLayoutModeTool(page: Page) {
  await openLayoutModeMenu(page);
  const sequenceModeButton = page.getByTestId('sequence-layout-mode').first();

  await sequenceModeButton.waitFor({ state: 'visible' });
  await sequenceModeButton.click();
}

export async function startNewSequence(page: Page) {
  const newSequenceCellCoordinates = { x: 50, y: 50 };
  await page.mouse.click(200, 200, { button: 'right' });
  await page.getByTestId('start_new_sequence').click();
  await page.mouse.click(
    newSequenceCellCoordinates.x,
    newSequenceCellCoordinates.y,
  );
}

export async function switchSequenceEnteringType(
  page: Page,
  sequenceEnteringType: SequenceType,
) {
  await page.getByTestId('sequence-type-dropdown').click();
  await page.getByRole('option').getByText(sequenceEnteringType).click();
}

export async function selectFlexLayoutModeTool(page: Page) {
  await openLayoutModeMenu(page);
  const flexModeButton = page.getByTestId('flex-layout-mode').first();

  await flexModeButton.waitFor({ state: 'visible' });
  await flexModeButton.click();
}

export async function selectEraseTool(page: Page) {
  const bondToolButton = page.getByTestId('erase');
  await bondToolButton.click();
}

export async function selectImageTool(page: Page) {
  const bondToolButton = page.getByTestId('images');
  await bondToolButton.click();
}

export async function selectClearCanvasTool(page: Page) {
  const bondToolButton = page.getByTestId('clear-canvas');
  await bondToolButton.click();
}

export async function selectRectangleSelectionTool(page: Page) {
  const bondToolButton = page.getByTestId('select-rectangle');
  await bondToolButton.click();
}

export async function selectOpenTool(page: Page) {
  const openToolButton = page.getByTestId('open-button');
  await openToolButton.click();
}

export async function selectSaveTool(page: Page) {
  const saveToolButton = page.getByTestId('save-button');
  await saveToolButton.click();
}

export async function openStructurePasteFromClipboard(page: Page) {
  const bondToolButton = page.getByTestId('open-button');
  await bondToolButton.click();
  const pasteFromClipboardButton = page.getByTestId(
    'paste-from-clipboard-button',
  );
  await pasteFromClipboardButton.click();
}

// undo/redo heplers currently used for macromolecules editor because buttons are in different panel
export async function clickUndo(page: Page) {
  const undoButton = page.getByTestId('undo');
  await undoButton.click();
}

export async function clickRedo(page: Page) {
  const redoButton = page.getByTestId('redo');
  await redoButton.click();
}

export async function selectRectangleArea(
  page: Page,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
) {
  await selectRectangleSelectionTool(page);
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY);
  await page.mouse.up();
}

export async function selectTopPanelButton(
  buttonName: TopPanelButton,
  page: Page,
) {
  const topPanelButton = page.locator(`button[title*="${buttonName}"]`);
  await topPanelButton.click();
}

export async function selectRingButton(buttonName: RingButton, page: Page) {
  const bottomPanelButton = page.locator(`button[title*="${buttonName}"]`);
  await bottomPanelButton.click();
}

export async function selectLeftPanelButton(
  buttonName: LeftPanelButton,
  page: Page,
) {
  const leftPanelButton = page.locator(`button[title*="${buttonName}"]`);
  await leftPanelButton.click();
}

export async function selectMacromoleculesPanelButton(
  buttonName: MacromoleculesLeftPanelButton | MacromoleculesTopPanelButton,
  page: Page,
) {
  const topPanelButton = page.locator(`button[title*="${buttonName}"]`);
  await topPanelButton.click();
}

export async function selectButtonById(buttonId: BondIds | 'OK', page: Page) {
  const element = page.getByTestId(buttonId);
  await element.click();
}

export async function saveStructureWithReaction(page: Page, format?: string) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  if (format) {
    await clickOnFileFormatDropdown(page);
    await selectOption(page, format);
  }
  await page.getByRole('button', { name: 'Save', exact: true }).click();
}

export async function typeAllEnglishAlphabet(page: Page) {
  await page.keyboard.type('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
}

export async function typeRNADNAAlphabet(page: Page) {
  await page.keyboard.type('ATGCU');
}

export async function typePeptideAlphabet(page: Page) {
  await page.keyboard.type('ACDEFGHIKLMNPQRSTVWY');
}

export async function setZoomInputValue(page: Page, value: string) {
  await page.getByTestId('zoom-input').click();
  await page.getByTestId('zoom-value').fill(value);
  await page.keyboard.press('Enter');
}

export async function selectWithLasso(
  page: Page,
  startX: number,
  startY: number,
  coords: { x: number; y: number }[],
) {
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  for (const coord of coords) {
    await page.mouse.move(coord.x, coord.y);
  }
  await waitForRender(page, async () => {
    await page.mouse.up();
  });
}

export async function saveToTemplates(page: Page, templateName: string) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  await page.getByRole('button', { name: 'Save to Templates' }).click();
  await page.getByPlaceholder('template').click();
  await page.getByPlaceholder('template').fill(templateName);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
}

export async function bondsDefaultSettings(page: Page) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await page.getByText('Bonds', { exact: true }).click();
}

export async function setBondLengthOptionUnit(page: Page, unitName: string) {
  await page
    .locator('fieldset')
    .filter({ hasText: 'Aromatic Bonds as circleBond' })
    .getByRole('combobox')
    .first()
    .click();
  await page.getByTestId(unitName).click();
}

export async function setBondLengthValue(page: Page, value: string) {
  await page
    .locator('fieldset')
    .filter({ hasText: 'Aromatic Bonds as circleBond' })
    .getByRole('textbox')
    .first()
    .fill(value);
}

export async function setBondThicknessOptionUnit(page: Page, unitName: string) {
  await page
    .locator('fieldset')
    .filter({ hasText: 'Aromatic Bonds as circleBond' })
    .getByRole('combobox')
    .nth(1)
    .click();
  await page.getByTestId(unitName).click();
}

export async function setBondThicknessValue(page: Page, value: string) {
  await page
    .locator('fieldset')
    .filter({ hasText: 'Aromatic Bonds as circleBond' })
    .getByRole('textbox')
    .nth(2)
    .fill(value);
}

export async function setStereoBondWidthOptionUnit(
  page: Page,
  unitName: string,
) {
  await page
    .locator('fieldset')
    .filter({ hasText: 'Aromatic Bonds as circleBond' })
    .getByRole('combobox')
    .nth(2)
    .click();
  await page.getByTestId(unitName).click();
}

export async function setStereoBondWidthValue(page: Page, value: string) {
  await page
    .locator('fieldset')
    .filter({ hasText: 'Aromatic Bonds as circleBond' })
    .getByRole('textbox')
    .nth(3)
    .fill(value);
}

export async function setHashSpacingOptionUnit(page: Page, unitName: string) {
  await page
    .locator('fieldset')
    .filter({ hasText: 'Aromatic Bonds as circleBond' })
    .getByRole('combobox')
    .nth(3)
    .click();
  await page.getByTestId(unitName).click();
}

export async function setHashSpacingValue(page: Page, value: string) {
  await page
    .locator('fieldset')
    .filter({ hasText: 'Aromatic Bonds as circleBond' })
    .getByRole('textbox')
    .nth(4)
    .fill(value);
}

export async function setBondSpacingValue(page: Page, value: string) {
  await page.getByTestId('bondSpacing-input').fill(value);
}

export async function setFontSizeOptionUnit(page: Page, unitName: string) {
  await page
    .locator('div > .MuiInputBase-root > .MuiSelect-select')
    .first()
    .click();
  await page.getByTestId(unitName).click();
}

export async function setFontSizeValue(page: Page, value: string) {
  await page
    .locator('fieldset')
    .filter({ hasText: 'Reset to Select ToolAfter' })
    .getByRole('textbox')
    .nth(1)
    .fill(value);
}

export async function setSubFontSizeOptionUnit(page: Page, unitName: string) {
  await page
    .locator('div:nth-child(7) > div > .MuiInputBase-root > .MuiSelect-select')
    .click();
  await page.getByTestId(unitName).click();
}

export async function setSubFontSizeValue(page: Page, value: string) {
  await page
    .locator('fieldset')
    .filter({ hasText: 'Reset to Select ToolAfter' })
    .getByRole('textbox')
    .nth(2)
    .fill(value);
}

export async function setReactionMarginSizeOptionUnit(
  page: Page,
  unitName: string,
) {
  await page
    .locator('div:nth-child(8) > div > .MuiInputBase-root > .MuiSelect-select')
    .click();
  await page.getByTestId(unitName).click();
}

export async function setReactionMarginSizeValue(page: Page, value: string) {
  await page
    .locator('fieldset')
    .filter({ hasText: 'Reset to Select ToolAfter' })
    .getByRole('textbox')
    .nth(3)
    .fill(value);
}
