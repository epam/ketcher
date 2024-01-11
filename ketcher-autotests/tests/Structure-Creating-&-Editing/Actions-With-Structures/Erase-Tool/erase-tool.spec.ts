import { test, expect } from '@playwright/test';
import {
  openFileAndAddToCanvas,
  TopPanelButton,
  takeEditorScreenshot,
  waitForPageInit,
  waitForRender,
  BondType,
  selectAction,
  takeLeftToolbarScreenshot,
  clickOnAtom,
  clickOnBond,
} from '@utils';
import { getLeftTopBarSize } from '@utils/canvas/common/getLeftTopBarSize';
import { RxnArrow, RxnPlus } from 'ketcher-core';
function checkElementExists(element: RxnPlus | RxnArrow, errorMsg: string) {
  if (!element) {
    throw new Error(errorMsg);
  }
}

test.describe('Erase Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await openFileAndAddToCanvas(
      'Rxn-V2000/benzene-bromobutane-reaction.rxn',
      page,
    );

    await page.getByTestId('erase').click();
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

    await waitForRender(page, async () => {
      await clickOnAtom(page, 'Br', 0);
    });

    const atomSize = await page.evaluate(() => {
      return window.ketcher.editor.struct().atoms.size;
    });
    expect(atomSize).toEqual(atomSizeAfterErase);

    await waitForRender(page, async () => {
      // eslint-disable-next-line no-magic-numbers
      await clickOnBond(page, BondType.SINGLE, 2);
    });

    const bondSize = await page.evaluate(() => {
      return window.ketcher.editor.struct().bonds.size;
    });
    expect(bondSize).toEqual(bondsSizeAfterErase);
  });

  test('Erase reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1364, 1365
    Description: Erase the reaction arrow and plus signs, undo and redo action
    */

    const arrowAfterDelete = 0;
    const reactionArrow = 1;
    const plusAfterDelete = 1;
    const reactionPlus = 2;
    const { leftBarWidth, topBarHeight } = await getLeftTopBarSize(page);

    const { plusElement, scale } = await page.evaluate(() => {
      const [plusElement] = window.ketcher.editor.struct().rxnPluses.values();
      return {
        plusElement: plusElement || null,
        scale: window.ketcher.editor.options().microModeScale,
      };
    });

    checkElementExists(plusElement, 'Plus not found');

    const plusPnt = {
      x: plusElement.pp.x * scale + leftBarWidth,
      y: plusElement.pp.y * scale + topBarHeight,
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
        scale: window.ketcher.editor.options().microModeScale,
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

test.describe('Erase Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeLeftToolbarScreenshot(page);
  });

  test('Toolbar icon verification', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1362
    Description: The appropriate icon presents at the Toolbar for Erase tool.
    */
    await openFileAndAddToCanvas(
      'Rxn-V2000/benzene-bromobutane-reaction.rxn',
      page,
    );
  });
});
