// /* eslint-disable no-magic-numbers */
// import { Page, chromium, test } from '@playwright/test';
// import {
//   takeEditorScreenshot,
//   selectClearCanvasTool,
//   openFileAndAddToCanvasMacro,
//   moveMouseAway,
//   dragMouseTo,
//   waitForKetcherInit,
//   waitForIndigoToLoad,
// } from '@utils';
// import {
//   turnOnMacromoleculesEditor,
//   zoomWithMouseWheel,
// } from '@utils/macromolecules';
// import { bondTwoMonomersPointToPoint } from '@utils/macromolecules/polymerBond';

// let page: Page;
// test.beforeAll(async ({ browser }) => {
//   let sharedContext;
//   try {
//     sharedContext = await browser.newContext();
//   } catch (error) {
//     console.error('Error on creation browser context:', error);
//     console.log('Restarting browser...');
//     await browser.close();
//     browser = await chromium.launch();
//     sharedContext = await browser.newContext();
//   }

//   // Reminder: do not pass page as async
//   page = await sharedContext.newPage();

//   await page.goto('', { waitUntil: 'domcontentloaded' });
//   await waitForKetcherInit(page);
//   await waitForIndigoToLoad(page);
//   await turnOnMacromoleculesEditor(page);
// });

// test.afterEach(async () => {
//   await page.keyboard.press('Escape');
//   await page.keyboard.press('Control+0');
//   await selectClearCanvasTool(page);
// });

// test.afterAll(async ({ browser }) => {
//   const cntxt = page.context();
//   const brwsr = cntxt.browser();
//   console.log('Number of contexts: ', browser.contexts().length);
//   console.log('Number of pages: ', cntxt.pages().length);
//   await page.close();
//   await cntxt.close();
//   await browser.contexts().forEach((someContext) => {
//     someContext.close();
//   });
//   if (brwsr) await brwsr.close();
//   await browser.close();
// });

// test.describe('Connection rules for Phosphate monomers: ', () => {
//   test.setTimeout(300000);
//   test.describe.configure({ retries: 0 });

//   interface IMonomer {
//     fileName: string;
//     alias: string;
//     connectionPoints: { [connectionPointName: string]: string };
//   }

//   const phosphateMonomers: { [monomerName: string]: IMonomer } = {
//     '(R1) - Left only': {
//       fileName: 'KET/Phosphate-Templates/01 - (R1) - Left only.ket',
//       alias: '(R1)_-_Left_only',
//       connectionPoints: {
//         R1: 'R1',
//       },
//     },
//     '(R1,R2) - R3 gap': {
//       fileName: 'KET/Phosphate-Templates/04 - (R1,R2) - R3 gap.ket',
//       alias: '(R1,R2)_-_R3_gap',
//       connectionPoints: {
//         R1: 'R1',
//         R2: 'R2',
//       },
//     },
//     '(R1,R3) - R2 gap': {
//       fileName: 'KET/Phosphate-Templates/05 - (R1,R3) - R2 gap.ket',
//       alias: '(R1,R3)_-_R2_gap',
//       connectionPoints: {
//         R1: 'R1',
//         R3: 'R3',
//       },
//     },
//     '(R1,R2,R3)': {
//       fileName: 'KET/Phosphate-Templates/08 - (R1,R2,R3).ket',
//       alias: '(R1,R2,R3)',
//       connectionPoints: {
//         R1: 'R1',
//         R2: 'R2',
//         R3: 'R3',
//       },
//     },
//     '(R1,R3,R4)': {
//       fileName: 'KET/Phosphate-Templates/09 - (R1,R3,R4).ket',
//       alias: '(R1,R3,R4)',
//       connectionPoints: {
//         R1: 'R1',
//         R3: 'R3',
//         R4: 'R4',
//       },
//     },
//     '(R1,R2,R3,R4)': {
//       fileName: 'KET/Phosphate-Templates/12 - (R1,R2,R3,R4).ket',
//       alias: '(R1,R2,R3,R4)',
//       connectionPoints: {
//         R1: 'R1',
//         R2: 'R2',
//         R3: 'R3',
//         R4: 'R4',
//       },
//     },
//     '(R1,R3,R4,R5)': {
//       fileName: 'KET/Phosphate-Templates/13 - (R1,R3,R4,R5).ket',
//       alias: '(R1,R3,R4,R5)',
//       connectionPoints: {
//         R1: 'R1',
//         R3: 'R3',
//         R4: 'R4',
//         R5: 'R5',
//       },
//     },
//     '(R1,R2,R3,R4,R5)': {
//       fileName: 'KET/Phosphate-Templates/15 - (R1,R2,R3,R4,R5).ket',
//       alias: '(R1,R2,R3,R4,R5)',
//       connectionPoints: {
//         R1: 'R1',
//         R2: 'R2',
//         R3: 'R3',
//         R4: 'R4',
//         R5: 'R5',
//       },
//     },
//   };

//   async function bondTwoMonomersByPointToPoint(
//     page: Page,
//     leftBase: IMonomer,
//     rightBase: IMonomer,
//     leftBaseConnectionPoint?: string,
//     rightBaseConnectionPoint?: string,
//   ) {
//     await openFileAndAddToCanvasMacro(leftBase.fileName, page);
//     const leftBaseLocator = page
//       .getByText(leftBase.alias)
//       .locator('..')
//       .first();
//     await leftBaseLocator.hover();
//     await dragMouseTo(550, 350, page);
//     await moveMouseAway(page);

//     await openFileAndAddToCanvasMacro(rightBase.fileName, page);

//     const rightBaseLocator =
//       (await page.getByText(leftBase.alias).count()) > 1
//         ? page.getByText(rightBase.alias).nth(1).locator('..').first()
//         : page.getByText(rightBase.alias).locator('..').first();
//     await rightBaseLocator.hover();
//     // Do NOT put monomers to equel X or Y coordinates - connection line element become zero size (width or hight) and .hover() doesn't work
//     await dragMouseTo(650, 351, page);
//     await moveMouseAway(page);

//     await bondTwoMonomersPointToPoint(
//       page,
//       leftBaseLocator,
//       rightBaseLocator,
//       leftBaseConnectionPoint,
//       rightBaseConnectionPoint,
//     );
//     await zoomWithMouseWheel(page, -800);

//     const bondLine = page.locator('g[pointer-events="stroke"]').first();
//     await bondLine.hover();

//     await takeEditorScreenshot(page);
//   }

//   async function bondTwoMonomersByCenterToCenter(
//     page: Page,
//     leftMonomer: IMonomer,
//     rightMonomer: IMonomer,
//   ) {
//     await openFileAndAddToCanvasMacro(leftMonomer.fileName, page);
//     const leftMonomerLocator = page
//       .getByText(leftMonomer.alias)
//       .locator('..')
//       .first();
//     await leftMonomerLocator.hover();
//     await dragMouseTo(550, 350, page);
//     await moveMouseAway(page);

//     await openFileAndAddToCanvasMacro(rightMonomer.fileName, page);

//     const rightMonomerLocator =
//       (await page.getByText(leftMonomer.alias).count()) > 1
//         ? page.getByText(rightMonomer.alias).nth(1).locator('..').first()
//         : page.getByText(rightMonomer.alias).locator('..').first();
//     await rightMonomerLocator.hover();
//     // Do NOT put monomers to equel X or Y coordinates - connection line element become zero size (width or hight) and .hover() doesn't work
//     await dragMouseTo(650, 351, page);
//     await moveMouseAway(page);

//     await bondTwoMonomersPointToPoint(
//       page,
//       leftMonomerLocator,
//       rightMonomerLocator,
//     );

//     if (await page.getByRole('dialog').isVisible()) {
//       const firstConnectionPointKeyForLeftMonomer = Object.keys(
//         leftMonomer.connectionPoints,
//       )[0];
//       const leftMonomerConnectionPoint =
//         leftMonomer.connectionPoints[firstConnectionPointKeyForLeftMonomer];
//       await page.getByTitle(leftMonomerConnectionPoint).first().click();

//       const firstConnectionPointKeyForRightMonomer = Object.keys(
//         rightMonomer.connectionPoints,
//       )[0];
//       const rightMonomerConnectionPoint =
//         rightMonomer.connectionPoints[firstConnectionPointKeyForRightMonomer];
//       (await page.getByTitle(rightMonomerConnectionPoint).count()) > 1
//         ? await page.getByTitle(rightMonomerConnectionPoint).nth(1).click()
//         : await page.getByTitle(rightMonomerConnectionPoint).first().click();

//       await page.getByTitle('Connect').first().click();
//     }

//     await zoomWithMouseWheel(page, -800);

//     const bondLine = page.locator('g[pointer-events="stroke"]').first();
//     await bondLine.hover();

//     await takeEditorScreenshot(page);
//   }

//   // test(`temporary test for debug purposes`, async () => {
//   //    await bondTwoMonomersByCenterToCenter(page, phosphateMonomers['(R1,R2,R3)'], phosphateMonomers['(R1,R2,R3)']);
//   //  });

//   Object.values(phosphateMonomers).forEach((leftBase) => {
//     Object.values(phosphateMonomers).forEach((rightBase) => {
//       /*
//        *  Test case: https://github.com/epam/ketcher/issues/3808 - Case 1
//        *  Description: Phosphate could be connected with the phosphate through R2-R1 as well as R1-R1 or R2-R2.
//        *               User should be asked which attachment points should be used to establish a bond.
//        * For each %phosphateType% from the library (phosphateMonomers)
//        *   For each %phosphateType2% from the library (phosphateMonomers)
//        *  1. Clear canvas
//        *  2. Load %phosphateType% and %phosphateType2% and put them on the canvas
//        *  3. Establish connection between %phosphateType%(center) and %phosphateType%(center)
//        *  4. Validate canvas (connection dialog should appear)
//        */
//       test(`Test case1: Center-to-center of ${leftBase.alias} and ${rightBase.alias}`, async () => {
//         test.setTimeout(15000);
//         await bondTwoMonomersByCenterToCenter(page, leftBase, rightBase);
//       });
//     });
//   });

//   Object.values(phosphateMonomers).forEach((leftBase) => {
//     Object.values(phosphateMonomers).forEach((rightBase) => {
//       Object.values(leftBase.connectionPoints).forEach(
//         (leftBaseConnectionPoint) => {
//           Object.values(rightBase.connectionPoints).forEach(
//             (rightBaseConnectionPoint) => {
//               /*
//                *  Test case: https://github.com/epam/ketcher/issues/3808 - Case 2
//                *  Description: User can connect any phospshate to any phosphate using point-to-point way
//                * For each %phosphateType% from the library (phosphateMonomers)
//                *   For each %phosphateType2% from the library (phosphateMonomers)
//                *      For each %ConnectionPoint% (avaliable connections of %phosphateType%)
//                *         For each %ConnectionPoint2% (avaliable connections of %phosphateType2%) do:
//                *  1. Clear canvas
//                *  2. Load %phosphateType% and %phosphateType2% and put them on the canvas
//                *  3. Establish connection between %phosphateType%(%ConnectionPoint%) and %phosphateType%(%ConnectionPoint2%)
//                *  4. Validate canvas (connection should appear)
//                */
//               test(`Test case2: Connect ${leftBaseConnectionPoint} to ${rightBaseConnectionPoint} of ${leftBase.alias} and ${rightBase.alias}`, async () => {
//                 test.setTimeout(15000);
//                 await bondTwoMonomersByPointToPoint(
//                   page,
//                   leftBase,
//                   rightBase,
//                   leftBaseConnectionPoint,
//                   rightBaseConnectionPoint,
//                 );
//               });
//             },
//           );
//         },
//       );
//     });
//   });
// });
