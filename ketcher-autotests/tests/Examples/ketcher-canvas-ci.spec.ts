import { test, expect } from '@playwright/test';
// import {
//   selectTopPanelButton,
//   openFile,
//   pressButton,
//   clickInTheMiddleOfTheScreen,
//   delay,
//   takeEditorScreenshot,
//   TopPanelButton,
// } from '@utils';

test.describe('Test CI', () => {
  //   test('Reagents molecule above arrow Open File RXN v3000 with reagent NH3 above arrow', async ({
  //     page,
  //   }) => {
  //     /*
  //       Test case: EPMLSOPKET-4680
  //       Description: File opens with the reagent NH3 on top of the arrow
  //     */
  //     await page.goto('');
  //     await selectTopPanelButton(TopPanelButton.Open, page);
  //     await openFile('benzene-arrow-benzene-reagent-nh3.rxn', page);
  //     await pressButton(page, 'Add to Canvas');

  //     await clickInTheMiddleOfTheScreen(page);
  //     await delay(3);
  //     await takeEditorScreenshot(page);
  //   });

  test('calculation', () => {
    expect(1 + 1).toBe(2);
  });
});
