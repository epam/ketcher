/* eslint-disable no-magic-numbers */
import { Page, expect, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  selectRing,
  RingButton,
  clickInTheMiddleOfTheScreen,
  clickOnAtom,
  moveOnAtom,
  moveOnBond,
  BondType,
  pressButton,
  selectNestedTool,
  SelectTool,
  delay,
  DELAY_IN_SECONDS,
  selectLeftPanelButton,
  LeftPanelButton,
  fillFieldByPlaceholder,
  dragMouseTo,
  takeLeftToolbarScreenshot,
  waitForPageInit,
  waitForRender,
  selectFunctionalGroups,
  FunctionalGroups,
  drawFGAndDrag,
  selectDropdownTool,
  takePageScreenshot,
  moveMouseToTheMiddleOfTheScreen,
  resetCurrentTool,
  drawBenzeneRing,
  clickOnTheCanvas,
  getCoordinatesOfTheMiddleOfTheScreen,
  clickOnBond,
  STRUCTURE_LIBRARY_BUTTON_NAME,
  selectUserTemplate,
  TemplateLibrary,
  selectTopPanelButton,
  TopPanelButton,
  AtomButton,
  selectAtomInToolbar,
} from '@utils';

async function moveElement(
  page: Page,
  atomLabel: string,
  atomNumber: number,
  xShiftForElement = 350,
  yShiftForElement = 150,
) {
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  const pointXToMoveElement = x - xShiftForElement;
  const pointYToMoveElement = y - yShiftForElement;

  await page.getByTestId('hand').click();
  await moveOnAtom(page, atomLabel, atomNumber);
  await dragMouseTo(pointXToMoveElement, pointYToMoveElement, page);
}

test.describe('Selection tools', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Selection is not reset when using context menu', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-8925
    Description: Selection is not reset. User can use right-click menu in order to perform actions.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Control+a');
    await clickOnAtom(page, 'C', 0, 'right');
  });

  test('Using rounded rectangles for selection of bonds and atom labels', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-12975
    Description: Selected bonds and atom labels with more than 1 symbol (e.g. "OH", "CH3")
    are highlighted with rounded rectangles.
    */
    await openFileAndAddToCanvas('KET/atoms-and-bonds.ket', page);
    await page.keyboard.press('Control+a');
  });

  test('Pressing atoms hotkey when atoms are selected', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-12979
    Description: Selected atoms are replaces with those assigned to the hotkey.
    Selected tool remains active and the atom does not appear under mouse cursor.
    */
    await openFileAndAddToCanvas('KET/two-atoms.ket', page);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('o');
  });

  test('Hovering of selected Atom', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-13008
    Description: When hovered selected Atom becomes lighter than the rest of the structure.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Control+a');
    await moveOnAtom(page, 'C', 0);
  });

  test('Hovering of selected Bond', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-13008
    Description: When hovered selected Bond becomes lighter than the rest of the structure.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Control+a');
    await moveOnBond(page, BondType.SINGLE, 0);
  });

  test('Verify flipping horizontally with multiple disconnected structures selected', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15508
    Description: All selected structures are flipped horizontally based on the selection box origin.
    */
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await page.keyboard.press('Control+a');
    await pressButton(page, 'Horizontal Flip (Alt+H)');
  });

  test('Verify flipping vertically with multiple disconnected structures selected', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15509
    Description: All selected structures are flipped horizontally based on the selection box origin.
    */
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await page.keyboard.press('Control+a');
    await pressButton(page, 'Vertical Flip (Alt+V)');
  });

  test('Verify deletion of selected structures', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-15510
    Description: All selected structures are deleted from the canvas.
    */
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await page.keyboard.press('Control+a');
    await page.getByTestId('delete').click();
  });

  test('(50px to Down) Structure Movement with Arrow Keys (1px move)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15512
    Description: The selected structure should move 1 pixel in the corresponding
    direction with each key press. In this test to 50px Down.
    */
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await takeEditorScreenshot(page);
    await page.keyboard.press('Control+a');
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press('ArrowDown');
    }
  });

  test('(50px to Up) Structure Movement with Arrow Keys (1px move)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15512
    Description: The selected structure should move 1 pixel in the corresponding
    direction with each key press. In this test to 50px Up.
    */
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await takeEditorScreenshot(page);
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+a');
    });
    for (let i = 0; i < 50; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('ArrowUp');
      });
    }
  });

  test('(50px to Right) Structure Movement with Arrow Keys (1px move)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15512
    Description: The selected structure should move 1 pixel in the corresponding
    direction with each key press. In this test to 50px Right.
    */
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await takeEditorScreenshot(page);
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+a');
    });
    for (let i = 0; i < 50; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('ArrowRight');
      });
    }
  });

  test('(50px to Left) Structure Movement with Arrow Keys (1px move)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15512
    Description: The selected structure should move 1 pixel in the corresponding
    direction with each key press. In this test to 50px Left.
    */
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await takeEditorScreenshot(page);
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+a');
    });
    for (let i = 0; i < 50; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('ArrowLeft');
      });
    }
  });

  test('(100px to Down with Shift key) Structure Movement with Arrow Keys (10px move)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15512
    Description: The selected structure should move 10 pixel in the corresponding
    direction with each key press with Shift key. In this test to 100px Down.
    */
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await takeEditorScreenshot(page);
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+a');
    });
    await page.keyboard.down('Shift');
    for (let i = 0; i < 10; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('ArrowDown');
      });
    }
    await page.keyboard.up('Shift');
  });

  test('(100px to Up with Shift key) Structure Movement with Arrow Keys (10px move)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15512
    Description: The selected structure should move 10 pixel in the corresponding
    direction with each key press with Shift key. In this test to 100px Up.
    */
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await takeEditorScreenshot(page);
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+a');
    });
    await page.keyboard.down('Shift');
    for (let i = 0; i < 10; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('ArrowUp');
      });
    }
    await page.keyboard.up('Shift');
  });

  test('(100px to Right with Shift key) Structure Movement with Arrow Keys (10px move)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15512
    Description: The selected structure should move 10 pixel in the corresponding
    direction with each key presswith Shift key. In this test to 100px Right.
    */
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await takeEditorScreenshot(page);
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+a');
    });
    await page.keyboard.down('Shift');
    for (let i = 0; i < 10; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('ArrowRight');
      });
    }
    await page.keyboard.up('Shift');
  });

  test('(100px to Left with Shift key) Structure Movement with Arrow Keys (10px move)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15512
    Description: The selected structure should move 10 pixel in the corresponding
    direction with each key press with Shift key. In this test to 100px Left.
    */
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await takeEditorScreenshot(page);
    await waitForRender(page, async () => {
      await page.keyboard.press('Control+a');
    });
    await page.keyboard.down('Shift');
    for (let i = 0; i < 10; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('ArrowLeft');
      });
    }
    await page.keyboard.up('Shift');
  });

  test('Field value text when placed on a structure becomes hard to access', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-12974
    Description: User can easily select 'Field value' text and move to desired location.
    */
    const pointx = 580;
    const pointy = 400;

    const pointx1 = 750;
    const pointy1 = 300;
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    await clickOnAtom(page, 'C', 0);
    await fillFieldByPlaceholder(page, 'Enter name', 'Test');
    await fillFieldByPlaceholder(page, 'Enter value', '33');
    await pressButton(page, 'Apply');

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await page.getByText('33', { exact: true }).click();
    await dragMouseTo(pointx, pointy, page);
    await takeEditorScreenshot(page);

    await page.getByText('33', { exact: true }).click();
    await dragMouseTo(pointx1, pointy1, page);
  });
});

test.describe('Selection tools', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Selection tools is not change when user press ESC button', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-10074
    Description: If user presses esc, then last chosen selected tool must be
    selected and pressing esc doesn't choose another mode of selection tool
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Control+a');
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('Escape');
    }
    await expect(page).toHaveScreenshot();
  });

  test('Verify removal of current flip and rotation buttons in the left toolbar', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15511
    Description: The flip and rotation buttons are no longer present in the left toolbar.
    */
    await takeLeftToolbarScreenshot(page);
  });

  test('Canvas Expansion when Structure is Moved Outside Down', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15514
    Description: The canvas should automatically expand in the direction the structure is being moved.
    */
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectNestedTool(page, SelectTool.FRAGMENT_SELECTION);
    await clickOnAtom(page, 'N', 0);
    await page.keyboard.down('Shift');
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press('ArrowDown');
    }
    await page.keyboard.up('Shift');
    await expect(page).toHaveScreenshot();
  });

  test('Canvas Expansion when Structure is Moved Outside Up', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15514
    Description: The canvas should automatically expand in the direction the structure is being moved.
    */
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectNestedTool(page, SelectTool.FRAGMENT_SELECTION);
    await clickOnAtom(page, 'N', 0);
    await page.keyboard.down('Shift');
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press('ArrowUp');
    }
    await page.keyboard.up('Shift');
    await expect(page).toHaveScreenshot();
  });

  test('Canvas Expansion when Structure is Moved Outside Right', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15515
    Description: The canvas should automatically expand in the direction the structure is being moved.
    */
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectNestedTool(page, SelectTool.FRAGMENT_SELECTION);
    await clickOnAtom(page, 'N', 0);
    await page.keyboard.down('Shift');
    for (let i = 0; i < 80; i++) {
      await page.keyboard.press('ArrowRight');
    }
    await page.keyboard.up('Shift');
    await expect(page).toHaveScreenshot();
  });

  test('Canvas Expansion when Structure is Moved Outside Left', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15515
    Description: The canvas should automatically expand in the direction the structure is being moved.
    */
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectNestedTool(page, SelectTool.FRAGMENT_SELECTION);
    await clickOnAtom(page, 'N', 0);
    await page.keyboard.down('Shift');
    for (let i = 0; i < 80; i++) {
      await page.keyboard.press('ArrowLeft');
    }
    await page.keyboard.up('Shift');
    await expect(page).toHaveScreenshot();
  });

  test('Move structure over the border of the canvas', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-10068
    Description: The canvas should automatically expand in the direction the structure is being moved.
    Structure is visible on the canvas.
    */
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await delay(DELAY_IN_SECONDS.TWO);
    await selectNestedTool(page, SelectTool.FRAGMENT_SELECTION);
    await clickOnAtom(page, 'N', 0);
    await page.keyboard.down('Shift');
    for (let i = 0; i < 100; i++) {
      await page.keyboard.press('ArrowDown');
    }
    await page.keyboard.up('Shift');
    await expect(page).toHaveScreenshot();
  });

  test('Selection Drop-down list', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-10068
    Description: Selection palette should contain Rectangle Selection, Lasso Selection, Fragment Selection tools.
    */
    await page.getByTestId('select-rectangle').click();
    await expect(page).toHaveScreenshot();
  });

  test('Tooltip appears after dragging abbreviation and stay on canvas until release click', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-12968
    Description:
    Add 'Functional Groups' and 'Salts and Solvents' on canvas
    Choose 'Selection tool' (ESC) click on abbreviation and immediately drag before tooltip appears
    */
    const SHIFT = 50;
    await selectFunctionalGroups(FunctionalGroups.Cbz, page);
    await clickInTheMiddleOfTheScreen(page);
    await drawFGAndDrag(FunctionalGroups.Boc, SHIFT, page);
    await selectDropdownTool(page, 'select-rectangle', 'select-lasso');
    await takePageScreenshot(page);
  });

  test('Select Palette - UI verification', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1335
    Description:
    Click the 'Lasso Selection Tool' arrow for the drop-down list and choose the Lasso Selection Tool.
    Move with mouse over the Selection tool button.
    Click the arrow for drop-down list and choose the Fragment Selection Tool.
    Move with mouse over the Selection tool button.
    Select any other (not Selection) tool.
    Move with mouse over the Fragment Selection Tool.
    */
    await page.getByTestId('select-rectangle-in-toolbar').hover();
    await takeLeftToolbarScreenshot(page);
    await selectDropdownTool(page, 'select-rectangle', 'select-lasso');
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('select-rectangle-in-toolbar').hover();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByTestId('select-fragment')).toBeVisible();
    await takeLeftToolbarScreenshot(page);
  });

  test('Select Palette - Empty canvas selection', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1336
    Description:
    Click the empty canvas.
    Press with mouse and drag on the canvas.
    Click arrow for the Selection Tool and choose the Rectangle selection tool.
    Click the empty canvas.
    Press with mouse and drag on the canvas.
    */
    await clickInTheMiddleOfTheScreen(page);
    await moveMouseToTheMiddleOfTheScreen(page);
    await clickInTheMiddleOfTheScreen(page);
    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    await clickInTheMiddleOfTheScreen(page);
    await takeLeftToolbarScreenshot(page);
  });

  test('Selection and hover mouse', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-16941
    Description:
    Add any structure from functional groups
    Expand structure
    Select structure using any selecting tool
    Hover mouse over the structure
    */
    await selectFunctionalGroups(FunctionalGroups.Cbz, page);
    await clickInTheMiddleOfTheScreen(page);

    await resetCurrentTool(page);

    await clickInTheMiddleOfTheScreen(page, 'right');
    await waitForRender(page, async () => {
      await page.getByText('Expand Abbreviation').click();
    });

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByText('Cbz').hover();
  });

  test('Verify Smooth Movement Beyond Canvas Boundaries', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-16934
    Description:
    Open Ketcher.
    Add a Benzene ring to the canvas.
    Select one of the Benzene rings and move it beyond the canvas boundaries.
    */
    await drawBenzeneRing(page);
    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await clickInTheMiddleOfTheScreen(page);
    const xOffsetFromCenter = -1000;
    await selectRing(RingButton.Cycloheptane, page);
    await clickOnTheCanvas(page, xOffsetFromCenter, 0);
    await takePageScreenshot(page);
  });

  test('Check that movement of structure not ceases when it reaches the boundaries of canvas', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-16932
    Description:
    Open Ketcher
    Add two Benzene rings on canvas
    Select one of them and move to the edges of canvas
    */
    await drawBenzeneRing(page);
    const xOffsetFromCenter = -450;
    await selectRing(RingButton.Cycloheptane, page);
    await clickOnTheCanvas(page, xOffsetFromCenter, 0);
    await takePageScreenshot(page);
  });

  test('Verify Smooth and Continuous Movement Near Canvas Edge', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-16933
    Description:
    Add a Benzene ring to the canvas.
    Select the Benzene ring and move it towards the edge of the canvas.
    */
    const shiftForTheEdgeOfTheCanvas = 550;
    await drawBenzeneRing(page);
    await moveElement(page, 'C', 0, shiftForTheEdgeOfTheCanvas, 0);
    await takePageScreenshot(page);
  });

  test('Verify Smooth Movement of Structures at Various Canvas Edges', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-16935
    Description:
    Add two Benzene rings to the canvas.
    Select one of the Benzene rings and move it towards different edges of the canvas (top, bottom, left, right).
    */
    await drawBenzeneRing(page);
    const xOffsetFromCenter = -300;
    const yOffsetFromCenter = -500;
    await selectRing(RingButton.Cycloheptane, page);
    await clickOnTheCanvas(page, yOffsetFromCenter, xOffsetFromCenter);
    await takePageScreenshot(page);
  });

  test('Verify Behavior with Rapid Mouse Movements Near Canvas Edge', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-16936
    Description:
    Add a Benzene ring to the canvas.
    Select the Benzene ring.
    Rapidly move the mouse cursor towards the canvas edge.
    */
    await drawBenzeneRing(page);
    await selectRing(RingButton.Benzene, page);
    await resetCurrentTool(page);
    await selectLeftPanelButton(LeftPanelButton.HandTool, page);
    await dragMouseTo(100, 600, page);
    await takePageScreenshot(page);
  });

  test('Verify Behavior with Slow Mouse Movements Near Canvas Edge', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-16937
    Description:
    Add a Benzene ring to the canvas.
    Select the Benzene ring.
    Slowly move the mouse cursor towards the canvas edge.
    */
    await drawBenzeneRing(page);
    await selectRing(RingButton.Benzene, page);
    await resetCurrentTool(page);
    await selectLeftPanelButton(LeftPanelButton.HandTool, page);
    await dragMouseTo(400, 400, page);
    await resetCurrentTool(page);

    await selectLeftPanelButton(LeftPanelButton.HandTool, page);
    await dragMouseTo(200, 600, page);
    await resetCurrentTool(page);

    await selectLeftPanelButton(LeftPanelButton.HandTool, page);
    await dragMouseTo(150, 600, page);
    await takePageScreenshot(page);
  });

  test('Fragment Selection tool - Drawing selection contours correctly for hovered structures', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-17664
    Description:
    Click on the ""Fragment selection"" 
    Click on the structure on the canvas
    Hover over the mouse to the structure
    Verify atoms are drawn above the bonds
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Template Library' }).click();
    await page.getByRole('button', { name: 'D-Amino Acids' }).click();
    await selectUserTemplate(TemplateLibrary.ALADAlanine, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('ketcher-canvas').hover();
    await selectDropdownTool(page, 'select-rectangle', 'select-fragment');
    await clickInTheMiddleOfTheScreen(page);
    await clickOnBond(page, BondType.SINGLE, 0);
    await clickOnAtom(page, 'C', 0);
    await takePageScreenshot(page);
  });

  test('Fragment Selection tool - Undo/Redo moving of structures', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1360
    Description: 
    Drag any structure to any other place on the canvas.
    Click the 'Undo/Redo' button on the toolbar.
    Drag the 'plus sign'/'reaction arrow' to any place on the canvas.
    Click the 'Undo/Redo' button on the toolbar multiple times.
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Template Library' }).click();
    await page.getByRole('button', { name: 'D-Amino Acids' }).click();
    await selectUserTemplate(TemplateLibrary.ALADAlanine, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await selectLeftPanelButton(LeftPanelButton.ReactionPlusTool, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectLeftPanelButton(LeftPanelButton.ArrowOpenAngleTool, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await takePageScreenshot(page);
  });

  test('Rectangle Selection tool - Undo/Redo moving of structures', async ({
    page,
  }) => {
    /* Test case: EPMLSOPKET-1353
    Description:
    Drag any atom of the structure to any other place on the canvas.
    Click the 'Undo' button on the toolbar.
    Click the 'Redo' button on the toolbar.
    Drag the plus sign to any place on the canvas.
    Drag the reaction arrow to any place on the canvas.
    Select a part or the whole reaction and drag it to any place on the canvas.
    Click the 'Undo' button on the toolbar multiple times.
    Click the 'Redo' button on the toolbar multiple times.
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Template Library' }).click();
    await page.getByRole('button', { name: 'D-Amino Acids' }).click();
    await selectUserTemplate(TemplateLibrary.ARGDArginine, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectAtomInToolbar(AtomButton.Hydrogen, page);
    await clickInTheMiddleOfTheScreen(page);

    const shift = 50;
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + shift;
    await dragMouseTo(coordinatesWithShift, y, page);
    await resetCurrentTool(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await selectLeftPanelButton(LeftPanelButton.ReactionPlusTool, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectLeftPanelButton(LeftPanelButton.ArrowOpenAngleTool, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await takePageScreenshot(page);
  });
});
