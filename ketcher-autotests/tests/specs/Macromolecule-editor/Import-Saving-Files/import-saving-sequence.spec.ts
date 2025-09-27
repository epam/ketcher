/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { test, expect } from '@fixtures';
import {
  openFileAndAddToCanvasMacro,
  takeEditorScreenshot,
  waitForPageInit,
  openFile,
  selectOptionInDropdown,
  moveMouseAway,
  openFileAndAddToCanvasAsNewProjectMacro,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  readFileContent,
  SequenceFileFormat,
  resetZoomLevelToDefault,
  delay,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { zoomWithMouseWheel } from '@utils/macromolecules';
import { PasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';
import {
  PeptideLetterCodeType,
  SequenceMonomerType,
} from '@tests/pages/constants/monomers/Constants';
import { MacromoleculesFileFormatType } from '@tests/pages/constants/fileFormats/macroFileFormats';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';
import { OpenStructureDialog } from '@tests/pages/common/OpenStructureDialog';

test.beforeEach(async ({ page }) => {
  await waitForPageInit(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
});

test.describe('Import-Saving .seq Files', () => {
  test(`Import .seq RNA file`, async ({ page }) => {
    await openFileAndAddToCanvasMacro(page, `Sequence/sequence-rna.seq`, [
      MacroFileType.Sequence,
      SequenceMonomerType.RNA,
    ]);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });
  test(`Import .seq DNA file`, async ({ page }) => {
    await openFileAndAddToCanvasMacro(page, `Sequence/sequence-dna.seq`, [
      MacroFileType.Sequence,
      SequenceMonomerType.DNA,
    ]);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });
  test(`Import .seq Peptide file`, async ({ page }) => {
    await openFileAndAddToCanvasMacro(page, `Sequence/sequence-peptide.seq`, [
      MacroFileType.Sequence,
      SequenceMonomerType.Peptide,
    ]);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check that Ketcher can handle spaces and line breaks in FASTA file when it pasted from clipboard as sequence (single sequence)', async ({
    page,
  }) => {
    /*
    Test case: #3894
    Description: File pasted to canvas.
    */
    const fileContent = await readFileContent(
      'Sequence/sequence-fasta-single-chain.seq',
    );
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      [MacroFileType.Sequence, SequenceMonomerType.RNA],
      fileContent,
    );
    await delay(0.2);
    await takeEditorScreenshot(page);
  });

  test('Check import of .ket file and save in .seq format', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro(page, 'KET/rna-a.ket');
    await verifyFileExport(
      page,
      'Sequence/sequence-rna-a-expected.seq',
      FileType.SEQ,
    );
    await takeEditorScreenshot(page);
  });

  test('Check that empty file can be saved in .seq format', async ({
    page,
  }) => {
    await verifyFileExport(page, 'Sequence/sequence-empty.seq', FileType.SEQ);
  });

  test('Check that system does not let importing empty .seq file', async ({
    page,
  }) => {
    const addToCanvasButton = PasteFromClipboardDialog(page).addToCanvasButton;

    await CommonTopLeftToolbar(page).openFile();
    await openFile(page, 'Sequence/sequence-empty.seq');
    await expect(addToCanvasButton).toBeDisabled();
  });

  test('Check that system does not let uploading corrupted .seq file', async ({
    page,
  }) => {
    const filename = 'Sequence/sequence-corrupted.seq';

    await CommonTopLeftToolbar(page).openFile();
    await openFile(page, filename);
    await selectOptionInDropdown(filename, page);
    await PasteFromClipboardDialog(page).addToCanvasButton.click();

    const errorDialog = page.getByLabel('Unsupported symbols').first();
    await errorDialog.waitFor({ state: 'visible' });
    await takeEditorScreenshot(page);
  });

  test('Validate correct displaying of snake viewed RNA chain loaded from .seq file format', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro(
      page,
      'Sequence/sequence-snake-mode-rna.seq',
      [MacroFileType.Sequence, SequenceMonomerType.RNA],
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Check that you can save snake viewed chain of peptides in a .seq file', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro(
      page,
      'Sequence/sequence-snake-mode-rna.seq',
      [MacroFileType.Sequence, SequenceMonomerType.RNA],
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await verifyFileExport(
      page,
      'Sequence/sequence-snake-mode-rna-expected.seq',
      FileType.SEQ,
    );
  });

  test('Should open .ket file and modify to .seq format in save modal textarea', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro(page, 'KET/rna-a.ket');
    await verifyFileExport(page, 'Sequence/sequence-rna-a.seq', FileType.SEQ);
  });

  // Should not convert to Sequence type in case of there are more than one monomer type
  test('Should not convert .ket file with RNA and Peptide to .seq format in save modal', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro(page, 'KET/rna-and-peptide.ket');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.Sequence1LetterCode,
    );

    await takeEditorScreenshot(page);
  });

  // Should not convert to Sequence type in case of there is any CHEM
  test('Should not convert .ket file with CHEMs to .seq format in save modal', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro(page, 'KET/chems-not-connected.ket');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.Sequence1LetterCode,
    );

    await takeEditorScreenshot(page);
  });

  test(
    'RNA and DNA structures not overlay each other on canvas, when adding them through the "Paste from Clipboard"',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test case: #4175
    Description: RNA and DNA structures not overlay each other on canvas, when adding them through the "Paste from Clipboard".
    The test doesn't work as it should because we have a bug https://github.com/epam/ketcher/issues/4175 For now structures overlap each other.
    When fix is made, you need to update screenshot.
    */
      const Rna = 'acgtu';
      const Dna = 'acgtu';

      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        [MacroFileType.Sequence, SequenceMonomerType.RNA],
        Rna,
      );

      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        [MacroFileType.Sequence, SequenceMonomerType.DNA],
        Dna,
      );

      await takeEditorScreenshot(page);
    },
  );

  test('RNA and DNA structures not overlay each other on canvas, when adding them through the “Open as file”', async ({
    page,
  }) => {
    /*
    Test case: #4175
    Description: RNA and DNA structures not overlay each other on canvas, when adding them through the "Paste from Clipboard".
    The test doesn't work as it should because we have a bug https://github.com/epam/ketcher/issues/4175 For now structures overlap each other.
    When fix is made, you need to update screenshot.
    */
    await openFileAndAddToCanvasMacro(page, 'Sequence/sequence-acgtu.seq', [
      MacroFileType.Sequence,
      SequenceMonomerType.RNA,
    ]);
    // Need open twice
    await openFileAndAddToCanvasMacro(page, 'Sequence/sequence-acgtu.seq', [
      MacroFileType.Sequence,
      SequenceMonomerType.RNA,
    ]);
    await takeEditorScreenshot(page);
  });

  test('Saving ambiguous peptides (with mapping, alternatives) in Sequence format', async ({
    page,
  }) => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 15.1 Verify saving ambiguous peptides (with mapping, alternatives) in Sequence format (macro mode)
    Case: 1. Load ambiguous peptides (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose Sequence option
          4. Take screenshot to make sure export is correct
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous-monomers/Peptides (that have mapping to library, alternatives).ket',
    );

    await zoomWithMouseWheel(page, -600);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await verifyFileExport(
      page,
      'Sequence/Ambiguous-Monomers/Peptides (that have mapping to library, alternatives).seq',
      FileType.SEQ,
    );
    await zoomWithMouseWheel(page, 600);
  });

  test(
    'Saving ambiguous peptides (with mapping, mixed) in Sequence format',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 15.2 Verify saving ambiguous peptides (with mapping, mixed) in Sequence format (macro mode)
    Case: 1. Load ambiguous peptides (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose Sequence option
             (Error should occure)
          4. Take screenshot to make sure export is correct
    */
      await openFileAndAddToCanvasAsNewProjectMacro(
        page,
        'KET/Ambiguous-monomers/Peptides (that have mapping to library, mixed).ket',
      );

      await zoomWithMouseWheel(page, -600);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);

      await CommonTopLeftToolbar(page).saveFile();
      await SaveStructureDialog(page).chooseFileFormat(
        MacromoleculesFileFormatType.Sequence1LetterCode,
      );
      await takeEditorScreenshot(page);

      await SaveStructureDialog(page).cancel();
      await zoomWithMouseWheel(page, 600);
    },
  );

  test(
    'Saving ambiguous peptides (without mapping, alternatives) in Sequence format',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 15.3 Verify saving ambiguous peptides (without mapping, alternatives) in Sequence format (macro mode)
    Case: 1. Load ambiguous peptides (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose Sequence option
            (Error should occure)
          4. Take screenshot to make sure export is correct
    */
      await openFileAndAddToCanvasAsNewProjectMacro(
        page,
        'KET/Ambiguous-monomers/Peptides (that have no mapping to library, alternatives).ket',
      );

      await zoomWithMouseWheel(page, -200);
      await moveMouseAway(page);
      await takeEditorScreenshot(page, { hideMonomerPreview: true });

      await CommonTopLeftToolbar(page).saveFile();
      await SaveStructureDialog(page).chooseFileFormat(
        MacromoleculesFileFormatType.Sequence1LetterCode,
      );
      await takeEditorScreenshot(page);

      await SaveStructureDialog(page).cancel();
      await zoomWithMouseWheel(page, 200);
    },
  );

  test(
    'Saving ambiguous peptides (without mapping, mixed) in Sequence format',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 15.4 Verify saving ambiguous peptides (without mapping, mixed) in Sequence format (macro mode)
    Case: 1. Load ambiguous peptides (that have mapping to library, mixed) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose Sequence option
            (Error should occure)
          4. Take screenshot to make sure export is correct
    */
      await openFileAndAddToCanvasAsNewProjectMacro(
        page,
        'KET/Ambiguous-monomers/Peptides (that have no mapping to library, mixed).ket',
      );

      await zoomWithMouseWheel(page, -200);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);

      await CommonTopLeftToolbar(page).saveFile();
      await SaveStructureDialog(page).chooseFileFormat(
        MacromoleculesFileFormatType.Sequence1LetterCode,
      );
      await takeEditorScreenshot(page);

      await SaveStructureDialog(page).cancel();
      await zoomWithMouseWheel(page, 200);
    },
  );

  test('Saving ambiguous DNA bases (with mapping, alternatives) in Sequence format', async ({
    page,
  }) => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 15.5 Verify saving ambiguous DNA bases (with mapping, alternatives) in Sequence format (macro mode)
    Case: 1. Load ambiguous bases (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose Sequence option
          4. Take screenshot to make sure export is correct
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous-monomers/Ambiguous DNA Bases (alternatives).ket',
    );

    await zoomWithMouseWheel(page, -100);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await verifyFileExport(
      page,
      'Sequence/Ambiguous-Monomers/Ambiguous DNA Bases (alternatives).seq',
      FileType.SEQ,
    );
    await zoomWithMouseWheel(page, 100);
  });

  test('Saving ambiguous DNA bases (with mapping, mixed) in Sequence format', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5558
     * Description: 15.6 Verify saving ambiguous DNA bases (with mapping, mixed) in Sequence format (macro mode)
     * Case: 1. Load ambiguous bases (that have mapping to library) from KET
     *       2. Take screenshot to make sure monomers on the canvas
     *       3. Open Save dialog and choose Sequence option
     *          (Error should occure)
     *       4. Validate error message
     *       5. Close all dialogs
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous-monomers/Ambiguous DNA Bases (mixed).ket',
    );

    await zoomWithMouseWheel(page, -100);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.Sequence1LetterCode,
    );
    const errorMessage = await ErrorMessageDialog(page).getErrorMessage();
    expect(errorMessage).toContain(
      "Convert error! Sequence saver: Can't save '%' to sequence format",
    );

    await ErrorMessageDialog(page).close();
    await SaveStructureDialog(page).cancel();
    await zoomWithMouseWheel(page, 100);
  });

  test('Saving ambiguous RNA bases (with mapping, alternatives) in Sequence format', async ({
    page,
  }) => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 15.7 Verify saving ambiguous RNA bases (with mapping, alternatives) in Sequence format (macro mode)
    Case: 1. Load ambiguous bases (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose Sequence option
          4. Take screenshot to make sure export is correct
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous-monomers/Ambiguous RNA Bases (alternatives).ket',
    );

    await zoomWithMouseWheel(page, -100);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await verifyFileExport(
      page,
      'Sequence/Ambiguous-Monomers/Ambiguous RNA Bases (alternatives).seq',
      FileType.SEQ,
    );
    await zoomWithMouseWheel(page, 100);
  });

  test('Saving ambiguous RNA bases (with mapping, mixed) in Sequence format', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5558
     * Description: 15.8 Verify saving ambiguous RNA bases (with mapping, mixed) in Sequence format (macro mode)
     * Case: 1. Load ambiguous bases (that have mapping to library) from KET
     *       2. Take screenshot to make sure monomers on the canvas
     *       3. Open Save dialog and choose Sequence option
     *          (Error should occure)
     *       4. Validate error message
     *       5. Close all dialogs
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous-monomers/Ambiguous RNA Bases (mixed).ket',
    );

    await zoomWithMouseWheel(page, -100);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.Sequence1LetterCode,
    );
    const errorMessage = await ErrorMessageDialog(page).getErrorMessage();
    expect(errorMessage).toContain(
      "Convert error! Sequence saver: Can't save '%' to sequence format",
    );
    await ErrorMessageDialog(page).close();
    await SaveStructureDialog(page).cancel();
    await zoomWithMouseWheel(page, 100);
  });

  test('Saving ambiguous (common) bases (with mapping, alternatives) in Sequence format', async ({
    page,
  }) => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 15.9 Verify saving ambiguous (common) bases (with mapping, alternatives) in Sequence format (macro mode)
    Case: 1. Load ambiguous bases (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose Sequence option
          4. Take screenshot to make sure export is correct
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous-monomers/Ambiguous (common) Bases (alternatives).ket',
    );

    await zoomWithMouseWheel(page, -200);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await verifyFileExport(
      page,
      'Sequence/Ambiguous-Monomers/Ambiguous (common) Bases (alternatives).seq',
      FileType.SEQ,
    );
    await zoomWithMouseWheel(page, 200);
  });

  test('Saving ambiguous (common) bases (with mapping, mixed) in Sequence format', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5558
     * Description: 15.10 Verify saving ambiguous (common) bases (with mapping, mixed) in Sequence format (macro mode)
     * Case: 1. Load ambiguous bases (that have mapping to library) from KET
     *       2. Take screenshot to make sure monomers on the canvas
     *       3. Open Save dialog and choose Sequence option
     *          (Error should occure)
     *       4. Validate error message
     *       5. Close all dialogs
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous-monomers/Ambiguous (common) Bases (mixed).ket',
    );

    await zoomWithMouseWheel(page, -200);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.Sequence1LetterCode,
    );
    const errorMessage = await ErrorMessageDialog(page).getErrorMessage();
    expect(errorMessage).toContain(
      "Convert error! Sequence saver: Can't save '%' to sequence format",
    );
    await ErrorMessageDialog(page).close();
    await SaveStructureDialog(page).cancel();
    await zoomWithMouseWheel(page, 200);
  });
});

test.describe('Import correct Sequence file: ', () => {
  interface ISequenceFile {
    SequenceDescription: string;
    SequenceFileName: string;
    SequenceMonomerType: SequenceMonomerType;
    // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
    shouldFail?: boolean;
    // issueNumber is mandatory if shouldFail === true
    issueNumber?: string;
  }

  const correctSequenceFiles: ISequenceFile[] = [
    {
      // Test task: https://github.com/epam/ketcher/issues/5558
      SequenceDescription: '1. Ambiguous (common) Bases with DNA sugar',
      SequenceFileName:
        'Sequence/Ambiguous-Monomers/Ambiguous (common) Bases.seq',
      SequenceMonomerType: SequenceMonomerType.DNA,
      shouldFail: false,
    },
    {
      // Test task: https://github.com/epam/ketcher/issues/5558
      SequenceDescription: '2. Ambiguous (common) Bases with RNA sugar',
      SequenceFileName:
        'Sequence/Ambiguous-Monomers/Ambiguous (common) Bases.seq',
      SequenceMonomerType: SequenceMonomerType.RNA,
      shouldFail: false,
    },
    {
      // Test task: https://github.com/epam/ketcher/issues/5558
      SequenceDescription: '3. Ambiguous DNA Bases',
      SequenceFileName: 'Sequence/Ambiguous-Monomers/Ambiguous DNA Bases.seq',
      SequenceMonomerType: SequenceMonomerType.DNA,
      shouldFail: false,
    },
    {
      // Test task: https://github.com/epam/ketcher/issues/5558
      SequenceDescription: '4. Ambiguous RNA Bases',
      SequenceFileName: 'Sequence/Ambiguous-Monomers/Ambiguous RNA Bases.seq',
      SequenceMonomerType: SequenceMonomerType.RNA,
      shouldFail: false,
    },
    {
      // Test task: https://github.com/epam/ketcher/issues/5558
      SequenceDescription: '5. Peptides (that have mapping to library)',
      SequenceFileName:
        'Sequence/Ambiguous-Monomers/Peptides (that have mapping to library).seq',
      SequenceMonomerType: SequenceMonomerType.Peptide,
      shouldFail: false,
    },
  ];

  for (const correctSequenceFile of correctSequenceFiles) {
    test(`${correctSequenceFile.SequenceDescription}`, async ({ page }) => {
      /*
      Description: Verify import of Sequence files works correct
      Case: 1. Load Sequence file 
            2. Take screenshot to make sure import works correct
      */

      await openFileAndAddToCanvasAsNewProjectMacro(
        page,
        correctSequenceFile.SequenceFileName,
        [MacroFileType.Sequence, correctSequenceFile.SequenceMonomerType],
      );

      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });
    });
  }
});

interface ISequenceString {
  testCaseDescription: string;
  sequenceDescription: string;
  sequenceString: string;
  sequenceType:
    | Exclude<SequenceMonomerType, SequenceMonomerType.Peptide>
    | [SequenceMonomerType.Peptide, PeptideLetterCodeType];
  expectedErrorMessage?: string;
  HELMString?: string;
  // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
  shouldFail?: boolean;
  // issueNumber is mandatory if shouldFail === true
  issueNumber?: string;
  // Some times export result is different to import string
  differentSequenceExport?: string;
}

const correctSequences: ISequenceString[] = [
  {
    testCaseDescription:
      '1. Verify import with valid three-letter codes in the sequence',
    sequenceDescription: 'Three letters peptide codes - part 1',
    sequenceString: 'AlaAsxCysAspGluPheGlyHisIle',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
  },
  {
    testCaseDescription:
      '1. Verify import with valid three-letter codes in the sequence',
    sequenceDescription: 'Three letters peptide codes - part 2',
    sequenceString: 'XleLysLeuMetAsnPylProGlnArg',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
  },
  {
    testCaseDescription:
      '1. Verify import with valid three-letter codes in the sequence',
    sequenceDescription: 'Three letters peptide codes - part 3',
    sequenceString: 'SerThrSecValTrpXaaTyrGlx',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
  },
  {
    testCaseDescription:
      '2. Verify that spaces separate different amino acid sequences in import',
    sequenceDescription: 'e.g. AlaAla CysCys (1)',
    sequenceString:
      'AlaAsx CysAspGlu PheGlyHisIle XleLysLeuMetAsn PylProGlnArgSerThr SecValTrpXaaTyrGlx',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
  },
  {
    testCaseDescription: '3. Verify ignoring of line breaks during import',
    sequenceDescription: 'e.g. AlaGly\nCys (2)',
    sequenceString:
      'Ala\nAsx\n\n Cys\n\n\nAsp\n\n\n\nGlu\n Phe\nGly\nHis\nIle \n\nXle\nLys\nLeu\nMet\nAsn Pyl\nPro\nGln\nArg\nSer\nThr\n SecValTrpXaaTyrGlx',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
  },
];

for (const correctSequence of correctSequences) {
  test(`${correctSequence.testCaseDescription} (with ${correctSequence.sequenceDescription})`, async ({
    page,
  }) => {
    /*
     * Description: Verify import of Sequence files works correct
     * Case: 1. Load Sequence file
     *       2. Take screenshot to make sure import works correct
     */

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      [MacroFileType.Sequence, correctSequence.sequenceType],
      correctSequence.sequenceString,
    );
    await resetZoomLevelToDefault(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });
}

const incorrectSequences: ISequenceString[] = [
  {
    testCaseDescription:
      '4. Verify error message for unsupported symbols in import',
    sequenceDescription: 'Ala| (1)',
    sequenceString: 'Ala|',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    expectedErrorMessage:
      "Convert error! Given string could not be loaded as (query or plain) molecule or reaction, see the error messages: 'SEQUENCE loader: Given string cannot be interpreted as a valid three letter sequence because of incorrect formatting.'",
  },
  {
    testCaseDescription:
      '4. Verify error message for unsupported symbols in import',
    sequenceDescription: 'ala (2)',
    sequenceString: 'ala',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    expectedErrorMessage:
      "Convert error! Given string could not be loaded as (query or plain) molecule or reaction, see the error messages: 'SEQUENCE loader: Given string cannot be interpreted as a valid three letter sequence because of incorrect formatting.'",
  },
  {
    testCaseDescription:
      '4. Verify error message for unsupported symbols in import',
    sequenceDescription: 'alA (3)',
    sequenceString: 'alA',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    expectedErrorMessage:
      "Convert error! Given string could not be loaded as (query or plain) molecule or reaction, see the error messages: 'SEQUENCE loader: Given string cannot be interpreted as a valid three letter sequence because of incorrect formatting.'",
  },
  {
    testCaseDescription:
      '4. Verify error message for unsupported symbols in import',
    sequenceDescription: 'aLa (4)',
    sequenceString: 'aLa',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    expectedErrorMessage:
      "Convert error! Given string could not be loaded as (query or plain) molecule or reaction, see the error messages: 'SEQUENCE loader: Given string cannot be interpreted as a valid three letter sequence because of incorrect formatting.'",
  },
  {
    testCaseDescription:
      '4. Verify error message for unsupported symbols in import',
    sequenceDescription: 'ALA  (5)',
    sequenceString: 'ALA',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    expectedErrorMessage:
      "Convert error! Given string could not be loaded as (query or plain) molecule or reaction, see the error messages: 'SEQUENCE loader: Given string cannot be interpreted as a valid three letter sequence because of incorrect formatting.'",
  },
  {
    testCaseDescription: '5. Verify error for incorrect formatting in import',
    sequenceDescription: 'uppercase/lowercase mix - CysALAAsx',
    sequenceString: 'CysALAAsx',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    expectedErrorMessage:
      "Convert error! Given string could not be loaded as (query or plain) molecule or reaction, see the error messages: 'SEQUENCE loader: Given string cannot be interpreted as a valid three letter sequence because of incorrect formatting.'",
  },
  {
    testCaseDescription:
      '6. Verify error when a three-letter sequence cannot be matched to amino acids',
    sequenceDescription: 'Alx',
    sequenceString: 'Alx',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    expectedErrorMessage:
      "Convert error! Given string could not be loaded as (query or plain) molecule or reaction, see the error messages: 'SEQUENCE loader: Unknown monomer name 'Alx'.'",
  },
];

for (const incorrectSequence of incorrectSequences) {
  test(`${incorrectSequence.testCaseDescription} (with ${incorrectSequence.sequenceDescription})`, async ({
    page,
  }) => {
    /*
     * Description: Verify import of Sequence files works correct
     * Case: 1. Load incorrect Sequence file
     *       2. Validate error message
     *       3. Close all dialogs
     */

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      [MacroFileType.Sequence, incorrectSequence.sequenceType],
      incorrectSequence.sequenceString,
      true,
    );

    const errorMessage = await ErrorMessageDialog(page).getErrorMessage();
    expect(errorMessage).toContain(incorrectSequence.expectedErrorMessage);

    await ErrorMessageDialog(page).close();
    await OpenStructureDialog(page).closeWindow();
  });
}

test(`7. Verify export option includes both single-letter and three-letter sequence codes)`, async ({
  page,
}) => {
  /*
   * Description: Verify export option includes both single-letter and three-letter sequence codes
   * Case: 1. Open Save structure dialog
   *       2. Verify File format list contains single-letter and three-letter Sequence options
   */
  await CommonTopLeftToolbar(page).saveFile();

  // Click on "File format" dropdown
  await SaveStructureDialog(page).fileFormatDropdownList.click();
  const singleLetter = page.getByText('Sequence (1-letter code)', {
    exact: true,
  });
  const threeLetter = page.getByText('Sequence (3-letter code)', {
    exact: true,
  });

  await expect(singleLetter).toBeVisible();
  await expect(threeLetter).toBeVisible();
});

const sequencesToExport: ISequenceString[] = [
  {
    testCaseDescription:
      '8. Verify export functionality for sequences using three-letter codes only',
    sequenceDescription: 'Three letters peptide codes - part 1',
    sequenceString: 'AlaAsxCysAspGluPheGlyHisIle',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription:
      '8. Verify export functionality for sequences using three-letter codes only',
    sequenceDescription: 'Three letters peptide codes - part 2',
    sequenceString: 'XleLysLeuMetAsnPylProGlnArg',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription:
      '8. Verify export functionality for sequences using three-letter codes only',
    sequenceDescription: 'Three letters peptide codes - part 3',
    sequenceString: 'SerThrSecValTrpXaaTyrGlx',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
];

for (const sequenceToExport of sequencesToExport) {
  test(`${sequenceToExport.testCaseDescription} with ${sequenceToExport.sequenceDescription}`, async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5215
     * Description: Load correct 3-letter sequences, open Save dialog and compare export result with the template
     * Case:
     *  1. Load correct sequence via paste from clipboard way
     *  2. Export canvas to 3-letter sequence
     *  3. Compare export result with source sequence string
     *  4. Validate export to .seq file format
     */
    test.setTimeout(35000);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      [MacroFileType.Sequence, sequenceToExport.sequenceType],
      sequenceToExport.sequenceString,
    );

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.Sequence3LetterCode,
    );
    const sequenceExportResult = await SaveStructureDialog(
      page,
    ).getTextAreaValue();

    if (sequenceToExport.differentSequenceExport) {
      expect(sequenceExportResult).toEqual(
        sequenceToExport.differentSequenceExport,
      );
    } else {
      expect(sequenceExportResult).toEqual(sequenceToExport.sequenceString);
    }

    await SaveStructureDialog(page).cancel();

    await verifyFileExport(
      page,
      `Sequence/Three-Letter/${sequenceToExport.sequenceDescription}.seq`,
      FileType.SEQ,
      SequenceFileFormat.threeLetter,
    );
  });
}

const nonStandardAmbiguousPeptides: ISequenceString[] = [
  {
    testCaseDescription:
      '9. Verify export with non-standard ambiguous amino acids',
    sequenceDescription: 'ambiguous peptide mixture of A, C, D',
    HELMString: 'PEPTIDE1{(A+C+D)}$$$$V2.0',
    sequenceString:
      'not applicable - export of anmbiguous petide to sequence is impossible',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    expectedErrorMessage:
      "Convert error! Sequence saver: Can't save '%' to sequence format",
  },
  {
    testCaseDescription:
      '9. Verify export with non-standard ambiguous amino acids',
    sequenceDescription: 'ambiguous peptide alternative of A, C, D',
    HELMString: 'PEPTIDE1{(A,C,D)}$$$$V2.0',
    sequenceString:
      'not applicable - export of anmbiguous petide to sequence is impossible',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    expectedErrorMessage:
      "Convert error! Sequence saver: Can't save '%' to sequence format",
  },
  {
    testCaseDescription:
      '10. Verify that non pure peptide sequences are prevented from exporting',
    sequenceDescription: 'peptide (A) and sugar (R)',
    HELMString: 'PEPTIDE1{A}|RNA1{R}$PEPTIDE1,RNA1,1:R2-1:R1$$$V2.0',
    sequenceString:
      'not applicable - export on pure peptide sequences to sequence is impossible',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    expectedErrorMessage:
      'Convert error! Sequence saver: Only amino acids can be saved as three letter amino acid codes.',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/3200',
  },
  {
    testCaseDescription:
      '10. Verify that non pure peptide sequences are prevented from exporting',
    sequenceDescription: 'peptide (A) and phopsphate (P)',
    HELMString: 'PEPTIDE1{A}|RNA1{P}$PEPTIDE1,RNA1,1:R2-1:R1$$$V2.0',
    sequenceString:
      'not applicable - export on pure peptide sequences to sequence is impossible',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    expectedErrorMessage:
      'Convert error! Sequence saver: Only amino acids can be saved as three letter amino acid codes.',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/3200',
  },
  {
    testCaseDescription:
      '10. Verify that non pure peptide sequences are prevented from exporting',
    sequenceDescription: 'peptide (A) and unsplit nucleotide (2-damdA)',
    HELMString: 'PEPTIDE1{A}|RNA1{[2-damdA]}$PEPTIDE1,RNA1,1:R2-1:R1$$$V2.0',
    sequenceString:
      'not applicable - export on pure peptide sequences to sequence is impossible',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    expectedErrorMessage:
      'Convert error! Sequence saver: Only amino acids can be saved as three letter amino acid codes.',
  },
  {
    testCaseDescription:
      '10. Verify that non pure peptide sequences are prevented from exporting',
    sequenceDescription: 'peptide (A) and CHEM(4aPEGMal)',
    HELMString: 'PEPTIDE1{A}|CHEM1{[4aPEGMal]}$PEPTIDE1,CHEM1,1:R2-1:R1$$$V2.0',
    sequenceString:
      'not applicable - export on pure peptide sequences to sequence is impossible',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    expectedErrorMessage:
      "Convert error! Sequence saver: Can't save chem '4aPEGMal' to sequence format",
  },
];

for (const sequenceToExport of nonStandardAmbiguousPeptides) {
  test(`${sequenceToExport.testCaseDescription} with ${sequenceToExport.sequenceDescription}`, async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5215
     * Description: Verify export with non-standard ambiguous amino acids(error should appear)
     * Case:
     *     1. Load correct HELM via paste from clipboard way
     *     2. Export canvas to 3-letter sequence
     *     4. Validate error message
     *     5. Close all dialogs
     *     For ambigous monomer: "Non-standard ambiguous amino acids cannot be exported to the selected format"
     *     For non pure peptide chains: "Convert error! Error during sequence type recognition(RNA, DNA or Peptide)"
     */
    test.setTimeout(35000);

    if (sequenceToExport.HELMString) {
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        sequenceToExport.HELMString,
      );
    }

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.Sequence3LetterCode,
    );

    test.fixme(
      sequenceToExport.shouldFail || false,
      `This test does not work properly because of the issue: ${sequenceToExport.issueNumber}`,
    );

    const errorMessage = await ErrorMessageDialog(page).getErrorMessage();
    expect(errorMessage).toContain(sequenceToExport.expectedErrorMessage);

    await ErrorMessageDialog(page).close();
    await SaveStructureDialog(page).cancel();
  });
}

const nonNaturalPeptideSequences: ISequenceString[] = [
  {
    testCaseDescription: '11. Verify natural analogue conversion on export',
    sequenceDescription: 'All peptides with natulal analog A',
    HELMString:
      'PEPTIDE1{A.[1Nal].[2Nal].[3Pal].[4Pal].[Abu].[Ala-al]}|PEPTIDE2{[D-2Pal].[D-2Nal].[D-1Nal].[Cya].[Cha].[bAla].[Ala-ol]}|PEPTIDE3' +
      '{[D-OAla].[D-2Thi].[D-3Pal].[D-Abu].[D-Cha]}|PEPTIDE4{[DAlaol].[dA]}|PEPTIDE5{[L-OAla].[Dha]}|PEPTIDE6{[meA].[NMebAl].[Thi].[Tza]}$$$$V2.0',
    sequenceString:
      'AlaAlaAlaAlaAlaAlaAla AlaAlaAlaAlaAlaAlaAla AlaAlaAlaAlaAla AlaAla AlaAla AlaAlaAlaAla',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription: '11. Verify natural analogue conversion on export',
    sequenceDescription: 'All peptides with natulal analog C',
    HELMString:
      'PEPTIDE1{C.[Cys_Bn].[Cys_Me]}|PEPTIDE2{[DACys].[dC].[Edc].[Hcy].[meC]}$$$$V2.0',
    sequenceString: 'CysCysCys CysCysCysCysCys',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription: '11. Verify natural analogue conversion on export',
    sequenceDescription: 'All peptides with natulal analog D',
    HELMString: 'PEPTIDE1{D.[AspOMe].[D*].[dD].[dD]}$$$$V2.0',
    sequenceString: 'AspAspAspAspAsp',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription: '11. Verify natural analogue conversion on export',
    sequenceDescription: 'All peptides with natulal analog E',
    HELMString: 'PEPTIDE1{E.[D-gGlu].[dE].[gGlu].[Gla].[meE]}$$$$V2.0',
    sequenceString: 'GluGluGluGluGluGlu',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription: '11. Verify natural analogue conversion on export',
    sequenceDescription: 'All peptides with natulal analog F',
    HELMString:
      'PEPTIDE1{F.[aMePhe].[Bip].[Bpa].[D-hPhe]}|PEPTIDE2{[DAhPhe].[dF].[DPhe4C].[DPhe4F].[DPhe4u].[hPhe].' +
      '[meF]}|PEPTIDE3{[DAPhg3].[Phe_2F].[Phe_3F].[Phe_4F].[Phe_4I].[Phe-al]}|PEPTIDE4{[Phe2Me].[Phe34d].' +
      '[Phe3Cl].[Phe4Br].[Phe4Cl].[Phe-ol]}|PEPTIDE5{[Phe4Me].[Phe4NH].[Phe4NO].[Phe4SD].[PheaDH].[Phebbd].' +
      '[PheNO2]}|PEPTIDE6{[PhLA]}$$$$V2.0',
    sequenceString:
      'PhePhePhePhePhe PhePhePhePhePhePhePhe PhePhePhePhePhePhe PhePhePhePhePhePhe PhePhePhePhePhePhePhe Phe',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription: '11. Verify natural analogue conversion on export',
    sequenceDescription: 'All peptides with natulal analog G',
    HELMString:
      'PEPTIDE1{G.[Chg].[D-Chg].[D-Phg].[D-Pyr]}|PEPTIDE2{[DAGlyB].[DAGlyO]}|PEPTIDE3{[DAGlyC].[Gly-al]}' +
      '|PEPTIDE4{[DAGlyP].[DPhgol]}|PEPTIDE5{[DAGlyT].[Gly-ol]}|PEPTIDE6{[DAPhg4].[Glyall].[GlycPr].[meG].' +
      '[Phg].[Phg-ol]}|PEPTIDE7{[Pyr]}$$$$V2.0',
    sequenceString:
      'GlyGlyGlyGlyGly GlyGly GlyGly GlyGly GlyGlyGlyGlyGlyGly GlyGly Gly',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription: '11. Verify natural analogue conversion on export',
    sequenceDescription: 'All peptides with natulal analog H',
    HELMString:
      'PEPTIDE1{H.[dH].[DHis1B].[Hhs].[His1Bn].[His1Me].[His3Me].[meH]}$$$$V2.0',
    sequenceString: 'HisHisHisHisHisHisHisHis',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription: '11. Verify natural analogue conversion on export',
    sequenceDescription: 'All peptides with natulal analog I',
    HELMString:
      'PEPTIDE1{I.[aIle].[D-aIle].[dI].[DxiIle].[meI].[xiIle]}$$$$V2.0',
    sequenceString: 'IleIleIleIleIleIleIle',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription: '11. Verify natural analogue conversion on export',
    sequenceDescription: 'All peptides with natulal analog K',
    HELMString:
      'PEPTIDE1{K.[Aad].[D-Orn].[DALys].[dK].[Dpm].[Hyl5xi].[Lys_Ac].[Lys-al]}|PEPTIDE2{[LysBoc].[LysiPr].[LysMe3].[meK].[Orn].[Lys-ol]}$$$$V2.0',
    sequenceString: 'LysLysLysLysLysLysLysLysLys LysLysLysLysLysLys',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription: '11. Verify natural analogue conversion on export',
    sequenceDescription: 'All peptides with natulal analog L',
    HELMString:
      'PEPTIDE1{L.[Ar5c].[D-Nle]}|PEPTIDE2{[DALeu].[dL].[Leu-al]}|PEPTIDE3{[OLeu].[Leu-ol]}|PEPTIDE4{[meL].[Nle].[tLeu]}$$$$V2.0',
    sequenceString: 'LeuLeuLeu LeuLeuLeu LeuLeuLeu Leu',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription: '11. Verify natural analogue conversion on export',
    sequenceDescription: 'All peptides with natulal analog M',
    HELMString: 'PEPTIDE1{M.[dM].[DMetSO].[meM].[Met_O].[Met_O2]}$$$$V2.0',
    sequenceString: 'MetMetMetMetMetMet',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription: '11. Verify natural analogue conversion on export',
    sequenceDescription: 'All peptides with natulal analog N',
    HELMString: 'PEPTIDE1{N.[Asp-al]}|PEPTIDE2{[dN].[meN]}$$$$V2.0',
    sequenceString: 'AsnAsn AsnAsn',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription: '11. Verify natural analogue conversion on export',
    sequenceDescription: 'All peptides with natulal analog O',
    HELMString: 'PEPTIDE1{O.[dO].[meO]}$$$$V2.0',
    sequenceString: 'PylPylPyl',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription: '11. Verify natural analogue conversion on export',
    sequenceDescription: 'All peptides with natulal analog P',
    HELMString:
      'PEPTIDE1{P.[aHyp].[aMePro].[Aze].[D-aHyp].[D-Hyp].[D-Thz].[dP].[DProol]}|PEPTIDE2{[meP].[Hyp]}' +
      '|PEPTIDE3{[Mhp].[Pro-al]}|PEPTIDE4{[Thz].[xiHyp].[Pro-ol]}$$$$V2.0',
    sequenceString: 'ProProProProProProProProPro ProPro ProPro ProProPro',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription: '11. Verify natural analogue conversion on export',
    sequenceDescription: 'All peptides with natulal analog Q',
    HELMString: 'PEPTIDE1{Q.[dQ].[meQ]}$$$$V2.0',
    sequenceString: 'GlnGlnGln',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription: '11. Verify natural analogue conversion on export',
    sequenceDescription: 'All peptides with natulal analog R',
    HELMString:
      'PEPTIDE1{R.[Arg-al]}|PEPTIDE2{[Cit].[D-Cit].[D-hArg].[DhArgE].[dR].[Har].[hArg].[LhArgE].[meR]}$$$$V2.0',
    sequenceString: 'ArgArg ArgArgArgArgArgArgArgArgArg',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription: '11. Verify natural analogue conversion on export',
    sequenceDescription: 'All peptides with natulal analog S',
    HELMString:
      'PEPTIDE1{S.[D-Dap].[Dap].[dS].[DSerBn].[DSertB].[Hse].[meS].[Ser_Bn].[SerPO3].[SertBu]}$$$$V2.0',
    sequenceString: 'SerSerSerSerSerSerSerSerSerSerSer',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription: '11. Verify natural analogue conversion on export',
    sequenceDescription: 'All peptides with natulal analog T',
    HELMString:
      'PEPTIDE1{T.[aThr].[D-aThr].[dT].[dThrol]}|PEPTIDE2{[meT].[Thr-ol]}|PEPTIDE3{[ThrPO3].[xiThr]}$$$$V2.0',
    sequenceString: 'ThrThrThrThrThr ThrThr ThrThr',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription: '11. Verify natural analogue conversion on export',
    sequenceDescription: 'All peptides with natulal analog U',
    HELMString: 'PEPTIDE1{U.[dU].[meU]}$$$$V2.0',
    sequenceString: 'SecSecSec',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription: '11. Verify natural analogue conversion on export',
    sequenceDescription: 'All peptides with natulal analog V',
    HELMString:
      'PEPTIDE1{V.[D-Nva].[D-Pen].[DaMeAb].[dV].[Iva]}|PEPTIDE2{[D-OVal].[meV].[Nva].[Pen]}|PEPTIDE3{[L-OVal].[Val-ol]}|PEPTIDE4{[Val3OH]}$$$$V2.0',
    sequenceString: 'ValValValValValVal ValValValVal ValVal Val',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription: '11. Verify natural analogue conversion on export',
    sequenceDescription: 'All peptides with natulal analog W',
    HELMString:
      'PEPTIDE1{W.[DTrp2M].[DTrpFo].[dW].[Kyn].[meW].[Trp_Me].[Trp5OH].[TrpOme]}$$$$V2.0',
    sequenceString: 'TrpTrpTrpTrpTrpTrpTrpTrpTrp',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription: '11. Verify natural analogue conversion on export',
    sequenceDescription: 'All peptides with no natulal analog - X',
    HELMString:
      'PEPTIDE1{[Am-]}|PEPTIDE2{[Bn-].[Aoda].[-Bn]}|PEPTIDE3{[Boc-].[Apm].[-Et]}|PEPTIDE4{[Bua-].[App].[-Me]}|' +
      'PEPTIDE5{[Et-].[Aib].[-NHBn]}|PEPTIDE6{[Ac6c].[D-Tic].[-NMe]}|PEPTIDE7{[Cbz-].[Ac3c].[-OBn]}|' +
      'PEPTIDE8{[Abu23D].[D-Pip].[-OEt]}|PEPTIDE9{[DANcy].[4Abz].[-OMe]}|PEPTIDE10{[Ac-].[2Abz].[-OtBu]}|' +
      'PEPTIDE11{[Mba].[3Abz].[-Ph]}|PEPTIDE12{[Aca].[Sta3xi].[-NHEt]}|PEPTIDE13{[Me-].[Bux].[Aib-ol]}|' +
      'PEPTIDE14{[Bz-].[Cap].[D-Bmt]}|PEPTIDE15{[DAChg].[D-Dip].[Dab]}|PEPTIDE16{[DADip].[Bmt].[DADab]}|' +
      'PEPTIDE17{[Glc].[Azi].[Dip]}|PEPTIDE18{[fmoc-].[D-Dab].[Dsu]}|PEPTIDE19{[Hva].[Asu].[Oxa]}|' +
      'PEPTIDE20{[Mpa].[Pqa].[Pyrro]}|PEPTIDE21{[MsO-].[Wil].[Hsl]}|PEPTIDE22{[NHBn-].[pnA].[pnC]}|' +
      'PEPTIDE23{[NMe23A].[Oic3aR].[Oic3aS]}|PEPTIDE24{[NMe24A].[NMe2Ab].[NMe4Ab]}|PEPTIDE25{[OBn-].[pnT].[pnG]}|' +
      'PEPTIDE26{[OMe-].[Oic].[Pip]}|PEPTIDE27{[Tos-].[Tic].[Sta]}$$$$V2.0',
    sequenceString:
      'Xaa XaaXaaXaa XaaXaaXaa XaaXaaXaa XaaXaaXaa XaaXaaXaa XaaXaaXaa XaaXaaXaa XaaXaaXaa XaaXaaXaa ' +
      'XaaXaaXaa XaaXaaXaa XaaXaaXaa XaaXaaXaa XaaXaaXaa XaaXaaXaa XaaXaaXaa XaaXaaXaa XaaXaaXaa ' +
      'XaaXaaXaa XaaXaaXaa XaaXaaXaa XaaXaaXaa XaaXaaXaa XaaXaaXaa XaaXaaXaa XaaXaaXaa',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription: '11. Verify natural analogue conversion on export',
    sequenceDescription: 'All peptides with natulal analog Y',
    HELMString:
      'PEPTIDE1{Y.[aMeTy3].[aMeTyr].[D-nTyr]}|PEPTIDE2{[DAnTyr].[DTyr3O]}|PEPTIDE3{[DTyrEt].[DTyrMe].[dY].[meY]' +
      '.[nTyr].[Tyr_3I].[Tyr_Bn].[Tyr_Me]}|PEPTIDE4{[Tyr26d].[Tyr35d].[Tyr3NO].[Tyr3OH].[TyrabD].[TyrPh4].[TyrPO3].[TyrSO3].[TyrtBu]}$$$$V2.0',
    sequenceString:
      'TyrTyrTyrTyr TyrTyr TyrTyrTyrTyrTyrTyrTyrTyr TyrTyrTyrTyrTyrTyrTyrTyrTyr',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription:
      '12. Verify specific export format for "Any amino acid"',
    sequenceDescription: '(X) as Xaa',
    HELMString:
      'PEPTIDE1{(A,C,D,E,F,G,H,I,K,L,M,N,O,P,Q,R,S,T,U,V,W,Y)}$$$$V2.0',
    sequenceString: 'Xaa',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription: '13. Verify export format for ambiguous amino acids',
    sequenceDescription: 'B, J, Z',
    HELMString: 'PEPTIDE1{(D,N).(L,I).(E,Q)}$$$$V2.0',
    sequenceString: 'AsxXleGlx',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
  {
    testCaseDescription:
      '14. Verify that multiple sequences are separated by space in exported file',
    sequenceDescription: '6 chains from 1 to 6 length',
    HELMString:
      'PEPTIDE1{A}|PEPTIDE2{C.D}|PEPTIDE3{E.F.G}|PEPTIDE4{H.I.K.L}|PEPTIDE5{M.N.O.P.Q}|PEPTIDE6{R.S.T.U.V.W}$$$$V2.0',
    sequenceString:
      'Ala CysAsp GluPheGly HisIleLysLeu MetAsnPylProGln ArgSerThrSecValTrp',
    sequenceType: [
      SequenceMonomerType.Peptide,
      PeptideLetterCodeType.threeLetterCode,
    ],
    shouldFail: false,
  },
];

for (const sequenceToExport of nonNaturalPeptideSequences) {
  test(`${sequenceToExport.testCaseDescription} with ${sequenceToExport.sequenceDescription}`, async ({
    page,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/5215
     * Description: Load correct 3-letter sequences, open Save dialog and compare export result with the template
     * Case:
     *     1. Load correct sequence via paste from clipboard way
     *     2. Export canvas to 3-letter sequence
     *     3. Compare export result with source sequence string
     *     4. Validate export to .seq file format
     *
     *  Version 3.5
     */
    test.setTimeout(35000);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      [MacroFileType.Sequence, sequenceToExport.sequenceType],
      sequenceToExport.sequenceString,
    );

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.Sequence3LetterCode,
    );
    const sequenceExportResult = await SaveStructureDialog(
      page,
    ).getTextAreaValue();

    if (sequenceToExport.differentSequenceExport) {
      expect(sequenceExportResult).toEqual(
        sequenceToExport.differentSequenceExport,
      );
    } else {
      expect(sequenceExportResult).toEqual(sequenceToExport.sequenceString);
    }

    await SaveStructureDialog(page).cancel();

    await verifyFileExport(
      page,
      `Sequence/Three-Letter/${sequenceToExport.sequenceDescription}.seq`,
      FileType.SEQ,
      SequenceFileFormat.threeLetter,
    );
  });
}
