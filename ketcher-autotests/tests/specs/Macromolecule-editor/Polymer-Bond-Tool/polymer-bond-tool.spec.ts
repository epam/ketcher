/* eslint-disable no-magic-numbers */
import { Chem } from '@constants/monomers/Chem';
import { Peptides } from '@constants/monomers/Peptides';
import { Presets } from '@constants/monomers/Presets';
import { test, expect, Page } from '@playwright/test';
import {
  takeEditorScreenshot,
  addSingleMonomerToCanvas,
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvasMacro,
  pressButton,
  openFileAndAddToCanvasAsNewProject,
  openFileAndAddToCanvasAsNewProjectMacro,
  moveMouseAway,
  clickOnCanvas,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  waitForPageInit,
  MacroFileType,
  MolFileFormat,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';

import {
  connectMonomersWithBonds,
  getMonomerLocator,
  MonomerAttachmentPoint,
  moveMonomer,
} from '@utils/macromolecules/monomer';
import {
  bondTwoMonomers,
  bondTwoMonomersPointToPoint,
  getBondLocator,
} from '@utils/macromolecules/polymerBond';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { waitForMonomerPreview } from '@utils/macromolecules';
import { SequenceMonomerType } from '@tests/pages/constants/monomers/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacroBondOption } from '@tests/pages/constants/contextMenu/Constants';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';

let page: Page;

async function configureInitialState(page: Page) {
  await Library(page).switchToRNATab();
}

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  await waitForPageInit(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await configureInitialState(page);
});

test.afterEach(async () => {
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  // await resetZoomLevelToDefault(page);
  await CommonTopLeftToolbar(page).clearCanvas();
  // await resetZoomLevelToDefault(page);
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

test('Create bond between two peptides', async () => {
  /* 
    Test case: #2334 - Create peptide chain (HELM style) - Center-to-Center
    Description: Polymer bond tool
    */
  // Choose peptide
  await Library(page).switchToPeptidesTab();
  const peptide1 = await addSingleMonomerToCanvas(
    page,
    Peptides.Tza,
    300,
    300,
    0,
  );
  const peptide2 = await addSingleMonomerToCanvas(
    page,
    Peptides.Tza,
    400,
    400,
    1,
  );
  const peptide3 = await addSingleMonomerToCanvas(
    page,
    Peptides.Tza,
    500,
    500,
    2,
  );
  const peptide4 = await addSingleMonomerToCanvas(
    page,
    Peptides.Tza,
    500,
    200,
    3,
  );

  // Select bond tool
  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);

  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });

  // Create bonds between peptides, taking screenshots in middle states
  await bondTwoMonomers(page, peptide1, peptide2);

  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });

  await bondTwoMonomers(page, peptide2, peptide3);

  await bondTwoMonomers(page, peptide4, peptide3);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Create bond between two chems', async () => {
  /* 
    Test case: #2497 - Adding chems to canvas - Center-to-Center
    Description: Polymer bond tool
    */
  // Choose chems
  await Library(page).selectMonomer(Chem.hxy);

  // Create 2 chems on canvas
  await clickOnCanvas(page, 300, 300);
  await moveMouseAway(page);
  await clickOnCanvas(page, 400, 400);

  // Get 2 chems locators
  const chem1 = getMonomerLocator(page, Chem.hxy).first();
  const chem2 = getMonomerLocator(page, Chem.hxy).nth(1);

  // Select bond tool
  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);

  // Create bonds between chems, taking screenshots in middle states
  await chem1.hover();
  await page.mouse.down();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
  await chem2.hover();
  await page.mouse.up();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Select monomers and pass a bond', async () => {
  /* 
      Test case: Macro: #3385 - Overlapping of bonds between 2 monomers
      https://github.com/epam/ketcher/issues/3385 
      Description: The system shall unable user to create more
      than 1 bond between the first and the second monomer
      */

  await Library(page).switchToPeptidesTab();
  const peptide1 = await addSingleMonomerToCanvas(
    page,
    Peptides.Tza,
    300,
    300,
    0,
  );
  const peptide2 = await addSingleMonomerToCanvas(
    page,
    Peptides.Tza,
    400,
    400,
    1,
  );
  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
  await bondTwoMonomers(page, peptide1, peptide2);
  await bondTwoMonomers(page, peptide2, peptide1);
  await page.waitForSelector('#error-tooltip');
  const errorTooltip = await page.getByTestId('error-tooltip').innerText();
  const errorMessage =
    "There can't be more than 1 bond between the first and the second monomer";
  expect(errorTooltip).toEqual(errorMessage);
});

test('Check in full-screen mode it is possible to add a bond between a Peptide monomers if this bond is pulled not from a specific attachment point R', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/4149
    Description: In full-screen mode it is possible to add a bond between 
    a Peptide monomers if this bond is pulled not from a specific attachment point R (connect it from center to center).
    */
  const x = 800;
  const y = 350;
  const fullScreenButton = CommonTopRightToolbar(page).fullScreenButton;
  await fullScreenButton.click();
  await Library(page).selectMonomer(Peptides.bAla);
  await clickInTheMiddleOfTheScreen(page);
  await Library(page).selectMonomer(Peptides.Edc);
  await clickOnCanvas(page, x, y);
  await connectMonomersWithBonds(page, ['bAla', 'Edc']);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Check in full-screen mode it is possible to add a bond between a RNA monomers if this bond is pulled not from a specific attachment point R', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/4149
    Description: In full-screen mode it is possible to add a bond between 
    a RNA monomers if this bond is pulled not from a specific attachment point R (connect it from center to center).
    */
  const x = 800;
  const y = 350;
  const fullScreenButton = CommonTopRightToolbar(page).fullScreenButton;
  await fullScreenButton.click();
  await Library(page).selectMonomer(Presets.MOE_A_P);
  await clickInTheMiddleOfTheScreen(page);
  await Library(page).selectMonomer(Presets.dR_U_P);
  await clickOnCanvas(page, x, y);
  await connectMonomersWithBonds(page, ['P', 'dR']);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Check in full-screen mode it is possible to add a bond between a CHEM monomers if this bond is pulled not from a specific attachment point R', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/4149
    Description: In full-screen mode it is possible to add a bond between 
    a CHEM monomers if this bond is pulled not from a specific attachment point R.
    */
  const x = 800;
  const y = 350;
  const fullScreenButton = CommonTopRightToolbar(page).fullScreenButton;
  await fullScreenButton.click();
  await Library(page).selectMonomer(Chem.A6OH);
  await clickInTheMiddleOfTheScreen(page);
  await Library(page).selectMonomer(Chem.Test_6_Ch);
  await clickOnCanvas(page, x, y);
  await connectMonomersWithBonds(page, ['A6OH', 'Test-6-Ch']);
  await page
    .locator('div')
    .filter({ hasText: /^R2H$/ })
    .getByRole('button')
    .click();
  await page.getByRole('button', { name: 'R1' }).nth(1).click();
  await page.getByRole('button', { name: 'Connect' }).click();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that the context menu with the "Edit Connection Points..." option appears when the user right-clicks on a bond', async () => {
  /* 
    Test case: #4905
    Description: Context menu with the "Edit Connection Points..." option appears when the user right-clicks on a bond.
    */
  const bondLine = getBondLocator(page, {});
  await openFileAndAddToCanvasMacro(page, 'KET/two-peptides-connected.ket');
  await ContextMenu(page, bondLine).open();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that clicking on the "Edit Connection Points..." option opens the dialog', async () => {
  /* 
    Test case: #4905
    Description: Clicking on the "Edit Connection Points..." option opens the dialog.
    */
  const bondLine = getBondLocator(page, {});
  await openFileAndAddToCanvasMacro(page, 'KET/two-peptides-connected.ket');
  await ContextMenu(page, bondLine).click(MacroBondOption.EditConnectionPoints);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that the user can interact with teal and white attachment points in the dialog', async () => {
  /* 
    Test case: #4905
    Description: User can interact with teal and white attachment points in the dialog.
    */
  const bondLine = getBondLocator(page, {});
  await openFileAndAddToCanvasMacro(page, 'KET/two-peptides-connected.ket');
  await ContextMenu(page, bondLine).click(MacroBondOption.EditConnectionPoints);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that if there are no available (white) connection points on both monomers, the "Reconnect" button is disabled', async () => {
  /* 
    Test case: #4905
    Description: If there are no available (white) connection points on both monomers, the "Reconnect" button is disabled.
    */
  const bondLine = getBondLocator(page, {});
  await openFileAndAddToCanvasMacro(page, 'KET/two-connected-bases.ket');
  await ContextMenu(page, bondLine).click(MacroBondOption.EditConnectionPoints);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that clicking "Reconnect" with different attachment points chosen results in deletion of the previous bond and establishment of a new one', async () => {
  /* 
    Test case: #4905
    Description: Clicking "Reconnect" with different attachment points chosen results 
    in deletion of the previous bond and establishment of a new one.
    */
  const bondLine = getBondLocator(page, {});
  await openFileAndAddToCanvasMacro(page, 'KET/two-peptides-connected.ket');
  await ContextMenu(page, bondLine).click(MacroBondOption.EditConnectionPoints);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await pressButton(page, 'Reconnect');
  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
  await bondLine.hover({ force: true });
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that clicking "Reconnect" without changing the attachment points results in no change', async () => {
  /* 
    Test case: #4905
    Description: Clicking "Reconnect" without changing the attachment points results in no change.
    */
  const bondLine = getBondLocator(page, {});
  await openFileAndAddToCanvasMacro(page, 'KET/two-peptides-connected.ket');
  await ContextMenu(page, bondLine).click(MacroBondOption.EditConnectionPoints);
  await pressButton(page, 'Reconnect');
  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
  await bondLine.hover({ force: true });
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that clicking "Cancel" in the dialog results in no change to the bond', async () => {
  /* 
    Test case: #4905
    Description: Clicking "Cancel" in the dialog results in no change to the bond.
    Test working not a proper way because we have a bug https://github.com/epam/ketcher/issues/5209
    After fix we should update snapshots.
    */
  const bondLine = getBondLocator(page, {});
  await openFileAndAddToCanvasMacro(page, 'KET/two-peptides-connected.ket');
  await ContextMenu(page, bondLine).click(MacroBondOption.EditConnectionPoints);
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
  await pressButton(page, 'Cancel');
  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
  await bondLine.hover({ force: true });
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that closing the dialog without clicking "Reconnect" or "Cancel" does not save any changes (click on cross)', async () => {
  /* 
    Test case: #4905
    Description: Closing the dialog without clicking "Reconnect" or "Cancel" does not save any changes (click on cross).
    Test working not a proper way because we have a bug https://github.com/epam/ketcher/issues/5209
    After fix we should update snapshots.
    */
  const bondLine = getBondLocator(page, {});
  await openFileAndAddToCanvasMacro(page, 'KET/two-peptides-connected.ket');
  await ContextMenu(page, bondLine).click(MacroBondOption.EditConnectionPoints);
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
  await page.getByTitle('Close window').click();
  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
  await bondLine.hover({ force: true });
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that changes made in the "Edit Connection Points" dialog can be undone and redone', async () => {
  /* 
    Test case: #4905
    Description: Changes made in the "Edit Connection Points" dialog can be undone and redone.
    */
  const bondLine = getBondLocator(page, {});
  await openFileAndAddToCanvasMacro(page, 'KET/two-peptides-connected.ket');
  await ContextMenu(page, bondLine).click(MacroBondOption.EditConnectionPoints);
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await pressButton(page, 'Reconnect');
  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
  await bondLine.hover({ force: true });
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
  await CommonTopLeftToolbar(page).undo();
  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
  await bondLine.hover({ force: true });
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
  await CommonTopLeftToolbar(page).redo();
  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
  await bondLine.hover({ force: true });
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a KET file and can be loaded', async () => {
  /* 
    Test case: #4905
    Description: Changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a KET file and can be loaded.
    */
  const bondLine = getBondLocator(page, {});
  await openFileAndAddToCanvasMacro(page, 'KET/two-peptides-connected.ket');
  await ContextMenu(page, bondLine).click(MacroBondOption.EditConnectionPoints);
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await pressButton(page, 'Reconnect');
  await verifyFileExport(
    page,
    'KET/two-peptides-connected-expected.ket',
    FileType.KET,
  );
  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
  await bondLine.hover({ force: true });
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Verify that changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a Mol V3000 file and can be loaded', async () => {
  /* 
    Test case: #4905
    Description: Changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a Mol V3000 file and can be loaded.
    */
  const bondLine = getBondLocator(page, {});
  await openFileAndAddToCanvasMacro(page, 'KET/two-peptides-connected.ket');
  await ContextMenu(page, bondLine).click(MacroBondOption.EditConnectionPoints);
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await pressButton(page, 'Reconnect');

  await verifyFileExport(
    page,
    'Molfiles-V3000/two-peptides-connected-expected.mol',
    FileType.MOL,
    MolFileFormat.v3000,
  );

  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
  await bondLine.hover({ force: true });
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a Sequence file and can be loaded', async () => {
  /* 
    Test case: #4905
    Description: Changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a Sequence file and can be loaded.
    */
  const bondLine = getBondLocator(page, {});
  await openFileAndAddToCanvasMacro(page, 'KET/two-peptides-connected.ket');
  await ContextMenu(page, bondLine).click(MacroBondOption.EditConnectionPoints);
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await pressButton(page, 'Reconnect');
  await verifyFileExport(
    page,
    'Sequence/two-peptides-connected-expected.seq',
    FileType.SEQ,
  );
  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'Sequence/two-peptides-connected-expected.seq',
    [MacroFileType.Sequence, SequenceMonomerType.Peptide],
  );

  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
  await bondLine.hover({ force: true });
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a FASTA file and can be loaded', async () => {
  /* 
    Test case: #4905
    Description: Changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a FASTA file and can be loaded.
    */
  const bondLine = getBondLocator(page, {});
  await openFileAndAddToCanvasMacro(page, 'KET/two-peptides-connected.ket');
  await ContextMenu(page, bondLine).click(MacroBondOption.EditConnectionPoints);
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await pressButton(page, 'Reconnect');
  await verifyFileExport(
    page,
    'FASTA/two-peptides-connected-expected.fasta',
    FileType.FASTA,
  );
  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'FASTA/two-peptides-connected-expected.fasta',
    [MacroFileType.FASTA, SequenceMonomerType.Peptide],
  );

  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
  await bondLine.hover({ force: true });
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify that changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a IDT file and can be loaded', async () => {
  /* 
    Test case: #4905
    Description: Changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a IDT file and can be loaded.
    */
  const bondLine = getBondLocator(page, {}).nth(1);
  await Library(page).selectMonomer(Presets.MOE_A_P);
  await clickInTheMiddleOfTheScreen(page);
  await ContextMenu(page, bondLine).click(MacroBondOption.EditConnectionPoints);
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await pressButton(page, 'Reconnect');
  await verifyFileExport(page, 'IDT/moe-idt-expected.idt', FileType.IDT);
  await openFileAndAddToCanvasAsNewProject(page, 'IDT/moe-idt-expected.idt');
  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
  await bondLine.hover({ force: true });
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify changing connection points of a side chain bond', async () => {
  /* 
    Test case: #4905
    Description: Side chain bond reconnected.
    */
  const bondLine = getBondLocator(page, {});
  await openFileAndAddToCanvasMacro(page, 'KET/side-chain-peptide-chem.ket');
  await ContextMenu(page, bondLine).click(MacroBondOption.EditConnectionPoints);
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R1' }).nth(1).click();
  await pressButton(page, 'Reconnect');
  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
  await bondLine.hover({ force: true });
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify editing of a cyclic structure', async () => {
  /* 
    Test case: #4905
    Description: Cyclic chain bond reconnected.
    */
  const bondLine = getBondLocator(page, {}).nth(2);
  await openFileAndAddToCanvasMacro(page, 'KET/cyclic-three-chems-chain.ket');
  await ContextMenu(page, bondLine).click(MacroBondOption.EditConnectionPoints);
  await page
    .locator('div')
    .filter({ hasText: /^R3H$/ })
    .getByRole('button')
    .click();
  await page
    .locator('div')
    .filter({ hasText: /^R3Br$/ })
    .getByRole('button')
    .click();
  await pressButton(page, 'Reconnect');
  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
  await bondLine.hover({ force: true });
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify correct display and changing of connection points in the dialog for Nucleotides', async () => {
  /* 
    Test case: #4905
    Description: Nucleotides chain bond reconnected.
    */
  const bondLine = getBondLocator(page, {});
  await openFileAndAddToCanvasMacro(page, 'KET/two-nucleotides-connected.ket');
  await ContextMenu(page, bondLine).click(MacroBondOption.EditConnectionPoints);
  await page.getByRole('button', { name: 'R1' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await pressButton(page, 'Reconnect');
  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
  await bondLine.hover({ force: true });
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Verify behaviour when a non-bond is right-clicked', async () => {
  /* 
    Test case: #4905
    Description: Call context menu for empty selection.
    */
  await openFileAndAddToCanvasMacro(page, 'KET/two-peptides-connected.ket');
  await ContextMenu(page, { x: 200, y: 200 }).open();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
  await ContextMenu(page, getMonomerLocator(page, Peptides.Phe4Me)).open();
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Edit long bonds connections by Edit attachment point menu', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6167
    Description: Long bond can be edited by Edit Connection Point menu.
    Case:
    1. Load ket file with five peptides
    2. Connect first monomer and fifth monomer by R1 and R3
    3. Right click on Long bond
    4. Click on Edit Connection Points
    5. Click on R3 and R2
    6. Click on Reconnect
    7. Take screenshot
    */
  const firstMonomer = getMonomerLocator(page, Peptides.C);
  const secondMonomer = getMonomerLocator(page, Peptides.dC);
  await openFileAndAddToCanvasMacro(
    page,
    'KET/five-peptides-connected-by-r2-r1.ket',
  );
  await bondTwoMonomersPointToPoint(
    page,
    firstMonomer,
    secondMonomer,
    MonomerAttachmentPoint.R1,
    MonomerAttachmentPoint.R3,
  );
  await ContextMenu(page, { x: 517, y: 364 }).click(
    MacroBondOption.EditConnectionPoints,
  );
  await page.getByRole('button', { name: 'R3' }).first().click();
  await page.getByRole('button', { name: 'R2' }).nth(1).click();
  await takeEditorScreenshot(page);
  await pressButton(page, 'Reconnect');
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

test('Delete long bonds and perform Undo/Redo actions', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6167
    Description: Long bond can be deleted and restored.
    Case:
    1. Load ket file with five peptides
    2. Connect first monomer and fifth monomer by R1 and R3
    3. Delete long bond
    4. Take screenshot
    5. Perform Undo action
    6. Perform Redo action
    7. Take screenshot
    */
  const firstMonomer = getMonomerLocator(page, Peptides.C);
  const secondMonomer = getMonomerLocator(page, Peptides.dC);
  await openFileAndAddToCanvasMacro(
    page,
    'KET/five-peptides-connected-by-r2-r1.ket',
  );
  await bondTwoMonomersPointToPoint(
    page,
    firstMonomer,
    secondMonomer,
    MonomerAttachmentPoint.R1,
    MonomerAttachmentPoint.R3,
  );
  await CommonLeftToolbar(page).selectEraseTool();
  await page.mouse.click(517, 364);
  await takeEditorScreenshot(page, { hideMacromoleculeEditorScrollBars: true });
  await CommonTopLeftToolbar(page).undo();
  await takeEditorScreenshot(page, { hideMacromoleculeEditorScrollBars: true });
  await CommonTopLeftToolbar(page).redo();
  await takeEditorScreenshot(page, { hideMacromoleculeEditorScrollBars: true });
});

test('Delete monomer in structure with long bonds and perform Undo/Redo actions', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6167
    Description: Monomer in structure with long bonds can be deleted and restored.
    Case:
    1. Load ket file with five peptides
    2. Connect first monomer and fifth monomer by R1 and R3
    3. Delete monomer
    4. Take screenshot
    5. Perform Undo action
    6. Perform Redo action
    7. Take screenshot
    */
  const firstMonomer = getMonomerLocator(page, Peptides.C);
  const secondMonomer = getMonomerLocator(page, Peptides.dC);
  await openFileAndAddToCanvasMacro(
    page,
    'KET/five-peptides-connected-by-r2-r1.ket',
  );
  await bondTwoMonomersPointToPoint(
    page,
    firstMonomer,
    secondMonomer,
    MonomerAttachmentPoint.R1,
    MonomerAttachmentPoint.R3,
  );
  await CommonLeftToolbar(page).selectEraseTool();
  await firstMonomer.click();
  await takeEditorScreenshot(page, { hideMacromoleculeEditorScrollBars: true });
  await CommonTopLeftToolbar(page).undo();
  await takeEditorScreenshot(page, { hideMacromoleculeEditorScrollBars: true });
  await CommonTopLeftToolbar(page).redo();
  await takeEditorScreenshot(page, { hideMacromoleculeEditorScrollBars: true });
});

test('Copy structure with long bonds and paste on canvas', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6167
    Description: Structure with long bonds can be copied.
    Case:
    1. Load ket file with five peptides
    2. Copy structure
    3. Paste structure
    4. Take screenshot
    */
  await openFileAndAddToCanvasMacro(
    page,
    'KET/five-peptides-connected-by-r2-r1-expected.ket',
  );
  await takeEditorScreenshot(page);
  await selectAllStructuresOnCanvas(page);
  await copyToClipboardByKeyboard(page);
  await page.mouse.move(300, 300);
  await pasteFromClipboardByKeyboard(page);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

const connectionVariants = [
  { from: MonomerAttachmentPoint.R1, to: MonomerAttachmentPoint.R3 },
  { from: MonomerAttachmentPoint.R3, to: MonomerAttachmentPoint.R2 },
  { from: MonomerAttachmentPoint.R3, to: MonomerAttachmentPoint.R3 },
];

connectionVariants.forEach(({ from, to }) => {
  test(`Verify that an ${from}-${to} connection forms a long bond that appears on top of monomers (modes Flex, Sequence)`, async () => {
    /*
      Test case: https://github.com/epam/ketcher/issues/6167
      Description: Checks that a long bond between two peptides is placed above monomers in both Flex and Sequence modes.
      Steps:
      1. Switch to Flex mode
      2. Load a .ket file with five peptides
      3. Connect first monomer and fifth monomer by the specified R-group pair
      4. Take a screenshot
      5. Switch to Sequence mode
      6. Take another screenshot
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);

    const firstMonomer = getMonomerLocator(page, Peptides.C);
    const secondMonomer = getMonomerLocator(page, Peptides.dC);
    await openFileAndAddToCanvasMacro(
      page,
      'KET/five-peptides-connected-by-r2-r1.ket',
    );
    await moveMouseAway(page);
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      from,
      to,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});

const connectionVariants2 = [
  { from: MonomerAttachmentPoint.R1, to: MonomerAttachmentPoint.R3 },
  { from: MonomerAttachmentPoint.R3, to: MonomerAttachmentPoint.R2 },
  { from: MonomerAttachmentPoint.R3, to: MonomerAttachmentPoint.R3 },
];

connectionVariants2.forEach(({ from, to }) => {
  test(`Verify that an ${from}-${to} connection forms a long bond that appears on top of monomers (modes Snake, Sequence)`, async () => {
    /*
      Test case: https://github.com/epam/ketcher/issues/6167
      Description: Checks that a long bond between two peptides is placed above monomers in both Snake and Sequence modes.
      Steps:
      1. Load a .ket file with five peptides in Snake mode
      2. Connect first monomer and fifth monomer by the specified R-group pair
      3. Take a screenshot
      4. Switch to Sequence mode
      5. Take another screenshot
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    const firstMonomer = getMonomerLocator(page, Peptides.C);
    const secondMonomer = getMonomerLocator(page, Peptides.dC);
    await openFileAndAddToCanvasMacro(
      page,
      'KET/five-peptides-connected-by-r2-r1.ket',
    );
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      from,
      to,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});

test('Save and Open structure with long bonds to/from KET', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6167
    Description: Long bond can be saved and opened to/from KET.
    Case:
    1. Load ket file with five peptides
    2. Connect first monomer and fifth monomer by R1 and R3
    3. Save to KET
    4. Open saved KET
    5. Take screenshot
    */
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  const firstMonomer = getMonomerLocator(page, Peptides.C);
  const secondMonomer = getMonomerLocator(page, Peptides.dC);
  await openFileAndAddToCanvasMacro(
    page,
    'KET/five-peptides-connected-by-r2-r1.ket',
  );
  await bondTwoMonomersPointToPoint(
    page,
    firstMonomer,
    secondMonomer,
    MonomerAttachmentPoint.R1,
    MonomerAttachmentPoint.R3,
  );
  await verifyFileExport(
    page,
    'KET/five-peptides-connected-by-r2-r1-expected.ket',
    FileType.KET,
  );
  await openFileAndAddToCanvasAsNewProject(
    page,
    'KET/five-peptides-connected-by-r2-r1-expected.ket',
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Save and Open structure with long bonds to/from MOL V3000', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6167
    Description: Long bond can be saved and opened to/from KET.
    Case:
    1. Load ket file with five peptides
    2. Connect first monomer and fifth monomer by R1 and R3
    3. Save to MOL V3000
    4. Open saved MOL V3000
    5. Take screenshot
    */
  const firstMonomer = getMonomerLocator(page, Peptides.C);
  const secondMonomer = getMonomerLocator(page, Peptides.dC);
  await openFileAndAddToCanvasMacro(
    page,
    'KET/five-peptides-connected-by-r2-r1.ket',
  );
  await bondTwoMonomersPointToPoint(
    page,
    firstMonomer,
    secondMonomer,
    MonomerAttachmentPoint.R1,
    MonomerAttachmentPoint.R3,
  );
  await verifyFileExport(
    page,
    'Molfiles-V3000/five-peptides-connected-by-r2-r1-expected.mol',
    FileType.MOL,
    MolFileFormat.v3000,
  );
  await openFileAndAddToCanvasAsNewProject(
    page,
    'Molfiles-V3000/five-peptides-connected-by-r2-r1-expected.mol',
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Connection R3-R3 not overlap each other when connected on one structure', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6167
    Description: Connection R3-R3 not overlap each other when connected on one structure.
    Case:
    1. Load ket file with five peptides
    2. Connect first monomer and fifth monomer by R3 and R3
    3. Connect second monomer and fourth monomer by R3 and R3
    4. Take screenshot
    We have a bug https://github.com/epam/ketcher/issues/6459
    After fix we should update snapshot.
    */
  const firstMonomer = getMonomerLocator(page, Peptides.C);
  const secondMonomer = getMonomerLocator(page, Peptides.Hcy);
  const fourthMonomer = getMonomerLocator(page, Peptides.meC);
  const fifthMonomer = getMonomerLocator(page, Peptides.dC);
  await openFileAndAddToCanvasMacro(
    page,
    'KET/five-peptides-connected-by-r2-r1.ket',
  );
  await bondTwoMonomersPointToPoint(
    page,
    firstMonomer,
    fifthMonomer,
    MonomerAttachmentPoint.R3,
    MonomerAttachmentPoint.R3,
  );
  await bondTwoMonomersPointToPoint(
    page,
    secondMonomer,
    fourthMonomer,
    MonomerAttachmentPoint.R3,
    MonomerAttachmentPoint.R3,
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Check the existance of magnetic area for snapping to an angle or closest radial line', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6215
    Description: The existance of magnetic area for snapping to an angle is 15px perpendicular from every one of 
    the 12 radial lines (every 30 degrees) (black lines bellow), or to the closest radial line (if the 15px areas overlap).
    Scenario:
    1. Load ket file with two peptides connected by ordinary bond
    2. Hover over the bond and move it
    3. Take screenshot
    */
  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/two-peptides-connected.ket',
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await getMonomerLocator(page, Peptides.meE).click();
  await page.mouse.down();
  const coords = [
    [600, 350],
    [587, 300],
    [465, 250],
    [410, 280],
    [410, 380],
  ];
  for (let i = 0; i < coords.length; i++) {
    const [x, y] = coords[i];
    await page.mouse.move(x, y);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  }
});

test('Check that magnetic areas (radial rays) exist only for monomers connected by covalent and hydrogen', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6215
    Description: Magnetic areas (radial rays) exist only for monomers connected by covalent and hydrogen.
    Scenario:
    1. Load ket file with two peptides connected by hydrogen bond
    2. Hover over the bond and move it
    3. Take screenshot
    */
  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/two-peptides-connected-by-hydrogen-bond.ket',
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await getMonomerLocator(page, Peptides.meE).click();
  await page.mouse.down();
  const coords = [
    [600, 350],
    [587, 300],
    [465, 250],
    [410, 280],
    [410, 380],
  ];
  for (let i = 0; i < coords.length; i++) {
    const [x, y] = coords[i];
    await page.mouse.move(x, y);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  }
});

test('Check that If the user holds down CRTL (⌘/Command for MacOS) while moving the monomer no snapping should happen', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6215
    Description: If the user holds down CRTL (⌘/Command for MacOS) while moving the monomer no snapping should happen.
    Scenario:
    1. Load ket file with two peptides connected by hydrogen bond
    2. Hover over the bond and move it with pressed CTRL
    3. Take screenshot
    */
  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/two-peptides-connected-by-hydrogen-bond.ket',
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await getMonomerLocator(page, Peptides.meE).click();
  await page.mouse.down();
  await page.keyboard.down('Control');
  const coords = [
    [600, 350],
    [587, 300],
    [465, 250],
    [410, 280],
    [410, 380],
  ];
  for (let i = 0; i < coords.length; i++) {
    const [x, y] = coords[i];
    await page.mouse.move(x, y);
    await takeEditorScreenshot(page);
  }
});

test('Check that for snake mode, snapping should only happen at 4 radial lines (every 90 degrees)', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6215
    Description: For snake mode, snapping only happen at 4 radial lines (every 90 degrees).
    Scenario:
    1. Load ket file in Snake mode with two peptides connected by ordinary bond
    2. Hover over the bond and move it
    3. Take screenshot
    */
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/two-peptides-connected.ket',
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await getMonomerLocator(page, Peptides.meE).click();
  await page.mouse.down();
  const coords = [
    [100, 150],
    [300, 100],
  ];
  for (let i = 0; i < coords.length; i++) {
    const [x, y] = coords[i];
    await page.mouse.move(x, y);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  }
});

test('Check the existance of magnetic area for snapping to an angle or closest radial line when drag monomer in the middle', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6215
    Description: Check the existance of magnetic area for snapping to an angle or closest radial line when drag monomer in the middle.
    Scenario:
    1. Load ket file with three peptides connected by ordinary bond
    2. Hover over the bond and move it
    3. Take screenshot
    */
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/three-monomer-connected-by-bond.ket',
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await getMonomerLocator(page, Peptides.meE).click();
  await page.mouse.down();
  const coords = [
    [520, 350],
    [587, 300],
    [500, 250],
    [410, 280],
    [410, 380],
  ];
  for (let i = 0; i < coords.length; i++) {
    const [x, y] = coords[i];
    await page.mouse.move(x, y);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  }
});

test('(Horizontal snap-to-distance) If a monomer has a connection (horizontal length x) with another monomer', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6317
    Description: (Horizontal snap-to-distance) If a monomer has a connection (horizontal length x) with another monomer 
    (and the vertical distance between their centers is less than 0.75Å) there exists a magnetic area at length x in the other direction, 
    15px away from the y perpendicular line. y should start 0.75Å above the lower monomer center and end 0.75Å bellow the higher monomer center.
    Scenario:
    1. Load ket file with two peptides connected by ordinary bond
    2. Hover over the peptides and move it
    3. Take screenshot
    */
  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/four-monomers-connected.ket',
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await getMonomerLocator(page, Peptides.meE).click();
  await page.mouse.down();
  await page.mouse.move(650, 380);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await page.mouse.up();
  await getMonomerLocator(page, Peptides._2Nal).click();
  await page.mouse.down();
  await page.mouse.move(380, 380);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await page.mouse.up();
  await getMonomerLocator(page, Peptides.Hhs).click();
  await page.mouse.down();
  await page.mouse.move(480, 360);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('(Vertical snap-to-distance) If a monomer has a connection (horizontal length x) with another monomer', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6317
    Description: (Horizontal snap-to-distance) If a monomer has a connection (horizontal length x) with another monomer 
    (and the vertical distance between their centers is less than 0.75Å) there exists a magnetic area at length x in the other direction, 
    15px away from the y perpendicular line. y should start 0.75Å above the lower monomer center and end 0.75Å bellow the higher monomer center.
    Scenario:
    1. Load ket file with two peptides connected by ordinary bond
    2. Hover over the peptides and move it
    3. Take screenshot
    */
  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/four-monomers-connected-vertical.ket',
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await getMonomerLocator(page, Peptides.meE).click();
  await page.mouse.down();
  await page.mouse.move(530, 220);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await page.mouse.up();
  await getMonomerLocator(page, Peptides._2Nal).click();
  await page.mouse.down();
  await page.mouse.move(500, 560);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await page.mouse.up();
  await getMonomerLocator(page, Peptides.Hhs).click();
  await page.mouse.down();
  await page.mouse.move(500, 440);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('(Horizontal snap-to-distance) If a monomer has a connection by hydrogen bonds (horizontal length x) with another monomer', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6317
    Description: (Horizontal snap-to-distance) If a monomer has a connection (horizontal length x) with another monomer 
    (and the vertical distance between their centers is less than 0.75Å) there exists a magnetic area at length x in the other direction, 
    15px away from the y perpendicular line. y should start 0.75Å above the lower monomer center and end 0.75Å bellow the higher monomer center.
    Scenario:
    1. Load ket file with two peptides connected by hydrogen bond
    2. Hover over the peptides and move it
    3. Take screenshot
    */
  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/four-monomers-connected-by-hydrogen-bonds.ket',
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await getMonomerLocator(page, Peptides.meE).click();
  await page.mouse.down();
  await page.mouse.move(635, 370);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await page.mouse.up();
  await getMonomerLocator(page, Peptides._2Nal).click();
  await page.mouse.down();
  await page.mouse.move(420, 370);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await page.mouse.up();
  await getMonomerLocator(page, Peptides.Hhs).click();
  await page.mouse.down();
  await page.mouse.move(485, 395);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('(Vertical snap-to-distance) If a monomer has a connection by hydrogen bonds (horizontal length x) with another monomer', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6317
    Description: (Horizontal snap-to-distance) If a monomer has a connection (horizontal length x) with another monomer 
    (and the vertical distance between their centers is less than 0.75Å) there exists a magnetic area at length x in the other direction, 
    15px away from the y perpendicular line. y should start 0.75Å above the lower monomer center and end 0.75Å bellow the higher monomer center.
    Scenario:
    1. Load ket file with two peptides connected by hydrogen bond
    2. Hover over the peptides and move it
    3. Take screenshot
    */
  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/four-monomers-connected-by-hydrogen-bonds-vertical.ket',
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await getMonomerLocator(page, Peptides.meE).click();
  await page.mouse.down();
  await page.mouse.move(530, 220);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await page.mouse.up();
  await getMonomerLocator(page, Peptides._2Nal).click();
  await page.mouse.down();
  await page.mouse.move(500, 560);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await page.mouse.up();
  await getMonomerLocator(page, Peptides.Hhs).click();
  await page.mouse.down();
  await page.mouse.move(500, 440);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Check that if the user holds down CRTL (⌘/Command for MacOS) while moving the monomer no snapping happen', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6317
    Description: If the user holds down CRTL (⌘/Command for MacOS) while moving the monomer no snapping happen.
    Scenario:
    1. Load ket file with two peptides connected by ordinary bond
    2. Hover over the peptides and move it
    3. Take screenshot
    */
  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/four-monomers-connected.ket',
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await getMonomerLocator(page, Peptides.meE).click();
  await page.mouse.down();
  await page.keyboard.down('Control');
  await page.mouse.move(650, 380);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await page.mouse.up();
  await page.keyboard.up('Control');
  await getMonomerLocator(page, Peptides._2Nal).click();
  await page.mouse.down();
  await page.keyboard.down('Control');
  await page.mouse.move(380, 380);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await page.mouse.up();
  await page.keyboard.up('Control');
  await getMonomerLocator(page, Peptides.Hhs).click();
  await page.mouse.down();
  await page.keyboard.down('Control');
  await page.mouse.move(480, 360);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('(Vertical snap-to-distance) Check that if the user holds down CRTL (⌘/Command for MacOS) while moving the monomer no snapping happen', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6317
    Description: If the user holds down CRTL (⌘/Command for MacOS) while moving the monomer no snapping happen.
    Scenario:
    1. Load ket file with two peptides connected by hydrogen bond
    2. Hover over the peptides and move it
    3. Take screenshot
    */
  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/four-monomers-connected-by-hydrogen-bonds-vertical.ket',
  );
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await getMonomerLocator(page, Peptides.meE).click();
  await page.mouse.down();
  await page.keyboard.down('Control');
  await page.mouse.move(530, 220);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await page.mouse.up();
  await page.keyboard.up('Control');
  await getMonomerLocator(page, Peptides._2Nal).click();
  await page.mouse.down();
  await page.keyboard.down('Control');
  await page.mouse.move(500, 560);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
  await page.mouse.up();
  await page.keyboard.up('Control');
  await getMonomerLocator(page, Peptides.Hhs).click();
  await page.mouse.down();
  await page.keyboard.down('Control');
  await page.mouse.move(500, 440);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('Long bond not turns into a direct bond when moving the second monomer', async () => {
  /* 
    Test case: https://github.com/epam/ketcher/issues/6167
    Description: Long bond not turns into a direct bond when moving the second monomer.
    Case:
    1. Load ket file with five peptides
    2. Connect first monomer and fifth monomer by R1 and R3
    3. Move second monomer up to long bond
    4. Take screenshot
    We have a bug https://github.com/epam/ketcher/issues/6458
    After fix we should update snapshot.
    */
  const firstMonomer = getMonomerLocator(page, Peptides.C);
  const secondMonomer = getMonomerLocator(page, Peptides.Hcy);
  const fifthMonomer = getMonomerLocator(page, Peptides.dC);
  await openFileAndAddToCanvasMacro(
    page,
    'KET/five-peptides-connected-by-r2-r1.ket',
  );
  await bondTwoMonomersPointToPoint(
    page,
    firstMonomer,
    fifthMonomer,
    MonomerAttachmentPoint.R1,
    MonomerAttachmentPoint.R3,
  );
  await moveMonomer(page, secondMonomer, 460, 350);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
  });
});

interface KETPath {
  testDescription: string;
  KETFile: string;
  // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
  shouldFail?: boolean;
  // issueNumber is mandatory if shouldFail === true
  issueNumber?: string;
}

const ambiguousMonomers: KETPath[] = [
  {
    testDescription: '1. Ambiguous CHEM',
    KETFile: 'KET/Ambiguous-monomers-bonds/ketcherCHEM.ket',
  },
  {
    testDescription: '2. Ambiguous CHEM Weighted',
    KETFile: 'KET/Ambiguous-monomers-bonds/ketcherCHEMWeighted.ket',
  },
  {
    testDescription: '3. Ambiguous Sugar',
    KETFile: 'KET/Ambiguous-monomers-bonds/ketcherSugar.ket',
  },
  {
    testDescription: '4. Ambiguous Sugar Weighted',
    KETFile: 'KET/Ambiguous-monomers-bonds/ketcherSugarWeighted.ket',
  },
  {
    testDescription: '5. Ambiguous Base',
    KETFile: 'KET/Ambiguous-monomers-bonds/ketcherBase.ket',
  },
  {
    testDescription: '6. Ambiguous Base Weighted',
    KETFile: 'KET/Ambiguous-monomers-bonds/ketcherBaseWeightedTBD.ket',
  },
  {
    testDescription: '7. Ambiguous Phosphate',
    KETFile: 'KET/Ambiguous-monomers-bonds/ketcherPhosphate.ket',
  },
  {
    testDescription: '8. Ambiguous Phosphate Weighted',
    KETFile: 'KET/Ambiguous-monomers-bonds/ketcherPhosphateWeighted.ket',
  },
  /*
  {
    testDescription: '9. Ambiguous Nucleotide',
    KETFile:'',
  },
  {
    testDescription: '10. Ambiguous Nucleotide Weighted',
    KETFile:'',
  },
  */
  {
    testDescription: '11. Ambiguous Peptide',
    KETFile: 'KET/Ambiguous-monomers-bonds/ketcherPeptide.ket',
  },
  {
    testDescription: '12. Ambiguous Peptide Weighted',
    KETFile: 'KET/Ambiguous-monomers-bonds/ketcherPeptideWeighted.ket',
  },
  /*
  {
    testDescription: '13. Ambiguous Monomer',
    KETFile: '',
  },
  {
    testDescription: '14. Ambiguous Monomer Weighted',
    KETFile: '',
  },
  */
];

test.describe('Verify "Select/Edit Connection Points" dialogues for ambiguous monomers', () => {
  for (const ambiguousMonomer of ambiguousMonomers) {
    test(`${ambiguousMonomer.testDescription}`, async () => {
      /* 
      Test case: #5627
      Description: Verify "Select/Edit Connection Points" dialogues for ambiguous monomers
      Case: 
      1. Load ket file with two pairs of alternatives and mixtures (with wheights and without)
      2. Hover over first connection
      3. Take screenshot 
      4. Hover over second connection
      5. Take screenshot 
      6. Verify all tooltips corresponds to monomer types 
      */
      await openFileAndAddToCanvasMacro(page, ambiguousMonomer.KETFile);
      await moveMouseAway(page);
      const bondLine = getBondLocator(page, {});
      await bondLine.hover({ force: true });
      await waitForMonomerPreview(page);
      await takeEditorScreenshot(page);
      await ContextMenu(page, bondLine).click(
        MacroBondOption.EditConnectionPoints,
      );
      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });
      await pressButton(page, 'Cancel');
    });
  }
});
