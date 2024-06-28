import { test, expect, Page } from '@playwright/test';
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
  selectSequenceLayoutModeTool,
  selectSnakeLayoutModeTool,
  waitForLoad,
  pressButton,
  selectMacromoleculesPanelButton,
  MacromoleculesTopPanelButton,
} from '@utils';
import {
  enterSequence,
  turnOnMacromoleculesEditor,
} from '@utils/macromolecules';

async function pasteFromClipboardAndAddToMacromoleculesCanvas(
  page: Page,
  structureFormat: string,
  fillStructure: string,
  needToWait = true,
) {
  await selectMacromoleculesPanelButton(
    MacromoleculesTopPanelButton.Open,
    page,
  );
  await page.getByText('Paste from clipboard').click();
  if (!(structureFormat === 'Ket')) {
    await page.getByRole('combobox').click();
    await page.getByText(structureFormat).click();
  }

  await page.getByRole('dialog').getByRole('textbox').fill(fillStructure);
  if (needToWait) {
    await waitForLoad(page, async () => {
      await pressButton(page, 'Add to Canvas');
    });
  } else {
    await pressButton(page, 'Add to Canvas');
  }
}

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

  const fileNames = [
    'DNA-All-PS',
    '2-MOE-DNA-chimera-All-PS',
    'Affinity-Plus-DNA-chimera-All-PS',
    '2-OMe-DNA-chimera-All-PS',
    'Gapmer-with-5-Methylcytosine',
  ];

  for (const fileName of fileNames) {
    test(`Verify import of ${fileName} sequence with modifications from IDT format using Open file (Sequence mode/Flex/Snake) `, async ({
      page,
    }) => {
      /*
    Test case: Import/Saving files/4310
    Description: Structure is opening
    */
      await openFileAndAddToCanvasMacro(`IDT/${fileName}.idt`, page);
      await takeEditorScreenshot(page);
      await selectSequenceLayoutModeTool(page);
      await takeEditorScreenshot(page);
      await selectSnakeLayoutModeTool(page);
      await takeEditorScreenshot(page);
    });
  }

  const fileNames1 = [
    'A*C*G*C*G*C*G*A*C*T*A*T*A*C*G*C*G*C*C*T',
    '/52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*C*G*A*C*T*A*T*A*C*G*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErC/*/32MOErT/',
    '+G*+C*+G*C*G*A*C*T*A*T*A*C*G*+C*+G*+C',
    'mA*mC*mG*mC*mG*C*G*A*C*T*A*T*A*C*G*mC*mG*mC*mC*mU',
    '/52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/*G*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErC/*/32MOErT/',
  ];

  for (const fileName of fileNames1) {
    test(`Verify import of ${fileName} sequence with modifications from IDT format using Paste from Clipboard (Sequence mode/Flex/Snake) `, async ({
      page,
    }) => {
      /*
    Test case: Import/Saving files/4310
    Description: Structure is opening
    */
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        'IDT',
        `${fileName}`,
      );
      await takeEditorScreenshot(page);
      await selectSequenceLayoutModeTool(page);
      await takeEditorScreenshot(page);
      await selectSnakeLayoutModeTool(page);
      await takeEditorScreenshot(page);
    });
  }

  test('Verify error handling for invalid sequences with modifications during import from Paste from Clipboard', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files/4310
    Description: Error appears
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      'IDT',
      `A*C*G*C*G*C*G*A*C*T*
      A*T*A*C*G*C*G*C*C*T`,
      false,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that sequences with modifications can be edited after import', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files/4310
    Description: Sequences with modifications can be edited after import
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      'IDT',
      `A*C*G*C*G*C*G*A*C*T*A*T*A*C*G*C*G*C*C*T`,
    );
    await selectSequenceLayoutModeTool(page);
    await page.getByText('G').locator('..').first().click({ button: 'right' });
    await page.getByTestId('edit_sequence').click();
    await enterSequence(page, 'ttt');
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page);
  });

  test('Verify export of sequences with modifications from IDT format using API (getIdt)', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files/4310
    Description: Sequences are exported by getIdt
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      'IDT',
      `A*C*G*C*G*C*G*A*C*T*A*T*A*C*G*C*G*C*C*T`,
    );
    await selectSequenceLayoutModeTool(page);
    const expectedFile = await getIdt(page);
    await saveToFile('IDT/idt-expected.idt', expectedFile);

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: idtFileExpected, file: idtFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/IDT/idt-expected.idt',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(idtFile).toEqual(idtFileExpected);
    await takeEditorScreenshot(page);
  });

  test('Verify export of sequences with modifications from IDT format using Save file(Flex mode)', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files/4310
    Description: IDT appears in save preview
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      'IDT',
      `A*C*G*C*G*C*G*A*C*T*A*T*A*C*G*C*G*C*C*T`,
    );
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'IDT');
    await takeEditorScreenshot(page);
  });

  test('Verify export of sequences with modifications from IDT format using Save file(Sequence mode)', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files/4310
    Description: IDT appears in save preview
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      'IDT',
      `+G*+C*+G*C*G*A*C*T*A*T*A*C*G*+C*+G*+C`,
    );
    await selectSequenceLayoutModeTool(page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'IDT');
    await takeEditorScreenshot(page);
  });
});
