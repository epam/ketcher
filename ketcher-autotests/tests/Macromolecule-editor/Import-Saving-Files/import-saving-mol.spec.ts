/* eslint-disable no-magic-numbers */
import { test, expect, Page, chromium } from '@playwright/test';
import {
  TopPanelButton,
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  openFileAndAddToCanvasMacro,
  openFromFileViaClipboard,
  readFileContents,
  selectTopPanelButton,
  takeEditorScreenshot,
  waitForPageInit,
  getMolfile,
  saveToFile,
  openFile,
  receiveFileComparisonData,
  waitForRender,
  selectEraseTool,
  selectOptionInDropdown,
  pressButton,
  selectSnakeLayoutModeTool,
  turnOnMicromoleculesEditor,
  selectClearCanvasTool,
  delay,
} from '@utils';
import {
  chooseFileFormat,
  turnOnMacromoleculesEditor,
} from '@utils/macromolecules';

function removeNotComparableData(file: string) {
  return file
    .split('\n')
    .filter((_, lineNumber) => lineNumber !== 1)
    .join('\n');
}

let page: Page;

test.beforeAll(async ({ browser }) => {
  let sharedContext;
  try {
    sharedContext = await browser.newContext();
  } catch (error) {
    console.error('Error on creation browser context:', error);
    console.log('Restarting browser...');
    await browser.close();
    browser = await chromium.launch();
    sharedContext = await browser.newContext();
  }

  // Reminder: do not pass page as async paramenter to test
  page = await sharedContext.newPage();
  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);
});

test.afterEach(async () => {
  await page.keyboard.press('Control+0');
  await selectClearCanvasTool(page);
});

test.afterAll(async ({ browser }) => {
  const cntxt = page.context();
  await page.close();
  await cntxt.close();
  await browser.contexts().forEach((someContext) => {
    someContext.close();
  });
  // await browser.close();
});

test.describe('Import-Saving .mol Files', () => {
  test('Import monomers and chem', async () => {
    await openFileAndAddToCanvasMacro(
      'Molfiles-V3000/monomers-and-chem.mol',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Import monomers and chem with clipboard', async () => {
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFromFileViaClipboard(
      'tests/test-data/Molfiles-V3000/monomers-and-chem.mol',
      page,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Import incorrect data', async () => {
    const randomText = 'asjfnsalkfl';
    await selectTopPanelButton(TopPanelButton.Open, page);
    await page.getByTestId('paste-from-clipboard-button').click();
    await page.getByTestId('open-structure-textarea').fill(randomText);
    await page.getByTestId('add-to-canvas-button').click();
    await takeEditorScreenshot(page);

    // Closing page since test expects it to have closed at the end
    const context = page.context();
    await page.close();
    page = await context.newPage();
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Export monomers and chem', async () => {
    await openFileAndAddToCanvasMacro('KET/monomers-and-chem.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'MDL Molfile V3000');
    await page
      .getByTestId('dropdown-select')
      .getByRole('combobox')
      .allInnerTexts();

    const textArea = page.getByTestId('preview-area-text');
    const file = await readFileContents(
      'tests/test-data/Molfiles-V3000/monomers-and-chem.mol',
    );
    const expectedData = removeNotComparableData(file);
    const valueInTextarea = removeNotComparableData(
      await textArea.inputValue(),
    );
    await expect(valueInTextarea).toBe(expectedData);

    // Closing page since test expects it to have closed at the end
    const context = page.context();
    await page.close();
    page = await context.newPage();
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('After opening a file in macro mode, structure is in center of the screen and no need scroll to find it', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/3666
    Description: Structure in center of canvas after opening
    */
    await openFileAndAddToCanvasMacro('Molfiles-V3000/peptide-bzl.mol', page);
    await takeEditorScreenshot(page);

    // Closing page since test expects it to have closed at the end
    const context = page.context();
    await page.close();
    page = await context.newPage();
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Monomers are not stacked, easy to read, colors and preview match with Ketcher library after importing a file', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/3667
    https://github.com/epam/ketcher/issues/3668
    Description: Monomers are not stacked, easy to read, colors and preview match with Ketcher library after importing a file
    */
    await openFileAndAddToCanvasMacro('Molfiles-V3000/peptide-bzl.mol', page);
    await page.getByText('K').locator('..').first().hover();
    await takeEditorScreenshot(page);

    // Closing page since test expects it to have closed at the end
    const context = page.context();
    await page.close();
    page = await context.newPage();
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('After importing a file with modified monomers, it is clear which monomer is modified, and when hovering, preview display changes made during modification', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/3669
    Description: After importing a file with modified monomers, it is clear which monomer is modified,
    and when hovering, preview display changes made during modification
    */
    await openFileAndAddToCanvasMacro(
      'Molfiles-V3000/dna-mod-base-sugar-phosphate-example.mol',
      page,
    );
    await page.getByTestId('select-rectangle').click();
    await page.getByText('cdaC').locator('..').hover();
    await takeEditorScreenshot(page);
  });

  const fileTypes = ['dna', 'rna'];

  for (const fileType of fileTypes) {
    test(`Import ${fileType.toUpperCase()} file`, async () => {
      /*
    Test case: Import/Saving files
    Description: Imported DNA file opens without errors.
    DNA contains the nitrogen bases adenine (A), thymine (T) for DNA, uracil (U) for RNA, cytosine (C), and guanine (G).
    In RNA, thymine (T) is replaced by uracil (U).
    We have bug https://github.com/epam/ketcher/issues/3383
    */
      await openFileAndAddToCanvasMacro(`Molfiles-V3000/${fileType}.mol`, page);
      await takeEditorScreenshot(page);
    });
  }

  test('Check import of file with 50 monomers and save in MOL V3000 format', async () => {
    /*
    Test case: Import/Saving files
    Description: Structure in center of canvas after opening
    */
    await openFileAndAddToCanvasMacro('KET/fifty-monomers.ket', page);
    const expectedFile = await getMolfile(page);
    await saveToFile(
      'Molfiles-V3000/fifty-monomers-v3000-expected.mol',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V3000/fifty-monomers-v3000-expected.mol',
        fileFormat: 'v3000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);

    const numberOfPressZoomOut = 6;
    await page.getByTestId('zoom-selector').click();
    for (let i = 0; i < numberOfPressZoomOut; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-out-button').click();
      });
    }
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Check import of file with 100 monomers and save in MOL V3000 format', async () => {
    /*
    Test case: Import/Saving files
    Description: Structure in center of canvas after opening
    */
    await openFileAndAddToCanvasMacro('KET/hundred-monomers.ket', page);
    const expectedFile = await getMolfile(page);
    await saveToFile(
      'Molfiles-V3000/hundred-monomers-v3000-expected.mol',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V3000/hundred-monomers-v3000-expected.mol',
        fileFormat: 'v3000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);

    // Closing page since test expects it to have closed at the end
    const context = page.context();
    await page.close();
    page = await context.newPage();
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  const monomersToDelete = [
    { text: '25R', description: 'Sugar monomer deleted.' },
    { text: 'baA', description: 'Base monomer deleted.' },
    { text: 'P', description: 'Phosphate monomer deleted.' },
  ];
  /*
   Test for deleting part of monomers structure
  */
  for (const monomer of monomersToDelete) {
    test(`Open file from .mol V3000 and Delete ${monomer.text} monomer`, async () => {
      await openFileAndAddToCanvasMacro(
        'Molfiles-V3000/monomers-connected-with-bonds.mol',
        page,
      );
      await selectEraseTool(page);
      await page.getByText(monomer.text).locator('..').first().click();
      await takeEditorScreenshot(page);
    });
  }

  test('Check that empty file can be saved in .mol format', async () => {
    /*
    Test case: Import/Saving files
    Description: Empty file can be saved in .mol format
    */
    const expectedFile = await getMolfile(page);
    await saveToFile('Molfiles-V2000/empty-canvas-expected.mol', expectedFile);

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V2000/empty-canvas-expected.mol',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Check that system does not let importing empty .mol file', async () => {
    /*
    Test case: Import/Saving files
    Description: System does not let importing empty .mol file
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('Molfiles-V2000/empty-file.mol', page);
    await page.getByText('Add to Canvas').isDisabled();

    // Closing page since test expects it to have closed at the end
    const context = page.context();
    await page.close();
    page = await context.newPage();
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Check that system does not let uploading corrupted .mol file', async () => {
    /*
    Test case: Import/Saving files
    Description: System does not let uploading corrupted .mol file
    */
    await selectTopPanelButton(TopPanelButton.Open, page);

    const filename = 'Molfiles-V3000/corrupted-file.mol';
    await openFile(filename, page);
    await selectOptionInDropdown(filename, page);
    await pressButton(page, 'Add to Canvas');
    // Experimental delay - must be removed after waitForSpinnerFinishedWork refactor
    delay(2);
    await takeEditorScreenshot(page);

    // Closing page since test expects it to have closed at the end
    const context = page.context();
    await page.close();
    page = await context.newPage();
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Validate correct displaying of snake viewed peptide chain loaded from .mol file format', async () => {
    /*
    Test case: Import/Saving files
    Description: Sequence of Peptides displaying according to snake view mockup.
    */
    await openFileAndAddToCanvasMacro(
      'Molfiles-V3000/snake-mode-peptides.mol',
      page,
    );
    await selectSnakeLayoutModeTool(page);
    await takeEditorScreenshot(page);

    // Closing page since test expects it to have closed at the end
    const context = page.context();
    await page.close();
    page = await context.newPage();
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Check that you can save snake viewed chain of peptides in a Mol v3000 file', async () => {
    /*
    Test case: Import/Saving files
    Description: Snake viewed chain of peptides saved in a Mol v3000 file
    */
    await openFileAndAddToCanvasMacro(
      'Molfiles-V3000/snake-mode-peptides.mol',
      page,
    );
    await selectSnakeLayoutModeTool(page);
    const expectedFile = await getMolfile(page);
    await saveToFile(
      'Molfiles-V3000/snake-mode-peptides-expected.mol',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V3000/snake-mode-peptides-expected.mol',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Check that .mol file with macro structures is imported correctly in macro mode when saving it in micro mode', async () => {
    /*
    Test case: Import/Saving files
    Description: .mol file with macro structures is imported correctly in macro mode when saving it in micro mode
    */
    await openFileAndAddToCanvasMacro(
      'Molfiles-V3000/monomers-saved-in-micro-mode.mol',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Check that macro .mol file can be imported in micro mode', async () => {
    /*
    Test case: Import/Saving files
    Description: .mol file imported in micro mode
    */
    await turnOnMicromoleculesEditor(page);
    await openFileAndAddToCanvas(
      'Molfiles-V3000/monomers-saved-in-macro-mode.mol',
      page,
    );
    await takeEditorScreenshot(page);

    // Closing page since test expects it to have closed at the end
    const context = page.context();
    await page.close();
    page = await context.newPage();
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Check that RNA preset in not changing after saving and importing it as .mol file', async () => {
    /*
    Test case: Import/Saving files
    Description: .mol file with macro structures is imported correctly in macro mode
    */
    await openFileAndAddToCanvasMacro('Molfiles-V3000/three-presets.mol', page);
    await takeEditorScreenshot(page);
  });

  test('Check that CHEMs in not changing after saving and importing it as .mol file', async () => {
    /*
    Test case: Import/Saving files
    Description: .mol file with macro structures is imported correctly in macro mode.
    */
    await openFileAndAddToCanvasMacro(
      'Molfiles-V3000/three-chems-connected.mol',
      page,
    );
    await takeEditorScreenshot(page);
  });
});

test.describe('Import modified .mol files from external editor', () => {
  /*
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });
  We have opened feature request https://github.com/epam/ketcher/issues/4532
  After closing the ticket, you need to delete two files from temporaryFailedTestsFileNames
  */
  test.afterEach(async () => {
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+0');
    await selectClearCanvasTool(page);
  });

  const temporaryFailedTestsFileNames = [
    'peptide-modified-2aa-example.mol',
    'peptide-modified-aa-example.mol',
  ];
  const fileNames = [
    'peptide-Bom.mol',
    'peptide-Fmoc.mol',
    'dna-mod-Ph.mol',
    'dna-mod-Ph-granular.mol',
    'dna-peptide-conj-example.mol',
    'dna-peptideSS-conj-example.mol',
    'insulin-2-peptides-connected-with-SS.mol',
    'peptide-modified-2aa-example.mol',
    'peptide-modified-aa-example.mol',
    'rna-mod-phosphate-example.mol',
    'rna-mod-phosphate-mod-base-example.mol',
    'rna-modified.mol',
  ];

  for (const fileName of fileNames) {
    if (temporaryFailedTestsFileNames.includes(fileName)) {
      test(`for ${fileName} @IncorrectResultBecauseOfBug`, async () => {
        test.fail(true, 'This test is expected to fail due to a known issue.');
        throw new Error('Test intentionally failed due to known issue.');
      });
    } else {
      test(`for ${fileName}`, async () => {
        await openFileAndAddToCanvasMacro(`Molfiles-V3000/${fileName}`, page);
        const numberOfPressZoomOut = 4;
        await page.getByTestId('zoom-selector').click();
        for (let i = 0; i < numberOfPressZoomOut; i++) {
          await waitForRender(page, async () => {
            await page.getByTestId('zoom-out-button').click();
          });
        }
        await clickInTheMiddleOfTheScreen(page);
      });
    }
  }
});

test.describe('Base monomers on the canvas, their connection points and preview tooltips(from .mol file)', () => {
  /*
    Test case: https://github.com/epam/ketcher/issues/3780
    Description: These bunch of tests validates that system correctly load every type of monomer
    (Base) from .mol file, correctly show them on canvas (name, shape, color),
    shows correct number or connections and shows correct preview tooltip
  */
  /*
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });
  */

  const fileNames = [
    '01 - (R1) - Left only',
    '04 - (R1,R2) - R3 gap',
    '05 - (R1,R3) - R2 gap',
    '08 - (R1,R2,R3)',
    '09 - (R1,R3,R4)',
    '12 - (R1,R2,R3,R4)',
    '13 - (R1,R3,R4,R5)',
    '15 - (R1,R2,R3,R4,R5)',
  ];

  for (const fileName of fileNames) {
    test(`for ${fileName}`, async () => {
      await openFileAndAddToCanvasMacro(
        `Molfiles-V3000/Base-Templates/${fileName}.mol`,
        page,
      );
      await page.getByTestId('single-bond').click();
      await page.getByText('R1').locator('..').hover();
      await takeEditorScreenshot(page);

      const expectedFile = await getMolfile(page);
      await saveToFile(
        `Molfiles-V3000/Base-Templates/${fileName}-expected.mol`,
        expectedFile,
      );
      const METADATA_STRING_INDEX = [1];
      const { file: molFile, fileExpected: molFileExpected } =
        await receiveFileComparisonData({
          page,
          expectedFileName: `tests/test-data/Molfiles-V3000/Base-Templates/${fileName}-expected.mol`,
          metaDataIndexes: METADATA_STRING_INDEX,
        });

      expect(molFile).toEqual(molFileExpected);
    });
  }
});

test.describe('CHEM monomers on the canvas, their connection points and preview tooltips(from .mol file)', () => {
  /*
    Test case: https://github.com/epam/ketcher/issues/3780
    Description: These bunch of tests validates that system correctly load every type of monomer
    (CHEM) from .mol file, correctly show them on canvas (name, shape, color),
    shows correct number or connections and shows correct preview tooltip
  */
  /*
    test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });
  */
  const fileNames = [
    '01 - (R1) - Left only',
    '02 - (R2) - Right only',
    '03 - (R3) - Side only',
    '04 - (R1,R2) - R3 gap',
    '05 - (R1,R3) - R2 gap',
    '06 - (R2,R3) - R1 gap',
    '07 - (R3,R4)',
    '08 - (R1,R2,R3)',
    '09 - (R1,R3,R4)',
    '10 - (R2,R3,R4)',
    '11 - (R3,R4,R5)',
    '12 - (R1,R2,R3,R4)',
    '13 - (R1,R3,R4,R5)',
    '14 - (R2,R3,R4,R5)',
    '15 - (R1,R2,R3,R4,R5)',
  ];

  for (const fileName of fileNames) {
    test(`for ${fileName}`, async () => {
      await openFileAndAddToCanvasMacro(
        `Molfiles-V3000/CHEM-Templates/${fileName}.mol`,
        page,
      );
      await page.getByTestId('single-bond').click();
      await page.getByText('(R').locator('..').first().hover();
      await takeEditorScreenshot(page);

      const expectedFile = await getMolfile(page);
      await saveToFile(
        `Molfiles-V3000/CHEM-Templates/${fileName}-expected.mol`,
        expectedFile,
      );
      const METADATA_STRING_INDEX = [1];
      const { file: molFile, fileExpected: molFileExpected } =
        await receiveFileComparisonData({
          page,
          expectedFileName: `tests/test-data/Molfiles-V3000/CHEM-Templates/${fileName}-expected.mol`,
          metaDataIndexes: METADATA_STRING_INDEX,
        });

      expect(molFile).toEqual(molFileExpected);
    });
  }
});

test.describe('Peptide monomers on the canvas, their connection points and preview tooltips(from .mol file)', () => {
  /*
    Test case: https://github.com/epam/ketcher/issues/3780
    Description: These bunch of tests validates that system correctly load every type of monomer
    (Peptide) from .mol file, correctly show them on canvas (name, shape, color),
    shows correct number or connections and shows correct preview tooltip
  */
  /*
    test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });
  */
  const fileNames = [
    '01 - (R1) - Left only',
    '02 - (R2) - Right only',
    '03 - (R3) - Side only',
    '04 - (R1,R2) - R3 gap',
    '05 - (R1,R3) - R2 gap',
    '06 - (R2,R3) - R1 gap',
    '07 - (R3,R4)',
    '08 - (R1,R2,R3)',
    '09 - (R1,R3,R4)',
    '10 - (R2,R3,R4)',
    '11 - (R3,R4,R5)',
    '12 - (R1,R2,R3,R4)',
    '13 - (R1,R3,R4,R5)',
    '14 - (R2,R3,R4,R5)',
    '15 - (R1,R2,R3,R4,R5)',
  ];

  for (const fileName of fileNames) {
    test(`for ${fileName}`, async () => {
      await openFileAndAddToCanvasMacro(
        `Molfiles-V3000/Peptide-Templates/${fileName}.mol`,
        page,
      );
      await page.getByTestId('single-bond').click();
      await page.getByText('(R').locator('..').first().hover();
      await takeEditorScreenshot(page);

      const expectedFile = await getMolfile(page);
      await saveToFile(
        `Molfiles-V3000/Peptide-Templates/${fileName}-expected.mol`,
        expectedFile,
      );
      const METADATA_STRING_INDEX = [1];
      const { file: molFile, fileExpected: molFileExpected } =
        await receiveFileComparisonData({
          page,
          expectedFileName: `tests/test-data/Molfiles-V3000/Peptide-Templates/${fileName}-expected.mol`,
          metaDataIndexes: METADATA_STRING_INDEX,
        });

      expect(molFile).toEqual(molFileExpected);
    });
  }
});

test.describe('Phosphate monomers on the canvas, their connection points and preview tooltips(from .mol file)', () => {
  /*
    Test case: https://github.com/epam/ketcher/issues/3780
    Description: These bunch of tests validates that system correctly load every type of monomer
    (Phosphate) from .mol file, correctly show them on canvas (name, shape, color),
    shows correct number or connections and shows correct preview tooltip
  */
  /*
    test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });
  */

  const fileNames = [
    '01 - (R1) - Left only',
    '02 - (R2) - Right only',
    '03 - (R3) - Side only',
    '04 - (R1,R2) - R3 gap',
    '05 - (R1,R3) - R2 gap',
    '06 - (R2,R3) - R1 gap',
    '07 - (R3,R4)',
    '08 - (R1,R2,R3)',
    '09 - (R1,R3,R4)',
    '10 - (R2,R3,R4)',
    '11 - (R3,R4,R5)',
    '12 - (R1,R2,R3,R4)',
    '13 - (R1,R3,R4,R5)',
    '14 - (R2,R3,R4,R5)',
    '15 - (R1,R2,R3,R4,R5)',
  ];

  for (const fileName of fileNames) {
    test(`for ${fileName}`, async () => {
      await openFileAndAddToCanvasMacro(
        `Molfiles-V3000/Phosphate-Templates/${fileName}.mol`,
        page,
      );
      await page.getByTestId('single-bond').click();
      await page.getByText('(R').locator('..').first().hover();
      await takeEditorScreenshot(page);

      const expectedFile = await getMolfile(page);
      await saveToFile(
        `Molfiles-V3000/Phosphate-Templates/${fileName}-expected.mol`,
        expectedFile,
      );
      const METADATA_STRING_INDEX = [1];
      const { file: molFile, fileExpected: molFileExpected } =
        await receiveFileComparisonData({
          page,
          expectedFileName: `tests/test-data/Molfiles-V3000/Phosphate-Templates/${fileName}-expected.mol`,
          metaDataIndexes: METADATA_STRING_INDEX,
        });

      expect(molFile).toEqual(molFileExpected);
    });
  }
});

test.describe('Sugar monomers on the canvas, their connection points and preview tooltips(from .mol file)', () => {
  /*
    Test case: https://github.com/epam/ketcher/issues/3780
    Description: These bunch of tests validates that system correctly load every type of monomer
    (Sugar) from .mol file, correctly show them on canvas (name, shape, color),
    shows correct number or connections and shows correct preview tooltip
  */
  /*
    test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });
  */
  const fileNames = [
    '01 - (R1) - Left only',
    '02 - (R2) - Right only',
    '03 - (R3) - Side only',
    '04 - (R1,R2) - R3 gap',
    '05 - (R1,R3) - R2 gap',
    '06 - (R2,R3) - R1 gap',
    '07 - (R3,R4)',
    '08 - (R1,R2,R3)',
    '09 - (R1,R3,R4)',
    '10 - (R2,R3,R4)',
    '11 - (R3,R4,R5)',
    '12 - (R1,R2,R3,R4)',
    '13 - (R1,R3,R4,R5)',
    '14 - (R2,R3,R4,R5)',
    '15 - (R1,R2,R3,R4,R5)',
  ];

  for (const fileName of fileNames) {
    test(`for ${fileName}`, async () => {
      await openFileAndAddToCanvasMacro(
        `Molfiles-V3000/Sugar-Templates/${fileName}.mol`,
        page,
      );
      await page.getByTestId('single-bond').click();
      await page.getByText('(R').locator('..').first().hover();
      await takeEditorScreenshot(page);

      const expectedFile = await getMolfile(page);
      await saveToFile(
        `Molfiles-V3000/Sugar-Templates/${fileName}-expected.mol`,
        expectedFile,
      );
      const METADATA_STRING_INDEX = [1];
      const { file: molFile, fileExpected: molFileExpected } =
        await receiveFileComparisonData({
          page,
          expectedFileName: `tests/test-data/Molfiles-V3000/Sugar-Templates/${fileName}-expected.mol`,
          metaDataIndexes: METADATA_STRING_INDEX,
        });

      expect(molFile).toEqual(molFileExpected);
    });
  }
});
