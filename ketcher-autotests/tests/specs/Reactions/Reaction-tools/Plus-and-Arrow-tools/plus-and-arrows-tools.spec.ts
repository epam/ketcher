/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-magic-numbers */
import { test, expect, Page } from '@fixtures';
import {
  takeEditorScreenshot,
  clickInTheMiddleOfTheCanvas,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  Point,
  waitForRender,
  copyToClipboardByKeyboard,
  cutToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  clickOnCanvas,
  resetZoomLevelToDefault,
  Arrows,
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
import { getArrowLocator } from '@utils/canvas/arrow-signes/getArrow';

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

let page: Page;
test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

test.describe('Plus and Arrows tools ', () => {
  test.describe('Create reactions', () => {
    /**
     * Test case: EPMLSOPKET-1783
     * Description: Create Reactions
     */
    let counter = 1;
    for (const tool of Object.values(ArrowType)) {
      test(` ${counter}. ${tool} check`, async () => {
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

  test('Resizing arrow', async () => {
    /**
     * Test case: EPMLSOPKET-1784
     * Description: Arrow is resized correctly
     */
    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(page, x + 100, y + 100);
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await takeEditorScreenshot(page);
    await page.mouse.move(x + 98, y + 98);
    await dragMouseTo(page, x + 150, y + 150);
    await takeEditorScreenshot(page);
  });

  test('Copy/paste, cut/paste arrow', async () => {
    /**
     * Test case: EPMLSOPKET-2872
     * Description: Copy/cut/paste reaction tools
     */
    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(page, x + 100, y + 100);
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, 300, 300, {
      from: 'pageTopLeft',
    });
    await cutAndPaste(page);
    await clickOnCanvas(page, 300, 300, {
      from: 'pageTopLeft',
    });
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      maxDiffPixels: 1,
    });
    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);
  });

  test('Verify reaction is registered in undo/redo chain', async () => {
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
    test.beforeEach(async ({ MoleculesCanvas: _ }) => {
      await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction-3.rxn');
      await CommonLeftToolbar(page).areaSelectionTool(
        SelectionToolType.Rectangle,
      );
      point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    });

    test('Select the plus sign and move it', async () => {
      await waitForRender(page, async () => {
        await page.mouse.move(point.x - 150, point.y - 10);
        await dragMouseTo(page, point.x - 150, point.y - 40);
      });
    });

    test('Select the plus sign with any reaction component(s) and move them', async () => {
      await waitForRender(page, async () => {
        await page.mouse.move(point.x - 300, point.y - 100);
        await dragMouseTo(page, point.x - 140, point.y + 100);
      });

      await waitForRender(page, async () => {
        await page.mouse.move(point.x - 200, point.y - 20);
        await dragMouseTo(page, point.x - 300, point.y - 100);
      });
    });

    test('Select the whole reaction and move it', async () => {
      await waitForRender(page, async () => {
        await selectAllStructuresOnCanvas(page);
        await page.mouse.move(point.x - 20, point.y - 20);
      });
      await dragMouseTo(page, point.x - 100, point.y - 100);
    });

    test.skip(
      // Consider refactoring of this test since it doesn't work
      'Select plus sign, cut and paste it onto the canvas',
      {
        tag: ['@FlackyTest'],
      },
      async () => {
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

        await clickOnCanvas(page, 0, -100, { from: 'pageCenter' });
      },
    );

    test.skip('Select plus sign, copy and paste it onto the canvas', async () => {
      // Consider refactoring of this test since it doesn't work
      // Selection of plus sign doesn't happen and the rest of the scrips works wrong
      await clickOnCanvas(page, point.x - 150, point.y - 10, {
        from: 'pageTopLeft',
      });
      await copyToClipboardByKeyboard(page);
      await pasteFromClipboardByKeyboard(page);

      await clickOnCanvas(page, 0, -100, { from: 'pageCenter' });
    });

    test('Select the whole reaction and move it, Undo, Erase tool', async () => {
      await copyAndPaste(page);
      await clickOnCanvas(page, point.x - 100, point.y - 100, {
        from: 'pageTopLeft',
      });
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).undo();
      await takeEditorScreenshot(page);
      await CommonLeftToolbar(page).erase();
      await page.mouse.move(point.x - 300, point.y - 100);
      await dragMouseTo(page, point.x - 140, point.y + 100);
    });
  });
  test.describe('Reaction Arrow - Manipulations with different Tools', () => {
    /**
     * Test case: EPMLSOPKET - 1792
     * Description: Reaction Arrow - Manipulations with different Tools
     */
    let point: Point;
    test.beforeEach(async ({ MoleculesCanvas: _ }) => {
      await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction-3.rxn');
      await CommonLeftToolbar(page).areaSelectionTool(
        SelectionToolType.Rectangle,
      );
      point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    });

    test('Select the reaction arrow and move it', async () => {
      await page.mouse.move(point.x + 60, point.y);
      await dragMouseTo(page, point.x + 60, point.y - 40);
    });

    test('Select the reaction arrow with any reaction component(s) and move them', async () => {
      await page.mouse.move(point.x + 50, point.y - 300);
      await dragMouseTo(page, point.x + 400, point.y + 100);
      await page.mouse.move(point.x + 70, point.y);
      await dragMouseTo(page, point.x + 300, point.y - 100);
    });

    test('Select the whole reaction and move it', async () => {
      await selectAllStructuresOnCanvas(page);
      await page.mouse.move(point.x - 20, point.y - 20);
      await dragMouseTo(page, point.x - 100, point.y - 100);
    });

    test('Select reaction arrow, cut and paste it onto the canvas', async () => {
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
      async () => {
        await clickOnCanvas(page, point.x + 60, point.y, {
          from: 'pageTopLeft',
        });
        await copyToClipboardByKeyboard(page);
        await pasteFromClipboardByKeyboard(page, { delay: INPUT_DELAY });

        await clickOnCanvas(page, 0, -100, { from: 'pageCenter' });
      },
    );

    test('Select the whole reaction and move it, Undo, Erase tool', async () => {
      await copyAndPaste(page);
      await clickOnCanvas(page, point.x - 100, point.y - 100, {
        from: 'pageTopLeft',
      });
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).undo();
      await takeEditorScreenshot(page);
      await CommonLeftToolbar(page).erase();
      await page.mouse.move(point.x - 300, point.y - 100);
      await dragMouseTo(page, point.x - 140, point.y + 100);
    });
  });
  test.describe('Non-default Reaction Arrow Tool - Manipulations with different tool', () => {
    /**
     * Test case: EPMLSOPKET-2250
     *Description: Non-default Reaction Arrow Tool - Manipulations with different tools
     */
    let point: Point;
    test.beforeEach(async ({ MoleculesCanvas: _ }) => {
      await configureInitialState();
    });

    async function configureInitialState() {
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

    test('Select the reaction arrow and move it', async () => {
      await page.mouse.move(point.x + OFFSET_FROM_ARROW, point.y);
      await dragMouseTo(page, point.x + OFFSET_FROM_ARROW, point.y - 40);
    });

    test('Select the reaction arrow with any reaction component(s) and move them', async () => {
      await page.mouse.move(point.x - 40, point.y - 300);
      await dragMouseTo(page, point.x + 400, point.y + 100);
      await moveMouseToTheMiddleOfTheScreen(page);
      await dragMouseTo(page, point.x + 300, point.y - 100);
    });

    test('Select the whole reaction and move it', async () => {
      await selectAllStructuresOnCanvas(page);
      await moveMouseToTheMiddleOfTheScreen(page);
      await dragMouseTo(page, point.x - 100, point.y - 100);
    });

    test('Select reaction arrow, cut and paste it onto the canvas', async () => {
      await clickOnCanvas(page, point.x + OFFSET_FROM_ARROW, point.y, {
        from: 'pageTopLeft',
      });
      await cutToClipboardByKeyboard(page);
      await pasteFromClipboardByKeyboard(page, { delay: INPUT_DELAY });
      await clickOnCanvas(page, 0, -100, { from: 'pageCenter' });
    });

    test('Select a part of the reaction with the equilibrium arrow, cut and paste it onto canvas.', async () => {
      await page.mouse.move(point.x - 40, point.y - 300);
      await dragMouseTo(page, point.x + 400, point.y + 100);

      await cutToClipboardByKeyboard(page);
      await pasteFromClipboardByKeyboard(page, { delay: INPUT_DELAY });

      await clickOnCanvas(page, 0, -100, { from: 'pageCenter' });
    });

    test('Select reaction arrow, copy and paste it onto the canvas', async () => {
      const arrow = getArrowLocator(page, {
        arrowType: Arrows.EquilibriumFilledHalfBow,
      });
      await arrow.hover({ force: true });
      await arrow.click({ force: true });
      await copyToClipboardByKeyboard(page);
      await pasteFromClipboardByKeyboard(page);
      await clickOnCanvas(page, 0, -100, { from: 'pageCenter' });
      await CommonTopLeftToolbar(page).undo();
      await takeEditorScreenshot(page, {
        maxDiffPixels: 1,
      });
      await CommonTopLeftToolbar(page).redo();
      await takeEditorScreenshot(page, {
        maxDiffPixels: 1,
      });
    });

    test('Click the equilibrium arrow with the Erase tool, Undo, Erase for part of reaction, Undo/Redo', async () => {
      await CommonLeftToolbar(page).erase();
      await clickOnCanvas(page, -OFFSET_FROM_ARROW, 0, { from: 'pageCenter' });
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).undo();
      await takeEditorScreenshot(page);
      await CommonLeftToolbar(page).erase();
      await page.mouse.move(point.x - 40, point.y - 300);
      await dragMouseTo(page, point.x + 400, point.y + 100);
      await moveMouseToTheMiddleOfTheScreen(page);
      await dragMouseTo(page, point.x + 300, point.y - 100);
      await CommonTopLeftToolbar(page).undo();
      await takeEditorScreenshot(page, {
        maxDiffPixels: 1,
      });
      await CommonTopLeftToolbar(page).redo();
    });
  });

  test('Actions on the reaction with non-default reaction arrows', async () => {
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
    await dragMouseTo(page, point.x + 20, point.y + 50);
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
    await IndigoFunctionsToolbar(page).cleanUp();
  });

  test('Save plus sign and arrow', async () => {
    /**
     * Test case: EPMLSOPKET-1793
     * Description: Save plus sign and arrow
     */
    await LeftToolbar(page).reactionPlusTool();
    await clickInTheMiddleOfTheCanvas(page);
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
    test('add default arrow and save in KET file', async () => {
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

    test('open file', async () => {
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
    test('add non default arrow and save in KET file', async () => {
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

    test('open file', async () => {
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
    test('add non default arrow and save in RXN file', async () => {
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

    test('open file', async () => {
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
      test(`save in ${fileExtension} file`, async () => {
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

      test(`open ${fileExtension} file`, async () => {
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
      test(`save in ${fileExtension} file`, async () => {
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

      test(`open ${fileExtension} file`, async () => {
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
    test('Resize and save', async () => {
      await openFileAndAddToCanvas(
        page,
        'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
      );
      await LeftToolbar(page).selectArrowTool(ArrowType.ArrowFilledBow);
      await clickOnCanvas(page, xOffsetFromCenter, 0, { from: 'pageCenter' });
      const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
      await page.mouse.move(x - 35, y - 1);
      await dragMouseTo(page, x - 25, y - 50);
      await saveStructureWithReaction(page);
      await saveStructureWithReaction(page, MoleculesFileFormatType.KetFormat);
    });

    test('open files', async () => {
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

  test('Check that pressing Clear Canvas with Reaction Arrow under mouse cursor does not cause errors in DevTool console', async () => {
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
    await clickInTheMiddleOfTheCanvas(page);

    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickInTheMiddleOfTheCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page, { delay: INPUT_DELAY });

    await CommonTopLeftToolbar(page).clearCanvas();
  });

  test.describe('Arrow snapping', () => {
    let point: Point;
    test.beforeEach(async ({ MoleculesCanvas: _ }) => {
      await LeftToolbar(page).selectArrowTool(ArrowType.ArrowFilledTriangle);
      await moveMouseToTheMiddleOfTheScreen(page);
      point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    });

    test('to Horizontal Position with Angle greater than 15 Degrees', async () => {
      /**
       * Test case: Test case: EPMLSOPKET-15546
       * Description: Arrow Snapping to Horizontal Position with Angle greater than 15 Degrees
       */
      await page.mouse.down();
      await page.mouse.move(point.x + 100, point.y - 50);
    });

    test('to Vertical Position greater than 15 Degrees', async () => {
      /**
       * Test case: Test case: EPMLSOPKET-15548
       * Description: Arrow Snapping to Vertical Position with Angle ≤ 15 Degrees
       */
      await page.mouse.down();
      await page.mouse.move(point.x + 100, point.y - 50);
    });

    test('to Horizontal Position with Angle ≤ 5 Degrees', async () => {
      /**
       * Original Test case: Test case: EPMLSOPKET-15548
       * Current behavior defined by https://github.com/epam/ketcher/issues/5568
       * Description: Arrow Snapping to Horizontal Position with Angle ≤ 5 Degrees
       */
      await page.mouse.down();
      await page.mouse.move(point.x + 100, point.y - 5);
      await takeEditorScreenshot(page);
      await page.mouse.up();
    });

    test('to Vertical Position with Angle ≤ 5 Degrees', async () => {
      /**
       * Original Test case: Test case: EPMLSOPKET-15549
       * Current behavior defined by https://github.com/epam/ketcher/issues/5568
       * Description: Arrow Snapping to Vertical Position with Angle ≤ 5 Degrees
       */
      await page.mouse.down();
      await page.mouse.move(point.x + 5, point.y - 100);
      await takeEditorScreenshot(page);
      await page.mouse.up();
    });

    test('to Horizontal Position with Ctrl Key Pressed', async () => {
      /**
       * Test case: Test case: EPMLSOPKET-15550
       * Description: Arrow Snapping to Horizontal Position with Ctrl Key Pressed
       */
      const x = point.x + 100;
      await page.keyboard.down('ControlOrMeta');
      await page.mouse.down();

      await page.mouse.move(x, point.y - 50);
      await takeEditorScreenshot(page);
      await page.mouse.move(x, point.y - 20);
      await takeEditorScreenshot(page);
      await page.mouse.move(x, point.y);
      await takeEditorScreenshot(page);
      await page.mouse.up();
    });

    test('to Vertical Position with Ctrl Key Pressed', async () => {
      /**
       * Test case: Test case: EPMLSOPKET-15551
       * Description: Arrow Snapping to Vertical Position with Ctrl Key Pressed
       */
      const y = point.y - 100;
      await page.keyboard.down('ControlOrMeta');
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
    test(`${arrow} should have correct naming`, async () => {
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
      await clickInTheMiddleOfTheCanvas(page);
    });
  }

  test('Resizing retrosynthetic arrow', async () => {
    /**
     * Test case: #4985
     * Description: Retrosynthetic Arrow is resized correctly
     */
    await LeftToolbar(page).selectArrowTool(ArrowType.RetrosyntheticArrow);
    await clickOnCanvas(page, xOffsetFromCenter, 0, { from: 'pageCenter' });
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(page, x + 200, y + 200);
  });

  test('Copy/paste retrosynthetic arrow', async () => {
    /**
    Test case: #4985
    Description: Retrosynthetic Arrow Copy/paste
     */
    await LeftToolbar(page).selectArrowTool(ArrowType.RetrosyntheticArrow);
    await clickInTheMiddleOfTheCanvas(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, 300, 300, {
      from: 'pageTopLeft',
    });
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      maxDiffPixels: 1,
    });
    await CommonTopLeftToolbar(page).redo();
  });

  test('Cut/paste retrosynthetic arrow', async () => {
    /**
    Test case: #4985
    Description: Retrosynthetic Arrow Cut/paste
     */
    await LeftToolbar(page).selectArrowTool(ArrowType.RetrosyntheticArrow);
    await clickInTheMiddleOfTheCanvas(page);
    await cutAndPaste(page);
    await clickOnCanvas(page, 300, 300, {
      from: 'pageTopLeft',
    });
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      maxDiffPixels: 1,
    });
    await CommonTopLeftToolbar(page).redo();
  });
});
