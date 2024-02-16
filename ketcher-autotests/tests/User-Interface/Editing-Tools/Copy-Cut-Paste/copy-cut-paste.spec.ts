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
  waitForPageInit,
  waitForIndigoToLoad,
  waitForRender,
  resetCurrentTool,
  pressButton,
} from '@utils';

const CANVAS_CLICK_X = 500;
const CANVAS_CLICK_Y = 300;

test.describe('Copy/Cut/Paste Actions', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
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
    await openFileAndAddToCanvas('Molfiles-V2000/query-features.mol', page);
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
    await openFileAndAddToCanvas('Molfiles-V2000/query-features.mol', page);
    await page.keyboard.press('Control+a');
    await selectTopPanelButton(TopPanelButton.Cut, page);
    await screenshotBetweenUndoRedo(page);
  });

  test('Cut one Atom on structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1712
    Description: After the clicking the 'Cut' button, the selected object disappears.
    */
    const anyAtom = 3;
    await openFileAndAddToCanvas('Molfiles-V2000/query-features.mol', page);
    await clickOnAtom(page, 'C', anyAtom);
    await selectTopPanelButton(TopPanelButton.Cut, page);
    await screenshotBetweenUndoRedo(page);
  });

  test('Cut one Bond on structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1712
    Description: After the clicking the 'Cut' button, the selected object disappears.
    */
    const anyBond = 0;
    await openFileAndAddToCanvas('Molfiles-V2000/query-features.mol', page);
    await clickOnBond(page, BondType.TRIPLE, anyBond);
    await selectTopPanelButton(TopPanelButton.Cut, page);
    await screenshotBetweenUndoRedo(page);
  });

  test('Cut all structures via hotkey (CTRL+X)', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1712
    Description: After the clicking the 'Cut' button, the selected object disappears.
    Not able to perform undo
    */
    const modifier = getControlModifier();
    await openFileAndAddToCanvas('Molfiles-V2000/query-features.mol', page);
    await page.keyboard.press(`${modifier}+KeyA`);
    await page.keyboard.press(`${modifier}+KeyX`);
    await screenshotBetweenUndoRedo(page);
  });

  test('Cut and Paste structure and edit', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1713
    Description: The correct structure is pasted on the canvas.
    All query features are correctly rendered.
    User is able to edit the pasted structure.
    */
    const x = 500;
    const y = 200;
    const anyAtom = 12;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/clean-diff-properties.mol',
      page,
    );
    await cutAndPaste(page);
    await page.mouse.click(x, y);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', anyAtom);
  });

  test('Cut the reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1714
    Description: After the clicking the Cut button, the selected object disappears.
    */
    const x = 600;
    const y = 300;
    await openFileAndAddToCanvas('Rxn-V2000/reaction-dif-prop.rxn', page);
    await cutAndPaste(page);
    await page.mouse.click(x, y);
    await screenshotBetweenUndoRedo(page);
  });

  test('Cut the Atom from reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1714
    Description: After the clicking the Cut button, the selected object disappears.
    */
    const anyAtom = 1;
    const modifier = getControlModifier();
    await openFileAndAddToCanvas('Rxn-V2000/reaction-dif-prop.rxn', page);
    await waitForRender(page, async () => {
      await clickOnAtom(page, 'C', anyAtom);
    });
    await waitForRender(page, async () => {
      await page.keyboard.press(`${modifier}+KeyX`, { delay: INPUT_DELAY });
    });
    await waitForRender(page, async () => {
      await page.keyboard.press(`${modifier}+KeyV`, { delay: INPUT_DELAY });
    });
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await screenshotBetweenUndoRedo(page);
  });

  test('Cut the Bond from reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1714
    Description: After the clicking the Cut button, the selected object disappears.
    */
    const anyBond = 1;
    const modifier = getControlModifier();
    await openFileAndAddToCanvas('Rxn-V2000/reaction-dif-prop.rxn', page);
    await waitForRender(page, async () => {
      await clickOnBond(page, BondType.SINGLE, anyBond);
    });
    await waitForRender(page, async () => {
      await page.keyboard.press(`${modifier}+KeyX`, { delay: INPUT_DELAY });
    });
    await waitForRender(page, async () => {
      await page.keyboard.press(`${modifier}+KeyV`, { delay: INPUT_DELAY });
    });
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await screenshotBetweenUndoRedo(page);
  });

  test('Cut the reaction with hotkey', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1714
    Description: After the clicking the Cut button, the selected object disappears.
    Not able to perform undo
    */
    await openFileAndAddToCanvas('Rxn-V2000/reaction-dif-prop.rxn', page);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+x');
    await screenshotBetweenUndoRedo(page);
  });

  test('Copy structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1715
    Description: After the clicking the Copy button, the selected object not disappears.
    */
    await openFileAndAddToCanvas('Molfiles-V2000/query-features.mol', page);
    await page.keyboard.press('Control+a');
    await selectTopPanelButton(TopPanelButton.Copy, page);
  });

  test('Copy the Atom from reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1715
    Description: After the clicking the Copy button, the selected object not disappears.
    */
    const anyAtom = 0;
    await openFileAndAddToCanvas('Molfiles-V2000/query-features.mol', page);
    await clickOnAtom(page, 'C', anyAtom);
    await selectTopPanelButton(TopPanelButton.Copy, page);
  });

  test('Copy the Bond from reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1715
    Description: After the clicking the Copy button, the selected object not disappears.
    */
    await openFileAndAddToCanvas('Molfiles-V2000/query-features.mol', page);
    await clickOnBond(page, BondType.SINGLE, 0);
    await selectTopPanelButton(TopPanelButton.Copy, page);
  });

  test('Copy the reaction with hotkey', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1715
    Description: After the clicking the Copy button, the selected object not disappears.
    */
    await openFileAndAddToCanvas('Molfiles-V2000/query-features.mol', page);
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
    // Nitrogen atom can't attach to atom on structure.
    const x = 400;
    const y = 300;
    const anyAtom = 12;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/clean-diff-properties.mol',
      page,
    );
    await copyAndPaste(page);
    await page.mouse.click(x, y);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', anyAtom);
  });

  test('Copy and paste the reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1717
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting two same structures located on canvas.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas('Rxn-V2000/reaction-dif-prop.rxn', page);
    await copyAndPaste(page);
    await page.mouse.click(x, y);
  });

  test('Copy and paste the Atom from reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1717
    Description: Atom from reaction is copy and pasted.
    */
    const x = 300;
    const y = 300;
    const anyAtom = 0;
    const modifier = getControlModifier();
    await openFileAndAddToCanvas('Rxn-V2000/reaction-dif-prop.rxn', page);
    await waitForRender(page, async () => {
      await clickOnAtom(page, 'C', anyAtom);
    });
    await waitForRender(page, async () => {
      await page.keyboard.press(`${modifier}+KeyC`, { delay: INPUT_DELAY });
    });
    await waitForRender(page, async () => {
      await page.keyboard.press(`${modifier}+KeyV`, { delay: INPUT_DELAY });
    });
    await page.mouse.click(x, y);
  });

  test('Copy and paste the Bond from reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1717
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting two same structures located on canvas.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas('Rxn-V2000/reaction-dif-prop.rxn', page);
    await waitForRender(page, async () => {
      await clickOnBond(page, BondType.SINGLE, 0);
    });
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
    await openFileAndAddToCanvas('Rxn-V2000/reaction-dif-prop.rxn', page);
    await copyAndPaste(page);
    await page.mouse.click(x, y);
  });

  test('Multiple Paste action', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1718
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting two same structures located on canvas.
    */
    const x = 400;
    const y = 200;
    const x2 = 400;
    const y2 = 300;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/clean-diff-properties.mol',
      page,
    );
    await copyAndPaste(page);
    await page.mouse.click(x, y);
    await page.keyboard.press('Control+v');
    await page.mouse.click(x2, y2);
  });

  test('Copy and paste the Generic S-Group structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1726
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting three same structures located on canvas.
    */
    const x = 700;
    const y = 300;
    await openFileAndAddToCanvas('Molfiles-V2000/generic-groups.mol', page);
    await copyAndPaste(page);
    await page.mouse.click(x, y);
  });

  test('Cut and Paste the Generic S-Group structure and edit', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1726
    Description: The correct structure is pasted on the canvas.
    All Generic S-Group are correctly rendered.
    User is able to edit the pasted structure.
    */
    const x = 500;
    const y = 200;
    const anyAtom = 12;
    await openFileAndAddToCanvas('Molfiles-V2000/generic-groups.mol', page);
    await cutAndPaste(page);
    await page.mouse.click(x, y);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', anyAtom);
  });

  test('Copy and paste and  Edit the pasted Structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1719
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting three same structures located on canvas.
    */
    const x = 300;
    const y = 200;
    const anyAtom = 12;
    await openFileAndAddToCanvas('Molfiles-V2000/query-features.mol', page);
    await copyAndPaste(page);
    await page.mouse.click(x, y);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', anyAtom);
  });

  test('Cut and Paste and Edit the pasted Structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1719
    Description: The correct structure is pasted on the canvas.
    All Generic S-Group are correctly rendered.
    User is able to edit the pasted structure.
    */
    const x = 300;
    const y = 200;
    const anyAtom = 12;
    await openFileAndAddToCanvas('Molfiles-V2000/query-features.mol', page);
    await cutAndPaste(page);
    await page.mouse.click(x, y);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', anyAtom);
  });

  test('Copy and paste R-Group structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1724
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting R-Group structure same structures located on canvas.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas('Molfiles-V2000/R-Group-structure.mol', page);
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
    // Nitrogen atom can't attach to structure
    const x = 500;
    const y = 300;
    const anyAtom = 5;
    await openFileAndAddToCanvas('Molfiles-V2000/R-Group-structure.mol', page);
    await cutAndPaste(page);
    await page.mouse.click(x, y);
    await waitForRender(page, async () => {
      await selectAtomInToolbar(AtomButton.Nitrogen, page);
    });
    await waitForRender(page, async () => {
      await clickOnAtom(page, 'C', anyAtom);
    });
  });

  test('Copy and paste the S-Group structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1725
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting three same structures located on canvas.
    */
    const x = 500;
    const y = 300;
    await openFileAndAddToCanvas('Molfiles-V2000/s-group-features.mol', page);
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
    // Can't add atom to structure
    const x = 500;
    const y = 300;
    const anyAtom = 12;
    await openFileAndAddToCanvas('Molfiles-V2000/s-group-features.mol', page);
    await cutAndPaste(page);
    await page.mouse.click(x, y);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', anyAtom);
  });

  test('Copy and paste the structure with attached data', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1727
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting three same structures located on canvas.
    */
    const x = 500;
    const y = 300;
    await openFileAndAddToCanvas('Molfiles-V2000/attached.mol', page);
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
    // Nitrogen atom can't attach to structure
    const anyAtom = 12;
    await openFileAndAddToCanvas('Molfiles-V2000/attached.mol', page);
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', anyAtom);
  });

  test('Copy and paste Stereo structure with Chiral flag', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1728
    Description: Copied objects are pasted correctly.
    The structure is copied (and then is pasted) with the Chiral flag.
    */
    const x = 500;
    const y = 300;
    await openFileAndAddToCanvas('Molfiles-V2000/chiral-structure.mol', page);
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
    const anyAtom = 12;
    await openFileAndAddToCanvas('Molfiles-V2000/chiral-structure.mol', page);
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', anyAtom);
  });

  test('Copy and paste reaction by hotkeys', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1730
    Description: Copied objects are pasted correctly.
    The structure is copied (and then is pasted) with reaction arrow and plus sign
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas('Rxn-V2000/reaction.rxn', page);
    await copyAndPaste(page);
    await page.mouse.click(x, y);
  });

  test('Cut and Paste reaction by hotkeys and edit', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1730
    Description: Copied objects are pasted correctly.
    The structure is cut (and then is pasted) with reaction arrow and plus sign
    */
    // Nitrogen atom can't attach to structure.
    const anyAtom = 12;
    await openFileAndAddToCanvas('Rxn-V2000/reaction.rxn', page);
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', anyAtom);
  });

  test('Copy/Cut/Paste reaction at the same canvas', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1739
    Description: The whole reaction is copied and pasted correctly.
    Select any reaction component. Copy/Paste the structure into the canvas.
    Select the other reaction component. Cut/Paste it into the canvas.
    Select the whole reaction. Cut/Paste it into the canvas.
    */
    const anyAtom = 8;
    await openFileAndAddToCanvas('Rxn-V2000/rxn-reaction.rxn', page);
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await openFileAndAddToCanvas('Rxn-V2000/allenes.rxn', page);
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', anyAtom);
  });

  test('Copy and paste reaction with changed arrow', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2873
    Description: Copied reaction has Failed Arrow with default size and position.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas(
      'Rxn-V2000/structure-with-failed-arrow.rxn',
      page,
    );
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
    const anyAtom = 5;
    await openFileAndAddToCanvas(
      'Rxn-V2000/structure-with-failed-arrow.rxn',
      page,
    );
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', anyAtom);
  });

  test('Copy and paste reaction with multiple arrows', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2874
    Description: Copied reaction has plus sign and one arrow.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas(
      'Rxn-V2000/arrows-in-different-directions.rxn',
      page,
    );
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
    const anyAtom = 5;
    await openFileAndAddToCanvas(
      'Rxn-V2000/arrows-in-different-directions.rxn',
      page,
    );
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', anyAtom);
  });

  test('Copy and paste all kind of S-groups', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2884
    Description: Copied objects are pasted as one object and correctly displayed without data loss.
    Not able to load indigo in time
    */
    const x = 300;
    const y = 200;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-with-all-kinds-of-s-groups.mol',
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
    // Can't attach atom of Nitrogen to structure.
    const anyAtom = 5;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-with-all-kinds-of-s-groups.mol',
      page,
    );
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', anyAtom);
  });

  test('Copy and paste Mapped reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2883
    Description: Copied objects are pasted as one object and correctly displayed without data loss.
    */
    const x = 300;
    const y = 200;
    await openFileAndAddToCanvas('Rxn-V2000/mapped-structure.rxn', page);
    await copyAndPaste(page);
    await page.mouse.click(x, y);
  });

  test('Cut and Paste Mapped reaction and edit', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2883
    Description: Cut objects are pasted as one object and correctly displayed without data loss.
    */
    const x = 300;
    const y = 200;
    const anyAtom = 5;
    await openFileAndAddToCanvas('Rxn-V2000/mapped-structure.rxn', page);
    await cutAndPaste(page);
    await page.mouse.click(x, y);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', anyAtom);
  });

  test('Copy and paste All kinds of bonds', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2945
    Description: Copied bonds are pasted as one object and correctly displayed without data loss.
    */
    const x = 300;
    const y = 400;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/all-kinds-of-bonds-test-file.mol',
      page,
    );
    await copyAndPaste(page);
    await page.mouse.click(x, y);
  });

  test('Copy and paste structure with Stereochemistry', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2946
    Description: Copied objects are pasted as one object and correctly displayed without data loss.
    */
    const x = 300;
    const y = 200;
    await openFileAndAddToCanvas('KET/stereo-test-structures.ket', page);
    await copyAndPaste(page);
    await page.mouse.click(x, y);
  });

  test('Cut and Paste structure with Stereochemistry and edit', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2946
    Description: Cut objects are pasted as one object and correctly displayed without data loss.
    */
    const anyAtom = 5;
    await openFileAndAddToCanvas('KET/stereo-test-structures.ket', page);
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', anyAtom);
    await resetCurrentTool(page);
  });

  test('Copy and paste complex R-Group structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2947
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting R-Group structure same structures located on canvas.
    */
    // Error message when run under docker. But manual test is working.
    const x = 500;
    const y = 300;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/complex-r-group-structure.mol',
      page,
    );
    await copyAndPaste(page);
    await page.mouse.click(x, y);
  });

  test('Cut and Paste complex R-Group structure and edit', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2947
    Description: The correct structure is pasted on the canvas.
    All R-Group structure are correctly rendered.
    User is able to edit the pasted structure.
    */
    // Error message when run under docker. But manual test is working.
    const anyAtom = 5;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/complex-r-group-structure.mol',
      page,
    );
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', anyAtom);
    await resetCurrentTool(page);
  });

  test('Copy and paste Structure with Simple objects and text', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2948
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting Structure with Simple objects and text same structures located on canvas.
    */
    const x = 550;
    const y = 150;
    await openFileAndAddToCanvas(
      'KET/structure-with-simple-objects-and-text.ket',
      page,
    );
    await copyAndPaste(page);
    await page.mouse.click(x, y);
  });

  test('Cut and Paste Structure with Simple objects and text and edit', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2948
    Description: The correct structure is pasted on the canvas.
    All Structure with Simple objects and text are correctly rendered.
    User is able to edit the pasted structure.
    */
    // Can't attach atom of Nitrogen to structure.
    const anyAtom = 5;
    await openFileAndAddToCanvas(
      'KET/structure-with-simple-objects-and-text.ket',
      page,
    );
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', anyAtom);
  });

  test('Copy and paste Aromatic structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2949
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting  Aromatic structure same structures located on canvas.
    */
    const x = 500;
    const y = 100;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/aromatic-structures.mol',
      page,
    );
    await copyAndPaste(page);
    await page.mouse.click(x, y);
  });

  test('Cut and Paste Aromatic structure and edit', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2949
    Description: The correct structure is pasted on the canvas.
    All  Aromatic structure are correctly rendered.
    User is able to edit the pasted structure.
    */
    const anyAtom = 5;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/aromatic-structures.mol',
      page,
    );
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await clickOnAtom(page, 'C', anyAtom);
    await resetCurrentTool(page);
  });

  test('Copy and paste expanded and contracted Functional Froups', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2952
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting expanded and contracted Functional Froups same structures located on canvas.
    */
    const x = 500;
    const y = 150;
    await openFileAndAddToCanvas('KET/expanded-and-contracted-fg.ket', page);
    await copyAndPaste(page);
    await page.mouse.click(x, y);
  });

  test('Cut and Paste expanded and contracted Functional Froups and edit', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2952
    Description: The correct structure is pasted on the canvas.
    All expanded and contracted Functional Froups are correctly rendered.
    User is not able to edit the pasted Functional Groups.
    */
    const anyAtom = 5;
    await openFileAndAddToCanvas('KET/expanded-and-contracted-fg.ket', page);
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', anyAtom);
  });

  test('Copy and paste expanded and contracted Salts and Solvents', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2871
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting expanded and contracted Salts and Solvents same structures located on canvas.
    */
    const x = 500;
    const y = 150;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/expanded-and-contracted-salts.mol',
      page,
    );
    await copyAndPaste(page);
    await page.mouse.click(x, y);
  });

  test('Cut and Paste expanded and contracted Salts and Solvents and edit', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2871
    Description: The correct structure is pasted on the canvas.
    All expanded and contracted Salts and Solvents are correctly rendered.
    User is not able to edit the pasted Functional Groups.
    */
    const anyAtom = 0;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/expanded-and-contracted-salts.mol',
      page,
    );
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'S', anyAtom);
  });
});

test.describe('Copy/Cut/Paste Actions', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
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
    await waitForIndigoToLoad(page);
    await page.getByTestId('copy-button-dropdown-triangle').click();
    await expect(page).toHaveScreenshot();
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Control+a');
    await page.getByTestId('copy-button-dropdown-triangle').click();
  });

  test('Cut button', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1710
    Description: The 'Cut' button  is disabled if nothing is selected on the canvas.
    The 'Cut (Ctrl+X)' cut the structure.
    */
    await waitForIndigoToLoad(page);
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
    await waitForIndigoToLoad(page);
    await expect(page).toHaveScreenshot();
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Control+a');
    await selectTopPanelButton(TopPanelButton.Cut, page);
    await selectTopPanelButton(TopPanelButton.Paste, page);
  });

  test('Paste structure as SMARTS with ctrl+alt+V keyboard shortcut(if the test does not support the Clipboard API then an error appears)', async ({
    page,
  }) => {
    /*
    Description:
    Open 'Paste from clipboard' window to copy SMARTS string. https://github.com/epam/ketcher/issues/3393
    Use ctrl+alt+V keyboard shortcut to paste string as SMARTS
    */
    const smartsString =
      '[#6]-[#6]-[#6]-[#6]-[!#40!#79!#30]-[#6]-[#6]-[#6]-[#6]';
    await selectTopPanelButton(TopPanelButton.Open, page);
    await page.getByText('Paste from clipboard').click();
    await page.getByRole('dialog').getByRole('textbox').fill(smartsString);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    await pressButton(page, 'Cancel');
    await page.keyboard.press('Control+Alt+v');
    await clickInTheMiddleOfTheScreen(page);
  });
});
