/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import { clickOnCanvas, SequenceType, waitForRender } from '@utils';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { keyboardTypeOnCanvas } from '@utils/keyboard/index';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';

export async function openLayoutModeMenu(page: Page) {
  const modeSelectorButton = page.getByTestId('layout-mode');
  await modeSelectorButton.click();
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

export async function selectButtonById(buttonId: 'OK', page: Page) {
  const element = page.getByTestId(buttonId);
  await element.click();
}

export async function saveStructureWithReaction(
  page: Page,
  format?: MoleculesFileFormatType,
) {
  await CommonTopLeftToolbar(page).saveFile();
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

  await CommonTopLeftToolbar(page).saveFile();
  await saveToTemplatesButton.click();
  await page.getByPlaceholder('template').click();
  await page.getByPlaceholder('template').fill(templateName);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
}
