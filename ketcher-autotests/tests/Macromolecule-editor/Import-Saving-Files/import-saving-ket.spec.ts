/* eslint-disable no-magic-numbers */
import { test, expect, Page } from '@playwright/test';
import {
  TopPanelButton,
  moveMouseAway,
  openFileAndAddToCanvas,
  openFileAndAddToCanvasMacro,
  takeEditorScreenshot,
  waitForPageInit,
  getKet,
  saveToFile,
  receiveFileComparisonData,
  waitForRender,
  selectTopPanelButton,
  openFile,
  pressButton,
  selectSnakeLayoutModeTool,
  turnOnMicromoleculesEditor,
  clickInTheMiddleOfTheScreen,
  selectClearCanvasTool,
  clickUndo,
  dragMouseTo,
} from '@utils';
import { pageReload } from '@utils/common/helpers';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
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
  test('Open ket file with monomers and bonds', async () => {
    /*
    Test case: #3230 - Support parsing KET file for macromolecules on ketcher side
    Description: Ket Deserialize
    */
    await openFileAndAddToCanvasMacro('KET/monomers-with-bonds.ket', page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

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
    const expectedFile = await getKet(page);
    await saveToFile('KET/fifty-monomers-expected.ket', expectedFile);
    const { file: ketFile, fileExpected: ketFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/KET/fifty-monomers-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);

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

  test('Check save and open of file with 100 monomers saved in KET format', async () => {
    /*
    Test case: Import/Saving files
    Description: Structure in center of canvas after opening
    */
    // Reload needed as monomer IDs increment in prior tests, affecting data comparasion
    await pageReload(page);

    await openFileAndAddToCanvasMacro('KET/hundred-monomers.ket', page);
    const expectedFile = await getKet(page);
    await saveToFile('KET/hundred-monomers-expected.ket', expectedFile);
    const { file: ketFile, fileExpected: ketFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/KET/hundred-monomers-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);

    const numberOfPressZoomOut = 7;
    await page.getByTestId('zoom-selector').click();
    for (let i = 0; i < numberOfPressZoomOut; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-out-button').click();
      });
    }
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Check that empty file can be saved in .ket format', async () => {
    /*
    Test case: Import/Saving files
    Description: Empty file can be saved in .ket format
    */
    const expectedFile = await getKet(page);
    await saveToFile('KET/empty-canvas-expected.ket', expectedFile);
    const { file: ketFile, fileExpected: ketFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/KET/empty-canvas-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
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
    const expectedFile = await getKet(page);
    await saveToFile('KET/monomer-expected.ket', expectedFile);
    const { file: ketFile, fileExpected: ketFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/KET/monomer-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
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
    await page.keyboard.press('Control+a');
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
    await page.getByTestId('25R___2,5-Ribose').click();
    await clickInTheMiddleOfTheScreen(page);
    const expectedFile = await getKet(page);
    await saveToFile('KET/25R-expected.ket', expectedFile);
    const { file: ketFile, fileExpected: ketFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/KET/25R-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
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
    const expectedFile = await getKet(page);
    await saveToFile('KET/D-2Nal-expected.ket', expectedFile);
    const { file: ketFile, fileExpected: ketFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/KET/D-2Nal-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
  });

  test('Check that system does not let importing empty .ket file', async () => {
    /*
    Test case: Import/Saving files
    Description: System does not let importing empty .ket file
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('KET/empty-file.ket', page);
    await page.getByText('Add to Canvas').isDisabled();
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
    const expectedFile = await getKet(page);
    await saveToFile('KET/unresolved-monomers-expected.ket', expectedFile);
    const { file: ketFile, fileExpected: ketFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/unresolved-monomers-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
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
    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/unsplit-nucleotides-connected-with-another-monomers-expected.ket',
      expectedFile,
    );
    const { file: ketFile, fileExpected: ketFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/unsplit-nucleotides-connected-with-another-monomers-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
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

      const expectedFile = await getKet(page);
      await saveToFile(
        `KET/Base-Templates/${fileName}-expected.ket`,
        expectedFile,
      );
      const { file: ketFile, fileExpected: ketFileExpected } =
        await receiveFileComparisonData({
          page,
          expectedFileName: `tests/test-data/KET/Base-Templates/${fileName}-expected.ket`,
        });

      expect(ketFile).toEqual(ketFileExpected);
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

      const expectedFile = await getKet(page);
      await saveToFile(
        `KET/CHEM-Templates/${fileName}-expected.ket`,
        expectedFile,
      );
      const { file: ketFile, fileExpected: ketFileExpected } =
        await receiveFileComparisonData({
          page,
          expectedFileName: `tests/test-data/KET/CHEM-Templates/${fileName}-expected.ket`,
        });

      expect(ketFile).toEqual(ketFileExpected);
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

      const expectedFile = await getKet(page);
      await saveToFile(
        `KET/Peptide-Templates/${fileName}-expected.ket`,
        expectedFile,
      );
      const { file: ketFile, fileExpected: ketFileExpected } =
        await receiveFileComparisonData({
          page,
          expectedFileName: `tests/test-data/KET/Peptide-Templates/${fileName}-expected.ket`,
        });

      expect(ketFile).toEqual(ketFileExpected);
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

      const expectedFile = await getKet(page);
      await saveToFile(
        `KET/Phosphate-Templates/${fileName}-expected.ket`,
        expectedFile,
      );
      const { file: ketFile, fileExpected: ketFileExpected } =
        await receiveFileComparisonData({
          page,
          expectedFileName: `tests/test-data/KET/Phosphate-Templates/${fileName}-expected.ket`,
        });

      expect(ketFile).toEqual(ketFileExpected);
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

      const expectedFile = await getKet(page);
      await saveToFile(
        `KET/Sugar-Templates/${fileName}-expected.ket`,
        expectedFile,
      );
      const { file: ketFile, fileExpected: ketFileExpected } =
        await receiveFileComparisonData({
          page,
          expectedFileName: `tests/test-data/KET/Sugar-Templates/${fileName}-expected.ket`,
        });

      expect(ketFile).toEqual(ketFileExpected);
    });
  }
});
