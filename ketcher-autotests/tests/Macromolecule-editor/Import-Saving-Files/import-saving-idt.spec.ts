import { test, expect, Page, chromium } from '@playwright/test';
import {
  TopPanelButton,
  openFileAndAddToCanvasMacro,
  selectTopPanelButton,
  takeEditorScreenshot,
  waitForPageInit,
  saveToFile,
  openFile,
  receiveFileComparisonData,
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
  selectClearCanvasTool,
  selectSingleBondTool,
  waitForRender,
  takePolymerEditorScreenshot,
  openStructurePasteFromClipboard,
  clickInTheMiddleOfTheScreen,
  selectEraseTool,
  getKet,
  openFileAndAddToCanvasAsNewProject,
  resetZoomLevelToDefault,
} from '@utils';
import { pageReload } from '@utils/common/helpers';
import {
  chooseTab,
  enterSequence,
  Tabs,
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@utils/macromolecules';
import { bondTwoMonomersPointToPoint } from '@utils/macromolecules/polymerBond';
import {
  toggleNucleotidesAccordion,
  togglePhosphatesAccordion,
} from '@utils/macromolecules/rnaBuilder';
import { clickOnSequenceSymbol } from '@utils/macromolecules/sequence';
import {
  markResetToDefaultState,
  processResetToDefaultState,
} from '@utils/testAnnotations/resetToDefaultState';

let page: Page;

async function pasteFromClipboardAndAddToMacromoleculesCanvas(
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

test.beforeAll(async ({ browser }) => {
  let sharedContext;
  try {
    sharedContext = await browser.newContext();
  } catch (error) {
    console.error('Error on creation browser context:', error);
    console.log('Restarting browser...');
    await browser.close();
    browser = await chromium.launch();
    sharedContext = await browser.newContext();
  }

  // Reminder: do not pass page as async paramenter to test
  page = await sharedContext.newPage();
  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);
});

test.afterEach(async ({ context: _ }, testInfo) => {
  await selectClearCanvasTool(page);
  await resetZoomLevelToDefault(page);
  await processResetToDefaultState(testInfo, page);
});

test.afterAll(async ({ browser }) => {
  const cntxt = page.context();
  await page.close();
  await cntxt.close();
  await browser.contexts().forEach((someContext) => {
    someContext.close();
  });
});

test.describe('Import-Saving .idt Files', () => {
  test(`Import .idt file`, async () => {
    await openFileAndAddToCanvasMacro('IDT/idt-a.idt', page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('Check option "IDT" to the format dropdown menu of modal window Paste from the clipboard is exist', async () => {
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

  test('Check option "IDT" to dropdown File format of modal window Save Structure is exist', async () => {
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

  test('Check that in case of peptide monomers are on canvas, error "Peptide monomers are not supported in IDT" appear', async () => {
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

  test('Check import of .ket file and save in .idt format', async () => {
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

  test('Check that empty file can be saved in .idt format', async () => {
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

  test('Check that system does not let importing empty .idt file', async () => {
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('IDT/idt-empty.idt', page);
    await expect(page.getByText('Add to Canvas')).toBeDisabled();
  });

  test('Check IDT aliases, where defined in the preview window for Phosphates section', async () => {
    /*
    Test case: Import/Saving files/#4380
    Description: IDT aliases, where defined in the preview window for Phosphates.
    */
    markResetToDefaultState('tabSelection');

    await chooseTab(page, Tabs.Rna);
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
    test(`Check IDT aliases, where defined in the preview window for RNA Nucleotides monomer ${monomer}`, async () => {
      /*
      Test case: Import/Saving files/#4380
      Description: IDT aliases, where defined in the preview window for RNA monomers in library.
      */
      markResetToDefaultState('tabSelection');

      await chooseTab(page, Tabs.Rna);
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
    test(`Check IDT aliases, where defined in the preview window for RNA monomer ${monomer}`, async () => {
      /*
      Test case: Import/Saving files/#4380
      Description: IDT aliases, where defined in the preview window for RNA monomers in library.
      */
      markResetToDefaultState('tabSelection');

      await chooseTab(page, Tabs.Rna);
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

  test('Should open .ket file and modify to .idt format in save modal textarea', async () => {
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
    test(`Verify import of ${fileName} sequence with modifications from IDT format using Open file (Sequence mode/Flex/Snake) `, async () => {
      /*
    Test case: Import/Saving files/4310
    Description: Structure is opening
    */
      markResetToDefaultState('defaultLayout');

      await openFileAndAddToCanvasMacro(`IDT/${fileName}.idt`, page);
      await takeEditorScreenshot(page);

      await selectSequenceLayoutModeTool(page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);

      await selectSnakeLayoutModeTool(page);
      await moveMouseAway(page);
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
    test(`Verify import of ${fileName} sequence with modifications from IDT format using Paste from Clipboard (Sequence mode/Flex/Snake) `, async () => {
      /*
    Test case: Import/Saving files/4310
    Description: Structure is opening
    */
      markResetToDefaultState('defaultLayout');

      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        'IDT',
        `${fileName}`,
      );

      await takeEditorScreenshot(page);

      await selectSequenceLayoutModeTool(page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);

      await selectSnakeLayoutModeTool(page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    });
  }

  test('Verify error handling for invalid sequences with modifications during import from Paste from Clipboard', async () => {
    /*
    Test case: Import/Saving files/4310
    Description: Error appears
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      'IDT',
      `A*C*G*C*G*C*G*A*C*T*
      A*T*A*C*G*C*G*C*C*T`,
      false,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that sequences with modifications can be edited after import', async () => {
    /*
    Test case: Import/Saving files/4310
    Description: Sequences with modifications can be edited after import
    */
    markResetToDefaultState('defaultLayout');

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      'IDT',
      `A*C*G*C*G*C*G*A*C*T*A*T*A*C*G*C*G*C*C*T`,
    );
    await selectSequenceLayoutModeTool(page);
    await clickOnSequenceSymbol(page, 'G', { button: 'right' });
    await page.getByTestId('edit_sequence').click();
    await enterSequence(page, 'ttt');
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page);
  });

  test('Verify export of sequences with modifications from IDT format using API (getIdt)', async () => {
    /*
    Test case: Import/Saving files/4310
    Description: Sequences are exported by getIdt
    */
    markResetToDefaultState('defaultLayout');

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
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

  test('Verify export of sequences with modifications from IDT format using Save file(Flex mode)', async () => {
    /*
    Test case: Import/Saving files/4310
    Description: IDT appears in save preview
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      'IDT',
      `A*C*G*C*G*C*G*A*C*T*A*T*A*C*G*C*G*C*C*T`,
    );
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'IDT');
    await takeEditorScreenshot(page);
  });

  test('Verify export of sequences with modifications from IDT format using Save file(Sequence mode)', async () => {
    /*
    Test case: Import/Saving files/4310
    Description: IDT appears in save preview
    */
    markResetToDefaultState('defaultLayout');

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      'IDT',
      `+G*+C*+G*C*G*A*C*T*A*T*A*C*G*+C*+G*+C`,
    );
    await selectSequenceLayoutModeTool(page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'IDT');
    await takeEditorScreenshot(page);
  });

  test('Test performance impact of importing large sequences with multiple modifications via Paste from Clipboard', async () => {
    /*
    Test case: Import/Saving files/4310
    Description: Sequences are opened.
    */
    markResetToDefaultState('defaultLayout');

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
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

  test('Verify export of multiple sequences with modifications from IDT format using Save file(Sequence mode)', async () => {
    /*
    Test case: Import/Saving files/4310
    Description: Sequences are appears at save preview window.
    */
    markResetToDefaultState('defaultLayout');

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
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

  test('Verify bonds establishment between monomers from R2 to R1 attachment points', async () => {
    /*
    Test case: Import/Saving files/1899
    Description: Bonds establishment between monomers from R2 to R1 attachment points.
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      'IDT',
      `/52MOErA/*/i2MOErC/*/32MOErT/`,
    );
    const bondLine = page.locator('g[pointer-events="stroke"]').first();
    await selectSingleBondTool(page);
    await bondLine.hover();
    await takeEditorScreenshot(page);
  });

  test('Verify import of sequences with /5Phos/ and /3Phos/ modifications', async () => {
    /*
    Test case: Import/Saving files/1899
    Description: Sequences with /5Phos/ and /3Phos/ modifications imported.
    */
    markResetToDefaultState('defaultLayout');

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      'IDT',
      `/5Phos/ACG/3Phos/`,
    );
    await takeEditorScreenshot(page);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Verify export of known modified monomers with IDT alias and structure', async () => {
    /*
    Test case: Import/Saving files/1900
    Description: Sequences are appears at save preview window.
    */
    markResetToDefaultState('defaultLayout');

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      'IDT',
      `/52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/*G*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErC/*/32MOErT/`,
    );
    await selectSequenceLayoutModeTool(page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'IDT');
    await takeEditorScreenshot(page);
  });

  test(
    'Verify error message when export of nucleotides split to submonomers with no IDT alias',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /*
    Test case: Import/Saving files/1900/1985
    Description: Error message appeared: "This molecule has unsupported monomer and couldn't be exported to IDT notation".
    We have bug https://github.com/epam/Indigo/issues/1985 
    When it fixed we should update snapshot.
    */
      // Reload needed as monomer IDs increment in prior tests, affecting screenshots
      await pageReload(page);

      await openFileAndAddToCanvasMacro('KET/5formD-form5C-cm.ket', page);
      await selectTopPanelButton(TopPanelButton.Save, page);
      await chooseFileFormat(page, 'IDT');
      await takeEditorScreenshot(page);
    },
  );

  test('Verify that if * is specified, Phosphorothioate (sP) is included in nucleotide if not it is (P)', async () => {
    /*
    Test case: Import/Saving files/1900
    Description: If * is specified, Phosphorothioate (sP) is included in nucleotide if not it is (P).
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
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

  test('Open some expected IDT', async () => {
    /*
    Test case: Import/Saving files/https://github.com/epam/Indigo/issues/1982
    Description: Sequences are opened.
    */
    markResetToDefaultState('defaultLayout');

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
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

  test('Open some expected IDT (Part2)', async () => {
    /*
    Test case: Import/Saving files/https://github.com/epam/Indigo/issues/1982
    Description: Sequences are opened.
    */
    markResetToDefaultState('defaultLayout');

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
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

  test(`Verifiy it is not possible to load IDT data that have ' * ' if it is not between nucleotides or nucleosides and error should occure`, async () => {
    /*
    Test case: Import/Saving files/https://github.com/epam/Indigo/issues/1978
    Description: Error appears
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      'IDT',
      `/52MOErG/*/i2MOErG/*/3Phos/`,
      false,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify it is possible to load IDT data from clipboard having trailing spaces at the end of the IDT string', async () => {
    /*
    Test case: Import/Saving files/https://github.com/epam/Indigo/issues/1979
    Description: Sequences are opened.
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      'IDT',
      `/52MOErA/*/i2MOErC/*/i2MOErG/*G*+A*mT*A*T*rA*G*/i2MOErG/*/32MOErT/ `,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate 80 char formating for IDT export', async () => {
    /*
    Test case: Import/Saving files/https://github.com/epam/Indigo/issues/1986
    Description: It is possible save 80 char formating for IDT.
    */
    await openFileAndAddToCanvasMacro(
      'KET/idt-line-longer-than-80-chars.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'IDT');
    await takeEditorScreenshot(page);
  });

  test.fail(
    'Check import of .ket file with unresolved monomers and save in .idt format ',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /*
      Test working not a proper way because we have a bug https://github.com/epam/Indigo/issues/2121
      */
      await openFileAndAddToCanvasMacro('KET/unresolved-monomers.ket', page);
      const expectedFile = await getIdt(page);
      await saveToFile('IDT/unresolved-monomers.idt', expectedFile);

      const METADATA_STRING_INDEX = [1];

      const { fileExpected: idtFileExpected, file: idtFile } =
        await receiveFileComparisonData({
          page,
          expectedFileName: 'tests/test-data/IDT/unresolved-monomers.idt',
          metaDataIndexes: METADATA_STRING_INDEX,
        });

      expect(idtFile).toEqual(idtFileExpected);

      await takeEditorScreenshot(page);
    },
  );

  test('Verify import of unresolved IDT monomers as "black box" in flex/snake modes and ? in sequence', async () => {
    /*
    Test case: Import/Saving files/4431
    Description: Unresolved IDT monomers imported as a "black box" in flex/snake modes and ? in sequence.
    */
    markResetToDefaultState('defaultLayout');

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      'IDT',
      `/52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/*G*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErC/*/32MOErT/`,
    );
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await takeEditorScreenshot(page);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Verify hover preview contains IDT alias only for unresolved IDT monomers', async () => {
    /*
    Test case: Import/Saving files/4431
    Description: Hover preview contains IDT alias only for unresolved IDT monomers.
    */
    markResetToDefaultState('defaultLayout');

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      'IDT',
      `/52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/*G*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErC/*/32MOErT/`,
    );
    await page.getByText('iMe').locator('..').nth(1).hover();
    await takeEditorScreenshot(page);
    await selectSequenceLayoutModeTool(page);
    await page.getByText('?').locator('..').nth(1).hover();
    await takeEditorScreenshot(page);
  });

  test('Check that R1/R2 (backbone) and R3/R4 (sidechain) attachment points are available for unresolved IDT monomers', async () => {
    /*
    Test case: Import/Saving files/4431
    Description: R1/R2 (backbone) and R3/R4 (sidechain) attachment points are available for unresolved IDT monomers.
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      'IDT',
      `/52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/*G*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErC/*/32MOErT/`,
    );
    await selectSingleBondTool(page);
    await page.getByText('iMe').locator('..').nth(1).hover();
    await takeEditorScreenshot(page);
  });

  test('Connect unresolved IDT monomer to known monomers through R2/R1 connections', async () => {
    /*
    Test case: Import/Saving files/4431
    Description: Connect unresolved IDT monomer to known monomers through R2/R1 connections.
    */
    const x = 650;
    const y = 400;
    const firstMonomer = await page.getByText('iMe-dC').locator('..');
    const secondMonomer = await page.getByText('1Nal').locator('..').first();
    await pasteFromClipboardAndAddToMacromoleculesCanvas('IDT', `/iMe-dC/`);
    await page.getByTestId('1Nal___3-(1-naphthyl)-alanine').click();
    await page.mouse.click(x, y);
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      'R2',
      'R1',
    );
    await selectSingleBondTool(page);
    await page.getByText('iMe').locator('..').hover();
    await takeEditorScreenshot(page);
  });

  test('Connect unresolved IDT monomer to known monomers through R3/R4 connections', async () => {
    /*
    Test case: Import/Saving files/4431
    Description: Connect unresolved IDT monomer to known monomers through R3/R4 connections.
    */
    markResetToDefaultState('tabSelection');

    const x = 650;
    const y = 400;
    const firstMonomer = await page.getByText('iMe-dC').locator('..');
    const secondMonomer = await page
      .getByText('Test-6-Ch')
      .locator('..')
      .first();
    await pasteFromClipboardAndAddToMacromoleculesCanvas('IDT', `/iMe-dC/`);
    await chooseTab(page, Tabs.Chem);
    await page.getByTestId('Test-6-Ch___Test-6-AP-Chem').click();
    await page.mouse.click(x, y);
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      'R3',
      'R4',
    );
    await selectSingleBondTool(page);
    await page.getByText('iMe').locator('..').hover();
    await takeEditorScreenshot(page);
  });

  test('Delete bond between unresolved and known monomers connected through R2/R1 and Undo', async () => {
    const x = 650;
    const y = 400;
    const firstMonomer = await page.getByText('iMe-dC').locator('..');
    const secondMonomer = await page.getByText('1Nal').locator('..').first();
    const bondLine = page.locator('g[pointer-events="stroke"]').first();

    await pasteFromClipboardAndAddToMacromoleculesCanvas('IDT', `/iMe-dC/`);
    await page.getByTestId('1Nal___3-(1-naphthyl)-alanine').click();
    await page.mouse.click(x, y);
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      'R2',
      'R1',
    );

    const bondExists = await bondLine.isVisible();

    if (!bondExists) {
      throw new Error('Bond line is not present, likely due to a known bug.');
    }

    await selectEraseTool(page);
    await bondLine.click();
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await takeEditorScreenshot(page);
  });

  test('Delete bond between unresolved and known monomers connected through R3/R4 and Undo', async () => {
    /*
    Test case: Import/Saving files/4431
    Description: Bond deleted and after pressing Undo appears.
    */
    markResetToDefaultState('tabSelection');

    const x = 650;
    const y = 400;
    const firstMonomer = await page.getByText('iMe-dC').locator('..');
    const secondMonomer = await page
      .getByText('Test-6-Ch')
      .locator('..')
      .first();
    const bondLine = page.locator('g[pointer-events="stroke"]').first();
    await pasteFromClipboardAndAddToMacromoleculesCanvas('IDT', `/iMe-dC/`);
    await chooseTab(page, Tabs.Chem);
    await page.getByTestId('Test-6-Ch___Test-6-AP-Chem').click();
    await page.mouse.click(x, y);
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      'R3',
      'R4',
    );
    await selectEraseTool(page);
    await bondLine.click();
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await takeEditorScreenshot(page);
  });

  test('Copy/Paste sequence with unresolved IDT monomers', async () => {
    /*
    Test case: Import/Saving files/4431
    Description: Sequence with unresolved IDT monomers copied/pasted.
    */
    const x = 0;
    const y = 600;
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      'IDT',
      `/52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/`,
    );
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    await page.mouse.move(x, y);
    await page.keyboard.press('Control+v');
    await takeEditorScreenshot(page);
  });

  test('Verify modal window for AP selection when establishing bonds with unresolved monomers(Peptide)', async () => {
    /*
    Test case: Import/Saving files/4431
    Description: Modal window for AP selection should be displayed anytime when user establishes bond with unknown monomer.
    */
    const x = 650;
    const y = 400;
    await pasteFromClipboardAndAddToMacromoleculesCanvas('IDT', `/iMe-dC/`);
    await page.getByTestId('1Nal___3-(1-naphthyl)-alanine').click();
    await page.mouse.click(x, y);
    await selectSingleBondTool(page);
    await page.getByText('1Nal').locator('..').first().click();
    await page.mouse.down();
    await page.getByText('iMe-dC').locator('..').first().hover();
    await page.mouse.up();
    await takeEditorScreenshot(page);
  });

  test('Verify bonds establishment for unresolved IDT monomers in snake mode', async () => {
    /*
    Test case: Import/Saving files/4431
    Description: Connection established.
    */
    markResetToDefaultState('defaultLayout');

    const x = 650;
    const y = 400;
    await pasteFromClipboardAndAddToMacromoleculesCanvas('IDT', `/iMe-dC/`);
    await page.getByTestId('1Nal___3-(1-naphthyl)-alanine').click();
    await page.mouse.click(x, y);
    await selectSnakeLayoutModeTool(page);
    await selectSingleBondTool(page);
    await page.getByText('1Nal').locator('..').first().click();
    await page.mouse.down();
    await page.getByText('iMe-dC').locator('..').first().hover();
    await page.mouse.up();
    await takeEditorScreenshot(page);
  });

  test('Verify modal window for AP selection when establishing bonds with unresolved monomers(CHEM)', async () => {
    /*
    Test case: Import/Saving files/4431
    Description: Modal window for AP selection should be displayed anytime when user establishes bond with unknown monomer.
    */
    markResetToDefaultState('tabSelection');

    const x = 650;
    const y = 400;
    await pasteFromClipboardAndAddToMacromoleculesCanvas('IDT', `/iMe-dC/`);
    await chooseTab(page, Tabs.Chem);
    await page.getByTestId('Test-6-Ch___Test-6-AP-Chem').click();
    await page.mouse.click(x, y);
    await selectSingleBondTool(page);
    await page.getByText('iMe-dC').locator('..').click();
    await page.mouse.down();
    await page.getByText('Test-6-Ch').locator('..').first().hover();
    await page.mouse.up();
    await takeEditorScreenshot(page);
  });

  const testFormats: Array<'FASTA' | 'Sequence'> = ['FASTA', 'Sequence'];

  for (const format of testFormats) {
    test(`Verify error message when saving macromolecules with unresolved monomers to non-IDT/KET format ${format}`, async () => {
      /*
    Test case: Import/Saving files/#4431
    Description: Error message appears when saving macromolecules with unresolved monomers to non-IDT/KET formats.
    */
      // Reload needed as monomer IDs increment in prior tests, affecting screenshots
      await pageReload(page);

      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        'IDT',
        `/52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/`,
      );
      await selectTopPanelButton(TopPanelButton.Save, page);
      await chooseFileFormat(page, format as 'FASTA' | 'Sequence');
      await takeEditorScreenshot(page);
    });
  }

  test('Verify saving of unresolved IDT monomers in KET format', async () => {
    /*
    Test case: #4531
    Description: Unresolved IDT monomers saved in KET format.
    */
    // Reload needed as monomer IDs increment in prior tests, affecting screenshots
    await pageReload(page);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      'IDT',
      `/52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/`,
    );
    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/sequence-with-unresolved-idt-monomers-expected.ket',
      expectedFile,
    );

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/sequence-with-unresolved-idt-monomers-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'KET/sequence-with-unresolved-idt-monomers-expected.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify opening of unresolved IDT monomers saved in KET format in Micro mode', async () => {
    /*
    Test case: #4531
    Description: Unresolved IDT monomers saved in KET format opened in Micro mode.
    */
    markResetToDefaultState('macromoleculesEditor');

    await turnOnMicromoleculesEditor(page);
    await openFileAndAddToCanvasAsNewProject(
      'KET/sequence-with-unresolved-idt-monomers-micro-mode-expected.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify display of unresolved IDT monomers when switching from Macro mode to Micro mode', async () => {
    /*
    Test case: #4531
    Description: Unresolved IDT monomers are displayed as abbreviation.
    */
    markResetToDefaultState('macromoleculesEditor');

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      'IDT',
      `/52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/`,
    );
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);
  });

  test('Verify saving of unresolved IDT monomers in IDT format', async () => {
    /*
    Test case: Import/Saving files/4431
    Description: Unresolved IDT monomers saved and opened in IDT format
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      'IDT',
      `/52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/`,
    );
    const expectedFile = await getIdt(page);
    await saveToFile(
      'IDT/idt-with-unresolved-monomer-expected.idt',
      expectedFile,
    );

    const { fileExpected: idtFileExpected, file: idtFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/IDT/idt-with-unresolved-monomer-expected.idt',
      });

    expect(idtFile).toEqual(idtFileExpected);
    await openFileAndAddToCanvasAsNewProject(
      'IDT/idt-with-unresolved-monomer-expected.idt',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify deletion of unresolved IDT monomers from canvas', async () => {
    /*
    Test case: Import/Saving files/4431
    Description: Unresolved IDT monomers deleted from canvas.
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas('IDT', `/iMe-dC/`);
    await takeEditorScreenshot(page);
    await selectEraseTool(page);
    await page.getByText('iMe-dC').locator('..').click();
    await takeEditorScreenshot(page);
  });
});

interface IDTString {
  helmDescription: string;
  HELMString: string;
  shouldFail?: boolean;
  issueNumber?: string;
  pageReloadNeeded?: boolean;
}
