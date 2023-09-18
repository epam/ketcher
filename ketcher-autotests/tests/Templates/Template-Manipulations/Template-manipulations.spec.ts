import { test, expect } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectAtomInToolbar,
  AtomButton,
  clickInTheMiddleOfTheScreen,
  selectRing,
  RingButton,
  selectTopPanelButton,
  TopPanelButton,
  receiveFileComparisonData,
  saveToFile,
  dragMouseTo,
  pressButton,
  drawBenzeneRing,
  clickOnAtom,
  takeBottomToolbarScreenshot,
  moveOnAtom,
  waitForPageInit,
  resetCurrentTool,
  openFileAndAddToCanvas,
} from '@utils';
import { getMolfile, getRxn } from '@utils/formats';

test.describe('Template Manupulations', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Template palette', async ({ page }) => {
    /*
    Test case: 1666
    Description: Look at the bottom of the application.
    Choose any template.
    */
    await takeBottomToolbarScreenshot(page);
  });
});

test.describe('Template Manupulations', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('1-2) Fuse atom-to-atom', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1674
    Description: Create a structure from the template. 
    Choose any element from the left panel or Periodic Table and click on any atom of the created structure.
    */
    const anyAtom = 0;
    await drawBenzeneRing(page);
    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await clickOnAtom(page, 'C', anyAtom);
  });

  test('3) Fuse atom-to-atom: drag atom slightly', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1674
    Description: Create a structure from the template. 
    Put the cursor on any other structure atom, click, and drag slightly.
    */
    const anyAtom = 0;
    const x = 200;
    const y = 200;
    await drawBenzeneRing(page);
    await moveOnAtom(page, 'C', anyAtom);
    await dragMouseTo(x, y, page);
    await resetCurrentTool(page);
  });

  test('5) Fuse atom-to-atom: click and drug atom to fuse atom-to-atom', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1674
    Description: Put the cursor on any other structure atom, press, and drag. 
    Release the cursor when the distance from the cursor to the selected atom is more than the bond length. 
    */
    await drawBenzeneRing(page);
    const anyAtom = 0;
    const x = 600;
    const y = 600;
    await drawBenzeneRing(page);
    await moveOnAtom(page, 'C', anyAtom);
    await dragMouseTo(x, y, page);
    await resetCurrentTool(page);
  });

  test('Fuse atom-to-atom: click and drug atom to extand bonds', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1674
    Description: Create a structure from the template. 
    */
    await drawBenzeneRing(page);
    const anyAtom = 0;
    const x = 700;
    const y = 600;
    await drawBenzeneRing(page);
    await moveOnAtom(page, 'C', anyAtom);
    await dragMouseTo(x, y, page);
    await resetCurrentTool(page);
  });

  test('Click or drag on the canvas: Place template on the Canvas', async ({
    page,
  }) => {
    /*
    Test case: 1678
    Description: Choose any template and click on the canvas.
    */
    const x = 700;
    const y = 600;
    await selectRing(RingButton.Cyclopentadiene, page);
    await clickInTheMiddleOfTheScreen(page);
    await dragMouseTo(x, y, page);
    await resetCurrentTool(page);
  });

  test('Click or drag on the canvas: Rotate a Benzene template while placing', async ({
    page,
  }) => {
    /*
    Test case: 1678
    Description: With the template click and rotate on the canvas.
    */
    const x = 700;
    const y = 600;
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await dragMouseTo(x, y, page);
    await resetCurrentTool(page);
  });

  test('Click or drag on the canvas: Rotate with a Cyclopentane', async ({
    page,
  }) => {
    /*
    Test case: 1678
    Description: Repeat the previous steps with different templates.
    */
    const x = 500;
    const y = 600;
    await selectRing(RingButton.Cyclopentane, page);
    await clickInTheMiddleOfTheScreen(page);
    await dragMouseTo(x, y, page);
    await resetCurrentTool(page);
  });

  test('Undo/Redo action', async ({ page }) => {
    /*
    Test case: 1737
    Description: Edit the structures in any way.
    Click Undo multiple times.
    Click Redo multiple times.
    */
    const anyAtom = 0;
    const anyAnotherAtom = 4;
    await drawBenzeneRing(page);
    await selectAtomInToolbar(AtomButton.Fluorine, page);
    await clickOnAtom(page, 'C', anyAtom);
    await clickOnAtom(page, 'C', anyAnotherAtom);
    const numberOfPressingUndo = 2;
    for (let i = 0; i < numberOfPressingUndo; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
    await takeEditorScreenshot(page);
    const numberOfPressingRedo = 2;
    for (let i = 0; i < numberOfPressingRedo; i++) {
      await selectTopPanelButton(TopPanelButton.Redo, page);
    }
  });

  test('Rotate/Flip the template structure', async ({ page }) => {
    /*
    Test case: 1745
    Description: Choose the 'Rotate Tool', select the structure and rotate it.
    Select the structure and flip it horizontally with the 'Horizontal Flip' tool.
    Select the structure and flip it vertically with the 'Vertical Flip' tool.
    */
    const anyAtom = 0;
    await drawBenzeneRing(page);
    await selectAtomInToolbar(AtomButton.Fluorine, page);
    await clickOnAtom(page, 'C', anyAtom);
    await page.keyboard.press('Control+a');
    await pressButton(page, 'Vertical Flip (Alt+V)');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Horizontal Flip (Alt+H)');
  });

  test('Save as *.mol file', async ({ page }) => {
    /*
    Test case: 1747
    Description: Click the 'Save As' button, and click the 'Save' button.
    Open the saved *.mol file and edit it in any way.
    */
    await openFileAndAddToCanvas('Molfiles-V2000/three-templates.mol', page);
    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile(
      'Molfiles-V2000/three-templates-expected.mol',
      expectedFile,
    );
    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V2000/three-templates-expected.mol',
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
    await openFileAndAddToCanvas('Rxn-V2000/templates-reaction.rxn', page);
    const expectedFile = await getRxn(page, 'v2000');
    await saveToFile('Rxn-V2000/templates-reaction-expected.rxn', expectedFile);
    // eslint-disable-next-line no-magic-numbers
    const METADATA_STRINGS_INDEXES = [2, 7, 43, 63];
    const { file: RxnFile, fileExpected: RxnFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Rxn-V2000/templates-reaction-expected.rxn',
        metaDataIndexes: METADATA_STRINGS_INDEXES,
      });
    expect(RxnFile).toEqual(RxnFileExpected);
  });
});
