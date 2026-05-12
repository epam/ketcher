import { Locator, Page } from '@playwright/test';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { clickOnCanvas } from '@utils/clicks';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

const HALF = 2;

async function getSvgElementScreenCenter(
  locator: Locator,
): Promise<{ x: number; y: number }> {
  await locator.waitFor({ state: 'attached' });
  return locator.evaluate((element, half) => {
    if (
      element instanceof SVGGraphicsElement &&
      element.ownerSVGElement &&
      element.getScreenCTM()
    ) {
      const box = element.getBBox();
      const matrix = element.getScreenCTM() as DOMMatrix;
      const point = element.ownerSVGElement.createSVGPoint();
      point.x = box.x + box.width / half;
      point.y = box.y + box.height / half;
      const screen = point.matrixTransform(matrix);
      return { x: screen.x, y: screen.y };
    }
    const box = element.getBoundingClientRect();
    return { x: box.x + box.width / half, y: box.y + box.height / half };
  }, HALF);
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
  try {
    if (options.atomIds) {
      for (const atomId of options.atomIds) {
        const center = await getSvgElementScreenCenter(
          getAtomLocator(page, { atomId }),
        );
        await page.mouse.click(center.x, center.y);
      }
    }
    if (options.bondIds) {
      for (const bondId of options.bondIds) {
        const center = await getSvgElementScreenCenter(
          getBondLocator(page, { bondId }),
        );
        await page.mouse.click(center.x, center.y);
      }
    }
  } finally {
    await page.keyboard.up('Shift');
  }
}
