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
  getSequence,
  moveMouseAway,
  openFileAndAddToCanvasAsNewProjectMacro,
  TypeDropdownOptions,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  SequenceType,
  PeptideType,
  MacroFileType,
} from '@utils';
import { closeErrorMessage, pageReload } from '@utils/common/helpers';
import {
  turnOnMacromoleculesEditor,
  zoomWithMouseWheel,
} from '@utils/macromolecules';

test.beforeEach(async ({ page }) => {
  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);
});

test.describe('Import-Saving .seq Files', () => {
  const sequenceFileTypes = ['DNA', 'RNA', 'Peptide'] as const;

  for (const fileType of sequenceFileTypes) {
    test(`Import .seq ${fileType} file`, async ({ page }) => {
      await pageReload(page);
      await openFileAndAddToCanvasMacro(
        `Sequence/sequence-${fileType.toLowerCase()}.seq`,
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
  //   await chooseFileFormat(page, 'Sequence');
  //   await page.getByTestId('add-to-canvas-button').click();
  //   await takeEditorScreenshot(page);
  // });

  test('Check that Ketcher can handle spaces and line breaks in FASTA file when it pasted from clipboard as sequence (single sequence)', async ({
    page,
  }) => {
    /*
    Test case: #3894
    Description: File pasted to canvas.
    */
    const fileContent = await readFileContents(
      'tests/test-data/Sequence/sequence-fasta-single-chain.seq',
    );
    await selectTopPanelButton(TopPanelButton.Open, page);
    await page.getByTestId('paste-from-clipboard-button').click();
    await page.getByTestId('open-structure-textarea').fill(fileContent);
    await chooseFileFormat(page, 'Sequence');
    await page.getByTestId('add-to-canvas-button').click();
    await takeEditorScreenshot(page);
  });

  test('Check import of .ket file and save in .seq format', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro('KET/rna-a.ket', page);
    const expectedFile = await getSequence(page);
    await saveToFile('Sequence/sequence-rna-a-expected.seq', expectedFile);

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: sequenceFileExpected, file: sequenceFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Sequence/sequence-rna-a-expected.seq',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(sequenceFile).toEqual(sequenceFileExpected);

    await takeEditorScreenshot(page);
  });

  test('Check that empty file can be saved in .seq format', async ({
    page,
  }) => {
    const expectedFile = await getSequence(page);
    await saveToFile('Sequence/sequence-empty.seq', expectedFile);

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: sequenceFileExpected, file: sequenceFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/Sequence/sequence-empty.seq',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(sequenceFile).toEqual(sequenceFileExpected);
  });

  test('Check that system does not let importing empty .seq file', async ({
    page,
  }) => {
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('Sequence/sequence-empty.seq', page);
    // await page.getByText('Add to Canvas').isDisabled();
    await expect(page.getByText('Add to Canvas')).toBeDisabled();
  });

  test('Check that system does not let uploading corrupted .seq file', async ({
    page,
  }) => {
    await selectTopPanelButton(TopPanelButton.Open, page);

    const filename = 'Sequence/sequence-corrupted.seq';
    await openFile(filename, page);
    await selectOptionInDropdown(filename, page);
    await pressButton(page, 'Add to Canvas');

    const errorDialog = page.getByLabel('Unsupported symbols').first();
    await errorDialog.waitFor({ state: 'visible' });
    await takeEditorScreenshot(page);
  });

  test('Validate correct displaying of snake viewed RNA chain loaded from .seq file format', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro(
      'Sequence/sequence-snake-mode-rna.seq',
      page,
    );
    await selectSnakeLayoutModeTool(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('Check that you can save snake viewed chain of peptides in a .seq file', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro(
      'Sequence/sequence-snake-mode-rna.seq',
      page,
    );
    await selectSnakeLayoutModeTool(page);
    const expectedFile = await getSequence(page);
    await saveToFile(
      'Sequence/sequence-snake-mode-rna-expected.seq',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: sequenceFileExpected, file: sequenceFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Sequence/sequence-snake-mode-rna-expected.seq',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(sequenceFile).toEqual(sequenceFileExpected);
  });

  test('Should open .ket file and modify to .seq format in save modal textarea', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro('KET/rna-a.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'Sequence (1-letter code)');
    await page
      .getByTestId('dropdown-select')
      .getByRole('combobox')
      .allInnerTexts();

    const textArea = page.getByTestId('preview-area-text');
    const file = await readFileContents(
      'tests/test-data/Sequence/sequence-rna-a.seq',
    );
    const expectedData = file;
    const valueInTextarea = await textArea.inputValue();
    expect(valueInTextarea).toBe(expectedData);
  });

  // Should not convert to Sequence type in case of there are more than one monomer type
  test('Should not convert .ket file with RNA and Peptide to .seq format in save modal', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro('KET/rna-and-peptide.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'Sequence (1-letter code)');

    await takeEditorScreenshot(page);
  });

  // Should not convert to Sequence type in case of there is any CHEM
  test('Should not convert .ket file with CHEMs to .seq format in save modal', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro('KET/chems-not-connected.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'Sequence (1-letter code)');

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
      await selectTopPanelButton(TopPanelButton.Open, page);
      await page.getByTestId('paste-from-clipboard-button').click();
      await page.getByTestId('open-structure-textarea').fill(Rna);
      await chooseFileFormat(page, 'Sequence');
      await page.getByTestId('add-to-canvas-button').click();
      await selectTopPanelButton(TopPanelButton.Open, page);
      await page.getByTestId('paste-from-clipboard-button').click();
      await page.getByTestId('open-structure-textarea').fill(Dna);
      await chooseFileFormat(page, 'Sequence');
      await page.getByTestId('add-to-canvas-button').click();
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
    await openFileAndAddToCanvasMacro('Sequence/sequence-acgtu.seq', page);
    // Need open twice
    await openFileAndAddToCanvasMacro('Sequence/sequence-acgtu.seq', page);
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
      'KET/Ambiguous-monomers/Peptides (that have mapping to library, alternatives).ket',
      page,
    );

    await zoomWithMouseWheel(page, -600);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'Sequence (1-letter code)');
    await takeEditorScreenshot(page);

    await pressButton(page, 'Cancel');
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
      await chooseFileFormat(page, 'Sequence (1-letter code)');
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

  test('Saving ambiguous peptides (without mapping, alternatives) in Sequence format', async ({
    page,
  }) => {
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
      'KET/Ambiguous-monomers/Peptides (that have no mapping to library, alternatives).ket',
      page,
    );

    await zoomWithMouseWheel(page, -200);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'Sequence (1-letter code)');
    await takeEditorScreenshot(page);

    test.fixme(
      true,
      `That test fails because of https://github.com/epam/Indigo/issues/2435, https://github.com/epam/Indigo/issues/2436 issue.`,
    );

    await closeErrorMessage(page);

    await pressButton(page, 'Cancel');
    await zoomWithMouseWheel(page, 200);
  });

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
        'KET/Ambiguous-monomers/Peptides (that have no mapping to library, mixed).ket',
        page,
      );

      await zoomWithMouseWheel(page, -200);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);

      await selectTopPanelButton(TopPanelButton.Save, page);
      await chooseFileFormat(page, 'Sequence (1-letter code)');
      await takeEditorScreenshot(page);

      test.fixme(
        true,
        `That test fails because of https://github.com/epam/Indigo/issues/2435, https://github.com/epam/Indigo/issues/2436 issue.`,
      );

      await closeErrorMessage(page);

      await pressButton(page, 'Cancel');
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
      'KET/Ambiguous-monomers/Ambiguous DNA Bases (alternatives).ket',
      page,
    );

    await zoomWithMouseWheel(page, -100);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'Sequence (1-letter code)');
    await takeEditorScreenshot(page);

    await pressButton(page, 'Cancel');
    await zoomWithMouseWheel(page, 100);
  });

  test(
    'Saving ambiguous DNA bases (with mapping, mixed) in Sequence format',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 15.6 Verify saving ambiguous DNA bases (with mapping, mixed) in Sequence format (macro mode)
    Case: 1. Load ambiguous bases (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose Sequence option
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
      await chooseFileFormat(page, 'Sequence (1-letter code)');
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
      'KET/Ambiguous-monomers/Ambiguous RNA Bases (alternatives).ket',
      page,
    );

    await zoomWithMouseWheel(page, -100);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'Sequence (1-letter code)');
    await takeEditorScreenshot(page);

    await pressButton(page, 'Cancel');
    await zoomWithMouseWheel(page, 100);
  });

  test(
    'Saving ambiguous RNA bases (with mapping, mixed) in Sequence format',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 15.8 Verify saving ambiguous RNA bases (with mapping, mixed) in Sequence format (macro mode)
    Case: 1. Load ambiguous bases (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose Sequence option
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
      await chooseFileFormat(page, 'Sequence (1-letter code)');
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
      'KET/Ambiguous-monomers/Ambiguous (common) Bases (alternatives).ket',
      page,
    );

    await zoomWithMouseWheel(page, -200);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'Sequence (1-letter code)');
    await takeEditorScreenshot(page);

    await pressButton(page, 'Cancel');
    await zoomWithMouseWheel(page, 200);
  });

  test(
    'Saving ambiguous (common) bases (with mapping, mixed) in Sequence format',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async ({ page }) => {
      /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 15.10 Verify saving ambiguous (common) bases (with mapping, mixed) in Sequence format (macro mode)
    Case: 1. Load ambiguous bases (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose Sequence option
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
      await chooseFileFormat(page, 'Sequence (1-letter code)');
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

test.describe('Import correct Sequence file: ', () => {
  interface ISequenceFile {
    SequenceDescription: string;
    SequenceFileName: string;
    SequenceType: TypeDropdownOptions;
    // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
    shouldFail?: boolean;
    // issueNumber is mandatory if shouldFail === true
    issueNumber?: string;
    // set pageReloadNeeded to true if you need to restart ketcher before test (f.ex. to restart font renderer)
    pageReloadNeeded?: boolean;
  }

  const correctSequenceFiles: ISequenceFile[] = [
    {
      // Test task: https://github.com/epam/ketcher/issues/5558
      SequenceDescription: '1. Ambiguous (common) Bases with DNA sugar',
      SequenceFileName:
        'Sequence/Ambiguous-Monomers/Ambiguous (common) Bases.seq',
      SequenceType: 'DNA',
      shouldFail: true,
      issueNumber: 'wrong labels screenshots',
    },
    {
      // Test task: https://github.com/epam/ketcher/issues/5558
      SequenceDescription: '2. Ambiguous (common) Bases with RNA sugar',
      SequenceFileName:
        'Sequence/Ambiguous-Monomers/Ambiguous (common) Bases.seq',
      SequenceType: 'RNA',
      shouldFail: true,
      issueNumber: "can't load in rc2",
    },
    {
      // Test task: https://github.com/epam/ketcher/issues/5558
      SequenceDescription: '3. Ambiguous DNA Bases',
      SequenceFileName: 'Sequence/Ambiguous-Monomers/Ambiguous DNA Bases.seq',
      SequenceType: 'DNA',
      shouldFail: true,
      issueNumber: 'wrong labels screenshots',
    },
    {
      // Test task: https://github.com/epam/ketcher/issues/5558
      SequenceDescription: '4. Ambiguous RNA Bases',
      SequenceFileName: 'Sequence/Ambiguous-Monomers/Ambiguous RNA Bases.seq',
      SequenceType: 'RNA',
      shouldFail: true,
      issueNumber: 'wrong labels screenshots',
    },
    {
      // Test task: https://github.com/epam/ketcher/issues/5558
      SequenceDescription: '5. Peptides (that have mapping to library)',
      SequenceFileName:
        'Sequence/Ambiguous-Monomers/Peptides (that have mapping to library).seq',
      SequenceType: 'Peptide',
      shouldFail: true,
      issueNumber: 'wrong labels screenshots',
    },
  ];

  for (const correctSequenceFile of correctSequenceFiles) {
    test(`${correctSequenceFile.SequenceDescription}`, async ({ page }) => {
      /*
      Description: Verify import of Sequence files works correct
      Case: 1. Load Sequence file 
            2. Take screenshot to make sure import works correct
      */
      if (correctSequenceFile.pageReloadNeeded) await pageReload(page);
      // Test should be skipped if related bug exists
      test.fixme(
        correctSequenceFile.shouldFail === true,
        `That test fails because of ${correctSequenceFile.issueNumber} issue.`,
      );

      await openFileAndAddToCanvasAsNewProjectMacro(
        correctSequenceFile.SequenceFileName,
        page,
        correctSequenceFile.SequenceType,
      );

      await takeEditorScreenshot(page);
    });
  }
});

interface ISequenceString {
  testCaseDescription: string;
  sequenceDescription: string;
  sequenceString: string;
  sequenceType:
    | Exclude<SequenceType, SequenceType.PEPTIDE>
    | [SequenceType.PEPTIDE, PeptideType];
  // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
  shouldFail?: boolean;
  // issueNumber is mandatory if shouldFail === true
  issueNumber?: string;
  // set pageReloadNeeded to true if you need to restart ketcher before test (f.ex. to restart font renderer)
  pageReloadNeeded?: boolean;
  // Some times export result is different to import string
  differentSequenceExport?: string;
}

const correctSequences: ISequenceString[] = [
  {
    testCaseDescription:
      '1. Verify import with valid three-letter codes in the sequence',
    sequenceDescription: 'Three letters peptide codes - part 1',
    sequenceString: 'AlaAsxCysAspGluPheGlyHisIle',
    sequenceType: [SequenceType.PEPTIDE, PeptideType.threeLetterCode],
  },
  {
    testCaseDescription:
      '1. Verify import with valid three-letter codes in the sequence',
    sequenceDescription: 'Three letters peptide codes - part 2',
    sequenceString: 'XleLysLeuMetAsnPylProGlnArg',
    sequenceType: [SequenceType.PEPTIDE, PeptideType.threeLetterCode],
  },
  {
    testCaseDescription:
      '1. Verify import with valid three-letter codes in the sequence',
    sequenceDescription: 'Three letters peptide codes - part 3',
    sequenceString: 'SerThrSecValTrpXaaTyrGlx',
    sequenceType: [SequenceType.PEPTIDE, PeptideType.threeLetterCode],
  },
  {
    testCaseDescription:
      '2. Verify that spaces separate different amino acid sequences in import',
    sequenceDescription: 'e.g. AlaAla CysCys',
    sequenceString:
      'AlaAsx CysAspGlu PheGlyHisIle XleLysLeuMetAsn PylProGlnArgSerThr SecValTrpXaaTyrGlx',
    sequenceType: [SequenceType.PEPTIDE, PeptideType.threeLetterCode],
  },
  {
    testCaseDescription: '3. Verify ignoring of line breaks during import',
    sequenceDescription: 'e.g. AlaGly\nCys',
    sequenceString:
      'Ala\nAsx\n\n Cys\n\n\nAsp\n\n\n\nGlu\n Phe\nGly\nHis\nIle \n\nXle\nLys\nLeu\nMet\nAsn Pyl\nPro\nGln\nArg\nSer\nThr\n SecValTrpXaaTyrGlx',
    sequenceType: [SequenceType.PEPTIDE, PeptideType.threeLetterCode],
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
    if (correctSequence.pageReloadNeeded) {
      await pageReload(page);
    }
    // Test should be skipped if related bug exists
    test.fixme(
      correctSequence.shouldFail === true,
      `That test fails because of ${correctSequence.issueNumber} issue.`,
    );

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      [MacroFileType.Sequence, correctSequence.sequenceType],
      correctSequence.sequenceString,
    );
    await zoomWithMouseWheel(page, -200);
    await takeEditorScreenshot(page);
  });
}
