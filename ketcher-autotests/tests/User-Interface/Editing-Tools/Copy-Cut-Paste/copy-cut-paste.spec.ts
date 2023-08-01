/* eslint-disable no-magic-numbers */
import { expect, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectRing,
  RingButton,
  clickInTheMiddleOfTheScreen,
  clickOnAtom,
  TopPanelButton,
  selectTopPanelButton,
  selectAtomInToolbar,
  AtomButton,
  BondType,
  dragMouseTo,
  screenshotBetweenUndoRedo,
  openFileAndAddToCanvas,
  cutAndPaste,
  getCoordinatesOfTheMiddleOfTheScreen,
  clickOnBond,
  copyAndPaste,
} from '@utils';

const CANVAS_CLICK_X = 300;
const CANVAS_CLICK_Y = 300;

const SECOND_CANVAS_CLICK_X = 700;
const SECOND_CANVAS_CLICK_Y = 700;

test.describe('Copy/Cut/Paste Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Cut part of structures', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1712
    Description: After the clicking the 'Cut' button, the selected object disappears.
    */
    const xDelta = 200;
    const yDelta = 200;
    await openFileAndAddToCanvas('query-feat.mol', page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + xDelta, y + yDelta, page);
    await selectTopPanelButton(TopPanelButton.Cut, page);
    await screenshotBetweenUndoRedo(page);
  });

  test('Cut all structures', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1712
    Description: After the clicking the 'Cut' button, the selected object disappears.
    */
    await openFileAndAddToCanvas('query-feat.mol', page);
    await page.keyboard.press('Control+a');
    await selectTopPanelButton(TopPanelButton.Cut, page);
    await screenshotBetweenUndoRedo(page);
  });

  test('Cut one Atom on structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1712
    Description: After the clicking the 'Cut' button, the selected object disappears.
    */
    await openFileAndAddToCanvas('query-feat.mol', page);
    await clickOnAtom(page, 'C', 3);
    await selectTopPanelButton(TopPanelButton.Cut, page);
    await screenshotBetweenUndoRedo(page);
  });

  test('Cut one Bond on structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1712
    Description: After the clicking the 'Cut' button, the selected object disappears.
    */
    await openFileAndAddToCanvas('query-feat.mol', page);
    await clickOnBond(page, BondType.TRIPLE, 0);
    await selectTopPanelButton(TopPanelButton.Cut, page);
    await screenshotBetweenUndoRedo(page);
  });

  test('Cut all structures via hotkey (CTRL+X)', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1712
    Description: After the clicking the 'Cut' button, the selected object disappears.
    */
    await openFileAndAddToCanvas('query-feat.mol', page);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+x');
    await screenshotBetweenUndoRedo(page);
  });

  test('Cut and Paste structure and edit', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1713
    Description: The correct structure is pasted on the canvas.
    All query features are correctly rendered.
    User is able to edit the pasted structure.
    */
    await openFileAndAddToCanvas('clean-diffproperties.mol', page);
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', 12);
  });

  test('Cut the reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1714
    Description: After the clicking the Cut button, the selected object disappears.
    */
    await openFileAndAddToCanvas('reaction-dif-prop.rxn', page);
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await screenshotBetweenUndoRedo(page);
  });

  test('Cut the Atom from reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1714
    Description: After the clicking the Cut button, the selected object disappears.
    */
    await openFileAndAddToCanvas('reaction-dif-prop.rxn', page);
    await clickOnAtom(page, 'C', 0);
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await screenshotBetweenUndoRedo(page);
  });

  test('Cut the Bond from reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1714
    Description: After the clicking the Cut button, the selected object disappears.
    */
    await openFileAndAddToCanvas('reaction-dif-prop.rxn', page);
    await clickOnBond(page, BondType.SINGLE, 0);
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await screenshotBetweenUndoRedo(page);
  });

  test('Cut the reaction with hotkey', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1714
    Description: After the clicking the Cut button, the selected object disappears.
    */
    await openFileAndAddToCanvas('reaction-dif-prop.rxn', page);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+x');
    await screenshotBetweenUndoRedo(page);
  });

  test('Copy structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1715
    Description: After the clicking the Copy button, the selected object not disappears.
    */
    await openFileAndAddToCanvas('query-feat.mol', page);
    await page.keyboard.press('Control+a');
    await selectTopPanelButton(TopPanelButton.Copy, page);
  });

  test('Copy the Atom from reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1715
    Description: After the clicking the Copy button, the selected object not disappears.
    */
    await openFileAndAddToCanvas('query-feat.mol', page);
    await clickOnAtom(page, 'C', 0);
    await selectTopPanelButton(TopPanelButton.Copy, page);
  });

  test('Copy the Bond from reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1715
    Description: After the clicking the Copy button, the selected object not disappears.
    */
    await openFileAndAddToCanvas('query-feat.mol', page);
    await clickOnBond(page, BondType.SINGLE, 0);
    await selectTopPanelButton(TopPanelButton.Copy, page);
  });

  test('Copy the reaction with hotkey', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1715
    Description: After the clicking the Copy button, the selected object not disappears.
    */
    await openFileAndAddToCanvas('query-feat.mol', page);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
  });

  test('Copy and Paste structure and edit', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1716
    Description: The correct structure is pasted on the canvas.
    All query features are correctly rendered.
    User is able to edit the pasted structure.
    */
    await openFileAndAddToCanvas('clean-diffproperties.mol', page);
    await copyAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', 12);
  });

  test('Copy and paste the reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1717
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting two same structures located on canvas.
    */
    await openFileAndAddToCanvas('reaction-dif-prop.rxn', page);
    await copyAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
  });

  test('Copy and paste the Atom from reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1717
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting two same structures located on canvas.
    */
    await openFileAndAddToCanvas('reaction-dif-prop.rxn', page);
    await clickOnAtom(page, 'C', 0);
    await copyAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
  });

  test('Copy and paste the Bond from reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1717
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting two same structures located on canvas.
    */
    await openFileAndAddToCanvas('reaction-dif-prop.rxn', page);
    await clickOnBond(page, BondType.SINGLE, 0);
    await copyAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
  });

  test('Copy and paste the reaction with hotkey', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1717
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting two same structures located on canvas.
    */
    await openFileAndAddToCanvas('reaction-dif-prop.rxn', page);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
  });

  test('Multiple Paste action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1718
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting two same structures located on canvas.
    */
    await openFileAndAddToCanvas('clean-diffproperties.mol', page);
    await copyAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await page.keyboard.press('Control+v');
    await page.mouse.click(SECOND_CANVAS_CLICK_X, SECOND_CANVAS_CLICK_Y);
  });
});

test.describe('Copy/Cut/Paste Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await expect(page).toHaveScreenshot();
  });

  test('Copy button', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1709
    Description: Button is disabled. Tooltip "Copy (Ctrl+С)" appears.
    List of buttons and coincidental tooltips is displayed:
    Copy as MOL (Ctrl+M);
    Copy as KET (Ctrl+Shift+K);
    Copy Image (Ctrl+Shift+F)
    Object is created. 
    Object is selected. Buttons are enabled.
    */
    await page.locator('.MuiButtonBase-root').first().click();
    await expect(page).toHaveScreenshot();
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Control+a');
    await page.locator('.MuiButtonBase-root').first().click();
  });

  test('Cut button', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1710
    Description: The 'Cut' button  is disabled if nothing is selected on the canvas.
    The 'Cut (Ctrl+X)' cut the structure.
    */
    await expect(page).toHaveScreenshot();
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Control+a');
    await expect(page).toHaveScreenshot();
    await selectTopPanelButton(TopPanelButton.Cut, page);
  });

  test('Paste button', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1711
    Description: The 'Paste' button is always enabled.
    The 'Paste (Ctrl+V)' tooltip appears when user moves the cursor over the button.
    Note: in Chrome, FF and Edge the Paste action can be implemented with Ctrl+V buttons only! 
    When user clicks on the 'Paste' button alert message appears. 
    Message should have direction to use shortcuts.
    */
    await expect(page).toHaveScreenshot();
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Control+a');
    await selectTopPanelButton(TopPanelButton.Cut, page);
    await selectTopPanelButton(TopPanelButton.Paste, page);
  });
});
