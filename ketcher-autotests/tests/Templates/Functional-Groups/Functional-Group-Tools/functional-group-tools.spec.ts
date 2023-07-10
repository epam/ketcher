/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  selectFunctionalGroups,
  selectTopPanelButton,
  TopPanelButton,
  FunctionalGroups,
  openFileAndAddToCanvas,
  pressButton,
  clickInTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  getCoordinatesOfTheMiddleOfTheScreen,
  dragMouseTo,
  takeEditorScreenshot,
  selectLeftPanelButton,
  LeftPanelButton,
  delay,
  selectRingButton,
  RingButton,
  selectAtomInToolbar,
  AtomButton,
  resetCurrentTool,
  selectLeftPanelToolClickAndScreenshot,
  attachOnTopOfBenzeneBonds,
  DELAY_IN_SECONDS,
  clickOnAtom,
  SelectTool,
  selectNestedTool,
  STRUCTURE_LIBRARY_BUTTON_NAME,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';

const X_DELTA = 300;

test.describe('Templates - Functional Group Tools', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Add a Bond to a contracted Functional Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-10086
    Description: A bond is added to a contracted functional group and form a bond
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.Boc, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.SingleBond, page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Add a Chain to a contracted Functional Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-10087
    Description: A chain is added to a contracted functional group and form a bond
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.FMOC, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.Chain, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + X_DELTA;
    await dragMouseTo(coordinatesWithShift, y, page);
  });

  test('Fragment Selection of expanded Functional Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2889
    Description: All the Functional Group elements are selected and highlighted on the canvas
   */
    await openFileAndAddToCanvas('functional-group-expanded.mol', page);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectNestedTool(page, SelectTool.FRAGMENT_SELECTION);
    await clickOnAtom(page, 'C', 0);
  });

  test.fixme('Rotate of expanded Functional Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2900
    Description: All elements of the Functional Group are rotated
   */
    await openFileAndAddToCanvas('functional-group-expanded.mol', page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await clickInTheMiddleOfTheScreen(page);

    // const { x, y } = await getRotationHandleCoordinates(page);
    // await page.mouse.move(x, y);
    // await dragMouseTo(x - 100, y, page);
  });

  test.fixme('Rotate Tool (FG + Other structures)', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-3935
    Description: The selected Functional Group is rotated. Benzene ring is not rotated.
   */
    await openFileAndAddToCanvas(
      'expand-functional-group-with-benzene.mol',
      page,
    );

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await page.keyboard.press('Control+a');

    // const { x, y } = await getRotationHandleCoordinates(page);
    // await page.mouse.move(x, y);
    // await dragMouseTo(x + 100, y + 100, page);
  });

  test('Add Charge to the Functional group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2913
    Description: EDIT ABBREVIATION window appears after click by Charge on expanded FG.
    After click Remove abbreviation in modal window user can add Charge to structure.
   */
    await openFileAndAddToCanvas('expanded-fg-CO2Et.mol', page);

    await selectLeftPanelButton(LeftPanelButton.ChargeMinus, page);
    await clickInTheMiddleOfTheScreen(page);
    await pressButton(page, 'Remove Abbreviation');

    await selectLeftPanelButton(LeftPanelButton.ChargePlus, page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Dragging a selected Functional Group not duplicates it', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-8938
    Description: A duplicate is not created, the original Functional Group is dragged with the cursor
   */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.CO2Et, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + X_DELTA;
    await dragMouseTo(coordinatesWithShift, y, page);
  });

  test('Add Bond to the expanded Functional group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2908
    Description: EDIT ABBREVIATION window appears after click by Bond on expanded FG.
    After click Remove abbreviation in modal window user can add Bond to structure.
   */
    await openFileAndAddToCanvas('expanded-fg-CO2Et.mol', page);

    await selectLeftPanelButton(LeftPanelButton.SingleBond, page);
    await clickInTheMiddleOfTheScreen(page);
    await pressButton(page, 'Remove Abbreviation');
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Add Chain to the expanded Functional group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2910
    Description: EDIT ABBREVIATION window appears after click by Chain on expanded FG.
    After click Remove abbreviation in modal window user can add Chain to structure.
   */
    const x = 650;
    const y = 650;
    await openFileAndAddToCanvas('expanded-fg-CO2Et.mol', page);

    await selectLeftPanelButton(LeftPanelButton.Chain, page);
    await clickInTheMiddleOfTheScreen(page);
    await pressButton(page, 'Remove Abbreviation');
    await clickOnAtom(page, 'O', 1);
    // const coordinatesWithShift = y + Y_DELTA;
    await dragMouseTo(x, y, page);
  });

  test('Add Atom to the expanded Functional group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2911
    Description: EDIT ABBREVIATION window appears after click by Chain on expanded FG.
    After click Remove abbreviation in modal window user can add Chain to structure.
   */
    await openFileAndAddToCanvas('expanded-fg-CO2Et.mol', page);

    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickInTheMiddleOfTheScreen(page);
    await pressButton(page, 'Remove Abbreviation');
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Remove Abbreviation and Undo/Redo action for Functional group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2907
    Description: A modal window appears. Window contains two options: 'Expand Abbreviation', 'Remove Abbreviation'.
    FG is removed (ungrouped and displayed in expanded view).
    FG is contracted.
    FG is removed (ungrouped and displayed in expanded view).
   */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.CO2Et, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await page.getByText('CO2Et').first().click({ button: 'right' });
    await page.getByText('Remove Abbreviation').click();

    await selectTopPanelButton(TopPanelButton.Undo, page);
    await resetCurrentTool(page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
  });
});

test.describe('Templates - Functional Group Tools2', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('EDIT ABBREVIATION window appears after click on expanded Functional Group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2909
    Description: EDIT ABBREVIATION window appears after click by Bond tool on expanded FG and
    after click Cancel in modal window FG still have brackets.
   */
    await openFileAndAddToCanvas('functional-group-expanded.mol', page);

    await selectLeftPanelButton(LeftPanelButton.SingleBond, page);
    const point = await getAtomByIndex(page, { label: 'C' }, 0);
    await page.mouse.click(point.x, point.y);

    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await pressButton(page, 'Cancel');
  });

  test('Vertical Flip of expanded Functional Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2928
    Description: If only FG is selected then only
    FG is flipped 180 degrees in the vertical direction;
    If nothing is selected then all the structures
    on the canvas are flipped 180 degrees in the vertical direction
   */
    await openFileAndAddToCanvas(
      'expand-functional-group-with-benzene.mol',
      page,
    );
    await page.keyboard.press('Control+a');
    await pressButton(page, 'Vertical Flip (Alt+V)');

    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await clickInTheMiddleOfTheScreen(page);

    await pressButton(page, 'Vertical Flip (Alt+V)');
  });

  test('Horizontal Flip of expanded Functional Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2928
    Description: If only FG is selected then only
    FG is flipped 180 degrees in the horizontal direction;
    If nothing is selected then all the structures
    on the canvas are flipped 180 degrees in the horizontal direction
   */
    await openFileAndAddToCanvas(
      'expand-functional-group-with-benzene.mol',
      page,
    );

    await page.keyboard.press('Control+a');
    await pressButton(page, 'Horizontal Flip (Alt+H)');

    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await clickInTheMiddleOfTheScreen(page);

    await pressButton(page, 'Horizontal Flip (Alt+H)');
  });

  test('Erase of contracted and expanded Functional Group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2901
    Description: Contracted Functional Group is removed after click with Erase tool;
    Expanded Functional Group is removed if were selected by Rectangle selection;
    EDIT ABBREVIATION window appears if click by Erase tool on expanded FG without selection.
   */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.Boc, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await page.getByText('Boc').first().click();

    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);
    await page.getByText('Boc').first().click();
    await selectLeftPanelButton(LeftPanelButton.Erase, page);

    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await openFileAndAddToCanvas('functional-group-expanded.mol', page);
    await page.keyboard.press('Control+a');
    await page.getByTestId('delete').click();
  });

  test('Add Template to the Functional group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2912
    Description: EDIT ABBREVIATION window appears after click by Template on expanded FG.
    After click Remove abbreviation in modal window user can add Template to structure.
   */
    let point: { x: number; y: number };
    await openFileAndAddToCanvas('functional-group-expanded.mol', page);

    await selectRingButton(RingButton.Benzene, page);
    point = await getAtomByIndex(page, { label: 'C' }, 0);
    await page.mouse.click(point.x, point.y);
    await pressButton(page, 'Remove Abbreviation');

    await takeEditorScreenshot(page);

    await selectRingButton(RingButton.Cyclopentadiene, page);
    point = await getAtomByIndex(page, { label: 'C' }, 0);
    await page.mouse.click(point.x, point.y);
  });

  test('Expand/Contract/Remove Abbreviation of Functional Group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2914
    Description: 1)Functional group is expanded. 2)Functional group is contracted.
    3)Functional group is ungrouped and displayed in expanded view.
    The 'Remove Abbreviation' option does not remove the atoms and bonds.
   */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.Boc, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await clickInTheMiddleOfTheScreen(page, 'right');
    await page.getByText('Expand Abbreviation').click();
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await clickInTheMiddleOfTheScreen(page, 'right');
    await page.getByText('Contract Abbreviation').click();
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await clickInTheMiddleOfTheScreen(page, 'right');
    await page.getByText('Remove Abbreviation').click();
    await resetCurrentTool(page);
  });

  test('Expand/Contract Abbreviation of Functional Group and Undo/Redo action', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2904
    Description: 'Expand/Contract Abbreviation' button can work several times on the same FG.
    Undo/Redo actions are correct expand and contract Functional Group.
   */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.CO2Et, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await clickInTheMiddleOfTheScreen(page, 'right');
    await page.getByText('Expand Abbreviation').click();
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await clickInTheMiddleOfTheScreen(page, 'right');
    await page.getByText('Contract Abbreviation').click();
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
  });

  test('Rectangle and Lasso Selection of expanded Functional Group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2888
    Description: All the Functional Group elements are selected and highlighted on the canvas
   */
    await openFileAndAddToCanvas('functional-group-expanded.mol', page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Clear, page);

    await openFileAndAddToCanvas('functional-group-expanded.mol', page);

    await delay(DELAY_IN_SECONDS.THREE);
    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await page.getByRole('button', { name: 'Lasso Selection (Esc)' }).click();
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Expand Functional Group on a structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2917
    Description: Functional Group is expanded on a Benzene ring. No overlapping.
   */
    await openFileAndAddToCanvas('benzene-bond-fg.mol', page);
    await page.getByText('Boc').click({ button: 'right' });
    await page.getByText('Expand Abbreviation').click();
  });

  test('Contract Functional Group on a structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2918
    Description: Functional Group is contracted on a Benzene ring.
   */
    await openFileAndAddToCanvas('expanded-fg-benzene.mol', page);
    await clickInTheMiddleOfTheScreen(page, 'right');
    await page.getByText('Contract Abbreviation').click();
  });

  test('Bond between Functional Group and structure not disappears after adding Functional Group again', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-10085
    Description: Added Functional Group replaces the existing one and the bond remains in place
   */
    const clickCoordines = {
      x1: 560,
      y1: 360,
      x2: 700,
      y2: 360,
    };

    await openFileAndAddToCanvas('benzene-with-two-bonds.mol', page);
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.CO2Et, page);
    await page.mouse.click(clickCoordines.x1, clickCoordines.y1);
    await resetCurrentTool(page);

    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.CPh3, page);
    await page.mouse.click(clickCoordines.x2, clickCoordines.y2);
  });

  test('The Functional Group is added to all top of the bonds', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-8927
    Description: The Functional Group is added to all bonds without errors and distortions
   */
    await openFileAndAddToCanvas('benzene-with-bonds.mol', page);
    await clickInTheMiddleOfTheScreen(page);
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.Ac, page);
    await attachOnTopOfBenzeneBonds(page);
  });

  test('Functional Group replaced by atom', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-3994
    Description: The FG is replaced by Nitrogen atom
   */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.FMOC, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickInTheMiddleOfTheScreen(page);
  });
});

test.describe('Templates - Functional Group Tools3', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('Filtering Functional Groups', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2930
    Description: All FG's which contain symbols 'C2' are displayed on FG's window.
    All FG's which contain symbols 'Y' are displayed on FG's window.
   */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await page.getByPlaceholder('Search by elements...').click();
    await page.keyboard.press('C');
    await page.keyboard.press('2');
    await takeEditorScreenshot(page);

    await page.getByRole('banner').getByRole('button').click();

    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByPlaceholder('Search by elements...').click();
    await page.keyboard.press('Y');
    await takeEditorScreenshot(page);
  });

  test('Expand/Remove abbreviation context menu with selected tools', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-3933
    Description:  Functional Group-Expand/Remove abbreviation context menu is shown
   */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.CO2Et, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelToolClickAndScreenshot(LeftPanelButton.HandTool, page);
    await selectLeftPanelToolClickAndScreenshot(
      LeftPanelButton.RectangleSelection,
      page,
    );
    await selectLeftPanelToolClickAndScreenshot(LeftPanelButton.Erase, page);
    await selectLeftPanelToolClickAndScreenshot(
      LeftPanelButton.SingleBond,
      page,
    );
    await selectLeftPanelToolClickAndScreenshot(LeftPanelButton.Chain, page);
    await selectLeftPanelToolClickAndScreenshot(
      LeftPanelButton.ChargePlus,
      page,
    );
    await selectLeftPanelToolClickAndScreenshot(
      LeftPanelButton.ChargeMinus,
      page,
    );

    await selectLeftPanelToolClickAndScreenshot(LeftPanelButton.S_Group, page);
    await selectLeftPanelToolClickAndScreenshot(
      LeftPanelButton.ReactionPlusTool,
      page,
    );
    await selectLeftPanelToolClickAndScreenshot(
      LeftPanelButton.ArrowOpenAngleTool,
      page,
    );
    await selectLeftPanelToolClickAndScreenshot(
      LeftPanelButton.ReactionMappingTool,
      page,
    );
    await selectLeftPanelToolClickAndScreenshot(
      LeftPanelButton.R_GroupLabelTool,
      page,
    );
    await selectLeftPanelToolClickAndScreenshot(
      LeftPanelButton.ShapeEllipse,
      page,
    );
    await selectLeftPanelToolClickAndScreenshot(LeftPanelButton.AddText, page);

    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page, 'right');
    await takeEditorScreenshot(page);

    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickInTheMiddleOfTheScreen(page, 'right');
    await takeEditorScreenshot(page);
  });

  test('Expand/Contract/Remove Abbreviation with multiple FG', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2902
    Description: 1) All selected FG's are expanded.
    2) All selected FG's are contracted. 3) All selected FG's abbreviations are removed.
   */
    await openFileAndAddToCanvas('contracted-fg-abbreviation.mol', page);
    await page.keyboard.press('Control+a');
    await page.getByText('Boc').click({ button: 'right' });
    await page.getByText('Expand Abbreviation').click();
    await takeEditorScreenshot(page);

    await page.keyboard.press('Control+a');
    await clickInTheMiddleOfTheScreen(page, 'right');
    await page.getByText('Contract Abbreviation').click();
    await takeEditorScreenshot(page);

    await page.keyboard.press('Control+a');
    const point = await getAtomByIndex(page, { label: 'C' }, 0);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Remove Abbreviation').click();
    await takeEditorScreenshot(page);
  });

  test('Save to SDF', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2931
    Description: FG is downloaded ('ketcher-fg-tmpls.sdf' file). File contains all FG's from library
   */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await pressButton(page, 'Save to SDF');
  });
});
