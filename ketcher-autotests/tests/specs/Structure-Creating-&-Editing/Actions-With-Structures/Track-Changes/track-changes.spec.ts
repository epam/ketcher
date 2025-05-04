import { test } from '@playwright/test';
import { takeEditorScreenshot, waitForPageInit, clickOnCanvas } from '@utils';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { rightToolbar } from '@tests/pages/molecules/RightToolbar';
import { TopLeftToolbar } from '@tests/pages/common/TopLeftToolbar';

test.describe('Track Changes', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Track 32 steps (Undo,Redo action)', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1989
    Description: Add Nitrogen atom to canvas 35 times and then press Undo 32 times
    */
    test.slow();
    const atomToolbar = rightToolbar(page);
    const atomType = Atom.Nitrogen;

    const addAtom = async (x: number, y: number) => {
      await atomToolbar.clickAtom(atomType);
      await clickOnCanvas(page, x, y);
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
      await TopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);

    const maxRedoHistorySize = 32;
    for (let i = 0; i < maxRedoHistorySize; i++) {
      await TopLeftToolbar(page).redo();
    }
    await takeEditorScreenshot(page);
  });
});
