import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { test, expect } from '@playwright/test';
import {
  getKet,
  getMolfile,
  openFileAndAddToCanvas,
  pressButton,
  receiveFileComparisonData,
  saveToFile,
  selectEraseTool,
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
    Zoom out is used to display the structure since it does not open in the middle of the canvas. 
    After fixing the bug, the test will need to be changed.
    */
    const numberOfPressZoomOut = 5;
    await openFileAndAddToCanvas('Molfiles-V3000/peptide-bzl.mol', page);
    for (let i = 0; i < numberOfPressZoomOut; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-out-button').click();
      });
    }
    await page.getByText('K').locator('..').first().hover();
    await takeEditorScreenshot(page);
  });

  test('After importing a file with modified monomers, it is clear which monomer is modified, and when hovering, preview display changes made during modification', async ({
    page,
  }) => {
    /* 
    Test case: https://github.com/epam/ketcher/issues/3669
    Description: After importing a file with modified monomers, it is clear which monomer is modified, 
    and when hovering, preview display changes made during modification
    Test working incorrect now because we have bug https://github.com/epam/ketcher/issues/3669
    Mouse Wheel is used to display the structure since it does not open in the middle of the canvas. 
    After fixing the bug, the test will need to be changed.
    */
    const randomMouseWheelScroll = -600;
    await openFileAndAddToCanvas(
      'Molfiles-V3000/dna-mod-base-sugar-phosphate-example.mol',
      page,
    );
    await page.mouse.wheel(0, randomMouseWheelScroll);
    await page.getByText('cdaC').locator('..').hover();
    await takeEditorScreenshot(page);
  });

  const randomMouseWheelScroll = -600;
  const fileTypes = ['dna', 'rna'];

  for (const fileType of fileTypes) {
    test(`Import ${fileType.toUpperCase()} file`, async ({ page }) => {
      /* 
    Test case: Import/Saving files
    Description: Imported DNA file opens without errors. 
    DNA contains the nitrogen bases adenine (A), thymine (T) for DNA, uracil (U) for RNA, cytosine (C), and guanine (G).
    In RNA, thymine (T) is replaced by uracil (U).
    */
      await openFileAndAddToCanvas(`Molfiles-V3000/${fileType}.mol`, page);
      await page.mouse.wheel(0, randomMouseWheelScroll);
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

  test('Check import of file with 50 monomers saved in MOL V3000 format', async ({
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

    const numberOfPressZoomOut = 5;
    for (let i = 0; i < numberOfPressZoomOut; i++) {
      await waitForRender(page, async () => {
        await page.getByTestId('zoom-out-button').click();
      });
    }
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
    await page.getByTestId('save-button').click();
    await page.getByRole('combobox').click();
    await page.getByText('MDL Molfile V3000').click();
    await pressButton(page, 'Save');
    await takeEditorScreenshot(page);
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
});
