import { expect, test } from '@playwright/test';
import {
  drawElementByTitle,
  getLeftToolBarWidth,
  getTopToolBarHeight,
  waitForPageInit,
} from '@utils';
import { getFirstAtomCoordinatesByAttributes } from './getFirstAtomCoordinatesByAttributes';
import {
  STRUCTURE_NOT_FOUND_ERROR,
  NO_STRUCTURE_AT_THE_CANVAS_ERROR,
} from '@utils/canvas/constants';
import { ELEMENT_TITLE } from '@utils/canvas/types';

/**
 * These tests are only need to debug getFirstAtomCoordinatesByAttributes function itself.
 * We do not need to run them on our environments.
 * Please DO NOT REMOVE IT.
 */

test.skip(`
    atom setted in the left upper corner WITHOUT ANY offset from left / top toolbars; 
    getFirstAtomCoordinatesByAttributes should return exact position of the element`, async ({
  page,
}) => {
  const offsetAtomX = 0;
  const offsetAtomY = 0;

  await waitForPageInit(page);

  const leftBarWidth = await getLeftToolBarWidth(page);
  const topBarHeight = await getTopToolBarHeight(page);

  await drawElementByTitle(
    page,
    ELEMENT_TITLE.HYDROGEN,
    offsetAtomX,
    offsetAtomY,
  );

  const { x, y } = await getFirstAtomCoordinatesByAttributes(page, {
    charge: 0,
    label: 'H',
    valence: 1,
  });

  expect(x).toEqual(leftBarWidth);
  expect(y).toEqual(topBarHeight);
});

test.skip(`
    atom setted in the left upper corner WITH offset from left / top toolbars;
    getFirstAtomCoordinatesByAttributes should return exact position of the element INCLUDING offset of atom`, async ({
  page,
}) => {
  const offsetAtomX = 100;
  const offsetAtomY = 150;

  await waitForPageInit(page);

  const leftBarWidth = await getLeftToolBarWidth(page);
  const topBarHeight = await getTopToolBarHeight(page);

  await drawElementByTitle(
    page,
    ELEMENT_TITLE.HYDROGEN,
    offsetAtomX,
    offsetAtomY,
  );

  const { x, y } = await getFirstAtomCoordinatesByAttributes(page, {
    charge: 0,
    label: 'H',
    valence: 1,
  });

  expect(x).toEqual(leftBarWidth + offsetAtomX);
  expect(y).toEqual(topBarHeight + offsetAtomY);
});

test.skip(`should find first available atom for complex structures (with multiple atoms)`, async ({
  page,
}) => {
  const offsetAtomX = 100;
  const offsetAtomY = 150;

  await waitForPageInit(page);
  await drawElementByTitle(
    page,
    ELEMENT_TITLE.BENZENE,
    offsetAtomX,
    offsetAtomY,
  );

  const result = await getFirstAtomCoordinatesByAttributes(page, {
    label: 'C',
  });

  expect(result).toEqual({
    ...result,
    x: 101.39396608514265,
    y: 170.00297668698428,
  });
});

test.skip(`should find atom by custom attributes`, async ({ page }) => {
  const offsetAtomX = 100;
  const offsetAtomY = 150;

  await waitForPageInit(page);
  await drawElementByTitle(
    page,
    ELEMENT_TITLE.HYDROGEN,
    offsetAtomX,
    offsetAtomY,
  );

  const { x, y } = await getFirstAtomCoordinatesByAttributes(page, {
    label: 'H',
    exactChangeFlag: 0,
    explicitValence: -1,
    fragment: 0,
    hCount: 0,
    implicitH: 1,
    invRet: 0,
    isotope: 0,
  });

  expect(x).toBeDefined();
  expect(y).toBeDefined();
});

test.skip(`should throw an error STRUCTURE_NOT_FOUND_ERROR in case we pass empty object `, async ({
  page,
}) => {
  const offsetAtomX = 100;
  const offsetAtomY = 150;

  await waitForPageInit(page);
  await drawElementByTitle(
    page,
    ELEMENT_TITLE.HYDROGEN,
    offsetAtomX,
    offsetAtomY,
  );

  await expect(async () => {
    await getFirstAtomCoordinatesByAttributes(page, {});
  }).rejects.toThrow(STRUCTURE_NOT_FOUND_ERROR);
});

test.skip(`should throw an error in case canvas IS EMPTY`, async ({ page }) => {
  await waitForPageInit(page);

  await expect(async () => {
    await getFirstAtomCoordinatesByAttributes(page, {
      charge: 0,
      label: 'H',
      valence: 1,
    });
  }).rejects.toThrow(NO_STRUCTURE_AT_THE_CANVAS_ERROR);
});

// flaky test
test.skip(`should throw an error when the position of the atom below / above top / left toolbar`, async ({
  page,
}) => {
  // setting incorrect position of the atom (below left/top toolbar)
  const offsetAtomX = -10;
  const offsetAtomY = -10;
  await waitForPageInit(page);

  await drawElementByTitle(
    page,
    ELEMENT_TITLE.HYDROGEN,
    offsetAtomX,
    offsetAtomY,
  );

  await expect(async () => {
    await getFirstAtomCoordinatesByAttributes(page, {
      charge: 0,
      label: 'H',
      valence: 1,
    });
  }).rejects.toThrow(NO_STRUCTURE_AT_THE_CANVAS_ERROR);
});

test.skip(`should throw an error in case we pass incorrect attributes`, async ({
  page,
}) => {
  const offsetAtomX = 10;
  const offsetAtomY = 10;
  // setting incorrect attributes
  const incorrectAttributes = {
    charge: 0,
    label: 'H',
    valence: 4,
  };
  await waitForPageInit(page);

  await drawElementByTitle(
    page,
    ELEMENT_TITLE.HYDROGEN,
    offsetAtomX,
    offsetAtomY,
  );

  await expect(async () => {
    await getFirstAtomCoordinatesByAttributes(page, incorrectAttributes);
  }).rejects.toThrow(STRUCTURE_NOT_FOUND_ERROR);
});
