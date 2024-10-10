/* eslint-disable no-magic-numbers */
import { test, expect } from '@playwright/test';
import {
  TopPanelButton,
  openFileAndAddToCanvasMacro,
  selectTopPanelButton,
  takeEditorScreenshot,
  waitForPageInit,
  saveToFile,
  openFile,
  receiveFileComparisonData,
  selectOptionInDropdown,
  pressButton,
  selectSnakeLayoutModeTool,
  chooseFileFormat,
  readFileContents,
  getFasta,
  moveMouseAway,
  selectSequenceLayoutModeTool,
  openFileAndAddToCanvasAsNewProject,
  openFileAndAddToCanvasAsNewProjectMacro,
  TypeDropdownOptions,
} from '@utils';
import { closeErrorMessage, pageReload } from '@utils/common/helpers';
import {
  turnOnMacromoleculesEditor,
  zoomWithMouseWheel,
} from '@utils/macromolecules';
import { clickOnSequenceSymbol } from '@utils/macromolecules/sequence';

function removeNotComparableData(file: string) {
  return file.replaceAll('\r', '');
}

test.beforeEach(async ({ page }) => {
  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);
});

test.describe('Import-Saving .fasta Files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  const fastaFileTypes = ['DNA', 'RNA', 'Peptide'] as const;

  for (const fileType of fastaFileTypes) {
    test(`Import .fasta ${fileType} file`, async ({ page }) => {
      await openFileAndAddToCanvasMacro(
        `FASTA/fasta-${fileType.toLowerCase()}.fasta`,
        page,
        fileType,
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    });
  }

  // Fail while performance issue on Indigo side
  // test('Import incorrect data', async ({ page }) => {
  //   const randomText = 'asjfnsalkfl';
  //   await selectTopPanelButton(TopPanelButton.Open, page);
  //   await page.getByTestId('paste-from-clipboard-button').click();
  //   await page.getByTestId('open-structure-textarea').fill(randomText);
  //   await chooseFileFormat(page, 'FASTA');
  //   await page.getByTestId('add-to-canvas-button').click();
  //   await takeEditorScreenshot(page);
  // });

  test('Check import of .ket file and save in .fasta format', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro('KET/rna-a.ket', page);
    const expectedFile = await getFasta(page);
    await saveToFile('FASTA/fasta-rna-a-expected.fasta', expectedFile);

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: fastaFileExpected, file: fastaFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/FASTA/fasta-rna-a-expected.fasta',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(fastaFile).toEqual(fastaFileExpected);

    await takeEditorScreenshot(page);
  });

  test('Check that empty file can be saved in .fasta format', async ({
    page,
  }) => {
    const expectedFile = await getFasta(page);
    await saveToFile('FASTA/fasta-empty.fasta', expectedFile);

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: fastaFileExpected, file: fastaFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/FASTA/fasta-empty.fasta',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(fastaFile).toEqual(fastaFileExpected);
  });

  test('Check that system does not let importing empty .fasta file', async ({
    page,
  }) => {
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('FASTA/fasta-empty.fasta', page);
    await expect(page.getByText('Add to Canvas')).toBeDisabled();
  });

  // Fail while performance issue on Indigo side
  // test('Check that system does not let uploading corrupted .fasta file', async ({
  //   page,
  // }) => {
  //   await selectTopPanelButton(TopPanelButton.Open, page);
  //
  //   const filename = 'FASTA/fasta-corrupted.fasta';
  //   await openFile(filename, page);
  //   await selectOptionInDropdown(filename, page);
  //   await pressButton(page, 'Add to Canvas');
  //   await takeEditorScreenshot(page);
  // });

  test('Validate correct displaying of snake viewed RNA chain loaded from .fasta file format', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro('FASTA/fasta-snake-mode-rna.fasta', page);
    await selectSnakeLayoutModeTool(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('Check that you can save snake viewed chain of peptides in a .fasta file', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro('FASTA/fasta-snake-mode-rna.fasta', page);
    await selectSnakeLayoutModeTool(page);
    const expectedFile = await getFasta(page);
    await saveToFile('FASTA/fasta-snake-mode-rna-expected.fasta', expectedFile);

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: fastaFileExpected, file: fastaFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/FASTA/fasta-snake-mode-rna-expected.fasta',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(fastaFile).toEqual(fastaFileExpected);
  });

  test('Should open .ket file and modify to .fasta format in save modal textarea', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro('KET/rna-a.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'FASTA');
    await page
      .getByTestId('dropdown-select')
      .getByRole('combobox')
      .allInnerTexts();

    const textArea = page.getByTestId('preview-area-text');
    const file = await readFileContents(
      'tests/test-data/FASTA/fasta-rna-a.fasta',
    );
    const expectedData = removeNotComparableData(file);
    const valueInTextarea = removeNotComparableData(
      await textArea.inputValue(),
    );
    expect(valueInTextarea).toBe(expectedData);
  });

  // Should not convert to Fasta type in case of there are more than one monomer type
  test('Should not convert .ket file with RNA and Peptide to .fasta format in save modal', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro('KET/rna-and-peptide.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'FASTA');

    await takeEditorScreenshot(page);
  });

  // Should not convert to Fasta type in case of there is any CHEM
  test('Should not convert .ket file with CHEMs to .fasta format in save modal', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro('KET/chems-not-connected.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'FASTA');

    await takeEditorScreenshot(page);
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
  //     await selectTopPanelButton(TopPanelButton.Open, page);
  //     await openFile(data.filename, page);
  //     await selectOptionInDropdown(data.filename, page);
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
  //   await selectTopPanelButton(TopPanelButton.Open, page);
  //
  //   const filename = 'FASTA/fasta-multiline-sequence.fasta';
  //   await openFile(filename, page);
  //   await selectOptionInDropdown(filename, page);
  //   await page.getByTestId('dropdown-select-type').click();
  //   await page.getByText('Peptide', { exact: true }).click();
  //   await pressButton(page, 'Add to Canvas');
  //   await takeEditorScreenshot(page);
  // });

  // test('Import FASTA: Verify error message if the first symbol is not ">"', async ({
  //   page,
  // }) => {
  //   await selectTopPanelButton(TopPanelButton.Open, page);
  //
  //   const filename = 'FASTA/fasta-without-greater-than-symbol.fasta';
  //   await openFile(filename, page);
  //   await selectOptionInDropdown(filename, page);
  //   await pressButton(page, 'Add to Canvas');
  //   await takeEditorScreenshot(page);
  // });

  // test('Import FASTA: Verify correct handling of "*" symbol for peptide sequences', async ({
  //   page,
  // }) => {
  //   await selectTopPanelButton(TopPanelButton.Open, page);
  //
  //   const filename = 'FASTA/fasta-with-asterisk-separator.fasta';
  //   await openFile(filename, page);
  //   await selectOptionInDropdown(filename, page);
  //   await page.getByTestId('dropdown-select-type').click();
  //   await page.getByText('Peptide', { exact: true }).click();
  //   await pressButton(page, 'Add to Canvas');
  //   await takeEditorScreenshot(page);
  //   await selectSequenceLayoutModeTool(page);
  //   await takeEditorScreenshot(page);
  // });

  test('Import FASTA: Verify ignoring header during import (i.e. if we load file with header - it will be lost on export - we do not store it)', async ({
    page,
  }) => {
    test.slow();
    await selectTopPanelButton(TopPanelButton.Open, page);

    const filename = 'FASTA/fasta-rna-musculus-rearranged.fasta';
    await openFile(filename, page);
    await selectOptionInDropdown(filename, page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Add to Canvas');
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'FASTA');
    await takeEditorScreenshot(page);
  });

  // Fail while performance issue on Indigo side
  // test('Import FASTA: Verify ignoring "-" symbol during import', async ({
  //   page,
  // }) => {
  //   await selectTopPanelButton(TopPanelButton.Open, page);
  //
  //   const filename = 'FASTA/fasta-with-dash-symbol.fasta';
  //   await openFile(filename, page);
  //   await selectOptionInDropdown(filename, page);
  //   await page.getByTestId('dropdown-select-type').click();
  //   await page.getByText('Peptide', { exact: true }).click();
  //   await pressButton(page, 'Add to Canvas');
  //   await takeEditorScreenshot(page);
  //   await selectSequenceLayoutModeTool(page);
  //   await moveMouseAway(page);
  //   await takeEditorScreenshot(page);
  // });

  test('Import FASTA: Verify recognition of "U" symbol as Selenocysteine for peptide sequences', async ({
    page,
  }) => {
    await selectTopPanelButton(TopPanelButton.Open, page);

    const filename = 'FASTA/fasta-with-selenocystein.fasta';
    await openFile(filename, page);
    await selectOptionInDropdown(filename, page);
    await page.getByTestId('dropdown-select-type').click();
    await page.getByText('Peptide', { exact: true }).click();
    await pressButton(page, 'Add to Canvas');
    await selectSequenceLayoutModeTool(page);
    await clickOnSequenceSymbol(page, 'U');
    await takeEditorScreenshot(page);
  });

  test('Export to FASTA: Verify correct export of DNA/RNA sequences with proper header', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro('KET/dna-rna-separate.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'FASTA');
    await takeEditorScreenshot(page);
  });

  test('Export to FASTA: Verify correct export of peptide sequences with proper header', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro(
      'KET/peptides-connected-with-bonds.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'FASTA');
    await takeEditorScreenshot(page);
  });

  test(
    'Export to FASTA: Verify ignoring CHEMs and RNA-monomers not part of nucleotides or nucleosides during export',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /* Test working incorrect now because we have bug https://github.com/epam/ketcher/issues/4626
    After fix screenshot should be updated.
    */
      await openFileAndAddToCanvasMacro('KET/rna-sequence-and-chems.ket', page);
      await selectTopPanelButton(TopPanelButton.Save, page);
      await chooseFileFormat(page, 'FASTA');
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Create cycled chain and side chain - save it to FASTA and sequence - verify that it is not supported and warning message occures',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /* Test working incorrect now because we have bug https://github.com/epam/ketcher/issues/4332
    Warning message NOT occures.
    After fix screenshot should be updated.
    */
      await openFileAndAddToCanvasMacro('KET/peptides-chain-cycled.ket', page);
      await selectSequenceLayoutModeTool(page);
      await selectTopPanelButton(TopPanelButton.Save, page);
      await chooseFileFormat(page, 'FASTA');
      await takeEditorScreenshot(page);
    },
  );

  test('Validate that unsplit nucleotides connected with another nucleotides could be saved to fasta file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with another nucleotides could be saved to fasta file and loaded back
    */

    await openFileAndAddToCanvasMacro(
      'KET/unsplit-nucleotides-connected-with-nucleotides.ket',
      page,
    );
    const expectedFile = await getFasta(page);
    await saveToFile(
      'FASTA//unsplit-nucleotides-connected-with-nucleotides.fasta',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: fastaFileExpected, file: fastaFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/FASTA/unsplit-nucleotides-connected-with-nucleotides.fasta',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(fastaFile).toEqual(fastaFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'FASTA/unsplit-nucleotides-connected-with-nucleotides.fasta',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Saving ambiguous peptides (with mapping, alternatives) in FASTA format', async ({
    page,
  }) => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 16.1 Verify saving ambiguous peptides (with mapping, alternatives) in FASTA format (macro mode)
    Case: 1. Load ambiguous peptides (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose FASTA option
          4. Take screenshot to make sure export is correct
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Ambiguous-monomers/Peptides (that have mapping to library, alternatives).ket',
      page,
    );

    await zoomWithMouseWheel(page, -600);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'FASTA');
    await takeEditorScreenshot(page);

    await pressButton(page, 'Cancel');
    await zoomWithMouseWheel(page, 600);
  });

  test(
    'Saving ambiguous peptides (with mapping, mixed) in FASTA format',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 16.2 Verify saving ambiguous peptides (with mapping, mixed) in FASTA format (macro mode)
    Case: 1. Load ambiguous peptides (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose FASTA option
          4. Take screenshot to make sure export is correct
    */
      await openFileAndAddToCanvasAsNewProjectMacro(
        'KET/Ambiguous-monomers/Peptides (that have mapping to library, mixed).ket',
        page,
      );

      await zoomWithMouseWheel(page, -600);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);

      await selectTopPanelButton(TopPanelButton.Save, page);
      await chooseFileFormat(page, 'FASTA');
      await takeEditorScreenshot(page);

      test.fixme(
        true,
        `That test fails because of https://github.com/epam/Indigo/issues/2435 issue.`,
      );

      await closeErrorMessage(page);

      await pressButton(page, 'Cancel');
      await zoomWithMouseWheel(page, 600);
    },
  );

  test('Saving ambiguous peptides (without mapping, alternatives) in FASTA format', async ({
    page,
  }) => {
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
      'KET/Ambiguous-monomers/Peptides (that have no mapping to library, alternatives).ket',
      page,
    );

    await zoomWithMouseWheel(page, -200);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'FASTA');
    await takeEditorScreenshot(page);

    await closeErrorMessage(page);

    await pressButton(page, 'Cancel');
    await zoomWithMouseWheel(page, 200);
  });

  test(
    'Saving ambiguous peptides (without mapping, mixed) in FASTA format',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
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
        'KET/Ambiguous-monomers/Peptides (that have no mapping to library, mixed).ket',
        page,
      );

      await zoomWithMouseWheel(page, -200);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);

      await selectTopPanelButton(TopPanelButton.Save, page);
      await chooseFileFormat(page, 'FASTA');
      await takeEditorScreenshot(page);

      await closeErrorMessage(page);

      await pressButton(page, 'Cancel');
      await zoomWithMouseWheel(page, 200);
      test.fixme(
        true,
        `That test fails because of https://github.com/epam/Indigo/issues/2435, https://github.com/epam/Indigo/issues/2436 issue.`,
      );
    },
  );

  test('Saving ambiguous DNA bases (with mapping, alternatives) in FASTA format', async ({
    page,
  }) => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 16.5 Verify saving ambiguous DNA bases (with mapping, alternatives) in FASTA format (macro mode)
    Case: 1. Load ambiguous bases (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose FASTA option
          4. Take screenshot to make sure export is correct
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Ambiguous-monomers/Ambiguous DNA Bases (alternatives).ket',
      page,
    );

    await zoomWithMouseWheel(page, -100);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'FASTA');
    await takeEditorScreenshot(page);

    await pressButton(page, 'Cancel');
    await zoomWithMouseWheel(page, 100);
  });

  test(
    'Saving ambiguous DNA bases (with mapping, mixed) in FASTA format',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 16.6 Verify saving ambiguous DNA bases (with mapping, mixed) in FASTA format (macro mode)
    Case: 1. Load ambiguous bases (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose FASTA option
          4. Take screenshot to make sure export is correct
    */
      await openFileAndAddToCanvasAsNewProjectMacro(
        'KET/Ambiguous-monomers/Ambiguous DNA Bases (mixed).ket',
        page,
      );

      await zoomWithMouseWheel(page, -100);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);

      await selectTopPanelButton(TopPanelButton.Save, page);
      await chooseFileFormat(page, 'FASTA');
      await takeEditorScreenshot(page);

      test.fixme(
        true,
        `That test fails because of https://github.com/epam/Indigo/issues/2435 issue.`,
      );

      await closeErrorMessage(page);

      await pressButton(page, 'Cancel');
      await zoomWithMouseWheel(page, 100);
    },
  );

  test('Saving ambiguous RNA bases (with mapping, alternatives) in FASTA format', async ({
    page,
  }) => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 16.7 Verify saving ambiguous RNA bases (with mapping, alternatives) in FASTA format (macro mode)
    Case: 1. Load ambiguous bases (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose FASTA option
          4. Take screenshot to make sure export is correct
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Ambiguous-monomers/Ambiguous RNA Bases (alternatives).ket',
      page,
    );

    await zoomWithMouseWheel(page, -100);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'FASTA');
    await takeEditorScreenshot(page);

    await pressButton(page, 'Cancel');
    await zoomWithMouseWheel(page, 100);
  });

  test(
    'Saving ambiguous RNA bases (with mapping, mixed) in FASTA format',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 16.8 Verify saving ambiguous RNA bases (with mapping, mixed) in FASTA format (macro mode)
    Case: 1. Load ambiguous bases (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose FASTA option
          4. Take screenshot to make sure export is correct
    */
      await openFileAndAddToCanvasAsNewProjectMacro(
        'KET/Ambiguous-monomers/Ambiguous RNA Bases (mixed).ket',
        page,
      );

      await zoomWithMouseWheel(page, -100);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);

      await selectTopPanelButton(TopPanelButton.Save, page);
      await chooseFileFormat(page, 'FASTA');
      await takeEditorScreenshot(page);

      test.fixme(
        true,
        `That test fails because of https://github.com/epam/Indigo/issues/2435 issue.`,
      );

      await closeErrorMessage(page);

      await pressButton(page, 'Cancel');
      await zoomWithMouseWheel(page, 100);
    },
  );

  test('Saving ambiguous (common) bases (with mapping, alternatives) in FASTA format', async ({
    page,
  }) => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 16.9 Verify saving ambiguous (common) bases (with mapping, alternatives) in FASTA format (macro mode)
    Case: 1. Load ambiguous bases (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose FASTA option
          4. Take screenshot to make sure export is correct
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Ambiguous-monomers/Ambiguous (common) Bases (alternatives).ket',
      page,
    );

    await zoomWithMouseWheel(page, -200);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'FASTA');
    await takeEditorScreenshot(page);

    await pressButton(page, 'Cancel');
    await zoomWithMouseWheel(page, 200);
  });

  test(
    'Saving ambiguous (common) bases (with mapping, mixed) in FASTA format',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 16.10 Verify saving ambiguous (common) bases (with mapping, mixed) in FASTA format (macro mode)
    Case: 1. Load ambiguous bases (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose FASTA option
          4. Take screenshot to make sure export is correct
    */
      await openFileAndAddToCanvasAsNewProjectMacro(
        'KET/Ambiguous-monomers/Ambiguous (common) Bases (mixed).ket',
        page,
      );

      await zoomWithMouseWheel(page, -200);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);

      await selectTopPanelButton(TopPanelButton.Save, page);
      await chooseFileFormat(page, 'FASTA');
      await takeEditorScreenshot(page);

      test.fixme(
        true,
        `That test fails because of https://github.com/epam/Indigo/issues/2435 issue.`,
      );

      await closeErrorMessage(page);

      await pressButton(page, 'Cancel');
      await zoomWithMouseWheel(page, 200);
    },
  );
});

test.describe('Import correct FASTA file: ', () => {
  interface IFASTAFile {
    FASTADescription: string;
    FASTAFileName: string;
    FASTAType: TypeDropdownOptions;
    // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
    shouldFail?: boolean;
    // issueNumber is mandatory if shouldFail === true
    issueNumber?: string;
    // set pageReloadNeeded to true if you need to restart ketcher before test (f.ex. to restart font renderer)
    pageReloadNeeded?: boolean;
  }

  const correctFASTAFiles: IFASTAFile[] = [
    {
      FASTADescription: '1. Ambiguous (common) Bases with DNA sugar',
      FASTAFileName: 'FASTA/Ambiguous-Monomers/Ambiguous (common) Bases.fasta',
      FASTAType: 'DNA',
      shouldFail: true,
      issueNumber: 'wrong labels screenshots',
    },
    {
      FASTADescription: '2. Ambiguous (common) Bases with RNA sugar',
      FASTAFileName: 'FASTA/Ambiguous-Monomers/Ambiguous (common) Bases.fasta',
      FASTAType: 'RNA',
      shouldFail: true,
      issueNumber: "can't load in rc2",
    },
    {
      FASTADescription: '3. Ambiguous DNA Bases',
      FASTAFileName: 'FASTA/Ambiguous-Monomers/Ambiguous DNA Bases.fasta',
      FASTAType: 'DNA',
      shouldFail: true,
      issueNumber: 'wrong labels screenshots',
    },
    {
      FASTADescription: '4. Ambiguous RNA Bases',
      FASTAFileName: 'FASTA/Ambiguous-Monomers/Ambiguous RNA Bases.fasta',
      FASTAType: 'RNA',
      shouldFail: true,
      issueNumber: 'wrong labels screenshots',
    },
    {
      FASTADescription: '5. Peptides (that have mapping to library)',
      FASTAFileName:
        'FASTA/Ambiguous-Monomers/Peptides (that have mapping to library).fasta',
      FASTAType: 'Peptide',
      shouldFail: true,
      issueNumber: 'wrong labels screenshots',
    },
  ];

  for (const correctFASTAFile of correctFASTAFiles) {
    test(`${correctFASTAFile.FASTADescription}`, async ({ page }) => {
      /*
      Test task: https://github.com/epam/ketcher/issues/5558
      Description: Verify import of FASTA files works correct
      Case: 1. Load FASTA file 
            2. Take screenshot to make sure import works correct
      */
      if (correctFASTAFile.pageReloadNeeded) await pageReload(page);
      // Test should be skipped if related bug exists
      test.fixme(
        correctFASTAFile.shouldFail === true,
        `That test fails because of ${correctFASTAFile.issueNumber} issue.`,
      );

      await openFileAndAddToCanvasAsNewProjectMacro(
        correctFASTAFile.FASTAFileName,
        page,
        correctFASTAFile.FASTAType,
      );

      await takeEditorScreenshot(page);
    });
  }
});
