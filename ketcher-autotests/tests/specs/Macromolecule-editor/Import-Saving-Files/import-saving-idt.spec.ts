/* eslint-disable no-magic-numbers */
import { Chem } from '@constants/monomers/Chem';
import { Nucleotides } from '@constants/monomers/Nucleotides';
import { Peptides } from '@constants/monomers/Peptides';
import { Phosphates } from '@constants/monomers/Phosphates';
import { Presets } from '@constants/monomers/Presets';
import { chromium, expect, Page, test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  clickOnCanvas,
  copyToClipboardByKeyboard,
  MacroFileType,
  moveMouseAway,
  openFile,
  openFileAndAddToCanvasAsNewProject,
  openFileAndAddToCanvasAsNewProjectMacro,
  openFileAndAddToCanvasMacro,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  pasteFromClipboardByKeyboard,
  resetZoomLevelToDefault,
  selectAllStructuresOnCanvas,
  selectSequenceLayoutModeTool,
  selectSnakeLayoutModeTool,
  takeEditorScreenshot,
  takePolymerEditorScreenshot,
  waitForPageInit,
} from '@utils';

import {
  closeErrorMessage,
  closeOpenStructure,
  pageReload,
} from '@utils/common/helpers';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import {
  waitForMonomerPreview,
  zoomWithMouseWheel,
} from '@utils/macromolecules';
import {
  getMonomerLocator,
  getSymbolLocator,
} from '@utils/macromolecules/monomer';
import { bondTwoMonomersPointToPoint } from '@utils/macromolecules/polymerBond';
import {
  markResetToDefaultState,
  processResetToDefaultState,
} from '@utils/testAnnotations/resetToDefaultState';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import {
  keyboardPressOnCanvas,
  keyboardTypeOnCanvas,
} from '@utils/keyboard/index';
import { PasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import {
  MacromoleculesFileFormatName,
  MacromoleculesFileFormatType,
} from '@tests/pages/constants/fileFormats/macroFileFormats';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { OpenStructureDialog } from '@tests/pages/common/OpenStructureDialog';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { RNASection } from '@tests/pages/constants/library/Constants';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { SequenceSymbolOption } from '@tests/pages/constants/contextMenu/Constants';

let page: Page;

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
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await Library(page).switchToPeptidesTab();
});

test.afterEach(async ({ context: _ }, testInfo) => {
  await CommonTopLeftToolbar(page).clearCanvas();
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
    await openFileAndAddToCanvasMacro(page, 'IDT/idt-a.idt', MacroFileType.IDT);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Check option "IDT" to the format dropdown menu of modal window Paste from the clipboard is exist', async () => {
    /*
    Test case: Import/Saving files/#4495
    Description: Option "IDT" to the format dropdown menu of modal window Paste from the clipboard is exist.
    */
    const contentTypeSelector =
      PasteFromClipboardDialog(page).contentTypeSelector;

    await CommonTopLeftToolbar(page).openFile();
    await OpenStructureDialog(page).pasteFromClipboard();
    await contentTypeSelector.click();

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
    const fileFormatDropdonwList =
      SaveStructureDialog(page).fileFormatDropdownList;

    await CommonTopLeftToolbar(page).saveFile();
    await fileFormatDropdonwList.click();

    const options = page.getByRole('option');
    const values = await options.allTextContents();

    const expectedValues = [
      MacromoleculesFileFormatName.Ket,
      MacromoleculesFileFormatName.MDLMolfileV3000,
      MacromoleculesFileFormatName.Sequence1LetterCode,
      MacromoleculesFileFormatName.Sequence3LetterCode,
      MacromoleculesFileFormatName.FASTA,
      MacromoleculesFileFormatName.IDT,
      MacromoleculesFileFormatName.SVGDocument,
      MacromoleculesFileFormatName.HELM,
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
    await Library(page).selectMonomer(Peptides._1Nal);
    await clickInTheMiddleOfTheScreen(page);
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.IDT,
    );
    await takeEditorScreenshot(page);
  });

  test('Check import of .ket file and save in .idt format', async () => {
    await openFileAndAddToCanvasMacro(page, 'KET/rna-a.ket');
    await verifyFileExport(page, 'IDT/idt-rna-a.idt', FileType.IDT);
    await openFileAndAddToCanvasAsNewProject(page, 'IDT/idt-rna-a.idt');
    await takeEditorScreenshot(page);
  });

  test('Check that empty file can be saved in .idt format', async () => {
    await verifyFileExport(page, 'IDT/idt-empty.idt', FileType.IDT);
  });

  test('Check that system does not let importing empty .idt file', async () => {
    const addToCanvasButton = PasteFromClipboardDialog(page).addToCanvasButton;

    await CommonTopLeftToolbar(page).openFile();
    await openFile(page, 'IDT/idt-empty.idt');
    await expect(addToCanvasButton).toBeDisabled();
    await PasteFromClipboardDialog(page).closeWindowButton.click();
  });

  test('Check IDT aliases, where defined in the preview window for Phosphates section', async () => {
    /*
    Test case: Import/Saving files/#4380
    Description: IDT aliases, where defined in the preview window for Phosphates.
    */
    markResetToDefaultState('tabSelection');

    await Library(page).switchToRNATab();
    await Library(page).openRNASection(RNASection.Phosphates);
    await Library(page).hoverMonomer(Phosphates.P);
    await waitForMonomerPreview(page);
    await takePolymerEditorScreenshot(page);
  });

  const rnaNucleotides = [
    Nucleotides._2_damdA,
    Nucleotides._5hMedC,
    Nucleotides.Super_G,
    Nucleotides.AmMC6T,
    Nucleotides.Super_T,
    Nucleotides._5Br_dU,
    Nucleotides._5NitInd,
  ];

  for (const monomer of rnaNucleotides) {
    test(`Check IDT aliases, where defined in the preview window for RNA Nucleotides monomer ${monomer.testId}`, async () => {
      /*
      Test case: Import/Saving files/#4380
      Description: IDT aliases, where defined in the preview window for RNA monomers in library.
      */
      markResetToDefaultState('tabSelection');

      await Library(page).switchToRNATab();
      await Library(page).openRNASection(RNASection.Nucleotides);
      await Library(page).hoverMonomer(monomer);
      await waitForMonomerPreview(page);
      await takePolymerEditorScreenshot(page);
    });
  }

  const rnaMonomers = [
    Presets.MOE_A_P,
    Presets.MOE_G_P,
    Presets.MOE_5meC_P,
    Presets.MOE_T_P,
    Presets.dR_U_P,
  ];

  for (const monomer of rnaMonomers) {
    test(`Check IDT aliases, where defined in the preview window for RNA monomer ${monomer.testId}`, async () => {
      /*
      Test case: Import/Saving files/#4380
      Description: IDT aliases, where defined in the preview window for RNA monomers in library.
      */
      markResetToDefaultState('tabSelection');

      await Library(page).switchToRNATab();
      await Library(page).hoverMonomer(monomer);
      await waitForMonomerPreview(page);
      await takePolymerEditorScreenshot(page);
    });
  }

  // Fail while performance issue on Indigo side
  // test('Check that system does not let uploading corrupted .idt file', async ({
  //   page,
  // }) => {
  //   await CommonTopLeftToolbar(page).openFile();
  //
  //   const filename = 'IDT/idt-corrupted.idt';
  //   await openFile(page, filename);
  //   await selectOptionInDropdown(filename, page);
  //   await pressButton(page, 'Add to Canvas');
  //   await takeEditorScreenshot(page);
  // });

  test('Should open .ket file and modify to .idt format in save modal textarea', async () => {
    await openFileAndAddToCanvasMacro(page, 'KET/rna-a.ket');
    await verifyFileExport(page, 'IDT/idt-rna-a.idt', FileType.IDT);
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

      await openFileAndAddToCanvasMacro(
        page,
        `IDT/${fileName}.idt`,
        MacroFileType.IDT,
      );
      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });

      await selectSequenceLayoutModeTool(page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });

      await selectSnakeLayoutModeTool(page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });
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
        page,
        MacroFileType.IDT,
        `${fileName}`,
      );

      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });

      await selectSequenceLayoutModeTool(page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });

      await selectSnakeLayoutModeTool(page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });
    });
  }

  test('Verify error handling for invalid sequences with modifications during import from Paste from Clipboard', async () => {
    /*
    Test case: Import/Saving files/4310
    Description: Error appears
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.IDT,
      `A*C*G*C*G*C*G*A*C*T*
      A*T*A*C*G*C*G*C*C*T`,
      true,
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
      page,
      MacroFileType.IDT,
      `A*C*G*C*G*C*G*A*C*T*A*T*A*C*G*C*G*C*C*T`,
    );
    await selectSequenceLayoutModeTool(page);
    const symbolG = getSymbolLocator(page, {
      symbolAlias: 'G',
      nodeIndexOverall: 2,
    });
    await ContextMenu(page, symbolG).click(SequenceSymbolOption.EditSequence);
    await keyboardTypeOnCanvas(page, 'ttt');
    await keyboardPressOnCanvas(page, 'Escape');
    await takeEditorScreenshot(page);
  });

  test('Verify export of sequences with modifications from IDT format using API (getIdt)', async () => {
    /*
    Test case: Import/Saving files/4310
    Description: Sequences are exported by getIdt
    */
    markResetToDefaultState('defaultLayout');

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.IDT,
      `A*C*G*C*G*C*G*A*C*T*A*T*A*C*G*C*G*C*C*T`,
    );
    await selectSequenceLayoutModeTool(page);
    await verifyFileExport(page, 'IDT/idt-expected.idt', FileType.IDT);
    await openFileAndAddToCanvasAsNewProject(page, 'IDT/idt-expected.idt');
    await takeEditorScreenshot(page);
  });

  test('Verify export of sequences with modifications from IDT format using Save file(Flex mode)', async () => {
    /*
    Test case: Import/Saving files/4310
    Description: IDT appears in save preview
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.IDT,
      `A*C*G*C*G*C*G*A*C*T*A*T*A*C*G*C*G*C*C*T`,
    );
    await verifyFileExport(
      page,
      'IDT/sequences-with-modifications-1.idt',
      FileType.IDT,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'IDT/sequences-with-modifications-1.idt',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify export of sequences with modifications from IDT format using Save file(Sequence mode)', async () => {
    /*
    Test case: Import/Saving files/4310
    Description: IDT appears in save preview
    */
    markResetToDefaultState('defaultLayout');

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.IDT,
      `+G*+C*+G*C*G*A*C*T*A*T*A*C*G*+C*+G*+C`,
    );
    await selectSequenceLayoutModeTool(page);
    await verifyFileExport(
      page,
      'IDT/sequences-with-modifications-2.idt',
      FileType.IDT,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'IDT/sequences-with-modifications-2.idt',
    );
    await takeEditorScreenshot(page);
  });

  test('Test performance impact of importing large sequences with multiple modifications via Paste from Clipboard', async () => {
    /*
    Test case: Import/Saving files/4310
    Description: Sequences are opened.
    */
    markResetToDefaultState('defaultLayout');

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.IDT,
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
      page,
      MacroFileType.IDT,
      `A*C*G*C*G*C*G*A*C*T*A*T*A*C*G*C*G*C*C*T
      
      /52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*C*G*A*C*T*A*T*A*C*G*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErC/*/32MOErT/

      +G*+C*+G*C*G*A*C*T*A*T*A*C*G*+C*+G*+C

      mA*mC*mG*mC*mG*C*G*A*C*T*A*T*A*C*G*mC*mG*mC*mC*mU

      /52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/*G*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErC/*/32MOErT/
      `,
    );
    await selectSequenceLayoutModeTool(page);
    await verifyFileExport(
      page,
      'IDT/sequences-with-modifications-3.idt',
      FileType.IDT,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'IDT/sequences-with-modifications-3.idt',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify bonds establishment between monomers from R2 to R1 attachment points', async () => {
    /*
    Test case: Import/Saving files/1899
    Description: Bonds establishment between monomers from R2 to R1 attachment points.
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.IDT,
      `/52MOErA/*/i2MOErC/*/32MOErT/`,
    );
    const bondLine = page.locator('g[pointer-events="stroke"]').first();
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await bondLine.hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Verify import of sequences with /5Phos/ and /3Phos/ modifications', async () => {
    /*
    Test case: Import/Saving files/1899
    Description: Sequences with /5Phos/ and /3Phos/ modifications imported.
    */
    markResetToDefaultState('defaultLayout');

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.IDT,
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
      page,
      MacroFileType.IDT,
      `/52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/*G*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErC/*/32MOErT/`,
    );
    await selectSequenceLayoutModeTool(page);
    await verifyFileExport(
      page,
      'IDT/sequences-with-modifications-4.idt',
      FileType.IDT,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'IDT/sequences-with-modifications-4.idt',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify error message when export of nucleotides split to submonomers with no IDT alias', async () => {
    /*
    Test case: Import/Saving files/1900/1985
    Description: Error message appeared: "This molecule has unsupported monomer and couldn't be exported to IDT notation".
    */
    // Reload needed as monomer IDs increment in prior tests, affecting screenshots
    await openFileAndAddToCanvasMacro(page, 'KET/5formD-form5C-cm.ket');
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.IDT,
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Verify that if * is specified, Phosphorothioate (sP) is included in nucleotide if not it is (P)', async () => {
    /*
    Test case: Import/Saving files/1900
    Description: If * is specified, Phosphorothioate (sP) is included in nucleotide if not it is (P).
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.IDT,
      `/52MOErA/*/i2MOErC/*/32MOErT/
      
      /5Phos/ACG/3Phos/
      `,
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'IDT/sequences-with-modifications-5.idt',
      FileType.IDT,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'IDT/sequences-with-modifications-5.idt',
    );
    await takeEditorScreenshot(page);
  });

  test('Open some expected IDT', async () => {
    /*
    Test case: Import/Saving files/https://github.com/epam/Indigo/issues/1982
    Description: Sequences are opened.
    */
    markResetToDefaultState('defaultLayout');

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.IDT,
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
      page,
      MacroFileType.IDT,
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
      page,
      MacroFileType.IDT,
      `/52MOErG/*/i2MOErG/*/3Phos/`,
      true,
    );
    await takeEditorScreenshot(page);
  });

  test('Verify it is possible to load IDT data from clipboard having trailing spaces at the end of the IDT string', async () => {
    /*
    Test case: Import/Saving files/https://github.com/epam/Indigo/issues/1979
    Description: Sequences are opened.
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.IDT,
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
      page,
      'KET/idt-line-longer-than-80-chars.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'IDT/idt-line-longer-than-80-chars-expected.idt',
      FileType.IDT,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'IDT/idt-line-longer-than-80-chars-expected.idt',
    );
    await takeEditorScreenshot(page);
  });

  test('Check import of .ket file with unresolved monomers and save in .idt format ', async () => {
    await openFileAndAddToCanvasMacro(page, 'KET/unresolved-monomers.ket');
    await verifyFileExport(page, 'IDT/unresolved-monomers.idt', FileType.IDT);
    await openFileAndAddToCanvasAsNewProject(
      page,
      'IDT/unresolved-monomers.idt',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify import of unresolved IDT monomers as "black box" in flex/snake modes and ? in sequence', async () => {
    /*
    Test case: Import/Saving files/4431
    Description: Unresolved IDT monomers imported as a "black box" in flex/snake modes and ? in sequence.
    */
    markResetToDefaultState('defaultLayout');

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.IDT,
      `/52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/*G*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErC/*/32MOErT/`,
    );
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
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
      page,
      MacroFileType.IDT,
      `/52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/*G*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErC/*/32MOErT/`,
    );
    await getMonomerLocator(page, Chem.iMe_dC).nth(1).hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
    await selectSequenceLayoutModeTool(page);
    await getSymbolLocator(page, { symbolAlias: '?' }).nth(1).hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Check that R1/R2 (backbone) and R3/R4 (sidechain) attachment points are available for unresolved IDT monomers', async () => {
    /*
    Test case: Import/Saving files/4431
    Description: R1/R2 (backbone) and R3/R4 (sidechain) attachment points are available for unresolved IDT monomers.
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.IDT,
      `/52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/*G*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErC/*/32MOErT/`,
    );
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await getMonomerLocator(page, Chem.iMe_dC).nth(1).hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Connect unresolved IDT monomer to known monomers through R2/R1 connections', async () => {
    /*
    Test case: Import/Saving files/4431
    Description: Connect unresolved IDT monomer to known monomers through R2/R1 connections.
    */
    await Library(page).switchToPeptidesTab();
    const x = 650;
    const y = 400;
    const firstMonomer = getMonomerLocator(page, Chem.iMe_dC);
    const secondMonomer = getMonomerLocator(page, Peptides._1Nal);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.IDT,
      `/iMe-dC/`,
    );
    await Library(page).selectMonomer(Peptides._1Nal);
    await clickOnCanvas(page, x, y);
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      'R2',
      'R1',
    );
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await getMonomerLocator(page, Chem.iMe_dC).hover();
    await waitForMonomerPreview(page);
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
    const firstMonomer = getMonomerLocator(page, Chem.iMe_dC);
    const secondMonomer = getMonomerLocator(page, Chem.Test_6_Ch);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.IDT,
      `/iMe-dC/`,
    );
    await Library(page).selectMonomer(Chem.Test_6_Ch);
    await clickOnCanvas(page, x, y);
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      'R3',
      'R4',
    );
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await getMonomerLocator(page, Chem.iMe_dC).hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Delete bond between unresolved and known monomers connected through R2/R1 and Undo', async () => {
    const x = 650;
    const y = 400;
    const firstMonomer = getMonomerLocator(page, Chem.iMe_dC);
    const secondMonomer = getMonomerLocator(page, Peptides._1Nal);
    const bondLine = page.locator('g[pointer-events="stroke"]').first();

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.IDT,
      `/iMe-dC/`,
    );
    await Library(page).selectMonomer(Peptides._1Nal);
    await clickOnCanvas(page, x, y);
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

    await CommonLeftToolbar(page).selectEraseTool();
    await bondLine.click();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
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
    const firstMonomer = getMonomerLocator(page, Chem.iMe_dC);
    const secondMonomer = getMonomerLocator(page, Chem.Test_6_Ch);
    const bondLine = page.locator('g[pointer-events="stroke"]').first();
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.IDT,
      `/iMe-dC/`,
    );
    await Library(page).selectMonomer(Chem.Test_6_Ch);
    await clickOnCanvas(page, x, y);
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      'R3',
      'R4',
    );
    await CommonLeftToolbar(page).selectEraseTool();
    await bondLine.click();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
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
      page,
      MacroFileType.IDT,
      `/52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/`,
    );
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await page.mouse.move(x, y);
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Verify modal window for AP selection when establishing bonds with unresolved monomers(Peptide)', async () => {
    /*
    Test case: Import/Saving files/4431
    Description: Modal window for AP selection should be displayed anytime when user establishes bond with unknown monomer.
    */
    const x = 650;
    const y = 400;
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.IDT,
      `/iMe-dC/`,
    );
    await Library(page).selectMonomer(Peptides._1Nal);
    await clickOnCanvas(page, x, y);
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await getMonomerLocator(page, Peptides._1Nal).click();
    await page.mouse.down();
    await getMonomerLocator(page, Chem.iMe_dC).hover();
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
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.IDT,
      `/iMe-dC/`,
    );
    await Library(page).selectMonomer(Peptides._1Nal);
    await clickOnCanvas(page, x, y);
    await selectSnakeLayoutModeTool(page);
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await getMonomerLocator(page, Peptides._1Nal).click();
    await page.mouse.down();
    await getMonomerLocator(page, Chem.iMe_dC).hover();
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
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.IDT,
      `/iMe-dC/`,
    );
    await Library(page).selectMonomer(Chem.Test_6_Ch);
    await clickOnCanvas(page, x, y);
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await getMonomerLocator(page, Chem.iMe_dC).click();
    await page.mouse.down();
    await getMonomerLocator(page, Chem.Test_6_Ch).hover();
    await page.mouse.up();
    await takeEditorScreenshot(page);
  });

  const testFormats = [
    {
      name: MacromoleculesFileFormatName.FASTA,
      testId: MacromoleculesFileFormatType.FASTA,
    },
    {
      name: MacromoleculesFileFormatName.Sequence1LetterCode,
      testId: MacromoleculesFileFormatType.Sequence1LetterCode,
    },
  ];

  for (const format of testFormats) {
    test(`Verify error message when saving macromolecules with unresolved monomers to non-IDT/KET format ${format.name}`, async () => {
      /*
    Test case: Import/Saving files/#4431
    Description: Error message appears when saving macromolecules with unresolved monomers to non-IDT/KET formats.
    */
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.IDT,
        `/52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/`,
      );
      await CommonTopLeftToolbar(page).saveFile();
      await SaveStructureDialog(page).chooseFileFormat(format.testId);
      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });
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
      page,
      MacroFileType.IDT,
      `/52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/`,
    );

    await verifyFileExport(
      page,
      'KET/sequence-with-unresolved-idt-monomers-expected.ket',
      FileType.KET,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/sequence-with-unresolved-idt-monomers-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify opening of unresolved IDT monomers saved in KET format in Micro mode', async () => {
    /*
    Test case: #4531
    Description: Unresolved IDT monomers saved in KET format opened in Micro mode.
    */
    markResetToDefaultState('macromoleculesEditor');

    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/sequence-with-unresolved-idt-monomers-micro-mode-expected.ket',
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
      page,
      MacroFileType.IDT,
      `/52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/`,
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
  });

  test('Verify saving of unresolved IDT monomers in IDT format', async () => {
    /*
    Test case: Import/Saving files/4431
    Description: Unresolved IDT monomers saved and opened in IDT format
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.IDT,
      `/52MOErA/*/i2MOErC/*/i2MOErG/*/i2MOErC/*/i2MOErG/*/iMe-dC/*G*A*/iMe-dC/*T*A*T*A*/iMe-dC/`,
    );
    await verifyFileExport(
      page,
      'IDT/idt-with-unresolved-monomer-expected.idt',
      FileType.IDT,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'IDT/idt-with-unresolved-monomer-expected.idt',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify deletion of unresolved IDT monomers from canvas', async () => {
    /*
    Test case: Import/Saving files/4431
    Description: Unresolved IDT monomers deleted from canvas.
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.IDT,
      `/iMe-dC/`,
    );
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await getMonomerLocator(page, Chem.iMe_dC).click();
    await takeEditorScreenshot(page);
  });
});

interface IIDTString {
  idtDescription: string;
  IDTString: string;
  // Set shouldFail to true if you expect test to work wrong because of existed bug and put issues link to issueNumber
  shouldFail?: boolean;
  // issueNumber is mandatory if shouldFail === true
  issueNumber?: string;
  // set pageReloadNeeded to true if you need to restart ketcher before test (f.ex. to restart font renderer)
  pageReloadNeeded?: boolean;
}

const correctIDTStrings: IIDTString[] = [
  {
    idtDescription:
      '1. DNA with standard mixed base (R) designated using a capital IUB (International Union of Biochemistry) code',
    IDTString: '(R:66003400)',
  },
  {
    idtDescription:
      '2. DNA with standard mixed base (Y) designated using a capital IUB (International Union of Biochemistry) code',
    IDTString: '(Y:00670033)',
  },
  {
    idtDescription:
      '3. DNA with standard mixed base (M) designated using a capital IUB (International Union of Biochemistry) code',
    IDTString: '(M:68320000)',
  },
  {
    idtDescription:
      '4. DNA with standard mixed base (K) designated using a capital IUB (International Union of Biochemistry) code',
    IDTString: '(K:00006931)',
  },
  {
    idtDescription:
      '5. DNA with standard mixed base (S) designated using a capital IUB (International Union of Biochemistry) code',
    IDTString: '(S:00703000)',
  },
  {
    idtDescription:
      '6. DNA with standard mixed base (W) designated using a capital IUB (International Union of Biochemistry) code',
    IDTString: '(W:71000029)',
  },
  {
    idtDescription:
      '7. DNA with standard mixed base (H) designated using a capital IUB (International Union of Biochemistry) code',
    IDTString: '(H:35340031)',
  },
  {
    idtDescription:
      '8. DNA with standard mixed base (B) designated using a capital IUB (International Union of Biochemistry) code',
    IDTString: '(B:00363529)',
  },
  {
    idtDescription:
      '9. DNA with standard mixed base (V) designated using a capital IUB (International Union of Biochemistry) code',
    IDTString: '(V:37362700)',
  },
  {
    idtDescription:
      '10. DNA with standard mixed base (D) designated using a capital IUB (International Union of Biochemistry) code',
    IDTString: '(D:38003725)',
  },
  {
    idtDescription:
      '11. DNA with standard mixed base (N) designated using a capital IUB (International Union of Biochemistry) code',
    IDTString: '(N:10203040)',
  },
  {
    idtDescription:
      '12. The first instance of the custom mixed base must name and define the ratio, all subsequent identical insertions only need to include the name',
    IDTString: '(N:40302010)A(N)',
  },
  {
    idtDescription:
      '13. DNAs with standard mixed base are designated using a (Ni:XXYYZZQQ) way',
    IDTString: '(B4:00653005)',
  },
  {
    idtDescription:
      '14. DNAs with same mixed bases defined 4 different times using index',
    IDTString:
      '(B:00453025)(B1:00503020)(B2:00553015)(B3:00603010)(B4:00653005)',
  },
  {
    idtDescription:
      '15. DNAs with same mixed bases defined 4 different times using index and later inserted',
    IDTString:
      '(B:00453025)(B1:00503020)(B2:00553015)(B3:00603010)(B4:00653005)(B)(B1)(B2)(B3)(B4)',
  },
  {
    idtDescription:
      '16. DNAs with same mixed bases defined 4 different times using index and later inserted (reverse order)',
    IDTString:
      '(B4:00653005)(B1:00503020)(B3:00603010)(B2:00553015)(B:00453025)(B)(B1)(B2)(B3)(B4)',
  },
  {
    idtDescription:
      '17. Mix of DNAs with standard mixed bases are designated using a (Ni:XXYYZZQQ) way',
    IDTString: '(M:55450000)(B:00453025)(N:40302010)',
  },
  {
    idtDescription: '18. RNA with mixed base of two components',
    IDTString: 'r(Y:00670033)',
  },
  {
    idtDescription: '19. RNA with mixed base of three components',
    IDTString: 'r(B:00453025)',
  },
  {
    idtDescription: '20. RNA with mixed base of four components',
    IDTString: 'r(N:40302010)',
  },
  {
    idtDescription:
      '21. RNA with mixed base of two components and later insertion as DNA',
    IDTString: 'r(N:40302010)A(N)',
  },
  {
    idtDescription:
      '22. RNAs with mixed base of three components and later insertion as RNA',
    IDTString: 'r(N:40302010)Ar(N)',
  },
  {
    idtDescription:
      '23. DNA with mixed base of four components and later insertion as RNA',
    IDTString: '(N:40302010)Ar(N)',
  },
  {
    idtDescription:
      '24. RNAs with standard mixed base are designated using a (Ni:XXYYZZQQ) way',
    IDTString: 'r(B4:00653005)',
  },
  {
    idtDescription:
      '25. RNAs with same mixed bases defined 4 different times using index',
    IDTString:
      'r(B:00453025)r(B1:00503020)r(B2:00553015)r(B3:00603010)r(B4:00653005)',
  },
  {
    idtDescription:
      '26. RNA with same mixed bases defined 4 different times using index and later inserted',
    IDTString:
      'r(B:00453025)r(B1:00503020)r(B2:00553015)r(B3:00603010)r(B4:00653005)r(B)r(B1)r(B2)r(B3)r(B4)',
  },
  {
    idtDescription:
      '28. Mix of RNAs with standard mixed bases are designated using a (Ni:XXYYZZQQ) way',
    IDTString: 'r(M:55450000)r(B:00453025)r(N:40302010)',
  },
  {
    idtDescription: '29. LRNA with mixed base of two components',
    IDTString: '+(Y:00670033)',
  },
  {
    idtDescription: '30. LRNA with mixed base of three components',
    IDTString: '+(B:00453025)',
  },
  {
    idtDescription: '31. LRNA with mixed base of four components',
    IDTString: '+(N:40302010)',
  },
  {
    idtDescription:
      '32. LRNA with mixed base of two components and later insertion',
    IDTString: '+(N:40302010)A(N)',
  },
  {
    idtDescription:
      '33. LRNA with mixed base of three components and later insertion as LRNA',
    IDTString: '+(N:40302010)A+(N)',
  },
  {
    idtDescription:
      '34. RNAs with mixed base of four components and later insertion as LRNA',
    IDTString: '(N:40302010)A+(N)',
  },
  {
    idtDescription:
      '35. LRNAs with standard mixed base are designated using a (Ni:XXYYZZQQ) way',
    IDTString: '+(B4:00653005)',
  },
  {
    idtDescription:
      '36. LRNAs with same mixed bases defined 4 different times using index',
    IDTString:
      '+(B:00453025)+(B1:00503020)+(B2:00553015)+(B3:00603010)+(B4:00653005)',
  },
  {
    idtDescription:
      '37. LRNA with same mixed bases defined 4 different times using index and later inserted',
    IDTString:
      '+(B:00453025)+(B1:00503020)+(B2:00553015)+(B3:00603010)+(B4:00653005)+(B)+(B1)+(B2)+(B3)+(B4)',
  },
  {
    idtDescription:
      '38. DNA with same mixed bases defined 4 different times using index and later inserted as LRNA',
    IDTString:
      '(B4:00653005)(B3:00603010)(B2:00553015)(B1:00503020)(B:00453025)+(B)+(B1)+(B2)+(B3)+(B4)',
  },
  {
    idtDescription:
      '39. Mix of LRNAs with standard mixed bases are designated using a (Ni:XXYYZZQQ) way',
    IDTString: '+(M:55450000)+(B:00453025)+(N:40302010)',
  },
  {
    idtDescription: '40. mRNA with mixed base of two components',
    IDTString: 'm(Y:00670033)',
  },
  {
    idtDescription: '41. mRNA with mixed base of three components',
    IDTString: 'm(B:00453025)',
  },
  {
    idtDescription: '42. mRNA with mixed base of four components',
    IDTString: 'm(N:40302010)',
  },
  {
    idtDescription:
      '43. mRNA with mixed base of two components and later insertion',
    IDTString: 'm(N:40302010)A(N)',
  },
  {
    idtDescription:
      '44. mRNAs with mixed base of three components and later insertion as mRNA',
    IDTString: 'm(N:40302010)Am(N)',
  },
  {
    idtDescription:
      '45. RNAs with mixed base of four components and later insertion as mRNA',
    IDTString: '(N:40302010)Am(N)',
  },
  {
    idtDescription:
      '46. mRNAs with standard mixed base are designated using a (Ni:XXYYZZQQ) way',
    IDTString: 'm(B4:00653005)',
  },
  {
    idtDescription:
      '47. mRNAs with same mixed bases defined 4 different times using index',
    IDTString:
      'm(B:00453025)m(B1:00503020)m(B2:00553015)m(B3:00603010)m(B4:00653005)',
  },
  {
    idtDescription:
      '48. mRNA with same mixed bases defined 4 different times using index and later inserted',
    IDTString:
      'm(B:00453025)m(B1:00503020)m(B2:00553015)m(B3:00603010)m(B4:00653005)m(B)m(B1)m(B2)m(B3)m(B4)',
  },
  {
    idtDescription:
      '49. DNA with same mixed bases defined 4 different times using index and later inserted as mRNA',
    IDTString:
      '(B4:00653005)(B3:00603010)(B2:00553015)(B1:00503020)(B:00453025)m(B)m(B1)m(B2)m(B3)m(B4)',
  },
  {
    idtDescription:
      '50. Mix of mRNAs with standard mixed bases are designated using a (Ni:XXYYZZQQ) way',
    IDTString: 'm(M:55450000)m(B:00453025)m(N:40302010)',
  },
  {
    idtDescription: '51. DNA of three mixed bases later inserted as DNA',
    IDTString: '(B1:00503020)(B1)',
  },
  {
    idtDescription: '53. LRNA of three mixed bases later inserted as DNA',
    IDTString: '+(B1:00503020)(B1)',
  },
  {
    idtDescription: '54. mRNA of three mixed bases later inserted as DNA',
    IDTString: 'm(B1:00503020)(B1)',
  },
  {
    idtDescription: '55. RNA of three mixed bases later inserted as RNA',
    IDTString: 'r(B1:00503020)r(B1)',
  },
  {
    idtDescription: '58. LRNA of three mixed bases later inserted as DNA',
    IDTString: '+(B1:00503020)(B1)',
  },
  {
    idtDescription: '59. LRNA of three mixed bases later inserted as LRNA',
    IDTString: '+(B1:00503020)+(B1)',
  },
  {
    idtDescription: '60. mRNA of three mixed bases later inserted as LRNA',
    IDTString: 'm(B1:00503020)+(B1)',
  },
  {
    idtDescription: '63. mRNA of three mixed bases later inserted as DNA',
    IDTString: 'm(B1:00503020)(B1)',
  },
  {
    idtDescription: '64. Ambiguous monomers from the library - Common bases',
    IDTString: 'rMrRrSrV/3Phos/\nMRSV/3Phos/',
  },
  {
    idtDescription: '65. Ambiguous monomers from the library - DNA bases',
    IDTString: 'NBDHKWY/3Phos/',
  },
  {
    idtDescription: '66. Ambiguous monomers from the library - RNA bases',
    IDTString: 'rNrBrDrHrKrWrY/3Phos/',
  },
];

test.describe('Import correct IDT sequence: ', () => {
  for (const correctIDTString of correctIDTStrings) {
    test(`${correctIDTString.idtDescription}`, async () => {
      /* 
    Test case: https://github.com/epam/ketcher/issues/5505
    Description: Load correct IDT sequences and compare canvas with the template
    Case:
        1. Load correct HELM via paste from clipboard way
        2. Take screenshot of the canvas to compare it with example
    */
      test.setTimeout(20000);

      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.IDT,
        correctIDTString.IDTString,
      );
      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });

      // Test should be skipped if related bug exists
      test.fixme(
        correctIDTString.shouldFail === true,
        `That test fails because of ${correctIDTString.issueNumber} issue.`,
      );
    });
  }
});

const incorrectIDTStrings: IIDTString[] = [
  {
    idtDescription: '1. Sum of percent is less 100',
    IDTString: '(Y:00300060)',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2328',
  },
  {
    idtDescription:
      '2. Percent for non inscluded base (G) (but included base percents are present)',
    IDTString: '(Y:00333334)',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2329',
  },
  {
    idtDescription:
      '3. Zeroes for included bases but non zeroes for non included',
    IDTString: '(R:00330067)',
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/Indigo/issues/2328, https://github.com/epam/Indigo/issues/2329',
  },
  {
    idtDescription: '4. Less digits than needed',
    IDTString: '(Y:0033006)',
  },
  {
    idtDescription: '5. One digit replaced with char',
    IDTString: '(Y:003300a6)',
  },
  {
    idtDescription: '6. Wrong IUBcode',
    IDTString: '(Z:00330067)',
  },
  {
    idtDescription: '7. Doubled IUBcode',
    IDTString: '(YY:00330067)',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2331',
  },
  {
    idtDescription: '8. Digit as IUBcode',
    IDTString: '(9:00330067)',
  },
  {
    idtDescription: '9. No percentages',
    IDTString: '(Y:)',
  },
  {
    idtDescription: '10. No IUBcode',
    IDTString: '(:00330067)',
  },
  {
    idtDescription: '11. Semicolumns replaced with comma',
    IDTString: '(Y,00330067)',
  },
  {
    idtDescription: '12. Y used before definition',
    IDTString: '(Y)A(Y:00670033)',
  },
  {
    idtDescription: '13. Y defined twice',
    IDTString: '(Y:00330067)A(Y:00670033)',
  },
  {
    idtDescription: '14. Index out of range (allowed range - 1-4)',
    IDTString: '(B5:00653005)',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2381',
  },
  {
    idtDescription: '15. Index out of range (allowed range - 1-4)',
    IDTString: '(B0:00653005)',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2381',
  },
  {
    idtDescription:
      '16. (DNA and RNA thogether is not alowed) DNA with same mixed bases defined 4 different times using index and later inserted as RNA',
    IDTString:
      '(B4:00653005)(B3:00603010)(B2:00553015)(B1:00503020)(B:00453025)r(B)r(B1)r(B2)r(B3)r(B4)',
  },
  {
    idtDescription:
      '17. (DNA and RNA thogether is not alowed) RNA of three mixed bases later inserted as DNA',
    IDTString: 'r(B1:00503020)(B1)',
  },
  {
    idtDescription:
      '18. (LRNA and RNA thogether is not alowed) LRNA of three mixed bases later inserted as RNA',
    IDTString: '+(B1:00503020)r(B1)',
  },
  {
    idtDescription:
      '19. (mRNA and RNA thogether is not alowed) mRNA of three mixed bases later inserted as RNA',
    IDTString: 'm(B1:00503020)r(B1)',
  },
  {
    idtDescription:
      '20. (LRNA and RNA thogether is not alowed) RNA of three mixed bases later inserted as LRNA',
    IDTString: 'r(B1:00503020)+(B1)',
  },
  {
    idtDescription:
      '21. (DNA and RNA thogether is not alowed) RNA of three mixed bases later inserted as DNA',
    IDTString: 'r(B1:00503020)(B1)',
  },
];

test.describe('Import incorrect IDT sequence: ', () => {
  for (const incorrectIDTString of incorrectIDTStrings) {
    test(`${incorrectIDTString.idtDescription}`, async () => {
      /* 
      Test case: https://github.com/epam/ketcher/issues/5505
      Description: Load INCORRECT IDT sequences and compare canvas (with error message) with the template
      Case:
        1. Load icorrect IDT
        2. Get error message
        3. Take screenshot to compare it with example
      */
      test.setTimeout(20000);

      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.IDT,
        incorrectIDTString.IDTString,
        true,
      );
      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });

      // if Error Message is not found - that means that error message didn't appear.
      // That shoul be considered as bug in that case
      const errorMessage = page.getByText('Error message', {
        exact: true,
      });

      if (await errorMessage.isVisible()) {
        await closeErrorMessage(page);
        await closeOpenStructure(page);
      }

      // Test should be skipped if related bug exists
      test.fixme(
        incorrectIDTString.shouldFail === true,
        `That test fails or works wrong because of ${incorrectIDTString.issueNumber} issue.`,
      );
    });
  }
});

test.describe('Ambiguous monomers: ', () => {
  test('Saving ambiguous peptides (with mapping, alternatives) in IDT format', async () => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 17.1 Verify saving ambiguous peptides (with mapping, alternatives) in IDT format (macro mode)
    Case: 1. Load ambiguous peptides (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose IDT option
             (Error message should occur)
          4. Take screenshot to make sure export is correct
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous-monomers/Peptides (that have mapping to library, alternatives).ket',
    );

    await zoomWithMouseWheel(page, -600);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.IDT,
    );
    await takeEditorScreenshot(page);

    await closeErrorMessage(page);
    await SaveStructureDialog(page).cancel();
    await zoomWithMouseWheel(page, 600);
  });

  test('Saving ambiguous peptides (with mapping, mixed) in IDT format', async () => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 17.2 Verify saving ambiguous peptides (with mapping, mixed) in IDT format (macro mode)
    Case: 1. Load ambiguous peptides (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose IDT option
             (Error message should occur)
          4. Take screenshot to make sure export is correct
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous-monomers/Peptides (that have mapping to library, mixed).ket',
    );

    await zoomWithMouseWheel(page, -600);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.IDT,
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });

    await closeErrorMessage(page);
    await SaveStructureDialog(page).cancel();
    await zoomWithMouseWheel(page, 600);
  });

  test('Saving ambiguous peptides (without mapping, alternatives) in IDT format', async () => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 17.3 Verify saving ambiguous peptides (without mapping, alternatives) in IDT format (macro mode)
    Case: 1. Load ambiguous peptides (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose IDT option
            (Error should occure)
          4. Take screenshot to make sure export is correct
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous-monomers/Peptides (that have no mapping to library, alternatives).ket',
    );

    await zoomWithMouseWheel(page, -200);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.IDT,
    );
    await takeEditorScreenshot(page);

    await closeErrorMessage(page);
    await SaveStructureDialog(page).cancel();
    await zoomWithMouseWheel(page, 200);
  });

  test('Saving ambiguous peptides (without mapping, mixed) in IDT format', async () => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 17.4 Verify saving ambiguous peptides (without mapping, mixed) in IDT format (macro mode)
    Case: 1. Load ambiguous peptides (that have mapping to library, mixed) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose IDT option
            (Error should occure)
          4. Take screenshot to make sure export is correct
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous-monomers/Peptides (that have no mapping to library, mixed).ket',
    );

    await zoomWithMouseWheel(page, -200);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.IDT,
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });

    await closeErrorMessage(page);
    await SaveStructureDialog(page).cancel();
    await zoomWithMouseWheel(page, 200);
  });

  test('Saving ambiguous DNA bases (with mapping, alternatives) in IDT format', async () => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 17.5 Verify saving ambiguous DNA bases (with mapping, alternatives) in IDT format (macro mode)
    Case: 1. Load ambiguous bases (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose IDT option
             (Error should occure)
          4. Take screenshot to make sure export is correct
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous-monomers/Ambiguous DNA Bases (alternatives).ket',
    );

    await zoomWithMouseWheel(page, -100);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.IDT,
    );
    await takeEditorScreenshot(page);

    await closeErrorMessage(page);
    await SaveStructureDialog(page).cancel();
    await zoomWithMouseWheel(page, 100);
  });

  test('Saving ambiguous DNA bases (with mapping, mixed) in IDT format', async () => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 17.6 Verify saving ambiguous DNA bases (with mapping, mixed) in IDT format (macro mode)
    Case: 1. Load ambiguous bases (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose IDT option
          4. Take screenshot to make sure export is correct
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous-monomers/Ambiguous DNA Bases (mixed).ket',
    );
    await zoomWithMouseWheel(page, -100);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await verifyFileExport(
      page,
      'IDT/Ambiguous DNA Bases (mixed)-expected.idt',
      FileType.IDT,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'IDT/Ambiguous DNA Bases (mixed)-expected.idt',
    );
    await takeEditorScreenshot(page);
    await zoomWithMouseWheel(page, 100);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Saving ambiguous RNA bases (with mapping, alternatives) in IDT format', async () => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 17.7 Verify saving ambiguous RNA bases (with mapping, alternatives) in IDT format (macro mode)
    Case: 1. Load ambiguous bases (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose IDT option
             (Error message should occure)
          4. Take screenshot to make sure export is correct
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous-monomers/Ambiguous RNA Bases (alternatives).ket',
    );

    await zoomWithMouseWheel(page, -100);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.IDT,
    );
    await takeEditorScreenshot(page);

    await closeErrorMessage(page);
    await SaveStructureDialog(page).cancel();
    await zoomWithMouseWheel(page, 100);
  });

  test('Saving ambiguous RNA bases (with mapping, mixed) in IDT format', async () => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 17.8 Verify saving ambiguous RNA bases (with mapping, mixed) in IDT format (macro mode)
    Case: 1. Load ambiguous bases (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose IDT option
          4. Take screenshot to make sure export is correct
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous-monomers/Ambiguous RNA Bases (mixed).ket',
    );

    await zoomWithMouseWheel(page, -100);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await verifyFileExport(
      page,
      'IDT/Ambiguous RNA Bases (mixed)-expected.idt',
      FileType.IDT,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'IDT/Ambiguous RNA Bases (mixed)-expected.idt',
    );
    await takeEditorScreenshot(page);
    await zoomWithMouseWheel(page, 100);
    await takeEditorScreenshot(page);
  });

  test('Saving ambiguous (common) bases (with mapping, alternatives) in IDT format', async () => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 17.9 Verify saving ambiguous (common) bases (with mapping, alternatives) in IDT format (macro mode)
    Case: 1. Load ambiguous bases (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose IDT option
             (Error message should occure)
          4. Take screenshot to make sure export is correct
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous-monomers/Ambiguous (common) Bases (alternatives).ket',
    );
    await zoomWithMouseWheel(page, -200);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.IDT,
    );
    await takeEditorScreenshot(page);
    await closeErrorMessage(page);
    await SaveStructureDialog(page).cancel();
    await zoomWithMouseWheel(page, 200);
  });

  test('Saving ambiguous (common) bases (with mapping, mixed) in IDT format', async () => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 17.10 Verify saving ambiguous (common) bases (with mapping, mixed) in IDT format (macro mode)
    Case: 1. Load ambiguous bases (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose IDT option
          4. Take screenshot to make sure export is correct
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous-monomers/Ambiguous (common) Bases (mixed).ket',
    );
    await zoomWithMouseWheel(page, -200);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await verifyFileExport(
      page,
      'IDT/Ambiguous (common) Bases (mixed)-expected.idt',
      FileType.IDT,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'IDT/Ambiguous (common) Bases (mixed)-expected.idt',
    );
    await takeEditorScreenshot(page);
    await zoomWithMouseWheel(page, 200);
    await takeEditorScreenshot(page);
  });

  test('Saving RNA ambigous base connected to DNA sugar to IDT', async () => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 17.11 Verify saving RNA ambigous base connected to DNA sugar to IDT
    Case: 1. Load ambiguous bases (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose IDT option
             (Error message occurs)
          4. Take screenshot to make sure export is correct
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous-monomers/RNA ambigous bases connected to DNA sugar (mixed).ket',
    );

    await zoomWithMouseWheel(page, -100);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.IDT,
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });

    await closeErrorMessage(page);
    await SaveStructureDialog(page).cancel();
    await zoomWithMouseWheel(page, 100);

    test.fixme(true, `Error message should be different`);
  });

  test('Saving DNA ambigous base connected to RNA sugar to IDT', async () => {
    /*
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 17.12 Verify saving DNA ambigous base connected to RNA sugar to IDT
    Case: 1. Load ambiguous bases (that have mapping to library) from KET 
          2. Take screenshot to make sure monomers on the canvas
          3. Open Save dialog and choose IDT option
             (Error message occurs)
          4. Take screenshot to make sure export is correct
    */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Ambiguous-monomers/DNA ambigous bases connected to RNA sugar (mixed).ket',
    );

    await zoomWithMouseWheel(page, -100);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.IDT,
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });

    await closeErrorMessage(page);
    await SaveStructureDialog(page).cancel();
    await zoomWithMouseWheel(page, 100);

    test.fixme(true, `Error message should be different`);
  });
});
