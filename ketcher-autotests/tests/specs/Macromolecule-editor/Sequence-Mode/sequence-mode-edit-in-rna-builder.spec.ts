/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasMacro,
  selectSequenceLayoutModeTool,
  takeRNABuilderScreenshot,
  takeMonomerLibraryScreenshot,
  moveMouseAway,
  takePageScreenshot,
  selectRectangleArea,
  startNewSequence,
  takePresetsScreenshot,
  selectSnakeLayoutModeTool,
  selectMonomer,
  selectMonomers,
} from '@utils';
import { waitForMonomerPreview } from '@utils/macromolecules';
import { SUGAR } from '@constants/testIdConstants';
import {
  modifyInRnaBuilder,
  getSymbolLocator,
} from '@utils/macromolecules/monomer';
import { pressSaveButton } from '@utils/macromolecules/rnaBuilder';
import { Sugars } from '@constants/monomers/Sugars';
import { Phosphates } from '@constants/monomers/Phosphates';
import { Bases } from '@constants/monomers/Bases';
import {
  keyboardPressOnCanvas,
  keyboardTypeOnCanvas,
} from '@utils/keyboard/index';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';

test.describe('Sequence mode edit in RNA Builder', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

    await openFileAndAddToCanvasMacro('KET/nine-connected-rnas.ket', page);
    await selectSequenceLayoutModeTool(page);
  });

  test('Select one nucleotide and modify sugar', async ({ page }) => {
    const symbolT = getSymbolLocator(page, { symbolAlias: 'T' }).first();
    await symbolT.click();
    await modifyInRnaBuilder(page, symbolT);

    // should see uploaded nucleotide data to RNA Builder and disabled "Update" button
    // should see disabled top bar's selectors
    // should see disabled top undo/redo/open buttons
    await moveMouseAway(page);
    await takePageScreenshot(page);
    await page.getByTestId(SUGAR).click();
    // should see disabled and nondisabled sugars
    await takeMonomerLibraryScreenshot(page, {
      hideMonomerPreview: true,
    });
    await selectMonomer(page, Sugars._25R);
    // should see updated sugar, updated title of preset and nondisabled "Update" button
    await takeRNABuilderScreenshot(page, {
      hideMonomerPreview: true,
    });
    await pressSaveButton(page);
    // should see updated nucleotide in chain
    // should see nondisabled top bar's selectors
    // should see nondisabled top undo/redo/open buttons

    await moveMouseAway(page);
    await takePageScreenshot(page);
  });

  test('Select nucleoside and phosphate and modify sugar and phosphate as it one nucleotide', async ({
    page,
  }) => {
    // Coordinates for rectangle selection
    const startX = 300;
    const startY = 100;
    const endX = 400;
    const endY = 200;
    await selectRectangleArea(page, startX, startY, endX, endY);
    const symbolT = getSymbolLocator(page, { symbolAlias: 'T' }).nth(2);
    await modifyInRnaBuilder(page, symbolT);

    // should see uploaded nucleotide (nucleoside + phosphate) data to RNA Builder and disabled "Update" button
    await takeRNABuilderScreenshot(page);
    // Update Sugar and Phosphate
    await selectMonomers(page, [Sugars._25R, Phosphates.bP]);
    // should see updated sugar and phosphate, updated title of preset and nondisabled "Update" button
    await takeRNABuilderScreenshot(page, { hideMonomerPreview: true });
    await pressSaveButton(page);
    await moveMouseAway(page);
    await takePageScreenshot(page);
  });

  test('Select nucleotide, nucleoside and modify sugar and phosphate. nucleoside should become nucleotide', async ({
    page,
  }) => {
    // Coordinates for rectangle selection
    const startX = 280;
    const startY = 100;
    const endX = 320;
    const endY = 200;
    await selectRectangleArea(page, startX, startY, endX, endY);
    const symbolT = getSymbolLocator(page, { symbolAlias: 'T' }).nth(2);
    await modifyInRnaBuilder(page, symbolT);

    // should see uploaded data to RNA Builder and disabled "Update" button
    await takeRNABuilderScreenshot(page);
    // Update Sugar and Phosphate
    await selectMonomers(page, [Sugars._25R, Phosphates.bP]);
    // should see updated sugar and phosphate of preset and nondisabled "Update" button
    await takeRNABuilderScreenshot(page, { hideMonomerPreview: true });
    await pressSaveButton(page);
    // Click 'Yes' in modal
    await page.getByText('Yes').click();
    await takePageScreenshot(page);
  });

  test('Select one nucleotide and cancel modification', async ({ page }) => {
    const symbolT = getSymbolLocator(page, { symbolAlias: 'T' }).first();
    await symbolT.click();
    await modifyInRnaBuilder(page, symbolT);
    await selectMonomer(page, Sugars._25R);
    // should see updated sugar, updated title of preset and nondisabled "Update" button
    await takeRNABuilderScreenshot(page, { hideMonomerPreview: true });
    await page.getByTestId('cancel-btn').click();
    // should see not updated nucleotide in chain
    await takeEditorScreenshot(page);
  });

  test('Select two nucleotides and modify sugar and phosphate', async ({
    page,
  }) => {
    // Coordinates for rectangle selection
    const startX = 100;
    const startY = 100;
    const endX = 200;
    const endY = 200;
    await selectRectangleArea(page, startX, startY, endX, endY);
    await takeEditorScreenshot(page);
    const symbolT = getSymbolLocator(page, { symbolAlias: 'T' }).first();
    await modifyInRnaBuilder(page, symbolT);
    // should see uploaded nucleotides data to RNA Builder and disabled "Update" button
    await takeRNABuilderScreenshot(page);
    await selectMonomers(page, [Sugars._25R, Phosphates.bP]);
    // should see updated sugar and phosphate, and nondisabled "Update" button
    await takeRNABuilderScreenshot(page, { hideMonomerPreview: true });
    await pressSaveButton(page);
    // should see modal to apply or cancel modification
    await takeEditorScreenshot(page);
    await page.getByText('Yes').click();
    // should see updated nucleotides in chain
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Select entire chain and see enabled modify_in_rna_builder button', async ({
    page,
  }) => {
    await page.keyboard.down('Control');
    await getSymbolLocator(page, {
      symbolAlias: 'T',
      nodeIndexOverall: 1,
    }).click();
    await page.keyboard.up('Control');
    // should see the whole chain selected
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
    await getSymbolLocator(page, {
      symbolAlias: 'T',
      nodeIndexOverall: 1,
    }).click({ button: 'right' });
    // should see correct context menu title and enabled 'modify_in_rna_builder' button
    await takeEditorScreenshot(page);
  });
});

test.describe('Modify nucleotides from sequence in RNA builder', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await selectSequenceLayoutModeTool(page);
    await moveMouseAway(page);
  });

  test('Selecting "Modify in RNA Builder" option from context menu after right-clicking on selected monomers switches RNA Builder to edit mode', async ({
    page,
  }) => {
    /*
    Test case: #3824
    Description: RNA Builder switched to edit mode.
    */
    await startNewSequence(page);
    await keyboardTypeOnCanvas(page, 'acgtu');
    await keyboardPressOnCanvas(page, 'Escape');
    const symbolG = getSymbolLocator(page, { symbolAlias: 'G' }).first();
    await symbolG.click();
    await modifyInRnaBuilder(page, symbolG);
    await takePageScreenshot(page);
  });

  test('Check that if sugar has no R2 or R3, it is disabled in RNA Builder', async ({
    page,
  }) => {
    /*
    Test case: #3824
    Description: Sugars that have no R2 or R3 are disabled.
    */
    await startNewSequence(page);
    await keyboardTypeOnCanvas(page, 'acgtu');
    await keyboardPressOnCanvas(page, 'Escape');
    const symbolG = getSymbolLocator(page, { symbolAlias: 'G' }).first();
    await symbolG.click();
    await modifyInRnaBuilder(page, symbolG);
    await page.getByTestId('summary-Sugars').click();
    await takePresetsScreenshot(page);
  });

  test('Verify that number of selected nucleotides is indicated within RNA Builder interface when several monomers are selected', async ({
    page,
  }) => {
    /*
    Test case: #3824
    Description: Number of selected nucleotides is indicated within RNA Builder interface when several monomers are selected.
    */
    await startNewSequence(page);
    await keyboardTypeOnCanvas(page, 'acgtu');
    await keyboardPressOnCanvas(page, 'Escape');
    await page.keyboard.down('Shift');
    await getSymbolLocator(page, { symbolAlias: 'C' }).first().click();
    const symbolG = getSymbolLocator(page, { symbolAlias: 'G' }).first();
    await symbolG.click();
    await page.keyboard.up('Shift');
    await modifyInRnaBuilder(page, symbolG);
    await takeRNABuilderScreenshot(page);
  });

  test('Name of nucleotide consist of names selected Sugar, Base, Phosphates in RNA Builder', async ({
    page,
  }) => {
    /*
    Test case: #3824
    Description: Name of nucleotide consist of names selected Sugar, Base, Phosphates in RNA Builder.
    */
    await startNewSequence(page);
    await keyboardTypeOnCanvas(page, 'acgtu');
    await keyboardPressOnCanvas(page, 'Escape');
    const symbolG = getSymbolLocator(page, { symbolAlias: 'G' }).first();
    await symbolG.click();
    await modifyInRnaBuilder(page, symbolG);
    await selectMonomers(page, [Sugars._3A6, Bases.dabA, Phosphates.sP_]);
    await takeRNABuilderScreenshot(page, { hideMonomerPreview: true });
  });

  test('Check that Nucleoside editable in RNA builder', async ({ page }) => {
    /*
    Test case: #4388
    Description: Nucleoside edited in RNA builder.
    */
    await openFileAndAddToCanvasMacro('KET/acgp-nucleoside.ket', page);
    await page.keyboard.down('Shift');
    const symbolG = getSymbolLocator(page, { symbolAlias: 'G' }).first();
    await symbolG.click();
    await getSymbolLocator(page, { symbolAlias: 'p' }).first().click();
    await page.keyboard.up('Shift');
    await modifyInRnaBuilder(page, symbolG);
    await selectMonomers(page, [Sugars._3A6, Bases.dabA, Phosphates.sP_]);
    await moveMouseAway(page);
    await pressSaveButton(page);
    await takeEditorScreenshot(page);
  });

  test('Ensure "Phosphate" field is empty when single nucleoside is selected', async ({
    page,
  }) => {
    /*
    Test case: #4388
    Description: "Phosphate" field is empty when single nucleoside is selected.
    */
    await openFileAndAddToCanvasMacro('KET/acgp-nucleoside.ket', page);
    const symbolG = getSymbolLocator(page, { symbolAlias: 'G' }).first();
    await symbolG.click();
    await modifyInRnaBuilder(page, symbolG);
    await takeRNABuilderScreenshot(page);
  });

  test('Validate conversion Nucleoside to Nucleotide upon adding Phosphate in RNA Builder', async ({
    page,
  }) => {
    /*
    Test case: #4388
    Description: Nucleoside converted to Nucleotide after added Phosphate in RNA Builder.
    */
    await openFileAndAddToCanvasMacro('KET/acgp-nucleoside.ket', page);
    const symbolG = getSymbolLocator(page, { symbolAlias: 'G' }).first();
    await symbolG.click();
    await modifyInRnaBuilder(page, symbolG);
    await selectMonomer(page, Phosphates.sP_);
    await pressSaveButton(page);
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });

  test('Check bulk modifications of nucleotides and nucleosides simultaneously', async ({
    page,
  }) => {
    /*
    Test case: #4388
    Description: Instead of field 'name your structure', 'N nucleotides selected' displayed (N- the number of nucleotides and nucleosides).
    In the 'phosphate' field - [multiple] displayed.
    */
    await openFileAndAddToCanvasMacro('KET/agtcu.ket', page);
    await page.keyboard.down('Shift');
    const symbolG = getSymbolLocator(page, { symbolAlias: 'G' }).first();
    await symbolG.click();
    await getSymbolLocator(page, { symbolAlias: 'T' }).first().click();
    await getSymbolLocator(page, { symbolAlias: 'C' }).first().click();
    await getSymbolLocator(page, { symbolAlias: 'U' }).first().click();
    await page.keyboard.up('Shift');
    await modifyInRnaBuilder(page, symbolG);
    await takeRNABuilderScreenshot(page);
    await selectMonomer(page, Phosphates.sP_);
    await pressSaveButton(page);
    await page.getByText('Yes').click();
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Check If among selected elements on canvas there is a single phosphate (selected without an adjacent nucleoside to left)', async ({
    page,
  }) => {
    /*
    Test case: #4388
    Description: If among selected elements on canvas there is a single 
    phosphate (selected without an adjacent nucleoside to left),then in this case,editing in RNA builder prohibited.
    */
    await openFileAndAddToCanvasMacro('KET/modified-agtcup.ket', page);
    await page.keyboard.down('Shift');
    await getSymbolLocator(page, {
      symbolAlias: 'G',
      nodeIndexOverall: 1,
    }).click();
    await getSymbolLocator(page, {
      symbolAlias: 'p',
      nodeIndexOverall: 5,
    }).click();
    await page.keyboard.up('Shift');
    await getSymbolLocator(page, {
      symbolAlias: 'G',
      nodeIndexOverall: 1,
    }).click({ button: 'right' });
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('RNA builder highlighted in Edit mode. Canvas disabled', async ({
    page,
  }) => {
    /*
    Test case: #4472
    Description: RNA builder highlighted in Edit mode. Canvas disabled.
    */
    await openFileAndAddToCanvasMacro(
      'KET/all-types-of-possible-modifications.ket',
      page,
    );
    await page.keyboard.down('Shift');
    const symbolA = getSymbolLocator(page, { symbolAlias: 'A' }).first();
    await symbolA.click();
    await getSymbolLocator(page, { symbolAlias: 'A' }).nth(6).click();
    await getSymbolLocator(page, { symbolAlias: 'A' }).nth(12).click();
    await getSymbolLocator(page, { symbolAlias: 'A' }).nth(18).click();
    await page.keyboard.up('Shift');
    await modifyInRnaBuilder(page, symbolA);
    await takeRNABuilderScreenshot(page);
    await takeEditorScreenshot(page);
  });
});
