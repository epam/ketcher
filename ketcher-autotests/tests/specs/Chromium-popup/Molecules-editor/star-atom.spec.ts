/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { ExtendedTableButton } from '@tests/pages/constants/extendedTableWindow/Constants';
import {
  ExtendedTableDialog,
  selectExtendedTableElement,
} from '@tests/pages/molecules/canvas/ExtendedTableDialog';
import {
  cutToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  selectAllStructuresOnCanvas,
  selectRedoByKeyboard,
  selectUndoByKeyboard,
  takeEditorScreenshot,
  takeElementScreenshot,
} from '@utils/canvas';
import {
  clickOnCanvas,
  clickOnMiddleOfCanvas,
  dragMouseTo,
  moveMouseAway,
  openFileAndAddToCanvasAsNewProject,
  pasteFromClipboardAndOpenAsNewProject,
  waitForRender,
  ZoomInByKeyboard,
  ZoomOutByKeyboard,
} from '@utils/index';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MicroAtomOption } from '@tests/pages/constants/contextMenu/Constants';
import { AtomPropertiesDialog } from '@tests/pages/molecules/canvas/AtomPropertiesDialog';
import { AtomType } from '@tests/pages/constants/atomProperties/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import {
  performHorizontalFlip,
  performVerticalFlip,
} from '@tests/specs/Structure-Creating-&-Editing/Actions-With-Structures/Rotation/utils';

let page: Page;
test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

test('1. Verify that the star atom is added to the special nodes section of the extended table and tooltip text for the star atom reads: Any atom, including hydrogen', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify that the star atom is added to the special nodes section of the extended table
   *              and tooltip text for the star atom reads: "Any atom, including hydrogen."
   * Case:
   *      1. Open Extended table dialog
   *      2. Hover mouse over * star atom in the special nodes section
   *      3. Validate that the tooltip text reads: "Any atom, including hydrogen."
   *
   * Version 3.7
   */
  await RightToolbar(page).extendedTable();
  const starAtomButton = page.getByTestId(ExtendedTableButton.STAR);
  await starAtomButton.hover();
  await expect(starAtomButton).toHaveAttribute(
    'title',
    'Any atom, including hydrogen',
  );
  await ExtendedTableDialog(page).cancel();
});

test('2. Verify the reorganization of the special nodes section of the extended table matches the mockup', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify the reorganization of the special nodes section of the extended table matches the mockup
   * Case:
   *      1. Open Extended table dialog
   *      2. Take a screenshot of the extended table dialog to validate the UX
   *
   * Version 3.7
   */
  await RightToolbar(page).extendedTable();
  await takeElementScreenshot(
    page,
    ExtendedTableDialog(page).extendedTableWindow,
  );
  await ExtendedTableDialog(page).cancel();
});

test('3. Verify the star atom can be added to the canvas using the extended table', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify the star atom can be added to the canvas using the extended table
   * Case:
   *      1. Add star atom to the canvas using the extended table dialog
   *      2. Take a canvas screenshot to validate it is added correctly
   *
   * Version 3.7
   */
  await CommonTopRightToolbar(page).setZoomInputValue('400');
  await selectExtendedTableElement(page, ExtendedTableButton.STAR);
  await clickOnMiddleOfCanvas(page);
  await page.keyboard.press('Escape');
  await moveMouseAway(page);
  await takeEditorScreenshot(page);
});

test('4. Verify the star atom can be added to the canvas using the hotkey (Shift+8)', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify the star atom can be added to the canvas using the hotkey (Shift+8)
   * Case:
   *      1. Add star atom to the canvas using Shift+8 hotkey
   *      2. Take a canvas screenshot to validate it is added correctly
   *
   * Version 3.7
   */
  await CommonTopRightToolbar(page).setZoomInputValue('400');
  await page.keyboard.press('Shift+8');
  await clickOnMiddleOfCanvas(page);
  await page.keyboard.press('Escape');
  await moveMouseAway(page);
  await takeEditorScreenshot(page);
});

test('5. Verify that the existing atom can be replaced with star atom on the canvas by right-click menu', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify that the existing atom can be replaced with star atom on the canvas by right-click menu
   * Case:
   *      1. Put test molecule on the canvas
   *      2. Right-click on the atom and select "Edit" from the context menu
   *      3. In appeared Atom properties dialog change atom type to "Special"
   *      4. Press Edit button (pencil icon)
   *      5. In appeared Extended table dialog select "Star" atom
   *      6. Click "Add" button
   *      7. Take a canvas screenshot to validate the atom is replaced with star atom
   *
   * Version 3.7
   */
  await CommonTopRightToolbar(page).setZoomInputValue('400');
  await pasteFromClipboardAndOpenAsNewProject(page, 'C1C=CC=CN=1');
  const atomToReplace = page
    .getByText('N', { exact: true })
    .locator(':scope:visible')
    .first();
  await ContextMenu(page, atomToReplace).click(MicroAtomOption.Edit);
  await AtomPropertiesDialog(page).selectAtomType(AtomType.Special);
  await AtomPropertiesDialog(page).editLabel();
  await ExtendedTableDialog(page).clickExtendedTableElement(
    ExtendedTableButton.STAR,
  );
  await ExtendedTableDialog(page).add();
  await AtomPropertiesDialog(page).apply();
  await moveMouseAway(page);
  await takeEditorScreenshot(page);
});

test('6. Verify that the existing atom can be replaced with star atom on the canvas by the hotkey (Shift+8)', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify that the existing atom can be replaced with star atom on the canvas by the hotkey (Shift+8)
   * Case:
   *      1. Put test molecule on the canvas
   *      2. Right-click on the atom and select "Edit" from the context menu
   *      3. In appeared Atom properties dialog change atom type to "Special"
   *      4. Press Edit button (pencil icon)
   *      5. In appeared Extended table dialog select "Star" atom
   *      6. Click "Add" button
   *      7. Take a canvas screenshot to validate the atom is replaced with star atom
   *
   * Version 3.7
   */
  await CommonTopRightToolbar(page).setZoomInputValue('400');
  await pasteFromClipboardAndOpenAsNewProject(page, 'C1C=CC=CN=1');
  // Change to getAtomLocator later
  const atomToReplace = page
    .getByText('N', { exact: true })
    .locator(':scope:visible')
    .first();
  await waitForRender(page, async () => {
    await atomToReplace.click();
  });
  await page.keyboard.press('Shift+8');
  await moveMouseAway(page);
  await takeEditorScreenshot(page);
});

test('7. Verify the star atom s behavior during undo/redo actions after adding or removing it from the canvas', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify the star atom's behavior during undo/redo actions after adding or removing it from the canvas
   * Case:
   *      1. Add star atom to the canvas using Shift+8 hotkey
   *      2. Validate that the star atom is present on the canvas
   *      3. Perform undo action and validate that the star atom is removed from the canvas
   *      4. Perform redo action and validate that the star atom is added back to the canvas
   *
   * Version 3.7
   */
  await CommonTopRightToolbar(page).setZoomInputValue('400');
  await page.keyboard.press('Shift+8');
  await clickOnMiddleOfCanvas(page);
  await page.keyboard.press('Escape');
  await moveMouseAway(page);
  // Change to getAtomLocator later
  const starAtom = page
    .getByText('*', { exact: true })
    .locator(':scope:visible')
    .first();
  await expect(starAtom).toHaveCount(1);
  await selectUndoByKeyboard(page);
  await expect(starAtom).toHaveCount(0);
  await selectRedoByKeyboard(page);
  await expect(starAtom).toHaveCount(1);
});

test('8. Verify that the star atom is displayed correctly when zooming in and out on the canvas', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify the star atom's behavior during undo/redo actions after adding or removing it from the canvas
   * Case:
   *      1. Add star atom to the canvas using Shift+8 hotkey
   *      2. Zoom in on the canvas to 400% and take a screenshot
   *      3. Zoom out on the canvas to 150% and take a screenshot
   *
   * Version 3.7
   */
  await page.keyboard.press('Shift+8');
  await clickOnMiddleOfCanvas(page);
  await moveMouseAway(page);
  await page.keyboard.press('Escape');

  await ZoomInByKeyboard(page, { repeat: 11 });
  await takeEditorScreenshot(page);
  await ZoomOutByKeyboard(page, { repeat: 6 });
  await takeEditorScreenshot(page);
});

test('9. Verify the copy-paste functionality for structures containing the star atom', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify the star atom's behavior during undo/redo actions after adding or removing it from the canvas
   * Case:
   *      1. Add star atom to the canvas using Shift+8 hotkey
   *      2. Zoom in on the canvas to 400% and take a screenshot
   *      3. Zoom out on the canvas to 150% and take a screenshot
   *
   * Version 3.7
   */
  await CommonTopRightToolbar(page).setZoomInputValue('400');
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C1=C*=CC=C1 |$;;star_e;;;$|',
  );
  await clickOnMiddleOfCanvas(page);
  await selectAllStructuresOnCanvas(page);
  await cutToClipboardByKeyboard(page);
  await takeEditorScreenshot(page);

  await pasteFromClipboardByKeyboard(page);
  await takeEditorScreenshot(page);
});

test('10. Verify deletion of the star atom from the canvas using the delete option', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify deletion of the star atom from the canvas using the delete option
   * Case:
   *      1. Paste a structure with a star atom from the clipboard and open it as a new project
   *      2. Select Erase tool from the left toolbar and click on the star atom
   *      3. Take screenshot and validate that the star atom is deleted from the canvas
   *
   * Version 3.7
   */
  await CommonTopRightToolbar(page).setZoomInputValue('400');
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C1=C*=CC=C1 |$;;star_e;;;$|',
  );
  await CommonLeftToolbar(page).erase();
  // Change to getAtomLocator later
  const atomToDelete = page
    .getByText('*', { exact: true })
    .locator(':scope:visible')
    .first();
  await atomToDelete.click();
  await takeEditorScreenshot(page);
});

test('11. Verify clear canvas when star atom on canvas and then restore by undo', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify clear canvas when star atom on canvas and then restore by undo
   * Case:
   *      1. Paste a structure with a star atom from the clipboard and open it as a new project
   *      2. Press Clear canvas button
   *      3. Take screenshot and validate that canvas is empty
   *      4. Press Undo button
   *      5. Take screenshot and validate that the star atom is restored on the canvas
   *
   * Version 3.7
   */
  await CommonTopRightToolbar(page).setZoomInputValue('400');
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C1=C*=CC=C1 |$;;star_e;;;$|',
  );
  await CommonTopLeftToolbar(page).clearCanvas();
  await takeEditorScreenshot(page);
  await CommonTopLeftToolbar(page).undo();
  await takeEditorScreenshot(page);
});

test('12. Verify export/import of structures containing the star atom in the KET format', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify export/import of structures containing the star atom in the KET format
   * Case:
   *      1. Paste a structure with a star atom from the clipboard and open it as a new project
   *      2. Validate export to KET file
   *      3. Load exported KET file as a new project
   *      4. Take a screenshot and validate that the star atom is displayed correctly
   *
   * Version 3.7
   */
  await CommonTopRightToolbar(page).setZoomInputValue('400');
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C1=C*=CC=C1 |$;;star_e;;;$|',
  );
  await verifyFileExport(
    page,
    'KET/Star-Atom/Export to ket-expected.ket',
    FileType.KET,
  );
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/Star-Atom/Export to ket-expected.ket',
  );
  await takeEditorScreenshot(page);
});

test('13. Verify export/import of structures containing the star atom in the CDX format', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify export/import of structures containing the star atom in the CDX format
   * Case:
   *      1. Paste a structure with a star atom from the clipboard and open it as a new project
   *      2. Validate export to CDX file
   *      3. Load exported CDX file as a new project
   *      4. Take a screenshot and validate that the star atom is displayed correctly
   *
   * Version 3.7
   */
  await CommonTopRightToolbar(page).setZoomInputValue('400');
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C1=C*=CC=C1 |$;;star_e;;;$|',
  );
  await verifyFileExport(
    page,
    'CDX/Star-Atom/Export to CDX-expected.cdx',
    FileType.CDX,
  );
  await openFileAndAddToCanvasAsNewProject(
    page,
    'CDX/Star-Atom/Export to CDX-expected.cdx',
  );
  await takeEditorScreenshot(page);
});

test('14. Verify export/import of structures containing the star atom in the CDXML format', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify export/import of structures containing the star atom in the CDXML format
   * Case:
   *      1. Paste a structure with a star atom from the clipboard and open it as a new project
   *      2. Validate export to CDXML file
   *      3. Load exported CDXML file as a new project
   *      4. Take a screenshot and validate that the star atom is displayed correctly
   *
   * Version 3.7
   */
  await CommonTopRightToolbar(page).setZoomInputValue('400');
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C1=C*=CC=C1 |$;;star_e;;;$|',
  );
  await verifyFileExport(
    page,
    'CDXML/Star-Atom/Export to CDXML-expected.cdxml',
    FileType.CDXML,
  );
  await openFileAndAddToCanvasAsNewProject(
    page,
    'CDXML/Star-Atom/Export to CDXML-expected.cdxml',
  );
  await takeEditorScreenshot(page);
});

test('15. Verify export/import of structures containing the star atom in the Mol v2000 format', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify export/import of structures containing the star atom in the Mol v2000 format
   * Case:
   *      1. Paste a structure with a star atom from the clipboard and open it as a new project
   *      2. Validate export to Mol v2000 file
   *      3. Load exported Mol v2000 file as a new project
   *      4. Take a screenshot and validate that the star atom is displayed correctly
   *
   * Version 3.7
   */
  await CommonTopRightToolbar(page).setZoomInputValue('400');
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C1=C*=CC=C1 |$;;star_e;;;$|',
  );
  await verifyFileExport(
    page,
    'Molfiles-V2000/Star-Atom/Export to Mol-expected.mol',
    FileType.MOL,
  );
  await openFileAndAddToCanvasAsNewProject(
    page,
    'Molfiles-V2000/Star-Atom/Export to Mol-expected.mol',
  );
  await takeEditorScreenshot(page);
});

test('16. Verify export/import of structures containing the star atom in the Mol v3000 format', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify export/import of structures containing the star atom in the Mol v3000 format
   * Case:
   *      1. Paste a structure with a star atom from the clipboard and open it as a new project
   *      2. Validate export to Mol v3000 file
   *      3. Load exported Mol v3000 file as a new project
   *      4. Take a screenshot and validate that the star atom is displayed correctly
   *
   * Version 3.7
   */
  await CommonTopRightToolbar(page).setZoomInputValue('400');
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C1=C*=CC=C1 |$;;star_e;;;$|',
  );
  await verifyFileExport(
    page,
    'Molfiles-V3000/Star-Atom/Export to Mol-expected.mol',
    FileType.MOL,
  );
  await openFileAndAddToCanvasAsNewProject(
    page,
    'Molfiles-V3000/Star-Atom/Export to Mol-expected.mol',
  );
  await takeEditorScreenshot(page);
});

test('17. Verify export/import of structures containing the star atom in the SMARTS format', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify export/import of structures containing the star atom in the SMARTS format
   * Case:
   *      1. Paste a structure with a star atom from the clipboard and open it as a new project
   *      2. Validate export to SMARTS file
   *      3. Load exported SMARTS file as a new project
   *      4. Take a screenshot and validate that the star atom is displayed correctly
   *
   * Version 3.7
   */
  await CommonTopRightToolbar(page).setZoomInputValue('400');
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C1=C*=CC=C1 |$;;star_e;;;$|',
  );
  await verifyFileExport(
    page,
    'SMARTS/Star-Atom/Export to SMARTS-expected.smarts',
    FileType.SMARTS,
  );
  await openFileAndAddToCanvasAsNewProject(
    page,
    'SMARTS/Star-Atom/Export to SMARTS-expected.smarts',
  );
  await takeEditorScreenshot(page);
});

test('18. Verify export/import of structures containing the star atom in the SMILES format', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify export/import of structures containing the star atom in the SMILES format
   * Case:
   *      1. Paste a structure with a star atom from the clipboard and open it as a new project
   *      2. Validate export to SMILES file
   *      3. Load exported SMILES file as a new project
   *      4. Take a screenshot and validate that the star atom is displayed correctly
   *
   * Version 3.7
   */
  await CommonTopRightToolbar(page).setZoomInputValue('400');
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C1=C*=CC=C1 |$;;star_e;;;$|',
  );
  await verifyFileExport(
    page,
    'SMILES/Star-Atom/Export to SMILES-expected.smi',
    FileType.SMILES,
  );
  await openFileAndAddToCanvasAsNewProject(
    page,
    'SMILES/Star-Atom/Export to SMILES-expected.smi',
  );
  await takeEditorScreenshot(page);
});

test('19. Verify export/import of structures containing the star atom in the Extended SMILES format', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify export/import of structures containing the star atom in the Extended SMILES format
   * Case:
   *      1. Paste a structure with a star atom from the clipboard and open it as a new project
   *      2. Validate export to Extended SMILES file
   *      3. Load exported Extended SMILES file as a new project
   *      4. Take a screenshot and validate that the star atom is displayed correctly
   *
   * Version 3.7
   */
  await CommonTopRightToolbar(page).setZoomInputValue('400');
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C1=C*=CC=C1 |$;;star_e;;;$|',
  );
  await verifyFileExport(
    page,
    'SMILES/Star-Atom/Export to Extended SMILES-expected.cxsmi',
    FileType.ExtendedSMILES,
  );
  await openFileAndAddToCanvasAsNewProject(
    page,
    'SMILES/Star-Atom/Export to Extended SMILES-expected.cxsmi',
  );
  await takeEditorScreenshot(page);
});

test('20. Verify export/import of structures containing the star atom in the PNG format', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify export/import of structures containing the star atom in the PNG format
   * Case:
   *      1. Paste a structure with a star atom from the clipboard and open it as a new project
   *      2. Validate export to PNG file
   *
   * Version 3.7
   */
  await CommonTopRightToolbar(page).setZoomInputValue('400');
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C1=C*=CC=C1 |$;;star_e;;;$|',
  );
  // Commeted out due to the issue with PNG export: https://github.com/epam/Indigo/issues/3079
  // await verifyPNGExport(page);
});

test('21. Verify export/import of structures containing the star atom in the SVG format', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify export/import of structures containing the star atom in the SVG format
   * Case:
   *      1. Paste a structure with a star atom from the clipboard and open it as a new project
   *      2. Validate export to SVG file
   *
   * Version 3.7
   */
  await CommonTopRightToolbar(page).setZoomInputValue('400');
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C1=C*=CC=C1 |$;;star_e;;;$|',
  );
  // Commeted out due to the issue with SVG export: https://github.com/epam/Indigo/issues/3079
  // await verifySVGExport(page);
});

test('22. Verify the star atom remains visible and functional after switching between modes', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify the star atom remains visible and functional after switching between modes
   *              (e.g., molecules mode and macromolecules mode)
   * Case:
   *      1. Paste a structure with a star atom from the clipboard and open it as a new project
   *      2. Switch to macromolecules mode - Sequesnce layout
   *      3. Take a screenshot to validate the star atom is visible
   *      4. Switch to macromolecules mode - Flex layout
   *      5. Take a screenshot to validate the star atom is visible
   *      6. Switch to macromolecules mode - Snake layout
   *      7. Take a screenshot to validate the star atom is visible
   *
   * Version 3.7
   */
  await CommonTopRightToolbar(page).setZoomInputValue('400');
  await pasteFromClipboardAndOpenAsNewProject(page, '* |$star_e$|');
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(
    LayoutMode.Sequence,
  );
  await takeEditorScreenshot(page);
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  await takeEditorScreenshot(page);
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
  await takeEditorScreenshot(page);
});

test('23. Verify the alignment of the star atom with various bond types when connected', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify the alignment of the star atom with various bond types when connected
   *              (e.g., single, double, triple bonds)
   * Case:
   *      1. Load reaction with star atom with various bond types when connected
   *      2. Take a screenshot to validate layout
   *
   * Version 3.7
   */

  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/Star-Atom/LayoutValidation.ket',
  );
  await CommonTopRightToolbar(page).setZoomInputValue('150');
  await takeEditorScreenshot(page);
});

test('24. Verify that the star atom retains its properties when the structure is rotated on the canvas', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify that the star atom retains its properties when the structure is rotated on the canvas
   *              (e.g., single, double, triple bonds)
   * Case:
   *      1. Load reaction with star atom with various bond types when connected
   *      2. Select all structures on the canvas
   *      3. Hover over the rotation handle and drag it to rotate the structure
   *      4. Take a screenshot to validate the star atom's properties are retained after rotation
   *
   * Version 3.7
   */
  const rotationHandle = page.getByTestId('rotation-handle');

  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/Star-Atom/LayoutValidation.ket',
  );
  await CommonTopRightToolbar(page).setZoomInputValue('150');
  await selectAllStructuresOnCanvas(page);
  await rotationHandle.hover();
  await dragMouseTo(720, 300, page);
  await clickOnCanvas(page, 1, 1);
  await takeEditorScreenshot(page);
});

test('25. Verify the behavior of the star atom when the structure is mirrored or flipped horizontally', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify the behavior of the star atom when the structure is mirrored or flipped horizontally
   * Case:
   *      1. Load reaction with star atom with various bond types when connected
   *      2. Select all structures on the canvas
   *      3. Press Alt+h to perform a horizontal flip
   *      4. Take a screenshot to validate the star atom's properties are retained after rotation
   *
   * Version 3.7
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/Star-Atom/LayoutValidation.ket',
  );
  await CommonTopRightToolbar(page).setZoomInputValue('150');
  await selectAllStructuresOnCanvas(page);
  await performHorizontalFlip(page);
  await clickOnCanvas(page, 1, 1);
  await takeEditorScreenshot(page);
});

test('26. Verify the behavior of the star atom when the structure is mirrored or flipped vertically', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5553
   * Description: Verify the behavior of the star atom when the structure is mirrored or flipped vertically
   * Case:
   *      1. Load reaction with star atom with various bond types when connected
   *      2. Select all structures on the canvas
   *      3. Press Alt+v to perform a vertical flip
   *      4. Take a screenshot to validate the star atom's properties are retained after rotation
   *
   * Version 3.7
   */
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/Star-Atom/LayoutValidation.ket',
  );
  await CommonTopRightToolbar(page).setZoomInputValue('150');
  await selectAllStructuresOnCanvas(page);
  await performVerticalFlip(page);
  await clickOnCanvas(page, 1, 1);
  await takeEditorScreenshot(page);
});
