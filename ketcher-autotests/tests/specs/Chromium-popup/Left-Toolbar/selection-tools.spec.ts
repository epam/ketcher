/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { test, expect } from '@fixtures';
import { Page } from '@playwright/test';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { drawBenzeneRing } from '@tests/pages/molecules/BottomToolbar';
import {
  keyboardPressOnCanvas,
  openFileAndAddToCanvasAsNewProject,
  selectTAndDeselectWithLasso,
  selectWithLasso,
  takeEditorScreenshot,
  takeLeftToolbarMacromoleculeScreenshot,
} from '@utils';

let page: Page;

test.describe('Lasso Selection/Fragment Selection tool in macromolecules mode', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterEach(async () => {
    await CommonTopLeftToolbar(page).clearCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: Check that the tools default shape is a "Rectangle", when no tool is selected', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6358
     * Description: The tools default shape is a "Rectangle", when no tool is selected
     * Scenario:
     * 1. Go to Micro mode
     * 2. Switch to Macromolecules mode
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeLeftToolbarMacromoleculeScreenshot(page);
  });

  test('Case 2: Check that last selection saves and the icon display the last selected tool', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6358
     * Description: The last selection saves and the icon display the last selected tool,
     * which will be activated when clicked, similar to the behavior in molecules mode.
     * Scenario:
     * 1. Go to Micro mode
     * 2. Switch to Macromolecules mode
     * 3. Select Lasso Selection tool
     * 4. Switch to Micro mode
     * 5. Switch to Macromolecules mode
     * 6. Check that Lasso Selection tool is selected
     * 7. Select Fragment Selection tool
     * 8. Switch to Micro mode
     * 9. Switch to Macromolecules mode
     * 10. Check that Fragment Selection tool is selected
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await takeLeftToolbarMacromoleculeScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeLeftToolbarMacromoleculeScreenshot(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
    await takeLeftToolbarMacromoleculeScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeLeftToolbarMacromoleculeScreenshot(page);
  });

  test('Case 3: Check that be able to draw an irregular selection area on the canvas by clicking and dragging the mouse for Lasso', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6358
     * Description: Able to draw an irregular selection area on the canvas by clicking and dragging the mouse for Lasso.
     * Scenario:
     * 1. Go to Micro mode add Benzene ring
     * 2. Switch to Macromolecules mode
     * 3. Select Lasso Selection tool
     * 4. Draw an irregular selection area on the canvas and select the Benzene ring
     */
    await drawBenzeneRing(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await selectWithLasso(page, 570, 290, [
      { x: 710, y: 290 },
      { x: 740, y: 350 },
      { x: 670, y: 450 },
      { x: 555, y: 405 },
      { x: 570, y: 290 },
    ]);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 4: Verify that the shortcut as in molecules mode Lasso Selection and Fragment Selection (Shift+Tab), are visible on hover in the sidebar', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6358
     * Description: The shortcut as in molecules mode Lasso Selection, Fragment Selection (Shift+Tab), are visible on hover in the sidebar.
     * Scenario:
     * 1. Go to Micro mode
     * 2. Switch to Macromolecules mode
     * 3. Hover over the Selection tool icon and check the tooltip for the shortcut
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    const cases = [
      {
        tool: SelectionToolType.Lasso,
        testId: 'select-lasso',
        title: 'Lasso selection (Shift+Tab)',
      },
      {
        tool: SelectionToolType.Fragment,
        testId: 'select-fragment',
        title: 'Fragment selection (Shift+Tab)',
      },
    ];
    for (const c of cases) {
      await CommonLeftToolbar(page).selectAreaSelectionTool(c.tool);
      const iconButton = page.getByTestId(c.testId);
      await expect(iconButton).toHaveAttribute('title', c.title);
      await iconButton.hover();
      await expect(c.title).toBeTruthy();
      await takeLeftToolbarMacromoleculeScreenshot(page);
    }
  });

  test('Case 5: Check that by repeatedly pressing the Shift+Tab shortcut will cycle through the rectangle, lasso and fragment selection tool', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6358
     * Description: By repeatedly pressing the Shift+Tab shortcut will cycle through the rectangle, lasso and fragment selection tool.
     * Scenario:
     * 1. Go to Micro mode
     * 2. Switch to Macromolecules mode
     * 3. Press Shift+Tab to select Selection tool
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Shift+Tab');
      await takeLeftToolbarMacromoleculeScreenshot(page);
    }
  });

  test('Case 6: Check that elements (monomers or bonds ) associated with the lasso automatically highlighted ( Flex mode )', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6358
     * Description: The elements (monomers or bonds ) associated with the lasso automatically highlighted ( Flex mode ).
     * Scenario:
     * 1. Go to Macro mode
     * 2. Open file with micro and macro elements
     * 3. Select Lasso Selection tool
     * 4. Select elements by lasso
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/micro-and-macro-structures.ket',
    );
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await selectWithLasso(page, 450, 250, [
      { x: 800, y: 250 },
      { x: 800, y: 500 },
      { x: 400, y: 500 },
      { x: 400, y: 250 },
      { x: 450, y: 250 },
    ]);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 7: Check that elements (monomers or bonds ) associated with the lasso automatically highlighted ( Snake mode )', async ({
    SnakeCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6358
     * Description: The elements (monomers or bonds ) associated with the lasso automatically highlighted ( Snake mode ).
     * Scenario:
     * 1. Go to Macro mode
     * 2. Open file with micro and macro elements
     * 3. Select Lasso Selection tool
     * 4. Select elements by lasso
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/micro-and-macro-structures.ket',
    );
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await selectWithLasso(page, 300, 110, [
      { x: 800, y: 110 },
      { x: 800, y: 540 },
      { x: 280, y: 540 },
      { x: 280, y: 110 },
      { x: 300, y: 110 },
    ]);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 8: Check that elements (monomers or bonds ) associated with the lasso automatically highlighted ( Sequence mode )', async ({
    SequenceCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6358
     * Description: The elements (monomers or bonds ) associated with the lasso automatically highlighted ( Sequence mode ).
     * Scenario:
     * 1. Go to Macro mode
     * 2. Open file with micro and macro elements
     * 3. Select Lasso Selection tool
     * 4. Select elements by lasso
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/micro-and-macro-structures.ket',
    );
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await selectWithLasso(page, 300, 110, [
      { x: 800, y: 110 },
      { x: 800, y: 540 },
      { x: 280, y: 540 },
      { x: 280, y: 110 },
      { x: 300, y: 110 },
    ]);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 9: Check that the lasso selection tool select a molecule during its initial pass and then deselect it during the subsequent pass ( Flex mode )', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6358
     * Description: The lasso selection tool select a molecule during its initial pass and then deselect it during the subsequent pass ( Flex mode ).
     * Scenario:
     * 1. Go to Macro mode
     * 2. Open file with micro and macro elements
     * 3. Select Lasso Selection tool
     * 4. Select elements by lasso
     * 5. Select elements by lasso second time
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/micro-and-macro-structures.ket',
    );
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await selectTAndDeselectWithLasso(page, 320, 150, [
      { x: 780, y: 150 },
      { x: 780, y: 520 },
      { x: 300, y: 520 },
      { x: 300, y: 150 },
      { x: 320, y: 150 },
    ]);
  });

  test('Case 10: Check that the lasso selection tool select a molecule during its initial pass and then deselect it during the subsequent pass ( Snake mode )', async ({
    SnakeCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6358
     * Description: The lasso selection tool select a molecule during its initial pass and then deselect it during the subsequent pass ( Snake mode ).
     * Scenario:
     * 1. Go to Macro mode
     * 2. Open file with micro and macro elements
     * 3. Select Lasso Selection tool
     * 4. Select elements by lasso
     * 5. Select elements by lasso second time
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/micro-and-macro-structures.ket',
    );
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await selectTAndDeselectWithLasso(page, 300, 110, [
      { x: 780, y: 150 },
      { x: 780, y: 520 },
      { x: 300, y: 520 },
      { x: 300, y: 150 },
      { x: 320, y: 150 },
    ]);
  });

  test('Case 11: Check that the lasso selection tool select a molecule during its initial pass and then deselect it during the subsequent pass ( Sequence mode )', async ({
    SequenceCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6358
     * Description: The lasso selection tool select a molecule during its initial pass and then deselect it during the subsequent pass ( Sequence mode ).
     * Scenario:
     * 1. Go to Macro mode
     * 2. Open file with micro and macro elements
     * 3. Select Lasso Selection tool
     * 4. Select elements by lasso
     * 5. Select elements by lasso second time
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/micro-and-macro-structures.ket',
    );
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await selectTAndDeselectWithLasso(page, 300, 100, [
      { x: 780, y: 150 },
      { x: 780, y: 520 },
      { x: 300, y: 520 },
      { x: 300, y: 150 },
      { x: 320, y: 150 },
    ]);
  });

  test('Case 12: Check deletion of selected structure by lasso and Undo ( Flex mode )', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6358
     * Description: The deletion of selected structure by lasso and Undo ( Flex mode ).
     * Scenario:
     * 1. Go to Macro mode
     * 2. Open file with micro and macro elements
     * 3. Select Lasso Selection tool
     * 4. Select elements by lasso
     * 5. Press Erase button
     * 6. Press Undo button
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/micro-and-macro-structures.ket',
    );
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await selectWithLasso(page, 450, 250, [
      { x: 800, y: 250 },
      { x: 800, y: 500 },
      { x: 400, y: 500 },
      { x: 400, y: 250 },
      { x: 450, y: 250 },
    ]);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonLeftToolbar(page).selectEraseTool();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 13: Check deletion of selected structure by lasso and Undo ( Snake mode )', async ({
    SnakeCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6358
     * Description: The deletion of selected structure by lasso and Undo ( Snake mode ).
     * Scenario:
     * 1. Go to Macro mode
     * 2. Open file with micro and macro elements
     * 3. Select Lasso Selection tool
     * 4. Select elements by lasso
     * 5. Press Erase button
     * 6. Press Undo button
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/micro-and-macro-structures.ket',
    );
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await selectWithLasso(page, 300, 110, [
      { x: 800, y: 110 },
      { x: 800, y: 540 },
      { x: 280, y: 540 },
      { x: 280, y: 110 },
      { x: 300, y: 110 },
    ]);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonLeftToolbar(page).selectEraseTool();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 14: Check deletion of selected structure by lasso and Undo ( Sequence mode )', async ({
    SequenceCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6358
     * Description: The deletion of selected structure by lasso and Undo ( Sequence mode ).
     * Scenario:
     * 1. Go to Macro mode
     * 2. Open file with micro and macro elements
     * 3. Select Lasso Selection tool
     * 4. Select elements by lasso
     * 5. Press Delete button on keyboard
     * 6. Press Undo button
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/micro-and-macro-structures.ket',
    );
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await selectWithLasso(page, 300, 110, [
      { x: 800, y: 110 },
      { x: 800, y: 540 },
      { x: 280, y: 540 },
      { x: 280, y: 110 },
      { x: 300, y: 110 },
    ]);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await keyboardPressOnCanvas(page, 'Delete');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});
