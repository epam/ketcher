/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import { waitForRender } from '@utils';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { keyboardTypeOnCanvas } from '@utils/keyboard/index';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { TemplateEditDialog } from '@tests/pages/molecules/canvas/TemplateEditDialog';

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
  const inputText = templateName;

  await CommonTopLeftToolbar(page).saveFile();
  await saveToTemplatesButton.click();
  await TemplateEditDialog(page).setMoleculeName(inputText);
  await TemplateEditDialog(page).save();
}
