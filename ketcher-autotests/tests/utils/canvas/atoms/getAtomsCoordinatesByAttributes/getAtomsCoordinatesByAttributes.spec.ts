import { expect, test } from '@playwright/test';
import { drawElementByTitle, waitForPageInit } from '@utils';
import { getAtomsCoordinatesByAttributes } from './getAtomsCoordinatesByAttributes';
import { SORT_TYPE, ELEMENT_TITLE } from '@utils/canvas/types';
import {
  STRUCTURE_NOT_FOUND_ERROR,
  NO_STRUCTURE_AT_THE_CANVAS_ERROR,
} from '@utils/canvas/constants';

/**
 * These tests are only need to debug getAtomsCoordinatesByAttributes function itself.
 * We do not need to run them on our environments.
 * Please DO NOT REMOVE IT.
 */

test.skip(`should return only coordinates for benzene ring in ascending order`, async ({
  page,
}) => {
  const offset = {
    x1: 50,
    y1: 50,
    x2: 300,
    y2: 300,
  };

  await waitForPageInit(page);
  await drawElementByTitle(page, ELEMENT_TITLE.HYDROGEN, offset.x1, offset.y1);
  await drawElementByTitle(page, ELEMENT_TITLE.BENZENE, offset.x2, offset.y2);

  const coords = await getAtomsCoordinatesByAttributes(
    page,
    {
      charge: 0,
      label: 'C',
      valence: 4,
    },
    SORT_TYPE.ASC_Y,
  );

  expect(coords[0].y < coords[1].y).toBeTruthy();
  expect(coords[1].y < coords[2].y).toBeTruthy();
  expect(coords[2].y < coords[3].y).toBeTruthy();
  expect(coords[3].y < coords[4].y).toBeTruthy();
  expect(coords[4].y < coords[5].y).toBeTruthy();
  const expectedLength = 6;

  expect(coords.length).toEqual(expectedLength);
  coords.forEach((coord) => {
    expect(coord).toEqual({
      ...coord,
      x: coord.x,
      y: coord.y,
    });
  });
});

test.skip(`should throw error in case we draw atom below left/top toolbars`, async ({
  page,
}) => {
  const offsetX = -10;
  const offsetY = -10;
  await waitForPageInit(page);

  // draw atom below from left/top toolbar
  await drawElementByTitle(page, ELEMENT_TITLE.HYDROGEN, offsetX, offsetY);

  await expect(async () => {
    await getAtomsCoordinatesByAttributes(page, {
      charge: 0,
      label: 'H',
      valence: 1,
    });
  }).rejects.toThrow(NO_STRUCTURE_AT_THE_CANVAS_ERROR);
});

test.skip(`should throw error in case we pass incorrect attributes to find atoms`, async ({
  page,
}) => {
  const offsetX = 10;
  const offsetY = 10;
  const incorrectAttributes = {
    charge: 0,
    label: 'H',
    valence: 532,
  };

  await waitForPageInit(page);

  // draw atom below from left/top toolbar
  await drawElementByTitle(page, ELEMENT_TITLE.HYDROGEN, offsetX, offsetY);

  await expect(async () => {
    await getAtomsCoordinatesByAttributes(page, incorrectAttributes);
  }).rejects.toThrow(STRUCTURE_NOT_FOUND_ERROR);
});
