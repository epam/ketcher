/* eslint-disable no-magic-numbers */
import { test, expect, Page } from '@fixtures';
import {
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  getControlModifier,
  Point,
  waitForPageInit,
  waitForRender,
  copyToClipboardByKeyboard,
  cutToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  clickOnCanvas,
  resetZoomLevelToDefault,
} from '@utils';
import {
  copyAndPaste,
  cutAndPaste,
  selectAllStructuresOnCanvas,
} from '@utils/canvas/selectSelection';
import {
  saveStructureWithReaction,
  selectRectangleArea,
} from '@utils/canvas/tools/helpers';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { ArrowType } from '@tests/pages/constants/arrowSelectionTool/Constants';
import { INPUT_DELAY } from '@utils/globals';

const xOffsetFromCenter = -35;
const idToTitle: {
  [key: string]: string;
} = {
  'reaction-arrow-open-angle': 'Arrow Open Angle Tool',
  'reaction-arrow-filled-triangle': 'Arrow Filled Triangle Tool',
  'reaction-arrow-filled-bow': 'Arrow Filled Bow Tool',
  'reaction-arrow-dashed-open-angle': 'Arrow Dashed Open Angle Tool',
  'reaction-arrow-failed': 'Failed Arrow Tool',
  'reaction-arrow-retrosynthetic': 'Retrosynthetic Arrow Tool',
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
    name: MoleculesFileFormatType.DaylightSMILES,
    fileExtension: 'smi',
  },
  {
    name: MoleculesFileFormatType.ExtendedSMILES,
    fileExtension: 'cxsmi',
  },
  {
    name: MoleculesFileFormatType.CML,
    fileExtension: 'cml',
  },
];

const OFFSET_FROM_ARROW = 15;

test.describe('Plus and Arrows tools ', () => {
  const CANVAS_CLICK_X = 300;
  const CANVAS_CLICK_Y = 300;

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.describe('Create reactions', () => {
    /**
     * Test case: EPMLSOPKET-1783
     * Description: Create Reactions
     */
    let counter = 1;
    for (const tool of Object.values(ArrowType)) {
      test(` ${counter}. ${tool} check`, async ({ page }) => {
        await openFileAndAddToCanvas(
          page,
          'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
        );
        await LeftToolbar(page).selectArrowTool(tool);
        await clickOnCanvas(page, xOffsetFromCenter, 0, { from: 'pageCenter' });
        await takeEditorScreenshot(page);
        await CommonTopLeftToolbar(page).undo();
        await takeEditorScreenshot(page);
      });
      counter++;
    }
  });

  test('Resizing arrow', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1784
     * Description: Arrow is resized correctly
     */
    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + 100, y + 100, page);
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await takeEditorScreenshot(page);
    await page.mouse.move(x + 98, y + 98);
    await dragMouseTo(x + 150, y + 150, page);
    await takeEditorScreenshot(page);
  });

  test('Copy/paste, cut/paste arrow', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-2872
     * Description: Copy/cut/paste reaction tools
     */
    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + 100, y + 100, page);
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await cutAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      maxDiffPixels: 1,
    });
    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);
  });

  test('Verify reaction is registered in undo/redo chain', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1790
     * Description: Verify reaction is registered in undo/redo chain
     */
    const xOffsetFromCenter1 = -235;
    const xOffsetFromCenter2 = 235;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/four-structures.mol');
    await LeftToolbar(page).reactionPlusTool();
    await clickOnCanvas(page, xOffsetFromCenter1, 0, { from: 'pageCenter' });
    await clickOnCanvas(page, xOffsetFromCenter2, 0, { from: 'pageCenter' });
    await takeEditorScreenshot(page);

    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
    await clickOnCanvas(page, -80, 0, { from: 'pageCenter' });
    await takeEditorScreenshot(page);

    await CommonLeftToolbar(page).erase();
    await clickOnCanvas(page, -60, 0, { from: 'pageCenter' });
    await takeEditorScreenshot(page);

    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
    await clickOnCanvas(page, xOffsetFromCenter1, -100, { from: 'pageCenter' });
    await LeftToolbar(page).reactionPlusTool();
    await clickOnCanvas(page, xOffsetFromCenter2, -100, { from: 'pageCenter' });
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await CommonTopLeftToolbar(page).redo();
    }
    await takeEditorScreenshot(page);
  });

  test.describe('Plus sign - Manipulations with different Tools', () => {
    /**
     * Test case: EPMLSOPKET - 1791
     * Description: Plus sign - Manipulations with different Tools
     */
    let point: Point;
    test.beforeEach(async ({ page }) => {
      await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction-3.rxn');
      await CommonLeftToolbar(page).areaSelectionTool(
        SelectionToolType.Rectangle,
      );
      point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    });

    test('Select the plus sign and move it', async ({ page }) => {
      await waitForRender(page, async () => {
        await page.mouse.move(point.x - 150, point.y - 10);
        await dragMouseTo(point.x - 150, point.y - 40, page);
      });
    });

    test('Select the plus sign with any reaction component(s) and move them', async ({
      page,
    }) => {
      await waitForRender(page, async () => {
        await page.mouse.move(point.x - 300, point.y - 100);
        await dragMouseTo(point.x - 140, point.y + 100, page);
      });

      await waitForRender(page, async () => {
        await page.mouse.move(point.x - 200, point.y - 20);
        await dragMouseTo(point.x - 300, point.y - 100, page);
      });
    });

    test('Select the whole reaction and move it', async ({ page }) => {
      await waitForRender(page, async () => {
        await selectAllStructuresOnCanvas(page);
        await page.mouse.move(point.x - 20, point.y - 20);
      });
      await dragMouseTo(point.x - 100, point.y - 100, page);
    });

    test.skip(
      // Consider refactoring of this test since it doesn't work
      'Select plus sign, cut and paste it onto the canvas',
      {
        tag: ['@FlackyTest'],
      },
      async ({ page }) => {
        await clickOnCanvas(page, point.x - 200, point.y + 15, {
          from: 'pageTopLeft',
        });
        await selectRectangleArea(
          page,
          point.x - 200 - 20,
          point.y + 15 - 20,
          point.x - 200 + 20,
          point.y + 15 + 20,
        );
        await cutToClipboardByKeyboard(page);
        await pasteFromClipboardByKeyboard(page);
        // await TopToolbar(page).cut();
        // await waitForSpinnerFinishedWork(
        //   page,
        //   async () => await TopToolbar(page).cut(),
        // );

        // await pasteFromClipboardByKeyboard(page);
        // await waitForSpinnerFinishedWork(
        //   page,
        //   async () => await pasteFromClipboardByKeyboard(page);
        // );

        await clickOnCanvas(page, 0, -100, { from: 'pageCenter' });
      },
    );

    test.skip('Select plus sign, copy and paste it onto the canvas', async ({
      // Consider refactoring of this test since it doesn't work
      // Selection of plus sign doesn't happen and the rest of the scrips works wrong
      page,
    }) => {
      await clickOnCanvas(page, point.x - 150, point.y - 10, {
        from: 'pageTopLeft',
      });
      await copyToClipboardByKeyboard(page);
      await pasteFromClipboardByKeyboard(page);

      await clickOnCanvas(page, 0, -100, { from: 'pageCenter' });
    });

    test('Select the whole reaction and move it, Undo, Erase tool', async ({
      page,
    }) => {
      await copyAndPaste(page);
      await clickOnCanvas(page, point.x - 100, point.y - 100, {
        from: 'pageTopLeft',
      });
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).undo();
      await takeEditorScreenshot(page);
      await CommonLeftToolbar(page).erase();
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
      await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction-3.rxn');
      await CommonLeftToolbar(page).areaSelectionTool(
        SelectionToolType.Rectangle,
      );
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
      await selectAllStructuresOnCanvas(page);
      await page.mouse.move(point.x - 20, point.y - 20);
      await dragMouseTo(point.x - 100, point.y - 100, page);
    });

    test('Select reaction arrow, cut and paste it onto the canvas', async ({
      page,
    }) => {
      await clickOnCanvas(page, point.x + 60, point.y, { from: 'pageTopLeft' });
      await cutToClipboardByKeyboard(page);
      await pasteFromClipboardByKeyboard(page);

      await clickOnCanvas(page, 0, -100, { from: 'pageCenter' });
    });

    test(
      'Select reaction arrow, copy and paste it onto the canvas',
      {
        tag: ['@FlakyTest'],
      },
      async ({ page }) => {
        await clickOnCanvas(page, point.x + 60, point.y, {
          from: 'pageTopLeft',
        });
        await copyToClipboardByKeyboard(page);
        await pasteFromClipboardByKeyboard(page, { delay: INPUT_DELAY });

        await clickOnCanvas(page, 0, -100, { from: 'pageCenter' });
      },
    );

    test('Select the whole reaction and move it, Undo, Erase tool', async ({
      page,
    }) => {
      await copyAndPaste(page);
      await clickOnCanvas(page, point.x - 100, point.y - 100, {
        from: 'pageTopLeft',
      });
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).undo();
      await takeEditorScreenshot(page);
      await CommonLeftToolbar(page).erase();
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
      await configureInitialState(page);
    });

    async function configureInitialState(page: Page) {
      await openFileAndAddToCanvas(
        page,
        'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
      );
      await resetZoomLevelToDefault(page);
      await LeftToolbar(page).selectArrowTool(
        ArrowType.ArrowEquilibriumFilledHalfBow,
      );
      await clickOnCanvas(page, -40, 0, { from: 'pageCenter' });
      point = await getCoordinatesOfTheMiddleOfTheScreen(page);
      await CommonLeftToolbar(page).areaSelectionTool(
        SelectionToolType.Rectangle,
      );
    }

    test('Select the reaction arrow and move it', async ({ page }) => {
      await page.mouse.move(point.x + OFFSET_FROM_ARROW, point.y);
      await dragMouseTo(point.x + OFFSET_FROM_ARROW, point.y - 40, page);
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
      await selectAllStructuresOnCanvas(page);
      await moveMouseToTheMiddleOfTheScreen(page);
      await dragMouseTo(point.x - 100, point.y - 100, page);
    });

    test('Select reaction arrow, cut and paste it onto the canvas', async ({
      page,
    }) => {
      await clickOnCanvas(page, point.x + OFFSET_FROM_ARROW, point.y, {
        from: 'pageTopLeft',
      });
      await cutToClipboardByKeyboard(page);
      await pasteFromClipboardByKeyboard(page, { delay: INPUT_DELAY });
      await clickOnCanvas(page, 0, -100, { from: 'pageCenter' });
    });

    test('Select a part of the reaction with the equilibrium arrow, cut and paste it onto canvas.', async ({
      page,
    }) => {
      await page.mouse.move(point.x - 40, point.y - 300);
      await dragMouseTo(point.x + 400, point.y + 100, page);

      await cutToClipboardByKeyboard(page);
      await pasteFromClipboardByKeyboard(page, { delay: INPUT_DELAY });

      await clickOnCanvas(page, 0, -100, { from: 'pageCenter' });
    });

    test('Select reaction arrow, copy and paste it onto the canvas', async ({
      page,
    }) => {
      await clickOnCanvas(page, point.x + OFFSET_FROM_ARROW, point.y, {
        from: 'pageTopLeft',
      });

      await copyToClipboardByKeyboard(page);
      await pasteFromClipboardByKeyboard(page);

      await clickOnCanvas(page, 0, -100, { from: 'pageCenter' });
      await CommonTopLeftToolbar(page).undo();
      await takeEditorScreenshot(page, {
        maxDiffPixels: 1,
      });
      await CommonTopLeftToolbar(page).redo();
    });

    test('Click the equilibrium arrow with the Erase tool, Undo, Erase for part of reaction, Undo/Redo', async ({
      page,
    }) => {
      await CommonLeftToolbar(page).erase();
      await clickOnCanvas(page, -OFFSET_FROM_ARROW, 0, { from: 'pageCenter' });
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).undo();
      await takeEditorScreenshot(page);
      await CommonLeftToolbar(page).erase();
      await page.mouse.move(point.x - 40, point.y - 300);
      await dragMouseTo(point.x + 400, point.y + 100, page);
      await moveMouseToTheMiddleOfTheScreen(page);
      await dragMouseTo(point.x + 300, point.y - 100, page);
      await CommonTopLeftToolbar(page).undo();
      await takeEditorScreenshot(page, {
        maxDiffPixels: 1,
      });
      await CommonTopLeftToolbar(page).redo();
    });
  });

  test('Actions on the reaction with non-default reaction arrows', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-2881
     * Description: Actions on the reaction with non-default reaction arrows
     */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
    );
    await LeftToolbar(page).selectArrowTool(ArrowType.FailedArrow);
    const point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await page.mouse.move(point.x - 30, point.y);
    await dragMouseTo(point.x + 20, point.y + 50, page);
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
    await IndigoFunctionsToolbar(page).cleanUp();
  });

  test('Save plus sign and arrow', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1793
     * Description: Save plus sign and arrow
     */
    await LeftToolbar(page).reactionPlusTool();
    await clickInTheMiddleOfTheScreen(page);
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).cancel();
    await takeEditorScreenshot(page);
    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
    const offsetFromCenter = -35;
    await clickOnCanvas(page, offsetFromCenter, 0, { from: 'pageCenter' });
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).cancel();
  });

  test.describe('Save multiple reaction arrows', () => {
    /**
     * Test case: EPMLSOPKET-2251
     * Description: Save/Open structure with non-default reaction in KET file
     */
    test('add default arrow and save in KET file', async ({ page }) => {
      await openFileAndAddToCanvas(
        page,
        'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
      );
      await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
      const offsetFromCenter = -35;
      await clickOnCanvas(page, offsetFromCenter, 0, { from: 'pageCenter' });
      await clickOnCanvas(page, offsetFromCenter, offsetFromCenter, {
        from: 'pageCenter',
      });
      await saveStructureWithReaction(page, MoleculesFileFormatType.KetFormat);
    });

    test('open file', async ({ page }) => {
      await openFileAndAddToCanvas(
        page,
        'KET/default-reaction-arrow-tool-saving.ket',
      );
    });
  });

  test.describe('Multiple Non-default Reaction Arrows - Saving', () => {
    /**
     * Test case: EPMLSOPKET-2252
     * Description: Save/Open structure with non-default reaction in KET file
     */
    test('add non default arrow and save in KET file', async ({ page }) => {
      await openFileAndAddToCanvas(
        page,
        'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
      );
      await LeftToolbar(page).selectArrowTool(
        ArrowType.ArrowEquilibriumFilledHalfBow,
      );
      const offsetFromCenter = -35;
      await clickOnCanvas(page, offsetFromCenter, 0, { from: 'pageCenter' });
      await clickOnCanvas(page, offsetFromCenter, offsetFromCenter, {
        from: 'pageCenter',
      });
      await saveStructureWithReaction(page, MoleculesFileFormatType.KetFormat);
    });

    test('open file', async ({ page }) => {
      await openFileAndAddToCanvas(
        page,
        'KET/non-default-reaction-arrow-tool-saving.ket',
      );
    });
  });

  test.describe('Non-default Reaction Arrow Tool - Saving', () => {
    /**
     * Test case: EPMLSOPKET-2867
     * Description: Save/Open structure with non-default reaction in RXN file
     */
    test('add non default arrow and save in RXN file', async ({ page }) => {
      await openFileAndAddToCanvas(
        page,
        'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
      );
      await LeftToolbar(page).selectArrowTool(
        ArrowType.ArrowEquilibriumFilledHalfBow,
      );
      await clickOnCanvas(page, xOffsetFromCenter, 0, { from: 'pageCenter' });
      await saveStructureWithReaction(page);
    });

    test('open file', async ({ page }) => {
      await openFileAndAddToCanvas(
        page,
        'Other-Files/non-default-reaction-arrow-tool-saving.rxn',
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
        await openFileAndAddToCanvas(
          page,
          'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
        );
        await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
        await clickOnCanvas(page, xOffsetFromCenter, 15, {
          from: 'pageCenter',
        });
        await clickOnCanvas(page, xOffsetFromCenter, -15, {
          from: 'pageCenter',
        });
        await saveStructureWithReaction(page, name);
      });

      test(`open ${fileExtension} file`, async ({ page }) => {
        await openFileAndAddToCanvas(
          page,
          `Other-Files/default-reaction-arrow-tool-saving.${fileExtension}`,
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
        await openFileAndAddToCanvas(
          page,
          'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
        );
        await LeftToolbar(page).selectArrowTool(
          ArrowType.ArrowEquilibriumOpenAngle,
        );
        await clickOnCanvas(page, xOffsetFromCenter, 0, { from: 'pageCenter' });
        await saveStructureWithReaction(page, name);
      });

      test(`open ${fileExtension} file`, async ({ page }) => {
        await openFileAndAddToCanvas(
          page,
          `Other-Files/non-default-reaction-arrow-tool-saving.${fileExtension}`,
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
      await openFileAndAddToCanvas(
        page,
        'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
      );
      await LeftToolbar(page).selectArrowTool(ArrowType.ArrowFilledBow);
      await clickOnCanvas(page, xOffsetFromCenter, 0, { from: 'pageCenter' });
      const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
      await page.mouse.move(x - 35, y - 1);
      await dragMouseTo(x - 25, y - 50, page);
      await saveStructureWithReaction(page);
      await saveStructureWithReaction(page, MoleculesFileFormatType.KetFormat);
    });

    test('open files', async ({ page }) => {
      /*
       */
      await openFileAndAddToCanvas(
        page,
        `Rxn-V2000/resizing-reaction-arrow-saving.rxn`,
      );
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).clearCanvas();
      await openFileAndAddToCanvas(
        page,
        `KET/resizing-reaction-arrow-saving.ket`,
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
    await LeftToolbar(page).selectArrowTool(
      ArrowType.ArrowEquilibriumOpenAngle,
    );
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickInTheMiddleOfTheScreen(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page, { delay: INPUT_DELAY });

    await CommonTopLeftToolbar(page).clearCanvas();
  });

  test.describe('Arrow snapping', () => {
    let point: Point;
    test.beforeEach(async ({ page }) => {
      await LeftToolbar(page).selectArrowTool(ArrowType.ArrowFilledTriangle);
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

  for (const arrow of Object.values(ArrowType)) {
    test(`${arrow} should have correct naming`, async ({ page }) => {
      /**
       * Test case: Test case: EPMLSOPKET - 16947
       * Description:  All Arrows should have correct tooltip
       */
      await LeftToolbar(page).expandArrowToolsDropdown();
      const button = page.locator(
        `.default-multitool-dropdown [data-testid="${arrow}"]`,
      );
      await expect(button).toHaveAttribute('title', idToTitle[arrow]);
      await button.click();
      await clickInTheMiddleOfTheScreen(page);
    });
  }

  test('Resizing retrosynthetic arrow', async ({ page }) => {
    /**
     * Test case: #4985
     * Description: Retrosynthetic Arrow is resized correctly
     */
    await LeftToolbar(page).selectArrowTool(ArrowType.RetrosyntheticArrow);
    await clickOnCanvas(page, xOffsetFromCenter, 0, { from: 'pageCenter' });
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + 200, y + 200, page);
  });

  test('Copy/paste retrosynthetic arrow', async ({ page }) => {
    /**
    Test case: #4985
    Description: Retrosynthetic Arrow Copy/paste
     */
    await LeftToolbar(page).selectArrowTool(ArrowType.RetrosyntheticArrow);
    await clickInTheMiddleOfTheScreen(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      maxDiffPixels: 1,
    });
    await CommonTopLeftToolbar(page).redo();
  });

  test('Cut/paste retrosynthetic arrow', async ({ page }) => {
    /**
    Test case: #4985
    Description: Retrosynthetic Arrow Cut/paste
     */
    await LeftToolbar(page).selectArrowTool(ArrowType.RetrosyntheticArrow);
    await clickInTheMiddleOfTheScreen(page);
    await cutAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      maxDiffPixels: 1,
    });
    await CommonTopLeftToolbar(page).redo();
  });
});
