import { Locator, Page } from '@playwright/test';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { clickOnCanvas } from '@utils/clicks';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

const HALF = 2;

async function clickSvgElementCenter(locator: Locator) {
  await locator.waitFor({ state: 'attached' });
  await locator.evaluate((element, half) => {
    const getElementCenter = () => {
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

        return point.matrixTransform(matrix);
      }

      const box = element.getBoundingClientRect();
      return {
        x: box.x + box.width / half,
        y: box.y + box.height / half,
      };
    };

    const { x, y } = getElementCenter();
    const mouseEventInit = {
      bubbles: true,
      cancelable: true,
      composed: true,
      button: 0,
      buttons: 1,
      clientX: x,
      clientY: y,
      shiftKey: true,
    };
    const pointerEventInit = {
      ...mouseEventInit,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
    };

    if (typeof PointerEvent !== 'undefined') {
      element.dispatchEvent(new PointerEvent('pointerdown', pointerEventInit));
    }
    element.dispatchEvent(new MouseEvent('mousedown', mouseEventInit));
    if (typeof PointerEvent !== 'undefined') {
      element.dispatchEvent(new PointerEvent('pointerup', pointerEventInit));
    }
    element.dispatchEvent(new MouseEvent('mouseup', mouseEventInit));
    element.dispatchEvent(new MouseEvent('click', mouseEventInit));
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
        await clickSvgElementCenter(getAtomLocator(page, { atomId }));
      }
    }
    if (options.bondIds) {
      for (const bondId of options.bondIds) {
        await clickSvgElementCenter(getBondLocator(page, { bondId }));
      }
    }
  } finally {
    await page.keyboard.up('Shift');
  }
}
