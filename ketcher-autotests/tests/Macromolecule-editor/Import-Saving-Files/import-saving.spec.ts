import {
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@utils/macromolecules';
import { test, expect } from '@playwright/test';
import {
  TopPanelButton,
  getKet,
  getMolfile,
  openFile,
  openFileAndAddToCanvas,
  pressButton,
  receiveFileComparisonData,
  saveToFile,
  selectEraseTool,
  selectTopPanelButton,
  takeEditorScreenshot,
  waitForPageInit,
  waitForRender,
} from '@utils';

test.describe('Import-Saving-Files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('After opening a file in macro mode, structure is in center of the screen and no need scroll to find it', async ({
    page,
  }) => {
    /* 
    Test case: https://github.com/epam/ketcher/issues/3666
    Description: Structure in center of canvas after opening
    Test working incorrect now because we have bug https://github.com/epam/ketcher/issues/3666
    */
    await openFileAndAddToCanvas('Molfiles-V3000/peptide-bzl.mol', page);
    await takeEditorScreenshot(page);
  });

  test('Monomers are not stacked, easy to read, colors and preview match with Ketcher library after importing a file', async ({
    page,
  }) => {
    /* 
    Test case: https://github.com/epam/ketcher/issues/3667
    https://github.com/epam/ketcher/issues/3668
    Description: Monomers are not stacked, easy to read, colors and preview match with Ketcher library after importing a file
    Test working incorrect now because we have 2 bugs https://github.com/epam/ketcher/issues/3667 https://github.com/epam/ketcher/issues/3668
    */
    await openFileAndAddToCanvas('Molfiles-V3000/peptide-bzl.mol', page);
    await page.getByText('K').locator('..').first().hover();
    await takeEditorScreenshot(page);
  });

  test.fixme(
    'After importing a file with modified monomers, it is clear which monomer is modified, and when hovering, preview display changes made during modification',
    async ({ page }) => {
      /* 
    Test case: https://github.com/epam/ketcher/issues/3669
    Description: After importing a file with modified monomers, it is clear which monomer is modified, 
    and when hovering, preview display changes made during modification
    Test working incorrect now because we have bug https://github.com/epam/ketcher/issues/3669
    The file stopped opening(Convert error)
    */
      await openFileAndAddToCanvas(
        'Molfiles-V3000/dna-mod-base-sugar-phosphate-example.mol',
        page,
      );
      await page.getByText('cdaC').locator('..').hover();
      await takeEditorScreenshot(page);
    },
  );

  const fileTypes = ['dna', 'rna'];

  for (const fileType of fileTypes) {
    test(`Import ${fileType.toUpperCase()} file`, async ({ page }) => {
      /* 
    Test case: Import/Saving files
    Description: Imported DNA file opens without errors. 
    DNA contains the nitrogen bases adenine (A), thymine (T) for DNA, uracil (U) for RNA, cytosine (C), and guanine (G).
    In RNA, thymine (T) is replaced by uracil (U).
    We have bug https://github.com/epam/ketcher/issues/3383
    */
      await openFileAndAddToCanvas(`Molfiles-V3000/${fileType}.mol`, page);
      await takeEditorScreenshot(page);
    });
  }

  test('Check save and open of file with 50 monomers saved in KET format', async ({
    page,
  }) => {
    /* 
    Test case: Import/Saving files
    Description: Structure in center of canvas after opening
    */
    await openFileAndAddToCanvas('KET/fifty-monomers.ket', page);
    const expectedFile = await getKet(page);
    await saveToFile('KET/fifty-monomers-expected.ket', expectedFile);
    const { file: ketFile, fileExpected: ketFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/KET/fifty-monomers-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);

    const numberOfPressZoomOut = 5;
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
    await openFileAndAddToCanvas('KET/hundred-monomers.ket', page);
    const expectedFile = await getKet(page);
    await saveToFile('KET/hundred-monomers-expected.ket', expectedFile);
    const { file: ketFile, fileExpected: ketFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/KET/hundred-monomers-expected.ket',
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

  test('Check import of file with 50 monomers and save in MOL V3000 format', async ({
    page,
  }) => {
    /* 
    Test case: Import/Saving files
    Description: Structure in center of canvas after opening
    */
    await openFileAndAddToCanvas('KET/fifty-monomers.ket', page);
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
    await takeEditorScreenshot(page);
  });

  test('Check import of file with 100 monomers and save in MOL V3000 format', async ({
    page,
  }) => {
    /* 
    Test case: Import/Saving files
    Description: Structure in center of canvas after opening
    */
    await openFileAndAddToCanvas('KET/hundred-monomers.ket', page);
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
  });

  const monomersToDelete = [
    { text: '12ddR', description: 'Sugar monomer deleted.' },
    { text: 'baA', description: 'Base monomer deleted.' },
    { text: 'P', description: 'Phosphate monomer deleted.' },
  ];
  /*
   Test working not a proper way because we have bug https://github.com/epam/ketcher/issues/3609
  */
  for (const monomer of monomersToDelete) {
    test(`Open file from .mol V3000 and Delete ${monomer.text} monomer`, async ({
      page,
    }) => {
      await openFileAndAddToCanvas(
        'Molfiles-V3000/monomers-connected-with-bonds.mol',
        page,
      );
      await selectEraseTool(page);
      await page.getByText(monomer.text).locator('..').first().click();
      await takeEditorScreenshot(page);
    });
  }

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

  test('Check that empty file can be saved in .mol format', async ({
    page,
  }) => {
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

  test('Check that system does not let importing empty .mol file', async ({
    page,
  }) => {
    /* 
    Test case: Import/Saving files
    Description: System does not let importing empty .mol file
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('Molfiles-V2000/empty-file.mol', page);
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

  test('Check that system does not let uploading corrupted .mol file', async ({
    page,
  }) => {
    /* 
    Test case: Import/Saving files
    Description: System does not let uploading corrupted .mol file
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('Molfiles-V3000/corrupted-file.mol', page);
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
    await openFileAndAddToCanvas('KET/snake-mode-peptides.ket', page);
    await page.getByTestId('snake-mode-button').click();
    await takeEditorScreenshot(page);
  });

  test('Validate correct displaying of snake viewed peptide chain loaded from .mol file format', async ({
    page,
  }) => {
    /* 
    Test case: Import/Saving files
    Description: Sequence of Peptides displaying according to snake view mockup.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V3000/snake-mode-peptides.mol',
      page,
    );
    await page.getByTestId('snake-mode-button').click();
    await takeEditorScreenshot(page);
  });

  test('Check that .ket file with macro structures is imported correctly in macro mode when saving it in mirco mode', async ({
    page,
  }) => {
    /* 
    Test case: Import/Saving files
    Description: .ket file with macro structures is imported correctly in macro mode when saving it in mirco mode
    */
    await openFileAndAddToCanvas('KET/monomers-saved-in-micro-mode.ket', page);
    await takeEditorScreenshot(page);
  });

  test('Check that .mol file with macro structures is imported correctly in macro mode when saving it in mirco mode', async ({
    page,
  }) => {
    /* 
    Test case: Import/Saving files
    Description: .mol file with macro structures is imported correctly in macro mode when saving it in mirco mode
    */
    await openFileAndAddToCanvas(
      'Molfiles-V3000/monomers-saved-in-micro-mode.mol',
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

  test('Check that macro .mol file can be imported in micro mode', async ({
    page,
  }) => {
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
  });

  test('Check that RNA preset in not changing after saving and importing it as .ket file', async ({
    page,
  }) => {
    /* 
    Test case: Import/Saving files
    Description: .ket file with macro structures is imported correctly in macro mode
    */
    await openFileAndAddToCanvas('KET/three-presets.ket', page);
    await takeEditorScreenshot(page);
  });

  test('Check that RNA preset in not changing after saving and importing it as .mol file', async ({
    page,
  }) => {
    /* 
    Test case: Import/Saving files
    Description: .mol file with macro structures is imported correctly in macro mode
    Test now working in not a proper way because we have bug https://github.com/epam/ketcher/issues/3609
    */
    await openFileAndAddToCanvas('Molfiles-V3000/three-presets.mol', page);
    await takeEditorScreenshot(page);
  });

  test('Check that CHEMs in not changing after saving and importing it as .ket file', async ({
    page,
  }) => {
    /* 
    Test case: Import/Saving files
    Description: .ket file with macro structures is imported correctly in macro mode.
    */
    await openFileAndAddToCanvas('KET/three-chems-connected.ket', page);
    await takeEditorScreenshot(page);
  });

  test('Check that CHEMs in not changing after saving and importing it as .mol file', async ({
    page,
  }) => {
    /* 
    Test case: Import/Saving files
    Description: .mol file with macro structures is imported correctly in macro mode.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V3000/three-chems-connected.mol',
      page,
    );
    await takeEditorScreenshot(page);
  });
});
