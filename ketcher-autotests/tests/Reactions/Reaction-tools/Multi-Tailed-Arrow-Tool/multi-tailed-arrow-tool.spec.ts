/* eslint-disable no-magic-numbers */
import { test, expect } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  copyAndPaste,
  cutAndPaste,
  openDropdown,
  openFile,
  openFileAndAddToCanvas,
  openFileAndAddToCanvasAsNewProject,
  openPasteFromClipboard,
  pressButton,
  readFileContents,
  receiveFileComparisonData,
  resetCurrentTool,
  saveToFile,
  screenshotBetweenUndoRedo,
  selectClearCanvasTool,
  selectDropdownTool,
  selectEraseTool,
  selectPartOfMolecules,
  selectRectangleSelectionTool,
  selectTopPanelButton,
  setZoomInputValue,
  takeEditorScreenshot,
  takeLeftToolbarScreenshot,
  TopPanelButton,
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
  waitForLoad,
  waitForPageInit,
  waitForRender,
} from '@utils';
import { clickOnFileFormatDropdown, getKet } from '@utils/formats';

test.describe('Multi-Tailed Arrow Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Verify that default Multi-Tailed Arrow with two tails can be saved to .ket file with correct coordinates of spine, tails and head', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5104
     * Description: Default Multi-Tailed Arrow with two tails can be saved to .ket file with correct coordinates of spine, tails and head
     * and after that loaded from .ket file and added to selected place on Canvas with the same parameters.
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);

    const expectedFile = await getKet(page);
    await saveToFile('KET/multi-tailed-arrow-to-compare.ket', expectedFile);

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/multi-tailed-arrow-to-compare.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-to-compare.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that 3 different Multi-Tailed Arrows can be saved together to .ket file with correct coordinates of spines, tails and heads', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5104
     * Description: Three different Multi-Tailed Arrows can be saved together to .ket file with correct coordinates of spines, tails and heads
     * and after that loaded from .ket file and added to selected place on Canvas with the same parameters and positions.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/three-different-multi-tail-arrows.ket',
      page,
    );

    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/three-different-multi-tail-arrows-expected.ket',
      expectedFile,
    );

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/three-different-multi-tail-arrows-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'KET/three-different-multi-tail-arrows-expected.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that 3 different Multi-Tailed Arrows with different elements can be saved together to .ket file with the correct coordinates of spines, tails and heads', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5104
     * Description: Three different Multi-Tailed Arrows with different elements can be saved together to .ket file with the correct coordinates of spines,
     * tails and heads, after that loaded from .ket file and added to selected place on Canvas with the same parameters and positions.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/three-different-multi-tail-arrows-with-elements.ket',
      page,
    );

    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/three-different-multi-tail-arrows-with-elements-expected.ket',
      expectedFile,
    );

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/three-different-multi-tail-arrows-with-elements-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'KET/three-different-multi-tail-arrows-with-elements-expected.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that Multi-Tailed Arrows with different elements together can be added to selected place on Canvas from 2 different .ket files', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5104
     * Description: Verify that Multi-Tailed Arrows with different elements together can be added to selected place on Canvas from 2 different .ket files
     * and they are on the correct positions to each other and they can be saved together to .ket file with correct parameters.
     */
    await openFileAndAddToCanvas(
      'KET/three-different-multi-tail-arrows-with-elements.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('KET/three-different-multi-tail-arrows.ket', page);
    await waitForLoad(page, async () => {
      await pressButton(page, 'Add to Canvas');
    });
    await page.mouse.click(200, 300);

    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/multi-tailed-arrows-from-two-different-files-expected.ket',
      expectedFile,
    );

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/multi-tailed-arrows-from-two-different-files-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrows-from-two-different-files-expected.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that 3 different Multi-Tailed Arrows are copied from .ket format and added to selected place on Canvas using "PASTE FROM CLIPBOARD - Add to Canvas"', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5104
     * Description: Three different Multi-Tailed Arrows are copied from .ket format and added to selected place on Canvas
     * with correct positions and parameters using "PASTE FROM CLIPBOARD - Add to Canvas"
     */
    const fileContent = await readFileContents(
      'tests/test-data/KET/three-different-multi-tail-arrows.ket',
    );
    await openPasteFromClipboard(page, fileContent);
    await pressButton(page, 'Add to Canvas');
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that 3 different Multi-Tailed Arrows are copied from .ket format and added to the center of Canvas using "PASTE FROM CLIPBOARD - Open as New Project"', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5104
     * Description: Three different Multi-Tailed Arrows are copied from .ket format and added to the center of Canvas using "PASTE FROM CLIPBOARD - Open as New Project"
     */
    const fileContent = await readFileContents(
      'tests/test-data/KET/three-different-multi-tail-arrows.ket',
    );
    await openPasteFromClipboard(page, fileContent);
    await pressButton(page, 'Open as New Project');
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that 3 different Multi-Tailed Arrows are copied from .ket format and added from clipboard directly to selected place on Canvas', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5104
     * Description: Three different Multi-Tailed Arrows are copied from .ket format and added from clipboard directly to selected place on Canvas
     * with correct positions and sizes of spines, tails and heads
     */
    const fileContent = await readFileContents(
      'tests/test-data/KET/three-different-multi-tail-arrows.ket',
    );
    await openPasteFromClipboard(page, fileContent);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    await pressButton(page, 'Cancel');
    await page.keyboard.press('Control+v');
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that Multi-Tailed Arrow is correctly displayed in .ket format in Open Structure Preview', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5104
     * Description: Multi-Tailed Arrow is correctly displayed in .ket format in Open Structure Preview.
     */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('KET/multi-tailed-arrow-to-compare.ket', page);
    await takeEditorScreenshot(page);
  });

  test('Verify that Multi-Tailed Arrow is correctly displayed in .ket format in Save Structure Preview', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5104
     * Description: Multi-Tailed Arrow is correctly displayed in .ket format in Save Structure Preview.
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await clickOnFileFormatDropdown(page);
    await page.getByTestId('Ket Format-option').click();
    await takeEditorScreenshot(page);
  });

  test('Open from KET 3 different Multi-Tailed Arrows, add default Multi-Tailed Arrow by Tool, switch to Macro', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5104
     * Description: Open from KET 3 different Multi-Tailed Arrows, add default Multi-Tailed Arrow by Tool, switch to Macro,
     * verify that Arrows are not presented on the Canvas after switching to Macro mode, Clear Canvas, switch back to Micro mode,
     * verify that arrows are presented after returning to Micro mode.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/three-different-multi-tail-arrows.ket',
      page,
    );
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page);
    await takeEditorScreenshot(page);
    await selectClearCanvasTool(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test('Switch to Macro mode, open from KET 3 different Multi-Tailed Arrows, verify that arrows are not presented in Macro mode,  Clear Canvas, switch back to Micro mode', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5104
     * Description: Switch to Macro mode, open from KET 3 different Multi-Tailed Arrows, verify that arrows aren't presented in Macro mode,
     * Clear Canvas, switch back to Micro mode, verify that arrows are presented in Micro mode.
     */
    await turnOnMacromoleculesEditor(page);
    await openFileAndAddToCanvasAsNewProject(
      'KET/three-different-multi-tail-arrows.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await selectClearCanvasTool(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that 3 different Multi-Tailed Arrows can be zoomed in/out (20, 400, 100) after adding to Canvas from .ket file', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5104
     * Description: Three different Multi-Tailed Arrows can be zoomed in/out (20, 400, 100) after adding to Canvas from .ket file
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/three-different-multi-tail-arrows.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await setZoomInputValue(page, '20');
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
    await setZoomInputValue(page, '400');
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
    await setZoomInputValue(page, '100');
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that action of adding to Canvas of Multi-Tailed Arrows from .ket file can be Undo/Redo', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5104
     * Description: Action of adding to Canvas of Multi-Tailed Arrows from .ket file can be Undo/Redo.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/three-different-multi-tail-arrows.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Click on Arrows tool on left toolbar and verify that "Multi-Tailed Arrow Tool" icon is the latest in row', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Click on Arrows tool on left toolbar and verify that "Multi-Tailed Arrow Tool" icon is the latest in row, it's clickable and
     * after clicking it displays with filling, after clicking on another tool or esc, the icon selection with filling is removed and "Arrow Open Angle Tool"
     * is displayed without filling.
     */
    await openDropdown(page, 'reaction-arrow-open-angle');
    await takeEditorScreenshot(page);
    await page.getByTestId('reaction-arrow-multitail').click();
    await takeLeftToolbarScreenshot(page);
    await selectRectangleSelectionTool(page);
    await takeLeftToolbarScreenshot(page);
  });

  test('Verify that Multi-Tailed Arrows can be zoomed in/out (20, 400, 100) after adding to Canvas using zoom buttons', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Multi-Tailed Arrows can be zoomed in/out (20, 400, 100) after adding to Canvas using zoom buttons
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/three-different-multi-tail-arrows.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await page.getByTestId('zoom-input').click();
    for (let i = 0; i < 8; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-out').click();
      });
    }
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await page.getByTestId('zoom-input').click();
    for (let i = 0; i < 19; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-in').click();
      });
    }
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await page.getByTestId('zoom-input').click();
    await waitForRender(page, async () => {
      await page.getByTestId('zoom-default').click();
    });
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that action of adding to Canvas Multi-Tailed Arrows using "Multi-Tailed Arrow Tool" button can be Undo/Redo', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Action of adding to Canvas Multi-Tailed Arrows using "Multi-Tailed Arrow Tool" button can be Undo/Redo.
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that loaded from .ket file and added to selected place on Canvas 3 different Multi-Tailed Arrows can be deleted using "Clear Canvas" (or Ctrl+Delete)', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Loaded from .ket file and added to selected place on Canvas 3 different Multi-Tailed Arrows can be deleted using "Clear Canvas" (or Ctrl+Delete)
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/three-different-multi-tail-arrows.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await selectClearCanvasTool(page);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+Delete');
    await takeEditorScreenshot(page);
  });

  test('Verify that adding to selected place on Canvas Multi-Tailed Arrows using "Multi-Tailed Arrow Tool" can be deleted using "Clear Canvas" (or Ctrl+Delete)', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Adding to selected place on Canvas Multi-Tailed Arrows using "Multi-Tailed Arrow Tool" can be deleted using "Clear Canvas" (or Ctrl+Delete)
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await selectClearCanvasTool(page);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+Delete');
    await takeEditorScreenshot(page);
  });

  test('Verify that loaded from .ket file and added to selected place on Canvas 3 different Multi-Tailed Arrows can be deleted using "Erase"', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Loaded from .ket file and added to selected place on Canvas 3 different Multi-Tailed Arrows
     * can be deleted using "Erase" (or Delete, Backspace buttons)
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/three-different-multi-tail-arrows.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+a');
    await selectEraseTool(page);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Backspace');
    await takeEditorScreenshot(page);
  });

  test('Verify that adding to selected place on Canvas Multi-Tailed Arrows using "Multi-Tailed Arrow Tool" can be deleted using "Erase" (or Delete, Backspace buttons)', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Adding to selected place on Canvas Multi-Tailed Arrows using "Multi-Tailed Arrow Tool"
     * can be deleted using "Erase" (or Delete, Backspace buttons)
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+a');
    await selectEraseTool(page);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Backspace');
    await takeEditorScreenshot(page);
  });

  test('Verify that Copy-Paste (Ctrl+C, Ctrl+V) actions can be performed for 3 different Multi-Tailed Arrows loaded from KET when other elements are on Canvas ', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Copy-Paste (Ctrl+C, Ctrl+V) actions can be performed for 3 different Multi-Tailed Arrows
     * loaded from KET when other elements are on Canvas
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/three-multi-tail-arrows-and-rings.ket',
      page,
    );
    await selectPartOfMolecules(page);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+c');
    await page.keyboard.press('Control+v');
    await page.mouse.click(300, 350);
    await takeEditorScreenshot(page);
  });

  test('Verify that Cut-Paste (Ctrl+X, Ctrl+V) actions can be performed for 3 different Multi-Tailed Arrows loaded from KET when other elements are on Canvas ', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Cut-Paste (Ctrl+X, Ctrl+V) actions can be performed for 3 different Multi-Tailed Arrows
     * loaded from KET when other elements are on Canvas
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/three-multi-tail-arrows-and-rings.ket',
      page,
    );
    await selectPartOfMolecules(page);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+x');
    await page.keyboard.press('Control+v');
    await page.mouse.click(300, 350);
    await takeEditorScreenshot(page);
  });

  test('Verify that Copy-Paste (Ctrl+C, Ctrl+V) actions can be performed for elements when Multi-Tailed Arrows loaded from KET are on Canvas', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Copy-Paste (Ctrl+C, Ctrl+V) actions can be performed for elements when Multi-Tailed Arrows loaded from KET are on Canvas
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/rings-with-multi-tailed-arrows.ket',
      page,
    );
    await selectPartOfMolecules(page);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+c');
    await page.keyboard.press('Control+v');
    await page.mouse.click(300, 350);
    await takeEditorScreenshot(page);
  });

  test('Verify that Cut-Paste (Ctrl+X, Ctrl+V) actions can be performed for elements when Multi-Tailed Arrows loaded from KET are on Canvas', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Cut-Paste (Ctrl+X, Ctrl+V) actions can be performed for elements when Multi-Tailed Arrows loaded from KET are on Canvas
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/rings-with-multi-tailed-arrows.ket',
      page,
    );
    await selectPartOfMolecules(page);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+x');
    await page.keyboard.press('Control+v');
    await page.mouse.click(300, 350);
    await takeEditorScreenshot(page);
  });

  test('Verify that Copy-Paste (Ctrl+C, Ctrl+V) actions can be performed for elements with Multi-Tailed Arrows loaded from KET together', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Copy-Paste (Ctrl+C, Ctrl+V) actions can be performed for elements with Multi-Tailed Arrows loaded from KET together
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/rings-with-multi-tailed-arrows.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await page.mouse.click(300, 350);
    await takeEditorScreenshot(page);
  });

  test('Verify that Cut-Paste (Ctrl+X, Ctrl+V) actions can be performed for elements with Multi-Tailed Arrows loaded from KET together', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Cut-Paste (Ctrl+X, Ctrl+V) actions can be performed for elements with Multi-Tailed Arrows loaded from KET together
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/rings-with-multi-tailed-arrows.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await cutAndPaste(page);
    await page.mouse.click(300, 350);
    await takeEditorScreenshot(page);
  });
});
