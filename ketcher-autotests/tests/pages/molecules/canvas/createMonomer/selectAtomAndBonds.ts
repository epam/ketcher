import { Locator, Page } from '@playwright/test';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { clickOnCanvas } from '@utils/clicks';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

const CENTER_DIVISOR = 2;

async function shiftClickLocatorCenter(page: Page, locator: Locator) {
  await locator.waitFor({ state: 'attached' });
  const boundingBox = await locator.boundingBox();

  if (!boundingBox) {
    throw new Error('Unable to get bounding box for selected canvas element');
  }

  await page.keyboard.down('Shift');
  try {
    await page.mouse.click(
      boundingBox.x + boundingBox.width / CENTER_DIVISOR,
      boundingBox.y + boundingBox.height / CENTER_DIVISOR,
    );
  } finally {
    await page.keyboard.up('Shift');
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
  if (options.atomIds) {
    for (const atomId of options.atomIds) {
      await shiftClickLocatorCenter(page, getAtomLocator(page, { atomId }));
    }
  }
  if (options.bondIds) {
    for (const bondId of options.bondIds) {
      await shiftClickLocatorCenter(page, getBondLocator(page, { bondId }));
    }
  }
}
