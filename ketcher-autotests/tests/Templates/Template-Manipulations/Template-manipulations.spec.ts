import { test, expect, Page } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectAtomInToolbar,
  AtomButton,
  openFileAndAddToCanvas,
  clickInTheMiddleOfTheScreen,
  selectFunctionalGroups,
  FunctionalGroups,
  moveMouseToTheMiddleOfTheScreen,
  getCoordinatesOfTheMiddleOfTheScreen,
  selectRing,
  RingButton,
  selectTopPanelButton,
  TopPanelButton,
  receiveFileComparisonData,
  saveToFile,
  dragMouseTo,
  pressButton,
  STRUCTURE_LIBRARY_BUTTON_NAME,
} from '@utils';
import { getMolfile, getRxn } from '@utils/formats';

import {
  getFirstAtomCoordinatesByAttributes,
  getBottomAtomByAttributes,
  getTopAtomByAttributes,
  getLeftAtomByAttributes,
} from '@utils/canvas/atoms';

let point: { x: number; y: number };
let secondPoint: { x: number; y: number };
const delta = 30;
const smallDelta = 5;

async function moveCursoreAroundPoint(
  x: number,
  y: number,
  delta: number,
  page: Page,
) {
  await page.mouse.click(x, y);
  await dragMouseTo(x + delta, y, page);
  await dragMouseTo(x, y - delta, page);
  await dragMouseTo(x - delta, y, page);
  await dragMouseTo(x, y + delta, page);
  await dragMouseTo(point.x, point.y, page);
}

test.describe('Template Manupulations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });
  test('Template palette', async ({ page }) => {
    /*
            Test case: 1666
            Description: Look at the bottom of the application.
            Choose any template.
            */
    await takeEditorScreenshot(page);
    await selectRing(RingButton.Benzene, page);
  });

  test('1-2) Fuse atom-to-atom', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1674
        Description: Create a structure from the template. 
        Choose any element from the left panel or Periodic Table and click on any atom of the created structure.
    */
    await openFileAndAddToCanvas('template-manipulations/TM-1674.mol', page);
    await selectAtomInToolbar(AtomButton.Carbon, page);
    point = await getFirstAtomCoordinatesByAttributes(page, {
      label: 'O',
    });
    await page.mouse.click(point.x, point.y);
  });

  test('3) Fuse atom-to-atom: drag atom slightly', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1674
        Description: Create a structure from the template. 
        Put the cursor on any other structure atom, click, and drag slightly.
      */
    await openFileAndAddToCanvas('template-manipulations/TM-1674.mol', page);
    point = await getBottomAtomByAttributes(page, {
      label: 'O',
    });
    await page.mouse.click(point.x, point.y);
    await dragMouseTo(point.x + delta, point.y + delta, page);
  });

  test('4) Fuse atom-to-atom: click drag and rotate', async ({ page }) => {
    /*
        Test case: EPMLSOPKET-1674
        Description: Put the cursor on any other structure atom, click, and drag. 
        Release the cursor when the distance from the cursor to the selected atom is less than the bond length. 
       */
    await openFileAndAddToCanvas('template-manipulations/TM-1674.mol', page);
    point = await getLeftAtomByAttributes(page, {
      label: 'O',
    });
    secondPoint = await getBottomAtomByAttributes(page, {
      label: 'O',
    });
    await moveCursoreAroundPoint(point.x, point.y + delta, delta, page);
    await dragMouseTo(
      secondPoint.x - smallDelta,
      secondPoint.y - smallDelta,
      page,
    );
    await dragMouseTo(point.x + delta, point.y + delta, page);
  });

  test('5) Fuse atom-to-atom: click and drug atom to fuse atom-to-atom', async ({
    page,
  }) => {
    /*
        Test case: EPMLSOPKET-1674
        Description: Put the cursor on any other structure atom, press, and drag. 
        Release the cursor when the distance from the cursor to the selected atom is more than the bond length. 
      */
    await openFileAndAddToCanvas('template-manipulations/TM-1674.mol', page);

    point = await getLeftAtomByAttributes(page, {
      label: 'O',
    });
    secondPoint = await getBottomAtomByAttributes(page, {
      label: 'O',
    });

    await page.mouse.click(point.x, point.y);
    await dragMouseTo(
      secondPoint.x - smallDelta,
      secondPoint.y - smallDelta,
      page,
    );
    await dragMouseTo(
      point.x + point.x + delta,
      point.y + point.y + delta,
      page,
    );
  });

  test('Fuse atom-to-atom: click and drug atom to extand bonds', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1674
      Description: Create a structure from the template. 
      */

    await openFileAndAddToCanvas('template-manipulations/TM-1674.mol', page);
    point = await getLeftAtomByAttributes(page, {
      label: 'O',
    });

    await page.mouse.click(point.x, point.y);
    await dragMouseTo(point.x - smallDelta, point.y - smallDelta, page);
  });

  test('Click or drag on the canvas: Place template on the Canvas', async ({
    page,
  }) => {
    /*
      Test case: 1678
      Description: Choose any template and click on the canvas.
      */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.Cbz, page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Click or drag on the canvas: Rotate a template while placing', async ({
    page,
  }) => {
    /*
      Test case: 1678
      Description: With the template click and rotate on the canvas.
      */
    await openFileAndAddToCanvas('template-manipulations/TM-1674.mol', page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x, y + delta, page);
    await page.mouse.click(x, y + delta);
  });

  test('Click or drag on the canvas: Rotate with a benzene', async ({
    page,
  }) => {
    /*
      Test case: 1678
      Description: Repeat the previous steps with different templates.
      */
    await selectRing(RingButton.Benzene, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    await page.keyboard.down('Control');
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await clickInTheMiddleOfTheScreen;
    await page.mouse.move(x + delta, y + delta);
    await dragMouseTo(x + delta + delta, y, page);
    await page.keyboard.up('Control');
  });

  test('Undo/Redo action', async ({ page }) => {
    /*
      Test case: 1737
      Description: Edit the structures in any way.
                   Click Undo multiple times.
                   Click Redo multiple times.
      */
    await openFileAndAddToCanvas('template-manipulations/TM-1737.mol', page);
    await clickInTheMiddleOfTheScreen(page);
    point = await getTopAtomByAttributes(page, {
      label: 'O',
    });
    await page.mouse.click(point.x, point.y);
    await dragMouseTo(point.x + delta, point.y + delta, page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
  });

  test('Rotate/Flip the template structure', async ({ page }) => {
    /*
            Test case: 1745
            Description: Choose the 'Rotate Tool', select the structure and rotate it.
                Select the structure and flip it horizontally with the 'Horizontal Flip' tool.
                Select the structure and flip it vertically with the 'Vertical Flip' tool.
        */
    await openFileAndAddToCanvas('template-manipulations/TM-1737.mol', page);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Control+a');
    await pressButton(page, 'Vertical Flip (Alt+V)');
    await pressButton(page, 'Horizontal Flip (Alt+H)');
  });

  test('Save as *.mol file', async ({ page }) => {
    /*
        Test case: 1747
        Description: Click the 'Save As' button, and click the 'Save' button.
        Open the saved *.mol file and edit it in any way.
      */
    await selectRing(RingButton.Benzene, page);
    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile('TM-1737.mol', expectedFile);
    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/template-manipulations/TM-1737.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Save as *.rxn file', async ({ page }) => {
    /*
            Test case: 1748
            Description: Click the 'Save As' button and click the 'Save' button.
            Open the saved *.rxn file and edit it in any way.
          */
    await openFileAndAddToCanvas('template-manipulations/TM-1748.rxn', page);
    const expectedFile = await getRxn(page, 'v2000');
    await saveToFile(
      'template-manipulations/TM-1748-current.Rxn',
      expectedFile,
    );
    const { file: RxnFile, fileExpected: RxnFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/template-manipulations/TM-1748.Rxn',
      });
    // comparing Rxn file with golden Rxn file

    expect(RxnFile).toEqual(RxnFileExpected);
  });
});
