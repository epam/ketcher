/* eslint-disable no-magic-numbers */
import { test, expect, Page } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  copyAndPaste,
  cutAndPaste,
  dragMouseTo,
  LeftPanelButton,
  moveOnAtom,
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
  selectLeftPanelButton,
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
  await page.mouse.click(600, 400);
  await page.getByTestId('head-resize').hover({ force: true });
  await dragMouseTo(800, 500, page);
  await page.getByTestId('head-move').hover({ force: true });
  await dragMouseTo(800, 500, page);
  await page.getByTestId('bottomTail-resize').hover({ force: true });
  await dragMouseTo(200, 500, page);
  await takeEditorScreenshot(page);
  await page.mouse.move(610, 350);
  await dragMouseTo(610, 100, page);
  await page.mouse.click(100, 100);
}

async function addNewTail(page: Page) {
  await page.mouse.click(500, 600, { button: 'right' });
  await waitForRender(page, async () => {
    await page.getByText('Add new tail').click();
  });
}

async function removeTail(page: Page, tailName: string) {
  await page.getByTestId(tailName).click({ force: true, button: 'right' });
  await waitForRender(page, async () => {
    await page.getByText('Remove tail').click();
  });
}

async function verifyFile(
  page: Page,
  filename: string,
  expectedFilename: string,
) {
  const expectedFile = await getKet(page);
  await saveToFile(filename, expectedFile);

  const { fileExpected: ketFileExpected, file: ketFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: expectedFilename,
    });

  expect(ketFile).toEqual(ketFileExpected);
  await openFileAndAddToCanvasAsNewProject(filename, page);
  await takeEditorScreenshot(page);
}

async function hoverOverArrowSpine(
  page: Page,
  index = 0,
  clickType?: 'left' | 'right',
) {
  const headMove = await page.getByTestId('head-move').nth(index);
  const boundingBox = await headMove.boundingBox();

  if (boundingBox) {
    const x = boundingBox.x + boundingBox.width / 2;
    const y = boundingBox.y + boundingBox.height / 2;

    await page.mouse.move(x - 5, y);

    if (clickType === 'right') {
      await page.mouse.click(x - 5, y, { button: 'right' });
    } else if (clickType === 'left') {
      await page.mouse.click(x - 5, y, { button: 'left' });
    }
  }
}

async function addTails(page: Page, count: number) {
  for (let i = 0; i < count; i++) {
    await clickInTheMiddleOfTheScreen(page, 'right');
    await page.getByText('Add new tail').click();
  }
}

async function addTailToArrow(page: Page, arrowIndex: number) {
  await page.mouse.click(200, 200);
  await selectPartOfMolecules(page);
  await hoverOverArrowSpine(page, arrowIndex, 'right');
  await page.getByText('Add new tail').click();
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

    await verifyFile(
      page,
      'KET/multi-tailed-arrow-to-compare.ket',
      'tests/test-data/KET/multi-tailed-arrow-to-compare.ket',
    );
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

    await verifyFile(
      page,
      'KET/three-different-multi-tail-arrows-expected.ket',
      'tests/test-data/KET/three-different-multi-tail-arrows-expected.ket',
    );
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

    await verifyFile(
      page,
      'KET/three-different-multi-tail-arrows-with-elements-expected.ket',
      'tests/test-data/KET/three-different-multi-tail-arrows-with-elements-expected.ket',
    );
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

    await verifyFile(
      page,
      'KET/multi-tailed-arrows-from-two-different-files-expected.ket',
      'tests/test-data/KET/multi-tailed-arrows-from-two-different-files-expected.ket',
    );
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

    await verifyFile(
      page,
      'KET/multi-tailed-arrows-15-with-images-png-svg-80-with-structures-50-expected.ket',
      'tests/test-data/KET/multi-tailed-arrows-15-with-images-png-svg-80-with-structures-50-expected.ket',
    );
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
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+c');
    });
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+v');
    });
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
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+x');
    });
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+v');
    });
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
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+c');
    });
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+v');
    });
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
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+x');
    });
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+v');
    });
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

    await verifyFile(
      page,
      'KET/reaction-arrow-multitail-to-compare.ket',
      'tests/test-data/KET/reaction-arrow-multitail-to-compare.ket',
    );
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

    await verifyFile(
      page,
      'KET/three-reaction-arrow-multitail-to-compare.ket',
      'tests/test-data/KET/three-reaction-arrow-multitail-to-compare.ket',
    );
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

    await verifyFile(
      page,
      'KET/benzene-rings-and-three-reaction-arrow-multitail-to-compare.ket',
      'tests/test-data/KET/benzene-rings-and-three-reaction-arrow-multitail-to-compare.ket',
    );
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
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+c');
    });
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
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+x');
    });
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
     * Description: Copy-Paste (Ctrl+C, Ctrl+V) actions can be performed for default Multi-Tailed Arrow added by Tool
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await page.mouse.click(500, 600);
    await page.keyboard.press('Control+a');
    await takeEditorScreenshot(page);
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+c');
    });
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
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+x');
    });
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
    await verifyFile(
      page,
      'KET/modified-multitail-arrow-expected.ket',
      'tests/test-data/KET/modified-multitail-arrow-expected.ket',
    );
  });

  test('Multi-Tailed Arrows with elements can be saved to KET format after following actions: changing size and positions of added tails, add/remove tails', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5055
    Description: Multi-Tailed Arrows with elements can be saved to KET format after following actions: changing size and positions of 
    added tails, add/remove tails, deletion of arrow/element.
    */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await page.mouse.click(500, 600);
    await selectRing(RingButton.Benzene, page);
    await page.mouse.click(200, 400);
    await selectRectangleSelectionTool(page);
    await addNewTail(page);
    await page.mouse.click(500, 600);
    await page.getByTestId('tails-0-resize').hover({ force: true });
    await dragMouseTo(200, 600, page);
    await page.getByTestId('tails-0-move').hover({ force: true });
    await dragMouseTo(500, 500, page);
    /* We need to click on the multi-tailed arrow here to select it, as the testId only appears after selection */
    await page.mouse.click(500, 600);
    await addNewTail(page);
    /* We need to click on the multi-tailed arrow here to select it, as the testId only appears after selection */
    await page.mouse.click(500, 600);
    await addNewTail(page);
    await takeEditorScreenshot(page);
    await removeTail(page, 'tails-1-move');
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    /* Here we erase multi-tailed arrow */
    await page.mouse.click(500, 600);
    await takeEditorScreenshot(page);
    await waitForRender(page, async () => {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    });
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await page.mouse.click(500, 200);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/modified-multitail-arrow-with-added-tails-expected.ket',
      'tests/test-data/KET/modified-multitail-arrow-with-added-tails-expected.ket',
    );
  });

  test('Verify that loaded from KET Multi-Tailed Arrow with five tails and spine length = 1.4 can can be selected and moved to another place on Canvas', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4898
    Description: Loaded from KET Multi-Tailed Arrow with five tails and spine length = 1.4 can can be selected and moved to 
    another place on Canvas with correct size and position of spine, tails and head.
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-5-tails-spine-1.4-new.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await page.mouse.click(640, 350);
    await dragMouseTo(300, 100, page);
    await takeEditorScreenshot(page);
  });

  test('Verify that 3 Multi-Tailed Arrows with default size can be added to different selected places on Canvas one by one using "Multi-Tailed Arrow Tool" button', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4898
    Description: Three Multi-Tailed Arrows with default size (spine-2.5, tail-0.4, head-0.8) can be added to different selected places on 
    Canvas one by one using "Multi-Tailed Arrow Tool" button and can be selected and moved to another places on Canvas with correct sizes 
    and positions of spines, tails and heads.
    */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await page.mouse.click(200, 200);
    await page.mouse.click(400, 400);
    await page.mouse.click(600, 600);
    await takeEditorScreenshot(page);
    await selectRectangleSelectionTool(page);
    await waitForRender(page, async () => {
      await page.mouse.click(200, 200);
    });
    await waitForRender(page, async () => {
      await hoverOverArrowSpine(page, 0);
    });
    await dragMouseTo(400, 200, page);
    await waitForRender(page, async () => {
      await page.mouse.click(400, 400);
    });
    await waitForRender(page, async () => {
      await hoverOverArrowSpine(page, 1);
    });
    await dragMouseTo(600, 400, page);
    await waitForRender(page, async () => {
      await page.mouse.click(600, 600);
    });
    await waitForRender(page, async () => {
      await hoverOverArrowSpine(page, 2);
    });
    await dragMouseTo(800, 600, page);
    await takeEditorScreenshot(page);
  });

  test('Verify that 3 Multi-Tailed Arrows with default size can be selected and moved together with elements and separately to other places on Canvas', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4898
    Description: Three Multi-Tailed Arrows with default size (spine-2.5, tail-0.4, head-0.8) can be added to different selected places on 
    Canvas (with previously added elements) one by one using "Multi-Tailed Arrow Tool" button and they can be selected and moved together with 
    elements and separately to other places on Canvas with correct sizes and positions.
    */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await page.mouse.click(200, 200);
    await page.mouse.click(800, 200);
    await page.mouse.click(800, 300);
    await selectRing(RingButton.Benzene, page);
    await page.mouse.click(300, 300);
    await takeEditorScreenshot(page);
    await selectRectangleSelectionTool(page);
    await waitForRender(page, async () => {
      await page.mouse.click(200, 200);
    });
    await waitForRender(page, async () => {
      await hoverOverArrowSpine(page, 0);
    });
    await dragMouseTo(250, 250, page);
    await selectPartOfMolecules(page);
    await takeEditorScreenshot(page);
    await moveOnAtom(page, 'C', 0);
    await dragMouseTo(600, 250, page);
    await takeEditorScreenshot(page);
  });

  test('Loaded from .ket file 3 different Multi-Tailed Arrows with elements can be selected and moved together with elements and separately to other places on Canvas', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4898
    Description: Loaded from .ket file and added to selected place on Canvas 3 different Multi-Tailed Arrows with elements can be selected and 
    moved together with elements and separately to other places on Canvas with correct sizes and positions.
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/three-different-multi-tail-arrows-with-elements.ket',
      page,
    );
    await selectPartOfMolecules(page);
    await takeEditorScreenshot(page);
    await moveOnAtom(page, 'C', 0);
    await dragMouseTo(600, 250, page);
    await takeEditorScreenshot(page);
  });

  test('Verify that movement actions can be Undo/Redo for loaded from KET Multi-Tailed Arrows on Canvas with other elements', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4898
    Description: Movement actions can be Undo/Redo for loaded from KET Multi-Tailed Arrows on Canvas with other elements.
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/three-different-multi-tail-arrows-with-elements.ket',
      page,
    );
    await selectPartOfMolecules(page);
    await takeEditorScreenshot(page);
    await moveOnAtom(page, 'C', 0);
    await dragMouseTo(600, 250, page);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that movement actions can be Undo/Redo for added by Tool Multi-Tailed Arrows on Canvas with other elements', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4898
    Description: Movement actions can be Undo/Redo for added by Tool Multi-Tailed Arrows on Canvas with other elements.
    */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await page.mouse.click(200, 200);
    await page.mouse.click(800, 200);
    await page.mouse.click(800, 300);
    await selectRing(RingButton.Benzene, page);
    await page.mouse.click(300, 300);
    await takeEditorScreenshot(page);
    await selectRectangleSelectionTool(page);
    await waitForRender(page, async () => {
      await page.mouse.click(200, 200);
    });
    await waitForRender(page, async () => {
      await hoverOverArrowSpine(page, 0);
    });
    await dragMouseTo(250, 250, page);
    await selectPartOfMolecules(page);
    await takeEditorScreenshot(page);
    await moveOnAtom(page, 'C', 0);
    await dragMouseTo(600, 250, page);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Load from KET Multi-Tailed Arrow with two tails and  0.5 < spine length < 0.7, verify that a tail can not be added using "Add new tail" option in menu', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5056
    Description: Load from KET Multi-Tailed Arrow with two tails and  0.5 < spine length < 0.7, a tail can't be added using "Add new tail" option 
    in menu, "Add new tail" option is disabled when right-clicking on tail/head/spine.
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-spine-0.69.ket',
      page,
    );
    await clickInTheMiddleOfTheScreen(page, 'right');
    await expect(page.getByText('Add new tail')).toBeDisabled();
    await takeEditorScreenshot(page);
  });

  test('Load from KET Multi-Tailed Arrow with two tails and spine length = 0.7, verify that only one tail to the middle can be added using "Add new tail"', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5056
    Description: Load from KET Multi-Tailed Arrow with two tails and spine length = 0.7, only one tail to the middle can be 
    added using "Add new tail" option in menu, after that "Add new tail" option is disabled when right-clicking on tails/head/spine, 
    after that changed Multi-Tailed Arrow can be saved to KET with the correct coordinates of spine, tails and head.
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-spine-0.7.ket',
      page,
    );
    await clickInTheMiddleOfTheScreen(page, 'right');
    await page.getByText('Add new tail').click();
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page, 'right');
    await expect(page.getByText('Add new tail')).toBeDisabled();
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/multi-tailed-arrow-spine-0.7-expected.ket',
      'tests/test-data/KET/multi-tailed-arrow-spine-0.7-expected.ket',
    );
  });

  test('Load from KET Multi-Tailed Arrow with two tails and  0.7 < spine length < 1.4, verify that only one tail to the middle can be added using "Add new tail"', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5056
    Description: Load from KET Multi-Tailed Arrow with two tails and  0.7 < spine length < 1.4, only one tail to the middle can be 
    added using "Add new tail" option in menu, after that "Add new tail" option is disabled when right-clicking on tails/head/spine, 
    after that changed Multi-Tailed Arrow can be saved to KET with the correct coordinates of spine, tails and head.
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-spine-1.39.ket',
      page,
    );
    await clickInTheMiddleOfTheScreen(page, 'right');
    await page.getByText('Add new tail').click();
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page, 'right');
    await expect(page.getByText('Add new tail')).toBeDisabled();
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/multi-tailed-arrow-spine-1.39-expected.ket',
      'tests/test-data/KET/multi-tailed-arrow-spine-1.39-expected.ket',
    );
  });

  test('Load from KET Multi-Tailed Arrow with two tails and spine length = 1.4, verify that 3 tails can be added using "Add new tail"', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5056
    Description: Load from KET Multi-Tailed Arrow with two tails and spine length = 1.4, verify that 3 tails (the first to the middle, second to the top half, 
    the third to the bottom half) can be added using "Add new tail" option in menu, after that "Add new tail" option is disabled when right-clicking on tails/head/spine, 
    after that changed Multi-Tailed Arrow can be saved to KET with the correct coordinates of spine, tails and head.
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-spine-1.4.ket',
      page,
    );
    for (let i = 0; i < 3; i++) {
      await clickInTheMiddleOfTheScreen(page, 'right');
      await page.getByText('Add new tail').click();
    }
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page, 'right');
    await expect(page.getByText('Add new tail')).toBeDisabled();
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/multi-tailed-arrow-spine-1.4-expected.ket',
      'tests/test-data/KET/multi-tailed-arrow-spine-1.4-expected.ket',
    );
  });

  test('Load from KET 3 different Multi-Tailed Arrows, verify that tails can be added to each Multi-Tailed Arrow, after that they can be saved to KET', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5056
    Description: Load from KET 3 different Multi-Tailed Arrows (small with two tails, medium with 4 tails, large with 3 tails), verify that tails 
    (3 to small, 1 to medium, 6 to large) can be added to each Multi-Tailed Arrow, after that they can be saved to KET with the correct coordinates of spines, tails and heads.
    */

    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrows-3.ket',
      page,
    );
    await addTails(page, 6);
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page, 'right');
    await expect(page.getByText('Add new tail')).toBeDisabled();
    await takeEditorScreenshot(page);
    await addTailToArrow(page, 0);
    await addTailToArrow(page, 2);
    await addTailToArrow(page, 2);
    await hoverOverArrowSpine(page, 2, 'right');
    await expect(page.getByText('Add new tail')).toBeDisabled();
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/multi-tailed-arrows-3-expected.ket',
      'tests/test-data/KET/multi-tailed-arrows-3-expected.ket',
    );
  });
});
