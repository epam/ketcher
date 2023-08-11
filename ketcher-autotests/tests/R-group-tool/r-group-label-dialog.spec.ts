import { test } from '@playwright/test';
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
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';

test.describe('Open Ketcher', () => {
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
});
