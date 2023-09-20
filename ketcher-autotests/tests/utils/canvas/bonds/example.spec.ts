import { test } from '@playwright/test';
import { drawElementByTitle, waitForPageInit } from '@utils';
import {
  getRightBondByAttributes,
  getBottomBondByAttributes,
  getTopBondByAttributes,
  getLeftBondByAttributes,
  getBondByIndex,
} from '@utils/canvas/bonds';
import {
  getAtomByIndex,
  getRightAtomByAttributes,
  getBottomAtomByAttributes,
  getTopAtomByAttributes,
  getLeftAtomByAttributes,
} from '@utils/canvas/atoms';
import { BondType, ELEMENT_TITLE } from '@utils/canvas/types';

const OFFSET_X = 300;
const OFFSET_Y = 300;

// ONLY FOR EXAMPLES, can be deleted later
test.skip(`BOND`, async ({ page }) => {
  await waitForPageInit(page);
  await drawElementByTitle(page, ELEMENT_TITLE.BENZENE, OFFSET_X, OFFSET_Y);

  const searchedIndex = 2;
  // type: 1 for single type: 2 for double,
  const bondByIndex = await getBondByIndex(
    page,
    { type: BondType.HYDROGEN },
    searchedIndex,
  );
  await page.mouse.click(bondByIndex.x, bondByIndex.y);

  const leftBond = await getLeftBondByAttributes(page, {
    topology: 1,
    type: BondType.DOUBLE,
    sb: 2,
    reactingCenterStatus: 2,
  });
  await page.mouse.click(leftBond.x, leftBond.y);

  const rBond = await getRightBondByAttributes(page, {
    stereo: 2,
    type: BondType.DATIVE,
  });
  await page.mouse.click(rBond.x, rBond.y);

  const bottomBond = await getBottomBondByAttributes(page, { sa: 1 });
  await page.mouse.click(bottomBond.x, bottomBond.y);

  const topBond = await getTopBondByAttributes(page, { type: BondType.DOUBLE });
  await page.mouse.click(topBond.x, topBond.y);
});

test.skip(`ATOM`, async ({ page }) => {
  await waitForPageInit(page);
  await drawElementByTitle(page, ELEMENT_TITLE.BENZENE, OFFSET_X, OFFSET_Y);

  const firstAtom = await getAtomByIndex(page, { label: 'C', valence: 1 }, 0);
  await page.mouse.click(firstAtom.x, firstAtom.y);

  const leftAtom = await getLeftAtomByAttributes(page, {
    stereoParity: 1,
  });
  await page.mouse.click(leftAtom.x, leftAtom.y);

  const rightAtom = await getRightAtomByAttributes(page, {
    exactChangeFlag: 2,
    hCount: 1,
    charge: 2,
  });
  await page.mouse.click(rightAtom.x, rightAtom.y);

  const bottomAtom = await getBottomAtomByAttributes(page, { charge: 1 });
  await page.mouse.click(bottomAtom.x, bottomAtom.y);

  const topAtom = await getTopAtomByAttributes(page, {
    substitutionCount: 1,
    valence: 3,
  });
  await page.mouse.click(topAtom.x, topAtom.y);
});
