/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Peptides } from '@constants/monomers/Peptides';
import { Page, test, expect } from '@playwright/test';
import {
  takeEditorScreenshot,
  resetZoomLevelToDefault,
  openFileAndAddToCanvasAsNewProjectMacro,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  selectAllStructuresOnCanvas,
  clickInTheMiddleOfTheScreen,
  moveMouseAway,
  keyboardTypeOnCanvas,
  keyboardPressOnCanvas,
  waitForMonomerPreview,
  takeElementScreenshot,
  openFile,
  readFileContent,
  MolFileFormat,
  takePageScreenshot,
} from '@utils';
import { waitForPageInit, waitForSpinnerFinishedWork } from '@utils/common';
import {
  connectMonomersWithBonds,
  getMonomerLocator,
} from '@utils/macromolecules/monomer';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { expandMonomer } from '@utils/canvas/monomer/helpers';
import { Ruler } from '@tests/pages/macromolecules/tools/Ruler';
import { Library } from '@tests/pages/macromolecules/Library';
import { Chem } from '@constants/monomers/Chem';
import { Presets } from '@constants/monomers/Presets';
import { drawBenzeneRing } from '@tests/pages/molecules/BottomToolbar';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { CalculateVariablesPanel } from '@tests/pages/macromolecules/CalculateVariablesPanel';
import { OpenPPTXFileDialog } from '@tests/pages/molecules/OpenPPTXFileDialog';
import { closeErrorAndInfoModals } from '@utils/common/helpers';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MacromoleculesFileFormatType } from '@tests/pages/constants/fileFormats/macroFileFormats';
import { MolecularMassUnit } from '@tests/pages/constants/calculateVariablesPanel/Constants';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviation';

async function connectMonomerToAtom(page: Page) {
  await getMonomerLocator(page, Peptides.A).hover();
  await page
    .getByTestId('monomer')
    .locator('g')
    .filter({ hasText: 'R2' })
    .locator('path')
    .hover();
  await page.mouse.down();
  await page.locator('g').filter({ hasText: /^H2N$/ }).locator('rect').hover();
  await page.mouse.up();
}

async function openPPTXFileAndValidateStructurePreview(
  page: Page,
  filePath: string,
  numberOf: {
    Structure: number;
  } = { Structure: 1 },
) {
  await CommonTopLeftToolbar(page).openFile();
  await waitForSpinnerFinishedWork(page, async () => {
    await openFile(page, filePath);
  });
  const openPPTXFileDialog = OpenPPTXFileDialog(page);
  if (numberOf.Structure !== 1) {
    await openPPTXFileDialog.selectStructure(numberOf);
  }
  await takeEditorScreenshot(page);
  await openPPTXFileDialog.pressOpenAsNewProjectButton();
}

test.describe('MacromoleculePropertiesWindow events access', () => {
  test('should handle undefined events property without throwing error', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const pageErrors: string[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await page.goto(`${process.env.KETCHER_URL}/duo`);

    await page.waitForLoadState('networkidle');

    try {
      await page.waitForSelector(
        '[data-testid="macromolecule-properties-close"]',
        {
          state: 'attached',
          timeout: 5000,
        },
      );
    } catch (error) {
      console.log(
        'Component not found, but this is expected if there is no selection',
      );
    }

    const WAIT_TIME_MS = 2000;
    await page.waitForTimeout(WAIT_TIME_MS);

    const allErrors = [...consoleErrors, ...pageErrors];

    if (allErrors.length > 0) {
      console.log('All errors caught:', allErrors);
    }

    const editorEventsErrors = allErrors.filter((error) =>
      error.includes("Cannot read properties of undefined (reading 'events')"),
    );

    expect(editorEventsErrors.length).toBe(0);
  });
});

let page: Page;

test.describe('Ketcher bugs in 3.6.0', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await waitForPageInit(page);
  });

  test.afterEach(async ({ context: _ }, testInfo) => {
    await CommonTopLeftToolbar(page).clearCanvas();
    await resetZoomLevelToDefault(page);
    await processResetToDefaultState(testInfo, page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  test('Case 1: Correct bond attachment to micro molecules in Macro Mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7454
     * Bug: https://github.com/epam/ketcher/issues/6410
     * Description: Correct bond attachment to micro molecules in Macro Mode. The bond should be attached to the correct atomic position,
     * ensuring proper connectivity between the micro molecule and the rest of the structure.
     * The bond should not overlap or extend outside of the expected attachment point.
     * Scenario:
     * 1. Go to Macro - Flex mode (clean canvas)
     * 2. Open the file with micro molecule
     * 3. Select the bond tool
     * 4. Connect the bond to the micro molecule
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Bugs/Unable to connect monomer to molecule in snake mode.ket',
    );
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await connectMonomerToAtom(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 2: The tooltip not appears behind the context menu options', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7454
     * Bug: https://github.com/epam/ketcher/issues/7178
     * Description: The tooltip not appears behind the context menu options.
     * Scenario:
     * 1. Go to Macro - Flex mode (clean canvas)
     * 2. Load from HELM
     * 3. Open the context menu for the monomer
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{[Cys_Bn]}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    const Peptide = getMonomerLocator(page, Peptides.Cys_Bn).first();
    await ContextMenu(page, Peptide).open();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: false,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 3: Able to create hydrogen bond', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7454
     * Bug: https://github.com/epam/ketcher/issues/7073
     * Description: Able to create hydrogen bond.
     * Scenario:
     * 1. Go to Macro - Flex mode (clean canvas)
     * 2. Load from KET
     * 3. Establish a hydrogen bond between two monomers
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Bugs/Unable to create bond Uncaught RangeError Maximum call stack size exceeded.ket',
    );
    const from = 'bnn';
    const targets = ['eop', '5hMedC', '5NitInd', 'DOTA'];
    for (const to of targets) {
      await connectMonomersWithBonds(page, [from, to], MacroBondType.Hydrogen);
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 4: Chemical elements not disappear when attempting to Expand the Structure in Micro mode after selecting one in Macro mode', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7454
     * Bug: https://github.com/epam/ketcher/issues/7117
     * Description: Chemical elements тще disappear when attempting to Expand the Structure in Micro mode after selecting one in Macro mode.
     * Scenario:
     * 1. Go to Micro
     * 2. Load from KET
     * 3. Switch to Macro
     * 4. Select a monomer
     * 5. Switch to Micro and expand the structure
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Bugs/structure-with-two-a.ket',
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await selectAllStructuresOnCanvas(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await clickInTheMiddleOfTheScreen(page);
    await expandMonomer(page, getAbbreviationLocator(page, { name: 'baA' }));
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 5: Monomer tooltip appears and not remain in place when mouse cursor moved away', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7454
     * Bug: https://github.com/epam/ketcher/issues/7170
     * Description: Monomer tooltip appears and not remain in place when mouse cursor moved away.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Switch to Micro
     * 4. Right-click a monomer to see the tooltip
     * 5. Move the mouse cursor away from the monomer
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.A.A.[Cys_Bn]}$$$$V2.0',
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await clickInTheMiddleOfTheScreen(page);
    await ContextMenu(
      page,
      getAbbreviationLocator(page, { name: 'Cys_Bn' }),
    ).open();
    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: false,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 6: The ruler is not limited to 190 divisions', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7454
     * Bug: https://github.com/epam/ketcher/issues/7209
     * Description: The ruler is not limited to 190 divisions.
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Set the ruler value to 210
     * 3. Verify that the ruler value is set to 210
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      disableChainLengthRuler: false,
    });
    await keyboardTypeOnCanvas(page, 'ACGTUACGTUACGTUACGTU');
    await Ruler(page).setLength('210');
    await keyboardPressOnCanvas(page, 'Enter');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 7: Rectangular input field wide enough to fit any (at least 4) digit number', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7454
     * Bug: https://github.com/epam/ketcher/issues/7207
     * Description: Rectangular input field wide enough to fit any (at least 4) digit number.
     * Scenario:
     * 1. Go to Macro - Sequence mode
     * 2. Set the ruler value to 1000
     * 3. Verify that the ruler value is set to 1000
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      disableChainLengthRuler: false,
    });
    await keyboardTypeOnCanvas(page, 'ACGTUACGTUACGTUACGTU');
    await Ruler(page).setLength('1000');
    await keyboardPressOnCanvas(page, 'Enter');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test(`Case 8: IDT code shown correct for SS3 CHEM`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7454
     * Bug: https://github.com/epam/ketcher/issues/7187
     * Description: IDT code shown correct for SS3 CHEM
     * Scenario:
     * 1. Go to Macro
     * 2. Switch to Flex mode
     * 3. Hover over SS3 CHEM
     * 4. Take a screenshot
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
    await Library(page).switchToCHEMTab();
    await Library(page).hoverMonomer(Chem.SS3);
    await waitForMonomerPreview(page);
    await takeElementScreenshot(
      page,
      page.getByTestId('polymer-library-preview'),
    );
  });

  test(`Case 9: Mouse cursor positioned at the top left corner of preset when zoom 400%`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7454
     * Bug: https://github.com/epam/ketcher/issues/7371
     * Description: Mouse cursor positioned at the top left corner of preset when zoom 400%
     * Scenario:
     * 1. Go to Macro
     * 2. Switch to Flex mode
     * 3. Set zoom level to 400%
     * 4. Drag "ghost image" on the canvas
     * 5. Take a screenshot
     * We have a bug https://github.com/epam/ketcher/issues/7371 when it will be fixed need to update
     * the screenshot
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
    await CommonTopRightToolbar(page).setZoomInputValue('400');
    await Library(page).hoverMonomer(Presets.A);
    await page.mouse.down();
    await page.mouse.move(200, 200);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await page.mouse.up();
    await Library(page).hoverMonomer(Presets.A);
    await page.mouse.down();
    await page.mouse.move(200, 200);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await page.mouse.up();
  });

  test(`Case 10: Delete operation not causes exception: Uncaught (in promise) Error: Minified Redux error`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7454
     * Bug: https://github.com/epam/ketcher/issues/7386
     * Description: Delete operation not causes exception: Uncaught (in promise) Error: Minified Redux error
     * Scenario:
     * 1. Go to Micro
     * 2. Add a benzene ring
     * 3. Switch to Macro
     * 4. Select all structures on canvas
     * 5. Select Erase tool
     * 6. Take a screenshot
     */
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await drawBenzeneRing(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
    await selectAllStructuresOnCanvas(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test(`Case 11: System not loads base as sugar`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7454
     * Bug: https://github.com/epam/Indigo/issues/2964
     * Description: System not loads base as sugar
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode (empty canvas)
     * 2. Load from HELM
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{(A)}$$$$V2.0',
    );
    await verifyFileExport(
      page,
      'KET/Bugs/base-monomer-expected.ket',
      FileType.KET,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 12: Isoelectric Point calculation formula correct for peptide C', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7454
     * Bug: https://github.com/epam/Indigo/issues/2929
     * Description: Isoelectric Point calculation formula correct for peptide C.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     * 4. Check Isoelectric point
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{C}$$$V2.0',
    );
    await MacromoleculesTopToolbar(page).calculateProperties();
    expect(
      await CalculateVariablesPanel(page).getIsoelectricPointValue(),
    ).toEqual('8.49');
  });

  test('Case 13: Сorrect Implementation of PKA calculation', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7454
     * Bug: https://github.com/epam/Indigo/issues/2985
     * Description: Сorrect Implementation of PKA calculation. Example for Peptide C.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     * 4. Check pKa values
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{C}$$$V2.0',
    );
    await MacromoleculesTopToolbar(page).calculateProperties();
    expect(
      await CalculateVariablesPanel(page).getIsoelectricPointValue(),
    ).toEqual('8.49');
    expect(
      await CalculateVariablesPanel(page).getExtinctionCoefficientValue(),
    ).toEqual('125');
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '121.154',
    );
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C3H7NO2S',
    );
  });

  test('Case 14: System not shows positive charge modificator as extra + in addition to charge modified molecule', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7454
     * Bug: https://github.com/epam/Indigo/issues/1686
     * Description: System not shows positive charge modificator as extra + in addition to charge modified molecule
     * Scenario:
     * 1. Go to Micro mode
     * 2. Open from pptx file
     * 3. Take screenshot
     * Bug not fixed https://github.com/epam/Indigo/issues/1686
     * When it will be fixed need to update the screenshot.
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await openPPTXFileAndValidateStructurePreview(page, 'PPTX/Extra.plus.pptx');
    await takeEditorScreenshot(page);
  });

  test('Case 15: System not saves unique structure monomer named same as monomer in the library as the monomer from the library', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7454
     * Bug: https://github.com/epam/Indigo/issues/3024
     * Description: System saves unique structure monomer named same as monomer in the library as the monomer from the library.
     * System loads original monomer (with unique structure) and monomer from library
     * Scenario:
     * 1. Go to Micro mode
     * 2. Open from pptx file
     * 3. Take screenshot
     * Bug not fixed https://github.com/epam/Indigo/issues/3024
     * For now system loads both monomers from the same (with unique structure)
     * When it will be fixed need to update the screenshot.
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
    const fileContent = await readFileContent(
      'Molfiles-V3000/Bugs/monomer-with-unique-structure.mol',
    );
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.MOLv3000,
      fileContent,
    );
    await Library(page).dragMonomerOnCanvas(Peptides.Cys_Bn, {
      x: 580,
      y: 388,
    });
    await keyboardPressOnCanvas(page, 'Escape');
    await getMonomerLocator(page, Peptides.Cys_Bn).nth(1).hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'Molfiles-V3000/Bugs/monomer-with-unique-structure-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'Molfiles-V3000/Bugs/monomer-with-unique-structure-expected.mol',
    );
    await getMonomerLocator(page, Peptides.Cys_Bn).nth(1).hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Case 16: System calculate melting temperature for mix of nucleotides/nucleosides and unsplit nucleotides/unsplit nucleosides', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7454
     * Bug: https://github.com/epam/Indigo/issues/2936
     * Description: System calculate melting temperature for mix of nucleotides/nucleosides and unsplit nucleotides/unsplit nucleosides.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     * 4. Check Melting Temperature
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[2-damdA]}|RNA2{R(G)P}|RNA3{[5Br-dU].R(C)}$RNA2,RNA1,3:R2-1:R1|RNA1,RNA3,1:pair-1:pair|RNA2,RNA3,2:pair-3:pair$$$V2.0',
    );
    await MacromoleculesTopToolbar(page).calculateProperties();
    expect(
      await CalculateVariablesPanel(page).getMeltingTemperatureValue(),
    ).toEqual('-1.3');
  });

  test('Case 17: System not consider closing bracket as part of name', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7454
     * Bug: https://github.com/epam/Indigo/issues/2993
     * Description: System not consider closing bracket as part of name.
     * System throws error message: Convert error! Given string could not be loaded as
     * (query or plain) molecule or reaction, see the error messages: 'SEQUENCE loader: emsc'
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Take screenshot
     */
    const helmCases = [
      'PEPTIDE1{1Nal]}$$$$V2.0',
      'RNA1{5S6Rm5](mo6pur)sP-}$$$$V2.0',
      'RNA1{5S6Rm5(mo6pur])sP-}$$$$V2.0',
      'RNA1{5S6Rm5(mo6pur)sP-]}$$$$V2.0',
      'RNA1{2-damdA]}$$$$V2.0',
      'CHEM1{4aPEGMal]}$$$$V2.0',
    ];
    for (const helm of helmCases) {
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
        enableFlexMode: true,
        goToPeptides: false,
      });
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        helm,
      );
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await closeErrorAndInfoModals(page);
    }
  });

  test('Case 18: Input fields for ion concentration and oligonucleotides not become inactive after entering excessively long number', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7454
     * Bug: https://github.com/epam/Indigo/issues/2998
     * Description: Input fields for ion concentration and oligonucleotides not become inactive after entering excessively long number.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     * 4. Enter excessively long number in the ion concentration field
     * 5. Enter excessively long number in the oligonucleotides field
     * 6. Verify that the input fields
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)P.[dR](A)}|RNA2{[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)}$RNA1,RNA2,11:pair-5:pair|RNA1,RNA2,8:pair-8:pair|RNA1,RNA2,5:pair-11:pair|RNA1,RNA2,2:pair-14:pair|RNA1,RNA2,14:pair-2:pair$$$V2.0',
    );
    await MacromoleculesTopToolbar(page).calculateProperties();
    await CalculateVariablesPanel(page).setUnipositiveIonsValue(
      '99999999999999999999999999999999999999999999999999',
    );
    await takePageScreenshot(page);
    await keyboardPressOnCanvas(page, 'Backspace');
    await CalculateVariablesPanel(page).setOligonucleotidesValue(
      '99999999999999999999999999999999999999999999999999',
    );
    await takePageScreenshot(page);
  });

  test('Case 19: System not allow to export molecules to 3-letter sequence format', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7454
     * Bug: https://github.com/epam/Indigo/issues/2965
     * Description: System not allow to export molecules to 3-letter sequence format.
     * System throws an error: Convert error! Error during sequence type recognition(RNA, DNA or Peptide)
     * Scenario:
     * 1. Go to Macro mode -> Flex mode
     * 2. Open from KET file
     * 3. Press Save button and select 3-letter sequence format
     * 4. Verify that the error message appears
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Bugs/System allow to export molecules to 3-letter sequence format.ket',
    );
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.Sequence3LetterCode,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await closeErrorAndInfoModals(page);
  });

  test('Case 20: Atom weights in indigo updated according to last IUPAC data', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7454
     * Bug: https://github.com/epam/Indigo/issues/2926
     * Description: Atom weights in indigo updated according to last IUPAC data. Molecular mass is 4113,641
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Open the "Calculate Properties" window
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'CHEM1{[CCC(C(NC(C(NC(C(NC(C(NC(C(NC(C(NC(C(NC(CNC(C(NC(C(NC(C(NC(C(NC(C(NC(C(NC(C(NC(C(NC(C(NC(C(NC(C(NC(CNC(C(NC(C(NC(C(N)CC1NC=NC=1)=O)(C)C)=O)CCC(O)=O)=O)=O)C(O)C)=O)CC1C=CC=CC=1)=O)C(O)C)=O)CO)=O)CC(O)=O)=O)C(C)C)=O)CO)=O)CO)=O)CC1C=CC(O)=CC=1)=O)CC(C)C)=O)CCC(O)=O)=O)=O)CCC(N)=O)=O)C)=O)C)=O)CCCCNC(COCCOCCNC(COCCOCCNC(CCC(NC(CCCCCCCCCCCCCCCCC(O)=O)=O)C(O)=O)=O)=O)=O)=O)CCC(O)=O)=O)CC1C=CC=CC=1)=O)C(NC(C(NC(C(NC(C(NC(C(NC(C(NCC(NC(C(NCC(O)=O)=O)CCCNC(N)=N)=O)=O)CCCNC(N)=N)=O)C(C)C)=O)CC(C)C)=O)CC1C2C(=CC=CC=2)NC=1)=O)C)=O)C]}$$$$V2.0',
    );
    await MacromoleculesTopToolbar(page).calculateProperties();
    await CalculateVariablesPanel(page).setMolecularMassUnits(
      MolecularMassUnit.Da,
    );
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '4113.641',
    );
  });

  test('Case 21: Select central monomer of chain of three', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7454
     * Bug: https://github.com/epam/Indigo/issues/2926
     * Description: Mass should be 103.139 Da for peptide C.
     * Scenario:
     * 1. Go to Macro
     * 2. Load from HELM
     * 3. Select central monomer of chain of three C monomers
     * 4. Open the "Calculate Properties" window
     * 5. Verify that the mass is 103.139 Da
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{C.C.C}$$$$V2.0',
    );
    await getMonomerLocator(page, Peptides.C).nth(1).click();
    await MacromoleculesTopToolbar(page).calculateProperties();
    await CalculateVariablesPanel(page).setMolecularMassUnits(
      MolecularMassUnit.Da,
    );
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '103.139',
    );
    await MacromoleculesTopToolbar(page).calculateProperties();
  });

  test('Case 22: Export (and import) of sequence of nucleosides to HELM works', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7454
     * Bug: https://github.com/epam/Indigo/issues/2989
     * Description: Export (and import) of sequence of nucleosides to HELM works
     * Scenario:
     * 1. Go to Macro mode -> Flex mode
     * 2. Open from KET file
     * 3. Export canvas to HELM
     * 4. Import HELM file to canvas
     * 5. Take screenshot
     */
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Bugs/Export (and import) of sequence of nucleosides to HELM works wrong.ket',
    );
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.HELM,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await closeErrorAndInfoModals(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[5R6Rm5](A).[5R6Rm5](A).[5R6Rm5](A)}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});
