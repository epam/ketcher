/* eslint-disable no-magic-numbers */
import { test, expect, Page } from '@fixtures';
import {
  openFileAndAddToCanvasMacro,
  waitForPageInit,
  openFile,
  moveMouseAway,
  openFileAndAddToCanvasAsNewProject,
  openFileAndAddToCanvasAsNewProjectMacro,
  takeEditorScreenshot,
  MacroFileType,
} from '@utils';
import { zoomWithMouseWheel } from '@utils/macromolecules';
import { getSymbolLocator } from '@utils/macromolecules/monomer';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { SequenceMonomerType } from '@tests/pages/constants/monomers/Constants';
import { PasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';
import { MacromoleculesFileFormatType } from '@tests/pages/constants/fileFormats/macroFileFormats';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';

// function removeNotComparableData(file: string) {
//   return file.replaceAll('\r', '');
// }

let page: Page;
test.beforeAll(async ({ initFlexCanvas }) => {
  page = await initFlexCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ FlexCanvas: _ }) => {
  // this empty function is needed
});

test.beforeEach(async ({ page }) => {
  await waitForPageInit(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
});

test.describe('Import-Saving .fasta Files', () => {
  const fastaFileTypes = [
    SequenceMonomerType.DNA,
    SequenceMonomerType.RNA,
    SequenceMonomerType.Peptide,
  ] as const;

  for (const fileType of fastaFileTypes) {
    test(`Import .fasta ${fileType} file`, async () => {
      await openFileAndAddToCanvasMacro(
        page,
        `FASTA/fasta-${fileType.toLowerCase()}.fasta`,
        [MacroFileType.FASTA, fileType],
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    });
  }

  test('Check import of .ket file and save in .fasta format', async () => {
    await openFileAndAddToCanvasMacro(page, 'KET/rna-a.ket');
    await verifyFileExport(
      page,
      'FASTA/fasta-rna-a-expected.fasta',
      FileType.FASTA,
    );
    await takeEditorScreenshot(page);
  });

  test('Check that empty file can be saved in .fasta format', async () => {
    await verifyFileExport(page, 'FASTA/fasta-empty.fasta', FileType.FASTA);
  });

  test('Check that system does not let importing empty .fasta file', async () => {
    const addToCanvasButton = PasteFromClipboardDialog(page).addToCanvasButton;
    await CommonTopLeftToolbar(page).openFile();
    await openFile(page, 'FASTA/fasta-empty.fasta');
    await expect(addToCanvasButton).toBeDisabled();
  });

  // Fail while performance issue on Indigo side
  // test('Check that system does not let uploading corrupted .fasta file', async ({
  //   page,
  // }) => {
  //   await CommonTopLeftToolbar(page).openFile();
  //
  //   const filename = 'FASTA/fasta-corrupted.fasta';
  //   await openFile(page, filename);
  //   await selectOptionInDropdown(filename, page);
  //   await pressButton(page, 'Add to Canvas');
  //   await takeEditorScreenshot(page);
  // });

  test('Validate correct displaying of snake viewed RNA chain loaded from .fasta file format', async () => {
    await openFileAndAddToCanvasMacro(
      page,
      'FASTA/fasta-snake-mode-rna.fasta',
      [MacroFileType.FASTA, SequenceMonomerType.RNA],
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Check that you can save snake viewed chain of peptides in a .fasta file', async () => {
    await openFileAndAddToCanvasMacro(
      page,
      'FASTA/fasta-snake-mode-rna.fasta',
      [MacroFileType.FASTA, SequenceMonomerType.RNA],
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await verifyFileExport(
      page,
      'FASTA/fasta-snake-mode-rna-expected.fasta',
      FileType.FASTA,
    );
  });

  test('Should open .ket file and modify to .fasta format in save modal textarea', async () => {
    await openFileAndAddToCanvasMacro(page, 'KET/rna-a.ket');
    await verifyFileExport(page, 'FASTA/fasta-rna-a.fasta', FileType.FASTA);
  });

  // Should not convert to Fasta type in case of there are more than one monomer type
  test('Should not convert .ket file with RNA and Peptide to .fasta format in save modal', async () => {
    await openFileAndAddToCanvasMacro(page, 'KET/rna-and-peptide.ket');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.FASTA,
    );
    const convertErrorMessage = await ErrorMessageDialog(
      page,
    ).getErrorMessage();
    const expectedErrorMessage =
      'Convert error! Error during sequence type recognition(RNA, DNA or Peptide)';
    expect(convertErrorMessage).toEqual(expectedErrorMessage);
  });

  // Should not convert to Fasta type in case of there is any CHEM
  test('Should not convert .ket file with CHEMs to .fasta format in save modal', async () => {
    await openFileAndAddToCanvasMacro(page, 'KET/chems-not-connected.ket');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.FASTA,
    );
    const convertErrorMessage = await ErrorMessageDialog(
      page,
    ).getErrorMessage();
    const expectedErrorMessage =
      'Convert error! Error during sequence type recognition(RNA, DNA or Peptide)';
    expect(convertErrorMessage).toEqual(expectedErrorMessage);
  });

  // const testData = [
  //   {
  //     filename: 'FASTA/fasta-dna-24.fasta',
  //     monomers: 'DNA',
  //   },
  //   {
  //     filename: 'FASTA/fasta-rna-musculus-rearranged.fasta',
  //     monomers: 'RNA',
  //   },
  //   {
  //     filename: 'FASTA/fasta-peptide.fasta',
  //     monomers: 'Peptide',
  //   },
  // ];

  // Fail while performance issue on Indigo side
  // for (const data of testData) {
  //   test(`Import FASTA: Verify correct import of sequences with valid header and ${data.monomers} monomers`, async ({
  //     page,
  //   }) => {
  //     await CommonTopLeftToolbar(page).openFile();
  //     await openFile(page, data.filename);
  //     await selectOptionInDropdown(data.filename);
  //
  //     if (data.monomers === 'Peptide') {
  //       await page.getByTestId('dropdown-select-type').click();
  //       await page.getByText(data.monomers, { exact: true }).click();
  //     }
  //
  //     await pressButton(page, 'Add to Canvas');
  //     await takeEditorScreenshot(page);
  //   });
  // }

  // Fail while performance issue on Indigo side
  // test('Import FASTA: Verify correct import of sequences with multi-line representation', async ({
  //   page,
  // }) => {
  //   await CommonTopLeftToolbar(page).openFile();
  //
  //   const filename = 'FASTA/fasta-multiline-sequence.fasta';
  //   await openFile(page, filename);
  //   await selectOptionInDropdown(filename, page);
  //   await page.getByTestId('dropdown-select-type').click();
  //   await page.getByText('Peptide', { exact: true }).click();
  //   await pressButton(page, 'Add to Canvas');
  //   await takeEditorScreenshot(page);
  // });

  // test('Import FASTA: Verify error message if the first symbol is not ">"', async ({
  //   page,
  // }) => {
  //   await CommonTopLeftToolbar(page).openFile();
  //
  //   const filename = 'FASTA/fasta-without-greater-than-symbol.fasta';
  //   await openFile(page, filename);
  //   await selectOptionInDropdown(filename, page);
  //   await pressButton(page, 'Add to Canvas');
  //   await takeEditorScreenshot(page);
  // });

  // test('Import FASTA: Verify correct handling of "*" symbol for peptide sequences', async ({
  //   page,
  // }) => {
  //   await CommonTopLeftToolbar(page).openFile();
  //
  //   const filename = 'FASTA/fasta-with-asterisk-separator.fasta';
  //   await openFile(page, filename);
  //   await selectOptionInDropdown(filename, page);
  //   await page.getByTestId('dropdown-select-type').click();
  //   await page.getByText('Peptide', { exact: true }).click();
  //   await pressButton(page, 'Add to Canvas');
  //   await takeEditorScreenshot(page);
  //   await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Sequence);
  //   await takeEditorScreenshot(page);
  // });

  test('Import FASTA: Verify ignoring header during import (i.e. if we load file with header - it will be lost on export - we do not store it)', async () => {
    const filename = 'FASTA/fasta-rna-musculus-rearranged.fasta';

    await openFileAndAddToCanvasMacro(page, filename, [
      MacroFileType.FASTA,
      SequenceMonomerType.RNA,
    ]);
    await verifyFileExport(
      page,
      'FASTA/fasta-rna-musculus-rearranged-expected.fasta',
      FileType.FASTA,
    );
  });

  // Fail while performance issue on Indigo side
  // test('Import FASTA: Verify ignoring "-" symbol during import', async ({
  //   page,
  // }) => {
  //   await CommonTopLeftToolbar(page).openFile();
  //
  //   const filename = 'FASTA/fasta-with-dash-symbol.fasta';
  //   await openFile(page, filename);
  //   await selectOptionInDropdown(filename, page);
  //   await page.getByTestId('dropdown-select-type').click();
  //   await page.getByText('Peptide', { exact: true }).click();
  //   await pressButton(page, 'Add to Canvas');
  //   await takeEditorScreenshot(page);
  //   await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Sequence);
  //   await moveMouseAway(page);
  //   await takeEditorScreenshot(page);
  // });

  test('Import FASTA: Verify recognition of "U" symbol as Selenocysteine for peptide sequences', async () => {
    const filename = 'FASTA/fasta-with-selenocystein.fasta';
    await openFileAndAddToCanvasMacro(page, filename, [
      MacroFileType.FASTA,
      SequenceMonomerType.Peptide,
    ]);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await getSymbolLocator(page, {
      symbolAlias: 'U',
      nodeIndexOverall: 4,
    }).click();
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await takeEditorScreenshot(page);
  });

  test('Export to FASTA: Verify correct export of DNA/RNA sequences with proper header', async () => {
    await openFileAndAddToCanvasMacro(page, 'KET/dna-rna-separate.ket');

    await verifyFileExport(
      page,
      'FASTA/fasta-dna-rna-separate.fasta',
      FileType.FASTA,
    );
  });

  test('Export to FASTA: Verify correct export of peptide sequences with proper header', async () => {
    await openFileAndAddToCanvasMacro(
      page,
      'KET/peptides-connected-with-bonds.ket',
    );

    await verifyFileExport(
      page,
      'FASTA/fasta-peptides-connected-with-bonds.fasta',
      FileType.FASTA,
    );
  });

  test(
    'Export to FASTA: Verify ignoring CHEMs and RNA-monomers not part of nucleotides or nucleosides during export',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /* Test working incorrect now because we have bug https://github.com/epam/ketcher/issues/4626
    After fix screenshot should be updated.
    */
      await openFileAndAddToCanvasMacro(page, 'KET/rna-sequence-and-chems.ket');
      await CommonTopLeftToolbar(page).saveFile();
      await SaveStructureDialog(page).chooseFileFormat(
        MacromoleculesFileFormatType.FASTA,
      );
      const convertErrorMessage = await ErrorMessageDialog(
        page,
      ).getErrorMessage();
      const expectedErrorMessage =
        'Convert error! Error during sequence type recognition(RNA, DNA or Peptide)';
      expect(convertErrorMessage).toEqual(expectedErrorMessage);
    },
  );

  test(
    'Create cycled chain and side chain - save it to FASTA and sequence - verify that it is not supported and warning message occures',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /* Test working incorrect now because we have bug https://github.com/epam/ketcher/issues/4332
    Warning message NOT occures.
    After fix screenshot should be updated.
    */
      await openFileAndAddToCanvasMacro(page, 'KET/peptides-chain-cycled.ket');
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Sequence,
      );
      await CommonTopLeftToolbar(page).saveFile();
      await SaveStructureDialog(page).chooseFileFormat(
        MacromoleculesFileFormatType.FASTA,
      );
      await takeEditorScreenshot(page);
    },
  );

  test('Validate that unsplit nucleotides connected with another nucleotides could be saved to fasta file and loaded back', async () => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with another nucleotides could be saved to fasta file and loaded back
    */

    await openFileAndAddToCanvasMacro(
      page,
      'KET/unsplit-nucleotides-connected-with-nucleotides.ket',
    );
    await verifyFileExport(
      page,
      'FASTA/unsplit-nucleotides-connected-with-nucleotides.fasta',
      FileType.FASTA,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'FASTA/unsplit-nucleotides-connected-with-nucleotides.fasta',
    );
    await takeEditorScreenshot(page);
  });

  test('Saving ambiguous peptides (with mapping, alternatives) in FASTA format', async () => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous-monomers/Peptides (that have mapping to library, alternatives).ket',
    );
    await verifyFileExport(
      page,
      'FASTA/fasta-Peptides (that have mapping to library, alternatives).fasta',
      FileType.FASTA,
    );
  });

  test(
    'Saving ambiguous peptides (with mapping, mixed) in FASTA format',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 16.2 Verify saving ambiguous peptides (with mapping, mixed) in FASTA format (macro mode)
    Case: 1. Load ambiguous peptides (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose FASTA option
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
        MacromoleculesFileFormatType.FASTA,
      );
      await takeEditorScreenshot(page);

      await SaveStructureDialog(page).cancel();
      await zoomWithMouseWheel(page, 600);
    },
  );

  test('Saving ambiguous peptides (without mapping, alternatives) in FASTA format', async () => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 16.3 Verify saving ambiguous peptides (without mapping, alternatives) in FASTA format (macro mode)
    Case: 1. Load ambiguous peptides (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose FASTA option
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
      MacromoleculesFileFormatType.FASTA,
    );
    await takeEditorScreenshot(page);

    await SaveStructureDialog(page).cancel();
    await zoomWithMouseWheel(page, 200);
  });

  test(
    'Saving ambiguous peptides (without mapping, mixed) in FASTA format',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 16.4 Verify saving ambiguous peptides (without mapping, mixed) in FASTA format (macro mode)
    Case: 1. Load ambiguous peptides (that have mapping to library, mixed) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose FASTA option
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
        MacromoleculesFileFormatType.FASTA,
      );
      await takeEditorScreenshot(page);

      await SaveStructureDialog(page).cancel();
      await zoomWithMouseWheel(page, 200);
    },
  );

  test('Saving ambiguous DNA bases (with mapping, alternatives) in FASTA format', async () => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous-monomers/Ambiguous DNA Bases (alternatives).ket',
    );

    await verifyFileExport(
      page,
      'FASTA/Ambiguous-Monomers/Ambiguous DNA Bases (alternatives).fasta',
      FileType.FASTA,
    );
  });

  test(
    'Saving ambiguous DNA bases (with mapping, mixed) in FASTA format',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 16.6 Verify saving ambiguous DNA bases (with mapping, mixed) in FASTA format (macro mode)
    Case: 1. Load ambiguous bases (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose FASTA option
          4. System should not allow to save and show error message
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
        MacromoleculesFileFormatType.FASTA,
      );
      const errorMessage = await ErrorMessageDialog(page).getErrorMessage();
      expect(errorMessage).toContain(
        "Convert error! Sequence saver: Can't save '%' to sequence format",
      );
      await ErrorMessageDialog(page).close();

      await SaveStructureDialog(page).cancel();
      await zoomWithMouseWheel(page, 100);
    },
  );

  test('Saving ambiguous RNA bases (with mapping, alternatives) in FASTA format', async () => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous-monomers/Ambiguous RNA Bases (alternatives).ket',
    );

    await verifyFileExport(
      page,
      'FASTA/Ambiguous-Monomers/Ambiguous RNA Bases (alternatives).fasta',
      FileType.FASTA,
    );
  });

  test(
    'Saving ambiguous RNA bases (with mapping, mixed) in FASTA format',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 16.8 Verify saving ambiguous RNA bases (with mapping, mixed) in FASTA format (macro mode)
    Case: 1. Load ambiguous bases (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose FASTA option
          4. Take screenshot to make sure export is correct
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
        MacromoleculesFileFormatType.FASTA,
      );
      const errorMessage = await ErrorMessageDialog(page).getErrorMessage();
      expect(errorMessage).toContain(
        "Convert error! Sequence saver: Can't save '%' to sequence format",
      );
      await ErrorMessageDialog(page).close();

      await SaveStructureDialog(page).cancel();
      await zoomWithMouseWheel(page, 100);
    },
  );

  test('Saving ambiguous (common) bases (with mapping, alternatives) in FASTA format', async () => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous-monomers/Ambiguous (common) Bases (alternatives).ket',
    );

    await verifyFileExport(
      page,
      'FASTA/Ambiguous-Monomers/Ambiguous (common) Bases (alternatives).fasta',
      FileType.FASTA,
    );
  });

  test(
    'Saving ambiguous (common) bases (with mapping, mixed) in FASTA format',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 16.10 Verify saving ambiguous (common) bases (with mapping, mixed) in FASTA format (macro mode)
    Case: 1. Load ambiguous bases (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose FASTA option
          4. Take screenshot to make sure export is correct
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
        MacromoleculesFileFormatType.FASTA,
      );
      const errorMessage = await ErrorMessageDialog(page).getErrorMessage();
      expect(errorMessage).toContain(
        "Convert error! Sequence saver: Can't save '%' to sequence format",
      );
      await ErrorMessageDialog(page).close();

      await SaveStructureDialog(page).cancel();
      await zoomWithMouseWheel(page, 200);
    },
  );
});

test.describe('Import correct FASTA file: ', () => {
  interface IFASTAFile {
    FASTADescription: string;
    FASTAFileName: string;
    FASTAType: SequenceMonomerType;
    // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
    shouldFail?: boolean;
    // issueNumber is mandatory if shouldFail === true
    issueNumber?: string;
  }

  const correctFASTAFiles: IFASTAFile[] = [
    {
      FASTADescription: '1. Ambiguous (common) Bases with DNA sugar',
      FASTAFileName: 'FASTA/Ambiguous-Monomers/Ambiguous (common) Bases.fasta',
      FASTAType: SequenceMonomerType.DNA,
      shouldFail: true,
      issueNumber: 'wrong labels screenshots',
    },
    {
      FASTADescription: '2. Ambiguous (common) Bases with RNA sugar',
      FASTAFileName: 'FASTA/Ambiguous-Monomers/Ambiguous (common) Bases.fasta',
      FASTAType: SequenceMonomerType.RNA,
      shouldFail: true,
      issueNumber: "can't load in rc2",
    },
    {
      FASTADescription: '3. Ambiguous DNA Bases',
      FASTAFileName: 'FASTA/Ambiguous-Monomers/Ambiguous DNA Bases.fasta',
      FASTAType: SequenceMonomerType.DNA,
      shouldFail: true,
      issueNumber: 'wrong labels screenshots',
    },
    {
      FASTADescription: '4. Ambiguous RNA Bases',
      FASTAFileName: 'FASTA/Ambiguous-Monomers/Ambiguous RNA Bases.fasta',
      FASTAType: SequenceMonomerType.RNA,
      shouldFail: true,
      issueNumber: 'wrong labels screenshots',
    },
    {
      FASTADescription: '5. Peptides (that have mapping to library)',
      FASTAFileName:
        'FASTA/Ambiguous-Monomers/Peptides (that have mapping to library).fasta',
      FASTAType: SequenceMonomerType.Peptide,
      shouldFail: true,
      issueNumber: 'wrong labels screenshots',
    },
  ];

  for (const correctFASTAFile of correctFASTAFiles) {
    test(`${correctFASTAFile.FASTADescription}`, async () => {
      /*
      Test task: https://github.com/epam/ketcher/issues/5558
      Description: Verify import of FASTA files works correct
      Case: 1. Load FASTA file 
            2. Take screenshot to make sure import works correct
      */

      // Test should be skipped if related bug exists
      test.fixme(
        correctFASTAFile.shouldFail === true,
        `That test fails because of ${correctFASTAFile.issueNumber} issue.`,
      );

      await openFileAndAddToCanvasAsNewProjectMacro(
        page,
        correctFASTAFile.FASTAFileName,
        MacroFileType.FASTA,
      );

      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });
    });
  }
});
