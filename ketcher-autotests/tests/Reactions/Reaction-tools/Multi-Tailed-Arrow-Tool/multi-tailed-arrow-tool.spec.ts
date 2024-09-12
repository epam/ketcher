/* eslint-disable no-magic-numbers */
import { test, expect, Page } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  copyAndPaste,
  cutAndPaste,
  dragMouseTo,
  openDropdown,
  openFile,
  openFileAndAddToCanvas,
  openFileAndAddToCanvasAsNewProject,
  openPasteFromClipboard,
  pressButton,
  readFileContents,
  receiveFileComparisonData,
  resetCurrentTool,
  RingButton,
  saveToFile,
  screenshotBetweenUndoRedo,
  selectClearCanvasTool,
  selectDropdownTool,
  selectEraseTool,
  selectPartOfMolecules,
  selectRectangleSelectionTool,
  selectRing,
  selectTopPanelButton,
  setZoomInputValue,
  takeEditorScreenshot,
  takeLeftToolbarScreenshot,
  TopPanelButton,
  waitForLoad,
  waitForPageInit,
  waitForRender,
} from '@utils';
import { clickOnFileFormatDropdown, getKet } from '@utils/formats';
import { openStructureLibrary } from '@utils/templates';

async function saveToTemplates(page: Page) {
  await pressButton(page, 'Save to Templates');
  await page.getByPlaceholder('template').click();
  await page
    .getByPlaceholder('template')
    .fill('multi_tail_arrows_with_elements');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
}

async function selectFromSaveToTemplates(page: Page) {
  await page.getByRole('button', { name: 'User Templates (1)' }).click();
  await page
    .getByPlaceholder('Search by elements...')
    .fill('multi_tail_arrows_with_elements');
  await page.getByPlaceholder('Search by elements...').press('Enter');
}

async function setupElementsAndModifyMultiTailArrow(page: Page) {
  await selectDropdownTool(
    page,
    'reaction-arrow-open-angle',
    'reaction-arrow-multitail',
  );
  await page.mouse.click(600, 400);
  await selectRing(RingButton.Benzene, page);
  await page.mouse.click(200, 400);
  await selectRectangleSelectionTool(page);
  await page.mouse.move(650, 350);
  await dragMouseTo(800, 500, page);
  await page.mouse.move(630, 350);
  await dragMouseTo(800, 500, page);
  await page.mouse.move(600, 400);
  await dragMouseTo(200, 500, page);
  await takeEditorScreenshot(page);
  await page.mouse.move(610, 350);
  await dragMouseTo(610, 100, page);
  await page.mouse.click(100, 100);
}

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

  test('Verify that 15 Multi-Tailed Arrows with 80 images of allowed format (PNG, SVG) and 50 structures can be saved together to .ket file', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5104
     * Description: 15 Multi-Tailed Arrows with 80 images of allowed format (PNG, SVG) and 50 structures can be saved together to .ket file,
     * after that loaded from .ket file and added to selected place on Canvas with correct position and layer level.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrows-15-with-images-png-svg-80-with-structures-50.ket',
      page,
    );

    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/multi-tailed-arrows-15-with-images-png-svg-80-with-structures-50-expected.ket',
      expectedFile,
    );

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/multi-tailed-arrows-15-with-images-png-svg-80-with-structures-50-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrows-15-with-images-png-svg-80-with-structures-50-expected.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that Multi-Tailed Arrow with minimal sizes can be loaded without errors (spine - 0.5, tail - 0.4, head - 0.5), its a minimal size', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5104
     * Description: Multi-Tailed Arrow with minimal sizes can be loaded without errors (spine - 0.5, tail - 0.4, head - 0.5), it's a minimal size.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-minimal.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });

  const testConfigs = [
    {
      description:
        'Multi-Tailed Arrow with corrupted fields (type, head, spine, tails) cannot be added from KET file to Canvas',
      file: 'KET/multi-tailed-arrow-invalid-type.ket',
      detailedDescription: `Multi-Tailed Arrow with corrupted fields (type, head, spine, tails) can't be added from KET file to Canvas and error message 
      is displayed - "Cannot deserialize input JSON."`,
    },
    {
      description:
        'Multi-Tailed Arrow with spine less than 0.5 cannot be added from KET file to Canvas',
      file: 'KET/multi-tailed-arrow-invalid-spine-0.49.ket',
      detailedDescription: `Multi-Tailed Arrow with spine less than 0.5 can't be added from KET file to Canvas and error message is displayed - "Cannot deserialize input JSON."`,
    },
    {
      description:
        'Multi-Tailed Arrow cannot be added from KET file if y1-coordinate is less than y2-coordinate of spine',
      file: 'KET/multi-tailed-arrow-invalid-spine-y1-y2.ket',
      detailedDescription: `Multi-Tailed Arrow can't be added from KET file to Canvas and error message is displayed - "Cannot deserialize input JSON." 
      if y1-coordinate is less than y2-coordinate of spine.`,
    },
    {
      description:
        'Multi-Tailed Arrow with different x-coordinates of spine cannot be added from KET file to Canvas',
      file: 'KET/multi-tailed-arrow-invalid-spine-not-equal-x.ket',
      detailedDescription: `Multi-Tailed Arrow with different x-coordinates of spine can't be added from KET file to Canvas and error message 
      is displayed - "Cannot deserialize input JSON."`,
    },
    {
      description:
        'Multi-Tailed Arrow with head less than 0.5 cannot be added from KET file to Canvas',
      file: 'KET/multi-tailed-arrow-invalid-head-0.49.ket',
      detailedDescription: `Multi-Tailed Arrow with head less than 0.5 can't be added from KET file to Canvas and error message is displayed - "Cannot deserialize input JSON."`,
    },
    {
      description:
        'Multi-Tailed Arrow with head positioned less than 0.15 to top tail cannot be added from KET file',
      file: 'KET/multi-tailed-arrow-invalid-head-position-0.14.ket',
      detailedDescription: `Multi-Tailed Arrow with head is positioned less than 0.15 to top tail can't be added from KET file to Canvas and error message 
      is displayed - "Cannot deserialize input JSON."`,
    },
    {
      description:
        'Multi-Tailed Arrow with tail less than 0.4 cannot be added from KET file to Canvas',
      file: 'KET/multi-tailed-arrow-invalid-tails-0.39.ket',
      detailedDescription: `Multi-Tailed Arrow with tail less than 0.4 can't be added from KET file to Canvas and error message is displayed - "Cannot deserialize input JSON."`,
    },
    {
      description:
        'Multi-Tailed Arrow with tail distance less than 0.35 cannot be added from KET file to Canvas',
      file: 'KET/multi-tailed-arrow-invalid-tails-distance.ket',
      detailedDescription: `Multi-Tailed Arrow with tail distance less than 0.35 can't be added from KET file to Canvas and error message 
      is displayed - "Cannot deserialize input JSON."`,
    },
    {
      description:
        'Multi-Tailed Arrow with different lengths of tails cannot be added from KET file to Canvas',
      file: 'KET/multi-tailed-arrow-invalid-tails-different-length.ket',
      detailedDescription: `Multi-Tailed Arrow with different length of tails can't be added from KET file to Canvas and error message 
      is displayed - "Cannot deserialize input JSON."`,
    },
    {
      description:
        'Multi-Tailed Arrow cannot be added from KET file if y-coordinates of top and bottom tails are not equal to spine',
      file: 'KET/multi-tailed-arrow-invalid-tails-y-not-equal-spine.ket',
      detailedDescription: `Multi-Tailed Arrow can't be added from KET file to Canvas and error message is displayed - "Cannot deserialize input JSON." 
      if y-coordinates of top and bottom tails are not equal to y-coordinates of spine.`,
    },
    {
      description:
        'Multi-Tailed Arrow cannot be added from KET file if y-coordinates of some tails are out of spine',
      file: 'KET/multi-tailed-arrow-invalid-tails-out-of-spine.ket',
      detailedDescription: `Multi-Tailed Arrow can't be added from KET file to Canvas and error message is displayed - "Cannot deserialize input JSON." 
      if y-coordinates of some tails are out of y-coordinates of spine.`,
    },
  ];

  for (const { description, file } of testConfigs) {
    test(`Verify that ${description}`, async ({ page }) => {
      /**
       * Test case: https://github.com/epam/ketcher/issues/5104
       * Description: ${detailedDescription}
       */
      await selectTopPanelButton(TopPanelButton.Open, page);
      await openFile(file, page);
      await pressButton(page, 'Add to Canvas');
      await takeEditorScreenshot(page);
    });
  }

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
    await waitForRender(page, async () => {
      await page.mouse.click(300, 350);
    });
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
    await waitForRender(page, async () => {
      await page.mouse.click(300, 350);
    });
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

  test('Verify that Multi-Tailed Arrow with default size (spine-2.5, tail-0.4, head-0.8) can be added to selected places on Canvas using "Multi-Tailed Arrow Tool"', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Multi-Tailed Arrow with default size (spine-2.5, tail-0.4, head-0.8) can be added to selected places on Canvas
     * using "Multi-Tailed Arrow Tool" and can be saved to .ket file with the correct coordinates of spine, tails and head.
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await page.mouse.click(500, 600);

    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/reaction-arrow-multitail-to-compare.ket',
      expectedFile,
    );

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/reaction-arrow-multitail-to-compare.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'KET/reaction-arrow-multitail-to-compare.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Three Multi-Tailed Arrows with default size (spine-2.5, tail-0.4, head-0.8) can be added to different places on Canvas one by one using "Multi-Tailed Arrow Tool"', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Three Multi-Tailed Arrows with default size (spine-2.5, tail-0.4, head-0.8) can be added to different selected places on Canvas
     * one by one using "Multi-Tailed Arrow Tool" and can be saved together to .ket file with the correct coordinates of spines, tails and heads.
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await page.mouse.click(300, 400);
    await page.mouse.click(500, 600);
    await page.mouse.click(700, 500);

    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/three-reaction-arrow-multitail-to-compare.ket',
      expectedFile,
    );

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/three-reaction-arrow-multitail-to-compare.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'KET/three-reaction-arrow-multitail-to-compare.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Three Multi-Tailed Arrows with default size (spine-2.5, tail-0.4, head-0.8) can be added to different places on Canvas (with previously added elements)', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Three Multi-Tailed Arrows with default size (spine-2.5, tail-0.4, head-0.8) can be added to different selected places on Canvas (with previously added elements)
     * one by one using "Multi-Tailed Arrow Tool" button and they can be saved together to .ket file with the correct coordinates of spines, tails and heads.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/three-benzene-rings.ket',
      page,
    );
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await page.mouse.click(300, 400);
    await page.mouse.click(500, 600);
    await page.mouse.click(700, 500);

    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/benzene-rings-and-three-reaction-arrow-multitail-to-compare.ket',
      expectedFile,
    );

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/benzene-rings-and-three-reaction-arrow-multitail-to-compare.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-rings-and-three-reaction-arrow-multitail-to-compare.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that Copy/Paste actions for Multi-Tailed Arrows loaded from KET can be Undo/Redo when other elements are on Canvas', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Copy/Paste actions for Multi-Tailed Arrows loaded from KET can be Undo/Redo when other elements are on Canvas
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/three-multi-tail-arrows-and-rings.ket',
      page,
    );
    await selectPartOfMolecules(page);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+c');
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+v');
    });
    await waitForRender(page, async () => {
      await page.mouse.click(300, 350);
    });
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that Cut/Paste actions for Multi-Tailed Arrows loaded from KET can be Undo/Redo when other elements are on Canvas', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Cut/Paste actions for Multi-Tailed Arrows loaded from KET can be Undo/Redo when other elements are on Canvas
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/three-multi-tail-arrows-and-rings.ket',
      page,
    );
    await selectPartOfMolecules(page);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+x');
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+v');
    });
    await waitForRender(page, async () => {
      await page.mouse.click(300, 350);
    });
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that Copy-Paste (Ctrl+C, Ctrl+V) actions can be performed for default Multi-Tailed Arrow added by Tool', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Copy-Paste (Ctrl+C, Ctrl+V) and Cut-Paste (Ctrl+X, Ctrl+V) actions can be performed for default Multi-Tailed Arrow added by Tool
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await page.mouse.click(500, 600);
    await page.keyboard.press('Control+a');
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+c');
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+v');
    });
    await waitForRender(page, async () => {
      await page.mouse.click(300, 350);
    });
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that Cut-Paste (Ctrl+X, Ctrl+V) actions can be performed for default Multi-Tailed Arrow added by Tool', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Cut-Paste (Ctrl+X, Ctrl+V) actions can be performed for default Multi-Tailed Arrow added by Tool
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await page.mouse.click(500, 600);
    await page.keyboard.press('Control+a');
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+x');
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+v');
    });
    await waitForRender(page, async () => {
      await page.mouse.click(300, 350);
    });
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that Multi-Tailed Arrows can not be saved to template - "Save to Template" button is disabled', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Multi-Tailed Arrows can't be saved to template - "Save to Template" button is disabled
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await page.mouse.click(500, 600);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await expect(page.getByText('Save to Templates')).toBeDisabled();
    await takeEditorScreenshot(page, {
      masks: [page.getByTestId('mol-preview-area-text')],
    });
  });

  test('Verify that Multi-Tailed Arrows with elements can be saved to template and added to Canvas with correct position and layer level', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5055
    Description: Multi-Tailed Arrows with elements can be saved to template and added to Canvas with correct position and layer level.
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/three-different-multi-tail-arrows-with-elements.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Save, page);
    await saveToTemplates(page);
    await selectTopPanelButton(TopPanelButton.Clear, page);

    await openStructureLibrary(page);
    await selectFromSaveToTemplates(page);
    await takeEditorScreenshot(page);
    await page.getByText('multi_tail_arrows_with_elements').click();
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Multi-Tailed Arrows with elements can be saved to KET format after following actions: selection, movement of arrow itself, changing of size and position of head', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5055
    Description: Multi-Tailed Arrows with elements can be saved to KET format with the correct coordinates of spines, tails and heads and 
    elements position after the following actions: selection, movement of arrow itself, changing of size and position of head.
    */
    await setupElementsAndModifyMultiTailArrow(page);
    await takeEditorScreenshot(page);
    const expectedFile = await getKet(page);
    await saveToFile('KET/modified-multitail-arrow-expected.ket', expectedFile);

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/modified-multitail-arrow-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'KET/modified-multitail-arrow-expected.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });
});
