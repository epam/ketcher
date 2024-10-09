/* eslint-disable no-magic-numbers */
import { test, Page } from '@playwright/test';
import {
  moveMouseAway,
  openFileAndAddToCanvasAsNewProjectMacro,
  selectClearCanvasTool,
  selectRectangleSelectionTool,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

test.beforeEach(async ({ page }) => {
  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);
});

async function hoverOverBond(page: Page, bondNumber: number) {
  await moveMouseAway(page);
  const bondLine = page.locator('g[pointer-events="stroke"]').nth(bondNumber);
  await bondLine.hover();
}

const fileNames: string[] = [
  'KET/Preview-For-Hovering-Over-Bond/Horizontal - Part1.ket',
  'KET/Preview-For-Hovering-Over-Bond/Horizontal - Part2.ket',
  'KET/Preview-For-Hovering-Over-Bond/Horizontal - Part3.ket',
];

// test('Hover mouse over each bond having select tool switched on', async ({
//   page,
// }) => {
//   /*
//         Test task: https://github.com/epam/ketcher/issues/5553
//         Description: Validate that hovering over the bond with the select tool highlights
//                      the monomers and the bond the same way it currently is highlighted for
//                      hovering over with the bond tool for every monomers pairs
//         Case:
//             1. Load pairs of monomers connected to each other (3 files)
//             2. Hover mouse over each bond having select tool switched on
//             2. Take screenshot of the canvas to compare it with example
//         */
//   test.slow();
//   await selectRectangleSelectionTool(page);

//   for (const fileWithPairs of fileNames) {
//     await openFileAndAddToCanvasAsNewProjectMacro(fileWithPairs, page);

//     // count number of bonds on the page
//     const elements = await page.$$('g[pointer-events="stroke"]');
//     const numberOfBonds = elements.length;

//     let bondNumber = 0;
//     for (bondNumber; bondNumber < numberOfBonds; bondNumber++) {
//       await hoverOverBond(page, bondNumber);
//       await takeEditorScreenshot(page, {
//         masks: [page.getByTestId('polymer-library-preview')],
//       });
//     }
//     await selectClearCanvasTool(page);
//   }
// });

test(
  '1. Validate that preview tooltip content is correct for every monomers pairs',
  { tag: ['@IncorrectResultBecauseOfBug'] },
  async ({ page }) => {
    /* 
        Test task: https://github.com/epam/ketcher/issues/5553
        Description: Validate that preview tooltip content is correct for every monomers pairs 
        Case:
            1. Load pairs of monomers connected to each other (3 files)
            2. Hover mouse over each bond having select tool switched on
            2. Take screenshot of the canvas to compare it with example
        
        IMPORTANT: Some tooltips are wrong because of bugs: 
        https://github.com/epam/ketcher/issues/5442, 
        https://github.com/epam/ketcher/issues/5443
        https://github.com/epam/ketcher/issues/5445
        Will require to update screens after fix
        */
    test.setTimeout(240000);
    await selectRectangleSelectionTool(page);

    for (const fileWithPairs of fileNames) {
      await openFileAndAddToCanvasAsNewProjectMacro(fileWithPairs, page);

      // count number of bonds on the page
      const elements = await page.$$('g[pointer-events="stroke"]');
      const numberOfBonds = elements.length;

      let bondNumber = 0;
      for (bondNumber; bondNumber < numberOfBonds; bondNumber++) {
        await hoverOverBond(page, bondNumber);
        await takeEditorScreenshot(page);
      }
      await selectClearCanvasTool(page);
    }
  },
);

test(
  '2. Validate preview tooltip positions in relation to the center of the bond',
  { tag: ['@IncorrectResultBecauseOfBug'] },
  async ({ page }) => {
    /* 
        Test task: https://github.com/epam/ketcher/issues/5553
        Description: 
            1. Validate that bond preview tooltip appear at in relation to the center of the bond and 
               if bond is vertical, the preview should appear on the left or on the right, depending on availability of space
            2. Validate that bond preview tooltip appear at in relation to the center of the bond and 
               if bond is horizontal, the preview should appear above or bellow, depending on availability of space.
        Case:
            1. Load test canvas with target bonds to check tooltip against
            2. Hover mouse over each bond
            2. Take screenshot of the canvas to compare it with example
        
        IMPORTANT: Some tooltips are wrong because of bugs: 
        https://github.com/epam/ketcher/issues/5407,
        https://github.com/epam/ketcher/issues/5557, 
        Will require to update screens after fix
        */

    await selectRectangleSelectionTool(page);

    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Preview-For-Hovering-Over-Bond/BondPreviewToolTipPositions.ket',
      page,
    );

    // count number of bonds on the page
    const elements = await page.$$('g[pointer-events="stroke"]');
    const numberOfBonds = elements.length;

    let bondNumber = 0;
    for (bondNumber; bondNumber < numberOfBonds; bondNumber++) {
      await hoverOverBond(page, bondNumber);
      await takeEditorScreenshot(page);
    }
  },
);
