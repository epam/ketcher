import { Locator, Page } from '@playwright/test';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { clickOnCanvas } from '@utils/clicks';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

const canvasElementClickTimeout = 1000;
const centerCoordinateDivisor = 2;

type ClickModifier = 'Alt' | 'Control' | 'ControlOrMeta' | 'Meta' | 'Shift';

export async function clickSelectableCanvasElement(
  page: Page,
  element: Locator,
  options: { modifiers?: ClickModifier[] } = {},
) {
  const { modifiers } = options;
  try {
    await element.click({
      force: true,
      timeout: canvasElementClickTimeout,
      ...(modifiers ? { modifiers } : {}),
    });
  } catch (error) {
    const box = await element.boundingBox();
    if (!box) {
      throw error;
    }

    for (const modifier of modifiers ?? []) {
      await page.keyboard.down(modifier);
    }
    try {
      await page.mouse.click(
        box.x + box.width / centerCoordinateDivisor,
        box.y + box.height / centerCoordinateDivisor,
      );
    } finally {
      for (const modifier of [...(modifiers ?? [])].reverse()) {
        await page.keyboard.up(modifier);
      }
    }
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
  if (options.bondIds) {
    for (const bondId of options.bondIds) {
      await clickSelectableCanvasElement(
        page,
        getBondLocator(page, { bondId }),
        { modifiers: ['Shift'] },
      );
    }
  }
  if (options.atomIds) {
    for (const atomId of options.atomIds) {
      await clickSelectableCanvasElement(
        page,
        getAtomLocator(page, { atomId }),
        { modifiers: ['Shift'] },
      );
    }
  }
}
