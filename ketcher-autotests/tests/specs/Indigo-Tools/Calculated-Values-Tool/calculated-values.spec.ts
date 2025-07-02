/* eslint-disable no-magic-numbers */
import { expect, test } from '@playwright/test';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import {
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  BondType,
  dragMouseTo,
  clickInTheMiddleOfTheScreen,
  getCoordinatesOfTheMiddleOfTheScreen,
  waitForPageInit,
  clickOnCanvas,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getBondByIndex } from '@utils/canvas/bonds';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';

test.describe('Calculated Values Tools', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Calculate selected structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1991
    Description: The 'Calculated Values' modal window is opened,
    the 'Chemical Formula' field contains 'C7H16' value.
    */

    const chemicalFormulaWrapper = page.getByTestId('Chemical Formula-wrapper');
    const molecularWeight = page
      .getByTestId('Molecular Weight-wrapper')
      .locator('input[type="text"]');
    const exactMass = page
      .getByTestId('Exact Mass-wrapper')
      .locator('input[type="text"]');
    const elementalAnalysis = page
      .getByTestId('Elemental Analysis-wrapper')
      .locator('textarea');

    await openFileAndAddToCanvas(page, 'KET/calculated-values-chain.ket');
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(chemicalFormulaWrapper).toContainText('C7H16');
    await expect(molecularWeight).toHaveValue('100.202');
    await expect(exactMass).toHaveValue('100.125');
    await expect(elementalAnalysis).toHaveValue('C 83.9 H 16.1');
  });

  test('Empty canvas', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1992
    Description: The opened window contains:
    'Calculated Values' title;
    'Chemical Formula' field (empty);
    'Molecular Weight' field (empty);
    field for the decimal places count with arrow for drop-down list is present at the right side;
    'Exact Mass' field (empty);
    field for the decimal places count with arrow for drop-down list is present at the right side;
    'Elemental Analysis' field;
    'Close' button.
    */

    const chemicalFormulaWrapper = page.getByTestId('Chemical Formula-wrapper');
    const molecularWeight = page
      .getByTestId('Molecular Weight-wrapper')
      .locator('input[type="text"]');
    const exactMass = page
      .getByTestId('Exact Mass-wrapper')
      .locator('input[type="text"]');
    const elementalAnalysis = page
      .getByTestId('Elemental Analysis-wrapper')
      .locator('textarea');

    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(chemicalFormulaWrapper).toHaveText('Chemical Formula:');
    await expect(molecularWeight).toBeEmpty();
    await expect(exactMass).toBeEmpty();
    await expect(elementalAnalysis).toBeEmpty();
  });

  test('Calculate all canvas and change Decimal places', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1993
    Description:
    The opened window contains:
    'Calculated Values' title;
    'Chemical Formula' field (filled with 'C6 H6; C6 H12; C5 H6' data);
    'Molecular Weight' field (filled with '78.112; 84.159; 66.101');
    field for the decimal places count with arrow for drop-down list is present at the right side;
    '3 decimal places' are selected by default;
    'Exact Mass' field (filled with '78.047; 84.094; 66.047');
    field for the decimal places count with arrow for drop-down list is present at the right side;
    '3 decimal places' are selected by default;
    'Elemental Analysis' field (filled with 'C 92.3 H 7.7; C 85.6 H 14.4; C 90.8 H 9.2' data);
    'Close' button.
    The number of decimal places in the 'Molecular Weight' and 'Exact Mass'
    changes according to the selected values in the fields for the decimal places count.
    */

    const chemicalFormulaWrapper = page.getByTestId('Chemical Formula-wrapper');
    const molecularWeight = page
      .getByTestId('Molecular Weight-wrapper')
      .locator('input[type="text"]');
    const exactMass = page
      .getByTestId('Exact Mass-wrapper')
      .locator('input[type="text"]');
    const elementalAnalysis = page
      .getByTestId('Elemental Analysis-wrapper')
      .locator('textarea');

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/calculated-values-rings.mol',
    );
    await IndigoFunctionsToolbar(page).calculatedValues();

    await expect(chemicalFormulaWrapper).toContainText('C6H6; C6H12; C5H6');
    await expect(molecularWeight).toHaveValue('78.112; 84.159; 66.101');
    await expect(exactMass).toHaveValue('78.047; 84.094; 66.047');
    await expect(elementalAnalysis).toHaveValue(
      'C 92.3 H 7.7; C 85.6 H 14.4; C 90.8 H 9.2',
    );

    await page.getByText('Decimal places3').first().click();
    await page.getByRole('option', { name: '2' }).click();
    await page.getByText('Decimal places3').click();
    await page.getByRole('option', { name: '2' }).click();

    await expect(molecularWeight).toHaveValue('78.11; 84.16; 66.10');
    await expect(exactMass).toHaveValue('78.05; 84.09; 66.05');
  });

  test('Calculate reaction', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1994
    Description:
    The opened window contains:
    'Calculated Values' title;
    'Chemical Formula' field (filled with '[C6H6] + [C2 H4] > [C8 H10]');
    'Molecular Weight' field (filled with '[78.112] + [28.053] > [106.165]');
    field for the decimal places count with arrow for drop-down list is present at the right side;
    '3 decimal places' are selected by default;
    'Exact Mass' field (filled with '[78.047] + [28.031] > [106.078]');
    field for the decimal places count with arrow for drop-down list is present at the right side;
    '3 decimal places' are selected by default;
    'Elemental Analysis' field (filled with '[C 92.3 H 7.7] + [C 85.6 H 14.4] > [C 90.5 H 9.5]');
    'Close' button.
    The number of decimal places in the 'Molecular Weight' and 'Exact Mass'
    changes according to the selected values in the fields for the decimal places count.
    */

    const chemicalFormulaWrapper = page.getByTestId('Chemical Formula-wrapper');
    const molecularWeight = page
      .getByTestId('Molecular Weight-wrapper')
      .locator('input[type="text"]');
    const exactMass = page
      .getByTestId('Exact Mass-wrapper')
      .locator('input[type="text"]');
    const elementalAnalysis = page
      .getByTestId('Elemental Analysis-wrapper')
      .locator('textarea');

    await openFileAndAddToCanvas(page, 'Rxn-V2000/calcvalues-reaction.rxn');
    await IndigoFunctionsToolbar(page).calculatedValues();

    await expect(chemicalFormulaWrapper).toContainText(
      '[C6H6]+[C2H4] > [C8H10]',
    );
    await expect(molecularWeight).toHaveValue('[78.112]+[28.053] > [106.165]');
    await expect(exactMass).toHaveValue('[78.047]+[28.031] > [106.078]');
    await expect(elementalAnalysis).toHaveValue(
      '[C 92.3 H 7.7]+[C 85.6 H 14.4] > [C 90.5 H 9.5]',
    );

    await page.getByText('Decimal places3').first().click();
    await page.getByRole('option', { name: '1' }).click();
    await page.getByText('Decimal places3').click();
    await page.getByRole('option', { name: '1' }).click();

    await expect(molecularWeight).toHaveValue('[78.1]+[28.1] > [106.2]');
    await expect(exactMass).toHaveValue('[78.0]+[28.0] > [106.1]');
  });

  test('The calculation result for a substructure with existing but not selected query features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2000
    Description: The calculation result for a substructure with not selected query features should be correct.
    */

    const errorMessage = page.getByTestId('info-modal-body');

    let point: { x: number; y: number };
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/query-structure.mol');

    point = await getBondByIndex(page, { type: BondType.SINGLE }, 3);
    await page.keyboard.down('Shift');
    await clickOnCanvas(page, point.x, point.y);
    point = await getBondByIndex(page, { type: BondType.SINGLE }, 4);
    await clickOnCanvas(page, point.x, point.y);
    point = await getBondByIndex(page, { type: BondType.SINGLE }, 5);
    await clickOnCanvas(page, point.x, point.y);
    await page.keyboard.up('Shift');

    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(errorMessage).toHaveText(
      'Cannot calculate properties for structures with query features!',
    );
  });

  test('One structure on canvas (Benzene ring)', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1997
    Description:
    The opened window contains:
    'Calculated Values' title;
    'Chemical Formula' field (filled with 'C6H6' data);
    'Molecular Weight' field (filled with '78.112');
    field for the decimal places count with arrow for drop-down list is present at the right side. '3 decimal places' are selected by default;
    'Exact Mass' field (filled with '78.047');
    field for the decimal places count with arrow for drop-down list is present at the right side. '3 decimal places' are selected by default;
    'Elemental Analysis' field (filled with 'C 92.3 H 7.7' data);
    'Close' button.
    The number of decimal places in the 'Molecular Weight' and 'Exact Mass'
    changes according to the selected values in the fields for the decimal places count.
    */

    const chemicalFormulaWrapper = page.getByTestId('Chemical Formula-wrapper');
    const molecularWeight = page
      .getByTestId('Molecular Weight-wrapper')
      .locator('input[type="text"]');
    const exactMass = page
      .getByTestId('Exact Mass-wrapper')
      .locator('input[type="text"]');
    const elementalAnalysis = page
      .getByTestId('Elemental Analysis-wrapper')
      .locator('textarea');

    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await IndigoFunctionsToolbar(page).calculatedValues();

    await expect(chemicalFormulaWrapper).toContainText('C6H6');
    await expect(molecularWeight).toHaveValue('78.112');
    await expect(exactMass).toHaveValue('78.047');
    await expect(elementalAnalysis).toHaveValue('C 92.3 H 7.7');

    await page.getByText('Decimal places3').first().click();
    await page.getByRole('option', { name: '1' }).click();
    await page.getByText('Decimal places3').click();
    await page.getByRole('option', { name: '1' }).click();

    await expect(chemicalFormulaWrapper).toContainText('C6H6');
    await expect(molecularWeight).toHaveValue('78.1');
    await expect(exactMass).toHaveValue('78.0');
    await expect(elementalAnalysis).toHaveValue('C 92.3 H 7.7');
  });

  test('Validate the Calculation of exact mass for a part of molecule', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1999
    Description: Calculated values dialog appears, the exact mass of
    the chosen fragment (C9H9O2) is 149.060
    */

    const chemicalFormulaWrapper = page.getByTestId('Chemical Formula-wrapper');
    const molecularWeight = page
      .getByTestId('Molecular Weight-wrapper')
      .locator('input[type="text"]');
    const exactMass = page
      .getByTestId('Exact Mass-wrapper')
      .locator('input[type="text"]');
    const elementalAnalysis = page
      .getByTestId('Elemental Analysis-wrapper')
      .locator('textarea');

    const xDelta = 300;
    const yDelta = 600;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/ritalin.mol');
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + xDelta, y - yDelta, page);
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(chemicalFormulaWrapper).toContainText('C9H9O2');
    await expect(molecularWeight).toHaveValue('149.167');
    await expect(exactMass).toHaveValue('149.060');
    await expect(elementalAnalysis).toHaveValue('C 72.5 H 6.1 O 21.4');
  });

  test('Calculation of exact mass for the reaction components', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2001
    Description: Calculation of exact mass for the reaction
    should be correct: '[78.047] > [155.957]'.
    */

    const chemicalFormulaWrapper = page.getByTestId('Chemical Formula-wrapper');
    const molecularWeight = page
      .getByTestId('Molecular Weight-wrapper')
      .locator('input[type="text"]');
    const exactMass = page
      .getByTestId('Exact Mass-wrapper')
      .locator('input[type="text"]');
    const elementalAnalysis = page
      .getByTestId('Elemental Analysis-wrapper')
      .locator('textarea');

    await openFileAndAddToCanvas(page, 'Rxn-V2000/benzene-bromination.rxn');
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(chemicalFormulaWrapper).toContainText('[C6H6] > [C6H5Br]');
    await expect(molecularWeight).toHaveValue('[78.112] > [157.008]');
    await expect(exactMass).toHaveValue('[78.047] > [155.957]');
    await expect(elementalAnalysis).toHaveValue(
      '[C 92.3 H 7.7] > [C 45.9 H 3.2 Br 50.9]',
    );
  });

  test('Calculation for an inorganic compound', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2003
    Description: The calculation for the inorganic compound should be correct.
    For our example (Sulfur):
    Chemical Formula: H2 S
    Molecular Weight: 34.081
    Exact Mass: 33.988
    Elemental Analysis: H 5.9 S 94.1
    */

    const chemicalFormulaWrapper = page.getByTestId('Chemical Formula-wrapper');
    const molecularWeight = page
      .getByTestId('Molecular Weight-wrapper')
      .locator('input[type="text"]');
    const exactMass = page
      .getByTestId('Exact Mass-wrapper')
      .locator('input[type="text"]');
    const elementalAnalysis = page
      .getByTestId('Elemental Analysis-wrapper')
      .locator('textarea');

    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Sulfur);
    await clickInTheMiddleOfTheScreen(page);
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(chemicalFormulaWrapper).toContainText('H2S');
    await expect(molecularWeight).toHaveValue('34.081');
    await expect(exactMass).toHaveValue('33.988');
    await expect(elementalAnalysis).toHaveValue('H 5.9 S 94.1');
  });

  test('Calculations for Rgroup Root Structure with Rgroup Label', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2004
    Description: If R-group label is included in the selected object the Chemical Formula is present only.
    For our example: C5H10R#. All other fields contain 'error:
    Cannot calculate mass for structure with pseudoatoms, template atoms or RSites' message.
    */

    const chemicalFormulaWrapper = page.getByTestId('Chemical Formula-wrapper');
    const molecularWeight = page
      .getByTestId('Molecular Weight-wrapper')
      .locator('input[type="text"]');
    const exactMass = page
      .getByTestId('Exact Mass-wrapper')
      .locator('input[type="text"]');
    const elementalAnalysis = page
      .getByTestId('Elemental Analysis-wrapper')
      .locator('textarea');

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/r-group-label.mol');
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(chemicalFormulaWrapper).toContainText('C5H10R#');
    await expect(molecularWeight).toHaveValue(
      'calculation error: Cannot calculate mass for structure with pseudoatoms, template atoms or RSites',
    );
    await expect(exactMass).toHaveValue(
      'calculation error: Cannot calculate mass for structure with pseudoatoms, template atoms or RSites',
    );
    await expect(elementalAnalysis).toHaveValue(
      'calculation error: Cannot calculate mass for structure with pseudoatoms, template atoms or RSites',
    );
  });

  test('Calculations for Rgroup Root Structure without Rgroup Label', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2004
    Description: If the R-group label is absent in the selected object the calculation is represented
    in the common way (as simple structure).
    */

    const chemicalFormulaWrapper = page.getByTestId('Chemical Formula-wrapper');
    const molecularWeight = page
      .getByTestId('Molecular Weight-wrapper')
      .locator('input[type="text"]');
    const exactMass = page
      .getByTestId('Exact Mass-wrapper')
      .locator('input[type="text"]');
    const elementalAnalysis = page
      .getByTestId('Elemental Analysis-wrapper')
      .locator('textarea');

    const xDelta = 200;
    const yDelta = 200;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/r-group-label.mol');
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + xDelta, y + yDelta, page);
    await IndigoFunctionsToolbar(page).calculatedValues();
    /*
    TODO:It is necessary to ensure the correctness of the test results.
    */
    await expect(chemicalFormulaWrapper).toContainText('CH2');
    await expect(molecularWeight).toHaveValue(
      'calculation error: Cannot calculate mass for structure with pseudoatoms, template atoms or RSites',
    );
    await expect(exactMass).toHaveValue(
      'calculation error: Cannot calculate mass for structure with pseudoatoms, template atoms or RSites',
    );
    await expect(elementalAnalysis).toHaveValue(
      'calculation error: Cannot calculate mass for structure with pseudoatoms, template atoms or RSites',
    );
  });

  test('Calculations for Rgroup member', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2005
    Description: Regardless of the method of selection all fields contain
    'Cannot calculate properties for RGroups' message.
    */

    const errorMessage = page.getByTestId('info-modal-body');

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/r-group-all-chain.mol');
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(errorMessage).toHaveText(
      'Cannot calculate properties for RGroups',
    );
  });

  test('Calculations for Rgroup member (select part of structure)', async ({
    page,
  }) => {
    const errorMessage = page.getByTestId('info-modal-body');

    /*
    Test case: EPMLSOPKET-2005
    Description: Regardless of the method of selection all fields contain
    'Cannot calculate properties for RGroups' message.
    */
    const xDelta = 100;
    const yDelta = 100;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/r-group-all-chain.mol');
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + xDelta, y + yDelta, page);
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(errorMessage).toHaveText(
      'Cannot calculate properties for RGroups',
    );
  });

  test('Calculations for the structure with R-group Attachment points', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2006
    Description: If the selected object contains the attachment points (or nothing is selected)
    all fields contain the 'Cannot calculate properties for RGroups' message.
    */
    const errorMessage = page.getByTestId('info-modal-body');

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/attachment-points-structure.mol',
    );
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(errorMessage).toHaveText(
      'Cannot calculate properties for RGroups',
    );
  });

  test('Calculations for the structure with R-group Attachment points (select part of structure)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2006
    Description: If the Rgroup attachment point is absent in the selected object the calculation is
    represented in the common way (as simple structure).
    */
    const errorMessage = page.getByTestId('info-modal-body');

    const xDelta = 100;
    const yDelta = 100;
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/attachment-points-structure.mol',
    );
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + xDelta, y + yDelta, page);
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(errorMessage).toHaveText(
      'Cannot calculate properties for RGroups',
    );
  });

  test('Calculation for structure with S-group - SRU polymer', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2007
    Description: Calculation for SRU polymer S-groups should be represented:
    Chemical Formula:
    C9H20(C6H12)n (for our example)
    Molecular Weight:
    error: Cannot calculate mass for structure with repeating units
    Exact Mass:
    error: Cannot calculate mass for structure with repeating units
    Elemental Analysis:
    error: Cannot calculate mass for structure with repeating units
    */

    const chemicalFormulaWrapper = page.getByTestId('Chemical Formula-wrapper');
    const molecularWeight = page
      .getByTestId('Molecular Weight-wrapper')
      .locator('input[type="text"]');
    const exactMass = page
      .getByTestId('Exact Mass-wrapper')
      .locator('input[type="text"]');
    const elementalAnalysis = page
      .getByTestId('Elemental Analysis-wrapper')
      .locator('textarea');

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/sru-polymer-structure.mol',
    );
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(chemicalFormulaWrapper).toContainText('C9H20(C6H12)n');
    await expect(molecularWeight).toHaveValue(
      'calculation error: Cannot calculate mass for structure with repeating units',
    );
    await expect(exactMass).toHaveValue(
      'calculation error: Cannot calculate mass for structure with repeating units',
    );
    await expect(elementalAnalysis).toHaveValue(
      'calculation error: Cannot calculate mass for structure with repeating units',
    );
  });

  test('Calculation for structure with S-group - Multiple group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2008
    Description: Multiple brackets should be "opened", part of the structure in the
    brackets should be multiplied correctly. Calculation should be represented (for our example):
    Chemical Formula:
    C13 H28
    Molecular Weight:
    184.361
    Exact Mass:
    184.219
    Elemental Analysis:
    C 84.7 H 15.3
    */

    const chemicalFormulaWrapper = page.getByTestId('Chemical Formula-wrapper');
    const molecularWeight = page
      .getByTestId('Molecular Weight-wrapper')
      .locator('input[type="text"]');
    const exactMass = page
      .getByTestId('Exact Mass-wrapper')
      .locator('input[type="text"]');
    const elementalAnalysis = page
      .getByTestId('Elemental Analysis-wrapper')
      .locator('textarea');

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/multiple-group-structure.mol',
    );
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(chemicalFormulaWrapper).toContainText('C13H28');
    await expect(molecularWeight).toHaveValue('184.361');
    await expect(exactMass).toHaveValue('184.219');
    await expect(elementalAnalysis).toHaveValue('C 84.7 H 15.3');
  });

  test('Calculation for structure with S-group - Superatom (abbreviation)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2010
    Description: The brackets are ignored and calculation is represented as simple structrure.
    Chemical Formula:
    C12 H26
    Molecular Weight:
    170.335
    Exact Mass:
    170.203
    Elemental Analysis:
    C 84.6 H 15.4
    */

    const chemicalFormulaWrapper = page.getByTestId('Chemical Formula-wrapper');
    const molecularWeight = page
      .getByTestId('Molecular Weight-wrapper')
      .locator('input[type="text"]');
    const exactMass = page
      .getByTestId('Exact Mass-wrapper')
      .locator('input[type="text"]');
    const elementalAnalysis = page
      .getByTestId('Elemental Analysis-wrapper')
      .locator('textarea');

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/superatom-structure.mol',
    );
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(chemicalFormulaWrapper).toContainText('C12H26');
    await expect(molecularWeight).toHaveValue('170.335');
    await expect(exactMass).toHaveValue('170.203');
    await expect(elementalAnalysis).toHaveValue('C 84.6 H 15.4');
  });

  test('Calculation for structure with S-group - Data S-group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2011
    Description: The presence of Data S-group is ignored and calculation is represented as simple structure.
    Chemical Formula:
    C17 H36
    Molecular Weight:
    240.468
    Exact Mass:
    240.282
    Elemental Analysis:
    C 84.9 H 15.1
    */

    const chemicalFormulaWrapper = page.getByTestId('Chemical Formula-wrapper');
    const molecularWeight = page
      .getByTestId('Molecular Weight-wrapper')
      .locator('input[type="text"]');
    const exactMass = page
      .getByTestId('Exact Mass-wrapper')
      .locator('input[type="text"]');
    const elementalAnalysis = page
      .getByTestId('Elemental Analysis-wrapper')
      .locator('textarea');

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/data-s-group-structure.mol',
    );
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(chemicalFormulaWrapper).toContainText('C17H36');
    await expect(molecularWeight).toHaveValue('240.468');
    await expect(exactMass).toHaveValue('240.282');
    await expect(elementalAnalysis).toHaveValue('C 84.9 H 15.1');
  });

  test('(a-query-non-hsub)Test Calculations with Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the selected object contains the Query Feature all fields contain the 'Cannot
    calculate properties for structures with query features' message.
    */
    const errorMessage = page.getByTestId('info-modal-body');

    await openFileAndAddToCanvas(page, 'Molfiles-V3000/a-query-non-hsub.mol');
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(errorMessage).toHaveText(
      'Cannot calculate properties for structures with query features!',
    );
  });

  test('(a-query-unsaturated)Test Calculations with Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the selected object contains the Query Feature all fields contain the 'Cannot
    calculate properties for structures with query features' message.
    */
    const errorMessage = page.getByTestId('info-modal-body');

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V3000/a-query-unsaturated.mol',
    );
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(errorMessage).toHaveText(
      'Cannot calculate properties for structures with query features!',
    );
  });

  test('(a-query-ring-bonds)Test Calculations with Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the selected object contains the Query Feature all fields contain the 'Cannot
    calculate properties for structures with query features' message.
    */
    const errorMessage = page.getByTestId('info-modal-body');

    await openFileAndAddToCanvas(page, 'Molfiles-V3000/a-query-ring-bonds.mol');
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(errorMessage).toHaveText(
      'Cannot calculate properties for structures with query features!',
    );
  });

  test('(a-query-aq)Test Calculations with Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the selected object contains the Query Feature all fields contain the 'Cannot
    calculate properties for structures with query features' message.
    */
    const errorMessage = page.getByTestId('info-modal-body');

    await openFileAndAddToCanvas(page, 'Molfiles-V3000/a-query-aq.mol');
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(errorMessage).toHaveText(
      'Cannot calculate properties for structures with query features!',
    );
  });

  test('(a-query-atom-list)Test Calculations with Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the selected object contains the Query Feature all fields contain the 'Cannot
    calculate properties for structures with query features' message.
    */

    const errorMessage = page.getByTestId('info-modal-body');

    await openFileAndAddToCanvas(page, 'Molfiles-V3000/a-query-atom-list.mol');
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(errorMessage).toHaveText(
      'Cannot calculate properties for structures with query features!',
    );
  });

  test('(a-query-not-list)Test Calculations with Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the selected object contains the Query Feature all fields contain the 'Cannot
    calculate properties for structures with query features' message.
    */

    const errorMessage = page.getByTestId('info-modal-body');

    await openFileAndAddToCanvas(page, 'Molfiles-V3000/a-query-not-list.mol');
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(errorMessage).toHaveText(
      'Cannot calculate properties for structures with query features!',
    );
  });

  test('(a-query-non-hsub)Test Calculations with part of Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the Query Feature(s) is absent in the selected object the calculation is
    represented in the common way (as simple structure).
    */

    const errorMessage = page.getByTestId('info-modal-body');

    await openFileAndAddToCanvas(page, 'Molfiles-V3000/a-query-non-hsub.mol');
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await clickOnCanvas(page, point.x, point.y);
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(errorMessage).toHaveText(
      'Cannot calculate properties for structures with query features!',
    );
  });

  test('(a-query-unsaturated)Test Calculations with part of Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the Query Feature(s) is absent in the selected object the calculation is
    represented in the common way (as simple structure).
    */

    const errorMessage = page.getByTestId('info-modal-body');

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V3000/a-query-unsaturated.mol',
    );
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await clickOnCanvas(page, point.x, point.y);
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(errorMessage).toHaveText(
      'Cannot calculate properties for structures with query features!',
    );
  });

  test('(a-query-ring-bonds)Test Calculations with part of Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the Query Feature(s) is absent in the selected object the calculation is
    represented in the common way (as simple structure).
    */

    const errorMessage = page.getByTestId('info-modal-body');

    await openFileAndAddToCanvas(page, 'Molfiles-V3000/a-query-ring-bonds.mol');
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await clickOnCanvas(page, point.x, point.y);
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(errorMessage).toHaveText(
      'Cannot calculate properties for structures with query features!',
    );
  });

  test('(a-query-aq)Test Calculations with part of Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the Query Feature(s) is absent in the selected object the calculation is
    represented in the common way (as simple structure).
    */

    const errorMessage = page.getByTestId('info-modal-body');

    await openFileAndAddToCanvas(page, 'Molfiles-V3000/a-query-aq.mol');
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await clickOnCanvas(page, point.x, point.y);
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(errorMessage).toHaveText(
      'Cannot calculate properties for structures with query features!',
    );
  });

  test('(a-query-atom-list)Test Calculations with part of Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the Query Feature(s) is absent in the selected object the calculation is
    represented in the common way (as simple structure).
    */

    const errorMessage = page.getByTestId('info-modal-body');

    await openFileAndAddToCanvas(page, 'Molfiles-V3000/a-query-atom-list.mol');
    const point = await getAtomByIndex(page, { label: 'C' }, 0);
    await clickOnCanvas(page, point.x, point.y);
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(errorMessage).toHaveText(
      'Cannot calculate properties for structures with query features!',
    );
  });

  test('(a-query-not-list)Test Calculations with part of Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the Query Feature(s) is absent in the selected object the calculation is
    represented in the common way (as simple structure).
    */

    const errorMessage = page.getByTestId('info-modal-body');

    await openFileAndAddToCanvas(page, 'Molfiles-V3000/a-query-not-list.mol');
    const point = await getAtomByIndex(page, { label: 'C' }, 0);
    await clickOnCanvas(page, point.x, point.y);
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(errorMessage).toHaveText(
      'Cannot calculate properties for structures with query features!',
    );
  });

  test('(hetero-adduct)Calculation of exact mass for different types of structures', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1998
    Description: The presence of Data S-group is ignored and calculation is represented as simple structure.
    Chemical Formula:
    C18 H12 O3
    Molecular Weight:
    276.286
    Exact Mass:
    276.079
    Elemental Analysis:
    C 78.3 H 4.4 O 17.4
    */

    const chemicalFormulaWrapper = page.getByTestId('Chemical Formula-wrapper');
    const molecularWeight = page
      .getByTestId('Molecular Weight-wrapper')
      .locator('input[type="text"]');
    const exactMass = page
      .getByTestId('Exact Mass-wrapper')
      .locator('input[type="text"]');
    const elementalAnalysis = page
      .getByTestId('Elemental Analysis-wrapper')
      .locator('textarea');

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/hetero-adduct.mol');
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(chemicalFormulaWrapper).toContainText('C18H12O3');
    await expect(molecularWeight).toHaveValue('276.286');
    await expect(exactMass).toHaveValue('276.079');
    await expect(elementalAnalysis).toHaveValue('C 78.3 H 4.4 O 17.4');
  });

  test('(c14napthylbromide)Calculation of exact mass for different types of structures', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1998
    Description: The presence of Data S-group is ignored and calculation is represented as simple structure.
    Chemical Formula:
    C10 14 CH9Br
    Molecular Weight:
    223.086
    Exact Mass:
    221.992
    Elemental Analysis:
    C 60.1 H 4.1 Br 35.8
    */
    const chemicalFormulaWrapper = page.getByTestId('Chemical Formula-wrapper');
    const molecularWeight = page
      .getByTestId('Molecular Weight-wrapper')
      .locator('input[type="text"]');
    const exactMass = page
      .getByTestId('Exact Mass-wrapper')
      .locator('input[type="text"]');
    const elementalAnalysis = page
      .getByTestId('Elemental Analysis-wrapper')
      .locator('textarea');

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/c14napthylbromide.mol');
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(chemicalFormulaWrapper).toContainText('C1014CH9Br');
    await expect(molecularWeight).toHaveValue('223.086');
    await expect(exactMass).toHaveValue('221.992');
    await expect(elementalAnalysis).toHaveValue('C 60.1 H 4.1 Br 35.8');
  });

  test('(dgln-atomlist)Calculation of exact mass for different types of structures', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1998
    Description: If the selected object contains the Query Feature all fields contain the 'Cannot
    calculate properties for structures with query features' message.
    */

    const errorMessage = page.getByTestId('info-modal-body');

    await openFileAndAddToCanvas(page, 'Molfiles-V3000/dgln-atomlist.mol');
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(errorMessage).toHaveText(
      'Cannot calculate properties for structures with query features!',
    );
  });

  test('Calculation for several reaction components', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2002
    Description: Reaction components are calculated.
    Chemical Formula:
    [C2H4O2]+[C2H6O] > [C4H8O2]+[H2O]
    Molecular Weight:
    [60.052]+[46.068] > [88.105]+[18.015]
    Exact Mass:
    [60.021]+[46.042] > [88.052]+[18.011]
    Elemental Analysis:
    [C 40.0 H 6.7 O 53.3]+[C 52.1 H 13.1 O 34.7] > [C 54.5 H 9.2 O 36.3]+[H 11.2 O 88.8]
    */
    const chemicalFormulaWrapper = page.getByTestId('Chemical Formula-wrapper');
    const molecularWeight = page
      .getByTestId('Molecular Weight-wrapper')
      .locator('input[type="text"]');
    const exactMass = page
      .getByTestId('Exact Mass-wrapper')
      .locator('input[type="text"]');
    const elementalAnalysis = page
      .getByTestId('Elemental Analysis-wrapper')
      .locator('textarea');

    await openFileAndAddToCanvas(
      page,
      'Rxn-V2000/reaction-plus-and-arrows.rxn',
    );
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(chemicalFormulaWrapper).toContainText(
      '[C2H4O2]+[C2H6O] > [C4H8O2]+[H2O]',
    );
    await expect(molecularWeight).toHaveValue(
      '[60.052]+[46.068] > [88.105]+[18.015]',
    );
    await expect(exactMass).toHaveValue(
      '[60.021]+[46.042] > [88.052]+[18.011]',
    );
    await expect(elementalAnalysis).toHaveValue(
      '[C 40.0 H 6.7 O 53.3]+[C 52.1 H 13.1 O 34.7] > [C 54.5 H 9.2 O 36.3]+[H 11.2 O 88.8]',
    );
  });

  test('Calculation for several reaction components(part of structure)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2002
    Description: Reaction components are calculated.
    Chemical Formula:
    [O]+[C2H6O]
    Molecular Weight:
    [15.999]+[46.068]
    Exact Mass:
    [15.995]+[46.042]
    Elemental Analysis:
    [O 100.0]+[C 52.1 H 13.1 O 34.7]
    */
    const chemicalFormulaWrapper = page.getByTestId('Chemical Formula-wrapper');
    const molecularWeight = page
      .getByTestId('Molecular Weight-wrapper')
      .locator('input[type="text"]');
    const exactMass = page
      .getByTestId('Exact Mass-wrapper')
      .locator('input[type="text"]');
    const elementalAnalysis = page
      .getByTestId('Elemental Analysis-wrapper')
      .locator('textarea');

    const xDelta = 500;
    const yDelta = 800;
    await openFileAndAddToCanvas(page, 'KET/reaction-arrow.ket');
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x - xDelta, y + yDelta, page);
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(chemicalFormulaWrapper).toContainText('[O]+[C2H6O]');
    await expect(molecularWeight).toHaveValue('[15.999]+[46.068]');
    await expect(exactMass).toHaveValue('[15.995]+[46.042]');
    await expect(elementalAnalysis).toHaveValue(
      '[O 100.0]+[C 52.1 H 13.1 O 34.7]',
    );
  });

  test('Calculate result for structure with atom and bond properties', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1995
    Description: Reaction components are calculated.
    Chemical Formula:
    C2H7
    Molecular Weight:
    31.077
    Exact Mass:
    31.055
    Elemental Analysis:
    C 77.3 H 22.7
    */
    const chemicalFormulaWrapper = page.getByTestId('Chemical Formula-wrapper');
    const molecularWeight = page
      .getByTestId('Molecular Weight-wrapper')
      .locator('input[type="text"]');
    const exactMass = page
      .getByTestId('Exact Mass-wrapper')
      .locator('input[type="text"]');
    const elementalAnalysis = page
      .getByTestId('Elemental Analysis-wrapper')
      .locator('textarea');

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/ethane-with-valence-and-stereobond.mol',
    );
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(chemicalFormulaWrapper).toContainText('C2H7');
    await expect(molecularWeight).toHaveValue('31.077');
    await expect(exactMass).toHaveValue('31.055');
    await expect(elementalAnalysis).toHaveValue('C 77.3 H 22.7');
  });
});

test.describe('Calculated Values Tools', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Structure Check window', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-10089
    Description: The 'Structure Check' modal is opened
    'Structure Check' title
    'Settings' checkboxes:
    Valence
    Radical
    Pseudoatom
    Stereochemistry
    Query
    Overlapping Atoms
    Overlapping Bonds
    R-Groups
    Chirality
    3D Structure
    Chiral flag
    Last check: ##:##:## ##.##.####
    Window for error messages
    'Check', 'Cancel', 'Apply', X buttons
    */
    await IndigoFunctionsToolbar(page).checkStructure();
    await takeEditorScreenshot(page, {
      mask: [page.locator('[class*="Check-module_checkInfo"] > span')],
    });
  });
});
