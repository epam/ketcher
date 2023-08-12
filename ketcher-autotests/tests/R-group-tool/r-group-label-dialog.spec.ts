import { expect, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  LeftPanelButton,
  clickInTheMiddleOfTheScreen,
  selectLeftPanelButton,
  getCoordinatesTopAtomOfBenzeneRing,
  selectRingButton,
  RingButton,
  TopPanelButton,
  selectTopPanelButton,
  pressButton,
  dragMouseTo,
  openFileAndAddToCanvas,
  clickOnAtom,
  copyAndPaste,
  cutAndPaste,
  receiveFileComparisonData,
  saveToFile,
  BondTypeName,
  selectBond,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getRxn, getSmiles } from '@utils/formats';

test.describe('R-Group Label Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('R-group label dialog appears', async ({ page }) => {
    /* Test case: EPMLSOPKET-1556
      Description: R-group label dialog appears
    */
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await page.mouse.click(x, y);
  });

  test('Try to create R-Group not with clicking on atom', async ({ page }) => {
    /* Test case: EPMLSOPKET-1557
      Description: The "R-Group" dialog box is opened when user click the empty area and user is able create the Rgroup label.
    */

    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Single R-Group label', async ({ page }) => {
    /* Test case: EPMLSOPKET-1558
      Description: Single R-Group label
    */

    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await page.mouse.click(x, y);
    await pressButton(page, 'R5');
    await pressButton(page, 'Apply');
  });

  test('Multiple R-Group label', async ({ page }) => {
    /* Test case: EPMLSOPKET-1559
      Description: Multiple R-Group label
    */

    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await page.mouse.click(x, y);
    await pressButton(page, 'R4');
    await pressButton(page, 'R5');
    await pressButton(page, 'R6');
    await pressButton(page, 'Apply');
  });

  test('Delete R-Group label using Erase tool', async ({ page }) => {
    /* Test case: EPMLSOPKET-1562
      Description: Delete R-Group label using Erase tool
    */

    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await page.mouse.click(x, y);
    await pressButton(page, 'R5');
    await pressButton(page, 'Apply');

    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await page.getByText('R5').click();
  });

  test('Edit R-Group label', async ({ page }) => {
    /* Test case: EPMLSOPKET-1560
      Description: R-group atom label is changed accordingly on the canvas. The R-group label buttons in the "R-Group" dialog are highlighted properly.
    */

    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await page.mouse.click(x, y);
    await pressButton(page, 'R5');
    await pressButton(page, 'Apply');

    await page.getByText('R5').click();
    await pressButton(page, 'R5');
    await pressButton(page, 'R8');
    await pressButton(page, 'Apply');
  });

  test('Create S-Group with R-Group', async ({ page }) => {
    /* Test case: EPMLSOPKET-1575
      Description: Create S-Group with R-Group
    */

    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await page.mouse.click(x, y);

    await pressButton(page, 'Data');
    await page.getByRole('option', { name: 'Multiple group' }).click();
    await page.getByLabel('Repeat count').click();
    await page.getByLabel('Repeat count').fill('1');
    await pressButton(page, 'Apply');

    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    let point: { x: number; y: number };
    // eslint-disable-next-line no-magic-numbers, prefer-const
    point = await getAtomByIndex(page, { label: 'C' }, 2);
    await page.mouse.click(point.x, point.y);
    await pressButton(page, 'R5');
    await pressButton(page, 'Apply');
  });

  test('Rotate R-group', async ({ page }) => {
    /* Test case: EPMLSOPKET-1571
      Description: Structure with R-Group label is rotated correctly
    */

    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await page.mouse.click(x, y);
    await pressButton(page, 'R5');
    await pressButton(page, 'Apply');

    await page.keyboard.press('Control+a');
    await pressButton(page, 'Vertical Flip (Alt+V)');
  });

  test('Undo-Redo with R-group label', async ({ page }) => {
    /* Test case: EPMLSOPKET-1558
      Description: Single R-Group label
    */

    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await page.mouse.click(x, y);
    await pressButton(page, 'R5');
    await pressButton(page, 'Apply');

    await page.getByText('R5').click();
    await pressButton(page, 'R5');
    await pressButton(page, 'R7');
    await pressButton(page, 'R8');
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
  });

  test('Create the same R-Group label as existing', async ({ page }) => {
    /* Test case: EPMLSOPKET-1563
      Description: Create the same R-Group label as existing. The same R-group atom label is created correctly.
    */

    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await page.mouse.click(x, y);
    await pressButton(page, 'R5');
    await pressButton(page, 'Apply');

    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    let point: { x: number; y: number };
    // eslint-disable-next-line no-magic-numbers, prefer-const
    point = await getAtomByIndex(page, { label: 'C' }, 2);
    await page.mouse.click(point.x, point.y);
    await pressButton(page, 'R5');
    await pressButton(page, 'Apply');
  });

  test('Zoom In/Zoom Out', async ({ page }) => {
    /* Test case: EPMLSOPKET-1574
      Description: The structures are zoomed correctly without R-group labels loss
    */

    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await page.mouse.click(x, y);
    await pressButton(page, 'R5');
    await pressButton(page, 'Apply');

    // eslint-disable-next-line no-magic-numbers
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Control+_');
    }
    await takeEditorScreenshot(page);

    // eslint-disable-next-line no-magic-numbers
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Control+=');
    }
  });

  test('Delete R-Group label using hotkey', async ({ page }) => {
    /* Test case: EPMLSOPKET-1561
      Description: Delete R-Group label using hotkey
    */

    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await page.mouse.click(x, y);
    await pressButton(page, 'R5');
    await pressButton(page, 'Apply');

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await page.getByText('R5').click();
    await page.keyboard.press('Delete');
  });

  test('Move Structure with R-Group label', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1564
      Description: User is able to move the R-group label, a part of the structure.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas('chain-r1.mol', page);
    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await page.getByText('R1').click();
    await dragMouseTo(x, y, page);
  });

  test('Move whole Structure with R-Group label', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1564
      Description: User is able to move the R-group label, the whole structure.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas('chain-r1.mol', page);
    await page.keyboard.press('Control+a');
    await page.getByText('R1').click();
    await dragMouseTo(x, y, page);
  });

  test('Move Actions with Reaction components with R-Group label', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1565
      Description: User is able to create the reaction with components which contain the R-group labels.
      User is able to move the reaction components with R-group label, part of the reaction and the whole reaction.
    */
    const x = 500;
    const y = 200;
    const anyAtom = 3;
    await openFileAndAddToCanvas('reaction-with-arrow-and-plus.ket', page);
    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    await clickOnAtom(page, 'C', anyAtom);
    await pressButton(page, 'R8');
    await pressButton(page, 'Apply');
    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await page.getByText('R8').click();
    await dragMouseTo(x, y, page);
  });

  test('Move whole Reaction components with R-Group label', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1565
      Description: User is able to create the reaction with components which contain the R-group labels.
      User is able to move the reaction components with R-group label, part of the reaction and the whole reaction.
    */
    const x = 500;
    const y = 200;
    const anyAtom = 3;
    await openFileAndAddToCanvas('reaction-with-arrow-and-plus.ket', page);
    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    await clickOnAtom(page, 'C', anyAtom);
    await pressButton(page, 'R8');
    await pressButton(page, 'Apply');
    await page.keyboard.press('Control+a');
    await page.getByText('R8').click();
    await dragMouseTo(x, y, page);
  });

  test('Copy/Paste actions Structure with R-Group label', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1566
      Description: User is able to Copy/Paste structure with R-group label.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas('chain-with-r-group.rxn', page);
    await copyAndPaste(page);
    await dragMouseTo(x, y, page);
  });

  test('Cut/Paste actions Structure with R-Group label', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1566
      Description: User is able to Cut/Paste the structure with R-group label.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas('chain-with-r-group.rxn', page);
    await cutAndPaste(page);
    await dragMouseTo(x, y, page);
  });

  test('Atom properties do not implement for the Rgroup labels', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1572
      Description: The plus symbol does not appear near the R-group label.
      The minus symbol does not appear near the R-group label.
    */
    await openFileAndAddToCanvas('chain-with-r-group.rxn', page);
    await selectLeftPanelButton(LeftPanelButton.ChargePlus, page);
    await page.getByText('R8').click();
    await selectLeftPanelButton(LeftPanelButton.ChargeMinus, page);
    await page.getByText('R13').click();
  });

  test('Add Bond to the R-Group Label', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1573
      Description: The correct bond is sprouted from the R-group label
    */
    const x = 0;
    const y = 100;
    await openFileAndAddToCanvas('chain-with-three-r-groups.rxn', page);
    await selectBond(BondTypeName.Single, page);
    await page.getByText('R8').click();
    await dragMouseTo(x, y, page);
  });

  test.fixme('Add Chain to the R-Group Label', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1573
      Description: The correct Chain is sprouted from the R-group label
    */
    // Can't drag Chain from R10 group.
    const x = 0;
    const y = 150;
    await openFileAndAddToCanvas('chain-with-three-r-groups.rxn', page);
    await selectLeftPanelButton(LeftPanelButton.Chain, page);
    await page.getByText('R10').click();
    await dragMouseTo(x, y, page);
  });

  test.fixme('Add Template to the R-Group Label', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1573
      Description: The correct Template is sprouted from the R-group label
    */
    // Can't drag template from R13 group.
    const x = 0;
    const y = 200;
    await openFileAndAddToCanvas('chain-with-three-r-groups.rxn', page);
    await selectRingButton(RingButton.Benzene, page);
    await page.getByText('R13').click();
    await dragMouseTo(x, y, page);
  });
});

test.describe('R-Group Label Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('Save as *.rxn file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1568
    Description: User is able to save the structure with R-group label as .rxn file
    */
    await openFileAndAddToCanvas('chain-with-r-group.rxn', page);
    const expectedFile = await getRxn(page);
    await saveToFile('chain-with-r-group-expected.rxn', expectedFile);

    // eslint-disable-next-line no-magic-numbers
    const METADATA_STRING_INDEX = [2, 7, 31, 38];
    const { fileExpected: rxnFileExpected, file: rxnFile } =
      await receiveFileComparisonData({
        page,
        metaDataIndexes: METADATA_STRING_INDEX,
        expectedFileName: 'tests/test-data/chain-with-r-group-expected.rxn',
      });
    expect(rxnFile).toEqual(rxnFileExpected);
  });

  test('Save as *.rxn V3000 file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1567
    Description: User is able to save the structure with R-group label as .rxn V3000 file
    */
    await openFileAndAddToCanvas('chain-with-r-group-V3000.rxn', page);
    const expectedFile = await getRxn(page, 'v3000');
    await saveToFile('chain-with-r-group-V3000-expected.rxn', expectedFile);

    // eslint-disable-next-line no-magic-numbers
    const METADATA_STRING_INDEX = [2];
    const { fileExpected: rxnFileExpected, file: rxnFile } =
      await receiveFileComparisonData({
        page,
        metaDataIndexes: METADATA_STRING_INDEX,
        expectedFileName:
          'tests/test-data/chain-with-r-group-V3000-expected.rxn',
        fileFormat: 'v3000',
      });
    expect(rxnFile).toEqual(rxnFileExpected);
  });

  test('Save as *.smi file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1568
    Description: User is able to save the structure with R-group label as .smi file
    */
    await openFileAndAddToCanvas('chain-with-r-group.smi', page);
    const expectedFile = await getSmiles(page);
    await saveToFile('chain-with-r-group-expected.smi', expectedFile);

    const { fileExpected: smiFileExpected, file: smiFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/chain-with-r-group-expected.smi',
      });

    expect(smiFile).toEqual(smiFileExpected);
  });
});
