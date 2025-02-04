import { test, expect, Page } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  openFromFileViaClipboard,
  selectTopPanelButton,
  TopPanelButton,
  pressButton,
  selectOptionByText,
  openFileAndAddToCanvas,
  pasteFromClipboardAndAddToCanvas,
  openPasteFromClipboard,
  waitForPageInit,
  nonEmptyString,
  copyToClipboardByKeyboard,
  openFileAndAddToCanvasAsNewProject,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { clickOnFileFormatDropdown } from '@utils/formats';

async function selectInChiOption(page: Page) {
  await selectOptionByText(page, 'InChI');
  const previewInput = page.getByTestId('inChI-preview-area-text');
  await previewInput.waitFor({ state: 'visible' });
  await expect(previewInput).toContainText(nonEmptyString);
}

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
      await selectTopPanelButton(TopPanelButton.Open, page);
      await openFromFileViaClipboard(
        'tests/test-data/Txt/1963-inchi.txt',
        page,
      );
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
      await selectTopPanelButton(TopPanelButton.Open, page);
      await openFromFileViaClipboard(
        'tests/test-data/Txt/1967-inchi.txt',
        page,
      );
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
      await selectTopPanelButton(TopPanelButton.Open, page);
      await openFromFileViaClipboard(
        'tests/test-data/Txt/1968-inchi.txt',
        page,
      );
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
      await selectTopPanelButton(TopPanelButton.Open, page);
      await openFromFileViaClipboard(
        'tests/test-data/Txt/1969-inchi.txt',
        page,
      );
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
      await selectTopPanelButton(TopPanelButton.Open, page);
      await openFromFileViaClipboard(
        'tests/test-data/Txt/1970-inchi.txt',
        page,
      );
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
      await selectTopPanelButton(TopPanelButton.Open, page);
      await openFromFileViaClipboard(
        'tests/test-data/Txt/1971-inchi.txt',
        page,
      );
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
      await selectTopPanelButton(TopPanelButton.Open, page);
      await openFromFileViaClipboard(
        'tests/test-data/Txt/1974-inchi.txt',
        page,
      );
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
      await selectTopPanelButton(TopPanelButton.Open, page);
      await openFromFileViaClipboard(
        'tests/test-data/Txt/1975-inchi.txt',
        page,
      );
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
      await selectTopPanelButton(TopPanelButton.Open, page);
      await openFromFileViaClipboard(
        'tests/test-data/Txt/1976-inchi.txt',
        page,
      );
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
    await openFileAndAddToCanvas('KET/InChI-fused-structure.ket', page);
    await verifyFileExport(
      page,
      'InChI/InChI-fused-structure-expected.inchi',
      FileType.InChI,
    );
    await openFileAndAddToCanvasAsNewProject(
      'InChI/InChI-fused-structure-expected.inchi',
      page,
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
    await openFileAndAddToCanvas('KET/nonone-chain-structure.ket', page);
    await verifyFileExport(
      page,
      'InChI/nonone-chain-structure-expected.inchi',
      FileType.InChI,
    );
    await openFileAndAddToCanvasAsNewProject(
      'InChI/nonone-chain-structure-expected.inchi',
      page,
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
      'Molfiles-V2000/(2E,4E,6E)-nona-2,4,6-triene.mol',
      page,
    );
    await verifyFileExport(
      page,
      'InChI/(2E,4E,6E)-nona-2,4,6-triene-expected.inchi',
      FileType.InChI,
    );
    await openFileAndAddToCanvasAsNewProject(
      'InChI/(2E,4E,6E)-nona-2,4,6-triene-expected.inchi',
      page,
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
    await openFileAndAddToCanvas('Molfiles-V2000/nona-2,4,6-triyne.mol', page);
    await verifyFileExport(
      page,
      'InChI/nona-2,4,6-triyne-expected.inchi',
      FileType.InChI,
    );
    await openFileAndAddToCanvasAsNewProject(
      'InChI/nona-2,4,6-triyne-expected.inchi',
      page,
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
    await openFileAndAddToCanvas('KET/cyclic-cyclohexane-structure.ket', page);
    await verifyFileExport(
      page,
      'InChI/cyclic-cyclohexane-structure-expected.inchi',
      FileType.InChI,
    );
    await openFileAndAddToCanvasAsNewProject(
      'InChI/cyclic-cyclohexane-structure-expected.inchi',
      page,
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
      'Molfiles-V2000/sugar_without_stereo.mol',
      page,
    );
    await verifyFileExport(
      page,
      'InChI/sugar_without_stereo-expected.inchi',
      FileType.InChI,
    );
    await openFileAndAddToCanvasAsNewProject(
      'InChI/sugar_without_stereo-expected.inchi',
      page,
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
    await openFileAndAddToCanvas('Molfiles-V2000/Chiral.mol', page);
    await verifyFileExport(page, 'InChI/Chiral-expected.inchi', FileType.InChI);
    await openFileAndAddToCanvasAsNewProject(
      'InChI/Chiral-expected.inchi',
      page,
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
    await openFileAndAddToCanvas('Molfiles-V2000/spiro.mol', page);
    await verifyFileExport(page, 'InChI/spiro-expected.inchi', FileType.InChI);
    await openFileAndAddToCanvasAsNewProject(
      'InChI/spiro-expected.inchi',
      page,
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
    await openFileAndAddToCanvas('KET/nonone-chain-structure.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await clickOnFileFormatDropdown(page);
    await selectInChiOption(page);
    const inChistring = await page
      .getByTestId('inChI-preview-area-text')
      .inputValue();
    await copyToClipboardByKeyboard(page);
    await page.getByTestId('close-icon').click();
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await pasteFromClipboardAndAddToCanvas(page, inChistring);
  });

  test('Open and Save file - InChI String - Unconnected propane-hexane-benzene structure', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1928
     * Description: Open and Save file - InChi string for some structures
     */
    await openFileAndAddToCanvas('KET/propane-hexane-benzene.ket', page);
    await verifyFileExport(
      page,
      'InChI/propane-hexane-benzene-expected.inchi',
      FileType.InChI,
    );
    await openFileAndAddToCanvasAsNewProject(
      'InChI/propane-hexane-benzene-expected.inchi',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Open and Save file - InChI String - For reaction', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1929
     * Description: Open and Save file - InChi string for reaction
     */
    await openFileAndAddToCanvas(
      'KET/cyclohexane-connecting-arrow-with-benzene.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Save, page);
    await clickOnFileFormatDropdown(page);
    await page.getByRole('option', { name: 'InChI', exact: true }).click();
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
    await openFileAndAddToCanvas('KET/chain-with-s-group.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await clickOnFileFormatDropdown(page);
    await selectInChiOption(page);
    await page.getByTestId('warnings-tab').click();
    const warningTextArea = await page.getByTestId('WarningTextArea');
    const warningText = await warningTextArea.evaluate(
      (node) => node.textContent,
    );
    expect(warningText).toEqual(
      'In InChI the structure will be saved without S-groups',
    );
  });

  test('Open and Save file - InChI String - Alias', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1961
     * Description: Open and Save file - InChI String - Alias
     */
    await openFileAndAddToCanvas('KET/chain-with-alias.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await page.getByTestId('filename-input').fill('Alias');
    await clickOnFileFormatDropdown(page);
    await selectInChiOption(page);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await openFileAndAddToCanvas('InChI/alias.inchi', page);
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
      false,
    );
    const convertErrorMessage = await page
      .getByTestId('info-modal-body')
      .textContent();
    const expectedErrorMessage =
      'Convert error!\nGiven string could not be loaded as (query or plain) molecule or reaction, see the error messages: ' +
      "'molecule auto loader: SMILES loader: 'h' specifier is allowed only for query molecules', " +
      "'scanner: BufferScanner::read() error', 'scanner: BufferScanner::read() error', " +
      "'molecule auto loader: graph: already have edge between vertices 4 and 3'";
    expect(convertErrorMessage).toEqual(expectedErrorMessage);
  });

  test('Open and Save file - InChI String - Pseudoatom', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1962
     * Description: Open and Save file - InChI String - Pseudoatom
     */
    await openFileAndAddToCanvas('KET/chain-with-generic-group.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await clickOnFileFormatDropdown(page);
    await page.getByRole('option', { name: 'InChI', exact: true }).click();
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
    await openFileAndAddToCanvas('KET/chain-with-generic-group.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await clickOnFileFormatDropdown(page);
    await page.getByRole('option', { name: 'InChI', exact: true }).click();
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
    await openFileAndAddToCanvas('KET/nonone-chain-structure.ket', page);
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
    await openFileAndAddToCanvas('KET/structure-with-R-Group.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await clickOnFileFormatDropdown(page);
    await page.getByRole('option', { name: 'InChI', exact: true }).click();
    const convertErrorMessage = await page
      .getByTestId('info-modal-body')
      .textContent();
    const expectedErrorMessage =
      'Convert error!\ninchi-wrapper: Molecule with RGroups cannot be converted into InChI';
    expect(convertErrorMessage).toEqual(expectedErrorMessage);
  });
});
