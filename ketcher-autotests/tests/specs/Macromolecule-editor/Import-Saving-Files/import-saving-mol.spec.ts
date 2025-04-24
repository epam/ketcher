/* eslint-disable no-magic-numbers */
import { test, expect, Page, chromium } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  openFileAndAddToCanvasMacro,
  openFromFileViaClipboard,
  takeEditorScreenshot,
  waitForPageInit,
  openFile,
  selectOptionInDropdown,
  selectSnakeLayoutModeTool,
  delay,
  selectFlexLayoutModeTool,
  moveMouseAway,
  resetZoomLevelToDefault,
} from '@utils';
import {
  selectClearCanvasTool,
  selectOpenFileTool,
} from '@tests/pages/common/TopLeftToolbar';
import {
  selectZoomOutTool,
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@tests/pages/common/TopRightToolbar';
import { closeErrorAndInfoModals, pageReload } from '@utils/common/helpers';
import { waitForMonomerPreview } from '@utils/macromolecules';
import {
  selectAreaSelectionTool,
  selectEraseTool,
} from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { openStructureDialog } from '@tests/pages/common/OpenStructureDialog';
import { pasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';

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
  await resetZoomLevelToDefault(page);
  await selectClearCanvasTool(page);
  await selectFlexLayoutModeTool(page);
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
    await selectOpenFileTool(page);
    await openFromFileViaClipboard(
      'tests/test-data/Molfiles-V3000/monomers-and-chem.mol',
      page,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Import incorrect data', async () => {
    const randomText = 'asjfnsalkfl';
    const pasteFromClipboardButton =
      openStructureDialog(page).pasteFromClipboardButton;
    const openStructureTextarea =
      pasteFromClipboardDialog(page).openStructureTextarea;
    const addToCanvasButton = pasteFromClipboardDialog(page).addToCanvasButton;

    await selectOpenFileTool(page);
    await pasteFromClipboardButton.click();
    await openStructureTextarea.fill(randomText);
    await addToCanvasButton.click();
    await takeEditorScreenshot(page);

    await closeErrorAndInfoModals(page);
    // Closing page since test expects it to have closed at the end
    const context = page.context();
    await page.close();
    page = await context.newPage();
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Export monomers and chem', async () => {
    await openFileAndAddToCanvasMacro('KET/monomers-and-chem.ket', page);
    await verifyFileExport(
      page,
      'Molfiles-V3000/monomers-and-chem.mol',
      FileType.MOL,
      'v3000',
    );

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
    await getMonomerLocator(page, { monomerAlias: 'K' }).first().hover();
    await waitForMonomerPreview(page);
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
    await selectAreaSelectionTool(page, SelectionToolType.Rectangle);
    await getMonomerLocator(page, { monomerAlias: `cdaC` }).hover();
    await waitForMonomerPreview(page);
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
      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });
    });
  }

  test('Check import of file with 50 monomers and save in MOL V3000 format', async () => {
    /*
    Test case: Import/Saving files
    Description: Structure in center of canvas after opening
    */
    await openFileAndAddToCanvasMacro('KET/fifty-monomers.ket', page);
    // const expectedFile = await getMolfile(page);
    // await saveToFile(
    //   'Molfiles-V3000/fifty-monomers-v3000-expected.mol',
    //   expectedFile,
    // );

    // const METADATA_STRING_INDEX = [1];

    // const { fileExpected: molFileExpected, file: molFile } =
    //   await receiveFileComparisonData({
    //     page,
    //     expectedFileName:
    //       'tests/test-data/Molfiles-V3000/fifty-monomers-v3000-expected.mol',
    //     fileFormat: 'v3000',
    //     metaDataIndexes: METADATA_STRING_INDEX,
    //   });

    // expect(molFile).toEqual(molFileExpected);

    // const numberOfPressZoomOut = 6;
    // await selectZoomOutTool(page, numberOfPressZoomOut);
    // await clickInTheMiddleOfTheScreen(page);
    // await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Molfiles-V3000/fifty-monomers-v3000-expected.mol',
      FileType.MOL,
      'v3000',
      [1],
    );
  });

  test('Check import of file with 100 monomers and save in MOL V3000 format', async () => {
    /*
    Test case: Import/Saving files
    Description: Structure in center of canvas after opening
    */
    await openFileAndAddToCanvasMacro('KET/hundred-monomers.ket', page);
    // const expectedFile = await getMolfile(page);
    // await saveToFile(
    //   'Molfiles-V3000/hundred-monomers-v3000-expected.mol',
    //   expectedFile,
    // );

    // const METADATA_STRING_INDEX = [1];

    // const { fileExpected: molFileExpected, file: molFile } =
    //   await receiveFileComparisonData({
    //     page,
    //     expectedFileName:
    //       'tests/test-data/Molfiles-V3000/hundred-monomers-v3000-expected.mol',
    //     fileFormat: 'v3000',
    //     metaDataIndexes: METADATA_STRING_INDEX,
    //   });

    // expect(molFile).toEqual(molFileExpected);

    await verifyFileExport(
      page,
      'Molfiles-V3000/hundred-monomers-v3000-expected.mol',
      FileType.MOL,
      'v3000',
      [1],
    );

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

    await verifyFileExport(
      page,
      'Molfiles-V2000/empty-canvas-expected.mol',
      FileType.MOL,
      'v2000',
      [1],
    );
  });

  test.fixme(
    'Check that system does not let importing empty .mol file',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /*
    Test case: Import/Saving files
    Description: System does not let importing empty .mol file

    IMPORTANT: Test fails because of the bug - https://github.com/epam/ketcher/issues/5382
    */
      test.setTimeout(20);
      const addToCanvasButton =
        pasteFromClipboardDialog(page).addToCanvasButton;

      await selectOpenFileTool(page);
      await openFile('Molfiles-V2000/empty-file.mol', page);
      await expect(addToCanvasButton).toBeDisabled();

      // Closing page since test expects it to have closed at the end
      const context = page.context();
      await page.close();
      page = await context.newPage();
      await waitForPageInit(page);
      await turnOnMacromoleculesEditor(page);
    },
  );

  test('Check that system does not let uploading corrupted .mol file', async () => {
    /*
    Test case: Import/Saving files
    Description: System does not let uploading corrupted .mol file
    */
    const addToCanvasButton = pasteFromClipboardDialog(page).addToCanvasButton;
    const filename = 'Molfiles-V3000/corrupted-file.mol';

    await selectOpenFileTool(page);
    await openFile(filename, page);
    await selectOptionInDropdown(filename, page);
    await addToCanvasButton.click();

    // Experimental delay - must be removed after waitForSpinnerFinishedWork refactor
    await delay(2);
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
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });

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

    Test fails because we have bug https://github.com/epam/ketcher/issues/5634
    */
    await openFileAndAddToCanvasMacro(
      'Molfiles-V3000/snake-mode-peptides.mol',
      page,
    );
    // await selectSnakeLayoutModeTool(page);
    // const expectedFile = await getMolfile(page);
    // await saveToFile(
    //   'Molfiles-V3000/snake-mode-peptides-expected.mol',
    //   expectedFile,
    // );

    // const METADATA_STRING_INDEX = [1];

    // const { fileExpected: molFileExpected, file: molFile } =
    //   await receiveFileComparisonData({
    //     page,
    //     expectedFileName:
    //       'tests/test-data/Molfiles-V3000/snake-mode-peptides-expected.mol',
    //     metaDataIndexes: METADATA_STRING_INDEX,
    //   });

    // expect(molFile).toEqual(molFileExpected);

    await verifyFileExport(
      page,
      'Molfiles-V3000/snake-mode-peptides-expected.mol',
      FileType.MOL,
      'v3000',
      [1],
    );
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

  test('Validate that unsplit nucleotides connected with another nucleotides could be saved to mol 3000 file and loaded back', async () => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with another nucleotides could be saved to mol 3000 file and loaded back
    */

    await openFileAndAddToCanvasMacro(
      'KET/unsplit-nucleotides-connected-with-nucleotides.ket',
      page,
    );
    // const expectedFile = await getMolfile(page);
    // await saveToFile(
    //   'Molfiles-V3000/unsplit-nucleotides-connected-with-nucleotides.mol',
    //   expectedFile,
    // );

    // const METADATA_STRING_INDEX = [1];

    // const { fileExpected: molFileExpected, file: molFile } =
    //   await receiveFileComparisonData({
    //     page,
    //     expectedFileName:
    //       'tests/test-data/Molfiles-V3000/unsplit-nucleotides-connected-with-nucleotides.mol',
    //     fileFormat: 'v3000',
    //     metaDataIndexes: METADATA_STRING_INDEX,
    //   });

    // expect(molFile).toEqual(molFileExpected);
    // await openFileAndAddToCanvasAsNewProject(
    //   'Molfiles-V3000/unsplit-nucleotides-connected-with-nucleotides.mol',
    //   page,
    // );
    // await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Molfiles-V3000/unsplit-nucleotides-connected-with-nucleotides.mol',
      FileType.MOL,
      'v3000',
      [1],
    );
  });

  test('Validate that unsplit nucleotides connected with chems could be saved to mol 3000 file and loaded back', async () => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with chems could be saved to mol 3000 file and loaded back
    */

    await openFileAndAddToCanvasMacro(
      'KET/unsplit-nucleotides-connected-with-chems.ket',
      page,
    );
    // const expectedFile = await getMolfile(page);
    // await saveToFile(
    //   'Molfiles-V3000/unsplit-nucleotides-connected-with-chems.mol',
    //   expectedFile,
    // );

    // const METADATA_STRING_INDEX = [1];

    // const { fileExpected: molFileExpected, file: molFile } =
    //   await receiveFileComparisonData({
    //     page,
    //     expectedFileName:
    //       'tests/test-data/Molfiles-V3000/unsplit-nucleotides-connected-with-chems.mol',
    //     fileFormat: 'v3000',
    //     metaDataIndexes: METADATA_STRING_INDEX,
    //   });

    // expect(molFile).toEqual(molFileExpected);
    // await openFileAndAddToCanvasAsNewProject(
    //   'Molfiles-V3000/unsplit-nucleotides-connected-with-chems.mol',
    //   page,
    // );
    // await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Molfiles-V3000/unsplit-nucleotides-connected-with-chems.mol',
      FileType.MOL,
      'v3000',
      [1],
    );
  });

  test('Validate that unsplit nucleotides connected with sugars could be saved to mol 3000 file and loaded back', async () => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with sugars could be saved to mol 3000 file and loaded back
    */

    await openFileAndAddToCanvasMacro(
      'KET/unsplit-nucleotides-connected-with-sugars.ket',
      page,
    );
    // const expectedFile = await getMolfile(page);
    // await saveToFile(
    //   'Molfiles-V3000/unsplit-nucleotides-connected-with-sugars.mol',
    //   expectedFile,
    // );

    // const METADATA_STRING_INDEX = [1];

    // const { fileExpected: molFileExpected, file: molFile } =
    //   await receiveFileComparisonData({
    //     page,
    //     expectedFileName:
    //       'tests/test-data/Molfiles-V3000/unsplit-nucleotides-connected-with-sugars.mol',
    //     fileFormat: 'v3000',
    //     metaDataIndexes: METADATA_STRING_INDEX,
    //   });

    // expect(molFile).toEqual(molFileExpected);
    // await openFileAndAddToCanvasAsNewProject(
    //   'Molfiles-V3000/unsplit-nucleotides-connected-with-sugars.mol',
    //   page,
    // );
    // await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'Molfiles-V3000/unsplit-nucleotides-connected-with-sugars.mol',
      FileType.MOL,
      'v3000',
      [1],
    );
  });

  test('Validate that unsplit nucleotides connected with bases could be saved to mol 3000 file and loaded back', async () => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with bases could be saved to mol 3000 file and loaded back
    */

    await openFileAndAddToCanvasMacro(
      'KET/unsplit-nucleotides-connected-with-bases.ket',
      page,
    );

    await verifyFileExport(
      page,
      'Molfiles-V3000/unsplit-nucleotides-connected-with-bases.mol',
      FileType.MOL,
      'v3000',
      [1],
    );
  });

  test('Validate that unsplit nucleotides connected with phosphates could be saved to mol 3000 file and loaded back', async () => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with phosphates could be saved to mol 3000 file and loaded back
    */

    await openFileAndAddToCanvasMacro(
      'KET/unsplit-nucleotides-connected-with-phosphates.ket',
      page,
    );

    await verifyFileExport(
      page,
      'Molfiles-V3000/unsplit-nucleotides-connected-with-phosphates.mol',
      FileType.MOL,
      'v3000',
      [1],
    );
  });

  test('Validate that unsplit nucleotides connected with peptides could be saved to mol 3000 file and loaded back', async () => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with peptides could be saved to mol 3000 file and loaded back
    */
    await openFileAndAddToCanvasMacro(
      'KET/unsplit-nucleotides-connected-with-peptides.ket',
      page,
    );

    await verifyFileExport(
      page,
      'Molfiles-V3000/unsplit-nucleotides-connected-with-peptides.mol',
      FileType.MOL,
      'v3000',
      [1],
    );
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
    await resetZoomLevelToDefault(page);
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
        await selectZoomOutTool(page, numberOfPressZoomOut);
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
      await pageReload(page);
      await openFileAndAddToCanvasMacro(
        `Molfiles-V3000/Base-Templates/${fileName}.mol`,
        page,
      );

      await verifyFileExport(
        page,
        `Molfiles-V3000/Base-Templates/${fileName}-expected.mol`,
        FileType.MOL,
        'v3000',
        [1],
      );
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
      await pageReload(page);
      await openFileAndAddToCanvasMacro(
        `Molfiles-V3000/CHEM-Templates/${fileName}.mol`,
        page,
      );

      await verifyFileExport(
        page,
        `Molfiles-V3000/CHEM-Templates/${fileName}-expected.mol`,
        FileType.MOL,
        'v3000',
        [1],
      );
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
      await pageReload(page);
      await openFileAndAddToCanvasMacro(
        `Molfiles-V3000/Peptide-Templates/${fileName}.mol`,
        page,
      );

      await verifyFileExport(
        page,
        `Molfiles-V3000/Peptide-Templates/${fileName}-expected.mol`,
        FileType.MOL,
        'v3000',
        [1],
      );
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
      await pageReload(page);
      await openFileAndAddToCanvasMacro(
        `Molfiles-V3000/Phosphate-Templates/${fileName}.mol`,
        page,
      );

      await verifyFileExport(
        page,
        `Molfiles-V3000/Phosphate-Templates/${fileName}-expected.mol`,
        FileType.MOL,
        'v3000',
        [1],
      );
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
      await pageReload(page);
      await openFileAndAddToCanvasMacro(
        `Molfiles-V3000/Sugar-Templates/${fileName}.mol`,
        page,
      );

      await verifyFileExport(
        page,
        `Molfiles-V3000/Sugar-Templates/${fileName}-expected.mol`,
        FileType.MOL,
        'v3000',
        [1],
      );
    });
  }
});
