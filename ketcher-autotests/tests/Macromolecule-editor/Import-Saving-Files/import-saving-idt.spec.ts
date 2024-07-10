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
  // selectOptionInDropdown,
  // pressButton,
  chooseFileFormat,
  readFileContents,
  moveMouseAway,
  getIdt,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

function removeNotComparableData(file: string) {
  return file.replaceAll('\r', '');
}
test.describe('Import-Saving .idt Files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test(`Import .idt file`, async ({ page }) => {
    await openFileAndAddToCanvasMacro('IDT/idt-a.idt', page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  // Fail while performance issue on Indigo side
  // test('Import incorrect data', async ({ page }) => {
  //   const randomText = '!+%45#asjfnsalkfl';
  //   await selectTopPanelButton(TopPanelButton.Open, page);
  //   await page.getByTestId('paste-from-clipboard-button').click();
  //   await page.getByTestId('open-structure-textarea').fill(randomText);
  //   await chooseFileFormat(page, 'IDT');
  //   await page.getByTestId('add-to-canvas-button').click();
  //   await takeEditorScreenshot(page);
  // });

  test('Check import of .ket file and save in .idt format', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro('KET/rna-a.ket', page);
    const expectedFile = await getIdt(page);
    await saveToFile('IDT/idt-rna-a.idt', expectedFile);

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: idtFileExpected, file: idtFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/IDT/idt-rna-a.idt',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(idtFile).toEqual(idtFileExpected);

    await takeEditorScreenshot(page);
  });

  test('Check that empty file can be saved in .idt format', async ({
    page,
  }) => {
    const expectedFile = await getIdt(page);
    await saveToFile('IDT/idt-empty.idt', expectedFile);

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: idtFileExpected, file: idtFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/IDT/idt-empty.idt',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(idtFile).toEqual(idtFileExpected);
  });

  test('Check that system does not let importing empty .idt file', async ({
    page,
  }) => {
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('IDT/idt-empty.idt', page);
    await page.getByText('Add to Canvas').isDisabled();
  });

  // Fail while performance issue on Indigo side
  // test('Check that system does not let uploading corrupted .idt file', async ({
  //   page,
  // }) => {
  //   await selectTopPanelButton(TopPanelButton.Open, page);
  //
  //   const filename = 'IDT/idt-corrupted.idt';
  //   await openFile(filename, page);
  //   await selectOptionInDropdown(filename, page);
  //   await pressButton(page, 'Add to Canvas');
  //   await takeEditorScreenshot(page);
  // });

  test('Should open .ket file and modify to .idt format in save modal textarea', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro('KET/rna-a.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'IDT');
    await page
      .getByTestId('dropdown-select')
      .getByRole('combobox')
      .allInnerTexts();

    const textArea = page.getByTestId('preview-area-text');
    const file = await readFileContents('tests/test-data/IDT/idt-rna-a.idt');
    const expectedData = removeNotComparableData(file);
    const valueInTextarea = removeNotComparableData(
      await textArea.inputValue(),
    );
    expect(valueInTextarea).toBe(expectedData);
  });

  test('Check import of .ket file with unresolved monomers and save in .idt format ', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro('KET/unresolved-monomers.ket', page);
    const expectedFile = await getIdt(page);
    await saveToFile('IDT/unresolved-monomers.idt', expectedFile);

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: idtFileExpected, file: idtFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/IDT/unresolved-monomers.idt',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(idtFile).toEqual(idtFileExpected);

    await takeEditorScreenshot(page);
  });
});
