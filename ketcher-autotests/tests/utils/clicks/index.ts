/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-magic-numbers */
import { Locator, Page } from '@playwright/test';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getBondByIndex } from '@utils/canvas/bonds';
import { BondType, takeEditorScreenshot } from '..';
import { selectButtonById } from '../canvas/tools/helpers';
import { AtomLabelType } from './types';
import {
  waitForItemsToMergeInitialization,
  waitForRender,
} from '@utils/common/loaders/waitForRender';
import { getAtomById } from '@utils/canvas/atoms/getAtomByIndex/getAtomByIndex';
import { getBondById } from '@utils/canvas/bonds/getBondByIndex/getBondByIndex';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { ReactionMappingType } from '@tests/pages/constants/reactionMappingTool/Constants';
import { KETCHER_CANVAS } from '@tests/pages/constants/canvas/Constants';
import { ClickTarget } from '@tests/pages/constants/contextMenu/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';

type BoundingBox = {
  width: number;
  height: number;
  y: number;
  x: number;
};

const HALF_DIVIDER = 2;

let cachedBodyCenter: { x: number; y: number } | null = null;

export async function getCachedBodyCenter(page: Page) {
  if (cachedBodyCenter) return cachedBodyCenter;

  await page.waitForSelector('body', { state: 'attached', timeout: 10000 });
  const box = await page.locator('body').boundingBox();
  if (!box) {
    throw new Error('Unable to get boundingBox for <body>');
  }

  cachedBodyCenter = {
    x: box.x + box.width / HALF_DIVIDER,
    y: box.y + box.height / HALF_DIVIDER,
  };

  return cachedBodyCenter;
}

export async function clickAfterItemsToMergeInitialization(
  page: Page,
  x: number,
  y: number,
  button: 'left' | 'right' = 'left',
) {
  await page.mouse.move(x, y);
  await waitForItemsToMergeInitialization(page);
  await page.mouse.down({
    button,
  });
  await page.mouse.up({
    button,
  });
}

export async function clickInTheMiddleOfTheScreen(
  page: Page,
  button: 'left' | 'right' = 'left',
  options: { waitForMergeInitialization: boolean } = {
    waitForMergeInitialization: false,
  },
) {
  const { x, y } = await getCachedBodyCenter(page);

  if (options.waitForMergeInitialization) {
    await waitForRender(page, async () => {
      await clickAfterItemsToMergeInitialization(page, x, y, button);
    });
  } else {
    await waitForRender(page, async () => {
      await page.mouse.click(x, y, { button });
    });
  }
}

export async function clickOnCanvas(
  page: Page,
  x: number,
  y: number,
  options: {
    /**
     * Defaults to `left`.
     */
    button?: 'left' | 'right' | 'middle';

    /**
     * defaults to 1. See [UIEvent.detail].
     */
    clickCount?: number;

    /**
     * Time to wait between `mousedown` and `mouseup` in milliseconds. Defaults to 0.
     */
    delay?: number;
    waitForRenderTimeOut?: number;
    /**
     *      * Time to wait canvas event for for waitForRenderTimeOut.
     */
    from?: 'pageTopLeft' | 'pageCenter' | 'canvasTopLeft' | 'canvasCenter';
  } = { from: 'canvasTopLeft' },
) {
  await waitForRender(
    page,
    async () => {
      const getCanvas = (page: Page) =>
        page
          .getByTestId(KETCHER_CANVAS)
          .filter({ has: page.locator(':visible') });
      const getRelativeAxisCenter = async (
        page: Page,
        canvas: any,
        fromCenter:
          | 'pageTopLeft'
          | 'pageCenter'
          | 'canvasTopLeft'
          | 'canvasCenter',
      ) => {
        switch (fromCenter) {
          case 'pageTopLeft':
            return { x: 0, y: 0 };
          case 'pageCenter':
            return await getCachedBodyCenter(page);
          case 'canvasTopLeft': {
            const canvasBox = (await canvas.boundingBox()) as BoundingBox;
            return { x: canvasBox.x, y: canvasBox.y };
          }
          case 'canvasCenter': {
            const canvasBox = (await canvas.boundingBox()) as BoundingBox;
            return {
              x: canvasBox.x + canvasBox.width / HALF_DIVIDER,
              y: canvasBox.y + canvasBox.height / HALF_DIVIDER,
            };
          }
          default:
            throw new Error();
        }
      };

      const relativeAxisCenter = await getRelativeAxisCenter(
        page,
        getCanvas(page),
        options.from ?? 'canvasTopLeft',
      );
      await page.mouse.click(
        relativeAxisCenter.x + x,
        relativeAxisCenter.y + y,
        options,
      );
    },
    options?.waitForRenderTimeOut,
  );
}

export async function getCoordinatesOfTheMiddleOfTheScreen(page: Page) {
  return await getCachedBodyCenter(page);
}

export async function getCoordinatesOfTheMiddleOfTheCanvas(page: Page) {
  const canvas = page
    .getByTestId(KETCHER_CANVAS)
    .filter({ has: page.locator(':visible') });
  await canvas.waitFor({
    state: 'attached',
    timeout: 10000,
  });
  const box = await canvas.boundingBox();
  if (!box) {
    throw new Error('Unable to get boundingBox for canvas');
  }
  return {
    x: box.width / HALF_DIVIDER,
    y: box.height / HALF_DIVIDER,
  };
}

export async function clickOnMiddleOfCanvas(page: Page) {
  const { x, y } = await getCoordinatesOfTheMiddleOfTheCanvas(page);
  await clickOnCanvas(page, x, y);
}

/* Usage: await pressButton(page, 'Add to Canvas')
  Click on specified button in Open Structure dialog
*/
export function pressButton(page: Page, name = '') {
  return page.getByRole('button', { name }).click();
}

export function selectOption(page: Page, name = '') {
  return page.getByRole('option', { name }).click();
}

export function selectOptionByText(page: Page, text = '') {
  return page.getByText(text, { exact: true }).click();
}

/* Usage: await pressTab(page, 'Functional Groups')
  Click on specified Tab in Templates dialog
*/
export function pressTab(page: Page, name = '') {
  return page.getByRole('tab', { name }).click();
}

export async function moveMouseToTheMiddleOfTheScreen(page: Page) {
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  await page.mouse.move(x, y);
}

export async function dragTo(
  page: Page,
  element: Locator,
  target: ClickTarget,
) {
  await element.hover({ force: true });
  await page.mouse.down();
  await waitForRender(page, async () => {
    if ('x' in target && 'y' in target) {
      await page.mouse.move(target.x, target.y);
    } else {
      const box = await target.boundingBox();
      if (box) {
        const targetCenterX = box.x + box.width / 2;
        const targetCenterY = box.y + box.height / 2;
        await page.mouse.move(targetCenterX, targetCenterY);
      }
    }
    await page.mouse.up();
  });
}

export async function dragMouseTo(x: number, y: number, page: Page) {
  await page.mouse.down();
  await page.mouse.move(x, y);
  await waitForRender(page, async () => {
    await page.mouse.up();
  });
}

export async function dragMouseAndMoveTo(page: Page, shift: number) {
  await moveMouseToTheMiddleOfTheScreen(page);
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  const coordinatesWithShift = x + shift;
  await dragMouseTo(coordinatesWithShift, y, page);
}

export async function clickByLink(page: Page, url: string) {
  await page.locator(`a[href="${url}"]`).first().click();
}

export async function clickOnBond(
  page: Page,
  bondType: BondType,
  bondNumber: number,
  buttonSelect?: 'left' | 'right' | 'middle',
) {
  const point = await getBondByIndex(page, { type: bondType }, bondNumber);
  await clickOnCanvas(page, point.x, point.y, {
    button: buttonSelect,
    from: 'pageTopLeft',
  });
}

export async function clickOnAtom(
  page: Page,
  atomLabel: AtomLabelType,
  atomNumber: number,
  buttonSelect?: 'left' | 'right' | 'middle',
) {
  const point = await getAtomByIndex(page, { label: atomLabel }, atomNumber);
  await clickOnCanvas(page, point.x, point.y, {
    button: buttonSelect,
    from: 'pageTopLeft',
  });
}

export async function clickOnAtomById(
  page: Page,
  atomId: number,
  buttonSelect?: 'left' | 'right' | 'middle',
) {
  const point = await getAtomById(page, atomId);
  await clickOnCanvas(page, point.x, point.y, {
    button: buttonSelect,
    from: 'pageTopLeft',
  });
}

export async function doubleClickOnAtom(
  page: Page,
  atomLabel: string,
  atomNumber: number,
) {
  const point = await getAtomByIndex(page, { label: atomLabel }, atomNumber);
  await waitForRender(page, async () => {
    await page.mouse.dblclick(point.x, point.y);
  });
}

export async function doubleClickOnBond(
  page: Page,
  bondType: BondType,
  bondNumber: number,
) {
  const point = await getBondByIndex(page, { type: bondType }, bondNumber);
  await waitForRender(page, async () => {
    await page.mouse.dblclick(point.x, point.y);
  });
}

export async function moveOnAtom(
  page: Page,
  atomLabel: string,
  atomNumber: number,
) {
  const point = await getAtomByIndex(page, { label: atomLabel }, atomNumber);
  await page.mouse.move(point.x, point.y);
}

export async function moveOnBond(
  page: Page,
  bondType: BondType,
  bondNumber: number,
) {
  const point = await getBondByIndex(page, { type: bondType }, bondNumber);
  await page.mouse.move(point.x, point.y);
}

export async function applyAutoMapMode(
  page: Page,
  mode: string,
  withScreenshot = true,
) {
  await CommonLeftToolbar(page).selectAreaSelectionTool();
  await LeftToolbar(page).selectReactionMappingTool(
    ReactionMappingType.ReactionAutoMapping,
  );
  await page.getByTestId('automap-mode-input-span').click();
  await selectOption(page, mode);
  await selectButtonById('OK', page);
  if (withScreenshot) {
    await takeEditorScreenshot(page);
  }
}
