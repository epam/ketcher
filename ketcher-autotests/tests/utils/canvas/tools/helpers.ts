/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import { clickOnCanvas, SequenceType, waitForRender } from '@utils';
import { selectButtonByTitle } from '@utils/clicks/selectButtonByTitle';
import { LeftPanelButton, RingButton, TopPanelButton } from '@utils/selectors';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { keyboardTypeOnCanvas } from '@utils/keyboard/index';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { TopLeftToolbar } from '@tests/pages/common/TopLeftToolbar';

/**
 *  Select button from left panel
 * Usage: await selectTool(LeftPanelButton.HandTool, page)
 */
export async function selectTool(type: LeftPanelButton, page: Page) {
  await selectButtonByTitle(type, page);
}

/**
 * Select button from top panel
 * Usage: await selectAction(TopPanelButton.Open, page)
 */
export async function selectAction(type: TopPanelButton, page: Page) {
  await selectButtonByTitle(type, page);
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

export async function selectRectangleArea(
  page: Page,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
) {
  await CommonLeftToolbar(page).selectAreaSelectionTool(
    SelectionToolType.Rectangle,
  );
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
  const leftPanelButton = page
    .locator(`button[title*="${buttonName}"]`)
    .filter({ has: page.locator(':visible') });
  await leftPanelButton.click();
}

export async function selectButtonById(buttonId: 'OK', page: Page) {
  const element = page.getByTestId(buttonId);
  await element.click();
}

export async function saveStructureWithReaction(
  page: Page,
  format?: MoleculesFileFormatType,
) {
  await TopLeftToolbar(page).saveFile();
  if (format) {
    await SaveStructureDialog(page).chooseFileFormat(format);
  }
  await SaveStructureDialog(page).save();
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
  const saveToTemplatesButton = SaveStructureDialog(page).saveToTemplatesButton;

  await TopLeftToolbar(page).saveFile();
  await saveToTemplatesButton.click();
  await page.getByPlaceholder('template').click();
  await page.getByPlaceholder('template').fill(templateName);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
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
