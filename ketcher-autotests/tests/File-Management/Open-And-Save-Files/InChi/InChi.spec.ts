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
  getControlModifier,
  pasteFromClipboardAndAddToCanvas,
  openPasteFromClipboard,
  waitForPageInit,
} from '@utils';

async function selectInChiOption(page: Page) {
  await selectOptionByText(page, 'InChI');
  await expect(page.getByTestId('preview-area-text')).toContainText('InChI=');
}

test.describe('', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
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
    await selectTopPanelButton(TopPanelButton.Save, page);
    await pressButton(page, 'MDL Molfile V2000');
    await selectInChiOption(page);
    const inChistring = await page
      .getByTestId('preview-area-text')
      .inputValue();
    expect(inChistring).toEqual('InChI=1S//');
  });

  test('Open and Save file - InChI String - Fused structure', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1954
     * Description: Open and Save file - InChI String - Fused structure
     */
    await openFileAndAddToCanvas('KET/InChI-fused-structure.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await pressButton(page, 'MDL Molfile V2000');
    await selectInChiOption(page);
    const inChistring = await page
      .getByTestId('preview-area-text')
      .inputValue();
    const expectedInChIstring =
      'InChI=1S/C22H36/c1-2-6-16-10-20-14-22-12-18-8-4-3-7-17(18)11-21(22)13-19(20)9-15(16)5-1/h15-22H,1-14H2';
    expect(inChistring).toEqual(expectedInChIstring);
  });

  test('Open and Save file - InChI String - Chain string with single bonds only', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1939
     * Description: Open and Save file - InChI String - Chain string with single bonds only
     */
    await openFileAndAddToCanvas('KET/nonone-chain-structure.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await pressButton(page, 'MDL Molfile V2000');
    await selectInChiOption(page);
    const inChistring = await page
      .getByTestId('preview-area-text')
      .inputValue();
    const expectedInChIstring =
      'InChI=1S/C11H24/c1-3-5-7-9-11-10-8-6-4-2/h3-11H2,1-2H3';
    expect(inChistring).toEqual(expectedInChIstring);
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
    await selectTopPanelButton(TopPanelButton.Save, page);
    await pressButton(page, 'MDL Molfile V2000');
    await selectInChiOption(page);
    const inChistring = await page
      .getByTestId('preview-area-text')
      .inputValue();
    const expectedInChIstring =
      'InChI=1S/C9H14/c1-3-5-7-9-8-6-4-2/h3,5-9H,4H2,1-2H3/b5-3+,8-6+,9-7+';
    expect(inChistring).toEqual(expectedInChIstring);
  });

  test('Open and Save file - InChI String - Chain string that contains some triple', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1941
     * Description: Open and Save file - InChI String - Chain string that contains some triple
     */
    await openFileAndAddToCanvas('Molfiles-V2000/nona-2,4,6-triyne.mol', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await pressButton(page, 'MDL Molfile V2000');
    await selectInChiOption(page);
    const inChistring = await page
      .getByTestId('preview-area-text')
      .inputValue();
    const expectedInChIstring = 'InChI=1S/C9H8/c1-3-5-7-9-8-6-4-2/h3H2,1-2H3';
    expect(inChistring).toEqual(expectedInChIstring);
  });

  test('Open and Save file - InChI String - Cyclic structure with single bonds only', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1951
     * Description: Open and Save file - InChI String - Cyclic structure with single bonds only
     */
    await openFileAndAddToCanvas('KET/cyclic-cyclohexane-structure.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await pressButton(page, 'MDL Molfile V2000');
    await selectInChiOption(page);
    const inChistring = await page
      .getByTestId('preview-area-text')
      .inputValue();
    const expectedInChIstring = 'InChI=1S/C6H12/c1-2-4-6-5-3-1/h1-6H2';
    expect(inChistring).toEqual(expectedInChIstring);
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
    await selectTopPanelButton(TopPanelButton.Save, page);
    await pressButton(page, 'MDL Molfile V2000');
    await selectInChiOption(page);
    const inChistring = await page
      .getByTestId('preview-area-text')
      .inputValue();
    const expectedInChIstring =
      'InChI=1S/C18H36/c1-13(2)14(3,4)16(7,8)18(11,12)17(9,10)15(13,5)6/h1-12H3';
    expect(inChistring).toEqual(expectedInChIstring);
  });

  test('Open and Save file - InChI String - Structure with stereobonds', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1953
     * Description: Open and Save file - InChI String - Structure with stereobonds
     */
    await openFileAndAddToCanvas('Molfiles-V2000/Chiral.mol', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await pressButton(page, 'MDL Molfile V2000');
    await selectInChiOption(page);
    const inChistring = await page
      .getByTestId('preview-area-text')
      .inputValue();
    const expectedInChIstring =
      'InChI=1S/C20H24O2/c1-12-10-14-15-4-5-18(22)20(15,3)9-7-16(14)19(2)8-6-13(21)11-17(12)19/h6,8,11,14-16H,1,4-5,7,9-10H2,2-3H3/t14-,15-,16-,19+,20-/m0/s1';
    expect(inChistring).toEqual(expectedInChIstring);
  });

  test('Open and Save file - InChI String - Spiro structure', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1955
     * Description: Open and Save file - InChI String - Spiro structure
     */
    await openFileAndAddToCanvas('Molfiles-V2000/spiro.mol', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await pressButton(page, 'MDL Molfile V2000');
    await selectInChiOption(page);
    const inChistring = await page
      .getByTestId('preview-area-text')
      .inputValue();
    const expectedInChIstring =
      'InChI=1S/C26H44/c1-3-7-23(8-4-1)11-15-25(16-12-23)19-21-26(22-20-25)17-13-24(14-18-26)9-5-2-6-10-24/h1-22H2';
    expect(inChistring).toEqual(expectedInChIstring);
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
    await pressButton(page, 'MDL Molfile V2000');
    await selectInChiOption(page);
    const inChistring = await page
      .getByTestId('preview-area-text')
      .inputValue();
    const modifier = getControlModifier();
    await page.keyboard.press(`${modifier}+KeyC`);
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
    await selectTopPanelButton(TopPanelButton.Save, page);
    await pressButton(page, 'MDL Molfile V2000');
    await selectInChiOption(page);
    const inChistring = await page
      .getByTestId('preview-area-text')
      .inputValue();
    const expectedInChIstring =
      'InChI=1S/C6H6.C6H14.C3H8/c1-2-4-6-5-3-1;1-3-5-6-4-2;1-3-2/h1-6H;3-6H2,1-2H3;3H2,1-2H3';
    expect(inChistring).toEqual(expectedInChIstring);
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
    await pressButton(page, 'MDL Rxnfile V2000');
    await selectInChiOption(page);
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
    await pressButton(page, 'MDL Molfile V2000');
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
    await page.getByTestId('file-name-input').fill('Alias');
    await pressButton(page, 'MDL Molfile V2000');
    await selectInChiOption(page);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await openFileAndAddToCanvas('inchi/Alias.inchi', page);
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
    await pressButton(page, 'MDL Molfile V2000');
    await selectInChiOption(page);
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
    await pressButton(page, 'MDL Molfile V2000');
    await selectInChiOption(page);
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
    await pressButton(page, 'MDL Molfile V2000');
    await selectInChiOption(page);
    const convertErrorMessage = await page
      .getByTestId('info-modal-body')
      .textContent();
    const expectedErrorMessage =
      'Convert error!\ninchi-wrapper: Molecule with RGroups cannot be converted into InChI';
    expect(convertErrorMessage).toEqual(expectedErrorMessage);
  });
});
