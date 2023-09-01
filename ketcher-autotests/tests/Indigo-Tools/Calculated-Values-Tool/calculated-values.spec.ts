/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  selectTopPanelButton,
  openFileAndAddToCanvas,
  TopPanelButton,
  takeEditorScreenshot,
  BondType,
  dragMouseTo,
  selectRingButton,
  RingButton,
  clickInTheMiddleOfTheScreen,
  getCoordinatesOfTheMiddleOfTheScreen,
  selectAtomInToolbar,
  AtomButton,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getBondByIndex } from '@utils/canvas/bonds';

test.describe('Calculated Values Tools', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Calculate selected structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1991
    Description: The 'Calculated Values' modal window is opened,
    the 'Chemical Formula' field contains 'C7H16' value.
    */
    await openFileAndAddToCanvas('Ket/calculated-values-chain.ket', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
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
    await selectTopPanelButton(TopPanelButton.Calculated, page);
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
    await openFileAndAddToCanvas('calculated-values-rings.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);

    await takeEditorScreenshot(page);

    await page.getByText('Decimal places3').first().click();
    await page.getByRole('option', { name: '2' }).click();
    await page.getByText('Decimal places3').click();
    await page.getByRole('option', { name: '2' }).click();
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
    await openFileAndAddToCanvas('calcvalues-reaction.rxn', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);

    await takeEditorScreenshot(page);

    await page.getByText('Decimal places3').first().click();
    await page.getByRole('option', { name: '1' }).click();
    await page.getByText('Decimal places3').click();
    await page.getByRole('option', { name: '1' }).click();
  });

  test('The calculation result for a substructure with existing but not selected query features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2000
    Description: The calculation result for a substructure with not selected query features should be correct.
    */
    let point: { x: number; y: number };
    await openFileAndAddToCanvas('query-structure.mol', page);

    point = await getBondByIndex(page, { type: BondType.SINGLE }, 3);
    await page.keyboard.down('Shift');
    await page.mouse.click(point.x, point.y);
    point = await getBondByIndex(page, { type: BondType.SINGLE }, 4);
    await page.mouse.click(point.x, point.y);
    point = await getBondByIndex(page, { type: BondType.SINGLE }, 5);
    await page.mouse.click(point.x, point.y);
    await page.keyboard.up('Shift');

    await selectTopPanelButton(TopPanelButton.Calculated, page);
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
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);

    await takeEditorScreenshot(page);

    await page.getByText('Decimal places3').first().click();
    await page.getByRole('option', { name: '1' }).click();
    await page.getByText('Decimal places3').click();
    await page.getByRole('option', { name: '1' }).click();
  });

  test('Validate the Calculation of exact mass for a part of molecule', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1999
    Description: Calculated values dialog appears, the exact mass of
    the chosen fragment (C9H9O2) is 149.060
    */
    const xDelta = 300;
    const yDelta = 600;
    await openFileAndAddToCanvas('ritalin.mol', page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + xDelta, y - yDelta, page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('Calculation of exact mass for the reaction components', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2001
    Description: Calculation of exact mass for the reaction
    should be correct: '[78.047] > [155.957]'.
    */
    await openFileAndAddToCanvas('benzene-bromination.rxn', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
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
    await selectAtomInToolbar(AtomButton.Sulfur, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
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
    await openFileAndAddToCanvas('r-group-label.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('Calculations for Rgroup Root Structure without Rgroup Label', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2004
    Description: If the R-group label is absent in the selected object the calculation is represented
    in the common way (as simple structure).
    */
    const xDelta = 200;
    const yDelta = 200;
    await openFileAndAddToCanvas('r-group-label.mol', page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + xDelta, y + yDelta, page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('Calculations for Rgroup member', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2005
    Description: Regardless of the method of selection all fields contain
    'Cannot calculate properties for RGroups' message.
    */
    await openFileAndAddToCanvas('r-group-all-chain.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('Calculations for Rgroup member (select part of structure)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2005
    Description: Regardless of the method of selection all fields contain
    'Cannot calculate properties for RGroups' message.
    */
    const xDelta = 100;
    const yDelta = 100;
    await openFileAndAddToCanvas('r-group-all-chain.mol', page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + xDelta, y + yDelta, page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('Calculations for the structure with R-group Attachment points', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2006
    Description: If the selected object contains the attachment points (or nothing is selected)
    all fields contain the 'Cannot calculate properties for RGroups' message.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/attachment-points-structure.mol',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('Calculations for the structure with R-group Attachment points (select part of structure)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2006
    Description: If the Rgroup attachment point is absent in the selected object the calculation is
    represented in the common way (as simple structure).
    */
    const xDelta = 100;
    const yDelta = 100;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/attachment-points-structure.mol',
      page,
    );
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x + xDelta, y + yDelta, page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
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
    await openFileAndAddToCanvas('sru-polymer-structure.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
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
    await openFileAndAddToCanvas('multiple-group-structure.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
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
    await openFileAndAddToCanvas('superatom-structure.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
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
    await openFileAndAddToCanvas('data-s-group-structure.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('(a-query-non-hsub)Test Calculations with Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the selected object contains the Query Feature all fields contain the 'Cannot
    calculate properties for structures with query features' message.
    */
    await openFileAndAddToCanvas('Molfiles-V3000/a-query-non-hsub.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('(a-query-unsaturated)Test Calculations with Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the selected object contains the Query Feature all fields contain the 'Cannot
    calculate properties for structures with query features' message.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V3000/a-query-unsaturated.mol',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('(a-query-ring-bonds)Test Calculations with Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the selected object contains the Query Feature all fields contain the 'Cannot
    calculate properties for structures with query features' message.
    */
    await openFileAndAddToCanvas('Molfiles-V3000/a-query-ring-bonds.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('(a-query-aq)Test Calculations with Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the selected object contains the Query Feature all fields contain the 'Cannot
    calculate properties for structures with query features' message.
    */
    await openFileAndAddToCanvas('Molfiles-V3000/a-query-aq.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('(a-query-atom-list)Test Calculations with Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the selected object contains the Query Feature all fields contain the 'Cannot
    calculate properties for structures with query features' message.
    */
    await openFileAndAddToCanvas('Molfiles-V3000/a-query-atom-list.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('(a-query-not-list)Test Calculations with Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the selected object contains the Query Feature all fields contain the 'Cannot
    calculate properties for structures with query features' message.
    */
    await openFileAndAddToCanvas('Molfiles-V3000/a-query-not-list.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('(a-query-non-hsub)Test Calculations with part of Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the Query Feature(s) is absent in the selected object the calculation is
    represented in the common way (as simple structure).
    */
    await openFileAndAddToCanvas('Molfiles-V3000/a-query-non-hsub.mol', page);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await page.mouse.click(point.x, point.y);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('(a-query-unsaturated)Test Calculations with part of Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the Query Feature(s) is absent in the selected object the calculation is
    represented in the common way (as simple structure).
    */
    await openFileAndAddToCanvas(
      'Molfiles-V3000/a-query-unsaturated.mol',
      page,
    );
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await page.mouse.click(point.x, point.y);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('(a-query-ring-bonds)Test Calculations with part of Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the Query Feature(s) is absent in the selected object the calculation is
    represented in the common way (as simple structure).
    */
    await openFileAndAddToCanvas('Molfiles-V3000/a-query-ring-bonds.mol', page);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await page.mouse.click(point.x, point.y);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('(a-query-aq)Test Calculations with part of Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the Query Feature(s) is absent in the selected object the calculation is
    represented in the common way (as simple structure).
    */
    await openFileAndAddToCanvas('Molfiles-V3000/a-query-aq.mol', page);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await page.mouse.click(point.x, point.y);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('(a-query-atom-list)Test Calculations with part of Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the Query Feature(s) is absent in the selected object the calculation is
    represented in the common way (as simple structure).
    */
    await openFileAndAddToCanvas('Molfiles-V3000/a-query-atom-list.mol', page);
    const point = await getAtomByIndex(page, { label: 'C' }, 0);
    await page.mouse.click(point.x, point.y);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('(a-query-not-list)Test Calculations with part of Structures Containing Atom Query Features', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2012
    Description: If the Query Feature(s) is absent in the selected object the calculation is
    represented in the common way (as simple structure).
    */
    await openFileAndAddToCanvas('Molfiles-V3000/a-query-not-list.mol', page);
    const point = await getAtomByIndex(page, { label: 'C' }, 0);
    await page.mouse.click(point.x, point.y);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
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
    276.089
    Elemental Analysis:
    C 78.3 H 4.4 O 17.4
    */
    await openFileAndAddToCanvas('hetero-adduct.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
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
    223.06
    Exact Mass:
    221.992
    Elemental Analysis:
    C 60.1 H 4.1 Br 35.8
    */
    await openFileAndAddToCanvas('c14napthylbromide.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('(dgln-atomlist)Calculation of exact mass for different types of structures', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1998
    Description: If the selected object contains the Query Feature all fields contain the 'Cannot
    calculate properties for structures with query features' message.
    */
    await openFileAndAddToCanvas('dgln-atomlist.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
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
    await openFileAndAddToCanvas('reaction-plus-and-arrows.rxn', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
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
    const xDelta = 500;
    const yDelta = 800;
    await openFileAndAddToCanvas('Ket/reaction-arrow.ket', page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await dragMouseTo(x - xDelta, y + yDelta, page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
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
    await openFileAndAddToCanvas(
      'ethane-with-valence-and-stereobond.mol',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });
});

test.describe('Calculated Values Tools', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
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
    await selectTopPanelButton(TopPanelButton.Check, page);
    await takeEditorScreenshot(page, {
      masks: [page.locator('[class*="Check-module_checkInfo"] > span')],
    });
  });
});
