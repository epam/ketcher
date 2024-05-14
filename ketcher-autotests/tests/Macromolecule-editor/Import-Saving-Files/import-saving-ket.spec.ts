/* eslint-disable no-magic-numbers */
import { test, expect } from '@playwright/test';
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
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

test.describe('Import-Saving .ket Files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Open ket file with monomers and bonds', async ({ page }) => {
    /*
    Test case: #3230 - Support parsing KET file for macromolecules on ketcher side
    Description: Ket Deserialize
    */
    await openFileAndAddToCanvasMacro('KET/monomers-with-bonds.ket', page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('Check save and open of file with 50 monomers saved in KET format', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files
    Description: Structure in center of canvas after opening
    The structure does not fit on the canvas when opened, and to
    see the whole picture in this test and in future ones, zoom is used
    */
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
    for (let i = 0; i < numberOfPressZoomOut; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-out-button').click();
      });
    }
    await takeEditorScreenshot(page);
  });

  test('Check save and open of file with 100 monomers saved in KET format', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files
    Description: Structure in center of canvas after opening
    */
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
    for (let i = 0; i < numberOfPressZoomOut; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-out-button').click();
      });
    }
    await takeEditorScreenshot(page);
  });

  test('Check that empty file can be saved in .ket format', async ({
    page,
  }) => {
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

  test('Validate that saving to .ket file of any monomer from our Library does not change after loading it back from .ket file to canvas', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files #3827 #3757
    Description: The monomer name is present in the preview after opening the saved file. 
    */
    await page.getByTestId('Bal___beta-Alanine').click();
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

  test('Check that after loading from a file and then pressing undo, it does not break the selection/moving functionality', async ({
    page,
  }) => {
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

  test('Check that fields "class" and "classHELM" are presents into .ket file', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files #3846
    Description: Fields "class" and "classHELM" are presents into .ket file. 
    */
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

  test('Check .ket file that "leavingGroup" section contain information about number of atoms', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files #4172
    Description: "leavingGroup" section contain information about number of atoms. 
    */
    await page.getByTestId('D-2Nal___D-3-naphthylalanine').click();
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

  test('Check that system does not let importing empty .ket file', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files
    Description: System does not let importing empty .ket file
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('KET/empty-file.ket', page);
    await page.getByText('Add to Canvas').isDisabled();
  });

  test('Check that system does not let uploading corrupted .ket file', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files
    Description: System does not let uploading corrupted .ket file
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('KET/corrupted-file.ket', page);
    await pressButton(page, 'Add to Canvas');
    await takeEditorScreenshot(page);
  });

  test('Validate correct displaying of snake viewed peptide chain loaded from .ket file format', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files
    Description: Sequence of Peptides displaying according to snake view mockup.
    */
    await openFileAndAddToCanvasMacro('KET/snake-mode-peptides.ket', page);
    await selectSnakeLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Check that .ket file with macro structures is imported correctly in macro mode when saving it in micro mode', async ({
    page,
  }) => {
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

  test('Check that macro .ket file can be imported in micro mode', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files
    Description: .ket file imported in micro mode
    */
    await turnOnMicromoleculesEditor(page);
    await openFileAndAddToCanvas('KET/monomers-saved-in-macro-mode.ket', page);
    await takeEditorScreenshot(page);
  });

  test('Check that RNA preset in not changing after saving and importing it as .ket file', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files
    Description: .ket file with macro structures is imported correctly in macro mode
    */
    await openFileAndAddToCanvasMacro('KET/three-presets.ket', page);
    await takeEditorScreenshot(page);
  });

  test('Check that CHEMs in not changing after saving and importing it as .ket file', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files
    Description: .ket file with macro structures is imported correctly in macro mode.
    */
    await openFileAndAddToCanvasMacro('KET/three-chems-connected.ket', page);
    await takeEditorScreenshot(page);
  });
});

test.describe('Base monomers on the canvas, their connection points and preview tooltips', () => {
  /*
    Test case: https://github.com/epam/ketcher/issues/3780
    Description: These bunch of tests validates that system correctly load every type of monomer
    (Base) from ket file, correctly show them on canvas (name, shape, color),
    shows correct number or connections and shows correct preview tooltip
  */
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

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
    test(`for ${fileName}`, async ({ page }) => {
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
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

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
    test(`for ${fileName}`, async ({ page }) => {
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
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

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
    test(`for ${fileName}`, async ({ page }) => {
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
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

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
    test(`for ${fileName}`, async ({ page }) => {
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
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

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
    test(`for ${fileName}`, async ({ page }) => {
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
