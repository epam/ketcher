import { test, Page } from '@fixtures';
import {
  takeEditorScreenshot,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  Point,
  waitForPageInit,
  waitForRender,
  clickOnCanvas,
} from '@utils';
import {
  copyAndPaste,
  cutAndPaste,
  selectAllStructuresOnCanvas,
} from '@utils/canvas/selectSelection';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { ArrowType } from '@tests/pages/constants/arrowSelectionTool/Constants';

let page: Page;
test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});

const X_OFFSET_FROM_CENTER = -35;
const X_OFFSET_FROM_CENTER1 = -235;
const X_OFFSET_FROM_CENTER2 = 235;
const X_OFFSET_80 = -80;
const X_OFFSET_60 = -60;
const X_OFFSET_100 = -100;
const X_OFFSET_150 = 150;
const X_OFFSET_140 = 140;
const X_OFFSET_200 = 200;
const X_OFFSET_300 = 300;
const Y_OFFSET_10 = -10;
const Y_OFFSET_20 = -20;
const Y_OFFSET_40 = -40;
const Y_OFFSET_98 = 98;
const Y_OFFSET_100 = 100;
const MAGIC_NUMBER_TWO = 2;

test.describe('Plus and Arrows tools ', () => {
  test.beforeEach(async () => {
    await waitForPageInit(page);
  });

  test.describe('Create reactions', () => {
    let counter = 1;
    for (const tool of Object.values(ArrowType)) {
      test(` ${counter}. ${tool} check`, async () => {
        await openFileAndAddToCanvas(
          page,
          'Molfiles-V2000/benzene-and-cyclopentadiene.mol',
        );
        await LeftToolbar(page).selectArrowTool(tool);
        await clickOnCanvas(page, X_OFFSET_FROM_CENTER, 0, {
          from: 'pageCenter',
        });
        await takeEditorScreenshot(page);
        await CommonTopLeftToolbar(page).undo();
        await takeEditorScreenshot(page);
      });
      counter++;
    }
  });

  test('Resizing arrow', async () => {
    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + X_OFFSET_100, y + X_OFFSET_100, page);
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await takeEditorScreenshot(page);
    await page.mouse.move(x + Y_OFFSET_98, y + Y_OFFSET_98);
    await dragMouseTo(x + X_OFFSET_150, y + X_OFFSET_150, page);
    await takeEditorScreenshot(page);
  });

  test('Copy/paste, cut/paste arrow', async () => {
    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + X_OFFSET_100, y + X_OFFSET_100, page);

    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, X_OFFSET_300, X_OFFSET_300, {
      from: 'pageTopLeft',
    });
    await cutAndPaste(page);
    await clickOnCanvas(page, X_OFFSET_300, X_OFFSET_300, {
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
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/four-structures.mol');
    await LeftToolbar(page).reactionPlusTool();
    await clickOnCanvas(page, X_OFFSET_FROM_CENTER1, 0, { from: 'pageCenter' });
    await clickOnCanvas(page, X_OFFSET_FROM_CENTER2, 0, { from: 'pageCenter' });
    await takeEditorScreenshot(page);

    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
    await clickOnCanvas(page, X_OFFSET_80, 0, { from: 'pageCenter' });
    await takeEditorScreenshot(page);

    await CommonLeftToolbar(page).erase();
    await clickOnCanvas(page, X_OFFSET_60, 0, { from: 'pageCenter' });
    await takeEditorScreenshot(page);

    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
    await clickOnCanvas(page, X_OFFSET_FROM_CENTER1, X_OFFSET_100, {
      from: 'pageCenter',
    });
    await LeftToolbar(page).reactionPlusTool();
    await clickOnCanvas(page, X_OFFSET_FROM_CENTER2, X_OFFSET_100, {
      from: 'pageCenter',
    });
    await takeEditorScreenshot(page);
    for (let i = 0; i < MAGIC_NUMBER_TWO; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < MAGIC_NUMBER_TWO; i++) {
      await CommonTopLeftToolbar(page).redo();
    }
    await takeEditorScreenshot(page);
  });

  test.describe('Plus sign - Manipulations with different Tools', () => {
    let point: Point;
    test.beforeEach(async () => {
      await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction-3.rxn');
      await CommonLeftToolbar(page).areaSelectionTool(
        SelectionToolType.Rectangle,
      );
      point = await getCoordinatesOfTheMiddleOfTheScreen(page);
    });

    test('Select the plus sign and move it', async () => {
      await waitForRender(page, async () => {
        await page.mouse.move(point.x - X_OFFSET_150, point.y + Y_OFFSET_10);
        await dragMouseTo(point.x - X_OFFSET_150, point.y + Y_OFFSET_40, page);
      });
    });

    test('Select the plus sign with any reaction component(s) and move them', async () => {
      await waitForRender(page, async () => {
        await page.mouse.move(point.x - X_OFFSET_300, point.y + Y_OFFSET_100);
        await dragMouseTo(point.x - X_OFFSET_140, point.y + X_OFFSET_100, page);
      });

      await waitForRender(page, async () => {
        await page.mouse.move(point.x - X_OFFSET_200, point.y + Y_OFFSET_20);
        await dragMouseTo(point.x - X_OFFSET_300, point.y + Y_OFFSET_100, page);
      });
    });

    test('Select the whole reaction and move it', async () => {
      await waitForRender(page, async () => {
        await selectAllStructuresOnCanvas(page);
        await page.mouse.move(point.x + Y_OFFSET_20, point.y + Y_OFFSET_20);
      });
      await dragMouseTo(point.x + X_OFFSET_100, point.y + X_OFFSET_100, page);
    });

    test('Select the whole reaction and move it, Undo, Erase tool', async () => {
      await copyAndPaste(page);
      await clickOnCanvas(
        page,
        point.x + X_OFFSET_100,
        point.y + X_OFFSET_100,
        {
          from: 'pageTopLeft',
        },
      );
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).undo();
      await takeEditorScreenshot(page);
      await CommonLeftToolbar(page).erase();
      await page.mouse.move(point.x - X_OFFSET_300, point.y + Y_OFFSET_100);
      await dragMouseTo(point.x - X_OFFSET_140, point.y + X_OFFSET_100, page);
    });
  });
});
