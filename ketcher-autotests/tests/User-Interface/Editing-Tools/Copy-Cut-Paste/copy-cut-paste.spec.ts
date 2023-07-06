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
} from '@utils';

const CANVAS_CLICK_X = 300;
const CANVAS_CLICK_Y = 300;

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

  test.fixme('Cut and Paste structure and edit', async ({ page }) => {
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
