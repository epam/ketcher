import { Page } from '@playwright/test';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { clickOnCanvas } from '@utils/clicks';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

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
      await getAtomLocator(page, { atomId }).click({
        force: true,
      });
    }
  }
  if (options.bondIds) {
    for (const bondId of options.bondIds) {
      await getBondLocator(page, { bondId }).click({
        force: true,
      });
    }
  }
  await page.keyboard.up('Shift');
}
