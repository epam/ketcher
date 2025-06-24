/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasMacro,
  selectSequenceLayoutModeTool,
  zoomWithMouseWheel,
  scrollDown,
  selectSnakeLayoutModeTool,
  selectFlexLayoutModeTool,
  moveMouseAway,
  switchSequenceEnteringButtonType,
  SequenceType,
  selectUndoByKeyboard,
  MacroFileType,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  takeTopToolbarScreenshot,
  selectAllStructuresOnCanvas,
} from '@utils';
import { waitForMonomerPreview } from '@utils/macromolecules';
import {
  keyboardPressOnCanvas,
  keyboardTypeOnCanvas,
} from '@utils/keyboard/index';
import {
  createAntisenseStrandByButton,
  getSymbolLocator,
} from '@utils/macromolecules/monomer';
import { switchToDNAMode } from '@utils/macromolecules/sequence';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { SequenceSymbolOption } from '@tests/pages/constants/contextMenu/Constants';

export async function clickOnTriangle(page: Page) {
  const expandButton = page
    .getByTestId('Create Antisense Strand')
    .getByTestId('dropdown-expand');
  await expandButton.click();
}

test.describe('Sequence Mode', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  });

  test('Open monomers chains and switch to sequence mode', async ({ page }) => {
    /* 
    Test case: #3648 - Open monomers chains and switch to sequence mode
    Description: Sequence mode tool
    */
    const ZOOM_OUT_VALUE = 400;
    const SCROLL_DOWN_VALUE = 250;

    await openFileAndAddToCanvasMacro(page, 'KET/monomers-chains.ket');
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
    await scrollDown(page, SCROLL_DOWN_VALUE);
    await takeEditorScreenshot(page);
  });

  test('Switch from flex view to sequence view to snake view and back to flex.', async ({
    page,
  }) => {
    /* 
    Test case: #3648
    Description: Switching between modes occurs with a visual change in monomers and their compounds depending on the mode.
    */
    const ZOOM_OUT_VALUE = 400;
    const SCROLL_DOWN_VALUE = 300;
    await openFileAndAddToCanvasMacro(page, 'KET/monomers-chains.ket');
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await scrollDown(page, SCROLL_DOWN_VALUE);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await selectFlexLayoutModeTool(page);
    await scrollDown(page, SCROLL_DOWN_VALUE);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Nucleotides are connected through R2-R1 bonds and switch to sequence mode.', async ({
    page,
  }) => {
    /* 
    Test case: #3648
    Description: Nucleotides are connected through R2-R1 bonds, these bonds are not visually represented,
    and nucleotides are depicted as symbols forming a word.
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/peptides-connected-with-bonds.ket',
    );
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('All phosphates not part of nucleotides are displayed as "p" symbols, including last phosphate connected to last nucleoside.', async ({
    page,
  }) => {
    /* 
    Test case: #3648
    Description: All phosphates not part of nucleotides are displayed as "p" symbols, 
    including last phosphate connected to last nucleoside.
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/phosphates-not-part-of-nucleoside.ket',
    );
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Test sequence display for long DNA/RNA', async ({ page }) => {
    /* 
    Test case: #3648
    Description: Sequence of letters is divided into groups of tens, and enumeration 
    is displayed only for every ten nucleotides and the last nucleotide.
    Sequence contains up to 30 nucleotides, it is aligned in one line.
    Sequence is longer than 30 nucleotides, lengths of the line are adjusted 
    according to the canvas size at 100% zoom rate, and symbols are transferred to next line in tens.
    */
    await openFileAndAddToCanvasMacro(
      page,
      'Molfiles-V3000/dna-long.mol',
      MacroFileType.MOLv3000,
    );
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Test sequence display for long Peptides chains', async ({ page }) => {
    /* 
    Test case: #3648
    Description: Sequence of letters is divided into groups of tens, and enumeration 
    is displayed only for every ten nucleotides and the last nucleotide.
    Sequence contains up to 30 nucleotides, it is aligned in one line.
    Sequence is longer than 30 nucleotides, lengths of the line are adjusted 
    according to the canvas size at 100% zoom rate, and symbols are transferred to next line in tens.
    */
    await openFileAndAddToCanvasMacro(page, 'KET/50-peptides-and-2-chems.ket');
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Confirm that if system encounters Peptide it is appears as letter for natural analog', async ({
    page,
  }) => {
    /* 
    Test case: #3648
    Description: Peptide appears as letter for natural analog
    */
    const ZOOM_OUT_VALUE = 800;
    const SCROLL_DOWN_VALUE = 150;
    await openFileAndAddToCanvasMacro(page, 'KET/natural-analog-peptides.ket');
    await selectSequenceLayoutModeTool(page);
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
    await scrollDown(page, SCROLL_DOWN_VALUE);
    await takeEditorScreenshot(page);
  });

  test('Confirm that if system encounters Sugar, Base or CHEM it is appears as @ symbol', async ({
    page,
  }) => {
    /* 
    Test case: #3648
    Description: Sugar, Base or CHEM appears as @ symbol
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/sugar-base-chem-not-connected.ket',
    );
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Open RNA in sequence mode, switch to flex mode and confirm that RNA chain layout is left-to-right', async ({
    page,
  }) => {
    /* 
    Test case: #3648
    Description: RNA opened in sequence mode and RNA chain layout is left-to-right.
    */
    await selectSequenceLayoutModeTool(page);
    await openFileAndAddToCanvasMacro(
      page,
      'Molfiles-V3000/rna.mol',
      MacroFileType.MOLv3000,
    );
    await takeEditorScreenshot(page);
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Press Undo button and verify that layout returns to unarranged state', async ({
    page,
  }) => {
    /* 
    Test case: #3648
    Description: After press 'Undo' button layout returns to unarranged state.
    */
    await openFileAndAddToCanvasMacro(
      page,
      'Molfiles-V3000/rna.mol',
      MacroFileType.MOLv3000,
    );
    await selectSequenceLayoutModeTool(page);
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test('Press CTRL+Z hotkey button and verify that layout returns to unarranged state', async ({
    page,
  }) => {
    /* 
    Test case: #3648
    Description: After press CTRL+Z hotkey layout returns to unarranged state.
    */
    await openFileAndAddToCanvasMacro(
      page,
      'Molfiles-V3000/rna.mol',
      MacroFileType.MOLv3000,
    );
    await selectSequenceLayoutModeTool(page);
    await selectUndoByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Confirm that length of each row is limited to 30 nucleotides', async ({
    page,
  }) => {
    /* 
    Test case: #3648
    Description: Length of each row is limited to 30 nucleotides after switch to sequence mode.
    */
    await openFileAndAddToCanvasMacro(
      page,
      'Molfiles-V3000/dna-long.mol',
      MacroFileType.MOLv3000,
    );
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Open RNA in sequence mode, switch to snake mode and confirm that RNA chain layout is left-to-right', async ({
    page,
  }) => {
    /*
    Test case: #3648
    Description: RNA opened in sequence mode and RNA chain layout is left-to-right in snake mode.
    */
    await selectSequenceLayoutModeTool(page);
    await openFileAndAddToCanvasMacro(
      page,
      'Molfiles-V3000/rna.mol',
      MacroFileType.MOLv3000,
    );
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Open modified RNA in sequence mode', async ({ page }) => {
    /*
    Test case: #3734
    Description: Displaying modified nucleotide chains in sequence representation
    */
    await selectSequenceLayoutModeTool(page);
    await openFileAndAddToCanvasMacro(
      page,
      'KET/modified-nucleotide-chain.ket',
    );
    await takeEditorScreenshot(page);
    await ContextMenu(page, { x: 200, y: 200 }).click(
      SequenceSymbolOption.StartNewSequence,
    );
    await takeEditorScreenshot(page);
  });

  test('Open monomers cyclic chains and switch to sequence mode', async ({
    page,
  }) => {
    /*
    Related bug: #4329 - Open monomers cyclic chains and switch to sequence mode
    */
    const ZOOM_OUT_VALUE = 400;
    const SCROLL_DOWN_VALUE = 100;

    await openFileAndAddToCanvasMacro(page, 'KET/monomers-cyclic-chains.ket');
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
    await scrollDown(page, SCROLL_DOWN_VALUE);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  const testData = [
    {
      description:
        'System displays structure preview of DNA (preset) while hovering over letters on canvas.',
      file: 'Molfiles-V3000/dna.mol',
      fileType: MacroFileType.MOLv3000,
    },
    {
      description:
        'System displays structure preview of RNA (preset) while hovering over letters on canvas.',
      file: 'Molfiles-V3000/rna.mol',
      fileType: MacroFileType.MOLv3000,
    },
    {
      description:
        'System displays structure preview of Peptide (preset) while hovering over letters on canvas.',
      file: 'KET/peptides-connected-with-bonds.ket',
      fileType: MacroFileType.Ket,
    },
  ];

  for (const data of testData) {
    test(`Ensure that ${data.description}`, async ({ page }) => {
      await openFileAndAddToCanvasMacro(page, data.file, data.fileType);
      await selectSequenceLayoutModeTool(page);
      await page
        .locator('g.drawn-structures')
        .locator('g', { has: page.locator('text="G"') })
        .first()
        .hover();

      await waitForMonomerPreview(page);
      await takeEditorScreenshot(page);
    });
  }

  const testsData = [
    {
      description:
        'Test display of nucleotides with modified sugar (any sugar except R) in sequence view',
      file: 'KET/mod-sugar-sequence.ket',
    },
    {
      description:
        'Test display of nucleotides with modified phosphate (any phosphate except P) in sequence view',
      file: 'KET/mod-phosphate-sequence.ket',
    },
    {
      description:
        'Test the display of nucleotides with modified base (any base except A, C, G, T, U) in sequence view',
      file: 'KET/mod-base-sequence.ket',
    },
    {
      description:
        'Check display of all components are modified in sequence view mode',
      file: 'KET/mod-sugar-base-phosphate-sequence.ket',
    },
  ];

  for (const data of testsData) {
    test(`${data.description}`, async ({ page }) => {
      /*
      Test case: #3734
      Description: Modified component is unambiguously marked.
      */
      await selectSequenceLayoutModeTool(page);
      await openFileAndAddToCanvasMacro(page, data.file);
      await takeEditorScreenshot(page);
    });
  }

  test('Test display of a phosphate connected to R2 AP of sugar and a phosphate that is not part of a nucleotide in sequence view', async ({
    page,
  }) => {
    /*
    Test case: #3734
    Description: Phosphate is displayed as p symbol.
    */
    await selectSequenceLayoutModeTool(page);
    await openFileAndAddToCanvasMacro(
      page,
      'KET/phosphates-not-part-of-nucleoside.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Test display of CHEM in sequence view and confirm that they are displayed as @', async ({
    page,
  }) => {
    /*
    Test case: #3734
    Description: CHEM is displayed as @ symbol.
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/chem-on-the-end-of-sequence.ket',
    );
    await takeEditorScreenshot(page);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Test display of sugars that are not part of a nucleotide or nucleoside in sequence view', async ({
    page,
  }) => {
    /*
    Test case: #3734
    Description: Sugars that are not part of a nucleotide or nucleoside in sequence view are displayed as @ symbol
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/sugar-on-the-end-of-sequence.ket',
    );
    await takeEditorScreenshot(page);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Side chain connections between sugar and phosphate', async ({
    page,
  }) => {
    /*
    Test case: #3734
    Description: Sugar and Phosphate are displayed as straight lines connecting two monomers center-to-center.
    */
    await openFileAndAddToCanvasMacro(page, 'KET/r3-r2-sugar-phosphate.ket');
    await takeEditorScreenshot(page);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Side chain connections between sugar and base', async ({ page }) => {
    /*
    Test case: #3734
    Description: Sugar and Base are displayed as straight lines connecting two monomers center-to-center.
    For now test working with bug https://github.com/epam/ketcher/issues/4413
    After fix need to be updated.
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/r1-r1-sugar-base-connection.ket',
    );
    await takeEditorScreenshot(page);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Test sequence view for chains containing both modified and unmodified nucleotides', async ({
    page,
  }) => {
    /*
    Test case: #3734
    Description: Modified component is marked accordingly to mockup.
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/modified-and-unmodified-sequence.ket',
    );
    await takeEditorScreenshot(page);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Test display of last nucleotide in sequence view, ensuring it lacks a phosphate', async ({
    page,
  }) => {
    /*
    Test case: #3734
    Description: After switch to flex mode phosphate is absent.
    */
    await selectSequenceLayoutModeTool(page);
    await keyboardTypeOnCanvas(page, 'acg');
    await keyboardPressOnCanvas(page, 'Escape');
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Zoom In and Zoom Out while add monomers in sequence view', async ({
    page,
  }) => {
    /*
    Test case: #3734
    Description: Monomers added without errors.
    */
    await selectSequenceLayoutModeTool(page);
    await CommonTopRightToolbar(page).selectZoomOutTool(3);
    await keyboardTypeOnCanvas(page, 'ac');
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).selectZoomInTool(2);
    await keyboardPressOnCanvas(page, 'g');
    await keyboardPressOnCanvas(page, 'Escape');
    await takeEditorScreenshot(page);
  });

  test('Create a single chain in sequence mode. Switch to flex mode and verify that position of first monomer remains same', async ({
    page,
  }) => {
    /*
    Test case: #3870
    Description: Position of first monomer remains same.
    */
    await selectSequenceLayoutModeTool(page);
    await keyboardTypeOnCanvas(page, 'cgatu');
    await keyboardPressOnCanvas(page, 'Escape');
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Create a multiple chains in sequence mode. Switch to flex mode and confirm that position of first monomer defines "top left" corner on canvas', async ({
    page,
  }) => {
    /*
    Test case: #3870
    Description: Position of first monomer defines "top left" corner on canvas.
    */
    await selectSequenceLayoutModeTool(page);
    await moveMouseAway(page);
    await keyboardTypeOnCanvas(page, 'acgtu');
    await keyboardPressOnCanvas(page, 'Enter');
    await switchSequenceEnteringButtonType(page, SequenceType.DNA);
    await keyboardTypeOnCanvas(page, 'acgtu');
    await keyboardPressOnCanvas(page, 'Enter');
    await switchSequenceEnteringButtonType(page, SequenceType.PEPTIDE);
    await keyboardTypeOnCanvas(page, 'acfrtp');
    await keyboardPressOnCanvas(page, 'Escape');
    await takeEditorScreenshot(page);
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('If nucleotide is being added to the end of sequence, then phosphate P should be added automatically between last two nucleosides', async ({
    page,
  }) => {
    /*
    Test case: #3650
    Description: Phosphate P added automatically between last two nucleosides.
    */
    await selectSequenceLayoutModeTool(page);
    await keyboardTypeOnCanvas(page, 'cactt');
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Delete any nucleotide within RNA fragment using keyboard keys (Del, Backspace)', async ({
    page,
  }) => {
    /*
    Test case: #3650
    Description: RNA fragment deleted.
    */
    await selectSequenceLayoutModeTool(page);
    await keyboardTypeOnCanvas(page, 'cagtt');
    await keyboardPressOnCanvas(page, 'Escape');
    const symbolG = getSymbolLocator(page, {
      symbolAlias: 'G',
    });
    await ContextMenu(page, symbolG).click(SequenceSymbolOption.EditSequence);
    await keyboardPressOnCanvas(page, 'ArrowLeft');
    await keyboardPressOnCanvas(page, 'Delete');
    await keyboardPressOnCanvas(page, 'Backspace');
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Merging two chains occurs when cursor is before first symbol of the second chain in text-editing mode, and Backspace is pressed', async ({
    page,
  }) => {
    /*
    Test case: #3650
    Description: DNA and RNA chains are merged into one chain.
    */
    await selectSequenceLayoutModeTool(page);
    await openFileAndAddToCanvasMacro(page, 'KET/dna-rna-separate.ket');
    const symbolG = getSymbolLocator(page, {
      symbolAlias: 'G',
    });
    await ContextMenu(page, symbolG).click(SequenceSymbolOption.EditSequence);
    await keyboardPressOnCanvas(page, 'ArrowLeft');
    await keyboardPressOnCanvas(page, 'Backspace');
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Verify that selecting RNA/DNA option defines sugar in newly added nucleotides from keyboard (ribose for RNA, deoxyribose for DNA)', async ({
    page,
  }) => {
    /*
    Test case: #3861
    Description: Selecting RNA/DNA option defines sugar in newly added nucleotides from keyboard (ribose for RNA, deoxyribose for DNA).
    */
    await selectSequenceLayoutModeTool(page);
    await keyboardTypeOnCanvas(page, 'acgtu');
    await switchSequenceEnteringButtonType(page, SequenceType.DNA);
    await keyboardTypeOnCanvas(page, 'acgtu');
    await takeEditorScreenshot(page);
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Check that a command icon added to the right of the Undo button and separated from it by a line.(Sequence mode)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5999
     * Description: Command icon added to the right of the Undo button and separated from it by a line.(Sequence mode).
     * When user add sequence and select appropriate monomers, the command icon is activated.
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Check that a command icon added to the right of the Undo button and separated from it by a line.
     * 3. Add a sequence and select all monomers
     * 4. Check activation of the command icon
     */
    await selectSequenceLayoutModeTool(page);
    await takeTopToolbarScreenshot(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await selectAllStructuresOnCanvas(page);
    await takeTopToolbarScreenshot(page);
  });

  test('Check that clicking on the triangle on the right-bottom corner of the icon give a drop-down menu with two options (Sequence mode)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5999
     * Description: Clicking on the triangle on the right-bottom corner of the icon give a drop-down menu with two
     * options - "Create RNA Antisense Strand" and "Create DNA Antisense Strand".(Sequence mode).
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Add a sequence and select all monomers
     * 3. Click on the triangle on the right-bottom corner of the icon
     */
    await selectSequenceLayoutModeTool(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await selectAllStructuresOnCanvas(page);
    await clickOnTriangle(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Create antisense strand by hotkeys/keyboard shortcuts (Sequence mode)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5999
     * Description: Create antisense strand by hotkeys/keyboard shortcuts Shift+Alt+R (Shift+Option+R for MacOS) for
     *  "Create RNA Antisense Strand".(Sequence mode).
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Add a sequence and select all monomers
     * 3. Press Shift+Alt+R (Shift+Option+R for MacOS) for "Create RNA Antisense Strand",
     */
    await selectSequenceLayoutModeTool(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await selectAllStructuresOnCanvas(page);
    await keyboardPressOnCanvas(page, 'Shift+Alt+R');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Create antisense strand by hotkeys/keyboard shortcuts (Snake mode)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5999
     * Description: Create antisense strand by hotkeys/keyboard shortcuts Shift+Alt+R (Shift+Option+R for MacOS) for
     *  "Create RNA Antisense Strand".(Snake mode).
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Add a sequence
     * 3. Switch to Snake mode and select all monomers
     * 4. Press Shift+Alt+R (Shift+Option+R for MacOS) for "Create RNA Antisense Strand",
     */
    await selectSequenceLayoutModeTool(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await selectSnakeLayoutModeTool(page);
    await selectAllStructuresOnCanvas(page);
    await keyboardPressOnCanvas(page, 'Shift+Alt+R');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Create DNA antisense strand by hotkeys/keyboard shortcuts (Sequence mode)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5999
     * Description: Create antisense strand by hotkeys/keyboard shortcuts Shift+Alt+D (Shift+Option+D for MacOS) for
     *  "Create DNA Antisense Strand".(Sequence mode).
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Add a sequence and select all monomers
     * 3. Press Shift+Alt+D (Shift+Option+D for MacOS) for "Create DNA Antisense Strand",
     */
    await selectSequenceLayoutModeTool(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await selectAllStructuresOnCanvas(page);
    await keyboardPressOnCanvas(page, 'Shift+Alt+D');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Create DNA antisense strand by hotkeys/keyboard shortcuts (Snake mode)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5999
     * Description: Create antisense strand by hotkeys/keyboard shortcuts Shift+Alt+D (Shift+Option+D for MacOS) for
     *  "Create DNA Antisense Strand".(Snake mode).
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Add a sequence
     * 3. Switch to Snake mode and select all monomers
     * 4. Press Shift+Alt+D (Shift+Option+D for MacOS) for "Create DNA Antisense Strand",
     */
    await selectSequenceLayoutModeTool(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await selectSnakeLayoutModeTool(page);
    await selectAllStructuresOnCanvas(page);
    await keyboardPressOnCanvas(page, 'Shift+Alt+D');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check creation RNA Antisense Strand by button (Sequence mode)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5999
     * Description: Creation RNA Antisense Strand by button (Sequence mode).
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Add a RNA sequence and select all monomers
     * 3. Click on button "Create Antisense Strand"
     */
    await selectSequenceLayoutModeTool(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await selectAllStructuresOnCanvas(page);
    await createAntisenseStrandByButton(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check creation RNA Antisense Strand by button (Snake mode)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5999
     * Description: Creation RNA Antisense Strand by button (Snake mode).
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Add a RNA sequence
     * 3. Switch to Snake mode and select all monomers
     * 4. Click on button "Create Antisense Strand"
     */
    await selectSequenceLayoutModeTool(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await selectSnakeLayoutModeTool(page);
    await selectAllStructuresOnCanvas(page);
    await createAntisenseStrandByButton(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check creation DNA Antisense Strand by button (Sequence mode)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5999
     * Description: Creation DNA Antisense Strand by button (Sequence mode).
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Add a DNA sequence and select all monomers
     * 3. Click on button "Create Antisense Strand"
     */
    await selectSequenceLayoutModeTool(page);
    await switchToDNAMode(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await selectAllStructuresOnCanvas(page);
    await createAntisenseStrandByButton(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check creation DNA Antisense Strand by button (Snake mode)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5999
     * Description: Creation DNA Antisense Strand by button (Snake mode).
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Add a DNA sequence
     * 3. Switch to Snake mode and select all monomers
     * 4. Click on button "Create Antisense Strand"
     */
    await selectSequenceLayoutModeTool(page);
    await switchToDNAMode(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await selectSnakeLayoutModeTool(page);
    await selectAllStructuresOnCanvas(page);
    await createAntisenseStrandByButton(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check that when RNA and DNA is selected, clicking the Create Antisense Strand button opens a drop-down menu (Sequence mode)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5999
     * Description: When RNA and DNA is selected, clicking the Create Antisense Strand button opens a drop-down menu (Sequence mode).
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Add a RNA and DNA sequence and select all monomers
     * 3. Click on button "Create Antisense Strand"
     */
    await selectSequenceLayoutModeTool(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await switchToDNAMode(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await selectAllStructuresOnCanvas(page);
    await createAntisenseStrandByButton(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check that when RNA and DNA is selected, clicking the Create Antisense Strand button opens a drop-down menu (Snake mode)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5999
     * Description: When RNA and DNA is selected, clicking the Create Antisense Strand button opens a drop-down menu (Snake mode).
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Add a RNA and DNA sequence
     * 3. Switch to Snake mode and select all monomers
     * 4. Click on button "Create Antisense Strand"
     */
    await selectSequenceLayoutModeTool(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await switchToDNAMode(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await selectSnakeLayoutModeTool(page);
    await selectAllStructuresOnCanvas(page);
    await createAntisenseStrandByButton(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check that when RNA and DNA is selected, user can create RNA Strand by clicking from drop-down menu Create RNA Antisense Strand (Sequence mode)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5999
     * Description: When RNA and DNA is selected, user can create RNA Strand by clicking from drop-down menu Create RNA Antisense Strand (Sequence mode).
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Add a RNA and DNA sequence and select all monomers
     * 3. Click on button "Create Antisense Strand" and select "Create RNA Antisense Strand"
     */
    await selectSequenceLayoutModeTool(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await switchToDNAMode(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await selectAllStructuresOnCanvas(page);
    await createAntisenseStrandByButton(page, 'RNA');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check that when RNA and DNA is selected, user can create DNA Strand by clicking from drop-down menu Create DNA Antisense Strand (Sequence mode)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5999
     * Description: When RNA and DNA is selected, user can create DNA Strand by clicking from drop-down menu Create DNA Antisense Strand (Sequence mode).
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Add a RNA and DNA sequence and select all monomers
     * 3. Click on button "Create Antisense Strand" and select "Create DNA Antisense Strand"
     */
    await selectSequenceLayoutModeTool(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await switchToDNAMode(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await selectAllStructuresOnCanvas(page);
    await createAntisenseStrandByButton(page, 'DNA');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check that when RNA and DNA is selected, user can create RNA Strand by clicking from drop-down menu Create RNA Antisense Strand (Flex mode)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5999
     * Description: When RNA and DNA is selected, user can create RNA Strand by clicking from drop-down menu Create RNA Antisense Strand (Flex mode).
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Add a RNA and DNA sequence
     * 3. Switch to Flex mode and select all monomers
     * 4. Click on button "Create Antisense Strand" and select "Create RNA Antisense Strand"
     */
    await selectSequenceLayoutModeTool(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await switchToDNAMode(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await selectFlexLayoutModeTool(page);
    await selectAllStructuresOnCanvas(page);
    await createAntisenseStrandByButton(page, 'RNA');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check that when RNA and DNA is selected, user can create DNA Strand by clicking from drop-down menu Create DNA Antisense Strand (Flex mode)', async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5999
     * Description: When RNA and DNA is selected, user can create DNA Strand by clicking from drop-down menu Create DNA Antisense Strand (Flex mode).
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Add a RNA and DNA sequence
     * 3. Switch to Flex mode and select all monomers
     * 4. Click on button "Create Antisense Strand" and select "Create DNA Antisense Strand"
     */
    await selectSequenceLayoutModeTool(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await switchToDNAMode(page);
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await selectFlexLayoutModeTool(page);
    await selectAllStructuresOnCanvas(page);
    await createAntisenseStrandByButton(page, 'DNA');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  const testCases = [
    {
      name: 'Preview for RNA',
      description:
        'include structure of hovered nucleotide and full names of submonomers',
      sequence: 'acgtu',
      hoverText: 'G',
    },
    {
      name: 'Preview for DNA',
      description:
        'include structure of hovered nucleotide and full names of submonomers',
      sequence: 'acgtu',
      hoverText: 'G',
    },
    {
      name: 'Preview for Peptide',
      description:
        'include structure of hovered nucleotide and full names of submonomers',
      sequence: 'acgtrqwkl',
      hoverText: 'W',
    },
  ];

  for (const testCase of testCases) {
    test(`${testCase.name}`, async ({ page }) => {
      /*
      Test case: #3876
      */
      await selectSequenceLayoutModeTool(page);
      if (testCase.name === 'Preview for DNA') {
        await switchSequenceEnteringButtonType(page, SequenceType.DNA);
      } else if (testCase.name === 'Preview for Peptide') {
        await switchSequenceEnteringButtonType(page, SequenceType.PEPTIDE);
      }
      await keyboardTypeOnCanvas(page, testCase.sequence);
      await keyboardPressOnCanvas(page, 'Escape');
      await page
        .locator('g.drawn-structures')
        .locator('g', { has: page.locator(`text="${testCase.hoverText}"`) })
        .first()
        .hover();

      await waitForMonomerPreview(page);
      await takeEditorScreenshot(page);
    });
  }

  test(
    'Check that Monomers not disappear when switching to sequence view if they are attached to bases via the R2 attachment point',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test case: #4346
    Description: Monomers not disappear when switching to sequence view if they are attached to bases via the R2 attachment point.
    The test doesn't work as it should because we have a bug https://github.com/epam/ketcher/issues/4346
    When fix is made, you need to update screenshot.
    */
      await openFileAndAddToCanvasMacro(
        page,
        'KET/monomers-attached-to-bases-via-r2.ket',
      );
      await selectSequenceLayoutModeTool(page);
      await takeEditorScreenshot(page);
    },
  );

  const tests = [
    {
      fileName: 'KET/all-types-of-modifications.ket',
      description: 'All types of modifications',
    },
    {
      fileName: 'KET/all-types-of-connection-between-CHEM-and-RNA.ket',
      description: 'All types of connection between CHEM and RNA',
    },
    {
      fileName: 'KET/all-types-of-connection-between-Sugar-and-RNA.ket',
      description: 'All types of connection between Sugar and RNA',
    },
    {
      fileName: 'KET/all-types-of-connection-between-Base-and-RNA.ket',
      description: 'All types of connection between Base and RNA',
    },
    {
      fileName: 'KET/all-types-of-connection-between-Phosphate-and-RNA.ket',
      description: 'All types of connection between Phosphate and RNA',
    },
  ];

  for (const testInfo of tests) {
    test(`Validate displaying modified nucleotide chains for ${testInfo.description}`, async ({
      page,
    }) => {
      await openFileAndAddToCanvasMacro(page, testInfo.fileName);
      await selectSequenceLayoutModeTool(page);
      await takeEditorScreenshot(page);
    });
  }

  test('1. Check that in sequence mode not modifid amino acids are not marked', async ({
    page,
  }) => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5629
    Description: Check that in sequence mode not modifid amino acids are not marked
    Case: 
          1. Switch to sequence mode
          2. Open HELM with all not modified amino acids
          3. Take a screenshot to verify that not modified amino acids are not marked
    */
    await selectSequenceLayoutModeTool(page);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.C.D.[D*].E.F.G}|PEPTIDE2{H.K.L.M.N.O.P}|PEPTIDE3{Q.R.S.T.U.V.W}|' +
        'PEPTIDE4{Y.(A,C,D,E,F,G,H,I,K,L,M,N,O,P,Q,R,S,T,U,V,W,Y).(D,N).(L,I).(E,Q)}$$$$V2.0',
    );
    await takeEditorScreenshot(page);
  });

  const modifiedAminoAcids: string[] = [
    'PEPTIDE1{[bAla].[Cha].[Cya].[D-1Nal].[D-2Nal].[D-2Pal].[D-2Thi].[D-3Pal].[D-Abu].[D-Cha].[meA].' +
      '[NMebAl].[Thi].[Tza].[dA].[1Nal].[2Nal].[3Pal].[4Pal].[Abu].[Cys_Bn].[Cys_Me].[Dha].[dC].[Edc].' +
      '[Hcy].[meC].[AspOMe].[dD].[meD].[dE].[gGlu].[Gla].[meE].[aMePhe].[Bip].[Bpa].[dF].[DPhe4C].' +
      '[DPhe4F].[DPhe4u].[hPhe].[meF].[Phe_2F].[Phe_3F].[Phe_4F].[Phe_4I].[Chg].[D-Chg].[D-Phg].' +
      '[D-Pyr].[PheNO2].[Phebbd].[PheaDH].[Phe4SD].[Phe4NO].[Phe4NH].[Phe4Me].[Phe4Cl].[Phe4Br].' +
      '[Phe3Cl].[Phe34d].[Phe2Me].[meQ].[dQ].[xiHyp].[Thz].[DAGlyO].[D-Nle].[Ar5c].[Orn].[meK].' +
      '[LysMe3].[LysiPr].[LysBoc].[Nle].[meL].[Hyp].[Mhp].[Cit].[D-Cit].[D-hArg].[DhArgE].[dR].' +
      '[Har].[hArg].[LhArgE].[meR].[D-Dap].[Dap].[dS].[DSerBn].[DSertB].[Hse].[meS].[Ser_Bn].[SerPO3]' +
      '.[SertBu].[aThr].[D-aThr].[dT].[D-Pen].[DaMeAb].[dV].[Iva].[Val3OH].[DTrp2M].[DTrpFo].[dW].' +
      '[Kyn].[meW].[Trp_Me].[Trp5OH].[TrpOme].[2Abz].[3Abz].[4Abz].[Abu23D].[Bmt].[Azi].[Asu].[App].' +
      '[Apm].[Aoda].[Cap].[Ac3c].[Ac6c].[Aca].[Aib].[D-Bmt].[D-Dab].[D-Dip].[D-Pip].[D-Tic].[Dab].[meV].' +
      '[Nva].[Pen].[dL].[ThrPO3].[xiThr].[dU].[meU].[D-Nva].[meT].[Dip].[Dsu].[dN].[meN].[dO].[meO].' +
      '[aHyp].[aMePro].[Aze].[D-aHyp].[D-Hyp].[D-Thz].[dP].[Pyr].[dH].[DHis1B].[Hhs].[His1Bn].[His1Me].' +
      '[His3Me].[meH].[aIle].[D-aIle].[dI].[DxiIle].[meI].[xiIle].[Aad].[D-Orn].[dK].[Dpm].' +
      '[Hyl5xi].[Lys_Ac].[tLeu].[dM].[DMetSO].[meM].[Met_O].[Met_O2].[Phg].[meG].[GlycPr].[Phg].[meG].' +
      '[GlycPr].[Glyall].[TyrtBu].[TyrSO3].[TyrPO3].[TyrPh4].[TyrabD].[Tyr3OH].[Tyr3NO].[Tyr35d].' +
      '[Tyr26d].[Tyr_Me].[Tyr_Bn].[Tyr_3I].[nTyr].[meY].[dY].[DTyrMe].[DTyrEt].[NMe2Ab].[NMe4Ab].[Pqa].' +
      '[pnT].[pnG].[pnC].[pnA].[Pip].[Oic].[Oic3aR].[Oic3aS].[Sta].[Sta3xi].[Tic].[Wil].[aMeTy3].' +
      '[aMeTyr].[D-nTyr].[D-gGlu].[D-hPhe].[Bux]}$$$$V2.0',

    'PEPTIDE1{[DACys].[Ala-al]}|PEPTIDE2{[DAlaol].[Ala-ol]}|PEPTIDE3{[D-OAla].[Gly-al]}|PEPTIDE4{[L-OAla].' +
      '[Phg-ol]}|PEPTIDE5{[DAhPhe].[-NHBn]}|PEPTIDE6{[DAPhg3].[Phe-al]}|PEPTIDE7{[DAGlyB].[-NHEt]}$$$$V2.0',

    'PEPTIDE1{[PhLA].[Phe-ol]}|PEPTIDE2{[DAGlyC].[Lys-ol]}|PEPTIDE3{[DAGlyP].[Arg-al]}|PEPTIDE4{[DAGlyT].' +
      '[DPhgol]}|PEPTIDE5{[DAPhg4].[Pro-ol]}|PEPTIDE6{[DALeu].[Leu-ol]}|PEPTIDE7{[OLeu].[-OtBu]}$$$$V2.0',

    'PEPTIDE1{[meP].[Pro-al]}|PEPTIDE2{[D-OVal].[dThrol]}|PEPTIDE3{[L-OVal].[-Et]}|PEPTIDE4{[Ac-].[-Bn]}|' +
      'PEPTIDE5{[Bua-].[-OEt]}|PEPTIDE6{[Cbz-].[-Ph]}|PEPTIDE7{[Bn-].[-Am]}$$$$V2.0',

    'PEPTIDE1{[DANcy].[Leu-al]}|PEPTIDE2{[fmoc-].[Thr-ol]}|PEPTIDE3{[DADip].[Val-ol]}|PEPTIDE4{[Glc].[-Me]}|' +
      'PEPTIDE5{[Boc-].[Aib-ol]}|PEPTIDE6{[Bz-]}|PEPTIDE7{[DAChg].[DADab]}$$$$V2.0',

    'PEPTIDE1{[NHBn-].[Gly-ol]}|PEPTIDE2{[MsO-].[Lys-al]}|PEPTIDE3{[Mpa].[Asp-al]}|PEPTIDE4{[Et-].[DProol]}|' +
      'PEPTIDE5{[Me-].[Hsl]}|PEPTIDE6{[Hva]}|PEPTIDE7{[Mba]}$$$$V2.0',

    'PEPTIDE1{[OMe-].[-NMe]}|PEPTIDE2{[NMe24A].[-OBn]}|PEPTIDE3{[NMe23A].[DTyr3O]}|PEPTIDE4{[OBn-].[Oxa]}|' +
      'PEPTIDE5{[DAnTyr].[Pyrro]}|PEPTIDE6{[Tos-].[-OMe]}$$$$V2.0',
  ];

  test('2. Check that in sequence mode all modifid amino acids are marked', async ({
    page,
  }) => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5629
    Description: Check that in sequence mode all modifid amino acids are marked
    Case: 
          1. Open HELM with all not modified amino acids
          2. Switch to sequence mode
          3. Take a screenshot to verify that all modified amino acids are marked
    */
    await selectSequenceLayoutModeTool(page);

    for (const modifiedAminoAcid of modifiedAminoAcids) {
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        modifiedAminoAcid,
      );
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).clearCanvas();
    }
  });

  test('Check that adjusted Add new sequence control width to longest sequence around it', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7104
     * Description: Check that adjusted Add new sequence control width to longest sequence around it
     * Case:
     *      1. Switch to sequence mode
     *      2. Open HELM with chains of different lenght
     *      3. Hover mouse over first new sequence button
     *      3. Take a screenshot to verify that all modified amino acids are marked
     */
    const newSequenceButton = page.getByTestId('NewSequencePlusButton');
    await selectSequenceLayoutModeTool(page);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      `PEPTIDE1{A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A}|PEPTIDE2{A.A.A.A.A.A.A.A.A}|PEPTIDE3{A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A}|PEPTIDE4{A.A.A.A}$$$$V2.0`,
    );

    await newSequenceButton.nth(0).hover({ force: true });
    await takeEditorScreenshot(page);

    await newSequenceButton.nth(1).hover({ force: true });
    await takeEditorScreenshot(page);

    await newSequenceButton.nth(2).hover({ force: true });
    await takeEditorScreenshot(page);

    await newSequenceButton.nth(3).hover({ force: true });
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).clearCanvas();
  });
});
