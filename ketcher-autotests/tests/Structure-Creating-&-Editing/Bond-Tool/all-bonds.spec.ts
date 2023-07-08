import { test, expect, Page } from '@playwright/test';
import {
  AtomButton,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  getCoordinatesTopAtomOfBenzeneRing,
  LeftPanelButton,
  moveMouseToTheMiddleOfTheScreen,
  RingButton,
  selectAction,
  selectAtom,
  selectRing,
  selectTool,
  takeEditorScreenshot,
  TopPanelButton,
  DELAY_IN_SECONDS,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import {
  getBondByIndex,
  getLeftBondByAttributes,
  getTopBondByAttributes,
} from '@utils/canvas/bonds';
import { BondTypeName, selectBond } from '@utils/canvas/selectBond';
import { BondType } from '@utils/canvas/types';
import { SelectionType, selectSelection } from '@utils/canvas/selectSelection';

for (const bondType of Object.values(BondTypeName)) {
  let point: { x: number; y: number };
  const DELTA = 150;
  test.describe(`${bondType} bond tool`, () => {
    let page: Page;

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage();
      await page.goto('', { waitUntil: 'domcontentloaded' });
    });

    test.beforeEach(async () => {
      await selectAction(TopPanelButton.Clear, page);
    });

    test.afterEach(async () => {
      await takeEditorScreenshot(page);
      await selectAction(TopPanelButton.Clear, page);
    });

    test.afterAll(async () => {
      await page.close();
    });

    test(`placing ${bondType} on canvas`, async () => {
      /*
       *   Test cases: EPMLSOPKET-1371, 1380, 1389, 1396, 1404, 1410, 1416, 1422, 1428, 1437, 1444, 1451, 2238, 2244
       */

      const drawnBonds = 3;
      const drawnBondsWithRing = 7;
      const bondAfterErase = 6;
      await selectBond(bondType, page);
      await clickInTheMiddleOfTheScreen(page);

      point = await getAtomByIndex(page, { label: 'C' }, 0);
      await page.mouse.click(point.x, point.y);
      await page.mouse.click(point.x, point.y);

      const countBonds = await page.evaluate(() => {
        return window.ketcher.editor.struct().bonds.size;
      });

      expect(countBonds).toEqual(drawnBonds);

      await selectAction(TopPanelButton.Clear, page);

      await selectRing(RingButton.Benzene, page);
      await clickInTheMiddleOfTheScreen(page);

      await selectBond(bondType, page);
      point = await getAtomByIndex(page, { label: 'C' }, 0);
      await page.mouse.click(point.x, point.y);

      const countBondsWithRing = await page.evaluate(() => {
        return window.ketcher.editor.struct().bonds.size;
      });

      expect(countBondsWithRing).toEqual(drawnBondsWithRing);

      await selectTool(LeftPanelButton.Erase, page);

      point = await getAtomByIndex(page, { label: 'C' }, 0);
      await page.mouse.click(point.x, point.y);

      const sizeAfterErase = await page.evaluate(() => {
        return window.ketcher.editor.struct().bonds.size;
      });

      expect(sizeAfterErase).toEqual(bondAfterErase);

      await selectBond(bondType, page);
      point = await getAtomByIndex(page, { label: 'C' }, 0);
      await page.mouse.click(point.x, point.y);

      const sizeWithRingAndBond = await page.evaluate(() => {
        return window.ketcher.editor.struct().bonds.size;
      });

      expect(sizeWithRingAndBond).toEqual(drawnBondsWithRing);
    });

    test(`click on an existing bond using ${bondType}`, async () => {
      /*
       * Test case: EPMLSOPKET-1375, 1383, 1392, 1398, 1406, 1412, 1418, 1424, 1430, 1439, 1446, 1453, 2240, 2246
       */

      await selectTool(LeftPanelButton.Chain, page);
      await moveMouseToTheMiddleOfTheScreen(page);
      point = await getCoordinatesOfTheMiddleOfTheScreen(page);
      await dragMouseTo(point.x + DELTA, point.y, page);

      await selectBond(bondType, page);

      point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
      await page.mouse.click(point.x, point.y);

      await selectAction(TopPanelButton.Clear, page);

      await selectRing(RingButton.Benzene, page);
      await clickInTheMiddleOfTheScreen(page);

      await selectBond(bondType, page);
      const doubleBond = await getTopBondByAttributes(page, {
        type: BondType.DOUBLE,
      });
      await page.mouse.click(doubleBond.x, doubleBond.y);

      const singleBond = await getTopBondByAttributes(page, {
        type: BondType.SINGLE,
      });
      await page.mouse.click(singleBond.x, singleBond.y);
    });

    test(`Undo/Redo ${bondType} creation`, async () => {
      /*
       * Test case: EPMLSOPKET-1376, 1384, 1393, 1399, 1407, 1413, 1419, 1425, 1431, 1440, 1447, 1454, 2241, 2247
       */
      const chainSizeWithBond = 5;
      const chainSizeWithoutBondAfterUndo = 4;
      const chainSizeAfterMultipleEditing = 6;
      await selectTool(LeftPanelButton.Chain, page);
      await moveMouseToTheMiddleOfTheScreen(page);
      point = await getCoordinatesOfTheMiddleOfTheScreen(page);
      await dragMouseTo(point.x + DELTA, point.y, page);

      await selectBond(bondType, page);

      point = await getAtomByIndex(page, { label: 'C' }, 0);
      await page.mouse.click(point.x, point.y);

      const chainSize = await page.evaluate(() => {
        return window.ketcher.editor.struct().bonds.size;
      });
      expect(chainSize).toEqual(chainSizeWithBond);

      await selectAction(TopPanelButton.Undo, page);

      const chainSizeAfterUndo = await page.evaluate(() => {
        return window.ketcher.editor.struct().bonds.size;
      });
      expect(chainSizeAfterUndo).toEqual(chainSizeWithoutBondAfterUndo);

      point = await getAtomByIndex(page, { label: 'C' }, 1);
      await page.mouse.click(point.x, point.y);

      point = await getAtomByIndex(
        page,
        { label: 'C' },
        DELAY_IN_SECONDS.THREE,
      );
      await page.mouse.click(point.x, point.y);

      const editedChain = await page.evaluate(() => {
        return window.ketcher.editor.struct().bonds.size;
      });
      expect(editedChain).toEqual(chainSizeAfterMultipleEditing);

      await selectAction(TopPanelButton.Undo, page);

      const editedChainUndo = await page.evaluate(() => {
        return window.ketcher.editor.struct().bonds.size;
      });
      expect(editedChainUndo).toEqual(chainSizeWithBond);

      await selectAction(TopPanelButton.Undo, page);

      const editedChainUndoTwice = await page.evaluate(() => {
        return window.ketcher.editor.struct().bonds.size;
      });
      expect(editedChainUndoTwice).toEqual(chainSizeWithoutBondAfterUndo);

      await selectAction(TopPanelButton.Redo, page);

      const editedChainRedo = await page.evaluate(() => {
        return window.ketcher.editor.struct().bonds.size;
      });
      expect(editedChainRedo).toEqual(chainSizeWithBond);

      await selectAction(TopPanelButton.Redo, page);

      const editedChainRedoTwice = await page.evaluate(() => {
        return window.ketcher.editor.struct().bonds.size;
      });
      expect(editedChainRedoTwice).toEqual(chainSizeAfterMultipleEditing);
    });

    // TODO:
    test.skip(`Manipulations with ${bondType}`, async () => {
      /*
       * Test case: EPMLSOPKET-1377, 1385, 1394, 1400, 1408, 1414, 1420 1426, 1432, 1441, 1448, 1455, 2242, 2248
       */
      const DELTA_X = 100;
      point = await getCoordinatesOfTheMiddleOfTheScreen(page);

      await selectBond(bondType, page);
      await clickInTheMiddleOfTheScreen(page);

      await selectSelection(SelectionType.Rectangle, page);

      await moveMouseToTheMiddleOfTheScreen(page);
      await dragMouseTo(point.x + DELTA_X, point.y, page);

      await selectAction(TopPanelButton.Undo, page);

      await selectSelection(SelectionType.Rectangle, page);

      point = await getLeftBondByAttributes(page, { reactingCenterStatus: 0 });

      await page.mouse.click(point.x, point.y);

      await page.keyboard.press('Control+C');
      await page.keyboard.press('Control+V');
      await page.mouse.click(point.x + DELTA_X, point.y);

      await selectAction(TopPanelButton.Undo, page);

      await clickInTheMiddleOfTheScreen(page);
      await page.keyboard.press('Control+X');
      await page.keyboard.press('Control+V');
      await page.mouse.click(point.x + DELTA_X, point.y);

      await selectAction(TopPanelButton.Undo, page);
      await selectAction(TopPanelButton.Undo, page);

      await selectTool(LeftPanelButton.Erase, page);
      await clickInTheMiddleOfTheScreen(page);

      await selectAction(TopPanelButton.Undo, page);

      await selectAtom(AtomButton.Oxygen, page);
      point = await getCoordinatesTopAtomOfBenzeneRing(page);

      await page.mouse.click(point.x, point.y);

      await selectAction(TopPanelButton.Undo, page);

      await selectTool(LeftPanelButton.RotateTool, page);
      const yDelta = 50;
      await dragMouseTo(point.x, point.y + yDelta, page);

      await selectAction(TopPanelButton.Undo, page);

      await selectRing(RingButton.Cyclohexane, page);
      await page.mouse.click(point.x, point.y);
    });
  });
}
