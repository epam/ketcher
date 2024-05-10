import { test } from '@playwright/test';
import {
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
  selectRingButton,
  RingButton,
  selectAtomInToolbar,
  AtomButton,
  resetCurrentTool,
  selectLeftPanelToolClickAndScreenshot,
  attachOnTopOfBenzeneBonds,
  clickOnAtom,
  STRUCTURE_LIBRARY_BUTTON_NAME,
  waitForPageInit,
  selectDropdownTool,
  selectFunctionalGroups,
  moveOnAtom,
  waitForRender,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getRotationHandleCoordinates } from '@utils/clicks/selectButtonByTitle';

const X_DELTA = 300;

test.describe('Templates - Functional Group Tools', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
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
    const anyAtom = 0;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/functional-group-expanded.mol',
      page,
    );
    await selectDropdownTool(page, 'select-rectangle', 'select-fragment');
    await clickOnAtom(page, 'C', anyAtom);
  });

  test('Rotate of expanded Functional Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2900
    Description: All elements of the Functional Group are rotated
   */
    const COORDINATES_TO_PERFORM_ROTATION = {
      x: 20,
      y: 160,
    };
    await openFileAndAddToCanvas(
      'Molfiles-V2000/functional-group-expanded.mol',
      page,
    );

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await page.keyboard.press('Control+a');
    const coordinates = await getRotationHandleCoordinates(page);
    const { x: rotationHandleX, y: rotationHandleY } = coordinates;

    await page.mouse.move(rotationHandleX, rotationHandleY);
    await page.mouse.down();
    await page.mouse.move(
      COORDINATES_TO_PERFORM_ROTATION.x,
      COORDINATES_TO_PERFORM_ROTATION.y,
    );
    await page.mouse.up();
  });

  test('Rotate Tool (FG + Other structures)', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-3935
    Description: The selected Functional Group is rotated. Benzene ring is rotated.
   */
    const COORDINATES_TO_PERFORM_ROTATION = {
      x: 20,
      y: 160,
    };
    await openFileAndAddToCanvas(
      'Molfiles-V2000/expand-functional-group-with-benzene.mol',
      page,
    );

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await page.keyboard.press('Control+a');

    const coordinates = await getRotationHandleCoordinates(page);
    const { x: rotationHandleX, y: rotationHandleY } = coordinates;

    await page.mouse.move(rotationHandleX, rotationHandleY);
    await page.mouse.down();
    await page.mouse.move(
      COORDINATES_TO_PERFORM_ROTATION.x,
      COORDINATES_TO_PERFORM_ROTATION.y,
    );
    await page.mouse.up();
  });

  test('Add Charge to the Functional group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2913
    Description: EDIT ABBREVIATION window appears after click by Charge on expanded FG.
    After click Remove abbreviation in modal window user can add Charge to structure.
   */
    await openFileAndAddToCanvas('Molfiles-V2000/expanded-fg-CO2Et.mol', page);

    await selectLeftPanelButton(LeftPanelButton.ChargeMinus, page);
    await clickInTheMiddleOfTheScreen(page);
    await waitForRender(page, async () => {
      await pressButton(page, 'Remove Abbreviation');
    });

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
    await openFileAndAddToCanvas('Molfiles-V2000/expanded-fg-CO2Et.mol', page);

    await selectLeftPanelButton(LeftPanelButton.SingleBond, page);
    await clickInTheMiddleOfTheScreen(page);
    await waitForRender(page, async () => {
      await pressButton(page, 'Remove Abbreviation');
    });
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
    const anyAtom = 1;
    await openFileAndAddToCanvas('Molfiles-V2000/expanded-fg-CO2Et.mol', page);

    await selectLeftPanelButton(LeftPanelButton.Chain, page);
    await clickInTheMiddleOfTheScreen(page);
    await waitForRender(page, async () => {
      await pressButton(page, 'Remove Abbreviation');
    });
    await clickOnAtom(page, 'O', anyAtom);
    await dragMouseTo(x, y, page);
  });

  test('Add Atom to the expanded Functional group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2911
    Description: EDIT ABBREVIATION window appears after click by Chain on expanded FG.
    After click Remove abbreviation in modal window user can add Chain to structure.
   */
    await openFileAndAddToCanvas('Molfiles-V2000/expanded-fg-CO2Et.mol', page);

    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickInTheMiddleOfTheScreen(page);
    await waitForRender(page, async () => {
      await pressButton(page, 'Remove Abbreviation');
    });
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
    await selectFunctionalGroups(FunctionalGroups.CO2Et, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await page.getByText('CO2Et').first().click({ button: 'right' });
    await waitForRender(page, async () => {
      await page.getByText('Remove Abbreviation').click();
    });

    await selectTopPanelButton(TopPanelButton.Undo, page);
    await resetCurrentTool(page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
  });
});

test.describe('Templates - Functional Group Tools2', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
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
    await openFileAndAddToCanvas(
      'Molfiles-V2000/functional-group-expanded.mol',
      page,
    );

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
      'Molfiles-V2000/expand-functional-group-with-benzene.mol',
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
      'Molfiles-V2000/expand-functional-group-with-benzene.mol',
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

    await openFileAndAddToCanvas(
      'Molfiles-V2000/functional-group-expanded.mol',
      page,
    );
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
    await openFileAndAddToCanvas(
      'Molfiles-V2000/functional-group-expanded.mol',
      page,
    );

    await selectRingButton(RingButton.Benzene, page);
    point = await getAtomByIndex(page, { label: 'C' }, 0);
    await page.mouse.click(point.x, point.y);
    await waitForRender(page, async () => {
      await pressButton(page, 'Remove Abbreviation');
    });

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
    await selectFunctionalGroups(FunctionalGroups.Boc, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await clickInTheMiddleOfTheScreen(page, 'right');
    await waitForRender(page, async () => {
      await page.getByText('Expand Abbreviation').click();
    });
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await clickInTheMiddleOfTheScreen(page, 'right');
    await waitForRender(page, async () => {
      await page.getByText('Contract Abbreviation').click();
    });
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await clickInTheMiddleOfTheScreen(page, 'right');
    await waitForRender(page, async () => {
      await page.getByText('Remove Abbreviation').click();
    });
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
    await selectFunctionalGroups(FunctionalGroups.CO2Et, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await clickInTheMiddleOfTheScreen(page, 'right');
    await waitForRender(page, async () => {
      await page.getByText('Expand Abbreviation').click();
    });
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await clickInTheMiddleOfTheScreen(page, 'right');
    await waitForRender(page, async () => {
      await page.getByText('Contract Abbreviation').click();
    });
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
    await openFileAndAddToCanvas(
      'Molfiles-V2000/functional-group-expanded.mol',
      page,
    );

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Clear, page);

    await openFileAndAddToCanvas(
      'Molfiles-V2000/functional-group-expanded.mol',
      page,
    );

    await selectDropdownTool(page, 'select-rectangle', 'select-lasso');
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Expand Functional Group on a structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2917
    Description: Functional Group is expanded on a Benzene ring. No overlapping.
   */
    await openFileAndAddToCanvas('Molfiles-V2000/benzene-bond-fg.mol', page);
    await page.getByText('Boc').click({ button: 'right' });
    await waitForRender(page, async () => {
      await page.getByText('Expand Abbreviation').click();
    });
  });

  test('Contract Functional Group on a structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2918
    Description: Functional Group is contracted on a Benzene ring.
   */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/expanded-fg-benzene.mol',
      page,
    );
    await clickInTheMiddleOfTheScreen(page, 'right');
    await waitForRender(page, async () => {
      await page.getByText('Contract Abbreviation').click();
    });
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

    await openFileAndAddToCanvas(
      'Molfiles-V2000/benzene-with-two-bonds.mol',
      page,
    );
    await selectFunctionalGroups(FunctionalGroups.CO2Et, page);
    await page.mouse.click(clickCoordines.x1, clickCoordines.y1);
    await resetCurrentTool(page);

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
    await openFileAndAddToCanvas('Molfiles-V2000/benzene-with-bonds.mol', page);
    await clickInTheMiddleOfTheScreen(page);
    await selectFunctionalGroups(FunctionalGroups.Ac, page);
    await attachOnTopOfBenzeneBonds(page);
  });

  test('Functional Group replaced by atom', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-3994
    Description: The FG is replaced by Nitrogen atom
   */
    await selectFunctionalGroups(FunctionalGroups.FMOC, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickInTheMiddleOfTheScreen(page);
  });
});

test.describe('Templates - Functional Group Tools3', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
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
    const timeout = 120_000;
    test.setTimeout(timeout);
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
    await openFileAndAddToCanvas(
      'Molfiles-V2000/contracted-fg-abbreviation.mol',
      page,
    );
    await page.keyboard.press('Control+a');
    await page.getByText('Boc').click({ button: 'right' });
    await waitForRender(page, async () => {
      await page.getByText('Expand Abbreviation').click();
    });
    await takeEditorScreenshot(page);

    await page.keyboard.press('Control+a');
    await clickInTheMiddleOfTheScreen(page, 'right');
    await waitForRender(page, async () => {
      await page.getByText('Contract Abbreviation').click();
    });
    await takeEditorScreenshot(page);

    await page.keyboard.press('Control+a');
    const point = await getAtomByIndex(page, { label: 'C' }, 0);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await waitForRender(page, async () => {
      await page.getByText('Remove Abbreviation').click();
    });
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

  test('Check aromatize/dearomatize tool on FG', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2954
    Description: Two FG's are added. Aromatize funcion is selected, nothing happens.
    Dearomatize function is selected, nothing happens.
    */
    const clickCoordines = {
      x1: 560,
      y1: 360,
      x2: 700,
      y2: 360,
    };

    await selectFunctionalGroups(FunctionalGroups.Bn, page);
    await page.mouse.click(clickCoordines.x1, clickCoordines.y1);
    await resetCurrentTool(page);

    await selectFunctionalGroups(FunctionalGroups.Boc, page);
    await page.mouse.click(clickCoordines.x2, clickCoordines.y2);
    await resetCurrentTool(page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await page.getByText('Bn').click({ button: 'right' });
    await waitForRender(page, async () => {
      await page.getByText('Expand Abbreviation').click();
    });

    await selectTopPanelButton(TopPanelButton.Aromatize, page);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Dearomatize, page);
    await takeEditorScreenshot(page);
  });

  test('Check layout and cleanup buttons tool on FG', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2955
    Description: Two FG's are added,
    one Expanded and one Contracted.
    Layout button is selected, nothing happens.
    Clean Up button is selected, nothing happens.
    */

    const clickCoordines = {
      x1: 560,
      y1: 360,
      x2: 700,
      y2: 360,
    };

    await selectFunctionalGroups(FunctionalGroups.CCl3, page);
    await page.mouse.click(clickCoordines.x1, clickCoordines.y1);
    await resetCurrentTool(page);

    await selectFunctionalGroups(FunctionalGroups.C2H5, page);
    await page.mouse.click(clickCoordines.x2, clickCoordines.y2);
    await resetCurrentTool(page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await page.getByText('CCl3').click({ button: 'right' });
    await waitForRender(page, async () => {
      await page.getByText('Expand Abbreviation').click();
    });

    await waitForRender(page, async () => {
      await selectTopPanelButton(TopPanelButton.Layout, page);
    });
    await takeEditorScreenshot(page);

    await waitForRender(page, async () => {
      await selectTopPanelButton(TopPanelButton.Clean, page);
    });
    await takeEditorScreenshot(page);
  });

  test('Check structure on canvas when atom is hovered and Functional Group selected using hotkey', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-12970
    Description: Structure on canvas remains unchanged
   */
    const anyAtom = 2;
    const x = 300;
    const y = 300;
    await openFileAndAddToCanvas('KET/chain.ket', page);
    await moveOnAtom(page, 'C', anyAtom);
    await page.keyboard.press('Shift+f');
    await page.getByText('Boc').click();
    await page.mouse.click(x, y);
    await takeEditorScreenshot(page);
  });

  test('Hotkeys for atoms work on Functional Groups abbreviations', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15503
    Description: Oxygen atoms replace a Functional Groups abbreviations on canvas
   */
    await selectFunctionalGroups(FunctionalGroups.Boc, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('n');
    await takeEditorScreenshot(page);
  });

  test('Attach copied Functional Group to atoms of structure', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-16925
    Description: Can attach copied Functional Group to atoms of structure
   */
    const anyAtom = 4;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/functional-group-and-benzene.mol',
      page,
    );
    await page.getByText('Boc').click();
    await page.keyboard.press('Control+c');
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+v');
    });
    await waitForRender(page, async () => {
      await clickOnAtom(page, 'C', anyAtom);
    });
    await takeEditorScreenshot(page);
  });

  test('Attach cutted Functional Group to atoms of structure', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-18058
    Description: Can attach cutted Functional Group to atoms of structure
    Test not working proberly right now. Bug https://github.com/epam/ketcher/issues/2660
   */
    test.fail();
    const anyAtom = 4;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/functional-group-and-benzene.mol',
      page,
    );
    await waitForRender(page, async () => {
      await page.getByText('Boc').click();
    });
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+x');
    });
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+v');
    });
    await waitForRender(page, async () => {
      await clickOnAtom(page, 'C', anyAtom);
    });
    await takeEditorScreenshot(page);
  });

  test('Contracted Functional Group in 3D Viewer', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-3938
    Description: Contracted Functional Group shown as expanded in 3D view
   */
    await selectFunctionalGroups(FunctionalGroups.Boc, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.ThreeD, page);
    await takeEditorScreenshot(page);
  });
});
