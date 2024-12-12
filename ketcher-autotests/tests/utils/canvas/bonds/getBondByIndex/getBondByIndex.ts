/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import { getBondsCoordinatesByAttributes } from '@utils/canvas/bonds';
import { getLeftTopBarSize } from '@utils/canvas/common/getLeftTopBarSize';
import { BondAttributes, BondXy } from '@utils/canvas/types';

/**
 * Filter bonds by its attributes and then get bond by index.
 * If there are no bonds after filtering throws error.
 * If index is incorrect throws error.
 * @param page - playwright page object
 * @param attributes - Bond attributes like type, angle, begin etc.
 * See BondAttributes in @utils/canvas/types.ts for full list
 * @param index - number to search, starting from 0
 * @returns {BondXy} - searched Bond object + x, y coordinates
 * returned example {type: 1, x: 123, y: 432 }
 */
export async function getBondByIndex(
  page: Page,
  attributes: BondAttributes,
  index: number,
): Promise<BondXy> {
  const result = await getBondsCoordinatesByAttributes(page, attributes);

  if (index > result.length - 1 || index < 0) {
    throw Error(
      'Incorrect index, please be sure that you index is less than the length of the bonds',
    );
  }

  return result[index];
}

type BoundingBox = {
  width: number;
  height: number;
  y: number;
  x: number;
};

export async function getBondById(page: Page, id: number): Promise<BondXy> {
  const { bonds, scale, offset, zoom } = await page.evaluate(() => {
    return {
      // eslint-disable-next-line no-unsafe-optional-chaining
      bonds: [...window.ketcher?.editor?.struct()?.bonds.entries()],
      scale: window.ketcher?.editor?.options()?.microModeScale,
      offset: window.ketcher?.editor?.options()?.offset,
      zoom: window.ketcher?.editor?.options()?.zoom,
    };
  });
  const bond = bonds.find(([bondId]) => bondId === id)?.[1];

  if (!bond) {
    throw Error('Incorrect bond id');
  }

  const { leftBarWidth, topBarHeight } = await getLeftTopBarSize(page);
  const body = (await page.locator('body').boundingBox()) as BoundingBox;
  const centerX = body.x + body?.width / 2;
  const centerY = body.y + body?.height / 2;

  const bondX = bond.center.x * scale + offset.x + leftBarWidth;
  const bondY = bond.center.y * scale + offset.y + topBarHeight;

  const zoomedX = centerX + (bondX - centerX) * zoom;
  const zoomedY = centerY + (bondY - centerY) * zoom;
  return {
    ...bond,
    x: zoomedX,
    y: zoomedY,
  };
}
