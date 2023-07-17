import { Page } from '@playwright/test';
import { Bond } from 'ketcher-core';
import { BondAttributes, SORT_TYPE, BondXy } from '@utils/canvas/types';
import { getLeftTopBarSize } from '@utils/canvas/common/getLeftTopBarSize';
import { findIntersectionFields } from '@utils/canvas/common/findIntersectionFields';
import { sortItems } from '@utils/canvas/common/sortItems';
import {
  NO_STRUCTURE_AT_THE_CANVAS_ERROR,
  STRUCTURE_NOT_FOUND_ERROR,
} from '@utils/canvas/constants';

/**
 * Common helper to calculate
 * left / right / top / bottom / byindex / first bonds functions
 * Throws error NO_STRUCTURE_AT_THE_CANVAS_ERROR
 * if the are no structures on the canvas
 * Throws STRUCTURE_NOT_FOUND_ERROR if can not find any bond
 * @param page - playwright page object
 * @param attrs - Bond attributes like type, angle, begin etc.
 * @param sortBy - sort type
 * @returns sorted bonds
 */
export async function getBondsCoordinatesByAttributes(
  page: Page,
  attrs: BondAttributes,
  sortBy: SORT_TYPE = SORT_TYPE.ASC_X,
): Promise<BondXy[] | []> {
  const { bonds, scale, offset } = await page.evaluate(() => {
    return {
      // eslint-disable-next-line no-unsafe-optional-chaining
      bonds: [...window.ketcher?.editor?.struct()?.bonds?.values()],
      scale: window.ketcher?.editor?.options()?.scale,
      offset: window.ketcher?.editor?.options()?.offset,
    };
  });

  if (bonds.length === 0) {
    throw new Error(NO_STRUCTURE_AT_THE_CANVAS_ERROR);
  }

  const targets: Bond[] = findIntersectionFields(attrs, bonds) as Bond[];

  if (targets.length) {
    const { leftBarWidth, topBarHeight } = await getLeftTopBarSize(page);
    const coords = targets.map((target) => {
      return {
        ...target,
        x: target.center.x * scale + offset.x + leftBarWidth,
        y: target.center.y * scale + offset.y + topBarHeight,
      };
    });

    return sortItems(sortBy, coords);
  }

  throw new Error(STRUCTURE_NOT_FOUND_ERROR);
}
