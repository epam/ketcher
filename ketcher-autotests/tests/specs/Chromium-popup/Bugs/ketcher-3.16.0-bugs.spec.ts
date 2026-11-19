import { Page, test, expect } from '@fixtures';
import {
  openFileAndAddToCanvas,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  clickOnCanvas,
  selectRectangleArea,
  getCoordinatesOfTheMiddleOfTheScreen,
  takeEditorScreenshot,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  copyContentToClipboard,
  MonomerType,
  selectAllStructuresOnCanvas,
  moveMouseAway,
} from '@utils';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { getStructure, macromoleculesFilesInputFormats } from 'ketcher-core';
import { MacromoleculesFileFormatType } from '@tests/pages/constants/fileFormats/macroFileFormats';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import {
  createRNAAntisenseChain,
  getMonomerLocator,
} from '@utils/macromolecules/monomer';
import { bondTwoMonomersPointToPoint } from '@utils/macromolecules/polymerBond';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondTool } from '@tests/pages/constants/bondSelectionTool/Constants';
import { expandMonomer } from '@utils/sgroup/helpers';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviationLocator';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MonomerOption } from '@tests/pages/constants/contextMenu/Constants';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
let page: Page;
test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

test('Case 1: Copy/Paste action causes exception in log if done reasonably fast on canvas with reasonbly large number of molecules', async () => {
  /**
   * Test task: https://github.com/epam/ketcher/issues/10502
   * Bug: https://github.com/epam/ketcher/issues/3848
   * Description: Copy/Paste action causes exception in log if done reasonably fast on canvas with reasonbly large number of molecules
   * Scenario:
   * 1. Load molecule from file: AllPossibleQueryFeatures.zip (unzip first)
   * 2. Select few rings
   * 3. Press Ctrl+C/Ctrl+V reasonably fast
   * Actual result: exception is thrown
   * Expected result: there are not errors in the console
   */
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  await openFileAndAddToCanvas(
    page,
    'KET/all-possible-query-features-with-out-custom-query.ket',
  );
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  await selectRectangleArea(page, x - 250, y - 210, x + 100, y + 110);
  await copyToClipboardByKeyboard(page);
  await pasteFromClipboardByKeyboard(page);
  await clickOnCanvas(page, 0, 100, { from: 'pageCenter' });
  const clipboardErrors = consoleErrors.filter((error) =>
    error.includes('No valid data on clipboard'),
  );
  expect(clipboardErrors.length).toBe(0);
});

test('Case 2: Aromatizing causes NULL in export to MDL Molfile V2000 format file', async () => {
  /**
   * Test task: https://github.com/epam/ketcher/issues/10502
   * Bug: https://github.com/epam/ketcher/issues/3951
   * Description: Aromatizing causes NULL in export to MDL Molfile V2000 format file
   * Scenario:
   * 1. Open the app
   * 2. Click Aromatize button
   * 3. Click Ctrl+S
   * Actual result: NULL appears in the beginning of the content (Molfile V2000)
   * Expected result: NULL is not present
   */
  await IndigoFunctionsToolbar(page).aromatize();
  await CommonTopLeftToolbar(page).saveButton.click();
  const saveMolfilePreview = (
    await SaveStructureDialog(page).saveStructureTextarea.allTextContents()
  ).join();
  expect(saveMolfilePreview).not.toMatch(/^null\b/i);
});

test('Case 3: Micro: S-Group brackets are drawn incorrectly for simple aromatic molecule', async () => {
  /**
   * Test task: https://github.com/epam/ketcher/issues/10502
   * Bug: https://github.com/epam/ketcher/issues/3976
   * Description: Micro: S-Group brackets are drawn incorrectly for simple aromatic molecule
   * Scenario:
   * 1. Open the app
   * 2. Open KET/Chromium-popup/Bugs/ketcher-3.16.0-bugs/BrokenBrackets.ket file
   * 3. Check the S-Group brackets
   * Actual result: brackets are rotated and only include part of the molecule
   * Expected result: two vertical brackers are displayed at the left and right sides of the molecule
   */
  await openFileAndAddToCanvas(
    page,
    'KET/Chromium-popup/Bugs/ketcher-3.16.0-bugs/BrokenBrackets.ket',
  );
  await takeEditorScreenshot(page);
});

test('Case 4: Adding hydrogens causes S-Group label positions far away from their original position expecially for aromatic bonds (Ketcher part)', async () => {
  /**
   * Test task: https://github.com/epam/ketcher/issues/10502
   * Bug: https://github.com/epam/ketcher/issues/3977
   * Description: Adding hydrogens causes S-Group label positions far away from their original position expecially for aromatic bonds (Ketcher part)
   * Scenario:
   * 1. Open the app
   * 2. Open KET/Chromium-popup/Bugs/ketcher-3.16.0-bugs/All types of bond - Either topology - Unmarked - S-Group - Data - Bond.ket file
   * 3. Click the Add/Remove explicit hydrogens button
   * Actual result: S-groups labels are displayed above the structures
   * Expected result: S-group labels stay near the structures
   */
  await openFileAndAddToCanvas(
    page,
    'KET/Chromium-popup/Bugs/ketcher-3.16.0-bugs/All types of bond - Either topology - Unmarked - S-Group - Data - Bond.ket',
  );
  await IndigoFunctionsToolbar(page).addRemoveExplicitHydrogens();
  await takeEditorScreenshot(page);
});

test('Case 5: Establishing connection between ambiguous phosphate and sugar works wrong', async () => {
  /**
   * Test task: https://github.com/epam/ketcher/issues/10502
   * Bug: https://github.com/epam/ketcher/issues/5470
   * Description: Establishing connection between ambiguous phosphate and sugar works wrong
   * Scenario:
   * 1. Open the app in macromolecules -> Flex mode
   * 2. Copy the following HELM: RNA1{R(A)([bnn],[bP])}|RNA2{R(A)([bnn],[bP])}$$$$V2.0
   * 3. Try to connect ambiguous phosphate with sugar using center to center way or ph(R2) to center way or sg(R1) to center way

   * Actual result: Attachment points are not shown, In case of center-to-center way - Select Connection point dialog appears
   * Expected result: Attachment points are shown, Select Connection point dialog doesn't appear
   */
  const helmString = 'RNA1{R(A)([bnn],[bP])}|RNA2{R(A)([bnn],[bP])}$$$$V2.0';
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor(LayoutMode.Flex);
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    helmString,
  );
  const phosphate = getMonomerLocator(page, {
    monomerType: MonomerType.Phosphate,
  }).first();
  const sugar = getMonomerLocator(page, { monomerType: MonomerType.Sugar }).nth(
    1,
  );
  await CommonLeftToolbar(page).bondTool(MacroBondTool.Single);
  await phosphate.getByTestId('shape').hover({ force: true });
  await page.mouse.down();
  await sugar.getByTestId('shape').hover({ force: true });
  await takeEditorScreenshot(page, { hideMonomerPreview: true });
  await page.mouse.up();
  await takeEditorScreenshot(page, { hideMonomerPreview: true });
});

test('Case 6: Copy/Cut/Paste operations works inconsistently with S-Groups (abbreviations) - paste from clipboard in collapsed state', async () => {
  /**
   * Test task: https://github.com/epam/ketcher/issues/10502
   * Bug: https://github.com/epam/ketcher/issues/5831
   * Description: Copy/Cut/Paste operations works inconsistently with S-Groups (abbreviations) - paste from clipboard in collapsed state
   * Scenario:
   * 1. Go to Molecules
   * 2. Load from file any monomer using Open as New Project: 1. Petide D (from library).zip
   * 3. Right click on appeared monomer and click on Expand monomer at context menu
   * 4. Select expanded monomer and copy (or cut) it to clipboard
   * 5. Paste it from clipboard to the canvas

   * Actual result: System paste monomer in collapsed state
   * Expected result: System paste monomer in expanded state
   */
  await openFileAndAddToCanvas(
    page,
    'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/1. Petide D (from library).ket',
  );
  await expandMonomer(page, getAbbreviationLocator(page, { name: 'D' }));
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await copyToClipboardByKeyboard(page);
  await pasteFromClipboardByKeyboard(page);
  await clickOnCanvas(page, 100, 0, { from: 'pageCenter' });
  await takeEditorScreenshot(page);
});

test("Case 7: Antisense creating doesn't work if ambiguous phosphate present in the chain selection", async ({
  SnakeCanvas: _,
}) => {
  /**
   * Test task: https://github.com/epam/ketcher/issues/10502
   * Bug: https://github.com/epam/ketcher/issues/6090
   * Description: Antisense creating doesn't work if ambiguous phosphate present in the chain selection
   * Scenario:
   * 1. Go to Macro - Snake mode
   * 2. Load from HELM using paste from clipboard: RNA1{R(A)([gly],[hn])}$$$$V2.0
   * 3. Select all monomers on the canvas and click Create Antisense Strand from context menu

   * Actual result: Nothing happens, there is an error in console
   * Expected result: Antisense chain created. Phosphate in anti-sence chain should be natural P
   */
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(A)([gly],[hn])}$$$$V2.0',
  );
  await selectAllStructuresOnCanvas(page);
  await ContextMenu(
    page,
    getMonomerLocator(page, { monomerType: MonomerType.Phosphate }).first(),
  ).click(MonomerOption.CreateAntisenseRNAStrand);
  const filteredErrors = consoleErrors.filter((error) =>
    error.includes('Cannot read properties of undefined'),
  );
  expect(filteredErrors.length).toBe(0);
  await takeEditorScreenshot(page);
});

test("Case 8: Antisense creating doesn't work if ambiguous sugar present in the chain selection", async ({
  SnakeCanvas: _,
}) => {
  /**
   * Test task: https://github.com/epam/ketcher/issues/10502
   * Bug: https://github.com/epam/ketcher/issues/6091
   * Description: Antisense creating doesn't work if ambiguous sugar present in the chain selection
   * Scenario:
   * 1. Go to Macro - Snake mode
   * 2. Load from HELM using paste from clipboard: RNA1{([25mo3r],[25R])(A)P}$$$$V2.0
   * 3. Select all monomers on the canvas and call context menu

   * Actual result: Create Antisense Strand option is absent
   * Expected result: Create Antisense Strand option is present and works correct (antisense creation is possible)
   */

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{([25mo3r],[25R])(A)P}$$$$V2.0',
  );
  await selectAllStructuresOnCanvas(page);
  await ContextMenu(
    page,
    getMonomerLocator(page, { monomerType: MonomerType.Sugar }).first(),
  ).click(MonomerOption.CreateAntisenseRNAStrand);

  await takeEditorScreenshot(page);
});

test("Case 9: Antisense creating doesn't work if ambiguous peptide present in the chain selection", async ({
  SnakeCanvas: _,
}) => {
  /**
   * Test task: https://github.com/epam/ketcher/issues/10502
   * Bug: https://github.com/epam/ketcher/issues/6092
   * Description: Antisense creating doesn't work if ambiguous peptide present in the chain selection
   * Scenario:
   * 1. Go to Macro - Snake mode
   * 2. Load from HELM using paste from clipboard: RNA1{R(A)P}|PEPTIDE1{(A,C,D,E)}$RNA1,PEPTIDE1,3:R2-1:R1$$$V2.0
   * 3. Select all monomers on the canvas and click Create Antisense Strand from context menu

   * Actual result: Nothing happens, there is an error in console
   * Expected result: Antisense chain created but with no monomers created for ambiguous monomer in antisence chain
   */
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(A)P}|PEPTIDE1{(A,C,D,E)}$RNA1,PEPTIDE1,3:R2-1:R1$$$V2.0',
  );
  await selectAllStructuresOnCanvas(page);
  await ContextMenu(
    page,
    getMonomerLocator(page, { monomerType: MonomerType.Peptide }).first(),
  ).click(MonomerOption.CreateAntisenseRNAStrand);
  const filteredErrors = consoleErrors.filter((error) =>
    error.includes('Cannot read properties of undefined'),
  );
  expect(filteredErrors.length).toBe(0);
  await takeEditorScreenshot(page);
});

test('Case 10: Phosphate in antisense chain converted wrong', async ({
  SnakeCanvas: _,
}) => {
  /**
   * Test task: https://github.com/epam/ketcher/issues/10502
   * Bug: https://github.com/epam/ketcher/issues/6093
   * Description: Phosphate in antisense chain converted wrong
   * Scenario:
   * 1. Go to Macro - Snake mode
   * 2. Load from HELM using paste from clipboard: RNA1{[RSpabC](A)[Ssp]}$$$$V2.0
   * 3. Select all monomers on the canvas and click Create Antisense Strand from context menu

   * Actual result: Phosphate in antisense chain copied as it is (Ssp)
   * Expected result: Phosphate in antisense chain copied as it is P if it belongs to nucleotide
   */

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{[RSpabC](A)[Ssp]}$$$$V2.',
  );
  await selectAllStructuresOnCanvas(page);
  await ContextMenu(
    page,
    getMonomerLocator(page, { monomerType: MonomerType.Phosphate }).first(),
  ).click(MonomerOption.CreateAntisenseRNAStrand);
  await expect(getMonomerLocator(page, { monomerAlias: 'Ssp' })).toHaveCount(1);
  await expect(getMonomerLocator(page, { monomerAlias: 'P' })).toHaveCount(1);
});

test('Case 11: It is possible to create antisense even if it is not allowed (when base has extra bond out of r1-r3 to sugar)', async ({
  SnakeCanvas: _,
}) => {
  /**
   * Test task: https://github.com/epam/ketcher/issues/10502
   * Bug: https://github.com/epam/ketcher/issues/6094
   * Description: It is possible to create antisense even if it is not allowed (when base has extra bond out of r1-r3 to sugar)
   * Scenario:
   * 1. Go to Macro - Snake mode
   * 2. Load from HELM using paste from clipboard: RNA1{R([nC6n5C])P.R([nC6n5C])P}$RNA1,RNA1,2:R2-5:R2$$$V2.0
   * 3. Select all monomers on the top of the chain and click Create Antisense Strand from context menu

   * Actual result: System creates antisense chain for all bases
   * Expected result: Create Antisense Strand option is disabled
   */

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R([nC6n5C])P.R([nC6n5C])P}$RNA1,RNA1,2:R2-5:R2$$$V2.0',
  );
  await selectAllStructuresOnCanvas(page);
  const menu = ContextMenu(
    page,
    getMonomerLocator(page, { monomerAlias: 'P' }).first(),
  );
  await menu.open();
  await expect(
    menu.getOptionLocator(MonomerOption.CreateAntisenseRNAStrand),
  ).toBeDisabled();
  await expect(
    menu.getOptionLocator(MonomerOption.CreateAntisenseDNAStrand),
  ).toBeDisabled();
});

test("Case 12: Export to Sequence (3-letter code) and export to IDT doesn't throws an error if user tries to save micromolecule structures", async ({
  FlexCanvas: _,
}) => {
  /**
   * Test task: https://github.com/epam/ketcher/issues/10502
   * Bug: https://github.com/epam/ketcher/issues/6314
   * Description: Export to Sequence (3-letter code) and export to IDT doesn't throws an error if user tries to save micromolecule structures
   * Scenario:
   * 1. Go to Macro - Flex mode
   * 2. Load from file: All 16 types of bonds.zip
   * 3. Save canvas to Sequence (3-letter code) or IDT

   * Actual result: System shows empty export result
   * Expected result: System shown error message: Convert error! Error during sequence type recognition(RNA, DNA or Peptide)
   */
  await openFileAndAddToCanvas(
    page,
    'KET/Micro-Macro-Switcher/All 16 types of bonds.ket',
  );
  await CommonTopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).chooseFileFormat(
    MacromoleculesFileFormatType.Sequence3LetterCode,
  );
  const errorMessage = await ErrorMessageDialog(page).getErrorMessage();
  expect(errorMessage).toContain(
    `Convert error! Sequence saver: Can't save micro-molecules to sequence format`,
  );
});
