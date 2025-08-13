import { test, expect } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  pressButton,
  openFileAndAddToCanvas,
  pasteFromClipboardAndAddToCanvas,
  openPasteFromClipboard,
  waitForPageInit,
  copyToClipboardByKeyboard,
  openFileAndAddToCanvasAsNewProject,
  readFileContent,
} from '@utils';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { PasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';

test.describe('', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test(
    'Open and Save file - Generate structure from ' +
      'InChI String - inserting correct string for multiple structures',
    async ({ page }) => {
      /**
       * Test case: EPMLSOPKET-1963
       * Description: Open multiple structures from InChi string
       */
      // add first structure from clipboard to canvas
      const fileContent = await readFileContent('Txt/1963-inchi.txt');

      await pasteFromClipboardAndAddToCanvas(page, fileContent);
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Open and Save file - Generate structure from InChI String - ' +
      'Chain string with single bonds only',
    async ({ page }) => {
      /**
       * Test case: EPMLSOPKET-1967
       * Description: Open structure with single bonds from InChi string
       */
      // add first structure from clipboard to canvas
      const fileContent = await readFileContent('Txt/1967-inchi.txt');

      await pasteFromClipboardAndAddToCanvas(page, fileContent);
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Open and Save file - Generate structure from InChI String - ' +
      'Chain string that contains some double bonds',
    async ({ page }) => {
      /**
       * Test case: EPMLSOPKET-1968
       * Description: Open structure with some double bonds from InChi string
       */
      // add first structure from clipboard to canvas
      const fileContent = await readFileContent('Txt/1968-inchi.txt');

      await pasteFromClipboardAndAddToCanvas(page, fileContent);
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Open and Save file - Generate structure from InChI ' +
      'String - Chain string that contains some triple bonds',
    async ({ page }) => {
      /**
       * Test case: EPMLSOPKET-1969
       * Description: Open structure with some triple bonds from InChi string
       */
      // add first structure from clipboard to canvas
      const fileContent = await readFileContent('Txt/1969-inchi.txt');

      await pasteFromClipboardAndAddToCanvas(page, fileContent);
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Open and Save file - Generate structure from ' +
      'InChI String - Cyclic structure with single bonds only',
    async ({ page }) => {
      /**
       * Test case: EPMLSOPKET-1970
       * Description: Open cyclic structure with single bonds from InChi string
       */
      // add first structure from clipboard to canvas
      const fileContent = await readFileContent('Txt/1970-inchi.txt');

      await pasteFromClipboardAndAddToCanvas(page, fileContent);
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Open and Save file - Generate structure ' +
      'from InChI String - Sugars without stereobonds',
    async ({ page }) => {
      /**
       * Test case: EPMLSOPKET-1971
       * Description: Open sugar without stereobonds from InChi string
       */
      // add first structure from clipboard to canvas
      const fileContent = await readFileContent('Txt/1971-inchi.txt');

      await pasteFromClipboardAndAddToCanvas(page, fileContent);
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Open and Save file - Generate structure ' +
      'from InChI String - Structure with stereobonds',
    async ({ page }) => {
      /**
       * Test case: EPMLSOPKET-1974
       * Description: Open structure with stereobonds from InChi string
       */
      // add first structure from clipboard to canvas
      const fileContent = await readFileContent('Txt/1974-inchi.txt');

      await pasteFromClipboardAndAddToCanvas(page, fileContent);
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Open and Save file - Generate structure ' +
      'from InChI String - Fused structure',
    async ({ page }) => {
      /**
       * Test case: EPMLSOPKET-1975
       * Description: Open structure with fused bonds from InChi string
       */
      // add first structure from clipboard to canvas
      const fileContent = await readFileContent('Txt/1975-inchi.txt');

      await pasteFromClipboardAndAddToCanvas(page, fileContent);
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Open and Save file - Generate structure ' +
      'from InChI String - Spiro structure',
    async ({ page }) => {
      /**
       * Test case: EPMLSOPKET-1976
       * Description: Open spiro structure from InChi string
       */
      // add first structure from clipboard to canvas
      const fileContent = await readFileContent('Txt/1976-inchi.txt');

      await pasteFromClipboardAndAddToCanvas(page, fileContent);
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);
    },
  );
});

test.describe('Open and Save InChI file', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Open and Save file - Save empty InChI File', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1926
     * Description: Open and Save file - InChi for emty canvas
     */
    await verifyFileExport(
      page,
      'InChI/empty-canvas-expected.inchi',
      FileType.InChI,
    );
  });

  test('Open and Save file - InChI String - Fused structure', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1954
     * Description: Open and Save file - InChI String - Fused structure
     */
    await openFileAndAddToCanvas(page, 'KET/InChI-fused-structure.ket');
    await verifyFileExport(
      page,
      'InChI/InChI-fused-structure-expected.inchi',
      FileType.InChI,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'InChI/InChI-fused-structure-expected.inchi',
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - InChI String - Chain string with single bonds only', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1939
     * Description: Open and Save file - InChI String - Chain string with single bonds only
     */
    await openFileAndAddToCanvas(page, 'KET/nonone-chain-structure.ket');
    await verifyFileExport(
      page,
      'InChI/nonone-chain-structure-expected.inchi',
      FileType.InChI,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'InChI/nonone-chain-structure-expected.inchi',
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - InChI String - Chain string that contains some double bonds', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1940
     * Description: Open and Save file - InChI String - Chain string that contains some double bonds
     */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/(2E,4E,6E)-nona-2,4,6-triene.mol',
    );
    await verifyFileExport(
      page,
      'InChI/(2E,4E,6E)-nona-2,4,6-triene-expected.inchi',
      FileType.InChI,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'InChI/(2E,4E,6E)-nona-2,4,6-triene-expected.inchi',
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - InChI String - Chain string that contains some triple', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1941
     * Description: Open and Save file - InChI String - Chain string that contains some triple
     */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/nona-2,4,6-triyne.mol');
    await verifyFileExport(
      page,
      'InChI/nona-2,4,6-triyne-expected.inchi',
      FileType.InChI,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'InChI/nona-2,4,6-triyne-expected.inchi',
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - InChI String - Cyclic structure with single bonds only', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1951
     * Description: Open and Save file - InChI String - Cyclic structure with single bonds only
     */
    await openFileAndAddToCanvas(page, 'KET/cyclic-cyclohexane-structure.ket');
    await verifyFileExport(
      page,
      'InChI/cyclic-cyclohexane-structure-expected.inchi',
      FileType.InChI,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'InChI/cyclic-cyclohexane-structure-expected.inchi',
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - InChI String - Sugars without stereobonds', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1952
     * Description: Open and Save file - InChI String - Sugars without stereobonds
     */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/sugar_without_stereo.mol',
    );
    await verifyFileExport(
      page,
      'InChI/sugar_without_stereo-expected.inchi',
      FileType.InChI,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'InChI/sugar_without_stereo-expected.inchi',
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - InChI String - Structure with stereobonds', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1953
     * Description: Open and Save file - InChI String - Structure with stereobonds
     */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/Chiral.mol');
    await verifyFileExport(page, 'InChI/Chiral-expected.inchi', FileType.InChI);
    await openFileAndAddToCanvasAsNewProject(
      page,
      'InChI/Chiral-expected.inchi',
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - InChI String - Spiro structure', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1955
     * Description: Open and Save file - InChI String - Spiro structure
     */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/spiro.mol');
    await verifyFileExport(page, 'InChI/spiro-expected.inchi', FileType.InChI);
    await openFileAndAddToCanvasAsNewProject(
      page,
      'InChI/spiro-expected.inchi',
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - InChI String - Chain Stucture', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1927
     * Description: Open and Save file - InChi for structure
     */
    const saveStructureTextarea =
      SaveStructureDialog(page).saveStructureTextarea;

    await openFileAndAddToCanvas(page, 'KET/nonone-chain-structure.ket');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.InChI,
    );

    const inChistring = await saveStructureTextarea.inputValue();
    await copyToClipboardByKeyboard(page);
    await PasteFromClipboardDialog(page).closeWindowButton.click();
    await CommonTopLeftToolbar(page).clearCanvas();
    await pasteFromClipboardAndAddToCanvas(page, inChistring);
  });

  test('Open and Save file - InChI String - Unconnected propane-hexane-benzene structure', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1928
     * Description: Open and Save file - InChi string for some structures
     */
    await openFileAndAddToCanvas(page, 'KET/propane-hexane-benzene.ket');
    await verifyFileExport(
      page,
      'InChI/propane-hexane-benzene-expected.inchi',
      FileType.InChI,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'InChI/propane-hexane-benzene-expected.inchi',
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - InChI String - For reaction', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1929
     * Description: Open and Save file - InChi string for reaction
     */
    await openFileAndAddToCanvas(
      page,
      'KET/cyclohexane-connecting-arrow-with-benzene.ket',
    );
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.InChI,
    );
    const convertErrorMessage = await page
      .getByTestId('info-modal-body')
      .textContent();
    const expectedErrorMessage =
      'Convert error!\ncore: <reaction> is not a molecule';
    expect(convertErrorMessage).toEqual(expectedErrorMessage);
  });

  test('Open and Save file - InChi string - for Sgroup', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1937
     * Description: Open and Save file - InChi string for Sgroup
     */
    const saveStructureDialog = SaveStructureDialog(page);

    await openFileAndAddToCanvas(page, 'KET/chain-with-s-group.ket');
    await CommonTopLeftToolbar(page).saveFile();
    await saveStructureDialog.chooseFileFormat(MoleculesFileFormatType.InChI);

    await saveStructureDialog.switchToWarningsTab();

    await expect(saveStructureDialog.warningTextarea).toContainText(
      'In InChI the structure will be saved without S-groups',
    );
  });

  test('Open and Save file - InChI String - Alias', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1961
     * Description: Open and Save file - InChI String - Alias
     */
    await openFileAndAddToCanvas(page, 'KET/chain-with-alias.ket');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).setFileName('Alias');
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.InChI,
    );

    await SaveStructureDialog(page).save();
    await openFileAndAddToCanvas(page, 'InChI/alias.inchi');
  });

  test('Open and Save file - Generate structure from InChI String - inserting incorrect name', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1964
     * Description: Open and Save file - Generate structure from InChI String - inserting incorrect name
     */

    await pasteFromClipboardAndAddToCanvas(
      page,
      '1S/C9H14/c1-3-5-7-9-8-6-4-2/h3,5-9H,4H2,1-2H3/b5-3-,8-6+,9-7+',
      true,
    );
    const convertErrorMessage = await page
      .getByTestId('info-modal-body')
      .textContent();
    const expectedErrorMessage =
      'Convert error!\nGiven string could not be loaded as (query or plain) molecule or reaction, see the error messages: ' +
      "'molecule auto loader: SMILES loader: 'h' specifier is allowed only for query molecules', " +
      "'scanner: BufferScanner::read() error', 'scanner: BufferScanner::read() error', " +
      "'molecule auto loader: graph: already have edge between vertices 4 and 3', " +
      "'molecule auto loader: SMILES loader: 'h' specifier is allowed only for query molecules', " +
      "'scanner: BufferScanner::read() error'";
    expect(convertErrorMessage).toEqual(expectedErrorMessage);
  });

  test('Open and Save file - InChI String - Pseudoatom', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1962
     * Description: Open and Save file - InChI String - Pseudoatom
     */
    await openFileAndAddToCanvas(page, 'KET/chain-with-generic-group.ket');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.InChI,
    );
    const convertErrorMessage = await page
      .getByTestId('info-modal-body')
      .textContent();
    const expectedErrorMessage =
      'Convert error!\ninchi-wrapper: Molecule with pseudoatom (AHC) cannot be converted into InChI';
    expect(convertErrorMessage).toEqual(expectedErrorMessage);
  });

  test('Open and Save file - InChI String for invalid atom symbol or special symbol', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1938
     * Description: Open and Save file - InChI String for invalid atom symbol or special symbol
     */
    await openFileAndAddToCanvas(page, 'KET/chain-with-generic-group.ket');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.InChI,
    );
    const convertErrorMessage = await page
      .getByTestId('info-modal-body')
      .textContent();
    const expectedErrorMessage =
      'Convert error!\ninchi-wrapper: Molecule with pseudoatom (AHC) cannot be converted into InChI';
    expect(convertErrorMessage).toEqual(expectedErrorMessage);
  });

  test('Open and Save file - Generate structure from InChI String - inserting incorrect name and Cancel or X button', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1965
     * Description: Open and Save file - Generate structure from InChI String - inserting incorrect name and Cancel or X button
     */
    await openFileAndAddToCanvas(page, 'KET/nonone-chain-structure.ket');
    await openPasteFromClipboard(page, '123.!@*');
    await pressButton(page, 'Cancel');
    await openPasteFromClipboard(page, '123.!@*');
    await page.keyboard.press('Escape');
    // await press
  });

  test('Open and Save file - InChi string for Rgroup', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1930
     * Description: Open and Save file - InChi string for Rgroup
     */
    await openFileAndAddToCanvas(page, 'KET/structure-with-R-Group.ket');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.InChI,
    );
    const convertErrorMessage = await page
      .getByTestId('info-modal-body')
      .textContent();
    const expectedErrorMessage =
      'Convert error!\ninchi-wrapper: Molecule with RGroups cannot be converted into InChI';
    expect(convertErrorMessage).toEqual(expectedErrorMessage);
  });
});
