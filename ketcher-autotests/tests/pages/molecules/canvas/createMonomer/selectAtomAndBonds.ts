import { Locator, Page } from '@playwright/test';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { clickOnCanvas } from '@utils/clicks';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

const canvasElementClickTimeout = 1000;
const centerCoordinateDivisor = 2;

export async function clickSelectableCanvasElement(
  page: Page,
  element: Locator,
) {
  try {
    await element.click({
      force: true,
      timeout: canvasElementClickTimeout,
    });
  } catch (error) {
    const box = await element.boundingBox();
    if (!box) {
      throw error;
    }

    await page.mouse.click(
      box.x + box.width / centerCoordinateDivisor,
      box.y + box.height / centerCoordinateDivisor,
    );
  }
}

export async function selectAtomAndBonds(
  page: Page,
  options: {
    atomIds?: number[];
    bondIds?: number[];
  },
) {
  await CommonLeftToolbar(page).handTool();
  await CommonLeftToolbar(page).areaSelectionTool();
  await clickOnCanvas(page, 0, 0);
  await page.keyboard.down('Shift');
  if (options.atomIds) {
    for (const atomId of options.atomIds) {
      await clickSelectableCanvasElement(
        page,
        getAtomLocator(page, { atomId }),
      );
    }
  }
  if (options.bondIds) {
    for (const bondId of options.bondIds) {
      await clickSelectableCanvasElement(
        page,
        getBondLocator(page, { bondId }),
      );
    }
  }
  await page.keyboard.up('Shift');
}
