/* eslint-disable no-magic-numbers */
import { Peptides } from '@constants/monomers/Peptides';
import { Sugars } from '@constants/monomers/Sugars';
import { test, expect, Page } from '@playwright/test';
import {
  moveMouseAway,
  openFileAndAddToCanvas,
  openFileAndAddToCanvasMacro,
  takeEditorScreenshot,
  waitForPageInit,
  openFile,
  selectSnakeLayoutModeTool,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  openFileAndAddToCanvasAsNewProjectMacro,
  openFileAndAddToCanvasAsNewProject,
  selectMonomer,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import {
  waitForMonomerPreview,
  zoomWithMouseWheel,
} from '@utils/macromolecules';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import {
  markResetToDefaultState,
  processResetToDefaultState,
} from '@utils/testAnnotations/resetToDefaultState';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { PasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';
import { closeErrorMessage } from '@utils/common/helpers';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';

let page: Page;

const fileTestData = [
  { alias: '(R1)_-_Left_only', fileName: '01 - (R1) - Left only' },
  { alias: '(R2)_-_Right_only', fileName: '02 - (R2) - Right only' },
  { alias: '(R3)_-_Side_only', fileName: '03 - (R3) - Side only' },
  { alias: '(R1,R2)_-_R3_gap', fileName: '04 - (R1,R2) - R3 gap' },
  { alias: '(R1,R3)_-_R2_gap', fileName: '05 - (R1,R3) - R2 gap' },
  { alias: '(R2,R3)_-_R1_gap', fileName: '06 - (R2,R3) - R1 gap' },
  { alias: '(R3,R4)', fileName: '07 - (R3,R4)' },
  { alias: '(R1,R2,R3)', fileName: '08 - (R1,R2,R3)' },
  { alias: '(R1,R3,R4)', fileName: '09 - (R1,R3,R4)' },
  { alias: '(R2,R3,R4)', fileName: '10 - (R2,R3,R4)' },
  { alias: '(R3,R4,R5)', fileName: '11 - (R3,R4,R5)' },
  { alias: '(R1,R2,R3,R4)', fileName: '12 - (R1,R2,R3,R4)' },
  { alias: '(R1,R3,R4,R5)', fileName: '13 - (R1,R3,R4,R5)' },
  { alias: '(R2,R3,R4,R5)', fileName: '14 - (R2,R3,R4,R5)' },
  {
    alias: '(R1,R2,R3,R4,R5)',
    fileName: '15 - (R1,R2,R3,R4,R5)',
  },
];

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();
  await waitForPageInit(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
});

test.afterEach(async ({ context: _ }, testInfo) => {
  await CommonTopLeftToolbar(page).clearCanvas();
  await processResetToDefaultState(testInfo, page);
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

test.describe('Import-Saving .ket Files', () => {
  test.skip(
    'Open ket file with monomers and bonds',
    { tag: ['@NeedToBeUpdated'] },
    async () => {
      /*
    Test case: #3230 - Support parsing KET file for macromolecules on ketcher side
    Description: Ket Deserialize
    */
      await openFileAndAddToCanvasMacro('KET/monomers-with-bonds.ket', page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    },
  );

  test('Check save and open of file with 50 monomers saved in KET format', async () => {
    /*
    Test case: Import/Saving files
    Description: Structure in center of canvas after opening
    The structure does not fit on the canvas when opened, and to
    see the whole picture in this test and in future ones, zoom is used
    */
    await openFileAndAddToCanvasMacro('KET/fifty-monomers.ket', page);

    await verifyFileExport(
      page,
      'KET/fifty-monomers-expected.ket',
      FileType.KET,
    );

    const numberOfPressZoomOut = 6;
    await CommonTopRightToolbar(page).selectZoomOutTool(numberOfPressZoomOut);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check save and open of file with 100 monomers saved in KET format', async () => {
    /*
    Test case: Import/Saving files
    Description: Structure in center of canvas after opening
    */
    await openFileAndAddToCanvasMacro('KET/hundred-monomers.ket', page);

    await verifyFileExport(
      page,
      'KET/hundred-monomers-expected.ket',
      FileType.KET,
    );

    const numberOfPressZoomOut = 7;
    await CommonTopRightToolbar(page).selectZoomOutTool(numberOfPressZoomOut);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Check that empty file can be saved in .ket format', async () => {
    /*
    Test case: Import/Saving files
    Description: Empty file can be saved in .ket format
    */

    await verifyFileExport(page, 'KET/empty-canvas-expected.ket', FileType.KET);
  });

  test('Validate that saving to .ket file of any monomer from our Library does not change after loading it back from .ket file to canvas', async () => {
    /*
    Test case: Import/Saving files #3827 #3757
    Description: The monomer name is present in the preview after opening the saved file.
    */
    await selectMonomer(page, Peptides.bAla);
    await clickInTheMiddleOfTheScreen(page);
    await verifyFileExport(page, 'KET/monomer-expected.ket', FileType.KET);
    await CommonTopLeftToolbar(page).clearCanvas();
    await openFileAndAddToCanvasMacro('KET/monomer-expected.ket', page);
    await getMonomerLocator(page, Peptides.bAla).hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Check that after loading from a file and then pressing undo, it does not break the selection/moving functionality', async () => {
    /*
    Test case: Import/Saving files #3756
    Description: After pressing Undo not break the selection/moving functionality.
    */
    await openFileAndAddToCanvasMacro(
      'KET/Peptide-Enumeration-One-Two-Three-connections3.ket',
      page,
    );
    // This is not an error here you need to open the file twice
    await openFileAndAddToCanvasMacro(
      'KET/Peptide-Enumeration-One-Two-Three-connections3.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
    await selectAllStructuresOnCanvas(page);
    await getMonomerLocator(page, { monomerAlias: 'Ph' }).first().hover();
    await dragMouseTo(400, 400, page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Check that fields "class" and "classHELM" are presents into .ket file', async () => {
    /*
    Test case: Import/Saving files #3846
    Description: Fields "class" and "classHELM" are presents into .ket file.
    */
    markResetToDefaultState('tabSelection');

    test.slow();
    await selectMonomer(page, Sugars._25R);
    await clickInTheMiddleOfTheScreen(page);
    await verifyFileExport(page, 'KET/25R-expected.ket', FileType.KET);
  });

  test('Check .ket file that "leavingGroup" section contain information about number of atoms', async () => {
    /*
    Test case: Import/Saving files #4172
    Description: "leavingGroup" section contain information about number of atoms.
    */
    await selectMonomer(page, Peptides.D_2Nal);
    await clickInTheMiddleOfTheScreen(page);
    await verifyFileExport(page, 'KET/D-2Nal-expected.ket', FileType.KET);
  });

  test('Check that system does not let importing empty .ket file', async () => {
    /*
    Test case: Import/Saving files
    Description: System does not let importing empty .ket file
    */
    const addToCanvasButton = PasteFromClipboardDialog(page).addToCanvasButton;

    await CommonTopLeftToolbar(page).openFile();
    await openFile('KET/empty-file.ket', page);
    await expect(addToCanvasButton).toBeDisabled();
    await PasteFromClipboardDialog(page).closeWindowButton.click();
  });

  test('Check that system does not let uploading corrupted .ket file', async () => {
    /*
    Test case: Import/Saving files
    Description: System does not let uploading corrupted .ket file
    */
    const addToCanvasButton = PasteFromClipboardDialog(page).addToCanvasButton;

    await CommonTopLeftToolbar(page).openFile();
    await openFile('KET/corrupted-file.ket', page);
    await addToCanvasButton.click();
    await takeEditorScreenshot(page);
    await closeErrorMessage(page);
  });

  test('Validate correct displaying of snake viewed peptide chain loaded from .ket file format', async () => {
    /*
    Test case: Import/Saving files
    Description: Sequence of Peptides displaying according to snake view mockup.
    */
    markResetToDefaultState('defaultLayout');

    await openFileAndAddToCanvasMacro('KET/snake-mode-peptides.ket', page);
    await selectSnakeLayoutModeTool(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Check that .ket file with macro structures is imported correctly in macro mode when saving it in micro mode', async () => {
    /*
    Test case: Import/Saving files
    Description: .ket file with macro structures is imported correctly in macro mode when saving it in micro mode
    */
    await openFileAndAddToCanvasMacro(
      'KET/monomers-saved-in-micro-mode.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Check that macro .ket file can be imported in micro mode', async () => {
    /*
    Test case: Import/Saving files
    Description: .ket file imported in micro mode
    */
    markResetToDefaultState('macromoleculesEditor');

    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvas('KET/monomers-saved-in-macro-mode.ket', page);
    await takeEditorScreenshot(page);
  });

  test('Check that RNA preset in not changing after saving and importing it as .ket file', async () => {
    /*
    Test case: Import/Saving files
    Description: .ket file with macro structures is imported correctly in macro mode
    */
    await openFileAndAddToCanvasMacro('KET/three-presets.ket', page);
    await takeEditorScreenshot(page);
  });

  test('Check that CHEMs in not changing after saving and importing it as .ket file', async () => {
    /*
    Test case: Import/Saving files
    Description: .ket file with macro structures is imported correctly in macro mode.
    */
    await openFileAndAddToCanvasMacro('KET/three-chems-connected.ket', page);
    await takeEditorScreenshot(page);
  });

  test('Check save and open of file with unresolved monomers in KET format', async () => {
    /*
    Test case: Import/Saving files
    Description: There should be possible to load monomers which not found in Monomer library
    */
    await openFileAndAddToCanvasMacro('KET/unresolved-monomers.ket', page);

    await verifyFileExport(
      page,
      'KET/unresolved-monomers-expected.ket',
      FileType.KET,
    );
  });

  test('Validate that unsplit nucleotides connected with another monomers could be saved to ket file and loaded back', async () => {
    /*
    Test case: Import/Saving files
    Description: .ket file with macro structures is exported and imported correctly .
    */
    await openFileAndAddToCanvasMacro(
      'KET/unsplit-nucleotides-connected-with-another-monomers.ket',
      page,
    );

    await verifyFileExport(
      page,
      'KET/unsplit-nucleotides-connected-with-another-monomers-expected.ket',
      FileType.KET,
    );
  });

  test('Verify saving and load to canvas ambiguous monomers in KET format (macro mode)', async () => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 13. Verify saving and load to canvas ambiguous monomers in KET format (macro mode)
    Case: 1. Load all ambiguous monomers from KET
          2. Make a screenshot to make sure they loaded
          3. Save canvas to KET
          4. Compate result with template
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Ambiguous-monomers/AllAmbiguousMonomers.ket',
      page,
    );

    await zoomWithMouseWheel(page, -250);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });

    await verifyFileExport(
      page,
      'KET/Ambiguous-monomers/AllAmbiguousMonomers-expected.ket',
      FileType.KET,
    );
    await zoomWithMouseWheel(page, 250);
  });
});

test.describe('Base monomers on the canvas, their connection points and preview tooltips', () => {
  /*
    Test case: https://github.com/epam/ketcher/issues/3780
    Description: These bunch of tests validates that system correctly load every type of monomer
    (Base) from ket file, correctly show them on canvas (name, shape, color),
    shows correct number or connections and shows correct preview tooltip
  */
  const testData = [
    { alias: '(R1)_-_Left_only', fileName: '01 - (R1) - Left only' },
    { alias: '(R1,R2)_-_R3_gap', fileName: '04 - (R1,R2) - R3 gap' },
    { alias: '(R1,R3)_-_R2_gap', fileName: '05 - (R1,R3) - R2 gap' },
    { alias: '(R1,R2,R3)', fileName: '08 - (R1,R2,R3)' },
    { alias: '(R1,R3,R4)', fileName: '09 - (R1,R3,R4)' },
    { alias: '(R1,R2,R3,R4)', fileName: '12 - (R1,R2,R3,R4)' },
    { alias: '(R1,R3,R4,R5)', fileName: '13 - (R1,R3,R4,R5)' },
    {
      alias: '(R1,R2,R3,R4,R5)',
      fileName: '15 - (R1,R2,R3,R4,R5)',
    },
  ];

  for (const data of testData) {
    test(`for ${data.fileName}`, async () => {
      await openFileAndAddToCanvasMacro(
        `KET/Base-Templates/${data.fileName}.ket`,
        page,
      );
      await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
      await getMonomerLocator(page, { monomerAlias: data.alias }).hover();
      await waitForMonomerPreview(page);
      await takeEditorScreenshot(page);

      await verifyFileExport(
        page,
        `KET/Base-Templates/${data.fileName}-expected.ket`,
        FileType.KET,
      );
    });
  }
});

test.describe('CHEM monomers on the canvas, their connection points and preview tooltips', () => {
  /*
    Test case: https://github.com/epam/ketcher/issues/3780
    Description: These bunch of tests validates that system correctly load every type of monomer
    (CHEM) from ket file, correctly show them on canvas (name, shape, color),
    shows correct number or connections and shows correct preview tooltip
  */
  for (const data of fileTestData) {
    test(`for ${data.fileName}`, async () => {
      await openFileAndAddToCanvasMacro(
        `KET/CHEM-Templates/${data.fileName}.ket`,
        page,
      );
      await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
      await getMonomerLocator(page, { monomerAlias: data.alias }).hover();
      await waitForMonomerPreview(page);
      await takeEditorScreenshot(page);

      await verifyFileExport(
        page,
        `KET/CHEM-Templates/${data.fileName}-expected.ket`,
        FileType.KET,
      );
    });
  }
});

test.describe('Peptide monomers on the canvas, their connection points and preview tooltips', () => {
  /*
    Test case: https://github.com/epam/ketcher/issues/3780
    Description: These bunch of tests validates that system correctly load every type of monomer
    (Peptide) from ket file, correctly show them on canvas (name, shape, color),
    shows correct number or connections and shows correct preview tooltip
  */
  for (const data of fileTestData) {
    test(`for ${data.fileName}`, async () => {
      await openFileAndAddToCanvasMacro(
        `KET/Peptide-Templates/${data.fileName}.ket`,
        page,
      );
      await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
      await getMonomerLocator(page, { monomerAlias: data.alias }).hover();
      await waitForMonomerPreview(page);
      await takeEditorScreenshot(page);

      await verifyFileExport(
        page,
        `KET/Peptide-Templates/${data.fileName}-expected.ket`,
        FileType.KET,
      );
    });
  }
});

test.describe('Phosphate monomers on the canvas, their connection points and preview tooltips', () => {
  /*
    Test case: https://github.com/epam/ketcher/issues/3780
    Description: These bunch of tests validates that system correctly load every type of monomer
    (Phosphate) from ket file, correctly show them on canvas (name, shape, color),
    shows correct number or connections and shows correct preview tooltip
  */
  for (const data of fileTestData) {
    test(`for ${data.fileName}`, async () => {
      await openFileAndAddToCanvasMacro(
        `KET/Phosphate-Templates/${data.fileName}.ket`,
        page,
      );
      await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
      await getMonomerLocator(page, { monomerAlias: data.alias }).hover();
      await waitForMonomerPreview(page);
      await takeEditorScreenshot(page);

      await verifyFileExport(
        page,
        `KET/Phosphate-Templates/${data.fileName}-expected.ket`,
        FileType.KET,
      );
    });
  }
});

test.describe('Sugar monomers on the canvas, their connection points and preview tooltips', () => {
  /*
    Test case: https://github.com/epam/ketcher/issues/3780
    Description: These bunch of tests validates that system correctly load every type of monomer
    (Sugar) from ket file, correctly show them on canvas (name, shape, color),
    shows correct number or connections and shows correct preview tooltip
  */
  for (const data of fileTestData) {
    test(`for ${data.fileName}`, async () => {
      await openFileAndAddToCanvasMacro(
        `KET/Sugar-Templates/${data.fileName}.ket`,
        page,
      );
      await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
      await getMonomerLocator(page, { monomerAlias: data.alias }).hover();
      await waitForMonomerPreview(page);
      await takeEditorScreenshot(page);

      await verifyFileExport(
        page,
        `KET/Sugar-Templates/${data.fileName}-expected.ket`,
        FileType.KET,
      );
    });
  }
});

interface IMonomer {
  monomerDescription: string;
  KETFile: string;
  KETFile_Expected: string;
  monomerLocatorText: string;
  // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
  shouldFail?: boolean;
  // issueNumber is mandatory if shouldFail === true
  issueNumber?: string;
  // set pageReloadNeeded to true if you need to restart ketcher before test (f.ex. to restart font renderer)
  pageReloadNeeded?: boolean;
}

const allTypesOfMonomers: IMonomer[] = [
  {
    monomerDescription: '1. Petide D (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/1. Petide D (from library).ket',
    KETFile_Expected:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/1. Petide D (from library)-expected.ket',
    monomerLocatorText: 'D',
  },
  {
    monomerDescription: '2. Sugar UNA (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/2. Sugar UNA (from library).ket',
    KETFile_Expected:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/2. Sugar UNA (from library)-expected.ket',
    monomerLocatorText: 'UNA',
  },
  {
    monomerDescription: '3. Base hU (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/3. Base hU (from library).ket',
    KETFile_Expected:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/3. Base hU (from library)-expected.ket',
    monomerLocatorText: 'hU',
  },
  {
    monomerDescription: '4. Phosphate bnn (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/4. Phosphate bnn (from library).ket',
    KETFile_Expected:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/4. Phosphate bnn (from library)-expected.ket',
    monomerLocatorText: 'bnn',
  },
  {
    monomerDescription: '5. Unsplit nucleotide 5hMedC (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/5. Unsplit nucleotide 5hMedC (from library).ket',
    KETFile_Expected:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/5. Unsplit nucleotide 5hMedC (from library)-expected.ket',
    monomerLocatorText: '5hMedC',
  },
  {
    monomerDescription: '6. CHEM 4aPEGMal (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/6. CHEM 4aPEGMal (from library).ket',
    KETFile_Expected:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/6. CHEM 4aPEGMal (from library)-expected.ket',
    monomerLocatorText: '4aPEGMal',
  },
  {
    monomerDescription: '7. Peptide X (ambiguouse, alternatives, from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/1. Peptide X (ambiguouse, alternatives, from library).ket',
    KETFile_Expected:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/1. Peptide X (ambiguouse, alternatives, from library)-expected.ket',
    monomerLocatorText: 'X',
  },
  {
    monomerDescription:
      '8. Peptide A+C+D+E+F+G+H+I+K+L+M+N+O+P+Q+R+S+T+U+V+W+Y (ambiguouse, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/2. Peptide A+C+D+E+F+G+H+I+K+L+M+N+O+P+Q+R+S+T+U+V+W+Y (ambiguouse, mixed).ket',
    KETFile_Expected:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/2. Peptide A+C+D+E+F+G+H+I+K+L+M+N+O+P+Q+R+S+T+U+V+W+Y (ambiguouse, mixed)-expected.ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '9. Peptide G+H+I+K+L+M+N+O+P (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/3. Peptide G+H+I+K+L+M+N+O+P (ambiguous, mixed).ket',
    KETFile_Expected:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/3. Peptide G+H+I+K+L+M+N+O+P (ambiguous, mixed)-expected.ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription:
      '10. Peptide G,H,I,K,L,M,N,O,P (ambiguous, alternatives)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/4. Peptide G,H,I,K,L,M,N,O,P (ambiguous, alternatives).ket',
    KETFile_Expected:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/4. Peptide G,H,I,K,L,M,N,O,P (ambiguous, alternatives)-expected.ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '11. Sugar UNA, SGNA, RGNA (ambiguous, alternatives)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/5. Sugar UNA, SGNA, RGNA (ambiguous, alternatives).ket',
    KETFile_Expected:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/5. Sugar UNA, SGNA, RGNA (ambiguous, alternatives)-expected.ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '12. Sugar UNA, SGNA, RGNA (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/6. Sugar UNA, SGNA, RGNA (ambiguous, mixed).ket',
    KETFile_Expected:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/6. Sugar UNA, SGNA, RGNA (ambiguous, mixed)-expected.ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription:
      '13. DNA base N (ambiguous, alternatives, from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/7. DNA base N (ambiguous, alternatives, from library).ket',
    KETFile_Expected:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/7. DNA base N (ambiguous, alternatives, from library)-expected.ket',
    monomerLocatorText: 'N',
  },
  {
    monomerDescription:
      '14. RNA base N (ambiguous, alternatives, from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/8. RNA base N (ambiguous, alternatives, from library).ket',
    KETFile_Expected:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/8. RNA base N (ambiguous, alternatives, from library)-expected.ket',
    monomerLocatorText: 'N',
  },
  {
    monomerDescription: '15. Base M (ambiguous, alternatives, from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/9. Base M (ambiguous, alternatives, from library).ket',
    KETFile_Expected:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/9. Base M (ambiguous, alternatives, from library)-expected.ket',
    monomerLocatorText: 'M',
  },
  {
    monomerDescription: '16. DNA base A+C+G+T (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/10. DNA base A+C+G+T (ambiguous, mixed).ket',
    KETFile_Expected:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/10. DNA base A+C+G+T (ambiguous, mixed)-expected.ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '17. RNA base A+C+G+U (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/11. RNA base A+C+G+U (ambiguous, mixed).ket',
    KETFile_Expected:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/11. RNA base A+C+G+U (ambiguous, mixed)-expected.ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '18. Base A+C (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/12. Base A+C (ambiguous, mixed).ket',
    KETFile_Expected:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/12. Base A+C (ambiguous, mixed)-expected.ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '19. Phosphate bnn,cmp,nen (ambiguous, alternatives)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/13. Phosphate bnn,cmp,nen (ambiguous, alternatives).ket',
    KETFile_Expected:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/13. Phosphate bnn,cmp,nen (ambiguous, alternatives)-expected.ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '20. Phosphate bnn+cmp+nen (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/14. Phosphate bnn+cmp+nen (ambiguous, mixed).ket',
    KETFile_Expected:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/14. Phosphate bnn+cmp+nen (ambiguous, mixed)-expected.ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '21. CHEM PEG-2,PEG-4,PEG-6 (ambiguous, alternatives)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/15. CHEM PEG-2,PEG-4,PEG-6 (ambiguous, alternatives).ket',
    KETFile_Expected:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/15. CHEM PEG-2,PEG-4,PEG-6 (ambiguous, alternatives)-expected.ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '22. CHEM PEG-2+PEG-4+PEG-6 (ambiguous, mixed)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/16. CHEM PEG-2+PEG-4+PEG-6 (ambiguous, mixed).ket',
    KETFile_Expected:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/16. CHEM PEG-2+PEG-4+PEG-6 (ambiguous, mixed)-expected.ket',
    monomerLocatorText: '%',
  },
  {
    monomerDescription: '23. Unknown nucleotide',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/17. Unknown nucleotide.ket',
    KETFile_Expected:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Negative/17. Unknown nucleotide-expected.ket',
    monomerLocatorText: 'Unknown',
  },
];

for (const monomer of allTypesOfMonomers) {
  test(`Save monomer on Micro to KET: ${monomer.monomerDescription}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5773
     * Description: Verify saving collapsed monomers in KET
     * Case: 1. Load monomer on Molecules canvas
     *       2. Take screenshot to witness original state
     *       3. Save canvas to KET
     *       4. Verify that export result equal to template
     *       5. Load saved KET to the canvas
     *       6. Take screenshot to witness saved state
     */

    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(monomer.KETFile, page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
    await verifyFileExport(page, monomer.KETFile_Expected, FileType.KET);
    await openFileAndAddToCanvasAsNewProject(monomer.KETFile_Expected, page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  });
}

test(`Verify that user can save/load macromolecule structures with hydrogen bonds to a .ket file`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5984
   * Description: Verify that user can save/load macromolecule structures with hydrogen bonds to a .ket file
   * Case: 1. Load KET file on Macro canvas
   *       2. Take screenshot to witness original state
   *       3. Save canvas to KET
   *       4. Verify that export result equal to template
   */
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  const KETFile =
    'KET/Hydrogen-bonds/Hydrogen bonds between all type of monomers.ket';
  const KETFileExpected =
    'KET/Hydrogen-bonds/Hydrogen bonds between all type of monomers-expected.ket';

  await openFileAndAddToCanvasAsNewProject(KETFile, page);
  await takeEditorScreenshot(page);
  await verifyFileExport(page, KETFileExpected, FileType.KET);
});

test(`Verify that the structure in macro mode can be saved as a .ket file, and all elements including bonds and atoms are correctly restored when re-loaded`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5960
   * Description: Verify that the structure in macro mode can be saved as a .ket file, and all elements including bonds and atoms are correctly restored when re-loaded
   * Case: 1. Load monomer on Macrolecules mode
   *       2. Take screenshot to witness original state
   *       3. Save canvas to KET
   *       4. Verify that export result equal to template
   *       5. Load saved KET to the canvas
   *       6. Take screenshot to witness saved state
   *        (screenshots have to be equal)
   */

  const KETFile =
    'KET/Micro-Macro-Switcher/Complicated structures on the canvas.ket';
  const KETFileExpected =
    'KET/Micro-Macro-Switcher/Complicated structures on the canvas-expected.ket';

  await openFileAndAddToCanvasAsNewProject(KETFile, page);
  await moveMouseAway(page);
  await takeEditorScreenshot(page, { hideMacromoleculeEditorScrollBars: true });
  await verifyFileExport(page, KETFileExpected, FileType.KET);
  await openFileAndAddToCanvasAsNewProject(KETFileExpected, page);
  await moveMouseAway(page);
  await takeEditorScreenshot(page, { hideMacromoleculeEditorScrollBars: true });
});
