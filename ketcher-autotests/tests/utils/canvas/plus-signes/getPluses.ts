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
    const editor = window.ketcher?.editor;
    const struct =
      typeof editor?.struct === 'function' ? editor.struct() : null;
    const options =
      typeof editor?.options === 'function' ? editor.options() : null;
    const plusesIterator = struct?.rxnPluses?.values();

    return {
      pluses: plusesIterator ? [...plusesIterator] : [],
      scale: options?.scale ?? null,
      offset: options?.offset ?? null,
    };
  });

  if (pluses.length === 0) {
    throw new Error(NO_STRUCTURE_AT_THE_CANVAS_ERROR);
  }
  if (scale === null || offset === null) {
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
