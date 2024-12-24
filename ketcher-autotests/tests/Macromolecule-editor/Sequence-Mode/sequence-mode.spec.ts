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
  switchSequenceEnteringButtonType,
  SequenceType,
  selectUndoByKeyboard,
  selectZoomInTool,
  selectZoomOutTool,
  MacroFileType,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  selectClearCanvasTool,
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
    await moveMouseAway(page);
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
    await moveMouseAway(page);
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
      await page
        .locator('g.drawn-structures')
        .locator('g', { has: page.locator('text="G"') })
        .first()
        .hover();
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
    await selectZoomOutTool(page, 3);
    await enterSequence(page, 'ac');
    await takeEditorScreenshot(page);
    await selectZoomInTool(page, 2);
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
    await moveMouseAway(page);
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
    await moveMouseAway(page);
    await startNewSequence(page);
    await enterSequence(page, 'acgtu');
    await page.keyboard.press('Enter');
    await switchSequenceEnteringButtonType(page, SequenceType.DNA);
    await enterSequence(page, 'acgtu');
    await page.keyboard.press('Enter');
    await switchSequenceEnteringButtonType(page, SequenceType.PEPTIDE);
    await enterSequence(page, 'acfrtp');
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page);
    await selectFlexLayoutModeTool(page);
    await moveMouseAway(page);
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
    await moveMouseAway(page);
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
    await page
      .locator('g.drawn-structures')
      .locator('g', { has: page.locator('text="G"') })
      .first()
      .click({ button: 'right' });
    await page.getByTestId('edit_sequence').click();
    await page.keyboard.press('ArrowLeft');
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
    await page
      .locator('g.drawn-structures')
      .locator('g', { has: page.locator('text="G"') })
      .first()
      .click({ button: 'right' });
    await page.getByTestId('edit_sequence').click();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Backspace');
    await selectFlexLayoutModeTool(page);
    await moveMouseAway(page);
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
    await switchSequenceEnteringButtonType(page, SequenceType.DNA);
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
        await switchSequenceEnteringButtonType(page, SequenceType.DNA);
      } else if (testCase.name === 'Preview for Peptide') {
        await switchSequenceEnteringButtonType(page, SequenceType.PEPTIDE);
      }
      await startNewSequence(page);
      await enterSequence(page, testCase.sequence);
      await page.keyboard.press('Escape');
      await page
        .locator('g.drawn-structures')
        .locator('g', { has: page.locator(`text="${testCase.hoverText}"`) })
        .first()
        .hover();
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
        'KET/monomers-attached-to-bases-via-r2.ket',
        page,
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
      await openFileAndAddToCanvasMacro(testInfo.fileName, page);
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
      '[His3Me].[meH].[aIle].[D-aIle].[dI].[DxiIle].[meI].[xiIle].[Aad].[D-Orn].[DALys].[dK].[Dpm].' +
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
      'PEPTIDE5{[Bua-].[-OEt]}|PEPTIDE6{[Cbz-].[-Ph]}|PEPTIDE7{[Bn-].[Am-]}$$$$V2.0',

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
      await selectClearCanvasTool(page);
    }
  });
});
