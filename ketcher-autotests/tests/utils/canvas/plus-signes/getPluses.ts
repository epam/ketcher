import { Page } from '@playwright/test';
import { getLeftTopBarSize } from '../common/getLeftTopBarSize';
import { sortItems } from '../common/sortItems';
import { NO_STRUCTURE_AT_THE_CANVAS_ERROR } from '../constants';
import { PlusXy, SORT_TYPE } from '../types';

export async function getPlusesByIndex(
  page: Page,
  index: number,
  sortBy: SORT_TYPE = SORT_TYPE.ASC_X,
): Promise<PlusXy> {
  const { pluses, scale, offset } = await page.evaluate(() => {
    return {
      // eslint-disable-next-line no-unsafe-optional-chaining
      pluses: [...window.ketcher?.editor?.struct()?.rxnPluses?.values()],
      scale: window.ketcher?.editor?.options()?.scale,
      offset: window.ketcher?.editor?.options()?.offset,
    };
  });

  if (pluses.length === 0) {
    throw new Error(NO_STRUCTURE_AT_THE_CANVAS_ERROR);
  }
  const { leftBarWidth, topBarHeight } = await getLeftTopBarSize(page);
  const coords = pluses.map((plus) => {
    return {
      ...plus,
      x: plus.pp.x * scale + offset.x + leftBarWidth,
      y: plus.pp.y * scale + offset.y + topBarHeight,
    };
  });

  return sortItems(sortBy, coords)[index];
}

export async function clickOnPlus(page: Page, index: number) {
  const { x, y } = await getPlusesByIndex(page, index);
  await page.mouse.click(x, y);
}
