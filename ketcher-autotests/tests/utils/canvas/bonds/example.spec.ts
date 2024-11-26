export {};
// import { test } from '@playwright/test';
// import { drawElementByTitle, waitForPageInit, clickOnCanvas, } from '@utils';
// import {
//   getRightBondByAttributes,
//   getBottomBondByAttributes,
//   getTopBondByAttributes,
//   getLeftBondByAttributes,
//   getBondByIndex,
// } from '@utils/canvas/bonds';
// import {
//   getAtomByIndex,
//   getRightAtomByAttributes,
//   getBottomAtomByAttributes,
//   getTopAtomByAttributes,
//   getLeftAtomByAttributes,
// } from '@utils/canvas/atoms';
// import { BondType, ELEMENT_TITLE } from '@utils/canvas/types';

// const OFFSET_X = 300;
// const OFFSET_Y = 300;

// // ONLY FOR EXAMPLES, can be deleted later
// test(`BOND`, async ({ page }) => {
//   await waitForPageInit(page);
//   await drawElementByTitle(page, ELEMENT_TITLE.BENZENE, OFFSET_X, OFFSET_Y);

//   const searchedIndex = 2;
//   // type: 1 for single type: 2 for double,
//   const bondByIndex = await getBondByIndex(
//     page,
//     { type: BondType.HYDROGEN },
//     searchedIndex,
//   );
//   await clickOnCanvas(page, bondByIndex.x, bondByIndex.y);

//   const leftBond = await getLeftBondByAttributes(page, {
//     topology: 1,
//     type: BondType.DOUBLE,
//     sb: 2,
//     reactingCenterStatus: 2,
//   });
//   await clickOnCanvas(page, leftBond.x, leftBond.y);

//   const rBond = await getRightBondByAttributes(page, {
//     stereo: 2,
//     type: BondType.DATIVE,
//   });
//   await clickOnCanvas(page, rBond.x, rBond.y);

//   const bottomBond = await getBottomBondByAttributes(page, { sa: 1 });
//   await clickOnCanvas(page, bottomBond.x, bottomBond.y);

//   const topBond = await getTopBondByAttributes(page, { type: BondType.DOUBLE });
//   await clickOnCanvas(page, topBond.x, topBond.y);
// });

// test(`ATOM`, async ({ page }) => {
//   await waitForPageInit(page);
//   await drawElementByTitle(page, ELEMENT_TITLE.BENZENE, OFFSET_X, OFFSET_Y);

//   const firstAtom = await getAtomByIndex(page, { label: 'C', valence: 1 }, 0);
//   await clickOnCanvas(page, firstAtom.x, firstAtom.y);

//   const leftAtom = await getLeftAtomByAttributes(page, {
//     stereoParity: 1,
//   });
//   await clickOnCanvas(page, leftAtom.x, leftAtom.y);

//   const rightAtom = await getRightAtomByAttributes(page, {
//     exactChangeFlag: 2,
//     hCount: 1,
//     charge: 2,
//   });
//   await clickOnCanvas(page, rightAtom.x, rightAtom.y);

//   const bottomAtom = await getBottomAtomByAttributes(page, { charge: 1 });
//   await clickOnCanvas(page, bottomAtom.x, bottomAtom.y);

//   const topAtom = await getTopAtomByAttributes(page, {
//     substitutionCount: 1,
//     valence: 3,
//   });
//   await clickOnCanvas(page, topAtom.x, topAtom.y);
// });
