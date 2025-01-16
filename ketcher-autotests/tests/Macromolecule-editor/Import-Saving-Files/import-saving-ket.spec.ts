/* eslint-disable no-magic-numbers */
import { test, expect, Page } from '@playwright/test';
import {
  TopPanelButton,
  moveMouseAway,
  openFileAndAddToCanvas,
  openFileAndAddToCanvasMacro,
  takeEditorScreenshot,
  waitForPageInit,
  selectTopPanelButton,
  openFile,
  pressButton,
  selectSnakeLayoutModeTool,
  turnOnMicromoleculesEditor,
  clickInTheMiddleOfTheScreen,
  selectClearCanvasTool,
  clickUndo,
  dragMouseTo,
  openFileAndAddToCanvasAsNewProjectMacro,
  Sugars,
  selectAllStructuresOnCanvas,
  openFileAndAddToCanvasAsNewProject,
  selectZoomOutTool,
} from '@utils';
import { pageReload } from '@utils/common/helpers';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import {
  turnOnMacromoleculesEditor,
  zoomWithMouseWheel,
} from '@utils/macromolecules';
import { Peptides } from '@utils/selectors/macromoleculeEditor';
import {
  markResetToDefaultState,
  processResetToDefaultState,
} from '@utils/testAnnotations/resetToDefaultState';

let page: Page;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();
  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);
});

test.afterEach(async ({ context: _ }, testInfo) => {
  await selectClearCanvasTool(page);
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
    // Reload needed as monomer IDs increment in prior tests, affecting data comparasion
    await pageReload(page);

    await openFileAndAddToCanvasMacro('KET/fifty-monomers.ket', page);

    await verifyFileExport(
      page,
      'KET/fifty-monomers-expected.ket',
      FileType.KET,
    );

    const numberOfPressZoomOut = 6;
    await selectZoomOutTool(page, numberOfPressZoomOut);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Check save and open of file with 100 monomers saved in KET format', async () => {
    /*
    Test case: Import/Saving files
    Description: Structure in center of canvas after opening
    */
    // Reload needed as monomer IDs increment in prior tests, affecting data comparasion
    await pageReload(page);

    await openFileAndAddToCanvasMacro('KET/hundred-monomers.ket', page);

    await verifyFileExport(
      page,
      'KET/hundred-monomers-expected.ket',
      FileType.KET,
    );

    const numberOfPressZoomOut = 7;
    await selectZoomOutTool(page, numberOfPressZoomOut);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
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
    // Reload needed as monomer IDs increment in prior tests, affecting data comparasion
    await pageReload(page);

    await page.getByTestId(Peptides.BetaAlanine).click();
    await clickInTheMiddleOfTheScreen(page);
    await verifyFileExport(page, 'KET/monomer-expected.ket', FileType.KET);
    await selectClearCanvasTool(page);
    await openFileAndAddToCanvasMacro('KET/monomer-expected.ket', page);
    await page.getByText('Bal').locator('..').first().hover();
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
    await clickUndo(page);
    await selectAllStructuresOnCanvas(page);
    await page.getByText('Ph').locator('..').first().hover();
    await dragMouseTo(400, 400, page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('Check that fields "class" and "classHELM" are presents into .ket file', async () => {
    /*
    Test case: Import/Saving files #3846
    Description: Fields "class" and "classHELM" are presents into .ket file.
    */
    // Reload needed as monomer IDs increment in prior tests, affecting data comparasion
    await pageReload(page);
    markResetToDefaultState('tabSelection');

    test.slow();
    await page.getByTestId('RNA-TAB').click();
    await page.getByTestId('summary-Sugars').click();
    await page.getByTestId(Sugars.TwentyFiveR).click();
    await clickInTheMiddleOfTheScreen(page);
    await verifyFileExport(page, 'KET/25R-expected.ket', FileType.KET);
  });

  test('Check .ket file that "leavingGroup" section contain information about number of atoms', async () => {
    /*
    Test case: Import/Saving files #4172
    Description: "leavingGroup" section contain information about number of atoms.
    */
    // Reload needed as monomer IDs increment in prior tests, affecting data comparasion
    await pageReload(page);

    await page.getByTestId(Peptides.D2Nal).click();
    await clickInTheMiddleOfTheScreen(page);
    await verifyFileExport(page, 'KET/D-2Nal-expected.ket', FileType.KET);
  });

  test('Check that system does not let importing empty .ket file', async () => {
    /*
    Test case: Import/Saving files
    Description: System does not let importing empty .ket file
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('KET/empty-file.ket', page);
    await expect(page.getByText('Add to Canvas')).toBeDisabled();
  });

  test('Check that system does not let uploading corrupted .ket file', async () => {
    /*
    Test case: Import/Saving files
    Description: System does not let uploading corrupted .ket file
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('KET/corrupted-file.ket', page);
    await pressButton(page, 'Add to Canvas');
    await takeEditorScreenshot(page);
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
    await takeEditorScreenshot(page);
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

    await turnOnMicromoleculesEditor(page);
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
    // Reload needed as monomer IDs increment in prior tests, affecting data comparasion
    await pageReload(page);

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
    // Reload needed as monomer IDs increment in prior tests, affecting data comparasion
    await pageReload(page);

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
    await pageReload(page);
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Ambiguous-monomers/AllAmbiguousMonomers.ket',
      page,
    );

    await zoomWithMouseWheel(page, -250);
    await takeEditorScreenshot(page);

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
      // Reload needed as monomer IDs increment in prior tests, affecting data comparasion
      await pageReload(page);

      await openFileAndAddToCanvasMacro(
        `KET/Base-Templates/${fileName}.ket`,
        page,
      );
      await page.getByTestId('single-bond').click();
      await page.getByText('R1').locator('..').hover();
      await takeEditorScreenshot(page);

      await verifyFileExport(
        page,
        `KET/Base-Templates/${fileName}-expected.ket`,
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
      // Reload needed as monomer IDs increment in prior tests, affecting data comparasion
      await pageReload(page);

      await openFileAndAddToCanvasMacro(
        `KET/CHEM-Templates/${fileName}.ket`,
        page,
      );
      await page.getByTestId('single-bond').click();
      await page.getByText('(R').locator('..').first().hover();
      await takeEditorScreenshot(page);

      await verifyFileExport(
        page,
        `KET/CHEM-Templates/${fileName}-expected.ket`,
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
      // Reload needed as monomer IDs increment in prior tests, affecting data comparasion
      await pageReload(page);

      await openFileAndAddToCanvasMacro(
        `KET/Peptide-Templates/${fileName}.ket`,
        page,
      );
      await page.getByTestId('single-bond').click();
      await page.getByText('(R').locator('..').first().hover();
      await takeEditorScreenshot(page);

      await verifyFileExport(
        page,
        `KET/Peptide-Templates/${fileName}-expected.ket`,
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
      // Reload needed as monomer IDs increment in prior tests, affecting data comparasion
      await pageReload(page);

      await openFileAndAddToCanvasMacro(
        `KET/Phosphate-Templates/${fileName}.ket`,
        page,
      );
      await page.getByTestId('single-bond').click();
      await page.getByText('(R').locator('..').first().hover();
      await takeEditorScreenshot(page);

      await verifyFileExport(
        page,
        `KET/Phosphate-Templates/${fileName}-expected.ket`,
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
      // Reload needed as monomer IDs increment in prior tests, affecting data comparasion
      await pageReload(page);

      await openFileAndAddToCanvasMacro(
        `KET/Sugar-Templates/${fileName}.ket`,
        page,
      );
      await page.getByTestId('single-bond').click();
      await page.getByText('(R').locator('..').first().hover();
      await takeEditorScreenshot(page);

      await verifyFileExport(
        page,
        `KET/Sugar-Templates/${fileName}-expected.ket`,
        FileType.KET,
      );
    });
  }
});

// Commented out because of we have BUG - https://github.com/epam/ketcher/issues/5873
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
    await pageReload(page);

    await turnOnMicromoleculesEditor(page);
    await openFileAndAddToCanvasAsNewProject(monomer.KETFile, page);
    await takeEditorScreenshot(page);
    await verifyFileExport(page, monomer.KETFile_Expected, FileType.KET);
    await openFileAndAddToCanvasAsNewProject(monomer.KETFile_Expected, page);
    await takeEditorScreenshot(page);
    await turnOnMacromoleculesEditor(page);
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
  await turnOnMacromoleculesEditor(page);
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
  await takeEditorScreenshot(page);
  await verifyFileExport(page, KETFileExpected, FileType.KET);
  await openFileAndAddToCanvasAsNewProject(KETFileExpected, page);
  await moveMouseAway(page);
  await takeEditorScreenshot(page);
});
