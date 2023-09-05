/* eslint-disable no-magic-numbers */
import { test, expect } from '@playwright/test';
import {
  ArrowTool,
  copyAndPaste,
  cutAndPaste,
  delay,
  saveStructureWithReaction,
  screenshotBetweenUndoRedo,
  selectLeftPanelButton,
  selectNestedTool,
  selectTopPanelButton,
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  clickOnTheCanvas,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  DELAY_IN_SECONDS,
  INPUT_DELAY,
  getControlModifier,
  LeftPanelButton,
  TopPanelButton,
  Point,
} from '@utils';

const xOffsetFromCenter = -35;
const idToTitle: {
  [key: string]: string;
} = {
  'reaction-arrow-open-angle': 'Arrow Open Angle Tool',
  'reaction-arrow-filled-triangle': 'Arrow Filled Triangle Tool',
  'reaction-arrow-filled-bow': 'Arrow Filled Bow Tool',
  'reaction-arrow-dashed-open-angle': 'Arrow Dashed Open Angle Tool',
  'reaction-arrow-failed': 'Failed Arrow Tool',
  'reaction-arrow-both-ends-filled-triangle':
    'Arrow Both Ends Filled Triangle Tool',
  'reaction-arrow-equilibrium-filled-half-bow':
    'Arrow Equilibrium Filled Half Bow Tool',
  'reaction-arrow-equilibrium-filled-triangle':
    'Arrow Equilibrium Filled Triangle Tool',
  'reaction-arrow-equilibrium-open-angle': 'Arrow Equilibrium Open Angle Tool',
  'reaction-arrow-unbalanced-equilibrium-filled-half-bow':
    'Arrow Unbalanced Equilibrium Filled Half Bow Tool',
  'reaction-arrow-unbalanced-equilibrium-open-half-angle':
    'Arrow Unbalanced Equilibrium Open Half Angle Tool',
  'reaction-arrow-unbalanced-equilibrium-large-filled-half-bow':
    'Arrow Unbalanced Equilibrium Large Filled Half Bow Tool',
  'reaction-arrow-unbalanced-equilibrium-filled-half-triangle':
    'Arrow Unbalanced Equilibrium Filled Half Triangle Tool',
  'reaction-arrow-elliptical-arc-arrow-filled-bow':
    'Arrow Elliptical Arc Filled Bow Tool',
  'reaction-arrow-elliptical-arc-arrow-filled-triangle':
    'Arrow Elliptical Arc Filled Triangle Tool',
  'reaction-arrow-elliptical-arc-arrow-open-angle':
    'Arrow Elliptical Arc Open Angle Tool',
  'reaction-arrow-elliptical-arc-arrow-open-half-angle':
    'Arrow Elliptical Arc Open Half Angle Tool',
};

const formatsForSave = [
  {
    name: 'Daylight SMILES',
    fileExtension: 'smi',
  },
  {
    name: 'Extended SMILES',
    fileExtension: 'cxsmi',
  },
  {
    name: 'CML',
    fileExtension: 'cml',
  },
];

test.describe('Plus and Arrows tools ', () => {
  const modifier = getControlModifier();
  const CANVAS_CLICK_X = 300;
  const CANVAS_CLICK_Y = 300;
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });
  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });
  test.describe('Create reactions', () => {
    /**
     * Test case: EPMLSOPKET-1783
     * Description: Create Reactions
     */
    for (const tool of Object.values(ArrowTool)) {
      test(` ${tool} check`, async ({ page }) => {
        await openFileAndAddToCanvas('benzene-and-cyclopentadiene.mol', page);
        await selectNestedTool(page, tool);
        await clickOnTheCanvas(page, xOffsetFromCenter, 0);
        await delay(DELAY_IN_SECONDS.ONE);
        await takeEditorScreenshot(page);
        await selectTopPanelButton(TopPanelButton.Undo, page);
      });
    }
  });

  test('Resizing arrow', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1784
     * Description: Arrow is resized correctly
     */
    await selectLeftPanelButton(LeftPanelButton.ArrowOpenAngleTool, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    dragMouseTo(x + 100, y + 100, page);
    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await takeEditorScreenshot(page);
    await page.mouse.move(x + 98, y + 98);
    dragMouseTo(x + 150, y + 150, page);
  });

  test('Copy/paste, cut/paste arrow', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-2872
     * Description: Copy/cut/paste reaction tools
     */
    await selectLeftPanelButton(LeftPanelButton.ArrowOpenAngleTool, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    dragMouseTo(x + 100, y + 100, page);
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await delay(DELAY_IN_SECONDS.ONE);
    await screenshotBetweenUndoRedo(page);
  });

  test('Verify reaction is registered in undo/redo chain', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1790
     * Description: Verify reaction is registered in undo/redo chain
     */
    const xOffsetFromCenter1 = -235;
    const xOffsetFromCenter2 = 235;
    await openFileAndAddToCanvas('four-structures.mol', page);
    await selectLeftPanelButton(LeftPanelButton.ReactionPlusTool, page);
    await clickOnTheCanvas(page, xOffsetFromCenter1, 0);
    await clickOnTheCanvas(page, xOffsetFromCenter2, 0);
    await takeEditorScreenshot(page);

    await selectLeftPanelButton(LeftPanelButton.ArrowOpenAngleTool, page);
    await clickOnTheCanvas(page, -80, 0);
    await takeEditorScreenshot(page);

    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await clickOnTheCanvas(page, -60, 0);
    await takeEditorScreenshot(page);

    await selectLeftPanelButton(LeftPanelButton.ArrowOpenAngleTool, page);
    await clickOnTheCanvas(page, xOffsetFromCenter1, -100);
    await selectLeftPanelButton(LeftPanelButton.ReactionPlusTool, page);
    await clickOnTheCanvas(page, xOffsetFromCenter2, -100);
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await selectTopPanelButton(TopPanelButton.Redo, page);
    }
  });

  test.describe('Plus sign - Manipulations with different Tools', () => {
    /**
     * Test case: EPMLSOPKET - 1791
     * Description: Plus sign - Manipulations with different Tools
     */
    let point: Point;
    test.beforeEach(async ({ page }) => {
      await openFileAndAddToCanvas('Rxn-V3000/reaction-3.rxn', page);
      await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
      point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    });

    test('Select the plus sign and move it', async ({ page }) => {
      await page.mouse.move(point.x - 150, point.y - 10);
      await dragMouseTo(point.x - 150, point.y - 40, page);
    });

    test('Select the plus sign with any reaction component(s) and move them', async ({
      page,
    }) => {
      await page.mouse.move(point.x - 300, point.y - 100);
      await dragMouseTo(point.x - 140, point.y + 100, page);
      await page.mouse.move(point.x - 200, point.y - 20);
      await dragMouseTo(point.x - 300, point.y - 100, page);
    });

    test('Select the whole reaction and move it', async ({ page }) => {
      await page.keyboard.press(`${modifier}+KeyA`);
      await page.mouse.move(point.x - 20, point.y - 20);
      await dragMouseTo(point.x - 100, point.y - 100, page);
    });

    test('Select plus sign, cut and paste it onto the canvas', async ({
      page,
    }) => {
      await page.mouse.click(point.x - 150, point.y - 10);
      await delay(DELAY_IN_SECONDS.ONE);
      await page.keyboard.press(`${modifier}+KeyX`);
      await page.keyboard.press(`${modifier}+KeyV`, { delay: INPUT_DELAY });
      await clickOnTheCanvas(page, 0, -100);
    });

    test('Select plus sign, copy and paste it onto the canvas', async ({
      page,
    }) => {
      await page.mouse.click(point.x - 150, point.y - 10);
      await delay(DELAY_IN_SECONDS.ONE);
      await page.keyboard.press(`${modifier}+KeyC`);
      await page.keyboard.press(`${modifier}+KeyV`, { delay: INPUT_DELAY });
      await clickOnTheCanvas(page, 0, -100);
    });

    test('Select the whole reaction and move it, Undo, Erase tool', async ({
      page,
    }) => {
      await page.keyboard.press(`${modifier}+KeyA`);
      await delay(DELAY_IN_SECONDS.ONE);
      await page.keyboard.press(`${modifier}+KeyC`);
      await page.mouse.move(point.x - 100, point.y - 100);
      await page.keyboard.press(`${modifier}+KeyV`, { delay: INPUT_DELAY });
      await takeEditorScreenshot(page);
      await page.keyboard.press(`Escape`);
      await takeEditorScreenshot(page);
      await selectLeftPanelButton(LeftPanelButton.Erase, page);
      await page.mouse.move(point.x - 300, point.y - 100);
      await dragMouseTo(point.x - 140, point.y + 100, page);
    });
  });
  test.describe('Reaction Arrow - Manipulations with different Tools', () => {
    /**
     * Test case: EPMLSOPKET - 1792
     * Description: Reaction Arrow - Manipulations with different Tools
     */
    let point: Point;
    test.beforeEach(async ({ page }) => {
      await openFileAndAddToCanvas('Rxn-V3000/reaction-3.rxn', page);
      await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
      point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    });

    test('Select the reaction arrow and move it', async ({ page }) => {
      await page.mouse.move(point.x + 60, point.y);
      await dragMouseTo(point.x + 60, point.y - 40, page);
    });

    test('Select the reaction arrow with any reaction component(s) and move them', async ({
      page,
    }) => {
      await page.mouse.move(point.x + 50, point.y - 300);
      await dragMouseTo(point.x + 400, point.y + 100, page);
      await page.mouse.move(point.x + 70, point.y);
      await dragMouseTo(point.x + 300, point.y - 100, page);
    });

    test('Select the whole reaction and move it', async ({ page }) => {
      await page.keyboard.press(`${modifier}+KeyA`);
      await page.mouse.move(point.x - 20, point.y - 20);
      await dragMouseTo(point.x - 100, point.y - 100, page);
    });

    test('Select reaction arrow, cut and paste it onto the canvas', async ({
      page,
    }) => {
      await page.mouse.click(point.x + 60, point.y);
      await delay(DELAY_IN_SECONDS.ONE);
      await page.keyboard.press(`${modifier}+KeyX`);
      await page.keyboard.press(`${modifier}+KeyV`, { delay: INPUT_DELAY });
      await clickOnTheCanvas(page, 0, -100);
    });

    test('Select reaction arrow, copy and paste it onto the canvas', async ({
      page,
    }) => {
      await page.mouse.click(point.x + 60, point.y);
      await delay(DELAY_IN_SECONDS.ONE);
      await page.keyboard.press(`${modifier}+KeyC`);
      await page.keyboard.press(`${modifier}+KeyV`, { delay: INPUT_DELAY });
      await clickOnTheCanvas(page, 0, -100);
    });

    test('Select the whole reaction and move it, Undo, Erase tool', async ({
      page,
    }) => {
      await page.keyboard.press(`${modifier}+KeyA`);
      await delay(DELAY_IN_SECONDS.ONE);
      await page.keyboard.press(`${modifier}+KeyC`);
      await page.mouse.move(point.x - 100, point.y - 100);
      await page.keyboard.press(`${modifier}+KeyV`, { delay: INPUT_DELAY });
      await takeEditorScreenshot(page);
      await page.keyboard.press('Escape');
      await takeEditorScreenshot(page);
      await selectLeftPanelButton(LeftPanelButton.Erase, page);
      await page.mouse.move(point.x - 300, point.y - 100);
      await dragMouseTo(point.x - 140, point.y + 100, page);
    });
  });
  test.describe('Non-default Reaction Arrow Tool - Manipulations with different tool', () => {
    /**
     * Test case: EPMLSOPKET-2250
     *Description: Non-default Reaction Arrow Tool - Manipulations with different tools
     */
    let point: Point;
    test.beforeEach(async ({ page }) => {
      await openFileAndAddToCanvas('benzene-and-cyclopentadiene.mol', page);
      await selectNestedTool(page, ArrowTool.ARROW_EQUILIBRIUM_FILLED_HALF_BOW);
      await clickOnTheCanvas(page, -40, 0);
      point = await getCoordinatesOfTheMiddleOfTheScreen(page);
      await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    });

    test('Select the reaction arrow and move it', async ({ page }) => {
      await page.mouse.move(point.x + 60, point.y);
      await dragMouseTo(point.x + 60, point.y - 40, page);
    });

    test('Select the reaction arrow with any reaction component(s) and move them', async ({
      page,
    }) => {
      await page.mouse.move(point.x - 40, point.y - 300);
      await dragMouseTo(point.x + 400, point.y + 100, page);
      await moveMouseToTheMiddleOfTheScreen(page);
      await dragMouseTo(point.x + 300, point.y - 100, page);
    });

    test('Select the whole reaction and move it', async ({ page }) => {
      await page.keyboard.press(`${modifier}+KeyA`);
      await moveMouseToTheMiddleOfTheScreen(page);
      await dragMouseTo(point.x - 100, point.y - 100, page);
    });

    test('Select reaction arrow, cut and paste it onto the canvas', async ({
      page,
    }) => {
      await page.mouse.click(point.x + 60, point.y);
      await delay(DELAY_IN_SECONDS.ONE);
      await page.keyboard.press(`${modifier}+KeyX`);
      await page.keyboard.press(`${modifier}+KeyV`, { delay: INPUT_DELAY });
      await clickOnTheCanvas(page, 0, -100);
    });
    test('Select a part of the reaction with the equilibrium arrow, cut and paste it onto canvas.', async ({
      page,
    }) => {
      await page.mouse.move(point.x - 40, point.y - 300);
      await dragMouseTo(point.x + 400, point.y + 100, page);
      await delay(DELAY_IN_SECONDS.ONE);
      await page.keyboard.press(`${modifier}+KeyX`);
      await page.keyboard.press(`${modifier}+KeyV`, { delay: INPUT_DELAY });
      await clickOnTheCanvas(page, 0, -100);
    });

    test('Select reaction arrow, copy and paste it onto the canvas', async ({
      page,
    }) => {
      await page.mouse.click(point.x + 60, point.y);
      await delay(DELAY_IN_SECONDS.ONE);
      await page.keyboard.press(`${modifier}+KeyC`);
      await page.keyboard.press(`${modifier}+KeyV`, { delay: INPUT_DELAY });
      await clickOnTheCanvas(page, 0, -100);
      await screenshotBetweenUndoRedo(page);
    });

    test('Click the equilibrium arrow with the Erase tool, Undo, Erase for part of reaction, Undo/Redo', async ({
      page,
    }) => {
      await selectLeftPanelButton(LeftPanelButton.Erase, page);
      await clickOnTheCanvas(page, -60, 0);
      await takeEditorScreenshot(page);
      await selectTopPanelButton(TopPanelButton.Undo, page);
      await takeEditorScreenshot(page);
      await selectLeftPanelButton(LeftPanelButton.Erase, page);
      await page.mouse.move(point.x - 40, point.y - 300);
      await dragMouseTo(point.x + 400, point.y + 100, page);
      await moveMouseToTheMiddleOfTheScreen(page);
      await dragMouseTo(point.x + 300, point.y - 100, page);
      await screenshotBetweenUndoRedo(page);
    });
  });

  test('Actions on the reaction with non-default reaction arrows', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-2881
     * Description: Actions on the reaction with non-default reaction arrows
     */
    await openFileAndAddToCanvas('benzene-and-cyclopentadiene.mol', page);
    await selectNestedTool(page, ArrowTool.ARROW_FAILED);
    const point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await page.mouse.move(point.x - 30, point.y);
    await dragMouseTo(point.x + 20, point.y + 50, page);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Clean, page);
    await delay(DELAY_IN_SECONDS.FIVE);
  });

  test('Save plus sign and arrow', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1793
     * Description: Save plus sign and arrow
     */

    await selectLeftPanelButton(LeftPanelButton.ReactionPlusTool, page);
    await clickInTheMiddleOfTheScreen(page);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await takeEditorScreenshot(page);
    await selectLeftPanelButton(LeftPanelButton.ArrowOpenAngleTool, page);
    const offsetFromCenter = -35;
    await clickOnTheCanvas(page, offsetFromCenter, 0);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  });

  test.describe('Save multiple reaction arrows', () => {
    /**
     * Test case: EPMLSOPKET-2251
     * Description: Save/Open structure with non-default reaction in KET file
     */
    test('add default arrow and save in KET file', async ({ page }) => {
      await openFileAndAddToCanvas('benzene-and-cyclopentadiene.mol', page);
      await selectNestedTool(page, ArrowTool.ARROW_OPEN_ANGLE);
      const offsetFromCenter = -35;
      await clickOnTheCanvas(page, offsetFromCenter, 0);
      await clickOnTheCanvas(page, offsetFromCenter, offsetFromCenter);
      await delay(DELAY_IN_SECONDS.THREE);
      await saveStructureWithReaction(page, 'Ket Format');
    });

    test('open file', async ({ page }) => {
      await openFileAndAddToCanvas(
        'KET/default-reaction-arrow-tool-saving.ket',
        page,
      );
    });
  });

  test.describe('Multiple Non-default Reaction Arrows - Saving', () => {
    /**
     * Test case: EPMLSOPKET-2252
     * Description: Save/Open structure with non-default reaction in KET file
     */
    test('add non default arrow and save in KET file', async ({ page }) => {
      await openFileAndAddToCanvas('benzene-and-cyclopentadiene.mol', page);
      await selectNestedTool(page, ArrowTool.ARROW_EQUILIBRIUM_FILLED_HALF_BOW);
      const offsetFromCenter = -35;
      await clickOnTheCanvas(page, offsetFromCenter, 0);
      await clickOnTheCanvas(page, offsetFromCenter, offsetFromCenter);
      await delay(DELAY_IN_SECONDS.ONE);
      await saveStructureWithReaction(page, 'Ket Format');
    });

    test('open file', async ({ page }) => {
      await openFileAndAddToCanvas(
        'KET/non-default-reaction-arrow-tool-saving.ket',
        page,
      );
    });
  });

  test.describe('Non-default Reaction Arrow Tool - Saving', () => {
    /**
     * Test case: EPMLSOPKET-2867
     * Description: Save/Open structure with non-default reaction in RXN file
     */
    test('add non default arrow and save in RXN file', async ({ page }) => {
      await openFileAndAddToCanvas('benzene-and-cyclopentadiene.mol', page);
      await selectNestedTool(page, ArrowTool.ARROW_EQUILIBRIUM_FILLED_HALF_BOW);
      await clickOnTheCanvas(page, xOffsetFromCenter, 0);
      await delay(DELAY_IN_SECONDS.THREE);
      await saveStructureWithReaction(page);
    });

    test('open file', async ({ page }) => {
      await openFileAndAddToCanvas(
        'non-default-reaction-arrow-tool-saving.rxn',
        page,
      );
    });
  });

  test.describe(' Save multiple reaction arrows - All formats', () => {
    /**
     * Test case: EPMLSOPKET-2275
     * Description:  Save multiple reaction arrows - All formats
     */
    for (const { name, fileExtension } of formatsForSave) {
      test(`save in ${fileExtension} file`, async ({ page }) => {
        await openFileAndAddToCanvas('benzene-and-cyclopentadiene.mol', page);
        await selectNestedTool(page, ArrowTool.ARROW_OPEN_ANGLE);
        await clickOnTheCanvas(page, xOffsetFromCenter, 15);
        await clickOnTheCanvas(page, xOffsetFromCenter, -15);
        await delay(DELAY_IN_SECONDS.FIVE);
        await saveStructureWithReaction(page, name);
      });

      test(`open ${fileExtension} file`, async ({ page }) => {
        await openFileAndAddToCanvas(
          `default-reaction-arrow-tool-saving.${fileExtension}`,
          page,
        );
      });
    }
  });

  test.describe(' Save non-default reaction arrows - All formats', () => {
    /**
     * Test case: EPMLSOPKET-2868
     * Description:  Save non-default reaction arrows - All formats
     */
    for (const { name, fileExtension } of formatsForSave) {
      test(`save in ${fileExtension} file`, async ({ page }) => {
        await openFileAndAddToCanvas('benzene-and-cyclopentadiene.mol', page);
        await selectNestedTool(page, ArrowTool.ARROW_EQUILIBRIUM_OPEN_ANGLE);
        await clickOnTheCanvas(page, xOffsetFromCenter, 0);
        await delay(DELAY_IN_SECONDS.THREE);
        await saveStructureWithReaction(page, name);
      });

      test(`open ${fileExtension} file`, async ({ page }) => {
        await openFileAndAddToCanvas(
          `non-default-reaction-arrow-tool-saving.${fileExtension}`,
          page,
        );
      });
    }
  });

  test.describe('Resizing reaction arrow - Saving', () => {
    /**
     *  Test case: EPMLSOPKET-2869
     * Description: Resizing reaction arrow - Saving
     */
    test('Resize and save', async ({ page }) => {
      await openFileAndAddToCanvas('benzene-and-cyclopentadiene.mol', page);
      await selectNestedTool(page, ArrowTool.ARROW_FILLED_BOW);
      await clickOnTheCanvas(page, xOffsetFromCenter, 0);
      const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
      await page.mouse.move(x - 35, y - 1);
      dragMouseTo(x - 25, y - 50, page);
      await delay(DELAY_IN_SECONDS.TWO);
      await saveStructureWithReaction(page);
      await delay(DELAY_IN_SECONDS.TWO);
      await saveStructureWithReaction(page, 'Ket Format');
    });

    test('open files', async ({ page }) => {
      await openFileAndAddToCanvas(`resizing-reaction-arrow-saving.rxn`, page);
      await takeEditorScreenshot(page);
      await selectTopPanelButton(TopPanelButton.Clear, page);
      await openFileAndAddToCanvas(
        `KET/resizing-reaction-arrow-saving.ket`,
        page,
      );
    });
  });

  test('Check that pressing Clear Canvas with Reaction Arrow under mouse cursor does not cause errors in DevTool console', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-12971
     * Description:  Check that pressing Clear Canvas with Reaction Arrow under mouse cursor doesn't cause errors in DevTool console
     */
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    await selectNestedTool(page, ArrowTool.ARROW_EQUILIBRIUM_OPEN_ANGLE);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await clickInTheMiddleOfTheScreen(page);
    await delay(DELAY_IN_SECONDS.ONE);
    await page.keyboard.press(`${modifier}+KeyC`);
    await page.keyboard.press(`${modifier}+KeyV`, { delay: INPUT_DELAY });
    await selectTopPanelButton(TopPanelButton.Clear, page);
  });

  test.describe('Arrow snapping', () => {
    let point: Point;
    test.beforeEach(async ({ page }) => {
      await selectNestedTool(page, ArrowTool.ARROW_FILLED_TRIANGLE);
      await moveMouseToTheMiddleOfTheScreen(page);
      point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    });

    test('to Horizontal Position with Angle greater than 15 Degrees', async ({
      page,
    }) => {
      /**
       * Test case: Test case: EPMLSOPKET-15546
       * Description: Arrow Snapping to Horizontal Position with Angle greater than 15 Degrees
       */
      await page.mouse.down();
      await page.mouse.move(point.x + 100, point.y - 50);
    });

    test('to Vertical Position greater than 15 Degrees', async ({ page }) => {
      /**
       * Test case: Test case: EPMLSOPKET-15548
       * Description: Arrow Snapping to Vertical Position with Angle ≤ 15 Degrees
       */
      await page.mouse.down();
      await page.mouse.move(point.x + 100, point.y - 50);
    });

    test('to Horizontal Position with Angle ≤ 15 Degrees', async ({ page }) => {
      /**
       * Test case: Test case: EPMLSOPKET-15548
       * Description: Arrow Snapping to Horizontal Position with Angle ≤ 15 Degrees
       */
      await page.mouse.down();
      await page.mouse.move(point.x + 100, point.y - 20);
      await takeEditorScreenshot(page);
      await page.mouse.up();
    });

    test('to Vertical Position with Angle ≤ 15 Degrees', async ({ page }) => {
      /**
       * Test case: Test case: EPMLSOPKET-15549
       * Description: Arrow Snapping to Vertical Position with Angle ≤ 15 Degrees
       */
      await page.mouse.down();
      await page.mouse.move(point.x + 20, point.y - 100);
      await takeEditorScreenshot(page);
      await page.mouse.up();
    });

    test('to Horizontal Position with Ctrl Key Pressed', async ({ page }) => {
      /**
       * Test case: Test case: EPMLSOPKET-15550
       * Description: Arrow Snapping to Horizontal Position with Ctrl Key Pressed
       */
      const x = point.x + 100;
      const modifier = getControlModifier();
      await page.keyboard.down(modifier);
      await page.mouse.down();

      await page.mouse.move(x, point.y - 50);
      await takeEditorScreenshot(page);
      await page.mouse.move(x, point.y - 20);
      await takeEditorScreenshot(page);
      await page.mouse.move(x, point.y);
      await takeEditorScreenshot(page);
      await page.mouse.up();
    });

    test('to Vertical Position with Ctrl Key Pressed', async ({ page }) => {
      /**
       * Test case: Test case: EPMLSOPKET-15551
       * Description: Arrow Snapping to Vertical Position with Ctrl Key Pressed
       */
      const y = point.y - 100;
      const modifier = getControlModifier();
      await page.keyboard.down(modifier);
      await page.mouse.down();

      await page.mouse.move(point.x + 50, y);
      await takeEditorScreenshot(page);
      await page.mouse.move(point.x + 20, y);
      await takeEditorScreenshot(page);
      await page.mouse.move(point.x, y);
      await takeEditorScreenshot(page);
      await page.mouse.up();
    });
  });

  for (const [_, id] of Object.values(ArrowTool)) {
    test(`${id} should have correct naming`, async ({ page }) => {
      /**
       * Test case: Test case: EPMLSOPKET - 16947
       * Description:  All Arrows should have correct tooltip
       */

      await selectLeftPanelButton(LeftPanelButton.ArrowOpenAngleTool, page);
      await selectLeftPanelButton(LeftPanelButton.ArrowOpenAngleTool, page);
      const button = page.getByTestId(id).first();
      expect(button).toHaveAttribute('title', idToTitle[id]);
      await button.click();
      await clickInTheMiddleOfTheScreen(page);
    });
  }
});
