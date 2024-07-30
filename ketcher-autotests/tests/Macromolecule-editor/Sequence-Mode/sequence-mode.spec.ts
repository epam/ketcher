/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasMacro,
  selectSequenceLayoutModeTool,
  zoomWithMouseWheel,
  scrollDown,
  selectSnakeLayoutModeTool,
  selectFlexLayoutModeTool,
  clickUndo,
  startNewSequence,
  moveMouseAway,
  waitForRender,
  switchSequenceEnteringType,
  SequenceType,
  takeLayoutSwitcherScreenshot,
  takePageScreenshot,
  clickInTheMiddleOfTheScreen,
} from '@utils';
import {
  enterSequence,
  turnOnMacromoleculesEditor,
} from '@utils/macromolecules';

test.describe('Sequence Mode', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Open monomers chains and switch to sequence mode', async ({ page }) => {
    /* 
    Test case: #3648 - Open monomers chains and switch to sequence mode
    Description: Sequence mode tool
    */
    const ZOOM_OUT_VALUE = 400;
    const SCROLL_DOWN_VALUE = 250;

    await openFileAndAddToCanvasMacro('KET/monomers-chains.ket', page);
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
    await openFileAndAddToCanvasMacro('KET/monomers-chains.ket', page);
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await scrollDown(page, SCROLL_DOWN_VALUE);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await selectFlexLayoutModeTool(page);
    await scrollDown(page, SCROLL_DOWN_VALUE);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
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
      'KET/peptides-connected-with-bonds.ket',
      page,
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
      'KET/phosphates-not-part-of-nucleoside.ket',
      page,
    );
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that a dropdown menu is displayed in toolbar when sequence mode is ON', async ({
    page,
  }) => {
    /*
    Test case: #3861
    Description: Dropdown menu is displayed in toolbar when sequence mode is ON.
    */
    await selectSequenceLayoutModeTool(page);
    await takeLayoutSwitcherScreenshot(page);
  });

  test('Select drop-down menu', async ({ page }) => {
    /*
    Test case: #3861
    Description: Dropdown menu is expanded.
    */
    await selectSequenceLayoutModeTool(page);
    await page.getByTestId('sequence-type-dropdown').click();
    await takePageScreenshot(page);
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
    await openFileAndAddToCanvasMacro('Molfiles-V3000/dna-long.mol', page);
    await selectSequenceLayoutModeTool(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
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
    await openFileAndAddToCanvasMacro('KET/50-peptides-and-2-chems.ket', page);
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
    await openFileAndAddToCanvasMacro('KET/natural-analog-peptides.ket', page);
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
      'KET/sugar-base-chem-not-connected.ket',
      page,
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
    await openFileAndAddToCanvasMacro('Molfiles-V3000/rna.mol', page);
    await takeEditorScreenshot(page);
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Press Undo button and verify that layout returns to unarranged state', async ({
    page,
  }) => {
    /* 
    Test case: #3648
    Description: After press 'Undo' button layout returns to unarranged state.
    */
    await openFileAndAddToCanvasMacro('Molfiles-V3000/rna.mol', page);
    await selectSequenceLayoutModeTool(page);
    await clickUndo(page);
    await takeEditorScreenshot(page);
  });

  test('Press CTRL+Z hotkey button and verify that layout returns to unarranged state', async ({
    page,
  }) => {
    /* 
    Test case: #3648
    Description: After press CTRL+Z hotkey layout returns to unarranged state.
    */
    await openFileAndAddToCanvasMacro('Molfiles-V3000/rna.mol', page);
    await selectSequenceLayoutModeTool(page);
    await page.keyboard.press('Control+z');
    await takeEditorScreenshot(page);
  });

  test('Confirm that length of each row is limited to 30 nucleotides', async ({
    page,
  }) => {
    /* 
    Test case: #3648
    Description: Length of each row is limited to 30 nucleotides after switch to sequence mode.
    */
    await openFileAndAddToCanvasMacro('Molfiles-V3000/dna-long.mol', page);
    await selectSequenceLayoutModeTool(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('Open RNA in sequence mode, switch to snake mode and confirm that RNA chain layout is left-to-right', async ({
    page,
  }) => {
    /*
    Test case: #3648
    Description: RNA opened in sequence mode and RNA chain layout is left-to-right in snake mode.
    */
    await selectSequenceLayoutModeTool(page);
    await openFileAndAddToCanvasMacro('Molfiles-V3000/rna.mol', page);
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Open modified RNA in sequence mode', async ({ page }) => {
    /*
    Test case: #3734
    Description: Displaying modified nucleotide chains in sequence representation
    */
    await selectSequenceLayoutModeTool(page);
    await openFileAndAddToCanvasMacro(
      'KET/modified-nucleotide-chain.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await startNewSequence(page);
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

    await openFileAndAddToCanvasMacro('KET/monomers-cyclic-chains.ket', page);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
    await scrollDown(page, SCROLL_DOWN_VALUE);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  const testData = [
    {
      description:
        'System displays structure preview of DNA (preset) while hovering over letters on canvas.',
      file: 'Molfiles-V3000/dna.mol',
    },
    {
      description:
        'System displays structure preview of RNA (preset) while hovering over letters on canvas.',
      file: 'Molfiles-V3000/rna.mol',
    },
    {
      description:
        'System displays structure preview of Peptide (preset) while hovering over letters on canvas.',
      file: 'KET/peptides-connected-with-bonds.ket',
    },
  ];

  for (const data of testData) {
    test(`Ensure that ${data.description}`, async ({ page }) => {
      await openFileAndAddToCanvasMacro(data.file, page);
      await selectSequenceLayoutModeTool(page);
      await page.getByText('G').locator('..').first().hover();
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
      await openFileAndAddToCanvasMacro(data.file, page);
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
      'KET/phosphates-not-part-of-nucleoside.ket',
      page,
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
      'KET/chem-on-the-end-of-sequence.ket',
      page,
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
      'KET/sugar-on-the-end-of-sequence.ket',
      page,
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
    await openFileAndAddToCanvasMacro('KET/r3-r2-sugar-phosphate.ket', page);
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
      'KET/r1-r1-sugar-base-connection.ket',
      page,
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
      'KET/modified-and-unmodified-sequence.ket',
      page,
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
    await startNewSequence(page);
    await enterSequence(page, 'acg');
    await page.keyboard.press('Escape');
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
    await startNewSequence(page);
    await page.getByTestId('zoom-selector').click();
    for (let i = 0; i < 3; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-out-button').click();
      });
    }
    await clickInTheMiddleOfTheScreen(page);
    await enterSequence(page, 'ac');
    await takeEditorScreenshot(page);
    await page.getByTestId('zoom-selector').click();
    for (let i = 0; i < 2; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-in-button').click();
      });
    }
    await clickInTheMiddleOfTheScreen(page);
    await enterSequence(page, 'g');
    await page.keyboard.press('Escape');
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
    await startNewSequence(page);
    await enterSequence(page, 'cgatu');
    await page.keyboard.press('Escape');
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Create a multiple chains in sequence mode. Switch to flex mode and confirm that position of first monomer defines "top left" corner on canvas', async ({
    page,
  }) => {
    /*
    Test case: #3870
    Description: Position of first monomer defines "top left" corner on canvas.
    */
    await selectSequenceLayoutModeTool(page);
    await startNewSequence(page);
    await enterSequence(page, 'acgtu');
    await page.keyboard.press('Enter');
    await switchSequenceEnteringType(page, SequenceType.DNA);
    await enterSequence(page, 'acgtu');
    await page.keyboard.press('Enter');
    await switchSequenceEnteringType(page, SequenceType.PEPTIDE);
    await enterSequence(page, 'acfrtp');
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page);
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('If nucleotide is being added to the end of sequence, then phosphate P should be added automatically between last two nucleosides', async ({
    page,
  }) => {
    /*
    Test case: #3650
    Description: Phosphate P added automatically between last two nucleosides.
    */
    await selectSequenceLayoutModeTool(page);
    await startNewSequence(page);
    await enterSequence(page, 'cactt');
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Delete any nucleotide within RNA fragment using keyboard keys (Del, Backspace)', async ({
    page,
  }) => {
    /*
    Test case: #3650
    Description: RNA fragment deleted.
    */
    await selectSequenceLayoutModeTool(page);
    await startNewSequence(page);
    await enterSequence(page, 'cagtt');
    await page.keyboard.press('Escape');
    await page.getByText('G').locator('..').first().click({ button: 'right' });
    await page.getByTestId('edit_sequence').click();
    await page.keyboard.press('Delete');
    await page.keyboard.press('Backspace');
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
    await openFileAndAddToCanvasMacro('KET/dna-rna-separate.ket', page);
    await page.getByText('G').locator('..').first().click({ button: 'right' });
    await page.getByTestId('edit_sequence').click();
    await page.keyboard.press('Backspace');
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Verify that selecting RNA/DNA option defines sugar in newly added nucleotides from keyboard (ribose for RNA, deoxyribose for DNA)', async ({
    page,
  }) => {
    /*
    Test case: #3861
    Description: Selecting RNA/DNA option defines sugar in newly added nucleotides from keyboard (ribose for RNA, deoxyribose for DNA).
    */
    await selectSequenceLayoutModeTool(page);
    await startNewSequence(page);
    await enterSequence(page, 'acgtu');
    await switchSequenceEnteringType(page, SequenceType.DNA);
    await enterSequence(page, 'acgtu');
    await takeEditorScreenshot(page);
    await selectFlexLayoutModeTool(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
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
        await switchSequenceEnteringType(page, SequenceType.DNA);
      } else if (testCase.name === 'Preview for Peptide') {
        await switchSequenceEnteringType(page, SequenceType.PEPTIDE);
      }
      await startNewSequence(page);
      await enterSequence(page, testCase.sequence);
      await page.keyboard.press('Escape');
      await page.getByText(testCase.hoverText).locator('..').first().hover();
      await takeEditorScreenshot(page);
    });
  }

  test('Check that Monomers not disappear when switching to sequence view if they are attached to bases via the R2 attachment point', async ({
    page,
  }) => {
    /*
    Test case: #4346
    Description: Monomers not disappear when switching to sequence view if they are attached to bases via the R2 attachment point.
    The test doesn't work as it should because we have a bug https://github.com/epam/ketcher/issues/4346
    When fix is made, you need to update screenshot.
    */
    await openFileAndAddToCanvasMacro(
      'KET/monomers-attached-to-bases-via-r2.ket',
      page,
    );
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

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
      await openFileAndAddToCanvasMacro(testInfo.fileName, page);
      await selectSequenceLayoutModeTool(page);
      await takeEditorScreenshot(page);
    });
  }
});
