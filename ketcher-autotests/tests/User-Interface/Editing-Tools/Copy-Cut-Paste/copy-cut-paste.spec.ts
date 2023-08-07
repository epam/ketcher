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
  getControlModifier,
  INPUT_DELAY,
  delay,
  DELAY_IN_SECONDS,
} from '@utils';

const CANVAS_CLICK_X = 300;
const CANVAS_CLICK_Y = 300;

const SECOND_CANVAS_CLICK_X = 300;
const SECOND_CANVAS_CLICK_Y = 500;

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
    const modifier = getControlModifier();
    await openFileAndAddToCanvas('query-feat.mol', page);
    await page.keyboard.press(`${modifier}+KeyA`);
    await page.keyboard.press(`${modifier}+KeyX`);
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
    await delay(DELAY_IN_SECONDS.TWO);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', 12);
  });

  test.fixme('Cut the reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1714
    Description: After the clicking the Cut button, the selected object disappears.
    */
    await openFileAndAddToCanvas('reaction-dif-prop.rxn', page);
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await screenshotBetweenUndoRedo(page);
  });

  test.fixme('Cut the Atom from reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1714
    Description: After the clicking the Cut button, the selected object disappears.
    */
    const modifier = getControlModifier();
    await openFileAndAddToCanvas('reaction-dif-prop.rxn', page);
    await clickOnAtom(page, 'C', 1);
    await page.keyboard.press(`${modifier}+KeyX`);
    await page.keyboard.press(`${modifier}+KeyV`, { delay: INPUT_DELAY });
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await screenshotBetweenUndoRedo(page);
  });

  test.fixme('Cut the Bond from reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1714
    Description: After the clicking the Cut button, the selected object disappears.
    */
    const modifier = getControlModifier();
    await openFileAndAddToCanvas('reaction-dif-prop.rxn', page);
    await clickOnBond(page, BondType.SINGLE, 0);
    await page.keyboard.press(`${modifier}+KeyX`);
    await page.keyboard.press(`${modifier}+KeyV`, { delay: INPUT_DELAY });
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

  test.fixme('Copy and Paste structure and edit', async ({ page }) => {
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

  test.fixme('Copy and paste the reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1717
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting two same structures located on canvas.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas('reaction-dif-prop.rxn', page);
    await copyAndPaste(page);
    await page.mouse.click(x, y);
  });

  test.fixme('Copy and paste the Atom from reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1717
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting two same structures located on canvas.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas('reaction-dif-prop.rxn', page);
    await clickOnAtom(page, 'C', 0);
    await page.keyboard.press('Control+c');
    await page.keyboard.press('Control+v');
    await page.mouse.click(x, y);
  });

  test.fixme('Copy and paste the Bond from reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1717
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting two same structures located on canvas.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas('reaction-dif-prop.rxn', page);
    await clickOnBond(page, BondType.SINGLE, 0);
    await page.keyboard.press('Control+c');
    await page.keyboard.press('Control+v');
    await page.mouse.click(x, y);
  });

  test('Copy and paste the reaction with hotkey', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1717
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting two same structures located on canvas.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas('reaction-dif-prop.rxn', page);
    await copyAndPaste(page);
    await page.mouse.click(x, y);
  });

  test.fixme('Multiple Paste action', async ({ page }) => {
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

  test.fixme(
    'Copy and paste the Generic S-Group structure',
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-1726
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting three same structures located on canvas.
    */
      const x = 500;
      const y = 200;
      await openFileAndAddToCanvas('generic-groups.mol', page);
      await copyAndPaste(page);
      await page.mouse.click(x, y);
    },
  );

  test.fixme(
    'Cut and Paste the Generic S-Group structure and edit',
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-1726
    Description: The correct structure is pasted on the canvas.
    All Generic S-Group are correctly rendered.
    User is able to edit the pasted structure.
    */
      await openFileAndAddToCanvas('generic-groups.mol', page);
      await cutAndPaste(page);
      await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
      await delay(DELAY_IN_SECONDS.TWO);
      await selectAtomInToolbar(AtomButton.Nitrogen, page);
      await clickOnAtom(page, 'C', 12);
    },
  );

  test.fixme(
    'Copy and paste and  Edit the pasted Structure',
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-1719
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting three same structures located on canvas.
    */
      const x = 500;
      const y = 200;
      await openFileAndAddToCanvas('query-feat.mol', page);
      await copyAndPaste(page);
      await page.mouse.click(x, y);
    },
  );

  test.fixme(
    'Cut and Paste and Edit the pasted Structure',
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-1719
    Description: The correct structure is pasted on the canvas.
    All Generic S-Group are correctly rendered.
    User is able to edit the pasted structure.
    */
      await openFileAndAddToCanvas('query-feat.mol', page);
      await cutAndPaste(page);
      await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
      await delay(DELAY_IN_SECONDS.TWO);
      await selectAtomInToolbar(AtomButton.Nitrogen, page);
      await clickOnAtom(page, 'C', 12);
    },
  );

  test('Copy and paste R-Group structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1724
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting R-Group structure same structures located on canvas.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas('R-Group-structure.mol', page);
    await copyAndPaste(page);
    await page.mouse.click(x, y);
  });

  test('Cut and Paste R-Group structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1724
    Description: The correct structure is pasted on the canvas.
    All R-Group structure are correctly rendered.
    User is able to edit the pasted structure.
    */
    await openFileAndAddToCanvas('R-Group-structure.mol', page);
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', 5);
  });

  test('Copy and paste the S-Group structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1725
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting three same structures located on canvas.
    */
    const x = 500;
    const y = 300;
    await openFileAndAddToCanvas('s-group-features.mol', page);
    await copyAndPaste(page);
    await page.mouse.click(x, y);
  });

  test('Cut and Paste the S-Group structure and edit', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1725
    Description: The correct structure is pasted on the canvas.
    All Generic S-Group are correctly rendered.
    User is able to edit the pasted structure.
    */
    await openFileAndAddToCanvas('s-group-features.mol', page);
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', 12);
  });

  test('Copy and paste the structure with attached data', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1727
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting three same structures located on canvas.
    */
    const x = 500;
    const y = 300;
    await openFileAndAddToCanvas('attached.mol', page);
    await copyAndPaste(page);
    await page.mouse.click(x, y);
  });

  test('Cut and Paste structure with attached data and edit', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1727
    Description: The correct structure is pasted on the canvas.
    All attached data are correctly rendered.
    User is able to edit the pasted structure.
    */
    await openFileAndAddToCanvas('attached.mol', page);
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', 12);
  });

  test('Copy and paste Stereo structure with Chiral flag', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1728
    Description: Copied objects are pasted correctly.
    The structure is copied (and then is pasted) with the Chiral flag.
    */
    const x = 500;
    const y = 300;
    await openFileAndAddToCanvas('chiral-structure.mol', page);
    await copyAndPaste(page);
    await page.mouse.click(x, y);
  });

  test('Cut and Paste structure with Stereo and Chiral flag and edit', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1728
    Description: Copied objects are pasted correctly.
    The structure is cut (and then is pasted) with the Chiral flag.
    */
    await openFileAndAddToCanvas('chiral-structure.mol', page);
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', 12);
  });

  test('Copy and paste reaction by hotkeys', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1730
    Description: Copied objects are pasted correctly.
    The structure is copied (and then is pasted) with reaction arrow and plus sign
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas('reaction.rxn', page);
    await copyAndPaste(page);
    await page.mouse.click(x, y);
  });

  test('Cut and Paste reaction by hotkeys and edit', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1730
    Description: Copied objects are pasted correctly.
    The structure is cut (and then is pasted) with reaction arrow and plus sign
    */
    await openFileAndAddToCanvas('reaction.rxn', page);
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', 12);
  });

  test('Copy and paste reaction with changed arrow', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2873
    Description: Copied reaction has Failed Arrow with default size and position.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas('structure-with-failed-arrow.rxn', page);
    await copyAndPaste(page);
    await page.mouse.click(x, y);
  });

  test('Cut and Paste reaction with changed arrow and edit', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2873
    Description: Cut reaction has Failed Arrow with default size and position.
    */
    await openFileAndAddToCanvas('structure-with-failed-arrow.rxn', page);
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', 5);
  });

  test('Copy and paste reaction with multiple arrows', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2874
    Description: Copied reaction has plus sign and one arrow.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas('arrows-in-different-directions.rxn', page);
    await copyAndPaste(page);
    await page.mouse.click(x, y);
  });

  test('Cut and Paste reaction with multiple arrows and edit', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2874
    Description: Cut reaction has plus sign and one arrow.
    */
    await openFileAndAddToCanvas('arrows-in-different-directions.rxn', page);
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', 5);
  });

  test('Copy and paste all kind of S-groups', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2884
    Description: Copied objects are pasted as one object and correctly displayed without data loss.
    */
    const x = 100;
    const y = 100;
    await openFileAndAddToCanvas(
      'structure-with-all-kinds-of-s-groups.mol',
      page,
    );
    await copyAndPaste(page);
    await page.mouse.click(x, y);
  });

  test('Cut and Paste all kind of S-groups and edit', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2884
    Description: Cut objects are pasted as one object and correctly displayed without data loss.
    */
    await openFileAndAddToCanvas(
      'structure-with-all-kinds-of-s-groups.mol',
      page,
    );
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', 5);
  });
});

test.describe('Copy/Cut/Paste Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await expect(page).toHaveScreenshot();
  });

  test.fixme('Copy button', async ({ page }) => {
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
    await page.getByTestId('copy-button-dropdown-triangle').click();
    await delay(DELAY_IN_SECONDS.THREE);
    await expect(page).toHaveScreenshot();
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Control+a');
    await page.getByTestId('copy-button-dropdown-triangle').click();
  });

  test.fixme('Cut button', async ({ page }) => {
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
    await delay(DELAY_IN_SECONDS.THREE);
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
    await delay(DELAY_IN_SECONDS.THREE);
  });
});
