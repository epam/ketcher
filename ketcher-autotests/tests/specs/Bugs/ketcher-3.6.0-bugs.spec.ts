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
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
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
      enableFlexMode: false,
      goToPeptides: false,
    });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
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
      enableFlexMode: false,
      goToPeptides: false,
    });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
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
      enableFlexMode: false,
      goToPeptides: false,
    });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
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
    await expandMonomer(page, page.getByText('baA'));
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
      enableFlexMode: false,
      goToPeptides: false,
    });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.A.A.[Cys_Bn]}$$$$V2.0',
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await clickInTheMiddleOfTheScreen(page);
    await ContextMenu(page, page.getByText('Cys_Bn')).open();
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
});
