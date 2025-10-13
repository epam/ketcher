/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasMacro,
  zoomWithMouseWheel,
  scrollDown,
  selectPartOfMolecules,
  clickInTheMiddleOfTheScreen,
  selectAllStructuresOnCanvas,
  clickOnCanvas,
  moveMouseAway,
  MacroFileType,
} from '@utils';
import { selectRectangleArea } from '@utils/canvas/tools/helpers';
import { selectSequenceRangeInEditMode } from '@utils/macromolecules/sequence';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { keyboardPressOnCanvas } from '@utils/keyboard/index';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { SequenceSymbolOption } from '@tests/pages/constants/contextMenu/Constants';
import { getSymbolLocator } from '@utils/macromolecules/monomer';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';

test.describe('Sequence mode selection for view mode', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    const ZOOM_OUT_VALUE = 400;
    const SCROLL_DOWN_VALUE = 250;

    await openFileAndAddToCanvasMacro(page, 'KET/monomers-chains.ket');
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
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
    await getSymbolLocator(page, {
      symbolAlias: 'G',
    })
      .first()
      .click();
    await getSymbolLocator(page, {
      symbolAlias: 'G',
      nodeIndexOverall: 21,
    }).click();
    await page.keyboard.up('Shift');
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await takeEditorScreenshot(page);
  });

  test('Select entire chain with Ctrl+Lclick', async ({ page }) => {
    await page.keyboard.down('Control');
    await getSymbolLocator(page, {
      symbolAlias: 'G',
    })
      .first()
      .click();
    await page.keyboard.up('Control');
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await takeEditorScreenshot(page);
  });
});

test.describe('Sequence mode selection for edit mode', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    const ZOOM_OUT_VALUE = 400;
    const SCROLL_DOWN_VALUE = 250;

    await openFileAndAddToCanvasMacro(page, 'KET/monomers-chains.ket');
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
    await scrollDown(page, SCROLL_DOWN_VALUE);
    const symbolG = getSymbolLocator(page, {
      symbolAlias: 'G',
    }).first();
    await ContextMenu(page, symbolG).click(SequenceSymbolOption.EditSequence);
    await keyboardPressOnCanvas(page, 'ArrowLeft');
  });

  test('Select letters with LClick+drag', async ({ page }) => {
    const fromSymbol = getSymbolLocator(page, {
      symbolAlias: 'G',
      nodeIndexOverall: 20,
    });
    const toSymbol = getSymbolLocator(page, {
      symbolAlias: 'G',
      nodeIndexOverall: 39,
    });

    await selectSequenceRangeInEditMode(page, fromSymbol, toSymbol);
    await takeEditorScreenshot(page);

    const blankAreaAxis = { x: 200, y: 200 };
    await clickOnCanvas(page, blankAreaAxis.x, blankAreaAxis.y, {
      from: 'pageTopLeft',
    });
    await takeEditorScreenshot(page);
  });

  test('Select letters with Shift + ArrowRight button', async ({ page }) => {
    const arrowCount = 10;
    await page.keyboard.down('Shift');
    for (let i = 0; i < arrowCount; i++) {
      await keyboardPressOnCanvas(page, 'ArrowRight');
    }
    await page.keyboard.up('Shift');
    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );

    await takeEditorScreenshot(page);
  });

  test('Select letters with Shift + ArrowLeft then delete and undo', async ({
    page,
  }) => {
    const arrowCount = 10;
    await page.keyboard.down('Shift');
    for (let i = 0; i < arrowCount; i++) {
      await keyboardPressOnCanvas(page, 'ArrowLeft');
    }
    await page.keyboard.up('Shift');
    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    await keyboardPressOnCanvas(page, 'Backspace');
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);

    await keyboardPressOnCanvas(page, 'Escape');
    await takeEditorScreenshot(page);
  });
});

test.describe('Sequence mode selection for view mode', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  });

  const testData = [
    {
      description:
        'Click on a single DNA symbol using Select tool and verify that corresponding nucleotide is selected.',
      file: 'Molfiles-V3000/dna.mol',
      fileType: MacroFileType.MOLv3000,
    },
    {
      description:
        'Click on a single RNA symbol using Select tool and verify that corresponding nucleotide is selected.',
      file: 'Molfiles-V3000/rna.mol',
      fileType: MacroFileType.MOLv3000,
    },
    {
      description:
        'Click on a single Peptide symbol using Select tool and verify that corresponding nucleotide is selected.',
      file: 'KET/peptides-connected-with-bonds.ket',
      fileType: MacroFileType.KetFormat,
    },
  ];

  for (const data of testData) {
    test(`Ensure that ${data.description}`, async ({ page }) => {
      await openFileAndAddToCanvasMacro(page, data.file, data.fileType);
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Sequence,
      );
      await CommonLeftToolbar(page).selectAreaSelectionTool(
        SelectionToolType.Rectangle,
      );
      await page
        .locator('g.drawn-structures')
        .locator('g', { has: page.locator('text="G"') })
        .first()
        .click();
      await MonomerPreviewTooltip(page).waitForBecomeVisible();
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
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await openFileAndAddToCanvasMacro(page, 'KET/rna-dna-peptides-chains.ket');
    await selectPartOfMolecules(page);
    await takeEditorScreenshot(page);
  });

  test('Select a nucleotide or a group of nucleotides, and then press Esc button. Confirm that selection is cleared', async ({
    page,
  }) => {
    /*
    Test case: #3819
    Description: Selection is cleared.
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await openFileAndAddToCanvasMacro(page, 'KET/rna-dna-peptides-chains.ket');
    await selectPartOfMolecules(page);
    await takeEditorScreenshot(page);
    await keyboardPressOnCanvas(page, 'Escape');
    await takeEditorScreenshot(page);
  });

  test('Select a nucleotide or a group of nucleotides, then click outside selected area. Confirm that selection is cleared', async ({
    page,
  }) => {
    /*
    Test case: #3819
    Description: Selection is cleared.
    */
    const x = 500;
    const y = 500;
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await openFileAndAddToCanvasMacro(page, 'KET/rna-dna-peptides-chains.ket');
    await selectPartOfMolecules(page);
    await takeEditorScreenshot(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Select a nucleotide or a group of nucleotides, then click in the middle of the screen. Confirm that selection is cleared.', async ({
    page,
  }) => {
    /*
    Test case: #3819
    Description: Selection is cleared.
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await openFileAndAddToCanvasMacro(page, 'KET/rna-dna-peptides-chains.ket');
    await selectPartOfMolecules(page);
    await takeEditorScreenshot(page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Check selection functionality with zoom in and zoom out', async ({
    page,
  }) => {
    /*
    Test case: #3819
    Description: Selection is preserved after Zoom In/Zoom Out.
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await openFileAndAddToCanvasMacro(page, 'KET/rna-dna-peptides-chains.ket');
    await selectAllStructuresOnCanvas(page);
    await CommonTopRightToolbar(page).selectZoomOutTool(8);
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).selectZoomInTool(5);
    await takeEditorScreenshot(page);
  });

  test('Check that Selection removed if user switches from view mode to text-editing mode', async ({
    page,
  }) => {
    /*
    Test case: #3819
    Description: Selection is cleared.
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await openFileAndAddToCanvasMacro(page, 'KET/rna-dna-peptides-chains.ket');
    await selectPartOfMolecules(page);
    await takeEditorScreenshot(page);
    const symbolG = getSymbolLocator(page, {
      symbolAlias: 'G',
    }).first();
    await ContextMenu(page, symbolG).click(SequenceSymbolOption.EditSequence);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });
});
