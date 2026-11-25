import { test, expect, Page } from '@fixtures';
import {
  openFileAndAddToCanvasAsNewProject,
  takeEditorScreenshot,
  moveMouseAway,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  cutToClipboardByKeyboard,
  pasteFromClipboardAndAddToCanvas,
  MolFileFormat,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import {
  BondType,
  BondStereo,
  getBondLocator,
} from '@utils/macromolecules/polymerBond';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { MacromoleculesFileFormatType } from '@tests/pages/constants/fileFormats/macroFileFormats';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { MacroBondTool } from '@tests/pages/constants/bondSelectionTool/Constants';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { Library } from '@tests/pages/macromolecules/Library';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { drawBenzeneRing } from '@tests/pages/molecules/BottomToolbar';

let page: Page;

test.beforeAll(async ({ initFlexCanvas }) => {
  page = await initFlexCanvas();
});

test.afterAll(async ({ closePage }) => {
  await closePage();
});

test.beforeEach(async ({ FlexCanvas: _ }) => {});

test.describe('5359 - Display molecules in macro mode: basic structures with atoms and bonds', () => {
  test('Case 1 - Verify that all types of bonds (single, double, triple) are correctly displayed in macro mode', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that all types of bonds (single, double, triple) are correctly displayed in macro mode
     * Scenario:
     * 1. Load a KET file with molecules containing single, double, and triple bonds in macro mode
     * 2. Take a screenshot to verify correct display of all bond types
     *
     * Version 2.26.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Micro-Macro-Switcher/All Bonds on Macro.ket',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 2 - Verify that carbon atoms are not displayed in macro mode, but hydrogen atoms are displayed with a subscript showing valence', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that carbon atoms are not displayed in macro mode, but hydrogen atoms
     *              are displayed with a subscript showing valence
     * Scenario:
     * 1. Add a simple organic molecule (ethane) in Molecules mode
     * 2. Switch to Macromolecules mode
     * 3. Take a screenshot to verify that C atoms have no label but terminal H groups are shown with subscripts
     *
     * Version 2.26.0
     */
    await pasteFromClipboardAndAddToCanvas(page, 'CC');
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor(
      LayoutMode.Flex,
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 3 - Verify that hydrogen labels appear correctly before or after the atom label when valence exceeds the number of connections in macro mode', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that hydrogen labels appear correctly before or after the atom label
     *              when valence exceeds the number of connections in macro mode
     * Scenario:
     * 1. Add a molecule with heteroatoms (N, O) carrying implicit H atoms in Molecules mode
     * 2. Switch to Macromolecules mode
     * 3. Take a screenshot to verify that H labels appear in the correct orientation
     *
     * Version 2.26.0
     */
    await pasteFromClipboardAndAddToCanvas(page, 'NCC');
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor(
      LayoutMode.Flex,
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 4 - Verify that connection points between monomers and molecules can be created by drawing bonds in macro mode', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that connection points between monomers and molecules can be created
     *              by drawing bonds in macro mode
     * Scenario:
     * 1. Add a benzene ring in Molecules mode
     * 2. Switch to Macromolecules mode
     * 3. Add a peptide monomer from the library
     * 4. Select the MacroBond tool (single bond)
     * 5. Draw a bond from an atom of the benzene molecule to the peptide monomer
     * 6. Take a screenshot to verify the connection was created
     *
     * Version 2.26.0
     */
    await drawBenzeneRing(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor(
      LayoutMode.Flex,
    );
    await Library(page).dragMonomerOnCanvas(Peptide.Tza, { x: 500, y: 300 });
    await CommonLeftToolbar(page).bondTool(MacroBondTool.Single);
    const benzeneAtom = getAtomLocator(page, {}).first();
    const peptideMonomer = getMonomerLocator(page, Peptide.Tza);
    await benzeneAtom.hover({ force: true });
    await page.mouse.down();
    await peptideMonomer.hover({ force: true });
    await page.mouse.up();
    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
  });

  test('Case 5 - Verify that bond lines between atoms do not overlap in any angle in macro mode', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that bond lines between atoms do not overlap in any angle in macro mode
     * Scenario:
     * 1. Load a KET file with molecules at various bond angles in macro mode
     * 2. Take a screenshot to verify bonds do not overlap at any angle
     *
     * Version 2.26.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Micro-Macro-Switcher/Micro bonds on macro canvas.ket',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });

    test.fixme(
      true,
      'Bond line overlap issue: https://github.com/epam/ketcher/issues/5961',
    );
  });

  test('Case 6 - Verify that connections between monomers and molecules are maintained correctly in both micro and macro modes', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that connections between monomers and molecules are maintained correctly
     *              in both micro and macro modes
     * Scenario:
     * 1. Load a KET file with monomers connected to micro-molecules in macro mode
     * 2. Take a screenshot at macro mode
     * 3. Switch to Micromolecules mode
     * 4. Take a screenshot to verify connections are maintained
     *
     * Version 2.26.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Micro-Macro-Switcher/All type of monomers connected to micro.ket',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  });

  test('Case 7 - Verify that switching between micro and macro modes displays molecules without structural changes', async ({
    MoleculesCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that switching between micro and macro modes displays molecules without structural changes
     * Scenario:
     * 1. Load a KET file with complex structures in Molecules mode
     * 2. Take a screenshot at micro mode
     * 3. Switch to Macromolecules mode
     * 4. Take a screenshot to verify no structural changes
     *
     * Version 2.26.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Micro-Macro-Switcher/Complicated structures on the canvas.ket',
    );
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor(
      LayoutMode.Flex,
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 8 - Verify that bonds between atoms appear with correct lengths and angles when displayed in macro mode', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that bonds between atoms appear with correct lengths and angles when displayed in macro mode
     * Scenario:
     * 1. Load a KET file with various bond types (single, double, triple) in macro mode
     * 2. Take a screenshot to verify bonds have correct lengths and angles
     *
     * Version 2.26.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Micro-Macro-Switcher/All 16 types of bonds.ket',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 9 - Verify that deleting an atom in macro mode removes it along with all connected bonds without distorting the molecule structure', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that deleting an atom in macro mode removes it along with all connected bonds
     *              without distorting the molecule structure
     * Scenario:
     * 1. Load a KET file with molecules in macro mode
     * 2. Take a screenshot of the initial state
     * 3. Select the Erase tool and click on an atom
     * 4. Take a screenshot to verify the atom and its connected bonds are removed
     *
     * Version 2.26.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Micro-Macro-Switcher/Deleting a bonds in macromolecules mode test.ket',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonLeftToolbar(page).erase();
    await getAtomLocator(page, {}).first().click({ force: true });
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 10 - Verify that deleting a bond in macro mode removes the bond while maintaining the integrity of the surrounding structure', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that deleting a bond in macro mode removes the bond while maintaining
     *              the integrity of the surrounding structure
     * Scenario:
     * 1. Load a KET file with various bond types in macro mode
     * 2. Take a screenshot of the initial state
     * 3. Select the Erase tool and click on the first bond
     * 4. Take a screenshot to verify only the target bond is removed
     *
     * Version 2.26.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Micro-Macro-Switcher/All Bonds on Macro.ket',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonLeftToolbar(page).erase();
    await getBondLocator(page, {
      bondType: BondType.Single,
      bondStereo: BondStereo.None,
    })
      .first()
      .click({ force: true });
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 11 - Verify that the Undo tool restores an atom deleted in macro mode to its original position, along with all connected bonds', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that the Undo tool restores an atom deleted in macro mode to its
     *              original position, along with all connected bonds
     * Scenario:
     * 1. Load a KET file with molecules in macro mode
     * 2. Use the Erase tool to delete an atom
     * 3. Take a screenshot after deletion
     * 4. Use Undo (Ctrl+Z)
     * 5. Take a screenshot to verify the atom and bonds are restored
     *
     * Version 2.26.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Micro-Macro-Switcher/Deleting a bonds in macromolecules mode test.ket',
    );
    await CommonLeftToolbar(page).erase();
    await getAtomLocator(page, {}).first().click({ force: true });
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 12 - Verify that the Redo tool re-applies an atom or bond deletion after an Undo operation in macro mode', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that the Redo tool re-applies an atom or bond deletion after an Undo operation in macro mode
     * Scenario:
     * 1. Load a KET file with molecules in macro mode
     * 2. Use the Erase tool to delete a bond
     * 3. Use Undo to restore the bond
     * 4. Use Redo (Ctrl+Shift+Z) to re-apply the deletion
     * 5. Take a screenshot to verify the bond is deleted again
     *
     * Version 2.26.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Micro-Macro-Switcher/All Bonds on Macro.ket',
    );
    await CommonLeftToolbar(page).erase();
    await getBondLocator(page, {
      bondType: BondType.Double,
      bondStereo: BondStereo.None,
    })
      .first()
      .click({ force: true });
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 13 - Verify that deleting a group of atoms and bonds in macro mode can be undone, and the entire group is restored to its original state', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that deleting a group of atoms and bonds in macro mode can be undone,
     *              and the entire group is restored to its original state
     * Scenario:
     * 1. Load a KET file with molecules in macro mode
     * 2. Take a screenshot of the initial state
     * 3. Select all structures and delete them
     * 4. Take a screenshot of the empty canvas
     * 5. Use Undo to restore the entire group
     * 6. Take a screenshot to verify the group is fully restored
     *
     * Version 2.26.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Micro-Macro-Switcher/All Bonds on Macro.ket',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectAllStructuresOnCanvas(page);
    await CommonLeftToolbar(page).erase();
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 14 - Verify that after Undo, the structure bonds and atoms return to their exact original position without any loss of integrity', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that after Undo, the structure's bonds and atoms return to their exact
     *              original position without any loss of integrity
     * Scenario:
     * 1. Load a KET file with molecules in macro mode
     * 2. Take a screenshot of the initial state
     * 3. Select all structures and delete them as a group
     * 4. Use Undo to restore the entire group in one step
     * 5. Take a screenshot to verify bonds and atoms are in exact original positions
     *
     * Version 2.26.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Micro-Macro-Switcher/Deleting a bonds in macromolecules mode test.ket',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectAllStructuresOnCanvas(page);
    await CommonLeftToolbar(page).erase();
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 15 - Verify that the structure in macro mode can be saved as a .ket file, and all elements including bonds and atoms are correctly restored when re-loaded', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that the structure in macro mode can be saved as a .ket file, and all
     *              elements including bonds and atoms are correctly restored when re-loaded
     * Scenario:
     * 1. Load a KET file with molecules in macro mode
     * 2. Take a screenshot of the initial state
     * 3. Verify export to KET format
     * 4. Load the exported KET file
     * 5. Take a screenshot to verify all atoms and bonds are correctly restored
     *
     * Version 2.26.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Micro-Macro-Switcher/All Bonds on Macro.ket',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
    await verifyFileExport(
      page,
      'KET/Chromium-popup/5359-Display-molecules-in-macro-mode-basic-structures-with-atoms-and-bonds/all-bonds-on-macro-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Chromium-popup/5359-Display-molecules-in-macro-mode-basic-structures-with-atoms-and-bonds/all-bonds-on-macro-expected.ket',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 16 - Verify that the structure in macro mode can be saved as a .mol file, and upon re-loading, all atoms and bonds are correctly displayed', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that the structure in macro mode can be saved as a .mol file, and upon
     *              re-loading, all atoms and bonds are correctly displayed
     * Scenario:
     * 1. Load a KET file with molecules in macro mode
     * 2. Take a screenshot of the initial state
     * 3. Verify export to MOL V3000 format
     * 4. Load the exported MOL file
     * 5. Take a screenshot to verify all atoms and bonds are correctly displayed
     *
     * Version 2.26.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Micro-Macro-Switcher/All Bonds on Macro.ket',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
    await verifyFileExport(
      page,
      'Molfiles-V3000/Chromium-popup/5359-Display-molecules-in-macro-mode-basic-structures-with-atoms-and-bonds/all-bonds-on-macro-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/Chromium-popup/5359-Display-molecules-in-macro-mode-basic-structures-with-atoms-and-bonds/all-bonds-on-macro-expected.mol',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 17 - Verify that the structure in macro mode can be saved as a (Sequence, FASTA, IDT, SVG, HELM) file, and upon re-loading, all atoms and bonds are correctly displayed', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify behavior when saving a small molecule in macro mode to various formats:
     *              Sequence/FASTA/IDT/HELM should show an error (micro-molecules not supported);
     *              SVG should export successfully
     * Scenario:
     * 1. Load a KET file with molecules in macro mode
     * 2. Try saving as Sequence (1-letter code) → verify error
     * 3. Try saving as FASTA → verify error
     * 4. Try saving as IDT → verify error
     * 5. Save as SVG and verify content in save dialog
     * 6. Try saving as HELM → verify error
     *
     * Version 2.26.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Micro-Macro-Switcher/All Bonds on Macro.ket',
    );

    // Sequence (1-letter code) - expect error for micro-molecules
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.Sequence1LetterCode,
    );
    const seqError = await ErrorMessageDialog(page).getErrorMessage();
    expect(seqError).toContain('Convert error!');
    await ErrorMessageDialog(page).close();
    await SaveStructureDialog(page).cancel();

    // FASTA - expect error for micro-molecules
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.FASTA,
    );
    const fastaError = await ErrorMessageDialog(page).getErrorMessage();
    expect(fastaError).toContain('Convert error!');
    await ErrorMessageDialog(page).close();
    await SaveStructureDialog(page).cancel();

    // IDT - expect error for micro-molecules
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.IDT,
    );
    const idtError = await ErrorMessageDialog(page).getErrorMessage();
    expect(idtError).toContain('Convert error!');
    await ErrorMessageDialog(page).close();
    await SaveStructureDialog(page).cancel();

    // SVG - should export successfully
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.SVGDocument,
    );
    const svgContent = await SaveStructureDialog(page).getTextAreaValue();
    expect(svgContent.length).toBeGreaterThan(0);
    await SaveStructureDialog(page).cancel();

    // HELM - expect error for micro-molecules
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.HELM,
    );
    const helmError = await ErrorMessageDialog(page).getErrorMessage();
    expect(helmError).toContain('Convert error!');
    await ErrorMessageDialog(page).close();
    await SaveStructureDialog(page).cancel();
  });

  test('Case 18 - Verify that a selection of atoms and bonds in macro mode can be copied and pasted to a new location on the canvas', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that a selection of atoms and bonds in macro mode can be copied and pasted
     *              to a new location on the canvas
     * Scenario:
     * 1. Load a KET file with molecules in macro mode
     * 2. Select all structures
     * 3. Copy to clipboard (Ctrl+C)
     * 4. Move mouse to a new canvas location
     * 5. Paste from clipboard (Ctrl+V)
     * 6. Take a screenshot to verify the pasted structure at the new location
     *
     * Version 2.26.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Micro-Macro-Switcher/All Bonds on Macro.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await page.mouse.move(700, 400);
    await pasteFromClipboardByKeyboard(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 19 - Verify that after copying a selection in macro mode, pasting it multiple times places the structure correctly at each new location', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that after copying a selection in macro mode, pasting it multiple times
     *              places the structure correctly at each new location
     * Scenario:
     * 1. Load a KET file with molecules in macro mode
     * 2. Select all structures and copy
     * 3. Paste three times at different positions
     * 4. Take a screenshot to verify all pasted structures
     *
     * Version 2.26.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Micro-Macro-Switcher/All Bonds on Macro.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);

    await page.mouse.move(600, 300);
    await pasteFromClipboardByKeyboard(page);
    await page.mouse.move(700, 400);
    await pasteFromClipboardByKeyboard(page);
    await page.mouse.move(500, 500);
    await pasteFromClipboardByKeyboard(page);

    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 20 - Verify that a selection of atoms and bonds in macro mode can be cut and pasted to a new location on the canvas, and the original structure is removed', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that a selection of atoms and bonds in macro mode can be cut and pasted
     *              to a new location on the canvas, and the original structure is removed
     * Scenario:
     * 1. Load a KET file with molecules in macro mode
     * 2. Select all structures
     * 3. Cut to clipboard (Ctrl+X) — verify original is removed
     * 4. Paste to a new location
     * 5. Take a screenshot to verify structure at new location and original removed
     *
     * Version 2.26.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Micro-Macro-Switcher/All Bonds on Macro.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
    await page.mouse.move(640, 360);
    await pasteFromClipboardByKeyboard(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 21 - Verify that after cutting a selection in macro mode, undoing the operation restores the original structure to its initial location', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that after cutting a selection in macro mode, undoing the operation
     *              restores the original structure to its initial location
     * Scenario:
     * 1. Load a KET file with molecules in macro mode
     * 2. Select all and cut to clipboard
     * 3. Use Undo (Ctrl+Z)
     * 4. Take a screenshot to verify the original structure is restored
     *
     * Version 2.26.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Micro-Macro-Switcher/All Bonds on Macro.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 22 - Verify that after pasting a copied or cut structure, undoing the operation removes the newly placed structure', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that after pasting a copied or cut structure, undoing the operation
     *              removes the newly placed structure
     * Scenario:
     * 1. Load a KET file with molecules in macro mode
     * 2. Select all and copy to clipboard
     * 3. Paste at a new location
     * 4. Use Undo — the pasted structure is removed
     * 5. Take a screenshot to verify only the original remains
     *
     * Version 2.26.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Micro-Macro-Switcher/All Bonds on Macro.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await page.mouse.move(700, 400);
    await pasteFromClipboardByKeyboard(page);
    await moveMouseAway(page);
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 23 - Verify that a pasted structure can be reselected and further copied or cut to a new location', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that a pasted structure can be reselected and further copied or cut to
     *              a new location
     * Scenario:
     * 1. Load a KET file with molecules in macro mode
     * 2. Select all and copy
     * 3. Paste at a new location
     * 4. Select the pasted structure
     * 5. Copy and paste it again to yet another location
     * 6. Take a screenshot to verify all copies are present
     *
     * Version 2.26.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Micro-Macro-Switcher/All Bonds on Macro.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await page.mouse.move(700, 300);
    await pasteFromClipboardByKeyboard(page);
    await moveMouseAway(page);

    // Re-select all (original + pasted) and copy again
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await page.mouse.move(640, 500);
    await pasteFromClipboardByKeyboard(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 24 - Verify that using the Ctrl+X (Cut), Ctrl+C (Copy), and Ctrl+V (Paste) shortcuts in macro mode works as expected', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that using the "Ctrl+X" (Cut), "Ctrl+C" (Copy), and "Ctrl+V" (Paste)
     *              shortcuts in macro mode works as expected
     * Scenario:
     * 1. Load a KET file with molecules in macro mode
     * 2. Select all and use Ctrl+C — verify structures remain
     * 3. Use Ctrl+V — verify paste at cursor position
     * 4. Select all again and use Ctrl+X — verify structures removed
     * 5. Use Ctrl+V — verify paste at cursor position
     * 6. Take screenshots at each step
     *
     * Version 2.26.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Micro-Macro-Switcher/All Bonds on Macro.ket',
    );
    // Ctrl+C (copy) — original stays
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await page.mouse.move(700, 400);
    await pasteFromClipboardByKeyboard(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });

    // Ctrl+X (cut) — originals removed, clipboard updated
    await selectAllStructuresOnCanvas(page);
    await cutToClipboardByKeyboard(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });

    // Ctrl+V (paste) — restored from clipboard
    await page.mouse.move(640, 360);
    await pasteFromClipboardByKeyboard(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 25 - Verify that after copying or cutting a selection of atoms and bonds in macro mode, the pasted structure retains the same connections and labels', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that after copying or cutting a selection of atoms and bonds in macro mode,
     *              the pasted structure retains the same connections and labels
     * Scenario:
     * 1. Load a KET file with monomers connected to micro-molecules in macro mode
     * 2. Select all structures
     * 3. Copy to clipboard (Ctrl+C)
     * 4. Paste to a new location (Ctrl+V)
     * 5. Take a screenshot to verify connections and labels are preserved in the pasted copy
     *
     * Version 2.26.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Micro-Macro-Switcher/All type of monomers connected to micro.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await page.mouse.move(700, 400);
    await pasteFromClipboardByKeyboard(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
  });

  test('Case 26 - Verify that copy and paste operations work for circular macromolecular structures without distorting the bonds or atoms', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/5914
     * Description: Verify that copy and paste operations work for circular macromolecular structures
     *              without distorting the bonds or atoms
     * Scenario:
     * 1. Load a KET file with circular monomer chain structures in macro mode
     * 2. Select all structures
     * 3. Copy to clipboard (Ctrl+C)
     * 4. Paste to a new location (Ctrl+V)
     * 5. Take a screenshot to verify circular structure is not distorted after paste
     *
     * Version 2.26.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Micro-Macro-Switcher/All type of monomers cycled.ket',
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await page.mouse.move(700, 500);
    await pasteFromClipboardByKeyboard(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
  });
});
