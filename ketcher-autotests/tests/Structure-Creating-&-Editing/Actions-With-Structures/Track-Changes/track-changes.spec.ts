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
    Description: Add Nitrogen atom to canvas 35 times and then press Undo 32 times
    */

    const atomType = AtomButton.Nitrogen;

    const addAtom = async (x: number, y: number) => {
      await selectAtomInToolbar(atomType, page);
      await page.mouse.click(x, y);
    };

    const numberOfRows = 6;
    const numberOfColumns = 8;
    const step = 100;
    const coordinates = [];

    for (let row = 0; row < numberOfRows; row++) {
      for (let column = 0; column < numberOfColumns; column++) {
        coordinates.push({ x: column * step, y: row * step });
      }
    }

    for (const { x, y } of coordinates) {
      await addAtom(x, y);
    }

    const maxUndoHistorySize = 32;
    for (let i = 0; i < maxUndoHistorySize; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
    await takeEditorScreenshot(page);

    const maxRedoHistorySize = 32;
    for (let i = 0; i < maxRedoHistorySize; i++) {
      await selectTopPanelButton(TopPanelButton.Redo, page);
    }
    await takeEditorScreenshot(page);
  });
});
