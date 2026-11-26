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
  MonomerType,
  selectAllStructuresOnCanvas,
  deleteByKeyboard,
} from '@utils';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MacromoleculesFileFormatType } from '@tests/pages/constants/fileFormats/macroFileFormats';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondTool } from '@tests/pages/constants/bondSelectionTool/Constants';
import { expandMonomer } from '@utils/sgroup/helpers';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviationLocator';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MonomerOption } from '@tests/pages/constants/contextMenu/Constants';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { collectPageErrors } from '@utils/common/collectPageErrors';
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
   * Expected result: there are not errors in the console
   * Version 3.16.0
   */

  const pageErrors = collectPageErrors(page);

  await openFileAndAddToCanvas(
    page,
    'KET/all-possible-query-features-with-out-custom-query.ket',
  );
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  await selectRectangleArea(page, x - 250, y - 210, x + 100, y + 110);
  await copyToClipboardByKeyboard(page);
  await pasteFromClipboardByKeyboard(page);
  await clickOnCanvas(page, 0, 100, { from: 'pageCenter' });
  const relevantErrors = pageErrors.errors.filter((message) =>
    message.includes('No valid data on clipboard'),
  );

  expect(relevantErrors).toEqual([]);
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
   * Expected result: NULL is not present
   * Version 3.16.0
   */
  await IndigoFunctionsToolbar(page).aromatize();
  await CommonTopLeftToolbar(page).saveButton.click();
  const saveMolfilePreview = SaveStructureDialog(page).saveStructureTextarea;
  await expect(saveMolfilePreview).toHaveValue(/V2000/);
  await expect(saveMolfilePreview).not.toHaveValue(/^null\b/i);
  // expect(saveMolfilePreview).not.toMatch(/^null\b/i);
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
   * Expected result: two vertical brackers are displayed at the left and right sides of the molecule
   * Version 3.16.0
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
   * Expected result: S-group labels stay near the structures
   * Version 3.16.0
   */
  await openFileAndAddToCanvas(
    page,
    'KET/Chromium-popup/Bugs/ketcher-3.16.0-bugs/All types of bond - Either topology - Unmarked - S-Group - Data - Bond.ket',
  );
  await IndigoFunctionsToolbar(page).addRemoveExplicitHydrogens();
  await takeEditorScreenshot(page);
});

test('Case 5: Establishing connection between ambiguous phosphate and sugar works wrong', async ({
  FlexCanvas: _,
}) => {
  /**
   * Test task: https://github.com/epam/ketcher/issues/10502
   * Bug: https://github.com/epam/ketcher/issues/5740
   * Description: Establishing connection between ambiguous phosphate and sugar works wrong
   * Scenario:
   * 1. Open the app in macromolecules -> Flex mode
   * 2. Copy the following HELM: RNA1{R(A)([bnn],[bP])}|RNA2{R(A)([bnn],[bP])}$$$$V2.0
   * 3. Try to connect ambiguous phosphate with sugar using center to center way or ph(R2) to center way or sg(R1) to center way
   * Expected result: Attachment points are shown, Select Connection point dialog doesn't appear
   * Version 3.16.0
   */
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(A)([bnn],[bP])}|RNA2{R(A)([bnn],[bP])}$$$$V2.0',
  );
  await CommonLeftToolbar(page).bondTool(MacroBondTool.Single);
  await getMonomerLocator(page, {
    monomerType: MonomerType.Phosphate,
  })
    .first()
    .hover({ force: true });
  await page.mouse.down();
  await getMonomerLocator(page, { monomerType: MonomerType.Sugar })
    .nth(1)
    .hover({ force: true });
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
   * Expected result: System paste monomer in expanded state
   * Version 3.16.0
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
   * Expected result: Antisense chain created. Phosphate in anti-sence chain should be natural P
   * Version 3.16.0
   */

  const pageErrors = collectPageErrors(page);
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

  const relevantErrors = pageErrors.errors.filter((message) =>
    message.includes('Cannot read properties of undefined'),
  );
  expect(relevantErrors).toEqual([]);
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
   * Expected result: Create Antisense Strand option is present and works correct (antisense creation is possible)
   * Version 3.16.0
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
   * Expected result: Antisense chain created but with no monomers created for ambiguous monomer in antisence chain
   * Version 3.16.0
   */

  const pageErrors = collectPageErrors(page);
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

  const relevantErrors = pageErrors.errors.filter((message) =>
    message.includes('Cannot read properties of undefined'),
  );
  expect(relevantErrors).toEqual([]);
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
   * Expected result: Phosphate in antisense chain copied as it is P if it belongs to nucleotide
   * Version 3.16.0
   */

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{[RSpabC](A)[Ssp]}$$$$V2.0',
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
   * Expected result: Create Antisense Strand option is disabled
   * Version 3.16.0
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

test("Case 12.1: Export to Sequence (3-letter code) and export to IDT doesn't throws an error if user tries to save micromolecule structures (Sequence)", async ({
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
   * Expected result: System shown error message: Convert error! Error during sequence type recognition(RNA, DNA or Peptide)
   * Version 3.16.0
   */
  await openFileAndAddToCanvas(
    page,
    'KET/Micro-Macro-Switcher/All 16 types of bonds.ket',
  );
  await CommonTopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).chooseFileFormat(
    MacromoleculesFileFormatType.Sequence3LetterCode,
  );
  await expect(ErrorMessageDialog(page).errorMessageBody).toContainText(
    `Convert error! Sequence saver: Can't save micro-molecules to sequence format`,
  );
});

test("Case 12.2: Export to Sequence (3-letter code) and export to IDT doesn't throws an error if user tries to save micromolecule structures (IDT)", async ({
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
   * Expected result: System shown error message: Convert error! Error during sequence type recognition(RNA, DNA or Peptide)
   * Version 3.16.0
   */
  await openFileAndAddToCanvas(
    page,
    'KET/Micro-Macro-Switcher/All 16 types of bonds.ket',
  );
  await CommonTopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).chooseFileFormat(
    MacromoleculesFileFormatType.IDT,
  );
  await expect(ErrorMessageDialog(page).errorMessageBody).toContainText(
    `Convert error! Error during sequence type recognition(RNA, DNA or Peptide)`,
  );
});

test('Case 13: Undo of delete of micromolecule connected to monomer creates understructable separate atom', async ({
  FlexCanvas: _,
}) => {
  /**
   * Test task: https://github.com/epam/ketcher/issues/10502
   * Bug: https://github.com/epam/ketcher/issues/6377
   * Description: Undo of delete of micromolecule connected to monomer creates understructable separate atom
   * Scenario:
   * 1. Go to Macro - Flex
   * 2. Load from file: Undo of delete of micromolecule connected to monomer creates undescructable separate atom.zip
   * 3. Select molecule and bond and delete it
   * 4. Press Undo button
   * Expected result: System recovers molecule and bond
   * Version 3.16.0
   */
  await openFileAndAddToCanvas(
    page,
    'KET/Chromium-popup/Bugs/ketcher-3.16.0-bugs/Undo of delete of micromolecule connected to monomer creates undescructable separate atom.ket',
  );
  const carbonAtoms = getAtomLocator(page, { atomLabel: 'C' });
  await expect(carbonAtoms).toHaveCount(6);
  await selectRectangleArea(page, 630, 540, 400, 300); //structure is selected by coordinates since selecting atoms and bonds leaves hidden atoms on canvas - should be changed if possible
  await takeEditorScreenshot(page);
  await deleteByKeyboard(page);
  await expect(carbonAtoms).toHaveCount(0);
  await CommonTopLeftToolbar(page).undo();
  await expect(carbonAtoms).toHaveCount(6);
});
