/* eslint-disable no-magic-numbers */
import { test, expect, Page } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  clickOnCanvas,
  copyAndPaste,
  cutAndPaste,
  dragMouseTo,
  LeftPanelButton,
  moveMouseAway,
  moveOnAtom,
  openDropdown,
  openFile,
  openFileAndAddToCanvas,
  openFileAndAddToCanvasAsNewProject,
  openImageAndAddToCanvas,
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
  waitForPageInit,
  waitForRender,
} from '@utils';
import { closeErrorAndInfoModals } from '@utils/common/helpers';
import {
  clickOnFileFormatDropdown,
  FileFormatOption,
  getKet,
  selectSaveFileFormat,
} from '@utils/formats';
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
  await clickOnCanvas(page, 600, 400);
  await selectRing(RingButton.Benzene, page);
  await clickOnCanvas(page, 200, 400);
  await selectRectangleSelectionTool(page);
  await clickOnCanvas(page, 600, 400);
  await page.getByTestId('head-resize').hover({ force: true });
  await dragMouseTo(800, 500, page);
  await page.getByTestId('head-move').hover({ force: true });
  await dragMouseTo(800, 500, page);
  await page.getByTestId('bottomTail-resize').hover({ force: true });
  await dragMouseTo(200, 500, page);
  await takeEditorScreenshot(page);
  await page.mouse.move(610, 350);
  await dragMouseTo(610, 100, page);
  await clickOnCanvas(page, 100, 100);
}

async function addTail(page: Page, x: number, y: number) {
  await page.mouse.click(x, y, { button: 'right' });
  await waitForRender(page, async () => {
    await page.getByText('Add new tail').click();
  });
}

async function removeTail(page: Page, tailName: string, index?: number) {
  const tailElement = page.getByTestId(tailName);
  if (index !== undefined) {
    await tailElement.nth(index).click({ force: true, button: 'right' });
  } else {
    await tailElement.first().click({ force: true, button: 'right' });
  }
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
  await clickOnCanvas(page, 200, 200);
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
     * Description: Default Multi-Tailed Arrow with two tails saved to .ket file with correct coordinates of spine, tails and head
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
     * Description: Three different Multi-Tailed Arrows saved together to .ket file with correct coordinates of spines, tails and heads
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
     * Description: Three different Multi-Tailed Arrows with different elements saved together to .ket file with the correct coordinates of spines,
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
     * Description: Multi-Tailed Arrows with different elements together added to selected place on Canvas from 2 different .ket files
     * and they are on the correct positions to each other and they saved together to .ket file with correct parameters.
     */
    await openFileAndAddToCanvas(
      'KET/three-different-multi-tail-arrows-with-elements.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('KET/three-different-multi-tail-arrows.ket', page);
    await waitForRender(page, async () => {
      await pressButton(page, 'Add to Canvas');
    });
    await clickOnCanvas(page, 200, 300);

    await verifyFile(
      page,
      'KET/multi-tailed-arrows-from-two-different-files-expected.ket',
      'tests/test-data/KET/multi-tailed-arrows-from-two-different-files-expected.ket',
    );
  });

  test('Verify that 15 Multi-Tailed Arrows with 80 images of allowed format (PNG, SVG) and 50 structures can be saved together to .ket file', async ({
    page,
  }) => {
    test.setTimeout(90000);
    /**
     * Test case: https://github.com/epam/ketcher/issues/5104
     * Description: 15 Multi-Tailed Arrows with 80 images of allowed format (PNG, SVG) and 50 structures saved together to .ket file,
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

  test('Verify that Multi-Tailed Arrow with minimal sizes can be loaded without errors (spine - 0.01, tail - 0.01, head - 0.01), its a minimal size', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5104
     * Description: Multi-Tailed Arrow with minimal sizes can be loaded without errors (minimal sizes: spine - 0.01
     * (can't check because of distance between head and top/bottom tail), tail - 0.01, head - 0.01, distance between tails - 0.01,
     * distance between head and top/bottom tail - 0.01) and head, spine and tails can be changed to bigger size.
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
        'Verify that Multi-Tailed Arrow with minimal sizes for UI can be loaded without errors',
      file: 'KET/multi-tailed-arrow-minimal-on-ui.ket',
      detailedDescription: `Verify that Multi-Tailed Arrow with minimal sizes for UI can be loaded without errors 
      (minimal sizes: spine - 0.5, tail - 0.4, head - 0.5, distance between tails - 0.35, distance between head and top/bottom tail - 0.15)`,
    },
    {
      description:
        'Multi-Tailed Arrow with spine less than 0.01 cannot be added from KET file to Canvas',
      file: 'KET/multi-tailed-arrow-invalid-spine-0.009.ket',
      detailedDescription: `Multi-Tailed Arrow with spine less than 0.01 can't be added from KET file to Canvas and error message is displayed - "Cannot deserialize input JSON."`,
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
        'Multi-Tailed Arrow with head less than 0.01 cannot be added from KET file to Canvas  - no longer applicable since 0.01 is the new limit',
      file: 'KET/multi-tailed-arrow-invalid-head-0.009.ket',
      detailedDescription: `Multi-Tailed Arrow with head less than 0.01 can't be added from KET file to Canvas and error message is displayed - "Cannot deserialize input JSON."`,
    },
    {
      description:
        'Multi-Tailed Arrow with head positioned less than 0.01 to top tail cannot be added from KET file - no longer applicable since 0.01 is the new limit',
      file: 'KET/multi-tailed-arrow-head-position-0.01.ket',
      detailedDescription: `Multi-Tailed Arrow with head is positioned less than 0.011 to top tail can't be added from KET file to Canvas and error message 
      is displayed - "Cannot deserialize input JSON."`,
    },
    {
      description:
        'Verify that Multi-Tailed Arrow with head thats positioned at 0.01 to bottom tail can be added from KET file to Canvas',
      file: 'KET/multi-tailed-arrow-head-position-0.49.ket',
      detailedDescription: `Multi-Tailed Arrow with head that's positioned at 0.01 to bottom tail can be added from KET file to Canvas`,
    },
    {
      description:
        'Verify that Multi-Tailed Arrow with head thats positioned less then 0.01 to bottom tail cant be added from KET file to Canvas',
      file: 'KET/multi-tailed-arrow-invalid-head-position-0.009.ket',
      detailedDescription: `Multi-Tailed Arrow with head that's positioned less then 0.01 to bottom tail can't be added from KET file to Canvas
       and error message is displayed - "Cannot deserialize input JSON."`,
    },
    {
      description:
        'Verify that Multi-Tailed Arrow with head thats out of spine cant be added from KET file to Canvas and error message is displayed',
      file: 'KET/multi-tailed-arrow-invalid-head-out-of-spine.ket',
      detailedDescription: `Verify that Multi-Tailed Arrow with head that's out of spine can't be added from KET file to Canvas 
      and error message is displayed - "Cannot deserialize input JSON."`,
    },
    {
      description:
        'Multi-Tailed Arrow with tail less than 0.01 cannot be added from KET file to Canvas - no longer applicable since 0.01 is the new limit',
      file: 'KET/multi-tailed-arrow-invalid-tails-0.009.ket',
      detailedDescription: `Multi-Tailed Arrow with tail less than 0.01 can't be added from KET file to Canvas and error message is displayed - "Cannot deserialize input JSON."`,
    },
    {
      description:
        'Multi-Tailed Arrow with tail distance less than 0.01 cannot be added from KET file to Canvas - no longer applicable since 0.01 is the new limit',
      file: 'KET/multi-tailed-arrow-invalid-tails-distance.ket',
      detailedDescription: `Multi-Tailed Arrow with tail distance less than 0.01 can't be added from KET file to Canvas and error message 
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
        'Verify that Multi-Tailed Arrow with tail distance less = 0.01 can be added from KET file to Canvas and head, spine and tails can be changed to bigger size',
      file: 'KET/multi-tailed-arrow-4-tails-minimal-distance.ket',
      detailedDescription: `Multi-Tailed Arrow with tail distance less = 0.01 can be added from KET file to Canvas 
      and head, spine and tails can be changed to bigger size`,
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
     * Description: Three different Multi-Tailed Arrows zoomed in/out (20, 400, 100) after adding to Canvas from .ket file
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
     * Description: Action of adding to Canvas of Multi-Tailed Arrows from .ket file and Undo/Redo.
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
     * Description: Multi-Tailed Arrows zoomed in/out (20, 400, 100) after adding to Canvas using zoom buttons
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
     * Description: Action of adding to Canvas Multi-Tailed Arrows using "Multi-Tailed Arrow Tool" button and Undo/Redo.
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
     * Description: Loaded from .ket file and added to selected place on Canvas 3 different Multi-Tailed Arrows deleted using "Clear Canvas" (or Ctrl+Delete)
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
     * Description: Adding to selected place on Canvas Multi-Tailed Arrows using "Multi-Tailed Arrow Tool" deleted using "Clear Canvas" (or Ctrl+Delete)
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
     * deleted using "Erase" (or Delete, Backspace buttons)
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
     * deleted using "Erase" (or Delete, Backspace buttons)
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
     * Description: Copy-Paste (Ctrl+C, Ctrl+V) actions performed for 3 different Multi-Tailed Arrows
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
    await clickOnCanvas(page, 300, 350);
    await takeEditorScreenshot(page);
  });

  test('Verify that Cut-Paste (Ctrl+X, Ctrl+V) actions can be performed for 3 different Multi-Tailed Arrows loaded from KET when other elements are on Canvas ', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Cut-Paste (Ctrl+X, Ctrl+V) actions performed for 3 different Multi-Tailed Arrows
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
    await clickOnCanvas(page, 300, 350);
    await takeEditorScreenshot(page);
  });

  test('Verify that Copy-Paste (Ctrl+C, Ctrl+V) actions can be performed for elements when Multi-Tailed Arrows loaded from KET are on Canvas', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Copy-Paste (Ctrl+C, Ctrl+V) actions performed for elements when Multi-Tailed Arrows loaded from KET are on Canvas
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
    await clickOnCanvas(page, 300, 350);
    await takeEditorScreenshot(page);
  });

  test('Verify that Cut-Paste (Ctrl+X, Ctrl+V) actions can be performed for elements when Multi-Tailed Arrows loaded from KET are on Canvas', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Cut-Paste (Ctrl+X, Ctrl+V) actions performed for elements when Multi-Tailed Arrows loaded from KET are on Canvas
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
    await clickOnCanvas(page, 300, 350);
    await takeEditorScreenshot(page);
  });

  test('Verify that Copy-Paste (Ctrl+C, Ctrl+V) actions can be performed for elements with Multi-Tailed Arrows loaded from KET together', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Copy-Paste (Ctrl+C, Ctrl+V) actions performed for elements with Multi-Tailed Arrows loaded from KET together
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/rings-with-multi-tailed-arrows.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, 300, 350);
    await takeEditorScreenshot(page);
  });

  test('Verify that Cut-Paste (Ctrl+X, Ctrl+V) actions can be performed for elements with Multi-Tailed Arrows loaded from KET together', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Cut-Paste (Ctrl+X, Ctrl+V) actions performed for elements with Multi-Tailed Arrows loaded from KET together
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/rings-with-multi-tailed-arrows.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await cutAndPaste(page);
    await clickOnCanvas(page, 300, 350);
    await takeEditorScreenshot(page);
  });

  test('Verify that Multi-Tailed Arrow with default size (spine-2.5, tail-0.4, head-0.8) can be added to selected places on Canvas using "Multi-Tailed Arrow Tool"', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Multi-Tailed Arrow with default size (spine-2.5, tail-0.4, head-0.8) added to selected places on Canvas
     * using "Multi-Tailed Arrow Tool" and saved to .ket file with the correct coordinates of spine, tails and head.
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickOnCanvas(page, 500, 600);

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
     * Description: Three Multi-Tailed Arrows with default size (spine-2.5, tail-0.4, head-0.8) added to different selected places on Canvas
     * one by one using "Multi-Tailed Arrow Tool" and saved together to .ket file with the correct coordinates of spines, tails and heads.
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickOnCanvas(page, 300, 400);
    await clickOnCanvas(page, 500, 600);
    await clickOnCanvas(page, 700, 500);

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
     * Description: Three Multi-Tailed Arrows with default size (spine-2.5, tail-0.4, head-0.8) added to different selected places on Canvas (with previously added elements)
     * one by one using "Multi-Tailed Arrow Tool" button and they saved together to .ket file with the correct coordinates of spines, tails and heads.
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
    await clickOnCanvas(page, 300, 400);
    await clickOnCanvas(page, 500, 600);
    await clickOnCanvas(page, 700, 500);

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
     * Description: Copy/Paste actions for Multi-Tailed Arrows loaded from KET Undo/Redo when other elements are on Canvas
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
    clickOnCanvas(page, 300, 350);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that Cut/Paste actions for Multi-Tailed Arrows loaded from KET can be Undo/Redo when other elements are on Canvas', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Cut/Paste actions for Multi-Tailed Arrows loaded from KET Undo/Redo when other elements are on Canvas
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
    await clickOnCanvas(page, 300, 350);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that Copy-Paste (Ctrl+C, Ctrl+V) actions can be performed for default Multi-Tailed Arrow added by Tool', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Copy-Paste (Ctrl+C, Ctrl+V) actions performed for default Multi-Tailed Arrow added by Tool
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickOnCanvas(page, 500, 600);
    await page.keyboard.press('Control+a');
    await takeEditorScreenshot(page);
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+c');
    });
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+v');
    });
    await clickOnCanvas(page, 300, 350);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that Cut-Paste (Ctrl+X, Ctrl+V) actions can be performed for default Multi-Tailed Arrow added by Tool', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5055
     * Description: Cut-Paste (Ctrl+X, Ctrl+V) actions performed for default Multi-Tailed Arrow added by Tool
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickOnCanvas(page, 500, 600);
    await page.keyboard.press('Control+a');
    await takeEditorScreenshot(page);
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+x');
    });
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+v');
    });
    await clickOnCanvas(page, 300, 350);
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
    await clickOnCanvas(page, 500, 600);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await expect(page.getByText('Save to Templates')).toBeDisabled();
    await takeEditorScreenshot(page, {
      masks: [page.getByTestId('rxn-preview-area-text')],
    });
  });

  test('Verify that Multi-Tailed Arrows with elements can be saved to template and added to Canvas with correct position and layer level', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5055
    Description: Multi-Tailed Arrows with elements saved to template and added to Canvas with correct position and layer level.
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
    Description: Multi-Tailed Arrows with elements saved to KET format with the correct coordinates of spines, tails and heads and 
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
    Description: Multi-Tailed Arrows with elements saved to KET format after following actions: changing size and positions of 
    added tails, add/remove tails, deletion of arrow/element.
    */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickOnCanvas(page, 500, 600);
    await selectRing(RingButton.Benzene, page);
    await clickOnCanvas(page, 200, 400);
    await selectRectangleSelectionTool(page);
    await addTail(page, 500, 600);
    await clickOnCanvas(page, 500, 600);
    await page.getByTestId('tails-0-resize').hover({ force: true });
    await dragMouseTo(200, 600, page);
    await page.getByTestId('tails-0-move').hover({ force: true });
    await dragMouseTo(500, 500, page);
    /* We need to click on the multi-tailed arrow here to select it, as the testId only appears after selection */
    await clickOnCanvas(page, 500, 600);
    await addTail(page, 500, 600);
    /* We need to click on the multi-tailed arrow here to select it, as the testId only appears after selection */
    await clickOnCanvas(page, 500, 600);
    await addTail(page, 500, 600);
    await takeEditorScreenshot(page);
    await removeTail(page, 'tails-1-move');
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    /* Here we erase multi-tailed arrow */
    await clickOnCanvas(page, 500, 600);
    await takeEditorScreenshot(page);
    await waitForRender(page, async () => {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    });
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, 500, 200);
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
    Description: Loaded from KET Multi-Tailed Arrow with five tails and spine length = 1.4 can selected and moved to 
    another place on Canvas with correct size and position of spine, tails and head.
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-5-tails-spine-1.4-new.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickOnCanvas(page, 640, 350);
    await dragMouseTo(300, 100, page);
    await takeEditorScreenshot(page);
  });

  test('Verify that 3 Multi-Tailed Arrows with default size can be added to different selected places on Canvas one by one using "Multi-Tailed Arrow Tool" button', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4898
    Description: Three Multi-Tailed Arrows with default size (spine-2.5, tail-0.4, head-0.8) added to different selected places on 
    Canvas one by one using "Multi-Tailed Arrow Tool" button and selected and moved to another places on Canvas with correct sizes 
    and positions of spines, tails and heads.
    */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickOnCanvas(page, 200, 200);
    await clickOnCanvas(page, 400, 400);
    await clickOnCanvas(page, 600, 600);
    await takeEditorScreenshot(page);
    await selectRectangleSelectionTool(page);
    await clickOnCanvas(page, 200, 200);
    await waitForRender(page, async () => {
      await hoverOverArrowSpine(page, 0);
    });
    await dragMouseTo(400, 200, page);
    await clickOnCanvas(page, 400, 400);
    await waitForRender(page, async () => {
      await hoverOverArrowSpine(page, 1);
    });
    await dragMouseTo(600, 400, page);
    await clickOnCanvas(page, 600, 600);
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
    Description: Three Multi-Tailed Arrows with default size (spine-2.5, tail-0.4, head-0.8) added to different selected places on 
    Canvas (with previously added elements) one by one using "Multi-Tailed Arrow Tool" button and they selected and moved together with 
    elements and separately to other places on Canvas with correct sizes and positions.
    */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickOnCanvas(page, 200, 200);
    await clickOnCanvas(page, 800, 200);
    await clickOnCanvas(page, 800, 300);
    await selectRing(RingButton.Benzene, page);
    await clickOnCanvas(page, 300, 300);
    await takeEditorScreenshot(page);
    await selectRectangleSelectionTool(page);
    await clickOnCanvas(page, 200, 200);
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
    Description: Loaded from .ket file and added to selected place on Canvas 3 different Multi-Tailed Arrows with elements selected and 
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
    Description: Movement actions Undo/Redo for loaded from KET Multi-Tailed Arrows on Canvas with other elements.
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
    Description: Movement actions Undo/Redo for added by Tool Multi-Tailed Arrows on Canvas with other elements.
    */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickOnCanvas(page, 200, 200);
    await clickOnCanvas(page, 800, 200);
    await clickOnCanvas(page, 800, 300);
    await selectRing(RingButton.Benzene, page);
    await clickOnCanvas(page, 300, 300);
    await takeEditorScreenshot(page);
    await selectRectangleSelectionTool(page);
    await clickOnCanvas(page, 200, 200);
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
    Description: Load from KET Multi-Tailed Arrow with two tails and spine length = 0.7, only one tail to the middle 
    added using "Add new tail" option in menu, after that "Add new tail" option is disabled when right-clicking on tails/head/spine, 
    after that changed Multi-Tailed Arrow saved to KET with the correct coordinates of spine, tails and head.
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
    Description: Load from KET Multi-Tailed Arrow with two tails and  0.7 < spine length < 1.4, only one tail to the middle 
    added using "Add new tail" option in menu, after that "Add new tail" option is disabled when right-clicking on tails/head/spine, 
    after that changed Multi-Tailed Arrow saved to KET with the correct coordinates of spine, tails and head.
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
    the third to the bottom half) added using "Add new tail" option in menu, after that "Add new tail" option is disabled when right-clicking on tails/head/spine, 
    after that changed Multi-Tailed Arrow saved to KET with the correct coordinates of spine, tails and head.
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
    (3 to small, 1 to medium, 6 to large) added to each Multi-Tailed Arrow, after that they saved to KET with the correct coordinates of spines, tails and heads.
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

  test('Load from KET 3 different Multi-Tailed Arrows with elements, verify that tails can be added to each Multi-Tailed Arrow, after that they can be saved to KET', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5056
    Description: Load from KET 3 different Multi-Tailed Arrows with elements (small with two tails, medium with 4 tails, large with 3 tails), verify that tails 
    (3 to small, 1 to medium, 6 to large) added to each Multi-Tailed Arrow, after that they saved to KET with the correct coordinates of spines, tails and heads.
    */

    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrows-3-with-elements.ket',
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
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/multi-tailed-arrows-3-with-elements-expected.ket',
      'tests/test-data/KET/multi-tailed-arrows-3-with-elements-expected.ket',
    );
  });

  test('Load from KET Multi-Tailed Arrow with three tails and spine length = 0.7, verify that top and bottom tails can not be removed, only middle tail can be removed', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5056
    Description: Load from KET Multi-Tailed Arrow with three tails and spine length = 0.7, verify that top and bottom tails can't be removed, 
    only middle tail removed using "Remove tail" option in menu after right-click on middle tail, after that "Remove tail" option isn't 
    in menu and changed Multi-Tailed Arrow saved to KET with the correct coordinates of spine, tails and head.
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-3-tails-spine-0.7.ket',
      page,
    );
    await clickInTheMiddleOfTheScreen(page);
    await page
      .getByTestId('bottomTail-resize')
      .click({ force: true, button: 'right' });
    await takeEditorScreenshot(page);
    await clickOnCanvas(page, 200, 200);
    await page
      .getByTestId('topTail-resize')
      .click({ force: true, button: 'right' });
    await takeEditorScreenshot(page);
    await clickOnCanvas(page, 200, 200);
    await removeTail(page, 'tails-0-move');
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/multi-tailed-arrow-2-tails-spine-0.7-expected.ket',
      'tests/test-data/KET/multi-tailed-arrow-2-tails-spine-0.7-expected.ket',
    );
  });

  test('Load from KET Multi-Tailed Arrow with five tails and spine length = 1.4, verify that top and bottom tails can not be removed, only 3 middle tails can be removed', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5056
    Description: Load from KET Multi-Tailed Arrow with five tails and spine length = 1.4, verify that top and bottom tails can't be removed, only 3 
    middle tails removed using "Remove tail" option in menu after right-click on each tail, after that changed Multi-Tailed Arrow 
    saved to KET with the correct coordinates of spine, tails and head.
    */
    const tailIds = ['tails-0-move', 'tails-1-move', 'tails-2-move'];
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-5-tails-spine-1.4-new.ket',
      page,
    );
    await clickInTheMiddleOfTheScreen(page);
    await page
      .getByTestId('bottomTail-resize')
      .click({ force: true, button: 'right' });
    await takeEditorScreenshot(page);
    await clickOnCanvas(page, 200, 200);
    await page
      .getByTestId('topTail-resize')
      .click({ force: true, button: 'right' });
    await takeEditorScreenshot(page);
    await clickOnCanvas(page, 200, 200);
    await clickInTheMiddleOfTheScreen(page);
    for (const tailId of tailIds) {
      await clickInTheMiddleOfTheScreen(page);
      await removeTail(page, tailId);
    }
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/multi-tailed-arrow-5-tails-spine-1.4-new-expected.ket',
      'tests/test-data/KET/multi-tailed-arrow-5-tails-spine-1.4-new-expected.ket',
    );
  });

  test('Load from KET 3 different Multi-Tailed Arrows, verify that tails can be removed from each Multi-Tailed Arrow, after that they can be saved to KET', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5056
    Description: Load from KET 3 different Multi-Tailed Arrows (small with two tails, medium with 4 tails, large with 3 tails), 
    verify that tails (0 from small, 2 from medium, 1 from large) removed from each Multi-Tailed Arrow, after that they saved to 
    KET with the correct coordinates of spines, tails and heads.
    */

    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrows-3.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await removeTail(page, 'tails-0-resize');
    await selectPartOfMolecules(page);
    await removeTail(page, 'tails-0-resize');
    await removeTail(page, 'tails-1-resize');
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/multi-tailed-arrows-3-removed-tails-expected.ket',
      'tests/test-data/KET/multi-tailed-arrows-3-removed-tails-expected.ket',
    );
  });

  test('Load from KET 3 different Multi-Tailed Arrows with elements, verify that tails can be removed from each Multi-Tailed Arrow, after that they can be saved to KET', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5056
    Description: Load from KET 3 different Multi-Tailed Arrows with elements (small with two tails, medium with 4 tails, large with 3 tails), 
    verify that tails (0 from small, 2 from medium, 1 from large) removed from each Multi-Tailed Arrow, after that they saved to 
    KET with the correct coordinates of spines, tails and heads.
    */

    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrows-3-with-elements.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await removeTail(page, 'tails-0-resize');
    await selectPartOfMolecules(page);
    await removeTail(page, 'tails-0-move');
    await removeTail(page, 'tails-1-move');
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/multi-tailed-arrows-3-with-elements-removed-tails-expected.ket',
      'tests/test-data/KET/multi-tailed-arrows-3-with-elements-removed-tails-expected.ket',
    );
  });

  test('Load from KET Multi-Tailed Arrow with five tails and spine length = 2.1, verify that new tails can not be added and "Add new tail" option is disabled', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5056
    Description: Load from KET Multi-Tailed Arrow with five tails and spine length = 2.1, verify that new tails can't be added and "Add new tail" option is 
    disabled, after that remove two tails (2 and 3 or 3 and 4) using "Remove tail", make sure that 3 more tails added using "Add new tail", after that 
    changed Multi-Tailed Arrow with 6 tails saved to KET with the correct coordinates of spine, tails and head.
    */

    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-5-tails-spine-2.1.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await removeTail(page, 'tails-0-move');
    await removeTail(page, 'tails-1-move');
    await takeEditorScreenshot(page);
    for (let i = 0; i < 3; i++) {
      await clickInTheMiddleOfTheScreen(page);
      await hoverOverArrowSpine(page, 0, 'right');
      await page.getByText('Add new tail').click();
    }
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/multi-tailed-arrow-5-tails-spine-2.1-expected.ket',
      'tests/test-data/KET/multi-tailed-arrow-5-tails-spine-2.1-expected.ket',
    );
  });

  test('Verify that Undo/Redo actions can be performed for added from KET Multi-Tailed Arrow with two tails and spine length = 1.4 after adding/removing of tails', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5056
    Description: Undo/Redo actions performed for added from KET Multi-Tailed Arrow with two tails and spine 
    length = 1.4 after adding/removing of tails.
    */

    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-2-tails-1.ket',
      page,
    );
    await takeEditorScreenshot(page);
    for (let i = 0; i < 3; i++) {
      await clickInTheMiddleOfTheScreen(page);
      await hoverOverArrowSpine(page, 0, 'right');
      await page.getByText('Add new tail').click();
    }
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await removeTail(page, 'tails-0-move');
    await removeTail(page, 'tails-1-move');
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that Undo/Redo actions can be performed for added from KET 3 different Multi-Tailed Arrows on Canvas with elements after adding/removing of tails', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5056
    Description: Undo/Redo actions performed for added from KET 3 different Multi-Tailed Arrows on Canvas with elements after 
    adding/removing of tails.
    */

    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrows-3-with-elements.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await removeTail(page, 'tails-0-resize');
    await selectPartOfMolecules(page);
    await removeTail(page, 'tails-0-move');
    await removeTail(page, 'tails-1-move');
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await selectTopPanelButton(TopPanelButton.Redo, page);
    }
    await takeEditorScreenshot(page);
  });

  test('Verify that Copy-Paste (Ctrl+C, Ctrl+V) can be performed for loaded from KET 3 different Multi-Tailed Arrow after adding of tails and removing of tails', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5056
    Description: Copy-Paste (Ctrl+C, Ctrl+V) actions performed for loaded from KET 
    3 different Multi-Tailed Arrow after adding of tails and removing of tails with correct quantity of tails.
    */

    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrows-3.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await removeTail(page, 'tails-0-resize');
    await selectPartOfMolecules(page);
    await removeTail(page, 'tails-0-resize');
    await removeTail(page, 'tails-1-resize');
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, 300, 300);
    await takeEditorScreenshot(page);
  });

  test('Verify that Cut-Paste (Ctrl+X, Ctrl+V) can be performed for loaded from KET 3 different Multi-Tailed Arrow after adding of tails and removing of tails', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5056
    Description: Cut-Paste (Ctrl+X, Ctrl+V) actions performed for loaded from KET 
    3 different Multi-Tailed Arrow after adding of tails and removing of tails with correct quantity of tails.
    */

    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrows-3.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await removeTail(page, 'tails-0-resize');
    await selectPartOfMolecules(page);
    await removeTail(page, 'tails-0-resize');
    await removeTail(page, 'tails-1-resize');
    await takeEditorScreenshot(page);
    await cutAndPaste(page);
    await clickOnCanvas(page, 300, 300);
    await takeEditorScreenshot(page);
  });

  test('Using "Multi-Tailed Arrow Tool" button, add 3 default Multi-Tailed Arrow to Canvas, add 1 tail to the first one, 2 tails to the second and 3 to the third', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5056
     * Description: Using "Multi-Tailed Arrow Tool" button, add 3 default Multi-Tailed Arrow to Canvas, add 1 tail to the first one, 2 tails to the second
     * and 3 to the third, verify that these 3 Multi-Tailed Arrows saved to KET with the correct coordinates of spines, tails and heads.
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickOnCanvas(page, 300, 400);
    await clickOnCanvas(page, 500, 600);
    await clickOnCanvas(page, 700, 500);

    await selectRectangleSelectionTool(page);
    await addTail(page, 300, 400);

    await addTail(page, 500, 600);
    await addTail(page, 500, 600);

    await addTail(page, 700, 500);
    await addTail(page, 700, 500);
    await addTail(page, 700, 500);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/three-reaction-arrow-with-added-tails-to-compare.ket',
      'tests/test-data/KET/three-reaction-arrow-with-added-tails-to-compare.ket',
    );
  });

  test('Using "Multi-Tailed Arrow Tool" button, add 3 default Multi-Tailed Arrow to Canvas, add 1 tail to first one, 2 tails to second and 3 to third', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5056
     * Description: Using "Multi-Tailed Arrow Tool" button, add 2 default Multi-Tailed Arrow to Canvas, add 3 tails to each arrow,
     * remove 1 middle tail for the first and 2 tails for the second, verify that these 2 Multi-Tailed Arrows saved to KET
     * with the correct coordinates of spines, tails and heads.
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickOnCanvas(page, 300, 400);
    await clickOnCanvas(page, 500, 600);

    await selectRectangleSelectionTool(page);
    await addTail(page, 300, 400);
    await addTail(page, 300, 400);
    await addTail(page, 300, 400);

    await addTail(page, 500, 600);
    await addTail(page, 500, 600);
    await addTail(page, 500, 600);
    await takeEditorScreenshot(page);

    await clickOnCanvas(page, 300, 400);
    await removeTail(page, 'tails-0-move');

    await clickOnCanvas(page, 500, 600);
    await removeTail(page, 'tails-0-move');
    await removeTail(page, 'tails-1-move', 1);

    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/two-reaction-arrow-with-removed-tails-to-compare.ket',
      'tests/test-data/KET/two-reaction-arrow-with-removed-tails-to-compare.ket',
    );
  });

  test('Using "Multi-Tailed Arrow Tool" button, add 1 default Multi-Tailed Arrow to Canvas, verify that 3 tails can be added using "Add new tail"', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5056
     * Description: Using "Multi-Tailed Arrow Tool" button, add 1 default Multi-Tailed Arrow to Canvas, verify that 3 tails added using "Add new tail" (5 are in total),
     *  remove two tails (2 and 3 or 3 and 4) using "Remove tail", make sure that 3 more tails added using "Add new tail", after that changed Multi-Tailed Arrow
     *  with 6 tails saved to KET with the correct coordinates of spine, tails and head.
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickOnCanvas(page, 300, 400);

    await selectRectangleSelectionTool(page);
    await addTail(page, 300, 400);
    await addTail(page, 300, 400);
    await addTail(page, 300, 400);
    await takeEditorScreenshot(page);

    await clickOnCanvas(page, 300, 400);
    await removeTail(page, 'tails-0-move');
    await removeTail(page, 'tails-1-move');
    await takeEditorScreenshot(page);

    await addTail(page, 300, 400);
    await addTail(page, 300, 400);
    await addTail(page, 300, 400);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/one-reaction-arrow-with-six-tails-to-compare.ket',
      'tests/test-data/KET/one-reaction-arrow-with-six-tails-to-compare.ket',
    );
  });

  test('Verify that Undo/Redo actions can be performed for added by Tool 1 default Multi-Tailed Arrow with two tails after adding/removing of tails', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5056
     * Description: Undo/Redo actions performed for added by Tool 1 default Multi-Tailed Arrow with two tails after adding/removing of tails.
     * After Undo, the tails don't return to their original positions. After fixing the bug, the screenshot needs to be updated.
     * A bug has been logged: https://github.com/epam/ketcher/issues/5548
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickOnCanvas(page, 300, 400);

    await selectRectangleSelectionTool(page);
    await addTail(page, 300, 400);
    await addTail(page, 300, 400);
    await addTail(page, 300, 400);
    await takeEditorScreenshot(page);

    await clickOnCanvas(page, 300, 400);
    await removeTail(page, 'tails-0-move');
    await removeTail(page, 'tails-1-move');
    await takeEditorScreenshot(page);

    for (let i = 0; i < 2; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await selectTopPanelButton(TopPanelButton.Redo, page);
    }
    await takeEditorScreenshot(page);
  });

  test('Verify that Undo/Redo actions can be performed for added by Tool 3 default Multi-Tailed Arrows after adding/removing of tails', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5056
     * Description: Verify that Undo/Redo actions performed for added by Tool 3 default Multi-Tailed Arrows after adding/removing of tails.
     * After Undo, the tails don't return to their original positions. After fixing the bug, the screenshot needs to be updated.
     * A bug has been logged: https://github.com/epam/ketcher/issues/5548
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickOnCanvas(page, 300, 400);
    await clickOnCanvas(page, 500, 600);
    await clickOnCanvas(page, 700, 500);

    await selectRectangleSelectionTool(page);
    await addTail(page, 300, 400);

    await addTail(page, 500, 600);
    await addTail(page, 500, 600);

    await addTail(page, 700, 500);
    await addTail(page, 700, 500);
    await addTail(page, 700, 500);
    await takeEditorScreenshot(page);

    await clickOnCanvas(page, 700, 500);
    await removeTail(page, 'tails-0-move');
    await removeTail(page, 'tails-1-move');
    await takeEditorScreenshot(page);

    for (let i = 0; i < 2; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await selectTopPanelButton(TopPanelButton.Redo, page);
    }
    await takeEditorScreenshot(page);
  });

  test('Verify that Copy-Paste (Ctrl+C, Ctrl+V) actions can be performed for added by Tool default Multi-Tailed Arrow after adding of tails and removing of tails', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5056
     * Description: Copy-Paste (Ctrl+C, Ctrl+V) actions performed for added by Tool default Multi-Tailed Arrow
     * after adding of tails and removing of tails with correct quantity of tails.
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickOnCanvas(page, 300, 400);

    await selectRectangleSelectionTool(page);
    await addTail(page, 300, 400);
    await addTail(page, 300, 400);
    await addTail(page, 300, 400);
    await takeEditorScreenshot(page);

    await clickOnCanvas(page, 300, 400);
    await removeTail(page, 'tails-0-move');
    await removeTail(page, 'tails-1-move');
    await takeEditorScreenshot(page);

    await copyAndPaste(page);
    await clickOnCanvas(page, 500, 400);
    await takeEditorScreenshot(page);
  });

  test('Verify that Cut-Paste (Ctrl+X, Ctrl+V) actions can be performed for added by Tool default Multi-Tailed Arrow after adding of tails and removing of tails', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5056
     * Description: Cut-Paste (Ctrl+X, Ctrl+V) actions performed for added by Tool default Multi-Tailed Arrow
     * after adding of tails and removing of tails with correct quantity of tails.
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickOnCanvas(page, 300, 400);

    await selectRectangleSelectionTool(page);
    await addTail(page, 300, 400);
    await addTail(page, 300, 400);
    await addTail(page, 300, 400);
    await takeEditorScreenshot(page);

    await clickOnCanvas(page, 300, 400);
    await removeTail(page, 'tails-0-move');
    await removeTail(page, 'tails-1-move');
    await takeEditorScreenshot(page);

    await cutAndPaste(page);
    await clickOnCanvas(page, 500, 400);
    await takeEditorScreenshot(page);
  });

  test('Verify that loaded from KET Multi-Tailed Arrow after adding/removing of tails can be selected and moved with correct size and position of spine, tails and head', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5056
     * Description: Loaded from KET Multi-Tailed Arrow after adding/removing of tails selected and moved with correct size and position of spine, tails and head.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-2-tails-1.ket',
      page,
    );
    await clickInTheMiddleOfTheScreen(page, 'right');
    await page.getByText('Add new tail').click();
    await clickInTheMiddleOfTheScreen(page, 'right');
    await page.getByText('Add new tail').click();
    await takeEditorScreenshot(page);

    await clickInTheMiddleOfTheScreen(page, 'right');
    await page.getByText('Remove tail').click();
    await takeEditorScreenshot(page);

    await clickInTheMiddleOfTheScreen(page);
    await dragMouseTo(200, 500, page);
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool Multi-Tailed Arrow after adding/removing of tails can be selected and moved with correct size and position of spine, tails and head', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5056
     * Description: Added by Tool Multi-Tailed Arrow after adding/removing of tails selected and moved
     * with correct size and position of spine, tails and head.
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);

    await clickInTheMiddleOfTheScreen(page, 'right');
    await page.getByText('Add new tail').click();
    await clickInTheMiddleOfTheScreen(page, 'right');
    await page.getByText('Add new tail').click();
    await takeEditorScreenshot(page);

    await clickInTheMiddleOfTheScreen(page);
    await removeTail(page, 'tails-0-move');
    await takeEditorScreenshot(page);

    await clickInTheMiddleOfTheScreen(page);
    await hoverOverArrowSpine(page, 0);
    await dragMouseTo(200, 500, page);
    await takeEditorScreenshot(page);
  });

  test('Load from KET default Multi-Tailed Arrow, verify that head arrow can be moved up to 0.15 from the edge, after that changed Multi-Tailed Arrow can be saved to KET', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5058
     * Description: Load from KET default Multi-Tailed Arrow, head arrow moved up to 0.15 from the edge, after that changed
     * Multi-Tailed Arrow saved to KET with the correct coordinates of spine, tails and head.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-default.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('head-move').hover({ force: true });
    await dragMouseTo(500, 300, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/multi-tailed-arrow-default-head-up-expected.ket',
      'tests/test-data/KET/multi-tailed-arrow-default-head-up-expected.ket',
    );
  });

  test('Load KET default Multi-Tailed Arrow, verify that head arrow can be moved down to 0.15 from the edge, after that changed Multi-Tailed Arrow can be saved to KET', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5058
     * Description: Load from KET default Multi-Tailed Arrow, head arrow moved down to 0.15 from the edge, after that changed
     * Multi-Tailed Arrow saved to KET with the correct coordinates of spine, tails and head.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-default.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('head-move').hover({ force: true });
    await dragMouseTo(500, 600, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/multi-tailed-arrow-default-head-down-expected.ket',
      'tests/test-data/KET/multi-tailed-arrow-default-head-down-expected.ket',
    );
  });

  test('KET default Multi-Tailed Arrow, verify that size of head arrow can be reduced to left (minimal size is 0.5), changed Multi-Tailed Arrow can be saved to KET', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5058
     * Description: Load from KET default Multi-Tailed Arrow, verify that size of head arrow reduced to left (minimal size is 0.5),
     * after that changed Multi-Tailed Arrow saved to KET with the correct coordinates of spine, tails and head.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-default.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('head-resize').hover({ force: true });
    await dragMouseTo(200, 500, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/multi-tailed-arrow-default-head-minimal-size-expected.ket',
      'tests/test-data/KET/multi-tailed-arrow-default-head-minimal-size-expected.ket',
    );
  });

  test('KET default Multi-Tailed Arrow, verify that size of head arrow can be increased to right, changed Multi-Tailed Arrow can be saved to KET', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5058
     * Description: Load from KET default Multi-Tailed Arrow, verify that size of head arrow increased to right,
     * after that changed Multi-Tailed Arrow saved to KET with the correct coordinates of spine, tails and head.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-default.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('head-resize').hover({ force: true });
    await dragMouseTo(800, 500, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/multi-tailed-arrow-default-head-increase-size-expected.ket',
      'tests/test-data/KET/multi-tailed-arrow-default-head-increase-size-expected.ket',
    );
  });

  test('Using "Multi-Tailed Arrow Tool" button, add default Multi-Tailed Arrow, verify that head arrow can be moved up to 0.15 from edge, after that can be saved to KET', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5058
     * Description: Using "Multi-Tailed Arrow Tool" button, add default Multi-Tailed Arrow, verify that head arrow moved up to 0.15 from the edge,
     * after that changed Multi-Tailed Arrow saved to KET with the correct coordinates of spine, tails and head.
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('head-move').hover({ force: true });
    await dragMouseTo(500, 200, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/button-added-multi-tailed-arrow-default-head-up-expected.ket',
      'tests/test-data/KET/button-added-multi-tailed-arrow-default-head-up-expected.ket',
    );
  });

  test('Using "Multi-Tailed Arrow Tool" button, add default Multi-Tailed Arrow, verify that head arrow can be moved down up to 0.15 from edge, and can be saved to KET', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5058
     * Description: Using "Multi-Tailed Arrow Tool" button, add default Multi-Tailed Arrow, verify that head arrow moved down up to 0.15 from the edge,
     * after that changed Multi-Tailed Arrow saved to KET with the correct coordinates of spine, tails and head.
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('head-move').hover({ force: true });
    await dragMouseTo(500, 600, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/button-added-multi-tailed-arrow-default-head-down-expected.ket',
      'tests/test-data/KET/button-added-multi-tailed-arrow-default-head-down-expected.ket',
    );
  });

  test('Using "Multi-Tailed Arrow Tool" button, add Multi-Tailed Arrow, verify that size of head arrow can be reduced to left (minimal size is 0.5), after saved to KET', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5058
     * Description: Using "Multi-Tailed Arrow Tool" button, add default Multi-Tailed Arrow, verify that size of head arrow reduced to left (minimal size is 0.5),
     * after that changed Multi-Tailed Arrow saved to KET with the correct coordinates of spine, tails and head.
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('head-resize').hover({ force: true });
    await dragMouseTo(200, 500, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/button-added-multi-tailed-arrow-default-head-minimal-size-expected.ket',
      'tests/test-data/KET/button-added-multi-tailed-arrow-default-head-minimal-size-expected.ket',
    );
  });

  test('Using "Multi-Tailed Arrow Tool" button, add default Multi-Tailed Arrow, verify that size of head arrow can be increased to right, after that can be saved to KET', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5058
     * Description: Using "Multi-Tailed Arrow Tool" button, add default Multi-Tailed Arrow, verify that size of head arrow increased to right,
     * after that changed Multi-Tailed Arrow saved to KET with the correct coordinates of spine, tails and head.
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('head-resize').hover({ force: true });
    await dragMouseTo(800, 500, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/button-added-multi-tailed-arrow-default-head-increase-size-expected.ket',
      'tests/test-data/KET/button-added-multi-tailed-arrow-default-head-increase-size-expected.ket',
    );
  });

  test('Load from KET 3 different Multi-Tailed Arrows to Canvas with elements and verify that head arrow can be moved and its size can be changed for each of them', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5058
    Description: Load from KET 3 different Multi-Tailed Arrows to Canvas with elements and verify that head arrow moved and its size 
    changed for each of them, after that changed Multi-Tailed Arrows and elements saved to KET with the correct coordinates of spines, tails and heads.
    */

    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrows-3-with-elements.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('head-move').hover({ force: true });
    await dragMouseTo(500, 600, page);
    await page.getByTestId('head-resize').hover({ force: true });
    await dragMouseTo(900, 500, page);

    await selectPartOfMolecules(page);
    await page.getByTestId('head-move').nth(2).hover({ force: true });
    await dragMouseTo(500, 600, page);
    await page.getByTestId('head-resize').nth(2).hover({ force: true });
    await dragMouseTo(900, 500, page);

    await page.getByTestId('head-move').first().hover({ force: true });
    await dragMouseTo(300, 600, page);
    await page.getByTestId('head-resize').first().hover({ force: true });
    await dragMouseTo(900, 500, page);
    await takeEditorScreenshot(page);
    await clickOnCanvas(page, 200, 200);
    await verifyFile(
      page,
      'KET/multi-tailed-arrows-3-with-elements-moved-and-resized-heads-expected.ket',
      'tests/test-data/KET/multi-tailed-arrows-3-with-elements-moved-and-resized-heads-expected.ket',
    );
  });

  test('Using "Multi-Tailed Arrow Tool" button, add 3 different Multi-Tailed Arrows, verify that head arrow can be moved and its size can be changed for each of them', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5058
    Description: Using "Multi-Tailed Arrow Tool" button, add 3 different Multi-Tailed Arrows, verify that head arrow moved 
    and its size can be changed for each of them, after that changed Multi-Tailed Arrows saved to KET with the correct coordinates of spines, tails and heads.
    */

    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await clickOnCanvas(page, 300, 400);
    await clickOnCanvas(page, 400, 500);

    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('head-move').hover({ force: true });
    await dragMouseTo(500, 600, page);
    await page.getByTestId('head-resize').hover({ force: true });
    await dragMouseTo(900, 500, page);

    await selectRectangleSelectionTool(page);
    await selectPartOfMolecules(page);
    await page.getByTestId('head-move').nth(1).hover({ force: true });
    await dragMouseTo(500, 600, page);
    await page.getByTestId('head-resize').nth(1).hover({ force: true });
    await dragMouseTo(900, 500, page);

    await page.getByTestId('head-move').nth(2).hover({ force: true });
    await dragMouseTo(300, 600, page);
    await page.getByTestId('head-resize').nth(2).hover({ force: true });
    await dragMouseTo(900, 500, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/button-added-multi-tailed-arrows-3-with-elements-moved-and-resized-heads-expected.ket',
      'tests/test-data/KET/button-added-multi-tailed-arrows-3-with-elements-moved-and-resized-heads-expected.ket',
    );
  });

  test('Verify that Undo/Redo actions can be performed for added from KET default Multi-Tailed Arrow after moving/changing size of head ', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5058
     * Description: Verify that Undo/Redo actions performed for added from KET default Multi-Tailed Arrow after moving/changing size of head .
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-default.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('head-move').hover({ force: true });
    await dragMouseTo(500, 600, page);
    await page.getByTestId('head-resize').hover({ force: true });
    await dragMouseTo(900, 500, page);
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await selectTopPanelButton(TopPanelButton.Redo, page);
    }
    await takeEditorScreenshot(page);
  });

  test('Verify that Undo/Redo actions can be performed for added from KET 3 different Multi-Tailed Arrows on Canvas with elements after moving/changing size of heads', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5058
    Description: Undo/Redo actions performed for added from KET 3 different Multi-Tailed Arrows on 
    Canvas with elements after moving/changing size of heads.
    */

    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrows-3-with-elements.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('head-move').hover({ force: true });
    await dragMouseTo(500, 600, page);
    await page.getByTestId('head-resize').hover({ force: true });
    await dragMouseTo(900, 500, page);

    await selectPartOfMolecules(page);
    await page.getByTestId('head-move').nth(2).hover({ force: true });
    await dragMouseTo(500, 600, page);
    await page.getByTestId('head-resize').nth(2).hover({ force: true });
    await dragMouseTo(900, 500, page);

    await page.getByTestId('head-move').first().hover({ force: true });
    await dragMouseTo(300, 600, page);
    await page.getByTestId('head-resize').first().hover({ force: true });
    await dragMouseTo(900, 500, page);
    await takeEditorScreenshot(page);
    for (let i = 0; i < 6; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 6; i++) {
      await selectTopPanelButton(TopPanelButton.Redo, page);
    }
    await takeEditorScreenshot(page);
  });

  test('Verify that Copy-Paste (Ctrl+C, Ctrl+V) actions can be performed for loaded from KET 3 different Multi-Tailed Arrow after moving/changing size of head', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5058
    Description: Copy-Paste (Ctrl+C, Ctrl+V) actions performed for loaded from KET 3 
    different Multi-Tailed Arrow after moving/changing size of head.
    */

    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrows-3.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('head-move').hover({ force: true });
    await dragMouseTo(500, 600, page);
    await page.getByTestId('head-resize').hover({ force: true });
    await dragMouseTo(900, 500, page);

    await selectPartOfMolecules(page);
    await page.getByTestId('head-move').nth(1).hover({ force: true });
    await dragMouseTo(500, 600, page);
    await page.getByTestId('head-resize').nth(1).hover({ force: true });
    await dragMouseTo(900, 500, page);

    await page.getByTestId('head-resize').nth(2).hover({ force: true });
    await dragMouseTo(300, 600, page);
    await takeEditorScreenshot(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, 750, 600);
    await takeEditorScreenshot(page);
  });

  test('Verify that Cut-Paste (Ctrl+X, Ctrl+V) actions can be performed for loaded from KET 3 different Multi-Tailed Arrow after moving/changing size of head', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5058
    Description: Cut-Paste (Ctrl+X, Ctrl+V) actions performed for loaded from KET 3 
    different Multi-Tailed Arrow after moving/changing size of head.
    */

    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrows-3.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('head-move').hover({ force: true });
    await dragMouseTo(500, 600, page);
    await page.getByTestId('head-resize').hover({ force: true });
    await dragMouseTo(900, 500, page);

    await selectPartOfMolecules(page);
    await page.getByTestId('head-move').nth(1).hover({ force: true });
    await dragMouseTo(500, 600, page);
    await page.getByTestId('head-resize').nth(1).hover({ force: true });
    await dragMouseTo(900, 500, page);

    await page.getByTestId('head-resize').nth(2).hover({ force: true });
    await dragMouseTo(300, 600, page);
    await takeEditorScreenshot(page);
    await cutAndPaste(page);
    await clickOnCanvas(page, 750, 600);
    await takeEditorScreenshot(page);
  });

  test('Verify that loaded from KET Multi-Tailed Arrow after moving/changing size of head can be selected and moved to new position', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5058
     * Description: Loaded from KET Multi-Tailed Arrow after moving/changing size of head selected and moved with correct size and position of spine, tails and head.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-default.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('head-move').hover({ force: true });
    await dragMouseTo(500, 600, page);
    await page.getByTestId('head-resize').hover({ force: true });
    await dragMouseTo(900, 500, page);
    await takeEditorScreenshot(page);
    await waitForRender(page, async () => {
      await hoverOverArrowSpine(page, 0);
    });
    await dragMouseTo(400, 200, page);
    await takeEditorScreenshot(page);
  });

  test('Verify that Undo/Redo actions can be performed for added by Tool default Multi-Tailed Arrow after moving/changing size of head', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5058
     * Description: Undo/Redo actions performed for added by Tool default Multi-Tailed Arrow after moving/changing size of head.
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('head-move').hover({ force: true });
    await dragMouseTo(500, 600, page);
    await page.getByTestId('head-resize').hover({ force: true });
    await dragMouseTo(900, 500, page);
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await selectTopPanelButton(TopPanelButton.Redo, page);
    }
    await takeEditorScreenshot(page);
  });

  test('Verify that Undo/Redo actions can be performed for added by Tool 3 default Multi-Tailed Arrows after moving/changing size of heads', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5058
    Description: Undo/Redo actions performed for added by Tool 3 default Multi-Tailed Arrows after moving/changing size of heads.
    */

    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await clickOnCanvas(page, 300, 400);
    await clickOnCanvas(page, 400, 500);

    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('head-move').hover({ force: true });
    await dragMouseTo(500, 600, page);
    await page.getByTestId('head-resize').hover({ force: true });
    await dragMouseTo(900, 500, page);

    await selectRectangleSelectionTool(page);
    await selectPartOfMolecules(page);
    await page.getByTestId('head-move').nth(1).hover({ force: true });
    await dragMouseTo(500, 600, page);
    await page.getByTestId('head-resize').nth(1).hover({ force: true });
    await dragMouseTo(900, 500, page);

    await page.getByTestId('head-move').nth(2).hover({ force: true });
    await dragMouseTo(300, 600, page);
    await page.getByTestId('head-resize').nth(2).hover({ force: true });
    await dragMouseTo(900, 500, page);
    await takeEditorScreenshot(page);
    for (let i = 0; i < 6; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 6; i++) {
      await selectTopPanelButton(TopPanelButton.Redo, page);
    }
    await takeEditorScreenshot(page);
  });

  test('Verify that Copy-Paste (Ctrl+C, Ctrl+V) actions can be performed for added by Tool 3 different Multi-Tailed Arrow after moving/changing size of head', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5058
    Description: Copy-Paste (Ctrl+C, Ctrl+V) actions performed for added 
    by Tool 3 different Multi-Tailed Arrow after moving/changing size of head.
    */

    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await clickOnCanvas(page, 300, 400);
    await clickOnCanvas(page, 400, 500);

    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('head-move').hover({ force: true });
    await dragMouseTo(500, 600, page);
    await page.getByTestId('head-resize').hover({ force: true });
    await dragMouseTo(900, 500, page);

    await selectRectangleSelectionTool(page);
    await selectPartOfMolecules(page);
    await page.getByTestId('head-move').nth(1).hover({ force: true });
    await dragMouseTo(500, 600, page);
    await page.getByTestId('head-resize').nth(1).hover({ force: true });
    await dragMouseTo(900, 500, page);

    await page.getByTestId('head-move').nth(2).hover({ force: true });
    await dragMouseTo(300, 600, page);
    await page.getByTestId('head-resize').nth(2).hover({ force: true });
    await dragMouseTo(900, 500, page);
    await takeEditorScreenshot(page);

    await copyAndPaste(page);
    await clickOnCanvas(page, 650, 300);
    await takeEditorScreenshot(page);
  });

  test('Verify that Cut-Paste (Ctrl+X, Ctrl+V) actions can be performed for added by Tool 3 different Multi-Tailed Arrow after moving/changing size of head', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5058
    Description: Cut-Paste (Ctrl+X, Ctrl+V) actions performed for added 
    by Tool 3 different Multi-Tailed Arrow after moving/changing size of head.
    */

    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await clickOnCanvas(page, 300, 400);
    await clickOnCanvas(page, 400, 500);

    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('head-move').hover({ force: true });
    await dragMouseTo(500, 600, page);
    await page.getByTestId('head-resize').hover({ force: true });
    await dragMouseTo(900, 500, page);

    await selectRectangleSelectionTool(page);
    await selectPartOfMolecules(page);
    await page.getByTestId('head-move').nth(1).hover({ force: true });
    await dragMouseTo(500, 600, page);
    await page.getByTestId('head-resize').nth(1).hover({ force: true });
    await dragMouseTo(900, 500, page);

    await page.getByTestId('head-move').nth(2).hover({ force: true });
    await dragMouseTo(300, 600, page);
    await page.getByTestId('head-resize').nth(2).hover({ force: true });
    await dragMouseTo(900, 500, page);
    await takeEditorScreenshot(page);

    await cutAndPaste(page);
    await clickOnCanvas(page, 900, 400);
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool Multi-Tailed Arrow after moving/changing size of head can be selected and moved with correct size and position of spine, tails and head', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5058
    Description: Added by Tool Multi-Tailed Arrow after moving/changing size of head selected and moved with correct size and position of spine, tails and head.
    */

    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);

    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('head-move').hover({ force: true });
    await dragMouseTo(500, 600, page);
    await page.getByTestId('head-resize').hover({ force: true });
    await dragMouseTo(900, 500, page);

    await hoverOverArrowSpine(page);
    await dragMouseTo(300, 300, page);
    await takeEditorScreenshot(page);
  });

  test('Load from KET default Multi-Tailed Arrow, verify that top tail can be moved up and bottom tail can be moved down, after that can be saved to KET', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5107
     * Description: Load from KET default Multi-Tailed Arrow, verify that top tail moved up and bottom tail moved down,
     * after that changed Multi-Tailed Arrow saved to KET with the correct coordinates of spine, tails and head.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-default.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('topTail-move').hover({ force: true });
    await dragMouseTo(500, 200, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('bottomTail-move').hover({ force: true });
    await dragMouseTo(500, 600, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/moved-toptail-and-bottomtail-expected.ket',
      'tests/test-data/KET/moved-toptail-and-bottomtail-expected.ket',
    );
  });

  test('Load from KET default Multi-Tailed Arrow, verify that top tail can be moved down up to 0.15 from head arrow and bottom tail can be moved up to 0.5 from top tail', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5107
     * Description: Load from KET default Multi-Tailed Arrow, verify that top tail moved down up to 0.15 from head arrow and bottom
     * tail moved up to 0.5 from top tail, after that changed Multi-Tailed Arrow can be saved to KET with the correct coordinates of spine, tails and head.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-default.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('topTail-move').hover({ force: true });
    await dragMouseTo(500, 600, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('bottomTail-move').hover({ force: true });
    await dragMouseTo(500, 200, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/moved-toptail-and-bottomtail-to-head-expected.ket',
      'tests/test-data/KET/moved-toptail-and-bottomtail-to-head-expected.ket',
    );
  });

  test('Load from KET Multi-Tailed Arrow with tail length = 1, verify that size of two tails can be reduced to right (minimal size is 0.4), after that saved to KET', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5107
     * Description: Load from KET Multi-Tailed Arrow with tail length = 1, verify that size of two tails reduced to right (minimal size is 0.4),
     * after that changed Multi-Tailed Arrow saved to KET with the correct coordinates of spine, tails and head.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-2-tails-1.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('topTail-resize').hover({ force: true });
    await dragMouseTo(700, 100, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/multi-tailed-arrow-2-tails-reduced-1-expected.ket',
      'tests/test-data/KET/multi-tailed-arrow-2-tails-reduced-1-expected.ket',
    );
  });

  test('Load from KET default Multi-Tailed Arrow, verify that size of two tails can be increased to left, after that changed Multi-Tailed Arrow can be saved to KET', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5107
     * Description: Load from KET default Multi-Tailed Arrow, verify that size of two tails increased to left,
     * after that changed Multi-Tailed Arrow saved to KET with the correct coordinates of spine, tails and head.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-default.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('topTail-resize').hover({ force: true });
    await dragMouseTo(200, 500, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/multi-tailed-arrow-default-increased-to-left-expected.ket',
      'tests/test-data/KET/multi-tailed-arrow-default-increased-to-left-expected.ket',
    );
  });

  test('Using "Multi-Tailed Arrow Tool" button, add default Multi-Tailed Arrow, verify that top tail can be moved up and bottom tail can be moved down', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5107
     * Description: Using "Multi-Tailed Arrow Tool" button, add default Multi-Tailed Arrow, verify that top tail moved up and
     * bottom tail moved down, after that changed Multi-Tailed Arrow saved to KET with the correct coordinates of spine, tails and head.
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await selectRectangleSelectionTool(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('topTail-move').hover({ force: true });
    await dragMouseTo(500, 200, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('bottomTail-move').hover({ force: true });
    await dragMouseTo(500, 600, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/button-added-moved-toptail-and-bottomtail-expected.ket',
      'tests/test-data/KET/button-added-moved-toptail-and-bottomtail-expected.ket',
    );
  });

  test('Add default Multi-Tailed Arrow by button, verify that top tail can be moved down up to 0.15 from head arrow and bottom tail can be moved up to 0.5 from top tail', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5107
     * Description: Add default Multi-Tailed Arrow by button, verify that top tail moved down up to 0.15 from head arrow and bottom
     * tail moved up to 0.5 from top tail, after that changed Multi-Tailed Arrow can be saved to KET with the correct coordinates of spine, tails and head.
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('topTail-move').hover({ force: true });
    await dragMouseTo(500, 600, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('bottomTail-move').hover({ force: true });
    await dragMouseTo(500, 200, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/button-added-moved-toptail-and-bottomtail-to-head-expected.ket',
      'tests/test-data/KET/button-added-moved-toptail-and-bottomtail-to-head-expected.ket',
    );
  });

  test('Add default Multi-Tailed Arrow by button, verify that size of two tails can be reduced to right (minimal size is 0.4) and increased to left', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5107
     * Description: Using "Multi-Tailed Arrow Tool" button, add default Multi-Tailed Arrow, verify that size of two tails reduced to
     * right (minimal size is 0.4) and increased to left after that changed Multi-Tailed Arrow saved to KET with the correct coordinates of spine, tails and head.
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('topTail-resize').hover({ force: true });
    await dragMouseTo(200, 500, page);
    await takeEditorScreenshot(page);
    await page.getByTestId('topTail-resize').hover({ force: true });
    await dragMouseTo(700, 100, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/button-added-multi-tailed-arrow-2-tails-reduced-1-expected.ket',
      'tests/test-data/KET/button-added-multi-tailed-arrow-2-tails-reduced-1-expected.ket',
    );
  });

  test('Load from KET 3 different Multi-Tailed Arrows with elements and verify that top and bottom tails can be moved and its size can be changed for each of them', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5107
    Description: Load from KET 3 different Multi-Tailed Arrows to Canvas with elements and verify that top and bottom tails moved and its size 
    changed for each of them, after that changed Multi-Tailed Arrows and elements saved to KET with the correct coordinates of spines, tails and heads.
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrows-3-with-elements.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('bottomTail-move').hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('bottomTail-resize').hover({ force: true });
    await dragMouseTo(700, 100, page);

    await selectPartOfMolecules(page);
    await page.getByTestId('bottomTail-move').nth(2).hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('bottomTail-resize').nth(2).hover({ force: true });
    await dragMouseTo(700, 100, page);

    await page.getByTestId('bottomTail-move').first().hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('bottomTail-resize').first().hover({ force: true });
    await dragMouseTo(400, 500, page);
    await clickOnCanvas(page, 200, 200);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/multi-tailed-arrows-3-with-elements-moved-and-resized-tails-expected.ket',
      'tests/test-data/KET/multi-tailed-arrows-3-with-elements-moved-and-resized-tails-expected.ket',
    );
  });

  test('Add 3 default Multi-Tailed Arrows by button, verify that top and bottom tails can be moved and its size can be changed for each of them', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5107
    Description: Using "Multi-Tailed Arrow Tool" button, add 3 default Multi-Tailed Arrows, verify that that top and bottom tails moved 
    and its size changed for each of them, after that changed Multi-Tailed Arrows saved to KET with the correct coordinates of spines, tails and heads.
    */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await clickOnCanvas(page, 500, 300);
    await clickOnCanvas(page, 600, 450);
    await takeEditorScreenshot(page);

    await selectRectangleSelectionTool(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('bottomTail-move').hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('bottomTail-resize').hover({ force: true });
    await dragMouseTo(400, 500, page);

    await selectPartOfMolecules(page);
    await page.getByTestId('bottomTail-move').nth(2).hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('bottomTail-resize').nth(2).hover({ force: true });
    await dragMouseTo(400, 500, page);

    await page.getByTestId('topTail-move').nth(1).hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('topTail-resize').nth(1).hover({ force: true });
    await dragMouseTo(400, 500, page);
    await clickOnCanvas(page, 100, 100);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/button-added-multi-tailed-arrows-3-moved-and-resized-tails-expected.ket',
      'tests/test-data/KET/button-added-multi-tailed-arrows-3-moved-and-resized-tails-expected.ket',
    );
  });

  test('Verify that Undo/Redo actions can be performed for added from KET default Multi-Tailed Arrow after moving/changing size of top and bottom tails ', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5107
    Description: Undo/Redo actions performed for added from KET default Multi-Tailed Arrow after moving/changing size of top and bottom tails .
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-default.ket',
      page,
    );
    await takeEditorScreenshot(page);

    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('bottomTail-move').hover({ force: true });
    await dragMouseTo(500, 600, page);
    await page.getByTestId('bottomTail-resize').hover({ force: true });
    await dragMouseTo(400, 300, page);

    await page.getByTestId('topTail-move').hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('topTail-resize').hover({ force: true });
    await dragMouseTo(400, 300, page);
    await clickOnCanvas(page, 100, 100);
    await takeEditorScreenshot(page);

    for (let i = 0; i < 4; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 4; i++) {
      await selectTopPanelButton(TopPanelButton.Redo, page);
    }
    await takeEditorScreenshot(page);
  });

  test('Verify Undo/Redo actions can be performed for added from KET 3 different Multi-Tailed Arrows with elements after moving/changing size of top and bottom tails', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5107
    Description: Undo/Redo actions performed for added from KET 3 different Multi-Tailed Arrows on Canvas with elements after moving/changing size of top and bottom tails.
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrows-3-with-elements.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('bottomTail-move').hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('bottomTail-resize').hover({ force: true });
    await dragMouseTo(700, 100, page);

    await selectPartOfMolecules(page);
    await page.getByTestId('bottomTail-move').nth(2).hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('bottomTail-resize').nth(2).hover({ force: true });
    await dragMouseTo(700, 100, page);

    await page.getByTestId('bottomTail-move').first().hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('bottomTail-resize').first().hover({ force: true });
    await dragMouseTo(400, 300, page);
    await clickOnCanvas(page, 200, 200);
    await takeEditorScreenshot(page);

    for (let i = 0; i < 6; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 6; i++) {
      await selectTopPanelButton(TopPanelButton.Redo, page);
    }
    await takeEditorScreenshot(page);
  });

  test('Copy-Paste (Ctrl+C, Ctrl+V) actions can be performed for loaded from KET 3 different Multi-Tailed Arrow after moving/changing size of top and bottom tails', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5107
    Description: Copy-Paste (Ctrl+C, Ctrl+V) actions performed for loaded from KET 3 different Multi-Tailed Arrow after moving/changing size of top and bottom tails.
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrows-3.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('bottomTail-move').hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('bottomTail-resize').hover({ force: true });
    await dragMouseTo(700, 100, page);

    await selectPartOfMolecules(page);
    await page.getByTestId('bottomTail-move').nth(2).hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('bottomTail-resize').nth(2).hover({ force: true });
    await dragMouseTo(700, 100, page);

    await page.getByTestId('bottomTail-move').first().hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('bottomTail-resize').first().hover({ force: true });
    await dragMouseTo(400, 300, page);
    await clickOnCanvas(page, 200, 200);
    await copyAndPaste(page);
    await clickOnCanvas(page, 700, 350);
    await takeEditorScreenshot(page);
  });

  test('Cut-Paste (Ctrl+C, Ctrl+V) actions can be performed for loaded from KET 3 different Multi-Tailed Arrow after moving/changing size of top and bottom tails', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5107
    Description: Cut-Paste (Ctrl+C, Ctrl+V) actions performed for loaded from KET 3 different Multi-Tailed Arrow after moving/changing size of top and bottom tails.
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrows-3.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('bottomTail-move').hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('bottomTail-resize').hover({ force: true });
    await dragMouseTo(700, 100, page);

    await selectPartOfMolecules(page);
    await page.getByTestId('bottomTail-move').nth(2).hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('bottomTail-resize').nth(2).hover({ force: true });
    await dragMouseTo(700, 100, page);

    await page.getByTestId('bottomTail-move').first().hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('bottomTail-resize').first().hover({ force: true });
    await dragMouseTo(400, 300, page);
    await clickOnCanvas(page, 200, 200);
    await cutAndPaste(page);
    await clickOnCanvas(page, 700, 350);
    await takeEditorScreenshot(page);
  });

  test('Loaded from KET Multi-Tailed Arrow after moving/changing size of top and bottom tails can be selected and moved to new position', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5107
    Description: Loaded from KET Multi-Tailed Arrow after moving/changing size of top and bottom tails selected and moved with correct size and position of spine, tails and head.
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-default.ket',
      page,
    );
    await takeEditorScreenshot(page);

    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('bottomTail-move').hover({ force: true });
    await dragMouseTo(500, 600, page);
    await page.getByTestId('bottomTail-resize').hover({ force: true });
    await dragMouseTo(500, 100, page);
    await takeEditorScreenshot(page);

    await page.getByTestId('topTail-move').hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('topTail-resize').hover({ force: true });
    await dragMouseTo(400, 300, page);
    await takeEditorScreenshot(page);

    await hoverOverArrowSpine(page);
    await dragMouseTo(900, 400, page);
    await takeEditorScreenshot(page);
  });

  test('Verify that Undo/Redo actions can be performed for added by Tool default Multi-Tailed Arrow with two tails after moving/changing size of top and bottom tails', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5107
    Description: Undo/Redo actions performed for added by Tool default Multi-Tailed Arrow with two tails after moving/changing size of top and bottom tails.
    */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);

    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('bottomTail-move').hover({ force: true });
    await dragMouseTo(500, 600, page);
    await page.getByTestId('bottomTail-resize').hover({ force: true });
    await dragMouseTo(500, 100, page);

    await page.getByTestId('topTail-move').hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('topTail-resize').hover({ force: true });
    await dragMouseTo(400, 300, page);
    await takeEditorScreenshot(page);

    for (let i = 0; i < 4; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 4; i++) {
      await selectTopPanelButton(TopPanelButton.Redo, page);
    }
    await takeEditorScreenshot(page);
  });

  test('Verify that Undo/Redo actions can be performed for added by Tool 3 default Multi-Tailed Arrows after moving/changing size of top and bottom tails', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5107
    Description: Undo/Redo actions performed for added by Tool 3 default Multi-Tailed Arrows after moving/changing size of top and bottom tails.
    */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await clickOnCanvas(page, 500, 300);
    await clickOnCanvas(page, 600, 450);
    await takeEditorScreenshot(page);

    await selectRectangleSelectionTool(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('bottomTail-move').hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('bottomTail-resize').hover({ force: true });
    await dragMouseTo(400, 500, page);

    await selectPartOfMolecules(page);
    await page.getByTestId('bottomTail-move').nth(2).hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('bottomTail-resize').nth(2).hover({ force: true });
    await dragMouseTo(400, 500, page);

    await page.getByTestId('topTail-move').nth(1).hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('topTail-resize').nth(1).hover({ force: true });
    await dragMouseTo(400, 500, page);
    await clickOnCanvas(page, 100, 100);
    await takeEditorScreenshot(page);

    for (let i = 0; i < 6; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
    await takeEditorScreenshot(page);
    for (let i = 0; i < 6; i++) {
      await selectTopPanelButton(TopPanelButton.Redo, page);
    }
    await takeEditorScreenshot(page);
  });

  test('Copy-Paste (Ctrl+C, Ctrl+V) actions can be performed for added by Tool 3 different Multi-Tailed Arrow after moving/changing size of top and bottom tails', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5107
    Description: Copy-Paste (Ctrl+C, Ctrl+V) actions performed for added by Tool 3 different Multi-Tailed Arrow after moving/changing size of top and bottom tails.
    */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await clickOnCanvas(page, 500, 300);
    await clickOnCanvas(page, 600, 450);
    await takeEditorScreenshot(page);

    await selectRectangleSelectionTool(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('bottomTail-move').hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('bottomTail-resize').hover({ force: true });
    await dragMouseTo(400, 500, page);

    await selectPartOfMolecules(page);
    await page.getByTestId('bottomTail-move').nth(2).hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('bottomTail-resize').nth(2).hover({ force: true });
    await dragMouseTo(400, 500, page);

    await page.getByTestId('topTail-move').nth(1).hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('topTail-resize').nth(1).hover({ force: true });
    await dragMouseTo(400, 500, page);
    await clickOnCanvas(page, 100, 100);
    await takeEditorScreenshot(page);

    await copyAndPaste(page);
    await clickOnCanvas(page, 800, 350);
    await takeEditorScreenshot(page);
  });

  test('Cut-Paste (Ctrl+X, Ctrl+V) actions can be performed for added by Tool 3 different Multi-Tailed Arrow after moving/changing size of top and bottom tails', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5107
    Description: Cut-Paste (Ctrl+X, Ctrl+V) actions performed for added by Tool 3 different Multi-Tailed Arrow after moving/changing size of top and bottom tails.
    */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await clickOnCanvas(page, 500, 300);
    await clickOnCanvas(page, 600, 450);
    await takeEditorScreenshot(page);

    await selectRectangleSelectionTool(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('bottomTail-move').hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('bottomTail-resize').hover({ force: true });
    await dragMouseTo(400, 500, page);

    await selectPartOfMolecules(page);
    await page.getByTestId('bottomTail-move').nth(2).hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('bottomTail-resize').nth(2).hover({ force: true });
    await dragMouseTo(400, 500, page);

    await page.getByTestId('topTail-move').nth(1).hover({ force: true });
    await dragMouseTo(500, 200, page);
    await page.getByTestId('topTail-resize').nth(1).hover({ force: true });
    await dragMouseTo(400, 500, page);
    await clickOnCanvas(page, 100, 100);
    await takeEditorScreenshot(page);

    await cutAndPaste(page);
    await clickOnCanvas(page, 800, 350);
    await takeEditorScreenshot(page);
  });

  test('Added by Tool Multi-Tailed Arrow after moving/changing size of top and bottom tails can be selected and moved to new position on Canvas', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5107
    Description: Added by Tool Multi-Tailed Arrow after moving/changing size of top and bottom tails selected and moved with correct size and position of spine, tails and head.
    */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);

    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('bottomTail-move').hover({ force: true });
    await dragMouseTo(400, 400, page);
    await page.getByTestId('bottomTail-resize').hover({ force: true });
    await dragMouseTo(400, 200, page);
    await takeEditorScreenshot(page);

    await page.getByTestId('topTail-move').hover({ force: true });
    await dragMouseTo(400, 300, page);
    await page.getByTestId('topTail-resize').hover({ force: true });
    await dragMouseTo(400, 300, page);
    await takeEditorScreenshot(page);

    await selectRectangleSelectionTool(page);
    await waitForRender(page, async () => {
      await hoverOverArrowSpine(page);
    });
    await dragMouseTo(900, 400, page);
    await takeEditorScreenshot(page);
  });

  test('Load from KET default Multi-Tailed Arrow with 3 tails, verify that middle tail can be moved up to 0.35 from top tail, after that saved to KET', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5107
     * Description: Loaded from KET default Multi-Tailed Arrow with 3 tails, middle tail moved up to 0.35 from top tail,
     * after that changed Multi-Tailed Arrow saved to KET with the correct coordinates of spine, tails and head.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-3-tails-default.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('tails-0-move').hover({ force: true });
    await dragMouseTo(500, 300, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/multi-tailed-arrow-3-tails-default-middle-tail-up-expected.ket',
      'tests/test-data/KET/multi-tailed-arrow-3-tails-default-middle-tail-up-expected.ket',
    );
  });

  test('Load from KET default Multi-Tailed Arrow with 3 tails, verify that middle tail can be moved down up to 0.35 from top tail, after that saved to KET', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5107
     * Description: Loaded from KET default Multi-Tailed Arrow with 3 tails, middle tail moved down up to 0.35 from top tail,
     * after that changed Multi-Tailed Arrow saved to KET with the correct coordinates of spine, tails and head.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-3-tails-default.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('tails-0-move').hover({ force: true });
    await dragMouseTo(500, 600, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/multi-tailed-arrow-3-tails-default-middle-tail-down-expected.ket',
      'tests/test-data/KET/multi-tailed-arrow-3-tails-default-middle-tail-down-expected.ket',
    );
  });

  test('Load from KET default Multi-Tailed Arrow with 3 tails, size of three tails can be reduced by middle tail to right (minimal size is 0.4), after that saved to KET', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/5107
     * Description: Loaded from KET default Multi-Tailed Arrow with 3 tails, size of three tails reduced by middle tail to right (minimal size is 0.4),
     * after that changed Multi-Tailed Arrow saved to KET with the correct coordinates of spine, tails and head.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-3-tails-default.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('tails-0-resize').hover({ force: true });
    await dragMouseTo(400, 500, page);
    await takeEditorScreenshot(page);
    await page.getByTestId('tails-0-resize').hover({ force: true });
    await dragMouseTo(800, 500, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/multi-tailed-arrow-3-tails-default-middle-tail-to-left-right-expected.ket',
      'tests/test-data/KET/multi-tailed-arrow-3-tails-default-middle-tail-to-left-right-expected.ket',
    );
  });

  test('By button, add default Multi-Tailed Arrow, add 3 new tails by right-click, verify that size of five tails can be increased to left, reduced to right', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5107
    Description: Using "Multi-Tailed Arrow Tool" button, add default Multi-Tailed Arrow, add 3 new tails by right-click, size of five 
    tails increased to left, reduced to right (minimal size is 0.4) by middle tail, after that changed Multi-Tailed Arrow saved to KET 
    with the correct coordinates of spine, tails and head.
    */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await selectRectangleSelectionTool(page);
    await addTails(page, 3);
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('tails-0-resize').hover({ force: true });
    await dragMouseTo(400, 500, page);
    await takeEditorScreenshot(page);
    await page.getByTestId('tails-0-resize').hover({ force: true });
    await dragMouseTo(800, 500, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/button-added-multi-tailed-arrow-3-tails-default-middle-tail-to-left-right-expected.ket',
      'tests/test-data/KET/button-added-multi-tailed-arrow-3-tails-default-middle-tail-to-left-right-expected.ket',
    );
  });

  test('By button, add default Multi-Tailed Arrow, add 3 new tails by right-click, and manupulate with tails, after that save in KET', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5107
    Description: Using "Multi-Tailed Arrow Tool" button, add default Multi-Tailed Arrow, add 3 new tails by right-click, 
    move up the second tail up to 0.35 from top tail, move down the fourth tail up to 0.35 from bottom tail, move 
    medium tail to the second/fourth, it's automatically returned to the nearest available place, after that 
    changed Multi-Tailed Arrow saved to KET with the correct coordinates of spine, tails and head.
    */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await selectRectangleSelectionTool(page);
    await addTails(page, 3);
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('tails-2-move').hover({ force: true });
    await dragMouseTo(400, 300, page);
    await takeEditorScreenshot(page);
    await page.getByTestId('tails-1-move').hover({ force: true });
    await dragMouseTo(400, 600, page);
    await page.getByTestId('tails-0-move').hover({ force: true });
    await dragMouseTo(400, 500, page);
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/button-added-multi-tailed-arrow-3-tails-default-manupulate-with-tails-expected.ket',
      'tests/test-data/KET/button-added-multi-tailed-arrow-3-tails-default-manupulate-with-tails-expected.ket',
    );
  });

  test('By button, add default Multi-Tailed Arrow, add 3 new tails by right-click, and manupulate with tails and add extra tails, after that save in KET', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5107
    Description: Using "Multi-Tailed Arrow Tool" button, add default Multi-Tailed Arrow, add 3 new tails by right-click, move up the second tail 
    up to 0.35 from top tail, move down the fourth tail up to 0.35 from bottom tail, move up medium tail up to the 0.35 from the second, add one 
    more tail and move it down up to 0.35 from the fourth, add one more tail, verify that can't add more tails, after that changed Multi-Tailed Arrow 
    saved to KET with the correct coordinates of spine, tails and head.
    */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await selectRectangleSelectionTool(page);
    await addTails(page, 3);
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('tails-2-move').hover({ force: true });
    await dragMouseTo(400, 300, page);
    await takeEditorScreenshot(page);
    await page.getByTestId('tails-1-move').hover({ force: true });
    await dragMouseTo(400, 600, page);
    await takeEditorScreenshot(page);
    await page.getByTestId('tails-0-move').hover({ force: true });
    await dragMouseTo(400, 500, page);
    await takeEditorScreenshot(page);
    await addTails(page, 1);
    await takeEditorScreenshot(page);
    await page.getByTestId('tails-3-move').hover({ force: true });
    await dragMouseTo(400, 500, page);
    await takeEditorScreenshot(page);
    await addTails(page, 1);
    await clickInTheMiddleOfTheScreen(page, 'right');
    await takeEditorScreenshot(page);
    await verifyFile(
      page,
      'KET/button-added-multi-tailed-arrow-3-tails-default-manupulate-with-extra-tails-expected.ket',
      'tests/test-data/KET/button-added-multi-tailed-arrow-3-tails-default-manupulate-with-extra-tails-expected.ket',
    );
  });

  test('Verify that added from KET file default Multi-Tailed Arrow is displayed on preview and can be saved separately to PNG/SVG files with correct positions and layers', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2129
     * Description: Added from KET file default Multi-Tailed Arrow is displayed on preview and can be saved separately to PNG/SVG files with correct positions and layers.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrow-to-compare.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await selectSaveFileFormat(page, FileFormatOption.SVG);
    await takeEditorScreenshot(page);
    await closeErrorAndInfoModals(page);
    await selectSaveFileFormat(page, FileFormatOption.PNG);
    await takeEditorScreenshot(page);
  });

  test('Verify that added by Tool default Multi-Tailed Arrows is displayed on preview and can be saved separately to PNG/SVG files with correct positions and layers', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2129
     * Description: Added by Tool default Multi-Tailed Arrows is displayed on preview and can be saved separately to PNG/SVG files with correct positions and layers.
     */
    await selectDropdownTool(
      page,
      'reaction-arrow-open-angle',
      'reaction-arrow-multitail',
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await selectSaveFileFormat(page, FileFormatOption.SVG);
    await takeEditorScreenshot(page);
    await closeErrorAndInfoModals(page);
    await selectSaveFileFormat(page, FileFormatOption.PNG);
    await takeEditorScreenshot(page);
  });

  test('Verify added from KET Multi-Tailed Arrows with elements saved to PNG/SVG can be added to Canvas by Tool as PNG/SVG images with the correct positions of elements', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2129
     * Description: Added from KET Multi-Tailed Arrows with elements saved to PNG/SVG can be added to Canvas by Tool as PNG/SVG images with the correct positions of elements.
     */
    await openFileAndAddToCanvasAsNewProject(
      'KET/multi-tailed-arrows-with-elements.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await selectSaveFileFormat(page, FileFormatOption.SVG);
    await takeEditorScreenshot(page);
    await closeErrorAndInfoModals(page);
    await selectSaveFileFormat(page, FileFormatOption.PNG);
    await takeEditorScreenshot(page);
    await closeErrorAndInfoModals(page);
    await selectClearCanvasTool(page);
    await openImageAndAddToCanvas(
      'Images/multi-tailed-arrows-with-elements.svg',
      page,
    );
    await takeEditorScreenshot(page);
    await selectClearCanvasTool(page);
    await openImageAndAddToCanvas(
      'Images/multi-tailed-arrows-with-elements.png',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that 15 Multi-Tailed Arrows with 80 images of allowed format (PNG, SVG) and 50 structures can be opened from SVG/PNG file with the correct size of file', async ({
    page,
  }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/2129
     * Description: 15 Multi-Tailed Arrows with 80 images of allowed format (PNG, SVG) and 50 structures can be opened together from SVG/PNG file with the correct size of file.
     */
    await openImageAndAddToCanvas(
      'Images/multi-tailed-arrows-15-with-images-png-svg-80-with-structures-50.svg',
      page,
    );
    await setZoomInputValue(page, '20');
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
    await selectClearCanvasTool(page);
    await openImageAndAddToCanvas(
      'Images/multi-tailed-arrows-15-with-images-png-svg-80-with-structures-50.png',
      page,
    );
    await setZoomInputValue(page, '20');
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });
});
