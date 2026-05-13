import { Page } from '@playwright/test';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { clickLocatorCenter, clickOnCanvas } from '@utils/clicks';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

async function shiftClickLocatorCenter(
  page: Page,
  locator: ReturnType<typeof getAtomLocator | typeof getBondLocator>,
) {
  await page.keyboard.down('Shift');
  try {
    await clickLocatorCenter(page, locator);
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
