import { expect, test } from '@playwright/test';
import { selectAction, selectTool, takeEditorScreenshot } from '@utils/canvas';
import { getLeftAtomByAttributes } from '@utils/canvas/atoms';
import { getLeftBondByAttributes } from '@utils/canvas/bonds';
import { BondType } from '@utils/canvas/types';
import {
  openFileAndAddToCanvas,
  LeftPanelButton,
  TopPanelButton,
} from '@utils';
import { RxnArrow, RxnPlus } from 'ketcher-core';

function checkElementExists(element: RxnPlus | RxnArrow, errorMsg: string) {
  if (!element) {
    throw new Error(errorMsg);
  }
}

let point: { x: number; y: number };

test.describe('Erase Tool', () => {
  // TO DO: here in both tests we have some issue with openFileAndAddToCanvas() function it need proper investigation
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await openFileAndAddToCanvas(
      'Rxn-V2000/benzene-bromobutane-reaction.rxn',
      page,
    );

    await selectTool(LeftPanelButton.Erase, page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Erase atom and bond', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1363
    Description: Erase tool erases atom and bond
    */

    const atomSizeAfterErase = 21;
    const bondsSizeAfterErase = 18;

    point = await getLeftAtomByAttributes(page, { label: 'Br' });
    await page.mouse.click(point.x, point.y);

    const atomSize = await page.evaluate(() => {
      return window.ketcher.editor.struct().atoms.size;
    });
    expect(atomSize).toEqual(atomSizeAfterErase);

    point = await getLeftBondByAttributes(page, { type: BondType.DOUBLE });
    await page.mouse.click(point.x, point.y);

    const bondSize = await page.evaluate(() => {
      return window.ketcher.editor.struct().bonds.size;
    });
    expect(bondSize).toEqual(bondsSizeAfterErase);
  });

  test.fixme('Erase reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1364, 1365
    Description: Erase the reaction arrow and plus signs, undo and redo action
    */

    const arrowAfterDelete = 0;
    const reactionArrow = 1;
    const plusAfterDelete = 1;
    const reactionPlus = 2;
    const barHeight = 36;

    const { plusElement, scale } = await page.evaluate(() => {
      const [plusElement] = window.ketcher.editor.struct().rxnPluses.values();
      return {
        plusElement: plusElement || null,
        scale: window.ketcher.editor.options().scale,
      };
    });

    checkElementExists(plusElement, 'Plus not found');

    const plusPnt = {
      x: plusElement.pp.x * scale + barHeight,
      y: plusElement.pp.y * scale + barHeight,
    };

    await page.mouse.click(plusPnt.x, plusPnt.y);

    const plusDeleted = await page.evaluate(() => {
      return window.ketcher.editor.struct().rxnPluses.size;
    });

    expect(plusDeleted).toEqual(plusAfterDelete);

    await selectAction(TopPanelButton.Undo, page);

    const plusOnCanvas = await page.evaluate(() => {
      return window.ketcher.editor.struct().rxnPluses.size;
    });

    expect(plusOnCanvas).toEqual(reactionPlus);

    const { arrowElement } = await page.evaluate(() => {
      const [element] = window.ketcher.editor.struct().rxnArrows.values();
      return {
        arrowElement: element || null,
        scale: window.ketcher.editor.options().scale,
      };
    });

    checkElementExists(arrowElement, 'Arrow not found');

    const [pnt1, pnt2] = arrowElement.pos;
    const halfDivider = 2;

    const arrowMiddle: { x: number; y: number } = {
      x: (pnt1.x + pnt2.x) / halfDivider,
      y: (pnt1.y + pnt2.y) / halfDivider,
    };

    await page.keyboard.press('Control+a');
    await page.getByTestId('delete').click();

    await page.mouse.click(arrowMiddle.x, arrowMiddle.y);

    const arrowDeleted = await page.evaluate(() => {
      return window.ketcher.editor.struct().rxnArrows.size;
    });
    expect(arrowDeleted).toEqual(arrowAfterDelete);

    await selectAction(TopPanelButton.Undo, page);

    const arrowOnCanvas = await page.evaluate(() => {
      return window.ketcher.editor.struct().rxnArrows.size;
    });
    expect(arrowOnCanvas).toEqual(reactionArrow);
  });
});
