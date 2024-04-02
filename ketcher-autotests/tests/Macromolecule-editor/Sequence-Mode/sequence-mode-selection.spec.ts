import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasMacro,
  selectSequenceLayoutModeTool,
  zoomWithMouseWheel,
  scrollDown,
  selectRectangleArea,
  selectFlexLayoutModeTool,
  moveMouseAway,
  clickUndo,
  selectRectangleSelectionTool,
  selectPartOfMolecules,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

test.describe('Sequence mode selection for view mode', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    const ZOOM_OUT_VALUE = 400;
    const SCROLL_DOWN_VALUE = 250;

    await openFileAndAddToCanvasMacro('KET/monomers-chains.ket', page);
    await selectSequenceLayoutModeTool(page);
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
    await scrollDown(page, SCROLL_DOWN_VALUE);
  });

  test('Select letters with rectangular selection tool', async ({ page }) => {
    // Coordinates for rectangle selection
    const startX = 100;
    const startY = 100;
    const endX = 500;
    const endY = 500;

    await selectRectangleArea(page, startX, startY, endX, endY);
    await takeEditorScreenshot(page);
  });

  test('Select letters with Shift+Lclick', async ({ page }) => {
    await page.keyboard.down('Shift');
    await page.getByText('G').first().click();
    await page.getByText('T').first().click();
    await page.keyboard.up('Shift');
    await takeEditorScreenshot(page);
  });

  test('Select entire chain with Ctrl+Lclick', async ({ page }) => {
    await page.keyboard.down('Control');
    await page.getByText('G').first().click();
    await page.keyboard.up('Control');
    await takeEditorScreenshot(page);
  });
});

test.describe('Sequence mode selection for edit mode', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    const ZOOM_OUT_VALUE = 400;
    const SCROLL_DOWN_VALUE = 250;

    await openFileAndAddToCanvasMacro('KET/monomers-chains.ket', page);
    await selectSequenceLayoutModeTool(page);
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
    await scrollDown(page, SCROLL_DOWN_VALUE);
    await page.getByText('G').first().click({ button: 'right' });
    await page.getByTestId('edit_sequence').click();
  });

  test('Select letters with LClick+drag', async ({ page }) => {
    await page.getByText('G').first().hover();
    await page.mouse.down();
    const number = 5;
    await page.getByText('G').nth(number).hover();
    await page.mouse.up();
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    const blankAreaAxis = { x: 200, y: 200 };
    await page.mouse.click(blankAreaAxis.x, blankAreaAxis.y);
    await takeEditorScreenshot(page);
  });

  test('Select letters with Shift + ArrowRight button', async ({ page }) => {
    const arrowCount = 10;
    await page.keyboard.down('Shift');
    for (let i = 0; i < arrowCount; i++) {
      await page.keyboard.press('ArrowRight');
    }
    await page.keyboard.up('Shift');
    await takeEditorScreenshot(page);

    await selectFlexLayoutModeTool(page);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Select letters with Shift + ArrowLeft then delete and undo', async ({
    page,
  }) => {
    const arrowCount = 10;
    await page.keyboard.down('Shift');
    for (let i = 0; i < arrowCount; i++) {
      await page.keyboard.press('ArrowLeft');
    }
    await page.keyboard.up('Shift');
    await takeEditorScreenshot(page);

    await page.keyboard.press('Backspace');
    await takeEditorScreenshot(page);

    await clickUndo(page);
    await takeEditorScreenshot(page);

    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page);
  });
});

test.describe('Sequence mode selection for view mode', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  const testData = [
    {
      description:
        'Click on a single DNA symbol using Select tool and verify that corresponding nucleotide is selected.',
      file: 'Molfiles-V3000/dna.mol',
    },
    {
      description:
        'Click on a single RNA symbol using Select tool and verify that corresponding nucleotide is selected.',
      file: 'Molfiles-V3000/rna.mol',
    },
    {
      description:
        'Click on a single Peptide symbol using Select tool and verify that corresponding nucleotide is selected.',
      file: 'KET/peptides-connected-with-bonds.ket',
    },
  ];

  for (const data of testData) {
    test(`Ensure that ${data.description}`, async ({ page }) => {
      await openFileAndAddToCanvasMacro(data.file, page);
      await selectSequenceLayoutModeTool(page);
      await selectRectangleSelectionTool(page);
      await page.getByText('G').locator('..').first().click();
      await takeEditorScreenshot(page);
    });
  }

  test('Use Select tool to draw an area on canvas encompassing multiple nucleotide symbols. Confirm that all nucleotides are highlighted.', async ({
    page,
  }) => {
    /*
    Test case: #3819
    Description: All selected nucleotides are highlighted.
    */
    await selectSequenceLayoutModeTool(page);
    await openFileAndAddToCanvasMacro('KET/rna-dna-peptides-chains.ket', page);
    await selectPartOfMolecules(page);
    await takeEditorScreenshot(page);
  });
});
