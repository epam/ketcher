/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import { getAtomsCoordinatesByAttributes } from '@utils/canvas/atoms';
import { AtomAttributes, AtomXy } from '@utils/canvas/types';
import { getLeftTopBarSize } from '@utils/canvas/common/getLeftTopBarSize';

/**
 * Filter atoms by its attributes and then get atom by index.
 * If there are no atoms after filtering throws error.
 * If index is incorrect throws error.
 * @param page - playwright page object
 * @param attributes - Atom attributes like label, charge, valence etc.
 * See AtomAttributes in @utils/canvas/types.ts for full list
 * @param index - number to search, starting from 0
 * @returns {AtomXy} - searched atom object + x, y coordinates
 * returned example {label:'C', charge: 0, valence: 1, x: 123, y: 432 }
 */
export async function getAtomByIndex(
  page: Page,
  attributes: AtomAttributes,
  index: number,
): Promise<AtomXy> {
  const result = await getAtomsCoordinatesByAttributes(page, attributes);

  if (index > result.length - 1 || index < 0) {
    throw Error(
      'Incorrect index, please be sure that you index is less than the length of the atoms',
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

export async function getAtomById(page: Page, id: number): Promise<AtomXy> {
  const { atoms, scale, offset, zoom } = await page.evaluate(() => {
    return {
      // eslint-disable-next-line no-unsafe-optional-chaining
      atoms: [...window.ketcher?.editor?.struct()?.atoms.entries()],
      scale: window.ketcher?.editor?.options()?.microModeScale,
      offset: window.ketcher?.editor?.options()?.offset,
      zoom: window.ketcher?.editor?.options()?.zoom,
    };
  });
  const atom = atoms.find(([atomId]) => atomId === id)?.[1];

  if (!atom) {
    throw Error('Incorrect atom id');
  }

  const { leftBarWidth, topBarHeight } = await getLeftTopBarSize(page);
  const body = (await page.locator('body').boundingBox()) as BoundingBox;
  const centerX = body.x + body?.width / 2;
  const centerY = body.y + body?.height / 2;

  const atomX = atom.pp.x * scale + offset.x + leftBarWidth;
  const atomY = atom.pp.y * scale + offset.y + topBarHeight;

  const zoomedX = centerX + (atomX - centerX) * zoom;
  const zoomedY = centerY + (atomY - centerY) * zoom;
  return {
    ...atom,
    x: zoomedX,
    y: zoomedY,
  };
}
