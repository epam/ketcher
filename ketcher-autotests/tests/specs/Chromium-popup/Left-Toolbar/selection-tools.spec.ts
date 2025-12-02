/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { test, expect } from '@fixtures';
import { Page } from '@playwright/test';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { SequenceSymbolOption } from '@tests/pages/constants/contextMenu/Constants';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { CalculateVariablesPanel } from '@tests/pages/macromolecules/CalculateVariablesPanel';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import {
  clickOnCanvas,
  keyboardPressOnCanvas,
  MacroFileType,
  openFileAndAddToCanvasAsNewProject,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  selectAndDeselectWithLasso,
  selectWithLasso,
  takeEditorScreenshot,
  takeLeftToolbarMacromoleculeScreenshot,
} from '@utils';
import { pageReload } from '@utils/common/helpers';
import {
  getMonomerLocator,
  getSymbolLocator,
} from '@utils/macromolecules/monomer';

let page: Page;

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
   * Version 3.8
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
   * Version 3.8
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
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
  await takeLeftToolbarMacromoleculeScreenshot(page);
  await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await takeLeftToolbarMacromoleculeScreenshot(page);
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
  await takeLeftToolbarMacromoleculeScreenshot(page);
  await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await takeLeftToolbarMacromoleculeScreenshot(page);
});

test('Case 3: Check that be able to draw an irregular selection area on the canvas by clicking and dragging the mouse for Lasso', async ({
  FlexCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Able to draw an irregular selection area on the canvas by clicking and dragging the mouse for Lasso.
   * Scenario:
   * 1. Go to Micro mode add Benzene ring
   * 2. Switch to Macromolecules mode
   * 3. Select Lasso Selection tool
   * 4. Draw an irregular selection area on the canvas and select the Benzene ring
   */
  await openFileAndAddToCanvasAsNewProject(page, 'KET/benzene-ring.ket');
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
  await selectWithLasso(page, 360, 260, [
    { x: 720, y: 260 },
    { x: 720, y: 480 },
    { x: 360, y: 480 },
    { x: 360, y: 260 },
    { x: 360, y: 260 },
  ]);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 4: Verify that the shortcut as in molecules mode Lasso Selection and Fragment Selection (Shift+Tab), are visible on hover in the sidebar', async () => {
  /*
   * Version 3.8
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
    await CommonLeftToolbar(page).areaSelectionTool(c.tool);
    const iconButton = page.getByTestId(c.testId);
    await expect(iconButton).toHaveAttribute('title', c.title);
    await iconButton.hover();
    await expect(c.title).toBeTruthy();
    await takeLeftToolbarMacromoleculeScreenshot(page);
  }
});

test('Case 5: Check that by repeatedly pressing the Shift+Tab shortcut will cycle through the rectangle, lasso and fragment selection tool', async () => {
  /*
   * Version 3.8
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
   * Version 3.8
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
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
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
   * Version 3.8
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
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
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
   * Version 3.8
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
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
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
   * Version 3.8
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
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
  await selectAndDeselectWithLasso(page, 320, 150, [
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
   * Version 3.8
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
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
  await selectAndDeselectWithLasso(page, 300, 110, [
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
   * Version 3.8
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
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
  await selectAndDeselectWithLasso(page, 300, 100, [
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
   * Version 3.8
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
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
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
  await CommonLeftToolbar(page).erase();
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
   * Version 3.8
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
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
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

  await CommonLeftToolbar(page).erase();
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
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: The deletion of selected structure by lasso and Undo ( Sequence mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Lasso Selection tool
   * 4. Select elements by lasso
   * 5. Press Delete button on keyboard
   * 6. Press Undo button
   * We have a bug https://github.com/epam/ketcher/issues/7923
   * After fix we should update snapshots and remove `await pageReload();`
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/micro-and-macro-structures.ket',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
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
  await pageReload(page);
});

test('Case 15: Check deletion of selected structure by lasso through right-click menu ( Flex mode )', async ({
  FlexCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: The deletion of selected structure by lasso through right-click menu ( Flex mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Lasso Selection tool
   * 4. Select elements by lasso
   * 5. Right click on the canvas and select "Delete" in the context menu
   * 6. Press Undo button
   * 7. Press Redo button
   * We have a bug https://github.com/epam/ketcher/issues/7923
   * After fix we should update snapshots and remove `await pageReload();`
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/micro-and-macro-structures.ket',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
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
  const anySymbol = getMonomerLocator(page, {}).first();
  await ContextMenu(page, anySymbol).open();
  await ContextMenu(page, anySymbol).click(SequenceSymbolOption.Delete);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await CommonTopLeftToolbar(page).undo();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await CommonTopLeftToolbar(page).redo();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 16: Check deletion of selected structure by lasso through right-click menu ( Snake mode )', async ({
  SnakeCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: The deletion of selected structure by lasso through right-click menu ( Snake mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Lasso Selection tool
   * 4. Select elements by lasso
   * 5. Right click on the canvas and select "Delete" in the context menu
   * 6. Press Undo button
   * 7. Press Redo button
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/micro-and-macro-structures.ket',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
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
  const anySymbol = getMonomerLocator(page, {}).first();
  await ContextMenu(page, anySymbol).open();
  await ContextMenu(page, anySymbol).click(SequenceSymbolOption.Delete);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await CommonTopLeftToolbar(page).undo();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await CommonTopLeftToolbar(page).redo();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 17: Check deletion of selected structure by lasso through right-click menu ( Sequence mode )', async ({
  SequenceCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: The deletion of selected structure by lasso through right-click menu ( Sequence mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Lasso Selection tool
   * 4. Select elements by lasso
   * 5. Right click on the canvas and select "Delete" in the context menu
   * 6. Press Undo button
   * 7. Press Redo button
   * We have a bug https://github.com/epam/ketcher/issues/7914 After fix we should update snapshots
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/micro-and-macro-structures.ket',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
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
  const anySymbol = getSymbolLocator(page, {}).first();
  await ContextMenu(page, anySymbol).open();
  await ContextMenu(page, anySymbol).click(SequenceSymbolOption.Delete);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await CommonTopLeftToolbar(page).undo();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await CommonTopLeftToolbar(page).redo();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 18: Check that Calculate properties works for selection by Lasso ( Flex mode )', async ({
  FlexCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Calculate properties works for selection by Lasso ( Flex mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Lasso Selection tool
   * 4. Select elements by lasso
   * 5. Press Calculate Properties button
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/micro-and-macro-structures.ket',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
  await selectWithLasso(page, 450, 250, [
    { x: 800, y: 250 },
    { x: 800, y: 500 },
    { x: 400, y: 500 },
    { x: 400, y: 250 },
    { x: 450, y: 250 },
  ]);
  await MacromoleculesTopToolbar(page).calculateProperties();
  expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
    'C10H14N5O7P',
  );
  expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
    '347.224',
  );
  await MacromoleculesTopToolbar(page).calculateProperties();
});

test('Case 19: Check that Calculate properties works for selection by Lasso ( Snake mode )', async ({
  SnakeCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Calculate properties works for selection by Lasso ( Snake mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Lasso Selection tool
   * 4. Select elements by lasso
   * 5. Press Calculate Properties button
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/micro-and-macro-structures.ket',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
  await selectWithLasso(page, 300, 110, [
    { x: 800, y: 110 },
    { x: 800, y: 540 },
    { x: 280, y: 540 },
    { x: 280, y: 110 },
    { x: 300, y: 110 },
  ]);
  await MacromoleculesTopToolbar(page).calculateProperties();
  expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
    'C10H14N5O7P',
  );
  expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
    '347.224',
  );
  await MacromoleculesTopToolbar(page).calculateProperties();
});

test('Case 20: Check that Calculate properties works for selection by Lasso ( Sequence mode )', async ({
  SequenceCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Calculate properties works for selection by Lasso ( Sequence mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Lasso Selection tool
   * 4. Select elements by lasso
   * 5. Press Calculate Properties button
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/micro-and-macro-structures.ket',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
  await selectWithLasso(page, 300, 110, [
    { x: 800, y: 110 },
    { x: 800, y: 540 },
    { x: 280, y: 540 },
    { x: 280, y: 110 },
    { x: 300, y: 110 },
  ]);
  await MacromoleculesTopToolbar(page).calculateProperties();
  expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
    'C10H14N5O7P',
  );
  expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
    '347.224',
  );
  await MacromoleculesTopToolbar(page).calculateProperties();
});

test('Case 21: Check that Create antisence strand (toolbar icon) works for selection by Lasso ( Flex mode )', async ({
  FlexCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Create antisence strand (toolbar icon) works for selection by Lasso ( Flex mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Lasso Selection tool
   * 4. Select elements by lasso
   * 5. Press Create antisense strand button on the top toolbar
   */
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{r(A)p.r(C)p.r(G)p}$$$$V2.0',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
  await selectWithLasso(page, 300, 110, [
    { x: 800, y: 110 },
    { x: 800, y: 540 },
    { x: 280, y: 540 },
    { x: 280, y: 110 },
    { x: 300, y: 110 },
  ]);
  await MacromoleculesTopToolbar(page).createAntisenseStrand();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 22: Check that Create antisence strand (toolbar icon) works for selection by Lasso ( Snake mode )', async ({
  SnakeCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Create antisence strand (toolbar icon) works for selection by Lasso ( Snake mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Lasso Selection tool
   * 4. Select elements by lasso
   * 5. Press Create antisense strand button on the top toolbar
   */
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{r(A)p.r(C)p.r(G)p}$$$$V2.0',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
  await selectWithLasso(page, 300, 110, [
    { x: 800, y: 110 },
    { x: 800, y: 540 },
    { x: 280, y: 540 },
    { x: 280, y: 110 },
    { x: 300, y: 110 },
  ]);
  await MacromoleculesTopToolbar(page).createAntisenseStrand();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 23: Check that Create antisence strand (toolbar icon) works for selection by Lasso ( Sequence mode )', async ({
  SequenceCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Create antisence strand (toolbar icon) works for selection by Lasso ( Sequence mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Lasso Selection tool
   * 4. Select elements by lasso
   * 5. Press Create antisense strand button on the top toolbar
   */
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{r(A)p.r(C)p.r(G)p}$$$$V2.0',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
  await selectWithLasso(page, 300, 110, [
    { x: 800, y: 110 },
    { x: 800, y: 540 },
    { x: 280, y: 540 },
    { x: 280, y: 110 },
    { x: 300, y: 110 },
  ]);
  await MacromoleculesTopToolbar(page).createAntisenseStrand();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 24: Check that Create antisence strand (right-click menu) works for selection by Lasso ( Flex mode )', async ({
  FlexCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Create antisence strand (right-click menu) works for selection by Lasso ( Flex mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Lasso Selection tool
   * 4. Select elements by lasso
   * 5. Right click on the canvas and select "Create Antisense Strand" in the context menu
   */
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{r(A)p.r(C)p.r(G)p}$$$$V2.0',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
  await selectWithLasso(page, 300, 110, [
    { x: 800, y: 110 },
    { x: 800, y: 540 },
    { x: 280, y: 540 },
    { x: 280, y: 110 },
    { x: 300, y: 110 },
  ]);
  const anySymbol = getMonomerLocator(page, {}).first();
  await ContextMenu(page, anySymbol).open();
  await ContextMenu(page, anySymbol).click(
    SequenceSymbolOption.CreateRNAAntisenseStrand,
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 25: Check that Create antisence strand (right-click menu) works for selection by Lasso ( Snake mode )', async ({
  SnakeCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Create antisence strand (right-click menu) works for selection by Lasso ( Snake mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Lasso Selection tool
   * 4. Select elements by lasso
   * 5. Right click on the canvas and select "Create Antisense Strand" in the context menu
   */
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{r(A)p.r(C)p.r(G)p}$$$$V2.0',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
  await selectWithLasso(page, 300, 110, [
    { x: 800, y: 110 },
    { x: 800, y: 540 },
    { x: 280, y: 540 },
    { x: 280, y: 110 },
    { x: 300, y: 110 },
  ]);
  const anySymbol = getMonomerLocator(page, {}).first();
  await ContextMenu(page, anySymbol).open();
  await ContextMenu(page, anySymbol).click(
    SequenceSymbolOption.CreateRNAAntisenseStrand,
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 26: Check that Create antisence strand (right-click menu) works for selection by Lasso ( Sequence mode )', async ({
  SequenceCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Create antisence strand (right-click menu) works for selection by Lasso ( Sequence mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Lasso Selection tool
   * 4. Select elements by lasso
   * 5. Right click on the canvas and select "Create Antisense Strand" in the context menu
   */
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{r(A)p.r(C)p.r(G)p}$$$$V2.0',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
  await selectWithLasso(page, 300, 110, [
    { x: 800, y: 110 },
    { x: 800, y: 540 },
    { x: 280, y: 540 },
    { x: 280, y: 110 },
    { x: 300, y: 110 },
  ]);
  const anySymbol = getSymbolLocator(page, {}).first();
  await ContextMenu(page, anySymbol).open();
  await ContextMenu(page, anySymbol).click(
    SequenceSymbolOption.CreateRNAAntisenseStrand,
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 27: Check that Lasso selection clearing for micro and macro structures by clicking empty area of canvas (Flex mode ) ', async ({
  FlexCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Lasso selection clearing for micro and macro structures by clicking empty area of canvas (Flex mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Lasso Selection tool
   * 4. Select elements by lasso
   * 5. Click on empty area of canvas
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/micro-and-macro-structures.ket',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
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
  await clickOnCanvas(page, 400, 500);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 28: Check that Lasso selection clearing for micro and macro structures by clicking empty area of canvas (Snake mode ) ', async ({
  SnakeCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Lasso selection clearing for micro and macro structures by clicking empty area of canvas (Snake mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Lasso Selection tool
   * 4. Select elements by lasso
   * 5. Click on empty area of canvas
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/micro-and-macro-structures.ket',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
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
  await clickOnCanvas(page, 400, 500);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 29: Check that Lasso selection clearing for micro and macro structures by clicking empty area of canvas (Sequence mode ) ', async ({
  SequenceCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Lasso selection clearing for micro and macro structures by clicking empty area of canvas (Sequence mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Lasso Selection tool
   * 4. Select elements by lasso
   * 5. Click on empty area of canvas
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/micro-and-macro-structures.ket',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
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
  await clickOnCanvas(page, 400, 500);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 30: Check that the user can click on any monomer in the structure to automatically select the entire fragment connected to that element (The term "fragments" refers to any collection to monomers, and small molecules connected via bonds. )(Flex mode)', async ({
  FlexCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: The user can click on any monomer in the structure to automatically select the entire
   * fragment connected to that element (The term "fragments" refers to any collection to monomers,
   * and small molecules connected via bonds. )(Flex mode).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Fragment Selection tool
   * 4. Click on any monomer in the structure
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/rna-connected-to-benzene-ring.ket',
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
  await getMonomerLocator(page, Sugar.R).first().click();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 31: Check that the user can click on any monomer in the structure to automatically select the entire fragment connected to that element (The term "fragments" refers to any collection to monomers, and small molecules connected via bonds. )(Snake mode)', async ({
  SnakeCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: The user can click on any monomer in the structure to automatically select the entire
   * fragment connected to that element (The term "fragments" refers to any collection to monomers,
   * and small molecules connected via bonds. )(Snake mode).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Fragment Selection tool
   * 4. Click on any monomer in the structure
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/rna-connected-to-benzene-ring.ket',
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
  await getMonomerLocator(page, Sugar.R).first().click();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 32: Check that the user can click on any monomer in the structure to automatically select the entire fragment connected to that element (The term "fragments" refers to any collection to monomers, and small molecules connected via bonds. )(Sequence mode)', async ({
  SequenceCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: The user can click on any monomer in the structure to automatically select the entire
   * fragment connected to that element (The term "fragments" refers to any collection to monomers,
   * and small molecules connected via bonds. )(Sequence mode).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Fragment Selection tool
   * 4. Click on any monomer in the structure
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/rna-connected-to-benzene-ring.ket',
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
  await getSymbolLocator(page, {
    symbolAlias: 'A',
    nodeIndexOverall: 0,
  }).click();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 33: Check deletion of selected structure by Fragment and Undo ( Flex mode )', async ({
  FlexCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: The deletion of selected structure by Fragment and Undo ( Flex mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Fragment Selection tool
   * 4. Select elements by Fragment
   * 5. Press Erase button
   * 6. Press Undo button
   * We have a bug https://github.com/epam/ketcher/issues/7923
   * After fix we should update snapshots and remove `await pageReload();`
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/rna-connected-to-benzene-ring.ket',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
  await getMonomerLocator(page, Sugar.R).click();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await CommonLeftToolbar(page).erase();

  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await CommonTopLeftToolbar(page).undo();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await pageReload(page);
});

test('Case 34: Check deletion of selected structure by Fragment and Undo ( Snake mode )', async ({
  SnakeCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: The deletion of selected structure by Fragment and Undo ( Snake mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Fragment Selection tool
   * 4. Select elements by Fragment
   * 5. Press Erase button
   * 6. Press Undo button
   * We have a bug https://github.com/epam/ketcher/issues/7923
   * After fix we should update snapshots and remove `await pageReload();`
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/rna-connected-to-benzene-ring.ket',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
  await getMonomerLocator(page, Sugar.R).click();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await CommonLeftToolbar(page).erase();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await CommonTopLeftToolbar(page).undo();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await pageReload(page);
});

test('Case 35: Check deletion of selected structure by Fragment and Undo ( Sequence mode )', async ({
  SequenceCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: The deletion of selected structure by Fragment and Undo ( Sequence mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Fragment Selection tool
   * 4. Select elements by Fragment
   * 5. Press Delete button on keyboard
   * 6. Press Undo button
   * We have a bug https://github.com/epam/ketcher/issues/7923
   * After fix we should update snapshots and remove `await pageReload();`
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/rna-connected-to-benzene-ring.ket',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
  await getSymbolLocator(page, {
    symbolAlias: 'A',
    nodeIndexOverall: 0,
  }).click();
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
  await pageReload(page);
});

test('Case 36: Check deletion of selected structure by Fragment through right-click menu ( Flex mode )', async ({
  FlexCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: The deletion of selected structure by Fragment through right-click menu ( Flex mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Fragment Selection tool
   * 4. Select elements by Fragment
   * 5. Right click on the canvas and select "Delete" in the context menu
   * 6. Press Undo button
   * 7. Press Redo button
   * We have a bug https://github.com/epam/ketcher/issues/7923
   * After fix we should update snapshots and remove `await pageReload();`
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/rna-connected-to-benzene-ring.ket',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
  await getMonomerLocator(page, Sugar.R).click();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  const anySymbol = getMonomerLocator(page, {}).first();
  await ContextMenu(page, anySymbol).open();
  await ContextMenu(page, anySymbol).click(SequenceSymbolOption.Delete);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await CommonTopLeftToolbar(page).undo();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await CommonTopLeftToolbar(page).redo();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await pageReload(page);
});

test('Case 37: Check deletion of selected structure by Fragment through right-click menu ( Snake mode )', async ({
  SnakeCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: The deletion of selected structure by Fragment through right-click menu ( Snake mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Fragment Selection tool
   * 4. Select elements by Fragment
   * 5. Right click on the canvas and select "Delete" in the context menu
   * 6. Press Undo button
   * 7. Press Redo button
   * We have a bug https://github.com/epam/ketcher/issues/7923
   * After fix we should update snapshots and remove `await pageReload();`
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/rna-connected-to-benzene-ring.ket',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
  await getMonomerLocator(page, Sugar.R).click();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  const anySymbol = getMonomerLocator(page, {}).first();
  await ContextMenu(page, anySymbol).open();
  await ContextMenu(page, anySymbol).click(SequenceSymbolOption.Delete);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await CommonTopLeftToolbar(page).undo();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await CommonTopLeftToolbar(page).redo();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await pageReload(page);
});

test('Case 38: Check deletion of selected structure by Fragment through right-click menu ( Sequence mode )', async ({
  SequenceCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: The deletion of selected structure by Fragment through right-click menu ( Sequence mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Fragment Selection tool
   * 4. Select elements by Fragment
   * 5. Right click on the canvas and select "Delete" in the context menu
   * 6. Press Undo button
   * 7. Press Redo button
   * We have a bug https://github.com/epam/ketcher/issues/7923
   * After fix we should update snapshots and remove `await pageReload();`
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/rna-connected-to-benzene-ring.ket',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
  await getSymbolLocator(page, {
    symbolAlias: 'A',
    nodeIndexOverall: 0,
  }).click();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  const anySymbol = getSymbolLocator(page, {}).first();
  await ContextMenu(page, anySymbol).open();
  await ContextMenu(page, anySymbol).click(SequenceSymbolOption.Delete);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await CommonTopLeftToolbar(page).undo();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await CommonTopLeftToolbar(page).redo();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await pageReload(page);
});

test('Case 39: Check that Calculate properties works for selection by Fragment ( Flex mode )', async ({
  FlexCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Calculate properties works for selection by Fragment ( Flex mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Fragment Selection tool
   * 4. Select elements by Fragment
   * 5. Press Calculate Properties button
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/rna-connected-to-benzene-ring.ket',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
  await getMonomerLocator(page, Sugar.R).click();
  await MacromoleculesTopToolbar(page).calculateProperties();
  expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
    'C16H18N5O6P',
  );
  expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
    '407.323',
  );
  await MacromoleculesTopToolbar(page).calculateProperties();
});

test('Case 40: Check that Calculate properties works for selection by Fragment ( Snake mode )', async ({
  SnakeCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Calculate properties works for selection by Fragment ( Snake mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Fragment Selection tool
   * 4. Select elements by Fragment
   * 5. Press Calculate Properties button
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/rna-connected-to-benzene-ring.ket',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
  await getMonomerLocator(page, Sugar.R).click();
  await MacromoleculesTopToolbar(page).calculateProperties();
  expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
    'C16H18N5O6P',
  );
  expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
    '407.323',
  );
  await MacromoleculesTopToolbar(page).calculateProperties();
});

test('Case 41: Check that Calculate properties works for selection by Fragment ( Sequence mode )', async ({
  SequenceCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Calculate properties works for selection by Fragment ( Sequence mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Fragment Selection tool
   * 4. Select elements by Fragment
   * 5. Press Calculate Properties button
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/rna-connected-to-benzene-ring.ket',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
  await getSymbolLocator(page, {
    symbolAlias: 'A',
    nodeIndexOverall: 0,
  }).click();
  await MacromoleculesTopToolbar(page).calculateProperties();
  expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
    'C16H18N5O6P',
  );
  expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
    '407.323',
  );
  await MacromoleculesTopToolbar(page).calculateProperties();
});

test('Case 42: Check that Create antisence strand (toolbar icon) works for selection by Fragment ( Flex mode )', async ({
  FlexCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Create antisence strand (toolbar icon) works for selection by Fragment ( Flex mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Fragment Selection tool
   * 4. Select elements by Fragment
   * 5. Press Create antisense strand button on the top toolbar
   */
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{r(A)p.r(C)p.r(G)p}$$$$V2.0',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
  await getMonomerLocator(page, Sugar.R).first().click();
  await MacromoleculesTopToolbar(page).createAntisenseStrand();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 43: Check that Create antisence strand (toolbar icon) works for selection by Fragment ( Snake mode )', async ({
  SnakeCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Create antisence strand (toolbar icon) works for selection by Fragment ( Snake mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Fragment Selection tool
   * 4. Select elements by Fragment
   * 5. Press Create antisense strand button on the top toolbar
   */
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{r(A)p.r(C)p.r(G)p}$$$$V2.0',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
  await getMonomerLocator(page, Sugar.R).first().click();
  await MacromoleculesTopToolbar(page).createAntisenseStrand();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 44: Check that Create antisence strand (toolbar icon) works for selection by Fragment ( Sequence mode )', async ({
  SequenceCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Create antisence strand (toolbar icon) works for selection by Fragment ( Sequence mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Fragment Selection tool
   * 4. Select elements by Fragment
   * 5. Press Create antisense strand button on the top toolbar
   */
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{r(A)p.r(C)p.r(G)p}$$$$V2.0',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
  await getSymbolLocator(page, {
    symbolAlias: 'A',
    nodeIndexOverall: 0,
  }).click();
  await MacromoleculesTopToolbar(page).createAntisenseStrand();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 45: Check that Create antisence strand (right-click menu) works for selection by Fragment ( Flex mode )', async ({
  FlexCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Create antisence strand (right-click menu) works for selection by Fragment ( Flex mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Fragment Selection tool
   * 4. Select elements by Fragment
   * 5. Right click on the canvas and select "Create Antisense Strand" in the context menu
   */
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{r(A)p.r(C)p.r(G)p}$$$$V2.0',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
  await getMonomerLocator(page, Sugar.R).first().click();
  const anySymbol = getMonomerLocator(page, {}).first();
  await ContextMenu(page, anySymbol).open();
  await ContextMenu(page, anySymbol).click(
    SequenceSymbolOption.CreateRNAAntisenseStrand,
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 46: Check that Create antisence strand (right-click menu) works for selection by Fragment ( Snake mode )', async ({
  SnakeCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Create antisence strand (right-click menu) works for selection by Fragment ( Snake mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Fragment Selection tool
   * 4. Select elements by Fragment
   * 5. Right click on the canvas and select "Create Antisense Strand" in the context menu
   */
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{r(A)p.r(C)p.r(G)p}$$$$V2.0',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
  await getMonomerLocator(page, Sugar.R).first().click();
  const anySymbol = getMonomerLocator(page, {}).first();
  await ContextMenu(page, anySymbol).open();
  await ContextMenu(page, anySymbol).click(
    SequenceSymbolOption.CreateRNAAntisenseStrand,
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 47: Check that Create antisence strand (right-click menu) works for selection by Fragment ( Sequence mode )', async ({
  SequenceCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Create antisence strand (right-click menu) works for selection by Fragment ( Sequence mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Fragment Selection tool
   * 4. Select elements by Fragment
   * 5. Right click on the canvas and select "Create Antisense Strand" in the context menu
   */
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{r(A)p.r(C)p.r(G)p}$$$$V2.0',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
  await getSymbolLocator(page, {
    symbolAlias: 'A',
    nodeIndexOverall: 0,
  }).click();
  const anySymbol = getSymbolLocator(page, {}).first();
  await ContextMenu(page, anySymbol).open();
  await ContextMenu(page, anySymbol).click(
    SequenceSymbolOption.CreateRNAAntisenseStrand,
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 48: Check that Fragment selection clearing for micro and macro structures by clicking empty area of canvas (Flex mode ) ', async ({
  FlexCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Fragment selection clearing for micro and macro structures by clicking empty area of canvas (Flex mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Fragment Selection tool
   * 4. Select elements by Fragment
   * 5. Click on empty area of canvas
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/rna-connected-to-benzene-ring.ket',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
  await getMonomerLocator(page, Sugar.R).first().click();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await clickOnCanvas(page, 400, 500);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 49: Check that Fragment selection clearing for micro and macro structures by clicking empty area of canvas (Snake mode ) ', async ({
  SnakeCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Fragment selection clearing for micro and macro structures by clicking empty area of canvas (Snake mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Fragment Selection tool
   * 4. Select elements by Fragment
   * 5. Click on empty area of canvas
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/rna-connected-to-benzene-ring.ket',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
  await getMonomerLocator(page, Sugar.R).first().click();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await clickOnCanvas(page, 400, 500);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Case 50: Check that Fragment selection clearing for micro and macro structures by clicking empty area of canvas (Sequence mode ) ', async ({
  SequenceCanvas: _,
}) => {
  /*
   * Version 3.8
   * Test case: https://github.com/epam/ketcher/issues/6358
   * Description: Fragment selection clearing for micro and macro structures by clicking empty area of canvas (Sequence mode ).
   * Scenario:
   * 1. Go to Macro mode
   * 2. Open file with micro and macro elements
   * 3. Select Fragment Selection tool
   * 4. Select elements by Fragment
   * 5. Click on empty area of canvas
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/rna-connected-to-benzene-ring.ket',
  );
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
  await getSymbolLocator(page, {
    symbolAlias: 'A',
    nodeIndexOverall: 0,
  }).click();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await clickOnCanvas(page, 400, 500);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});
