/* eslint-disable no-magic-numbers */
import { test, expect, Page } from '@fixtures';
import {
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  openFileAndAddToCanvasMacro,
  takeEditorScreenshot,
  waitForPageInit,
  openFile,
  moveMouseAway,
  resetZoomLevelToDefault,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  readFileContent,
  MonomerType,
  MolFileFormat,
} from '@utils';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { PasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';
import { pageReload } from '@utils/common/helpers';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';

let page: Page;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();
  await waitForPageInit(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
    enableFlexMode: false,
    goToPeptides: false,
  });
});

test.afterEach(async ({ context: _ }, testInfo) => {
  await CommonTopLeftToolbar(page).clearCanvas();
  await resetZoomLevelToDefault(page);
  await processResetToDefaultState(testInfo, page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

test.describe('Import-Saving .mol Files', () => {
  test('Import monomers and chem', async () => {
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasMacro(
      page,
      'Molfiles-V3000/monomers-and-chem.mol',
      MacroFileType.MOLv3000,
    );
    await takeEditorScreenshot(page);
  });

  test('Import monomers and chem with clipboard', async () => {
    const fileContent = await readFileContent(
      'Molfiles-V3000/monomers-and-chem.mol',
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.MOLv3000,
      fileContent,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Import incorrect data', async () => {
    const randomText = 'asjfnsalkfl';

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.KetFormat,
      randomText,
      // error expected
      true,
    );
    await expect(
      page.getByText('Convert error! Error during file parsing.'),
    ).toBeVisible();
  });

  test('Export monomers and chem', async () => {
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await openFileAndAddToCanvasMacro(page, 'KET/monomers-and-chem.ket');
    await resetZoomLevelToDefault(page);
    await verifyFileExport(
      page,
      'Molfiles-V3000/monomers-and-chem.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  });

  test('After opening a file in macro mode, structure is in center of the screen and no need scroll to find it', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/3666
     * Description: Structure in center of canvas after opening
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasMacro(
      page,
      'Molfiles-V3000/peptide-bzl.mol',
      MacroFileType.MOLv3000,
    );
    await takeEditorScreenshot(page);
  });

  test('Monomers are not stacked, easy to read, colors and preview match with Ketcher library after importing a file', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/3667
     * https://github.com/epam/ketcher/issues/3668
     * Description: Monomers are not stacked, easy to read, colors and preview match with Ketcher library after importing a file
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasMacro(
      page,
      'Molfiles-V3000/peptide-bzl.mol',
      MacroFileType.MOLv3000,
    );
    await getMonomerLocator(page, { monomerAlias: 'K' }).first().hover();
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await takeEditorScreenshot(page);
  });

  test('After importing a file with modified monomers, it is clear which monomer is modified, and when hovering, preview display changes made during modification', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/3669
     * Description: After importing a file with modified monomers, it is clear which monomer is modified,
     * and when hovering, preview display changes made during modification
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasMacro(
      page,
      'Molfiles-V3000/dna-mod-base-sugar-phosphate-example.mol',
      MacroFileType.MOLv3000,
    );
    expect(
      await getMonomerLocator(page, { monomerAlias: `cdaC` }).count(),
    ).toBe(1);

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await getMonomerLocator(page, { monomerAlias: `cdaC` }).hover();
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );
      await openFileAndAddToCanvasMacro(
        page,
        `Molfiles-V3000/${fileType}.mol`,
        MacroFileType.MOLv3000,
      );
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
    await openFileAndAddToCanvasMacro(page, 'KET/fifty-monomers.ket');
    await verifyFileExport(
      page,
      'Molfiles-V3000/fifty-monomers-v3000-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
      [1],
    );
  });

  test('Check import of file with 100 monomers and save in MOL V3000 format', async () => {
    /*
    Test case: Import/Saving files
    Description: Structure in center of canvas after opening
    */
    await openFileAndAddToCanvasMacro(page, 'KET/hundred-monomers.ket');
    await verifyFileExport(
      page,
      'Molfiles-V3000/hundred-monomers-v3000-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
      [1],
    );
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
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );
      await openFileAndAddToCanvasMacro(
        page,
        'Molfiles-V3000/monomers-connected-with-bonds.mol',
        MacroFileType.MOLv3000,
      );
      await CommonLeftToolbar(page).erase();
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
      MolFileFormat.v2000,
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
        PasteFromClipboardDialog(page).addToCanvasButton;

      await CommonTopLeftToolbar(page).openFile();
      await openFile(page, 'Molfiles-V2000/empty-file.mol');
      await expect(addToCanvasButton).toBeDisabled();

      // Closing page since test expects it to have closed at the end
      const context = page.context();
      await page.close();
      page = await context.newPage();
      await waitForPageInit(page);
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    },
  );

  test('Check that system does not let uploading corrupted .mol file', async () => {
    /*
    Test case: Import/Saving files
    Description: System does not let uploading corrupted .mol file
    */
    const filename = 'Molfiles-V3000/corrupted-file.mol';
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await resetZoomLevelToDefault(page);

    await openFileAndAddToCanvasMacro(
      page,
      filename,
      MacroFileType.MOLv3000,
      true,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate correct displaying of snake viewed peptide chain loaded from .mol file format', async () => {
    /*
    Test case: Import/Saving files
    Description: Sequence of Peptides displaying according to snake view mockup.
    */
    await openFileAndAddToCanvasMacro(
      page,
      'Molfiles-V3000/snake-mode-peptides.mol',
      MacroFileType.MOLv3000,
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Check that you can save snake viewed chain of peptides in a Mol v3000 file', async () => {
    /*
    Test case: Import/Saving files
    Description: Snake viewed chain of peptides saved in a Mol v3000 file

    Test fails because we have bug https://github.com/epam/ketcher/issues/5634
    */
    await openFileAndAddToCanvasMacro(
      page,
      'Molfiles-V3000/snake-mode-peptides.mol',
      MacroFileType.MOLv3000,
    );
    await resetZoomLevelToDefault(page);
    await verifyFileExport(
      page,
      'Molfiles-V3000/snake-mode-peptides-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
      [1],
    );
  });

  test('Check that .mol file with macro structures is imported correctly in macro mode when saving it in micro mode', async () => {
    /*
    Test case: Import/Saving files
    Description: .mol file with macro structures is imported correctly in macro mode when saving it in micro mode
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasMacro(
      page,
      'Molfiles-V3000/monomers-saved-in-micro-mode.mol',
      MacroFileType.MOLv3000,
    );
    await takeEditorScreenshot(page);
  });

  test('Check that macro .mol file can be imported in micro mode', async () => {
    /*
    Test case: Import/Saving files
    Description: .mol file imported in micro mode
    */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V3000/monomers-saved-in-macro-mode.mol',
    );
    await takeEditorScreenshot(page);
  });

  test('Check that RNA preset in not changing after saving and importing it as .mol file', async () => {
    /*
    Test case: Import/Saving files
    Description: .mol file with macro structures is imported correctly in macro mode
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasMacro(
      page,
      'Molfiles-V3000/three-presets.mol',
      MacroFileType.MOLv3000,
    );
    await takeEditorScreenshot(page);
  });

  test('Check that CHEMs in not changing after saving and importing it as .mol file', async () => {
    /*
    Test case: Import/Saving files
    Description: .mol file with macro structures is imported correctly in macro mode.
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasMacro(
      page,
      'Molfiles-V3000/three-chems-connected.mol',
      MacroFileType.MOLv3000,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with another nucleotides could be saved to mol 3000 file and loaded back', async () => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with another nucleotides could be saved to mol 3000 file and loaded back
    */

    await openFileAndAddToCanvasMacro(
      page,
      'KET/unsplit-nucleotides-connected-with-nucleotides.ket',
    );
    await verifyFileExport(
      page,
      'Molfiles-V3000/unsplit-nucleotides-connected-with-nucleotides.mol',
      FileType.MOL,
      MolFileFormat.v3000,
      [1],
    );
  });

  test('Validate that unsplit nucleotides connected with chems could be saved to mol 3000 file and loaded back', async () => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with chems could be saved to mol 3000 file and loaded back
    */

    await openFileAndAddToCanvasMacro(
      page,
      'KET/unsplit-nucleotides-connected-with-chems.ket',
    );
    await resetZoomLevelToDefault(page);

    await verifyFileExport(
      page,
      'Molfiles-V3000/unsplit-nucleotides-connected-with-chems.mol',
      FileType.MOL,
      MolFileFormat.v3000,
      [1],
    );
  });

  test('Validate that unsplit nucleotides connected with sugars could be saved to mol 3000 file and loaded back', async () => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with sugars could be saved to mol 3000 file and loaded back
    */

    await openFileAndAddToCanvasMacro(
      page,
      'KET/unsplit-nucleotides-connected-with-sugars.ket',
    );
    await resetZoomLevelToDefault(page);

    await verifyFileExport(
      page,
      'Molfiles-V3000/unsplit-nucleotides-connected-with-sugars.mol',
      FileType.MOL,
      MolFileFormat.v3000,
      [1],
    );
  });

  test('Validate that unsplit nucleotides connected with bases could be saved to mol 3000 file and loaded back', async () => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with bases could be saved to mol 3000 file and loaded back
    */

    await openFileAndAddToCanvasMacro(
      page,
      'KET/unsplit-nucleotides-connected-with-bases.ket',
    );
    await resetZoomLevelToDefault(page);

    await verifyFileExport(
      page,
      'Molfiles-V3000/unsplit-nucleotides-connected-with-bases.mol',
      FileType.MOL,
      MolFileFormat.v3000,
      [1],
    );
  });

  test('Validate that unsplit nucleotides connected with phosphates could be saved to mol 3000 file and loaded back', async () => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with phosphates could be saved to mol 3000 file and loaded back
    */

    await openFileAndAddToCanvasMacro(
      page,
      'KET/unsplit-nucleotides-connected-with-phosphates.ket',
    );
    await resetZoomLevelToDefault(page);

    await verifyFileExport(
      page,
      'Molfiles-V3000/unsplit-nucleotides-connected-with-phosphates.mol',
      FileType.MOL,
      MolFileFormat.v3000,
      [1],
    );
  });

  test('Validate that unsplit nucleotides connected with peptides could be saved to mol 3000 file and loaded back', async () => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with peptides could be saved to mol 3000 file and loaded back
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasMacro(
      page,
      'KET/unsplit-nucleotides-connected-with-peptides.ket',
    );
    await verifyFileExport(
      page,
      'Molfiles-V3000/unsplit-nucleotides-connected-with-peptides.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
  });
});

test.describe('Import modified .mol files from external editor', () => {
  /*
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  });
  We have opened feature request https://github.com/epam/ketcher/issues/4532
  After closing the ticket, you need to delete two files from temporaryFailedTestsFileNames
  */
  test.afterEach(async () => {
    await takeEditorScreenshot(page);
    await resetZoomLevelToDefault(page);
    await CommonTopLeftToolbar(page).clearCanvas();
  });

  const temporaryFailedTestsFileNames = [
    'peptide-modified-2aa-example.mol',
    'peptide-modified-aa-example.mol',
    // https://github.com/epam/Indigo/issues/3048
    'dna-peptideSS-conj-example.mol',
    // https://github.com/epam/Indigo/issues/3048
    'peptide-Fmoc.mol',
    // https://github.com/epam/Indigo/issues/3048
    'dna-peptide-conj-example.mol',
  ];
  const fileNames = [
    'peptide-Bom.mol',
    'dna-mod-Ph.mol',
    'dna-mod-Ph-granular.mol',
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
        await MacromoleculesTopToolbar(page).selectLayoutModeTool(
          LayoutMode.Flex,
        );
        await openFileAndAddToCanvasMacro(
          page,
          `Molfiles-V3000/${fileName}`,
          MacroFileType.MOLv3000,
        );
        const numberOfPressZoomOut = 4;
        await CommonTopRightToolbar(page).selectZoomOutTool(
          numberOfPressZoomOut,
        );
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
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
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
        page,
        `Molfiles-V3000/Base-Templates/${fileName}.mol`,
        MacroFileType.MOLv3000,
      );
      await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
      await getMonomerLocator(page, { monomerType: MonomerType.Base }).hover();
      await MonomerPreviewTooltip(page).waitForBecomeVisible();
      await takeEditorScreenshot(page);

      await verifyFileExport(
        page,
        `Molfiles-V3000/Base-Templates/${fileName}-expected.mol`,
        FileType.MOL,
        MolFileFormat.v3000,
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
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
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
        page,
        `Molfiles-V3000/CHEM-Templates/${fileName}.mol`,
        MacroFileType.MOLv3000,
      );
      await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
      await page.getByText('(R').locator('..').first().hover();
      await MonomerPreviewTooltip(page).waitForBecomeVisible();
      await takeEditorScreenshot(page);

      await verifyFileExport(
        page,
        `Molfiles-V3000/CHEM-Templates/${fileName}-expected.mol`,
        FileType.MOL,
        MolFileFormat.v3000,
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
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
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
        page,
        `Molfiles-V3000/Peptide-Templates/${fileName}.mol`,
        MacroFileType.MOLv3000,
      );
      await verifyFileExport(
        page,
        `Molfiles-V3000/Peptide-Templates/${fileName}-expected.mol`,
        FileType.MOL,
        MolFileFormat.v3000,
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
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
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
        page,
        `Molfiles-V3000/Phosphate-Templates/${fileName}.mol`,
        MacroFileType.MOLv3000,
      );
      await verifyFileExport(
        page,
        `Molfiles-V3000/Phosphate-Templates/${fileName}-expected.mol`,
        FileType.MOL,
        MolFileFormat.v3000,
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
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
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
        page,
        `Molfiles-V3000/Sugar-Templates/${fileName}.mol`,
        MacroFileType.MOLv3000,
      );
      await verifyFileExport(
        page,
        `Molfiles-V3000/Sugar-Templates/${fileName}-expected.mol`,
        FileType.MOL,
        MolFileFormat.v3000,
        [1],
      );
    });
  }
});
