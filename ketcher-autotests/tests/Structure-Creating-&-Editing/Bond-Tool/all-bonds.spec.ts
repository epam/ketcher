/* eslint-disable no-magic-numbers */
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
  selectNestedTool,
  BondTool,
  clickOnTheCanvas,
  selectTopPanelButton,
  openFileAndAddToCanvas,
  selectLeftPanelButton,
  pressButton,
  STRUCTURE_LIBRARY_BUTTON_NAME,
  selectFunctionalGroups,
  FunctionalGroups,
  selectRingButton,
  clickOnBond,
  takeLeftToolbarScreenshot,
  selectAtomInToolbar,
  moveOnAtom,
  drawBenzeneRing,
  rightClickOnBond,
  selectOption,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import {
  getBondByIndex,
  getLeftBondByAttributes,
  getTopBondByAttributes,
} from '@utils/canvas/bonds';
import { BondType } from '@utils/canvas/types';
import { SelectionType, selectSelection } from '@utils/canvas/selectSelection';
const buttonIdToTitle: {
  [key: string]: string;
} = {
  'bond-single': 'Single Bond (1)',
  'bond-double': 'Double Bond (2)',
  'bond-triple': 'Triple Bond (3)',
  'bond-any': 'Any Bond (0)',
  'bond-aromatic': 'Aromatic Bond (4)',
  'bond-singledouble': 'Single/Double Bond',
  'bond-singlearomatic': 'Single/Aromatic Bond',
  'bond-doublearomatic': 'Double/Aromatic Bond',
  'bond-dative': 'Dative Bond',
  'bond-hydrogen': 'Hydrogen Bond',
  'bond-up': 'Single Up Bond (1)',
  'bond-down': 'Single Down Bond (1)',
  'bond-updown': 'Single Up/Down Bond (1)',
  'bond-crossed': 'Double Cis/Trans Bond (2)',
};

for (const bondToolKey of Object.keys(BondTool)) {
  let point: { x: number; y: number };
  const DELTA = 150;
  test.describe(`${bondToolKey} bond tool`, () => {
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

    test(`placing ${bondToolKey} on canvas`, async () => {
      /**
       *   Test cases: EPMLSOPKET-1371, 1380, 1389, 1396, 1404, 1410, 1416, 1422, 1428, 1437, 1444, 1451, 2238, 2244
       */

      const drawnBonds = 3;
      const drawnBondsWithRing = 7;
      const bondAfterErase = 6;
      await selectNestedTool(page, BondTool[bondToolKey]);

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

      await selectNestedTool(page, BondTool[bondToolKey]);
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

      await selectNestedTool(page, BondTool[bondToolKey]);
      point = await getAtomByIndex(page, { label: 'C' }, 0);
      await page.mouse.click(point.x, point.y);

      const sizeWithRingAndBond = await page.evaluate(() => {
        return window.ketcher.editor.struct().bonds.size;
      });

      expect(sizeWithRingAndBond).toEqual(drawnBondsWithRing);
    });

    test(`click on an existing bond using ${bondToolKey}`, async () => {
      /**
       * Test case: EPMLSOPKET-1375, 1383, 1392, 1398, 1406, 1412, 1418, 1424, 1430, 1439, 1446, 1453, 2240, 2246
       */
      await selectTool(LeftPanelButton.Chain, page);
      await moveMouseToTheMiddleOfTheScreen(page);
      point = await getCoordinatesOfTheMiddleOfTheScreen(page);
      await dragMouseTo(point.x + DELTA, point.y, page);

      await selectNestedTool(page, BondTool[bondToolKey]);

      point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
      await page.mouse.click(point.x, point.y);

      await selectAction(TopPanelButton.Clear, page);

      await selectRing(RingButton.Benzene, page);
      await clickInTheMiddleOfTheScreen(page);

      await selectNestedTool(page, BondTool[bondToolKey]);
      const doubleBond = await getTopBondByAttributes(page, {
        type: BondType.DOUBLE,
      });
      await page.mouse.click(doubleBond.x, doubleBond.y);

      const singleBond = await getTopBondByAttributes(page, {
        type: BondType.SINGLE,
      });
      await page.mouse.click(singleBond.x, singleBond.y);
    });

    test(`Undo/Redo ${bondToolKey} creation`, async () => {
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

      await selectNestedTool(page, BondTool[bondToolKey]);

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
    test.skip(`Manipulations with ${bondToolKey}`, async () => {
      /**
       * Test case: EPMLSOPKET-1377, 1385, 1394, 1400, 1408, 1414, 1420 1426, 1432, 1441, 1448, 1455, 2242, 2248
       */
      const DELTA_X = 100;
      point = await getCoordinatesOfTheMiddleOfTheScreen(page);

      await selectNestedTool(page, BondTool[bondToolKey]);
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

    test(`Check highlight absence after ${bondToolKey} Bond creation`, async () => {
      /**
       *  Test cases: EPMLSOPKET-1374, 1382, 1391, 1397, 1405, 1411, 1417, 1423, 1429, 1438, 1445, 1452, 2239, 2245
       */
      await selectNestedTool(page, BondTool[bondToolKey]);
      await clickInTheMiddleOfTheScreen(page);
    });

    test.describe('Saving and rendering', () => {
      /**
       *   Test cases: EPMLSOPKET-1378, 1386, 1395, 1401, 1409, 1415, 1421, 1427, 1433, 1442, 1449, 1456, 2243, 2249
       */
      const fileName = `saving-and-rendering-${bondToolKey}-bond.mol`;
      test(`Save to file`, async () => {
        await selectNestedTool(page, BondTool[bondToolKey]);
        await clickOnTheCanvas(page, -200, 0);
        await clickInTheMiddleOfTheScreen(page);
        await selectTopPanelButton(TopPanelButton.Save, page);
        await page.getByRole('button', { name: 'Save', exact: true }).click();
      });

      test(`Open and edit`, async () => {
        await openFileAndAddToCanvas(fileName, page);
        await selectLeftPanelButton(LeftPanelButton.ReactionPlusTool, page);
        await clickOnTheCanvas(page, 200, 0);
      });
    });

    test(`Check that ${bondToolKey} bond between atoms are centered and drawn symmetrically`, async () => {
      /**
       *Test case: EPMLSOPKET-16931
       *Description: Check that Bonds between atoms are centered and drawn symmetrically
       */
      await selectNestedTool(page, BondTool[bondToolKey]);
      await clickInTheMiddleOfTheScreen(page);
    });
  });
}

test.describe('Bond Tool', () => {
  const toolsForTest = [BondTool.SINGLE, BondTool.DOUBLE, BondTool.TRIPPLE];
  test.beforeEach(async ({ page }) => {
    await page.goto('', { waitUntil: 'domcontentloaded' });
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  for (const tool of toolsForTest) {
    test(`Functional Group with attach ${tool}`, async ({ page }) => {
      /**
       *Test case: EPMLSOPKET-10086
       *Description: A bond is added to a contracted functional group and form a bond
       */
      await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
      await page.getByRole('tab', { name: 'Functional Groups' }).click();
      await selectFunctionalGroups(FunctionalGroups.Boc, page);
      await clickInTheMiddleOfTheScreen(page);
      await selectNestedTool(page, tool);
      await clickInTheMiddleOfTheScreen(page);
    });

    test(`Creating two (or more) connected ${tool} bonds`, async ({ page }) => {
      /**
       * Test cases: EPMLSOPKET - 2920/2921
       */
      await clickInTheMiddleOfTheScreen(page);
      await selectNestedTool(page, tool);
      await clickInTheMiddleOfTheScreen(page);
      await clickInTheMiddleOfTheScreen(page);
    });
  }

  test('Drop down list: verification', async ({ page }) => {
    /**
     *Test case: EPMLSOPKET-1366
     *Description: Drop down list: verification
     */
    await selectLeftPanelButton(LeftPanelButton.SingleBond, page);
    await selectLeftPanelButton(LeftPanelButton.SingleBond, page);
    const bodyHeight = await page.evaluate(() => document.body.clientHeight);
    const bondDropdownWidth = 700;
    const screenshot = await page.screenshot({
      clip: {
        x: 0,
        y: 0,
        width: bondDropdownWidth,
        height: bodyHeight,
      },
    });
    expect(screenshot).toMatchSnapshot();
  });

  test('Hot keys', async ({ page }) => {
    /**
     *Test case: EPMLSOPKET-1368
     *Description: Bond Tool - Hot keys
     */
    const hotKeys = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit0'];
    for (const hotKey of hotKeys) {
      await page.keyboard.press(hotKey);
      await takeLeftToolbarScreenshot(page);
    }
  });

  test('Adding custom s-groups to bonds correctly selects bonds', async ({
    page,
  }) => {
    /**
     *Test case: EPMLSOPKET-8940
     *Description: Bond Tool - Adding custom s-groups to bonds correctly selects bonds
     */
    await drawBenzeneRing(page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await clickOnBond(page, BondType.SINGLE, 0);
  });

  test('Drawing bonds in one direction does not change the bond created in the other direction', async ({
    page,
  }) => {
    /**
     *Test case: EPMLSOPKET-8922
     *Description: Bond Tool - Drawing bonds in one direction does not change the bond created in the other direction
     */
    const point = { x: -50, y: 0 };
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await clickOnTheCanvas(page, point.x, point.y);
    await selectNestedTool(page, BondTool.SINGLE);
    await moveOnAtom(page, 'N', 0);
    await page.mouse.down();
    await moveOnAtom(page, 'O', 0);
    await page.mouse.up();
    await selectNestedTool(page, BondTool.DOUBLE);
    await takeEditorScreenshot(page);

    await moveOnAtom(page, 'O', 0);
    await page.mouse.down();
    await moveOnAtom(page, 'N', 0);
    await page.mouse.up();
  });

  test('Connecting two atoms with Double Bond and rotate', async ({ page }) => {
    /**
     *Test case: EPMLSOPKET-10098
     *Description: Bond Tool - Connecting two atoms with Double Bond and rotate
     */
    const point1 = { x: -50, y: 0 };
    const yDelta = 100;
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await clickOnTheCanvas(page, point1.x, point1.y);
    await selectNestedTool(page, BondTool.SINGLE);
    await moveOnAtom(page, 'N', 0);
    await page.mouse.down();
    await moveOnAtom(page, 'O', 0);
    await page.mouse.up();
    await selectNestedTool(page, BondTool.DOUBLE);
    await moveOnAtom(page, 'O', 0);
    await page.mouse.down();
    await moveOnAtom(page, 'N', 0);
    await page.mouse.up();
    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    const point2 = await getAtomByIndex(page, { label: 'N' }, 0);
    await page.mouse.move(point2.x, point2.y);
    const coordinatesWithShift = point2.y + yDelta;
    await dragMouseTo(point2.x, coordinatesWithShift, page);
  });

  test('Multiple bond editing not changes bond types to all selected bonds', async ({
    page,
  }) => {
    /**
     *Test case: EPMLSOPKET-11853
     *Description: Bond Tool - Multiple bond editing not changes bond types to all selected bonds
     */
    const point = { x: -200, y: -200 };
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await openFileAndAddToCanvas('KET/ketcher-42.ket', page);
    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await clickOnTheCanvas(page, point.x, point.y);
    await dragMouseTo(x + 50, y, page);
    await takeEditorScreenshot(page);
    await rightClickOnBond(page, BondType.DOUBLE, 0);
    await page.getByText('Edit selected bonds...').click();
    await pressButton(page, 'Either');
    await selectOption(page, 'Ring');
    await pressButton(page, 'Apply');
  });

  test('Add new bonds to the same atom', async ({ page }) => {
    /**
     *Test case: EPMLSOPKET-16888
     *Description: Bond Tool - Add new bonds to the same atom
     */
    await selectNestedTool(page, BondTool.DOUBLE);
    await clickInTheMiddleOfTheScreen(page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Change the type of bond by clicking on bond', async ({ page }) => {
    /**
     *Test case: EPMLSOPKET-16887
     *Description: Bond Tool - Change the type of bond by clicking on bond
     */
    await selectLeftPanelButton(LeftPanelButton.SingleBond, page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await clickOnBond(page, BondType.SINGLE, 0);
  });

  test('Aromatic - Ring inside the cycle structure', async ({ page }) => {
    /**
     *Test case: EPMLSOPKET-1436
     *Description: Aromatic Bond tool - Ring inside the cycle structure
     */
    await selectRingButton(RingButton.Cyclohexane, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectNestedTool(page, BondTool.AROMATIC);
    let i = 0;
    while (i < 6) {
      await clickOnBond(page, BondType.SINGLE, 0);
      i++;
    }
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Dearomatize, page);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Aromatize, page);
  });
});

for (const [_, id] of Object.values(BondTool)) {
  /*
   *   Test cases: EPMLSOPKET-1367, 2271,
   */
  test(`${id} tool: verification`, async ({ page }) => {
    await page.goto('', { waitUntil: 'domcontentloaded' });
    await selectLeftPanelButton(LeftPanelButton.SingleBond, page);
    await selectLeftPanelButton(LeftPanelButton.SingleBond, page);
    const button = page.getByTestId(id);
    expect(button).toHaveAttribute('title', buttonIdToTitle[id]);
    await button.click();
    await clickInTheMiddleOfTheScreen(page);
  });
}
