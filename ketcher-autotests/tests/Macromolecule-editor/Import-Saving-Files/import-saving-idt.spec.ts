import { test, expect, Page } from '@playwright/test';
import {
  TopPanelButton,
  openFileAndAddToCanvasMacro,
  selectTopPanelButton,
  takeEditorScreenshot,
  waitForPageInit,
  saveToFile,
  openFile,
  receiveFileComparisonData,
  // selectOptionInDropdown,
  // pressButton,
  chooseFileFormat,
  readFileContents,
  moveMouseAway,
  getIdt,
  selectSequenceLayoutModeTool,
  selectSnakeLayoutModeTool,
  waitForLoad,
  pressButton,
  selectMacromoleculesPanelButton,
  MacromoleculesTopPanelButton,
  selectSingleBondTool,
  waitForRender,
  takePolymerEditorScreenshot,
  openStructurePasteFromClipboard,
  clickInTheMiddleOfTheScreen,
} from '@utils';
import {
  enterSequence,
  turnOnMacromoleculesEditor,
} from '@utils/macromolecules';
import {
  toggleNucleotidesAccordion,
  togglePhosphatesAccordion,
} from '@utils/macromolecules/rnaBuilder';

async function pasteFromClipboardAndAddToMacromoleculesCanvas(
  page: Page,
  structureFormat: string,
  fillStructure: string,
  needToWait = true,
) {
  await selectMacromoleculesPanelButton(
    MacromoleculesTopPanelButton.Open,
    page,
  );
  await page.getByText('Paste from clipboard').click();
  if (!(structureFormat === 'Ket')) {
    await page.getByRole('combobox').click();
    await page.getByText(structureFormat).click();
  }

  await page.getByRole('dialog').getByRole('textbox').fill(fillStructure);
  if (needToWait) {
    await waitForLoad(page, async () => {
      await pressButton(page, 'Add to Canvas');
    });
  } else {
    await pressButton(page, 'Add to Canvas');
  }
}

function removeNotComparableData(file: string) {
  return file.replaceAll('\r', '');
}
test.describe('Import-Saving .idt Files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test(`Import .idt file`, async ({ page }) => {
    await openFileAndAddToCanvasMacro('IDT/idt-a.idt', page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('Check option "IDT" to the format dropdown menu of modal window Paste from the clipboard is exist', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files/#4495
    Description: Option "IDT" to the format dropdown menu of modal window Paste from the clipboard is exist.
    */
    await openStructurePasteFromClipboard(page);

    const fileFormatComboBox = page
      .getByTestId('dropdown-select')
      .getByRole('combobox');

    await fileFormatComboBox.click();

    const options = page.getByRole('option');
    const values = await options.allTextContents();

    const expectedValues = ['IDT'];
    for (const value of expectedValues) {
      expect(values).toContain(value);
    }
  });

  test('Check option "IDT" to dropdown File format of modal window Save Structure is exist', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files/#4495
    Description: Option "IDT" to dropdown File format of modal window Save Structure is exist.
    */
    await selectTopPanelButton(TopPanelButton.Save, page);

    const fileFormatComboBox = page
      .getByTestId('dropdown-select')
      .getByRole('combobox');

    await fileFormatComboBox.click();

    const options = page.getByRole('option');
    const values = await options.allTextContents();

    const expectedValues = [
      'Ket',
      'MDL Molfile V3000',
      'Sequence',
      'FASTA',
      'IDT',
      'SVG Document',
      'HELM',
    ];
    for (const value of expectedValues) {
      expect(values).toContain(value);
    }
  });

  test('Check that in case of peptide monomers are on canvas, error "Peptide monomers are not supported in IDT" appear', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files/#4495
    Description: In case of peptide monomers are on canvas, error "Peptide monomers are not supported in IDT" appear.
    */
    await page.getByTestId('1Nal___3-(1-naphthyl)-alanine').click();
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'IDT');
    await takeEditorScreenshot(page);
  });

  // Fail while performance issue on Indigo side
  // test('Import incorrect data', async ({ page }) => {
  //   const randomText = '!+%45#asjfnsalkfl';
  //   await selectTopPanelButton(TopPanelButton.Open, page);
  //   await page.getByTestId('paste-from-clipboard-button').click();
  //   await page.getByTestId('open-structure-textarea').fill(randomText);
  //   await chooseFileFormat(page, 'IDT');
  //   await page.getByTestId('add-to-canvas-button').click();
  //   await takeEditorScreenshot(page);
  // });

  test('Check import of .ket file and save in .idt format', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro('KET/rna-a.ket', page);
    const expectedFile = await getIdt(page);
    await saveToFile('IDT/idt-rna-a.idt', expectedFile);

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: idtFileExpected, file: idtFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/IDT/idt-rna-a.idt',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(idtFile).toEqual(idtFileExpected);

    await takeEditorScreenshot(page);
  });

  test('Check that empty file can be saved in .idt format', async ({
    page,
  }) => {
    const expectedFile = await getIdt(page);
    await saveToFile('IDT/idt-empty.idt', expectedFile);

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: idtFileExpected, file: idtFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/IDT/idt-empty.idt',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(idtFile).toEqual(idtFileExpected);
  });

  test('Check that system does not let importing empty .idt file', async ({
    page,
  }) => {
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('IDT/idt-empty.idt', page);
    await page.getByText('Add to Canvas').isDisabled();
  });

  test('Check IDT aliases, where defined in the preview window for Phosphates section', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files/#4380
    Description: IDT aliases, where defined in the preview window for Phosphates.
    */
    await page.getByTestId('RNA-TAB').click();
    await togglePhosphatesAccordion(page);
    await waitForRender(page, async () => {
      await page.getByTestId('P___Phosphate').hover();
    });
    await takePolymerEditorScreenshot(page);
  });

  const rnaNucleotides = [
    `2-Amino-dA___2,6-Diaminopurine`,
    `5HydMe-dC___Hydroxymethyl dC`,
    `Super G___8-aza-7-deazaguanosine`,
    `AmMC6T___Amino Modifier C6 dT`,
    `Super T___5-hydroxybutynl-2’-deoxyuridine`,
    `5-Bromo dU___5-Bromo-deoxyuridine`,
    `5NitInd___5-Nitroindole`,
  ];

  for (const monomer of rnaNucleotides) {
    test(`Check IDT aliases, where defined in the preview window for RNA Nucleotides monomer ${monomer}`, async ({
      page,
    }) => {
      /*
      Test case: Import/Saving files/#4380
      Description: IDT aliases, where defined in the preview window for RNA monomers in library.
      */
      await page.getByTestId('RNA-TAB').click();
      await toggleNucleotidesAccordion(page);
      await waitForRender(page, async () => {
        await page.getByTestId(monomer).hover();
      });
      await takePolymerEditorScreenshot(page);
    });
  }

  const rnaMonomers = [
    'MOE(G)P_G_MOE_P',
    'MOE(A)P_A_MOE_P',
    'MOE(5meC)P_5meC_MOE_P',
    'MOE(T)P_T_MOE_P',
    'dR(U)P_U_dR_P',
  ];

  for (const monomer of rnaMonomers) {
    test(`Check IDT aliases, where defined in the preview window for RNA monomer ${monomer}`, async ({
      page,
    }) => {
      /*
      Test case: Import/Saving files/#4380
      Description: IDT aliases, where defined in the preview window for RNA monomers in library.
      */
      await page.getByTestId('RNA-TAB').click();
      await waitForRender(page, async () => {
        await page.getByTestId(monomer).hover();
      });
      await takePolymerEditorScreenshot(page);
    });
  }

  // Fail while performance issue on Indigo side
  // test('Check that system does not let uploading corrupted .idt file', async ({
  //   page,
  // }) => {
  //   await selectTopPanelButton(TopPanelButton.Open, page);
  //
  //   const filename = 'IDT/idt-corrupted.idt';
  //   await openFile(filename, page);
  //   await selectOptionInDropdown(filename, page);
  //   await pressButton(page, 'Add to Canvas');
  //   await takeEditorScreenshot(page);
  // });

  test('Should open .ket file and modify to .idt format in save modal textarea', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro('KET/rna-a.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'IDT');
    await page
      .getByTestId('dropdown-select')
      .getByRole('combobox')
      .allInnerTexts();

    const textArea = page.getByTestId('preview-area-text');
    const file = await readFileContents('tests/test-data/IDT/idt-rna-a.idt');
    const expectedData = removeNotComparableData(file);
    const valueInTextarea = removeNotComparableData(
      await textArea.inputValue(),
    );
    expect(valueInTextarea).toBe(expectedData);
  });

  const fileNames = [
    'DNA-All-PS',
    '2-MOE-DNA-chimera-All-PS',
    'Affinity-Plus-DNA-chimera-All-PS',
    '2-OMe-DNA-chimera-All-PS',
    'Gapmer-with-5-Methylcytosine',
  ];

  for (const fileName of fileNames) {
    test(`Verify import of ${fileName} sequence with modifications from IDT format using Open file (Sequence mode/Flex/Snake) `, async ({
      page,
    }) => {
      /*
    Test case: Import/Saving files/4310
    Description: Structure is opening
    */
      await openFileAndAddToCanvasMacro(`IDT/${fileName}.idt`, page);
      await takeEditorScreenshot(page);
      await selectSequenceLayoutModeTool(page);
      await takeEditorScreenshot(page);
      await selectSnakeLayoutModeTool(page);
      await takeEditorScreenshot(page);
    });
  }

  const fileNames1 = [
    'A*C*G*C*G*C*G*A*C*T*A*T*A*C*G*C*G*C*C*T',
    '/52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*C*G*A*C*T*A*T*A*C*G*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErC/*/32MOErT/',
    '+G*+C*+G*C*G*A*C*T*A*T*A*C*G*+C*+G*+C',
    'mA*mC*mG*mC*mG*C*G*A*C*T*A*T*A*C*G*mC*mG*mC*mC*mU',
    '/52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/*G*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErC/*/32MOErT/',
  ];

  for (const fileName of fileNames1) {
    test(`Verify import of ${fileName} sequence with modifications from IDT format using Paste from Clipboard (Sequence mode/Flex/Snake) `, async ({
      page,
    }) => {
      /*
    Test case: Import/Saving files/4310
    Description: Structure is opening
    */
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        'IDT',
        `${fileName}`,
      );
      await takeEditorScreenshot(page);
      await selectSequenceLayoutModeTool(page);
      await takeEditorScreenshot(page);
      await selectSnakeLayoutModeTool(page);
      await takeEditorScreenshot(page);
    });
  }

  test('Verify error handling for invalid sequences with modifications during import from Paste from Clipboard', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files/4310
    Description: Error appears
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      'IDT',
      `A*C*G*C*G*C*G*A*C*T*
      A*T*A*C*G*C*G*C*C*T`,
      false,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that sequences with modifications can be edited after import', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files/4310
    Description: Sequences with modifications can be edited after import
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      'IDT',
      `A*C*G*C*G*C*G*A*C*T*A*T*A*C*G*C*G*C*C*T`,
    );
    await selectSequenceLayoutModeTool(page);
    await page.getByText('G').locator('..').first().click({ button: 'right' });
    await page.getByTestId('edit_sequence').click();
    await enterSequence(page, 'ttt');
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page);
  });

  test('Verify export of sequences with modifications from IDT format using API (getIdt)', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files/4310
    Description: Sequences are exported by getIdt
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      'IDT',
      `A*C*G*C*G*C*G*A*C*T*A*T*A*C*G*C*G*C*C*T`,
    );
    await selectSequenceLayoutModeTool(page);
    const expectedFile = await getIdt(page);
    await saveToFile('IDT/idt-expected.idt', expectedFile);

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: idtFileExpected, file: idtFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/IDT/idt-expected.idt',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(idtFile).toEqual(idtFileExpected);
    await takeEditorScreenshot(page);
  });

  test('Verify export of sequences with modifications from IDT format using Save file(Flex mode)', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files/4310
    Description: IDT appears in save preview
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      'IDT',
      `A*C*G*C*G*C*G*A*C*T*A*T*A*C*G*C*G*C*C*T`,
    );
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'IDT');
    await takeEditorScreenshot(page);
  });

  test('Verify export of sequences with modifications from IDT format using Save file(Sequence mode)', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files/4310
    Description: IDT appears in save preview
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      'IDT',
      `+G*+C*+G*C*G*A*C*T*A*T*A*C*G*+C*+G*+C`,
    );
    await selectSequenceLayoutModeTool(page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'IDT');
    await takeEditorScreenshot(page);
  });

  test('Test performance impact of importing large sequences with multiple modifications via Paste from Clipboard', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files/4310
    Description: Sequences are opened.
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      'IDT',
      `A*C*G*C*G*C*G*A*C*T*A*T*A*C*G*C*G*C*C*T
      
      /52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*C*G*A*C*T*A*T*A*C*G*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErC/*/32MOErT/

      +G*+C*+G*C*G*A*C*T*A*T*A*C*G*+C*+G*+C

      mA*mC*mG*mC*mG*C*G*A*C*T*A*T*A*C*G*mC*mG*mC*mC*mU

      /52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/*G*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErC/*/32MOErT/
      `,
    );
    await takeEditorScreenshot(page);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Verify export of multiple sequences with modifications from IDT format using Save file(Sequence mode)', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files/4310
    Description: Sequences are appears at save preview window.
    We have bug https://github.com/epam/Indigo/issues/2043 
    When it fixed we should update snapshot.
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      'IDT',
      `A*C*G*C*G*C*G*A*C*T*A*T*A*C*G*C*G*C*C*T
      
      /52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*C*G*A*C*T*A*T*A*C*G*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErC/*/32MOErT/

      +G*+C*+G*C*G*A*C*T*A*T*A*C*G*+C*+G*+C

      mA*mC*mG*mC*mG*C*G*A*C*T*A*T*A*C*G*mC*mG*mC*mC*mU

      /52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/*G*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErC/*/32MOErT/
      `,
    );
    await selectSequenceLayoutModeTool(page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'IDT');
    await takeEditorScreenshot(page);
  });

  test('Verify bonds establishment between monomers from R2 to R1 attachment points', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files/1899
    Description: Bonds establishment between monomers from R2 to R1 attachment points.
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      'IDT',
      `/52MOErA/*/i2MOErC/*/32MOErT/`,
    );
    const bondLine = page.locator('g[pointer-events="stroke"]').first();
    await selectSingleBondTool(page);
    await bondLine.hover();
    await takeEditorScreenshot(page);
  });

  test('Verify import of sequences with /5Phos/ and /3Phos/ modifications', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files/1899
    Description: Sequences with /5Phos/ and /3Phos/ modifications imported.
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      'IDT',
      `/5Phos/ACG/3Phos/`,
    );
    await takeEditorScreenshot(page);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Verify export of known modified monomers with IDT alias and structure', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files/1900
    Description: Sequences are appears at save preview window.
    We have bug https://github.com/epam/Indigo/issues/2043 
    When it fixed we should update snapshot.
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      'IDT',
      `/52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/*G*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErC/*/32MOErT/`,
    );
    await selectSequenceLayoutModeTool(page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'IDT');
    await takeEditorScreenshot(page);
  });

  test('Verify error message when export of nucleotides split to submonomers with no IDT alias', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files/1900/1985
    Description: Error message appeared: "This molecule has unsupported monomer and couldn't be exported to IDT notation".
    We have bug https://github.com/epam/Indigo/issues/1985 
    When it fixed we should update snapshot.
    */
    await openFileAndAddToCanvasMacro('KET/5formD-form5C-cm.ket', page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'IDT');
    await takeEditorScreenshot(page);
  });

  test('Verify that if * is specified, Phosphorothioate (sP) is included in nucleotide if not it is (P)', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files/1900
    Description: If * is specified, Phosphorothioate (sP) is included in nucleotide if not it is (P).
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      'IDT',
      `/52MOErA/*/i2MOErC/*/32MOErT/
      
      /5Phos/ACG/3Phos/
      `,
    );
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'IDT');
    await takeEditorScreenshot(page);
  });

  test('Open some expected IDT', async ({ page }) => {
    /*
    Test case: Import/Saving files/https://github.com/epam/Indigo/issues/1982
    Description: Sequences are opened.
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      'IDT',
      `/52MOErA/
       /i2MOErA/
       /52MOErA//i2MOErA/
       /52MOErA/*/i2MOErA/
       /i2MOErA//32MOErA/
       /i2MOErA/*/32MOErA/
      `,
    );
    await takeEditorScreenshot(page);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Open some expected IDT (Part2)', async ({ page }) => {
    /*
    Test case: Import/Saving files/https://github.com/epam/Indigo/issues/1982
    Description: Sequences are opened.
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      'IDT',
      `/32MOErA/
       /52MOErA/*/32MOErC/
       /52MOErA//32MOErC/
       /52MOErA//i2MOErC//32MOErT/ 
       /52MOErA/*/i2MOErC/*/32MOErT/ 
       /52MOErA/*/i2MOErC/*/i2MOErG/*G*+A*mT*A*T*rA*G*/i2MOErG/*/32MOErT/ 
      `,
    );
    await takeEditorScreenshot(page);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test(`Verifiy it is not possible to load IDT data that have ' * ' if it is not between nucleotides or nucleosides and error should occure`, async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files/https://github.com/epam/Indigo/issues/1978
    Description: Error appears
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      'IDT',
      `/52MOErG/*/i2MOErG/*/3Phos/`,
      false,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify it is possible to load IDT data from clipboard having trailing spaces at the end of the IDT string', async ({
    page,
  }) => {
    /*
    Test case: Import/Saving files/https://github.com/epam/Indigo/issues/1979
    Description: Sequences are opened.
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      'IDT',
      `/52MOErA/*/i2MOErC/*/i2MOErG/*G*+A*mT*A*T*rA*G*/i2MOErG/*/32MOErT/ `,
    );
    await takeEditorScreenshot(page);
  });
});
