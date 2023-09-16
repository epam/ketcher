import { test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  takeEditorScreenshot,
  waitForPageInit,
  selectAtomInToolbar,
  AtomButton,
} from '@utils';

test.describe('Track Changes', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Track 32 steps (Undo,Redo action)', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1989
    Description: Add Nitrogen atom to canvas 32 times and then press Undo 32 times
    */

    const atomType = AtomButton.Nitrogen;

    // Function to add an atom at specific coordinates
    const addAtom = async (x: number, y: number) => {
      await selectAtomInToolbar(atomType, page);
      await page.mouse.click(x, y);
    };

    // Define an array of coordinates
    const coordinates = [
      { x: 100, y: 100 },
      { x: 150, y: 150 },
      { x: 200, y: 200 },
      { x: 250, y: 250 },
      { x: 300, y: 300 },
      { x: 350, y: 350 },
      { x: 400, y: 400 },
      { x: 450, y: 450 },
      { x: 500, y: 500 },
      { x: 500, y: 550 },
      { x: 650, y: 600 },
      { x: 600, y: 650 },
      { x: 750, y: 700 },
      { x: 700, y: 750 },
      { x: 800, y: 800 },
      { x: 850, y: 850 },
      { x: 900, y: 900 },
      { x: 950, y: 950 },
      { x: 100, y: 300 },
      { x: 150, y: 350 },
      { x: 200, y: 400 },
      { x: 250, y: 450 },
      { x: 300, y: 500 },
      { x: 350, y: 550 },
      { x: 400, y: 600 },
      { x: 450, y: 200 },
      { x: 500, y: 350 },
      { x: 550, y: 400 },
      { x: 600, y: 450 },
      { x: 650, y: 500 },
      { x: 700, y: 550 },
      { x: 750, y: 600 },
      { x: 800, y: 200 },
      { x: 800, y: 400 },
      { x: 950, y: 450 },
      { x: 720, y: 500 },
      { x: 650, y: 550 },
      { x: 530, y: 600 },
      { x: 760, y: 200 },
    ];

    // Add Nitrogen atom to canvas 34 times
    for (const { x, y } of coordinates) {
      await addAtom(x, y);
    }

    // Press Undo 32 times
    // eslint-disable-next-line no-magic-numbers
    for (let i = 0; i < 32; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
    await takeEditorScreenshot(page);
    // Press Redo 32 times
    // eslint-disable-next-line no-magic-numbers
    for (let i = 0; i < 32; i++) {
      await selectTopPanelButton(TopPanelButton.Redo, page);
    }
    await takeEditorScreenshot(page);
  });
});
