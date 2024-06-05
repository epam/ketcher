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
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

test.describe('Import-Saving .seq Files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  const sequenceFileTypes = ['DNA', 'RNA', 'Peptide'] as const;

  for (const fileType of sequenceFileTypes) {
    test(`Import .seq ${fileType} file`, async ({ page }) => {
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
    await page.getByText('Add to Canvas').isDisabled();
  });

  test('Check that system does not let uploading corrupted .seq file', async ({
    page,
  }) => {
    await selectTopPanelButton(TopPanelButton.Open, page);

    const filename = 'Sequence/sequence-corrupted.seq';
    await openFile(filename, page);
    await selectOptionInDropdown(filename, page);
    await pressButton(page, 'Add to Canvas');
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
    await chooseFileFormat(page, 'Sequence');
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
    await chooseFileFormat(page, 'Sequence');

    await takeEditorScreenshot(page);
  });

  // Should not convert to Sequence type in case of there is any CHEM
  test('Should not convert .ket file with CHEMs to .seq format in save modal', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro('KET/chems-not-connected.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'Sequence');

    await takeEditorScreenshot(page);
  });

  test('RNA and DNA structures not overlay each other on canvas, when adding them through the "Paste from Clipboard"', async ({
    page,
  }) => {
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
  });

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
});
