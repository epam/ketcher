/* eslint-disable no-magic-numbers */
import { expect, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  clickOnAtom,
  BondType,
  dragMouseTo,
  screenshotBetweenUndoRedo,
  openFileAndAddToCanvas,
  getCoordinatesOfTheMiddleOfTheScreen,
  clickOnBond,
  waitForPageInit,
  waitForIndigoToLoad,
  waitForRender,
  clickAfterItemsToMergeInitialization,
  cutToClipboardByKeyboard,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  moveMouseAway,
  clickOnCanvas,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { resetCurrentTool } from '@utils/canvas/tools/resetCurrentTool';
import { OpenStructureDialog } from '@tests/pages/common/OpenStructureDialog';
import { PasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';
import { MoleculesTopToolbar } from '@tests/pages/molecules/MoleculesTopToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { INPUT_DELAY } from '@utils/globals';

const CANVAS_CLICK_X = 500;
const CANVAS_CLICK_Y = 300;

test.describe('Copy/Cut/Paste Actions', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Cut part of structures', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1712
    Description: After the clicking the 'Cut' button, the selected object disappears.
    */
    const xDelta = 200;
    const yDelta = 200;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/query-features.mol');
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + xDelta, y + yDelta, page);
    await MoleculesTopToolbar(page).cut();
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Cut all structures', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1712
    Description: After the clicking the 'Cut' button, the selected object disappears.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/query-features.mol');
    await selectAllStructuresOnCanvas(page);
    await MoleculesTopToolbar(page).cut();
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Cut one Atom on structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1712
    Description: After the clicking the 'Cut' button, the selected object disappears.
    */
    const anyAtom = 3;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/query-features.mol');
    await clickOnAtom(page, 'C', anyAtom);
    await MoleculesTopToolbar(page).cut();
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Cut one Bond on structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1712
    Description: After the clicking the 'Cut' button, the selected object disappears.
    */
    const anyBond = 0;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/query-features.mol');
    await clickOnBond(page, BondType.TRIPLE, anyBond);
    await MoleculesTopToolbar(page).cut();
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Cut all structures via hotkey (CTRL+X)', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1712
    Description: After the clicking the 'Cut' button, the selected object disappears.
    Not able to perform undo
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/query-features.mol');
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);
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
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/clean-diff-properties.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Cut the reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1714
    Description: After the clicking the Cut button, the selected object disappears.
    */
    const x = 600;
    const y = 300;
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction-dif-prop.rxn');
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Cut the Atom from reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1714
    Description: After the clicking the Cut button, the selected object disappears.
    */
    const anyAtom = 1;
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction-dif-prop.rxn');
    await waitForRender(page, async () => {
      await clickOnAtom(page, 'C', anyAtom);
    });
    await cutToClipboardByKeyboard(page, { delay: INPUT_DELAY });
    await pasteFromClipboardByKeyboard(page, { delay: INPUT_DELAY });
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Cut the Bond from reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1714
    Description: After the clicking the Cut button, the selected object disappears.
    */
    const anyBond = 1;
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction-dif-prop.rxn');
    await waitForRender(page, async () => {
      await clickOnBond(page, BondType.SINGLE, anyBond);
    });
    await cutToClipboardByKeyboard(page, { delay: INPUT_DELAY });
    await pasteFromClipboardByKeyboard(page, { delay: INPUT_DELAY });
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Cut the reaction with hotkey', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1714
    Description: After the clicking the Cut button, the selected object disappears.
    Not able to perform undo
    */
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction-dif-prop.rxn');
    // 1. Loaded reaction
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    // 2. Empty canvas - We removed all from canvas by Cut to clipboard
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
    // 3. Reaction on the canvas - We returned all back to canvas
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).redo();
    // 4. Emty canvas - We Undo previus Redo
    await takeEditorScreenshot(page);
  });

  test('Copy structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1715
    Description: After the clicking the Copy button, the selected object not disappears.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/query-features.mol');
    await selectAllStructuresOnCanvas(page);
    await MoleculesTopToolbar(page).copy();
    await takeEditorScreenshot(page);
  });

  test('Copy the Atom from reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1715
    Description: After the clicking the Copy button, the selected object not disappears.
    */
    const anyAtom = 0;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/query-features.mol');
    await clickOnAtom(page, 'C', anyAtom);
    await MoleculesTopToolbar(page).copy();
    await takeEditorScreenshot(page);
  });

  test('Copy the Bond from reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1715
    Description: After the clicking the Copy button, the selected object not disappears.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/query-features.mol');
    await clickOnBond(page, BondType.SINGLE, 0);
    await MoleculesTopToolbar(page).copy();
    await takeEditorScreenshot(page);
  });

  test('Copy the reaction with hotkey', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1715
    Description: After the clicking the Copy button, the selected object not disappears.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/query-features.mol');
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await takeEditorScreenshot(page);
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
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/clean-diff-properties.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Copy and paste the reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1717
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting two same structures located on canvas.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction-dif-prop.rxn');
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Copy and paste the Atom from reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1717
    Description: Atom from reaction is copy and pasted.
    */
    const x = 300;
    const y = 300;
    const anyAtom = 0;
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction-dif-prop.rxn');
    await waitForRender(page, async () => {
      await clickOnAtom(page, 'C', anyAtom);
    });
    await copyToClipboardByKeyboard(page, { delay: INPUT_DELAY });
    await pasteFromClipboardByKeyboard(page, { delay: INPUT_DELAY });
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Copy and paste the Bond from reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1717
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting two same structures located on canvas.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction-dif-prop.rxn');
    await waitForRender(page, async () => {
      await clickOnBond(page, BondType.SINGLE, 0);
    });

    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);

    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Copy and paste the reaction with hotkey', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1717
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting two same structures located on canvas.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction-dif-prop.rxn');
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
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
      page,
      'Molfiles-V2000/clean-diff-properties.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x2, y2, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Copy and paste the Generic S-Group structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1726
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting three same structures located on canvas.
    */
    const x = 700;
    const y = 300;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/generic-groups.mol');
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
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
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/generic-groups.mol');
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Copy and paste and Edit the pasted Structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1719
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting three same structures located on canvas.
    */
    const x = 300;
    const y = 200;
    const anyAtom = 12;
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/query-features.mol');
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickAfterItemsToMergeInitialization(page, x, y);
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
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
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/query-features.mol');
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Copy and paste R-Group structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1724
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting R-Group structure same structures located on canvas.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/R-Group-structure.mol');
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
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
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/R-Group-structure.mol');
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await waitForRender(page, async () => {
      await clickOnAtom(page, 'C', anyAtom);
    });
    await takeEditorScreenshot(page);
  });

  test('Copy and paste the S-Group structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1725
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting three same structures located on canvas.
    */
    const x = 500;
    const y = 300;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/s-group-features.mol');
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
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
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/s-group-features.mol');
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Copy and paste the structure with attached data', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1727
    Description: After the clicking the Copy button, the selected object not disappears.
    After pasting three same structures located on canvas.
    */
    const x = 500;
    const y = 300;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/attached.mol');
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
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
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/attached.mol');
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Copy and paste Stereo structure with Chiral flag', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1728
    Description: Copied objects are pasted correctly.
    The structure is copied (and then is pasted) with the Chiral flag.
    */
    const x = 500;
    const y = 300;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/chiral-structure.mol');
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
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
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/chiral-structure.mol');
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Copy and paste reaction by hotkeys', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1730
    Description: Copied objects are pasted correctly.
    The structure is copied (and then is pasted) with reaction arrow and plus sign
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction.rxn');
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Cut and Paste reaction by hotkeys and edit', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1730
    Description: Copied objects are pasted correctly.
    The structure is cut (and then is pasted) with reaction arrow and plus sign
    */
    // Nitrogen atom can't attach to structure.
    const anyAtom = 12;
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction.rxn');
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
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
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(page, 'Rxn-V2000/rxn-reaction.rxn');
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await openFileAndAddToCanvas(page, 'Rxn-V2000/allenes.rxn');
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Copy and paste reaction with changed arrow', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2873
    Description: Copied reaction has Failed Arrow with default size and position.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas(
      page,
      'Rxn-V2000/structure-with-failed-arrow.rxn',
    );
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('Cut and Paste reaction with changed arrow and edit', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2873
    Description: Cut reaction has Failed Arrow with default size and position.
    */
    const anyAtom = 5;
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(
      page,
      'Rxn-V2000/structure-with-failed-arrow.rxn',
    );
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Copy and paste reaction with multiple arrows', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2874
    Description: Copied reaction has plus sign and one arrow.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas(
      page,
      'Rxn-V2000/arrows-in-different-directions.rxn',
    );
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Cut and Paste reaction with multiple arrows and edit', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2874
    Description: Cut reaction has plus sign and one arrow.
    */
    const anyAtom = 5;
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(
      page,
      'Rxn-V2000/arrows-in-different-directions.rxn',
    );
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
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
      page,
      'Molfiles-V2000/structure-with-all-kinds-of-s-groups.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Cut and Paste all kind of S-groups and edit', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2884
    Description: Cut objects are pasted as one object and correctly displayed without data loss.
    */
    // Can't attach atom of Nitrogen to structure.
    const anyAtom = 5;
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-with-all-kinds-of-s-groups.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Copy and paste Mapped reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2883
    Description: Copied objects are pasted as one object and correctly displayed without data loss.
    */
    const x = 300;
    const y = 200;
    await openFileAndAddToCanvas(page, 'Rxn-V2000/mapped-structure.rxn');
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('Cut and Paste Mapped reaction and edit', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2883
    Description: Cut objects are pasted as one object and correctly displayed without data loss.
    */
    const x = 300;
    const y = 200;
    const anyAtom = 5;

    await openFileAndAddToCanvas(page, 'Rxn-V2000/mapped-structure.rxn');
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await RightToolbar(page).clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Copy and paste All kinds of bonds', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2945
    Description: Copied bonds are pasted as one object and correctly displayed without data loss.
    */
    const x = 300;
    const y = 400;
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/all-kinds-of-bonds-test-file.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Copy and paste structure with Stereochemistry', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2946
    Description: Copied objects are pasted as one object and correctly displayed without data loss.
    */
    const x = 300;
    const y = 200;
    await openFileAndAddToCanvas(page, 'KET/stereo-test-structures.ket');
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Cut and Paste structure with Stereochemistry and edit', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2946
    Description: Cut objects are pasted as one object and correctly displayed without data loss.
    */
    const anyAtom = 5;
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(page, 'KET/stereo-test-structures.ket');
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'C', anyAtom);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
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
      page,
      'Molfiles-V2000/complex-r-group-structure.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
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
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/complex-r-group-structure.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'C', anyAtom);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
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
      page,
      'KET/structure-with-simple-objects-and-text.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
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
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(
      page,
      'KET/structure-with-simple-objects-and-text.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
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
      page,
      'Molfiles-V2000/aromatic-structures.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickAfterItemsToMergeInitialization(page, x, y);
    await takeEditorScreenshot(page);
  });

  test('Cut and Paste Aromatic structure and edit', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2949
    Description: The correct structure is pasted on the canvas.
    All  Aromatic structure are correctly rendered.
    User is able to edit the pasted structure.
    */
    const anyAtom = 5;
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/aromatic-structures.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickOnAtom(page, 'C', anyAtom);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
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
    await openFileAndAddToCanvas(page, 'KET/expanded-and-contracted-fg.ket');
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
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
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(page, 'KET/expanded-and-contracted-fg.ket');
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
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
      page,
      'Molfiles-V2000/expanded-and-contracted-salts.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
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
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/expanded-and-contracted-salts.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'S', anyAtom);
    await takeEditorScreenshot(page);
  });
});

test.describe('Copy/Cut/Paste Actions', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
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
    await MoleculesTopToolbar(page).expandCopyDropdown();
    await expect(page).toHaveScreenshot();
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await MoleculesTopToolbar(page).expandCopyDropdown();
    await expect(page).toHaveScreenshot();
  });

  test('Cut button', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1710
    Description: The 'Cut' button  is disabled if nothing is selected on the canvas.
    The 'Cut (Ctrl+X)' cut the structure.
    */
    await waitForIndigoToLoad(page);
    await expect(page).toHaveScreenshot();
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await expect(page).toHaveScreenshot();
    await MoleculesTopToolbar(page).cut();
    await expect(page).toHaveScreenshot();
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
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await MoleculesTopToolbar(page).cut();
    await MoleculesTopToolbar(page).paste();
    await expect(page).toHaveScreenshot();
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

    await CommonTopLeftToolbar(page).openFile();
    await OpenStructureDialog(page).pasteFromClipboard();
    await PasteFromClipboardDialog(page).openStructureTextarea.fill(
      smartsString,
    );
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await PasteFromClipboardDialog(page).cancel();
    await page.keyboard.press('Control+Alt+v');
    await clickInTheMiddleOfTheScreen(page, 'left', {
      waitForMergeInitialization: true,
    });
    await expect(page).toHaveScreenshot();
  });
});
