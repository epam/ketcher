/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import {
  clickOnCanvas,
  MacromoleculesTopPanelButton,
  selectOption,
  SequenceType,
  waitForRender,
  waitForSpinnerFinishedWork,
} from '@utils';
import { selectButtonByTitle } from '@utils/clicks/selectButtonByTitle';
import { clickOnFileFormatDropdown } from '@utils/formats';
import {
  AtomButton,
  LeftPanelButton,
  MacromoleculesLeftPanelButton,
  RingButton,
  TopPanelButton,
} from '@utils/selectors';
import {
  selectOpenFileTool,
  selectSaveTool,
} from '@tests/pages/common/TopLeftToolbar';
import { selectAreaSelectionTool } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { keyboardTypeOnCanvas } from '@utils/keyboard/index';

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

export async function openLayoutModeMenu(page: Page) {
  const modeSelectorButton = page.getByTestId('layout-mode');
  await modeSelectorButton.click();
}

export async function hideLibrary(page: Page) {
  const hideLibraryButton = page.getByTestId('hide-monomer-library');
  const isVisible = await hideLibraryButton.isVisible();
  if (isVisible) {
    await hideLibraryButton.click();
  }
}

export async function showLibrary(page: Page) {
  const showLibraryButton = page.getByTestId('show-monomer-library');
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
  await clickOnCanvas(page, 200, 200, { button: 'right' });
  await page.getByTestId('start_new_sequence').click();
  await clickOnCanvas(
    page,
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

export async function switchSequenceEnteringButtonType(
  page: Page,
  sequenceEnteringType: SequenceType,
) {
  await page.getByTestId(`${sequenceEnteringType}Btn`).click();
}

export async function selectFlexLayoutModeTool(page: Page) {
  await openLayoutModeMenu(page);
  const flexModeButton = page.getByTestId('flex-layout-mode').first();

  await flexModeButton.waitFor({ state: 'visible' });
  await flexModeButton.click();
}

export async function selectImageTool(page: Page) {
  const bondToolButton = page.getByTestId('images');
  await bondToolButton.click();
}

export async function openStructurePasteFromClipboard(page: Page) {
  await selectOpenFileTool(page);
  const pasteFromClipboardButton = page.getByTestId(
    'paste-from-clipboard-button',
  );
  await pasteFromClipboardButton.click();
}

export async function selectRectangleArea(
  page: Page,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
) {
  await selectAreaSelectionTool(page, SelectionToolType.Rectangle);
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

export async function selectButtonById(buttonId: 'OK', page: Page) {
  const element = page.getByTestId(buttonId);
  await element.click();
}

export async function saveStructureWithReaction(page: Page, format?: string) {
  await selectSaveTool(page);
  if (format) {
    await clickOnFileFormatDropdown(page);
    await selectOption(page, format);
  }
  await page.getByRole('button', { name: 'Save', exact: true }).click();
}

export async function typeAllEnglishAlphabet(page: Page) {
  await keyboardTypeOnCanvas(page, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
}

export async function typeRNADNAAlphabet(page: Page) {
  await keyboardTypeOnCanvas(page, 'ATGCU');
}

export async function typePeptideAlphabet(page: Page) {
  await keyboardTypeOnCanvas(page, 'ACDEFGHIKLMNPQRSTVWY');
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
  await selectSaveTool(page);
  await page.getByRole('button', { name: 'Save to Templates' }).click();
  await page.getByPlaceholder('template').click();
  await page.getByPlaceholder('template').fill(templateName);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
}

export async function selectFormatForSaving(page: Page, templateName: string) {
  await page.getByRole('option', { name: templateName }).click();
}

export async function clickOnSaveFileAndOpenDropdown(page: Page) {
  await selectSaveTool(page);
  await clickOnFileFormatDropdown(page);
}

export async function openSettings(page: Page) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  // Wait while system loads list of values (i.e. Arial in particular) in Font combobox
  await page.waitForSelector('div[role="combobox"]', {
    state: 'attached',
  });
  await page.waitForSelector('div[role="combobox"]:has-text("Arial")', {
    timeout: 5000,
  });
}

export async function openStereochemistrySettingsSection(page: Page) {
  await page.getByText('Stereochemistry', { exact: true }).click();
}

export async function switchIgnoreTheChiralFlag(page: Page) {
  await page
    .locator('label')
    .filter({ hasText: 'Ignore the chiral flag' })
    .getByTestId('undefined-input-span')
    .locator('span')
    .click();
}

export async function openBondsSettingsSection(page: Page) {
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

export async function getBondLengthValue(page: Page): Promise<string | null> {
  return await page
    .locator('fieldset')
    .filter({ hasText: 'Aromatic Bonds as circleBond' })
    .getByRole('textbox')
    .first()
    .inputValue();
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

export async function scrollToDownInSetting(page: Page) {
  const scrollToDown = page.getByTestId('Options for Debugging-accordion');
  await scrollToDown.scrollIntoViewIfNeeded();
  await scrollToDown.hover({ force: true });
}

export async function selectZoomInTool(page: Page, count = 1) {
  await page.getByTestId('zoom-selector').click();
  for (let i = 0; i < count; i++) {
    await waitForRender(page, async () => {
      await selectButtonByTitle(MacromoleculesTopPanelButton.ZoomIn, page);
    });
  }
  await page.getByTestId('zoom-selector').click({ force: true });
  await page.getByTestId('zoom-in-button').waitFor({ state: 'detached' });
}

export async function selectZoomReset(page: Page) {
  await page.getByTestId('zoom-selector').click();
  await waitForRender(page, async () => {
    await selectButtonByTitle(MacromoleculesTopPanelButton.ZoomReset, page);
  });
  await page.getByTestId('zoom-selector').click({ force: true });
  await page.getByTestId('reset-zoom-button').waitFor({ state: 'detached' });
}

export async function selectZoomOutTool(page: Page, count = 1) {
  await page.getByTestId('zoom-selector').click();
  for (let i = 0; i < count; i++) {
    await waitForRender(page, async () => {
      await selectButtonByTitle(MacromoleculesTopPanelButton.ZoomOut, page);
    });
  }
  await page.getByTestId('zoom-selector').click({ force: true });
  await page.getByTestId('zoom-out-button').waitFor({ state: 'detached' });
}

export async function selectAddRemoveExplicitHydrogens(page: Page) {
  await waitForSpinnerFinishedWork(page, async () => {
    await selectTopPanelButton(TopPanelButton.toggleExplicitHydrogens, page);
  });
}
