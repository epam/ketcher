/* eslint-disable no-magic-numbers */
import { test, expect, Page } from '@playwright/test';
import {
  selectSingleBondTool,
  waitForPageInit,
  takeEditorScreenshot,
  addSingleMonomerToCanvas,
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvasMacro,
  pressButton,
  selectTopPanelButton,
  TopPanelButton,
  getKet,
  saveToFile,
  receiveFileComparisonData,
  openFileAndAddToCanvasAsNewProject,
  getMolfile,
  getSequence,
  openFile,
  selectOptionInTypeDropdown,
  getFasta,
  getIdt,
  openFileAndAddToCanvasAsNewProjectMacro,
} from '@utils';
import {
  hideMonomerPreview,
  turnOnMacromoleculesEditor,
} from '@utils/macromolecules';
import { connectMonomersWithBonds } from '@utils/macromolecules/monomer';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { Chems, Peptides } from '@utils/selectors/macromoleculeEditor';

async function verifyFile(
  page: Page,
  filename: string,
  expectedFilename: string,
) {
  const expectedFile = await getKet(page);
  await saveToFile(filename, expectedFile);

  const { fileExpected: ketFileExpected, file: ketFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: expectedFilename,
    });

  expect(ketFile).toEqual(ketFileExpected);
  await openFileAndAddToCanvasAsNewProject(filename, page);
}

async function saveAndCompareMolfile(
  page: Page,
  saveFilePath: string,
  expectedFilePath: string,
  metaDataIndexes: number[],
  fileFormat: 'v3000',
) {
  const expectedFile = await getMolfile(page, fileFormat);
  await saveToFile(saveFilePath, expectedFile);

  const { fileExpected: molFileExpected, file: molFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: expectedFilePath,
      metaDataIndexes,
      fileFormat,
    });

  expect(molFile).toEqual(molFileExpected);

  await openFileAndAddToCanvasAsNewProject(saveFilePath, page);
}

test.describe('Polymer Bond Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Create bond between two peptides', async ({ page }) => {
    /* 
    Test case: #2334 - Create peptide chain (HELM style) - Center-to-Center
    Description: Polymer bond tool
    */
    // Choose peptide
    const MONOMER_NAME = Peptides.Tza;
    const MONOMER_ALIAS = 'Tza';

    const peptide1 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      300,
      300,
      0,
    );
    const peptide2 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      400,
      400,
      1,
    );
    const peptide3 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      500,
      500,
      2,
    );
    const peptide4 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      500,
      200,
      3,
    );

    // Select bond tool
    await selectSingleBondTool(page);

    await takeEditorScreenshot(page);

    // Create bonds between peptides, taking screenshots in middle states
    await bondTwoMonomers(page, peptide1, peptide2);

    await takeEditorScreenshot(page);

    await bondTwoMonomers(page, peptide2, peptide3);

    await bondTwoMonomers(page, peptide4, peptide3);
  });

  test('Create bond between two chems', async ({ page }) => {
    /* 
    Test case: #2497 - Adding chems to canvas - Center-to-Center
    Description: Polymer bond tool
    */
    // Choose chems
    await page.getByText('CHEM').click();
    await page.getByTestId(Chems.hxy).click();

    // Create 2 chems on canvas
    await page.mouse.click(300, 300);
    await page.mouse.click(400, 400);

    // Get 2 chems locators
    const chems = await page.getByText('hxy').locator('..');
    const chem1 = chems.nth(0);
    const chem2 = chems.nth(1);

    // Select bond tool
    await selectSingleBondTool(page);

    // Create bonds between chems, taking screenshots in middle states
    await chem1.hover();
    await page.mouse.down();
    await hideMonomerPreview(page);

    await takeEditorScreenshot(page);
    await chem2.hover();
    await page.mouse.up();
    await hideMonomerPreview(page);
  });
});

test.describe('Signle Bond Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });
  test('Select monomers and pass a bond', async ({ page }) => {
    /* 
      Test case: Macro: #3385 - Overlapping of bonds between 2 monomers
      https://github.com/epam/ketcher/issues/3385 
      Description: The system shall unable user to create more
      than 1 bond between the first and the second monomer
      */
    const MONOMER_NAME = Peptides.Tza;
    const MONOMER_ALIAS = 'Tza';
    const peptide1 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      300,
      300,
      0,
    );
    const peptide2 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      400,
      400,
      1,
    );
    await selectSingleBondTool(page);
    await bondTwoMonomers(page, peptide1, peptide2);
    await bondTwoMonomers(page, peptide2, peptide1);
    await page.waitForSelector('#error-tooltip');
    const errorTooltip = await page.getByTestId('error-tooltip').innerText();
    const errorMessage =
      "There can't be more than 1 bond between the first and the second monomer";
    expect(errorTooltip).toEqual(errorMessage);
  });

  test('Check in full-screen mode it is possible to add a bond between a Peptide monomers if this bond is pulled not from a specific attachment point R', async ({
    page,
  }) => {
    /* 
    Test case: https://github.com/epam/ketcher/issues/4149
    Description: In full-screen mode it is possible to add a bond between 
    a Peptide monomers if this bond is pulled not from a specific attachment point R (connect it from center to center).
    */
    const x = 800;
    const y = 350;
    await page.locator('.css-1kbfai8').click();
    await page.getByTestId(Peptides.BetaAlanine).click();
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId(Peptides.Ethylthiocysteine).click();
    await page.mouse.click(x, y);
    await connectMonomersWithBonds(page, ['Bal', 'Edc']);
    await takeEditorScreenshot(page);
  });

  test('Check in full-screen mode it is possible to add a bond between a RNA monomers if this bond is pulled not from a specific attachment point R', async ({
    page,
  }) => {
    /* 
    Test case: https://github.com/epam/ketcher/issues/4149
    Description: In full-screen mode it is possible to add a bond between 
    a RNA monomers if this bond is pulled not from a specific attachment point R (connect it from center to center).
    */
    const x = 800;
    const y = 350;
    await page.locator('.css-1kbfai8').click();
    await page.getByTestId('RNA-TAB').click();
    await page.getByTestId('MOE(A)P_A_MOE_P').click();
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('dR(U)P_U_dR_P').click();
    await page.mouse.click(x, y);
    await connectMonomersWithBonds(page, ['P', 'dR']);
    await takeEditorScreenshot(page);
  });

  test('Check in full-screen mode it is possible to add a bond between a CHEM monomers if this bond is pulled not from a specific attachment point R', async ({
    page,
  }) => {
    /* 
    Test case: https://github.com/epam/ketcher/issues/4149
    Description: In full-screen mode it is possible to add a bond between 
    a CHEM monomers if this bond is pulled not from a specific attachment point R.
    */
    const x = 800;
    const y = 350;
    await page.locator('.css-1kbfai8').click();
    await page.getByTestId('CHEM-TAB').click();
    await page.getByTestId('A6OH___6-amino-hexanol').click();
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('Test-6-Ch___Test-6-AP-Chem').click();
    await page.mouse.click(x, y);
    await connectMonomersWithBonds(page, ['A6OH', 'Test-6-Ch']);
    await page
      .locator('div')
      .filter({ hasText: /^R2H$/ })
      .getByRole('button')
      .click();
    await page.getByRole('button', { name: 'R1' }).nth(1).click();
    await page.getByRole('button', { name: 'Connect' }).click();
    await takeEditorScreenshot(page);
  });

  test('Verify that the context menu with the "Edit Connection Points..." option appears when the user right-clicks on a bond', async ({
    page,
  }) => {
    /* 
    Test case: #4905
    Description: Context menu with the "Edit Connection Points..." option appears when the user right-clicks on a bond.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]').first();
    await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
    await bondLine.click({ button: 'right' });
    await takeEditorScreenshot(page);
  });

  test('Verify that clicking on the "Edit Connection Points..." option opens the dialog', async ({
    page,
  }) => {
    /* 
    Test case: #4905
    Description: Clicking on the "Edit Connection Points..." option opens the dialog.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]').first();
    await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
    await bondLine.click({ button: 'right' });
    await page.getByText('Edit Connection Points...').click();
    await takeEditorScreenshot(page);
  });

  test('Verify that the user can interact with teal and white attachment points in the dialog', async ({
    page,
  }) => {
    /* 
    Test case: #4905
    Description: User can interact with teal and white attachment points in the dialog.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]').first();
    await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
    await bondLine.click({ button: 'right' });
    await page.getByText('Edit Connection Points...').click();
    await takeEditorScreenshot(page);
    await page.getByRole('button', { name: 'R1' }).first().click();
    await page.getByRole('button', { name: 'R2' }).nth(1).click();
    await takeEditorScreenshot(page);
  });

  test('Verify that if there are no available (white) connection points on both monomers, the "Reconnect" button is disabled', async ({
    page,
  }) => {
    /* 
    Test case: #4905
    Description: If there are no available (white) connection points on both monomers, the "Reconnect" button is disabled.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]').first();
    await openFileAndAddToCanvasMacro('KET/two-connected-bases.ket', page);
    await bondLine.click({ button: 'right' });
    await page.getByText('Edit Connection Points...').click();
    await takeEditorScreenshot(page);
  });

  test('Verify that clicking "Reconnect" with different attachment points chosen results in deletion of the previous bond and establishment of a new one', async ({
    page,
  }) => {
    /* 
    Test case: #4905
    Description: Clicking "Reconnect" with different attachment points chosen results 
    in deletion of the previous bond and establishment of a new one.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]').first();
    await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
    await bondLine.click({ button: 'right' });
    await page.getByText('Edit Connection Points...').click();
    await takeEditorScreenshot(page);
    await page.getByRole('button', { name: 'R1' }).first().click();
    await page.getByRole('button', { name: 'R2' }).nth(1).click();
    await pressButton(page, 'Reconnect');
    await selectSingleBondTool(page);
    await bondLine.hover();
    await takeEditorScreenshot(page);
  });

  test('Verify that clicking "Reconnect" without changing the attachment points results in no change', async ({
    page,
  }) => {
    /* 
    Test case: #4905
    Description: Clicking "Reconnect" without changing the attachment points results in no change.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]').first();
    await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
    await bondLine.click({ button: 'right' });
    await page.getByText('Edit Connection Points...').click();
    await pressButton(page, 'Reconnect');
    await selectSingleBondTool(page);
    await bondLine.hover();
    await takeEditorScreenshot(page);
  });

  test('Verify that clicking "Cancel" in the dialog results in no change to the bond', async ({
    page,
  }) => {
    /* 
    Test case: #4905
    Description: Clicking "Cancel" in the dialog results in no change to the bond.
    Test working not a proper way because we have a bug https://github.com/epam/ketcher/issues/5209
    After fix we should update snapshots.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]').first();
    await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
    await bondLine.click({ button: 'right' });
    await page.getByText('Edit Connection Points...').click();
    await page.getByRole('button', { name: 'R1' }).first().click();
    await page.getByRole('button', { name: 'R2' }).nth(1).click();
    await takeEditorScreenshot(page);
    await pressButton(page, 'Cancel');
    await selectSingleBondTool(page);
    await bondLine.hover();
    await takeEditorScreenshot(page);
  });

  test('Verify that closing the dialog without clicking "Reconnect" or "Cancel" does not save any changes (click on cross)', async ({
    page,
  }) => {
    /* 
    Test case: #4905
    Description: Closing the dialog without clicking "Reconnect" or "Cancel" does not save any changes (click on cross).
    Test working not a proper way because we have a bug https://github.com/epam/ketcher/issues/5209
    After fix we should update snapshots.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]').first();
    await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
    await bondLine.click({ button: 'right' });
    await page.getByText('Edit Connection Points...').click();
    await page.getByRole('button', { name: 'R1' }).first().click();
    await page.getByRole('button', { name: 'R2' }).nth(1).click();
    await takeEditorScreenshot(page);
    await page.getByTitle('Close window').click();
    await selectSingleBondTool(page);
    await bondLine.hover();
    await takeEditorScreenshot(page);
  });

  test('Verify that changes made in the "Edit Connection Points" dialog can be undone and redone', async ({
    page,
  }) => {
    /* 
    Test case: #4905
    Description: Changes made in the "Edit Connection Points" dialog can be undone and redone.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]').first();
    await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
    await bondLine.click({ button: 'right' });
    await page.getByText('Edit Connection Points...').click();
    await page.getByRole('button', { name: 'R1' }).first().click();
    await page.getByRole('button', { name: 'R2' }).nth(1).click();
    await pressButton(page, 'Reconnect');
    await selectSingleBondTool(page);
    await bondLine.hover();
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectSingleBondTool(page);
    await bondLine.hover();
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await selectSingleBondTool(page);
    await bondLine.hover();
    await takeEditorScreenshot(page);
  });

  test('Verify that changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a KET file and can be loaded', async ({
    page,
  }) => {
    /* 
    Test case: #4905
    Description: Changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a KET file and can be loaded.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]').first();
    await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
    await bondLine.click({ button: 'right' });
    await page.getByText('Edit Connection Points...').click();
    await page.getByRole('button', { name: 'R1' }).first().click();
    await page.getByRole('button', { name: 'R2' }).nth(1).click();
    await pressButton(page, 'Reconnect');
    await verifyFile(
      page,
      'KET/two-peptides-connected-expected.ket',
      'tests/test-data/KET/two-peptides-connected-expected.ket',
    );
    await selectSingleBondTool(page);
    await bondLine.hover();
    await takeEditorScreenshot(page);
  });

  test('Verify that changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a Mol V3000 file and can be loaded', async ({
    page,
  }) => {
    /* 
    Test case: #4905
    Description: Changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a Mol V3000 file and can be loaded.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]').first();
    await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
    await bondLine.click({ button: 'right' });
    await page.getByText('Edit Connection Points...').click();
    await page.getByRole('button', { name: 'R1' }).first().click();
    await page.getByRole('button', { name: 'R2' }).nth(1).click();
    await pressButton(page, 'Reconnect');

    await saveAndCompareMolfile(
      page,
      'Molfiles-V3000/two-peptides-connected-expected.mol',
      'tests/test-data/Molfiles-V3000/two-peptides-connected-expected.mol',
      [1],
      'v3000',
    );

    await selectSingleBondTool(page);
    await bondLine.hover();
    await takeEditorScreenshot(page);
  });

  test('Verify that changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a Sequence file and can be loaded', async ({
    page,
  }) => {
    /* 
    Test case: #4905
    Description: Changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a Sequence file and can be loaded.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]').first();
    await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
    await bondLine.click({ button: 'right' });
    await page.getByText('Edit Connection Points...').click();
    await page.getByRole('button', { name: 'R1' }).first().click();
    await page.getByRole('button', { name: 'R2' }).nth(1).click();
    await pressButton(page, 'Reconnect');
    const expectedFile = await getSequence(page);
    await saveToFile(
      'Sequence/two-peptides-connected-expected.seq',
      expectedFile,
    );
    const METADATA_STRING_INDEX = [1];
    const { fileExpected: sequenceFileExpected, file: sequenceFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Sequence/two-peptides-connected-expected.seq',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(sequenceFile).toEqual(sequenceFileExpected);

    await openFileAndAddToCanvasAsNewProjectMacro(
      'Sequence/two-peptides-connected-expected.seq',
      page,
      'Peptide',
    );

    // await selectTopPanelButton(TopPanelButton.Open, page);
    // await openFile('Sequence/two-peptides-connected-expected.seq', page);
    // await selectOptionInTypeDropdown('Peptide', page);
    // await pressButton(page, 'Open as New');
    await selectSingleBondTool(page);
    await bondLine.hover();
    await takeEditorScreenshot(page);
  });

  test('Verify that changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a FASTA file and can be loaded', async ({
    page,
  }) => {
    /* 
    Test case: #4905
    Description: Changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a FASTA file and can be loaded.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]').first();
    await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
    await bondLine.click({ button: 'right' });
    await page.getByText('Edit Connection Points...').click();
    await page.getByRole('button', { name: 'R1' }).first().click();
    await page.getByRole('button', { name: 'R2' }).nth(1).click();
    await pressButton(page, 'Reconnect');
    const expectedFile = await getFasta(page);
    await saveToFile(
      'FASTA/two-peptides-connected-expected.fasta',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: fastaFileExpected, file: fastaFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/FASTA/two-peptides-connected-expected.fasta',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(fastaFile).toEqual(fastaFileExpected);
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('FASTA/two-peptides-connected-expected.fasta', page);
    await selectOptionInTypeDropdown('Peptide', page);
    await pressButton(page, 'Open as New');
    await selectSingleBondTool(page);
    await bondLine.hover();
    await takeEditorScreenshot(page);
  });

  test('Verify that changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a IDT file and can be loaded', async ({
    page,
  }) => {
    /* 
    Test case: #4905
    Description: Changes made in the "Edit Connection Points" dialog are saved when the structure is saved to a IDT file and can be loaded.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]').nth(1);
    await page.getByTestId('RNA-TAB').click();
    await page.getByTestId('MOE(A)P_A_MOE_P').click();
    await clickInTheMiddleOfTheScreen(page);
    await bondLine.click({ button: 'right' });
    await page.getByText('Edit Connection Points...').click();
    await page.getByRole('button', { name: 'R1' }).first().click();
    await page.getByRole('button', { name: 'R2' }).nth(1).click();
    await pressButton(page, 'Reconnect');
    const expectedFile = await getIdt(page);
    await saveToFile('IDT/moe-idt-expected.idt', expectedFile);

    const METADATA_STRING_INDEX = [1];

    const { fileExpected: idtFileExpected, file: idtFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName: 'tests/test-data/IDT/moe-idt-expected.idt',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(idtFile).toEqual(idtFileExpected);
    await openFileAndAddToCanvasAsNewProject('IDT/moe-idt-expected.idt', page);
    await selectSingleBondTool(page);
    await bondLine.hover();
    await takeEditorScreenshot(page);
  });

  test('Verify changing connection points of a side chain bond', async ({
    page,
  }) => {
    /* 
    Test case: #4905
    Description: Side chain bond reconnected.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]').first();
    await openFileAndAddToCanvasMacro('KET/side-chain-peptide-chem.ket', page);
    await bondLine.click({ button: 'right' });
    await page.getByText('Edit Connection Points...').click();
    await page.getByRole('button', { name: 'R1' }).first().click();
    await page.getByRole('button', { name: 'R1' }).nth(1).click();
    await pressButton(page, 'Reconnect');
    await selectSingleBondTool(page);
    await bondLine.hover();
    await takeEditorScreenshot(page);
  });

  test('Verify editing of a cyclic structure', async ({ page }) => {
    /* 
    Test case: #4905
    Description: Cyclic chain bond reconnected.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]').nth(2);
    await openFileAndAddToCanvasMacro('KET/cyclic-three-chems-chain.ket', page);
    await bondLine.click({ button: 'right' });
    await page.getByText('Edit Connection Points...').click();
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
    await selectSingleBondTool(page);
    await bondLine.hover();
    await takeEditorScreenshot(page);
  });

  test('Verify correct display and changing of connection points in the dialog for Nucleotides', async ({
    page,
  }) => {
    /* 
    Test case: #4905
    Description: Nucleotides chain bond reconnected.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]').first();
    await openFileAndAddToCanvasMacro(
      'KET/two-nucleotides-connected.ket',
      page,
    );
    await bondLine.click({ button: 'right' });
    await page.getByText('Edit Connection Points...').click();
    await page.getByRole('button', { name: 'R1' }).first().click();
    await page.getByRole('button', { name: 'R2' }).nth(1).click();
    await pressButton(page, 'Reconnect');
    await selectSingleBondTool(page);
    await bondLine.hover();
    await takeEditorScreenshot(page);
  });

  test('Verify behaviour when a non-bond is right-clicked', async ({
    page,
  }) => {
    /* 
    Test case: #4905
    Description: Nothing happen.
    */
    await openFileAndAddToCanvasMacro('KET/two-peptides-connected.ket', page);
    await page.mouse.click(200, 200, { button: 'right' });
    await takeEditorScreenshot(page);
    await page
      .getByText('Phe4Me')
      .locator('..')
      .first()
      .click({ button: 'right' });
    await takeEditorScreenshot(page);
  });
});
