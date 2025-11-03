/* eslint-disable no-magic-numbers */
import { test, expect } from '@fixtures';
import { Page } from '@playwright/test';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import {
  addTextBoxToCanvas,
  TextEditorDialog,
} from '@tests/pages/molecules/canvas/TextEditorDialog';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  selectAllStructuresOnCanvas,
  takeEditorScreenshot,
  takeLeftToolbarMacromoleculeScreenshot,
  takeLeftToolbarScreenshot,
} from '@utils/canvas';
import {
  clickOnCanvas,
  keyboardTypeOnCanvas,
  openFileAndAddToCanvasAsNewProject,
  pasteFromClipboardAndAddToCanvas,
} from '@utils/index';
import {
  createRNAAntisenseChain,
  getMonomerLocator,
} from '@utils/macromolecules/monomer';

let page: Page;

test.describe('Ketcher bugs in 3.8.0', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterEach(async () => {
    await CommonTopLeftToolbar(page).clearCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: Copy keyboard shortcut works for text content', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7152
     * Description: Copy keyboard shortcut works for text content
     * Scenario:
     * 1. Go to Molecules mode
     * 2. Press T button and click on canvas to open Text Editor
     * 3. Type some text, select it
     * 4. Press Ctrl+C and than press Ctrl+V
     */
    const pasteText = 'SomeText';
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setText(pasteText);
    await TextEditorDialog(page).clickTextEditor();
    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page);
    await copyToClipboardByKeyboard(page);
    await page.keyboard.press('Backspace');
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Case 2: In Macro mode selection tool not resets to Rectangle when switching between Flex, Snake, and Sequence modes', async ({
    SequenceCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7782
     * Description: In Macro mode selection tool not resets to Rectangle when switching between Flex, Snake, and Sequence modes
     * Scenario:
     * 1. Open Ketcher in Macro mode.
     * 2. Select a non-default selection tool (e.g., Lasso or Fragment).
     * 3. Switch to Flex mode.
     * 4. Switch to Snake mode.
     * 5. Switch to Sequence mode.
     * 6. Observe the active selection tool after each switch.
     */
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await takeLeftToolbarMacromoleculeScreenshot(page);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await takeLeftToolbarMacromoleculeScreenshot(page);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeLeftToolbarMacromoleculeScreenshot(page);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await takeLeftToolbarMacromoleculeScreenshot(page);
  });

  test('Case 3: In Sequence mode selection tool not resets to Rectangle when entering or exiting sequence edit mode', async ({
    SequenceCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7784
     * Description: In Sequence mode selection tool not resets to Rectangle when entering or exiting sequence edit mode
     * Scenario:
     * 1. Open Ketcher in Sequence mode.
     * 2. Select Lasso or Fragment tool.
     * 3. Click the plus button to enter sequence edit mode and add a new row.
     * 4. Observe the active selection tool. (If it Rectangle select Lasso or Fragment again)
     * 5. Exit sequence edit mode by clicking on the canvas.
     * 6. Observe the active selection tool again.
     */
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
    await takeLeftToolbarMacromoleculeScreenshot(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await clickOnCanvas(page, 300, 300, { from: 'pageTopLeft' });
    await takeLeftToolbarMacromoleculeScreenshot(page);
  });

  test('Case 4: Clicking toolbar buttons not resets selection tool from Lasso/Fragment to Rectangle', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7785
     * Description: Clicking toolbar buttons not resets selection tool from Lasso/Fragment to Rectangle
     * Scenario:
     * 1. Open Ketcher in Macro mode
     * 2. Select Lasso or Fragment selection tool.
     * 3. Click on any tool from the left toolbar (Hand, Erase, Single bond, etc.).
     * 4. Observe the active selection tool.
     */
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
    await takeLeftToolbarMacromoleculeScreenshot(page);
    await CommonLeftToolbar(page).handTool();
    await takeLeftToolbarMacromoleculeScreenshot(page);
    await CommonLeftToolbar(page).erase();
    await takeLeftToolbarMacromoleculeScreenshot(page);
  });

  test('Case 5: Connection point enumeration is correct if they are already enumerated form range [3-8]', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7814
     * Description: Connection point enumeration is correct if they are already enumerated form range [3-8]
     * Scenario:
     * 1. Molecules mode (clear canvas)
     * 2. Load structure from clipboard: [*:4]C%91.[*:5]%91 |$_R4;;_R5$|
     * 3. Press Create monomer button
     */
    await pasteFromClipboardAndAddToCanvas(
      page,
      '[*:4]C%91.[*:5]%91 |$_R4;;_R5$|',
    );
    await clickOnCanvas(page, 300, 300, { from: 'pageTopLeft' });
    await selectAllStructuresOnCanvas(page);
    await expect(LeftToolbar(page).createMonomerButton).toBeEnabled();
    await LeftToolbar(page).createMonomer();
    await takeEditorScreenshot(page);
    await CreateMonomerDialog(page).discard();
  });

  test('Case 6: Selection not remains on original structure after creating Antisense RNA/DNA and can be cleared by canvas click', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7794
     * Description: Selection not remains on original structure after creating Antisense RNA/DNA and can be cleared by canvas click
     * Scenario:
     * 1. Open Ketcher in Macro mode.
     * 2. Place an RNA or DNA structure on the canvas.
     * 3. Create Antisense RNA or Antisense DNA from this structure.
     * 4. Observe that the original structure remains highlighted (selected).
     * 5. Click on an empty area of the canvas.
     */
    await Library(page).clickMonomerAutochain(Preset.MOE_A_P);
    const baseA = getMonomerLocator(page, Base.A).first();
    await createRNAAntisenseChain(page, baseA);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await clickOnCanvas(page, 300, 300, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 7: System not allow to create monomer if atom with many R-groups in the selection', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7813
     * Description: System not allow to create monomer if atom with many R-groups in the selection
     * Scenario:
     * 1. Molecules mode (clear canvas)
     * 2. Open structure
     * 3. Select whole structure
     * 4. Press Create monomer button
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/Bugs/r1-r2-structure.mol',
    );
    await clickOnCanvas(page, 300, 300, { from: 'pageTopLeft' });
    await selectAllStructuresOnCanvas(page);
    await takeLeftToolbarScreenshot(page);
    await expect(LeftToolbar(page).createMonomerButton).toBeDisabled();
  });

  test('Case 8: Connection point enumeration is correct R-groups outside [3-8] range', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7821
     * Description: Connection point enumeration is correct R-groups outside [3-8] range
     * Scenario:
     * 1. Molecules mode (clear canvas)
     * 2. Load structure from clipboard
     * 3. Press Create monomer button
     */
    await pasteFromClipboardAndAddToCanvas(
      page,
      '[*:3]C%91CC%92CC%93CC%94CC%95CC%96%97.[*:9]%96.[*:10]%97.[*:8]%95.[*:7]%94.[*:6]%93.[*:5]%92.[*:4]%91 |$_R3;;;;;;;;;;;;_R9;_R10;_R8;_R7;_R6;_R5;_R4$|',
    );
    await clickOnCanvas(page, 300, 300, { from: 'pageTopLeft' });
    await selectAllStructuresOnCanvas(page);
    await expect(LeftToolbar(page).createMonomerButton).toBeEnabled();
    await LeftToolbar(page).createMonomer();
    await takeEditorScreenshot(page);
    await CreateMonomerDialog(page).discard();
  });

  test('Case 9: In Snake mode after Undo bonds not remain on canvas', async ({
    SnakeCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8202
     * Bug: https://github.com/epam/ketcher/issues/7786
     * Description: In Snake mode after Undo bonds not remain on canvas
     * Scenario:
     * 1. Open Ketcher in Macro mode.
     * 2. Place an RNA or DNA structure on the canvas.
     * 3. Create Antisense RNA or Antisense DNA from this structure.
     * 4. Observe that the original structure remains highlighted (selected).
     * 5. Click on an empty area of the canvas.
     */
    for (let i = 0; i < 4; i++) {
      await Library(page).clickMonomerAutochain(Preset.MOE_A_P);
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    for (let i = 0; i < 3; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});
