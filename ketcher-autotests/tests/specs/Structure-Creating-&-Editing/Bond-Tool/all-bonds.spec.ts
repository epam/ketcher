/* eslint-disable no-magic-numbers */
import { test, expect, Page } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  getCoordinatesTopAtomOfBenzeneRing,
  moveMouseToTheMiddleOfTheScreen,
  takeEditorScreenshot,
  DELAY_IN_SECONDS,
  clickOnTheCanvas,
  openFileAndAddToCanvas,
  pressButton,
  selectFunctionalGroups,
  FunctionalGroups,
  clickOnBond,
  takeLeftToolbarScreenshot,
  moveOnAtom,
  rightClickOnBond,
  selectOption,
  waitForPageInit,
  waitForRender,
  cutToClipboardByKeyboard,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  clickOnCanvas,
  delay,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import {
  getBondByIndex,
  getLeftBondByAttributes,
  getTopBondByAttributes,
} from '@utils/canvas/bonds';
import { BondType } from '@utils/canvas/types';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  drawBenzeneRing,
  selectRingButton,
} from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MicroBondOption } from '@tests/pages/constants/contextMenu/Constants';

const buttonIdToTitle: Record<MicroBondType, string> = {
  [MicroBondType.Single]: 'Single Bond (1)',
  [MicroBondType.Double]: 'Double Bond (2)',
  [MicroBondType.Triple]: 'Triple Bond (3)',
  [MicroBondType.Any]: 'Any Bond (0)',
  [MicroBondType.Aromatic]: 'Aromatic Bond (4)',
  [MicroBondType.SingleDouble]: 'Single/Double Bond',
  [MicroBondType.SingleAromatic]: 'Single/Aromatic Bond',
  [MicroBondType.DoubleAromatic]: 'Double/Aromatic Bond',
  [MicroBondType.Dative]: 'Dative Bond',
  [MicroBondType.Hydrogen]: 'Hydrogen Bond',
  [MicroBondType.SingleUp]: 'Single Up Bond (1)',
  [MicroBondType.SingleDown]: 'Single Down Bond (1)',
  [MicroBondType.SingleUpDown]: 'Single Up/Down Bond (1)',
  [MicroBondType.DoubleCisTrans]: 'Double Cis/Trans Bond (2)',
};

let page: Page;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  await waitForPageInit(page);
});

test.afterEach(async () => {
  await CommonTopLeftToolbar(page).clearCanvas();
  await CommonLeftToolbar(page).selectHandTool();
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

test.describe(`Bond tool:`, () => {
  // Experimental number of retries to make test more stable
  test.describe.configure({ retries: 5 });
  for (const bondType of Object.values(MicroBondType)) {
    let point: { x: number; y: number };

    const bondTypeName = Object.entries(MicroBondType).find(
      ([, enumValue]) => enumValue === bondType,
    )?.[0];

    const DELTA = 150;

    test(`placing ${bondTypeName} on canvas`, async () => {
      /**
       *   Test cases: EPMLSOPKET-1371, 1380, 1389, 1396, 1404, 1410, 1416, 1422, 1428, 1437, 1444, 1451, 2238, 2244
       */
      const drawnBonds = 3;
      const drawnBondsWithRing = 7;
      const bondAfterErase = 6;
      await CommonLeftToolbar(page).selectBondTool(bondType);

      await clickInTheMiddleOfTheScreen(page);

      point = await getAtomByIndex(page, { label: 'C' }, 0);
      await clickOnCanvas(page, point.x, point.y, { waitForRenderTimeOut: 0 });
      await clickOnCanvas(page, point.x, point.y, { waitForRenderTimeOut: 0 });

      const countBonds = await page.evaluate(() => {
        return window.ketcher.editor.struct().bonds.size;
      });

      expect(countBonds).toEqual(drawnBonds);

      await CommonTopLeftToolbar(page).clearCanvas();

      await selectRingButton(page, RingButton.Benzene);
      await clickInTheMiddleOfTheScreen(page);

      await CommonLeftToolbar(page).selectBondTool(bondType);
      point = await getAtomByIndex(page, { label: 'C' }, 0);
      await clickOnCanvas(page, point.x, point.y, { waitForRenderTimeOut: 0 });

      const countBondsWithRing = await page.evaluate(() => {
        return window.ketcher.editor.struct().bonds.size;
      });

      expect(countBondsWithRing).toEqual(drawnBondsWithRing);

      await CommonLeftToolbar(page).selectEraseTool();

      point = await getAtomByIndex(page, { label: 'C' }, 0);
      await clickOnCanvas(page, point.x, point.y);

      const sizeAfterErase = await page.evaluate(() => {
        return window.ketcher.editor.struct().bonds.size;
      });

      expect(sizeAfterErase).toEqual(bondAfterErase);

      await CommonLeftToolbar(page).selectBondTool(bondType);
      point = await getAtomByIndex(page, { label: 'C' }, 0);
      await clickOnCanvas(page, point.x, point.y);

      const sizeWithRingAndBond = await page.evaluate(() => {
        return window.ketcher.editor.struct().bonds.size;
      });

      expect(sizeWithRingAndBond).toEqual(drawnBondsWithRing);
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).clearCanvas();
    });

    test(`click on an existing bond using ${bondTypeName}`, async () => {
      /**
       * Test case: EPMLSOPKET-1375, 1383, 1392, 1398, 1406, 1412, 1418, 1424, 1430, 1439, 1446, 1453, 2240, 2246
       */
      await LeftToolbar(page).chain();
      await moveMouseToTheMiddleOfTheScreen(page);
      point = await getCoordinatesOfTheMiddleOfTheScreen(page);
      await dragMouseTo(point.x + DELTA, point.y, page);

      await CommonLeftToolbar(page).selectBondTool(bondType);

      point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
      await clickOnCanvas(page, point.x, point.y);

      await CommonTopLeftToolbar(page).clearCanvas();

      await selectRingButton(page, RingButton.Benzene);
      await clickInTheMiddleOfTheScreen(page);

      await CommonLeftToolbar(page).selectBondTool(bondType);
      const doubleBond = await getTopBondByAttributes(page, {
        type: BondType.DOUBLE,
      });
      await clickOnCanvas(page, doubleBond.x, doubleBond.y);

      const singleBond = await getTopBondByAttributes(page, {
        type: BondType.SINGLE,
      });
      await clickOnCanvas(page, singleBond.x, singleBond.y);
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).clearCanvas();
    });

    test(`Undo/Redo ${bondTypeName} creation`, async () => {
      /*
       * Test case: EPMLSOPKET-1376, 1384, 1393, 1399, 1407, 1413, 1419, 1425, 1431, 1440, 1447, 1454, 2241, 2247
       */
      const chainSizeWithBond = 5;
      const chainSizeWithoutBondAfterUndo = 4;
      const chainSizeAfterMultipleEditing = 6;
      await LeftToolbar(page).chain();
      await moveMouseToTheMiddleOfTheScreen(page);
      point = await getCoordinatesOfTheMiddleOfTheScreen(page);
      await dragMouseTo(point.x + DELTA, point.y, page);

      await CommonLeftToolbar(page).selectBondTool(bondType);

      point = await getAtomByIndex(page, { label: 'C' }, 0);
      await clickOnCanvas(page, point.x, point.y);

      const chainSize = await page.evaluate(() => {
        return window.ketcher.editor.struct().bonds.size;
      });
      expect(chainSize).toEqual(chainSizeWithBond);

      await CommonTopLeftToolbar(page).undo();

      const chainSizeAfterUndo = await page.evaluate(() => {
        return window.ketcher.editor.struct().bonds.size;
      });
      expect(chainSizeAfterUndo).toEqual(chainSizeWithoutBondAfterUndo);

      point = await getAtomByIndex(page, { label: 'C' }, 1);
      await clickOnCanvas(page, point.x, point.y);

      point = await getAtomByIndex(
        page,
        { label: 'C' },
        DELAY_IN_SECONDS.THREE,
      );
      await clickOnCanvas(page, point.x, point.y);

      const editedChain = await page.evaluate(() => {
        return window.ketcher.editor.struct().bonds.size;
      });
      expect(editedChain).toEqual(chainSizeAfterMultipleEditing);

      await CommonTopLeftToolbar(page).undo();

      const editedChainUndo = await page.evaluate(() => {
        return window.ketcher.editor.struct().bonds.size;
      });
      expect(editedChainUndo).toEqual(chainSizeWithBond);

      await CommonTopLeftToolbar(page).undo();

      const editedChainUndoTwice = await page.evaluate(() => {
        return window.ketcher.editor.struct().bonds.size;
      });
      expect(editedChainUndoTwice).toEqual(chainSizeWithoutBondAfterUndo);

      await CommonTopLeftToolbar(page).redo();

      const editedChainRedo = await page.evaluate(() => {
        return window.ketcher.editor.struct().bonds.size;
      });
      expect(editedChainRedo).toEqual(chainSizeWithBond);

      await CommonTopLeftToolbar(page).redo();

      const editedChainRedoTwice = await page.evaluate(() => {
        return window.ketcher.editor.struct().bonds.size;
      });
      expect(editedChainRedoTwice).toEqual(chainSizeAfterMultipleEditing);
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).clearCanvas();
    });

    test(`Check highlight absence after ${bondTypeName} Bond creation`, async () => {
      /**
       *  Test cases: EPMLSOPKET-1374, 1382, 1391, 1397, 1405, 1411, 1417, 1423, 1429, 1438, 1445, 1452, 2239, 2245
       */
      await CommonLeftToolbar(page).selectBondTool(bondType);
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).clearCanvas();
    });

    test.describe('Saving and rendering', () => {
      /**
       *   Test cases: EPMLSOPKET-1378, 1386, 1395, 1401, 1409, 1415, 1421, 1427, 1433, 1442, 1449, 1456, 2243, 2249
       */
      const fileName = `Molfiles-V2000/saving-and-rendering-${bondTypeName}-bond-(refactored).mol`;
      test(`${bondTypeName}: Save to file`, async () => {
        await CommonLeftToolbar(page).selectBondTool(bondType);
        await clickOnTheCanvas(page, -200, 0);
        await clickInTheMiddleOfTheScreen(page);
        await CommonTopLeftToolbar(page).saveFile();
        await SaveStructureDialog(page).save();
      });

      test(`${bondTypeName}: Open and edit`, async () => {
        await openFileAndAddToCanvas(page, fileName);
        await LeftToolbar(page).reactionPlusTool();
        await clickOnTheCanvas(page, 200, 0);
      });
    });

    test(`Check that ${bondTypeName} bond between atoms are centered and drawn symmetrically`, async () => {
      /**
       *Test case: EPMLSOPKET-16931
       *Description: Check that Bonds between atoms are centered and drawn symmetrically
       */
      await CommonLeftToolbar(page).selectBondTool(bondType);
      await clickInTheMiddleOfTheScreen(page);
    });
  }
});

test.describe(`Bond tool (copy-paste):`, () => {
  for (const bondType of Object.values(MicroBondType)) {
    let point: { x: number; y: number };

    const bondTypeName = Object.entries(MicroBondType).find(
      ([, enumValue]) => enumValue === bondType,
    )?.[0];

    test(
      `Manipulations with ${bondTypeName} (refactored)`,
      {
        tag: ['@FlakyTest'],
      },
      async () => {
        /**
         * Test case: EPMLSOPKET-1377, 1385, 1394, 1400, 1408, 1414, 1420 1426, 1432, 1441, 1448, 1455, 2242, 2248
         */
        test.setTimeout(120000);
        const DELTA_X = 100;
        point = await getCoordinatesOfTheMiddleOfTheScreen(page);
        const atomToolbar = RightToolbar(page);

        await CommonLeftToolbar(page).selectBondTool(bondType);
        await clickInTheMiddleOfTheScreen(page);

        await CommonLeftToolbar(page).selectAreaSelectionTool(
          SelectionToolType.Rectangle,
        );

        await moveMouseToTheMiddleOfTheScreen(page);
        await dragMouseTo(point.x + DELTA_X, point.y, page);
        await CommonTopLeftToolbar(page).undo();

        await CommonLeftToolbar(page).selectAreaSelectionTool(
          SelectionToolType.Rectangle,
        );

        point = await getLeftBondByAttributes(page, {
          reactingCenterStatus: 0,
        });

        await clickOnCanvas(page, point.x, point.y, {
          waitForRenderTimeOut: 100,
        });

        await copyToClipboardByKeyboard(page);
        await pasteFromClipboardByKeyboard(page);

        await clickOnCanvas(page, point.x + DELTA_X, point.y, {
          waitForRenderTimeOut: 100,
        });
        await CommonTopLeftToolbar(page).undo();

        await clickInTheMiddleOfTheScreen(page);
        await cutToClipboardByKeyboard(page);
        await pasteFromClipboardByKeyboard(page);
        await clickOnCanvas(page, point.x + DELTA_X, point.y, {
          waitForRenderTimeOut: 100,
        });
        await CommonTopLeftToolbar(page).undo();
        await CommonTopLeftToolbar(page).undo();

        await CommonLeftToolbar(page).selectEraseTool();
        await clickInTheMiddleOfTheScreen(page);

        await CommonTopLeftToolbar(page).undo();

        await atomToolbar.clickAtom(Atom.Oxygen);
        point = await getCoordinatesTopAtomOfBenzeneRing(page);

        await clickOnCanvas(page, point.x, point.y, {
          waitForRenderTimeOut: 100,
        });
        await CommonTopLeftToolbar(page).undo();

        await selectRingButton(page, RingButton.Cyclohexane);
        await clickOnCanvas(page, point.x, point.y, {
          waitForRenderTimeOut: 100,
        });

        await takeEditorScreenshot(page);
      },
    );
  }
});

test.describe('Bond Tool', () => {
  const toolsForTest: MicroBondType[] = [
    MicroBondType.Single,
    MicroBondType.Double,
    MicroBondType.Triple,
  ];

  for (const tool of toolsForTest) {
    test(`Functional Group with attach ${tool}`, async () => {
      /**
       *Test case: EPMLSOPKET-10086
       *Description: A bond is added to a contracted functional group and form a bond
       */
      await selectFunctionalGroups(FunctionalGroups.Boc, page);
      await clickInTheMiddleOfTheScreen(page);
      await CommonLeftToolbar(page).selectBondTool(tool);
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);
    });

    test(`Creating two (or more) connected ${tool} bonds`, async () => {
      /**
       * Test cases: EPMLSOPKET - 2920/2921
       */
      await clickInTheMiddleOfTheScreen(page);
      await CommonLeftToolbar(page).selectBondTool(tool);
      await clickInTheMiddleOfTheScreen(page);
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);
    });
  }

  test('Drop down list: verification', async () => {
    /**
     *Test case: EPMLSOPKET-1366
     *Description: Drop down list: verification
     */
    await page.keyboard.press('1');
    await CommonLeftToolbar(page).expandBondSelectionDropdown();
    await takeEditorScreenshot(page);
  });

  test('Hot keys', async () => {
    /**
     *Test case: EPMLSOPKET-1368
     *Description: Bond Tool - Hot keys
     */
    const hotKeys = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit0'];
    await page.keyboard.press('Escape');
    for (const [index, hotKey] of hotKeys.entries()) {
      // Delay prevents the search field from opening after the hotkey press
      // (otherwise the main window is blocked and the panel tools can't be selected)
      if (index > 0) {
        await delay(1);
      }

      await page.keyboard.press(hotKey);
      await takeLeftToolbarScreenshot(page);
    }
    await takeEditorScreenshot(page);
  });

  test('Adding custom s-groups to bonds correctly selects bonds', async () => {
    /**
     *Test case: EPMLSOPKET-8940
     *Description: Bond Tool - Adding custom s-groups to bonds correctly selects bonds
     */
    await drawBenzeneRing(page);
    await LeftToolbar(page).sGroup();
    await clickOnBond(page, BondType.SINGLE, 0);
    await takeEditorScreenshot(page);
  });

  test('Drawing bonds in one direction does not change the bond created in the other direction', async () => {
    /**
     *Test case: EPMLSOPKET-8922
     *Description: Bond Tool - Drawing bonds in one direction does not change the bond created in the other direction
     */
    const point = { x: -50, y: 0 };
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickInTheMiddleOfTheScreen(page);

    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickOnTheCanvas(page, point.x, point.y);
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
    await moveOnAtom(page, 'N', 0);
    await page.mouse.down();
    await moveOnAtom(page, 'O', 0);
    await waitForRender(
      page,
      async () => {
        await page.mouse.up();
      },
      200,
    );
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Double);
    await takeEditorScreenshot(page);

    await moveOnAtom(page, 'O', 0);
    await page.mouse.down();
    await moveOnAtom(page, 'N', 0);
    await waitForRender(
      page,
      async () => {
        await page.mouse.up();
      },
      200,
    );
    await takeEditorScreenshot(page);
  });

  test('Connecting two atoms with Double Bond and rotate', async () => {
    /**
     *Test case: EPMLSOPKET-10098
     *Description: Bond Tool - Connecting two atoms with Double Bond and rotate
     */
    const point1 = { x: -50, y: 0 };
    const yDelta = 100;
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickInTheMiddleOfTheScreen(page);

    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickOnTheCanvas(page, point1.x, point1.y);
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
    await moveOnAtom(page, 'N', 0);
    await page.mouse.down();
    await moveOnAtom(page, 'O', 0);
    await waitForRender(
      page,
      async () => {
        await page.mouse.up();
      },
      200,
    );
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Double);
    await moveOnAtom(page, 'O', 0);
    await page.mouse.down();
    await moveOnAtom(page, 'N', 0);
    await waitForRender(
      page,
      async () => {
        await page.mouse.up();
      },
      200,
    );
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    const point2 = await getAtomByIndex(page, { label: 'N' }, 0);
    await page.mouse.move(point2.x, point2.y);
    const coordinatesWithShift = point2.y + yDelta;
    await dragMouseTo(point2.x, coordinatesWithShift, page);
    await takeEditorScreenshot(page);
  });

  test('Multiple bond editing not changes bond types to all selected bonds', async () => {
    /**
     *Test case: EPMLSOPKET-11853
     *Description: Bond Tool - Multiple bond editing not changes bond types to all selected bonds
     */
    const point = { x: -200, y: -200 };
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await openFileAndAddToCanvas(page, 'KET/ketcher-42.ket');
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickOnTheCanvas(page, point.x, point.y);
    await dragMouseTo(x + 50, y, page);
    await takeEditorScreenshot(page);
    const point1 = await getBondByIndex(page, { type: BondType.DOUBLE }, 0);
    await ContextMenu(page, point1).click(MicroBondOption.EditSelectedBonds);
    await page.getByTestId('topology-input-span').click();
    await selectOption(page, 'Ring');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Add new bonds to the same atom', async () => {
    /**
     *Test case: EPMLSOPKET-16888
     *Description: Bond Tool - Add new bonds to the same atom
     */
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Double);
    await clickInTheMiddleOfTheScreen(page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Change the type of bond by clicking on bond', async () => {
    /**
     *Test case: EPMLSOPKET-16887
     *Description: Bond Tool - Change the type of bond by clicking on bond
     */
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await clickOnBond(page, BondType.SINGLE, 0);
    await takeEditorScreenshot(page);
  });

  test('Aromatic - Ring inside the cycle structure', async () => {
    /**
     *Test case: EPMLSOPKET-1436
     *Description: Aromatic Bond tool - Ring inside the cycle structure
     */
    await selectRingButton(page, RingButton.Cyclohexane);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Aromatic);
    let i = 0;
    while (i < 6) {
      await clickOnBond(page, BondType.SINGLE, 0);
      i++;
    }
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).dearomatize();
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).aromatize();
    await takeEditorScreenshot(page);
  });
});

for (const bondType of Object.values(MicroBondType)) {
  /*
   *   Test cases: EPMLSOPKET-1367, 2271,
   */
  const bondTypeName = Object.entries(MicroBondType).find(
    ([, enumValue]) => enumValue === bondType,
  )?.[0];

  test(`${bondTypeName} tool: verification`, async () => {
    const commonLeftToolbar = CommonLeftToolbar(page);

    await CommonLeftToolbar(page).expandBondSelectionDropdown();
    const button = page.getByTestId(bondType);
    await expect(button).toHaveAttribute('title', buttonIdToTitle[bondType]);
    // await button.click();
    await commonLeftToolbar.selectHandTool();
  });
}
