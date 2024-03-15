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
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

function removeNotComparableData(file: string) {
  return file.replaceAll('\r', '');
}
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

  test('Import incorrect data', async ({ page }) => {
    const randomText = 'asjfnsalkfl';
    await selectTopPanelButton(TopPanelButton.Open, page);
    await page.getByTestId('paste-from-clipboard-button').click();
    await page.getByTestId('open-structure-textarea').fill(randomText);
    await chooseFileFormat(page, 'FASTA');
    await page.getByTestId('add-to-canvas-button').click();
    await takeEditorScreenshot(page);
  });

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
    await page.getByText('Add to Canvas').isDisabled();
  });

  test('Check that system does not let uploading corrupted .fasta file', async ({
    page,
  }) => {
    await selectTopPanelButton(TopPanelButton.Open, page);

    const filename = 'FASTA/fasta-corrupted.fasta';
    await openFile(filename, page);
    await selectOptionInDropdown(filename, page);
    await pressButton(page, 'Add to Canvas');
    await takeEditorScreenshot(page);
  });

  test('Validate correct displaying of snake viewed RNA chain loaded from .fasta file format', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro('FASTA/fasta-snake-mode-rna.fasta', page);
    await selectSnakeLayoutModeTool(page);
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
});
