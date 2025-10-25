/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-magic-numbers */
import { expect, Page, test } from '@fixtures';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import {
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  dragMouseTo,
  clickInTheMiddleOfTheScreen,
  getCoordinatesOfTheMiddleOfTheScreen,
} from '@utils';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { CalculatedValuesDialog } from '@tests/pages/molecules/canvas/CalculatedValuesDialog';
import { StructureCheckDialog } from '@tests/pages/molecules/canvas/StructureCheckDialog';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';

let page: Page;
test.describe('Calculated Values Tools', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });
  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});
  test.afterEach(async ({ MoleculesCanvas: _ }) => {
    if (await CalculatedValuesDialog(page).window.isVisible()) {
      await CalculatedValuesDialog(page).close();
    }
  });

  test('Calculate selected structure', async () => {
    /*
    Test case: EPMLSOPKET-1991
    Description: The 'Calculated Values' modal window is opened,
    the 'Chemical Formula' field contains 'C7H16' value.
    */

    await openFileAndAddToCanvas(page, 'KET/calculated-values-chain.ket');
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('C7H16');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '100.205',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '100.125',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue('C 83.9 H 16.1');
  });

  test('Empty canvas', async () => {
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

    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(CalculatedValuesDialog(page).chemicalFormulaInput).toHaveText(
      'Chemical Formula:',
    );
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toBeEmpty();
    await expect(CalculatedValuesDialog(page).exactMassInput).toBeEmpty();
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toBeEmpty();
  });

  test('Calculate all canvas and change Decimal places', async () => {
    /*
    Test case: EPMLSOPKET-1993
    Description:
    The opened window contains:
    'Calculated Values' title;
    'Chemical Formula' field (filled with 'C6 H6; C6 H12; C5 H6' data);
    'Molecular Weight' field (filled with '78.114; 84.162; 66.103');
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

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/calculated-values-rings.mol',
    );
    await IndigoFunctionsToolbar(page).calculatedValues();

    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('C6H6; C6H12; C5H6');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '78.114; 84.162; 66.103',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '78.047; 84.094; 66.047',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue('C 92.3 H 7.7; C 85.6 H 14.4; C 90.8 H 9.2');

    await CalculatedValuesDialog(page).selectMolecularWeightDecimalPlaces(2);
    await CalculatedValuesDialog(page).selectExactMassDecimalPlaces(2);

    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '78.11; 84.16; 66.10',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '78.05; 84.09; 66.05',
    );
  });

  test('Calculate reaction', async () => {
    /*
    Test case: EPMLSOPKET-1994
    Description:
    The opened window contains:
    'Calculated Values' title;
    'Chemical Formula' field (filled with '[C6H6] + [C2 H4] > [C8 H10]');
    'Molecular Weight' field (filled with '[78.114]+[28.054] > [106.168]');
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

    await openFileAndAddToCanvas(page, 'Rxn-V2000/calcvalues-reaction.rxn');
    await IndigoFunctionsToolbar(page).calculatedValues();

    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('[C6H6]+[C2H4] > [C8H10]');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '[78.114]+[28.054] > [106.168]',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '[78.047]+[28.031] > [106.078]',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue('[C 92.3 H 7.7]+[C 85.6 H 14.4] > [C 90.5 H 9.5]');

    await CalculatedValuesDialog(page).selectMolecularWeightDecimalPlaces(1);
    await CalculatedValuesDialog(page).selectExactMassDecimalPlaces(1);

    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '[78.1]+[28.1] > [106.2]',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '[78.0]+[28.0] > [106.1]',
    );
  });

  test('One structure on canvas (Benzene ring)', async () => {
    /*
    Test case: EPMLSOPKET-1997
    Description:
    The opened window contains:
    'Calculated Values' title;
    'Chemical Formula' field (filled with 'C6H6' data);
    'Molecular Weight' field (filled with '78.114');
    field for the decimal places count with arrow for drop-down list is present at the right side. '3 decimal places' are selected by default;
    'Exact Mass' field (filled with '78.047');
    field for the decimal places count with arrow for drop-down list is present at the right side. '3 decimal places' are selected by default;
    'Elemental Analysis' field (filled with 'C 92.3 H 7.7' data);
    'Close' button.
    The number of decimal places in the 'Molecular Weight' and 'Exact Mass'
    changes according to the selected values in the fields for the decimal places count.
    */

    await BottomToolbar(page).clickRing(RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await IndigoFunctionsToolbar(page).calculatedValues();

    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('C6H6');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '78.114',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '78.047',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue('C 92.3 H 7.7');

    await CalculatedValuesDialog(page).selectMolecularWeightDecimalPlaces(1);
    await CalculatedValuesDialog(page).selectExactMassDecimalPlaces(1);

    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('C6H6');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '78.1',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '78.0',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue('C 92.3 H 7.7');
  });

  test('Validate the Calculation of exact mass for a part of molecule', async () => {
    /*
    Test case: EPMLSOPKET-1999
    Description: Calculated values dialog appears, the exact mass of
    the chosen fragment (C9H9O2) is 149.060
    */

    const xDelta = 300;
    const yDelta = 600;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/ritalin.mol');
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + xDelta, y - yDelta, page);
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('C9H9O2');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '149.169',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '149.060',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue('C 72.5 H 6.1 O 21.4');
  });

  test('Calculation of exact mass for the reaction components', async () => {
    /*
    Test case: EPMLSOPKET-2001
    Description: Calculation of exact mass for the reaction
    should be correct: '[78.047] > [155.957]'.
    */

    await openFileAndAddToCanvas(page, 'Rxn-V2000/benzene-bromination.rxn');
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('[C6H6] > [C6H5Br]');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '[78.114] > [157.010]',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '[78.047] > [155.957]',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue('[C 92.3 H 7.7] > [C 45.9 H 3.2 Br 50.9]');
  });

  test('Calculation for an inorganic compound', async () => {
    /*
    Test case: EPMLSOPKET-2003
    Description: The calculation for the inorganic compound should be correct.
    For our example (Sulfur):
    Chemical Formula: H2 S
    Molecular Weight: 34.081
    Exact Mass: 33.988
    Elemental Analysis: H 5.9 S 94.1
    */

    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Sulfur);
    await clickInTheMiddleOfTheScreen(page);
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('H2S');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '34.076',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '33.988',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue('H 5.9 S 94.1');
  });

  test('Calculations for Rgroup Root Structure with Rgroup Label', async () => {
    /*
    Test case: EPMLSOPKET-2004
    Description: If R-group label is included in the selected object the Chemical Formula is present only.
    For our example: C5H10R#. All other fields contain 'error:
    Cannot calculate mass for structure with pseudoatoms, template atoms or RSites' message.
    */

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/r-group-label.mol');
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('C5H10R#');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      'calculation error: Cannot calculate mass for structure with pseudoatoms, template atoms or RSites',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      'calculation error: Cannot calculate mass for structure with pseudoatoms, template atoms or RSites',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue(
      'calculation error: Cannot calculate mass for structure with pseudoatoms, template atoms or RSites',
    );
  });

  test('Calculations for Rgroup Root Structure without Rgroup Label', async () => {
    /*
    Test case: EPMLSOPKET-2004
    Description: If the R-group label is absent in the selected object the calculation is represented
    in the common way (as simple structure).
    */

    const xDelta = 200;
    const yDelta = 200;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/r-group-label.mol');
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + xDelta, y + yDelta, page);
    await IndigoFunctionsToolbar(page).calculatedValues();
    /*
    TODO:It is necessary to ensure the correctness of the test results.
    */
    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('CH2');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      'calculation error: Cannot calculate mass for structure with pseudoatoms, template atoms or RSites',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      'calculation error: Cannot calculate mass for structure with pseudoatoms, template atoms or RSites',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue(
      'calculation error: Cannot calculate mass for structure with pseudoatoms, template atoms or RSites',
    );
  });

  test('Calculations for Rgroup member', async () => {
    /*
    Test case: EPMLSOPKET-2005
    Description: Regardless of the method of selection all fields contain
    'Cannot calculate properties for RGroups' message.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/r-group-all-chain.mol');
    await IndigoFunctionsToolbar(page).calculatedValues();
    const errorMessage = await ErrorMessageDialog(page).getErrorMessage();
    expect(errorMessage).toContain('Cannot calculate properties for RGroups');
  });

  test('Calculations for Rgroup member (select part of structure)', async () => {
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
    const errorMessage = await ErrorMessageDialog(page).getErrorMessage();
    expect(errorMessage).toContain('Cannot calculate properties for RGroups');
  });

  test('Calculations for the structure with R-group Attachment points', async () => {
    /*
    Test case: EPMLSOPKET-2006
    Description: If the selected object contains the attachment points (or nothing is selected)
    all fields contain the 'Cannot calculate properties for RGroups' message.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/attachment-points-structure.mol',
    );
    await IndigoFunctionsToolbar(page).calculatedValues();
    const errorMessage = await ErrorMessageDialog(page).getErrorMessage();
    expect(errorMessage).toContain('Cannot calculate properties for RGroups');
  });

  test('Calculations for the structure with R-group Attachment points (select part of structure)', async () => {
    /*
    Test case: EPMLSOPKET-2006
    Description: If the Rgroup attachment point is absent in the selected object the calculation is
    represented in the common way (as simple structure).
    */
    const xDelta = 100;
    const yDelta = 100;
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/attachment-points-structure.mol',
    );
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + xDelta, y + yDelta, page);
    await IndigoFunctionsToolbar(page).calculatedValues();
    const errorMessage = await ErrorMessageDialog(page).getErrorMessage();
    expect(errorMessage).toContain('Cannot calculate properties for RGroups');
  });

  test('Calculation for structure with S-group - SRU polymer', async () => {
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

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/sru-polymer-structure.mol',
    );
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('C9H20(C6H12)n');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      'calculation error: Cannot calculate mass for structure with repeating units',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      'calculation error: Cannot calculate mass for structure with repeating units',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue(
      'calculation error: Cannot calculate mass for structure with repeating units',
    );
  });

  test('Calculation for structure with S-group - Multiple group', async () => {
    /*
     * Test case: EPMLSOPKET-2008
     * Description: Multiple brackets should be "opened", part of the structure in the
     * brackets should be multiplied correctly. Calculation should be represented (for our example):
     * Chemical Formula:
     * C13 H28
     * Molecular Weight:
     * 184.367
     * Exact Mass:
     * 184.219
     * Elemental Analysis:
     * C 84.7 H 15.3
     */

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/multiple-group-structure.mol',
    );
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('C13H28');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '184.367',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '184.219',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue('C 84.7 H 15.3');
  });

  test('Calculation for structure with S-group - Superatom (abbreviation)', async () => {
    /*
     * Test case: EPMLSOPKET-2010
     * Description: The brackets are ignored and calculation is represented as simple structrure.
     * Chemical Formula:
     * C12 H26
     * Molecular Weight:
     * 170.340
     * Exact Mass:
     * 170.203
     * Elemental Analysis:
     * C 84.6 H 15.4
     */

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/superatom-structure.mol',
    );
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('C12H26');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '170.340',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '170.203',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue('C 84.6 H 15.4');
  });

  test('Calculation for structure with S-group - Data S-group', async () => {
    /*
     * Test case: EPMLSOPKET-2011
     * Description: The presence of Data S-group is ignored and calculation is represented as simple structure.
     * Chemical Formula:
     * C17 H36
     * Molecular Weight:
     * 240.475
     * Exact Mass:
     * 240.282
     * Elemental Analysis:
     * C 84.9 H 15.1
     */

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/data-s-group-structure.mol',
    );
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('C17H36');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '240.475',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '240.282',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue('C 84.9 H 15.1');
  });

  test('(hetero-adduct)Calculation of exact mass for different types of structures', async () => {
    /*
     * Test case: EPMLSOPKET-1998
     * Description: The presence of Data S-group is ignored and calculation is represented as simple structure.
     * Chemical Formula:
     * C18 H12 O3
     * Molecular Weight:
     * 276.291
     * Exact Mass:
     * 276.079
     * Elemental Analysis:
     * C 78.3 H 4.4 O 17.4
     */

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/hetero-adduct.mol');
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('C18H12O3');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '276.291',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '276.079',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue('C 78.3 H 4.4 O 17.4');
  });

  test('(c14napthylbromide)Calculation of exact mass for different types of structures', async () => {
    /*
     * Test case: EPMLSOPKET-1998
     * Description: The presence of Data S-group is ignored and calculation is represented as simple structure.
     * Chemical Formula:
     * C10 14 CH9Br
     * Molecular Weight:
     * 223.086
     * Exact Mass:
     * 221.992
     * Elemental Analysis:
     * C 60.1 H 4.1 Br 35.8
     */

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/c14napthylbromide.mol');
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('C1014CH9Br');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '223.089',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '221.992',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue('C 60.1 H 4.1 Br 35.8');
  });

  test('Calculation for several reaction components', async () => {
    /*
     * Test case: EPMLSOPKET-2002
     * Description: Reaction components are calculated.
     * Chemical Formula:
     * [C2H4O2]+[C2H6O] > [C4H8O2]+[H2O]
     * Molecular Weight:
     * [60.052]+[46.069] > [88.106]+[18.015]
     * Exact Mass:
     * [60.021]+[46.042] > [88.052]+[18.011]
     * Elemental Analysis:
     * [C 40.0 H 6.7 O 53.3]+[C 52.1 H 13.1 O 34.7] > [C 54.5 H 9.2 O 36.3]+[H 11.2 O 88.8]
     */

    await openFileAndAddToCanvas(
      page,
      'Rxn-V2000/reaction-plus-and-arrows.rxn',
    );
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('[C2H4O2]+[C2H6O] > [C4H8O2]+[H2O]');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '[60.052]+[46.069] > [88.106]+[18.015]',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '[60.021]+[46.042] > [88.052]+[18.011]',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue(
      '[C 40.0 H 6.7 O 53.3]+[C 52.1 H 13.1 O 34.7] > [C 54.5 H 9.2 O 36.3]+[H 11.2 O 88.8]',
    );
  });

  test('Calculation for several reaction components(part of structure)', async () => {
    /*
     * Test case: EPMLSOPKET-2002
     * Description: Reaction components are calculated.
     * Chemical Formula:
     * [O]+[C2H6O]
     * Molecular Weight:
     * [15.999]+[46.069]
     * Exact Mass:
     * [15.995]+[46.042]
     * Elemental Analysis:
     * [O 100.0]+[C 52.1 H 13.1 O 34.7]
     */

    const xDelta = 500;
    const yDelta = 800;
    await openFileAndAddToCanvas(page, 'KET/reaction-arrow.ket');
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x - xDelta, y + yDelta, page);
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('[O]+[C2H6O]');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '[15.999]+[46.069]',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '[15.995]+[46.042]',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue('[O 100.0]+[C 52.1 H 13.1 O 34.7]');
  });

  test('Calculate result for structure with atom and bond properties', async () => {
    /*
     * Test case: EPMLSOPKET-1995
     * Description: Reaction components are calculated.
     * Chemical Formula:
     * C2H7
     * Molecular Weight:
     * 31.078
     * Exact Mass:
     * 31.055
     * Elemental Analysis:
     * C 77.3 H 22.7
     */

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/ethane-with-valence-and-stereobond.mol',
    );
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('C2H7');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '31.078',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '31.055',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue('C 77.3 H 22.7');
  });
});

test.describe('Calculated Values Tools', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });
  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

  test('Structure Check window', async () => {
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
      mask: [StructureCheckDialog(page).lastCheckInfo],
    });
  });
});
