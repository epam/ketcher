/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import { takeEditorScreenshot, waitForRender } from '@utils';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
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
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Rectangle);
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY);
  await page.mouse.up();
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

export async function selectAndDeselectWithLasso(
  page: Page,
  startX: number,
  startY: number,
  coords: { x: number; y: number }[],
) {
  const steps = 14;
  const dx = 1;
  const dy = 1;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  for (const p of coords) {
    await page.mouse.move(p.x, p.y, { steps });
  }
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await page.mouse.move(startX + dx, startY + dy, { steps });
  for (const p of coords) {
    await page.mouse.move(p.x + dx, p.y + dy, { steps });
  }
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await page.mouse.up();
}

export async function saveToTemplates(page: Page, templateName: string) {
  await CommonTopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).saveToTemplates();
  await TemplateEditDialog(page).setMoleculeName(templateName);
  await TemplateEditDialog(page).save();
}
