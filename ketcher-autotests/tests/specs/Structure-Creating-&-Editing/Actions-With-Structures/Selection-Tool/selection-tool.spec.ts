/* eslint-disable no-magic-numbers */
import { expect, test } from '@playwright/test';
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
  selectLeftPanelButton,
  LeftPanelButton,
  fillFieldByPlaceholder,
  dragMouseTo,
  takeLeftToolbarScreenshot,
  waitForPageInit,
  waitForRender,
  drawBenzeneRing,
  selectAllStructuresOnCanvas,
} from '@utils';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';

test.describe('Selection tools', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Selection is not reset when using context menu', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-8925
    Description: Selection is not reset. User can use right-click menu in order to perform actions.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await clickOnAtom(page, 'C', 0, 'right');
    await takeEditorScreenshot(page);
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
    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page);
  });

  test('Pressing atoms hotkey when atoms are selected', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-12979
    Description: Selected atoms are replaces with those assigned to the hotkey.
    Selected tool remains active and the atom does not appear under mouse cursor.
    */
    await openFileAndAddToCanvas('KET/two-atoms.ket', page);
    await selectAllStructuresOnCanvas(page);
    await page.keyboard.press('o');
    await takeEditorScreenshot(page);
  });

  test('Hovering of selected Atom', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-13008
    Description: When hovered selected Atom becomes lighter than the rest of the structure.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await moveOnAtom(page, 'C', 0);
    await takeEditorScreenshot(page);
  });

  test('Hovering of selected Bond', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-13008
    Description: When hovered selected Bond becomes lighter than the rest of the structure.
    */
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await moveOnBond(page, BondType.SINGLE, 0);
    await takeEditorScreenshot(page);
  });

  test('Verify flipping horizontally with multiple disconnected structures selected', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15508
    Description: All selected structures are flipped horizontally based on the selection box origin.
    */
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await selectAllStructuresOnCanvas(page);
    await pressButton(page, 'Horizontal Flip (Alt+H)');
    await takeEditorScreenshot(page);
  });

  test('Verify flipping vertically with multiple disconnected structures selected', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15509
    Description: All selected structures are flipped horizontally based on the selection box origin.
    */
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await selectAllStructuresOnCanvas(page);
    await pressButton(page, 'Vertical Flip (Alt+V)');
    await takeEditorScreenshot(page);
  });

  test('Verify deletion of selected structures', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-15510
    Description: All selected structures are deleted from the canvas.
    */
    await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
    await selectAllStructuresOnCanvas(page);
    await page.getByTestId('delete').click();
    await takeEditorScreenshot(page);
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
    await selectAllStructuresOnCanvas(page);
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press('ArrowDown');
    }
    await takeEditorScreenshot(page);
  });

  test(
    '(50px to Up) Structure Movement with Arrow Keys (1px move)',
    {
      tag: ['@SlowTest'],
    },
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-15512
    Description: The selected structure should move 1 pixel in the corresponding
    direction with each key press. In this test to 50px Up.
    */
      test.slow();

      await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
      await takeEditorScreenshot(page);
      await selectAllStructuresOnCanvas(page);
      for (let i = 0; i < 50; i++) {
        await waitForRender(page, async () => {
          await page.keyboard.press('ArrowUp');
        });
      }
      await takeEditorScreenshot(page);
    },
  );

  test(
    '(50px to Right) Structure Movement with Arrow Keys (1px move)',
    {
      tag: ['@SlowTest'],
    },
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-15512
    Description: The selected structure should move 1 pixel in the corresponding
    direction with each key press. In this test to 50px Right.
    */
      test.slow();

      await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
      await takeEditorScreenshot(page);
      await selectAllStructuresOnCanvas(page);
      for (let i = 0; i < 50; i++) {
        await waitForRender(page, async () => {
          await page.keyboard.press('ArrowRight');
        });
      }
      await takeEditorScreenshot(page);
    },
  );

  test(
    '(50px to Left) Structure Movement with Arrow Keys (1px move)',
    {
      tag: ['@SlowTest'],
    },
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-15512
    Description: The selected structure should move 1 pixel in the corresponding
    direction with each key press. In this test to 50px Left.
    */
      test.slow();

      await openFileAndAddToCanvas('KET/two-benzene-with-atoms.ket', page);
      await takeEditorScreenshot(page);
      await selectAllStructuresOnCanvas(page);
      for (let i = 0; i < 50; i++) {
        await waitForRender(page, async () => {
          await page.keyboard.press('ArrowLeft');
        });
      }
      await takeEditorScreenshot(page);
    },
  );

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
    await selectAllStructuresOnCanvas(page);
    await page.keyboard.down('Shift');
    for (let i = 0; i < 10; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('ArrowDown');
      });
    }
    await page.keyboard.up('Shift');
    await takeEditorScreenshot(page);
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
    await selectAllStructuresOnCanvas(page);
    await page.keyboard.down('Shift');
    for (let i = 0; i < 10; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('ArrowUp');
      });
    }
    await page.keyboard.up('Shift');
    await takeEditorScreenshot(page);
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
    await selectAllStructuresOnCanvas(page);
    await page.keyboard.down('Shift');
    for (let i = 0; i < 10; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('ArrowRight');
      });
    }
    await page.keyboard.up('Shift');
    await takeEditorScreenshot(page);
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
    await selectAllStructuresOnCanvas(page);
    await page.keyboard.down('Shift');
    for (let i = 0; i < 10; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('ArrowLeft');
      });
    }
    await page.keyboard.up('Shift');
    await takeEditorScreenshot(page);
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
    await LeftToolbar(page).sGroup();
    await clickOnAtom(page, 'C', 0);
    await fillFieldByPlaceholder(page, 'Enter name', 'Test');
    await fillFieldByPlaceholder(page, 'Enter value', '33');
    await pressButton(page, 'Apply');

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await page.getByText('33', { exact: true }).click();
    await dragMouseTo(pointx, pointy, page);
    await takeEditorScreenshot(page);

    await page.getByText('33', { exact: true }).click();
    await dragMouseTo(pointx1, pointy1, page);
    await takeEditorScreenshot(page);
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
    await selectAllStructuresOnCanvas(page);
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
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
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
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
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
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
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
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
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
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
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
    await CommonLeftToolbar(page).areaSelectionDropdownButton.click();
    await expect(page).toHaveScreenshot();
  });

  test('Selection when hovering atom and bond', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-16944
    Description: When mouse hover on Benzene ring atom or bond, selection appears.
    */
    await drawBenzeneRing(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await moveOnAtom(page, 'C', 0);
    await takeEditorScreenshot(page);
    await moveOnBond(page, BondType.SINGLE, 0);
    await takeEditorScreenshot(page);
  });

  test('Selection for several templates', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-16945
    Description: All structures selected on the canvas are highlighted in green.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/several-templates-selection-tool.mol',
      page,
    );
    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page);
  });

  test('Selection for chain structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-17668
    Description: All chain structures selected on the canvas are highlighted in green.
    */
    await openFileAndAddToCanvas('Molfiles-V2000/chain-r1.mol', page);
    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page);
  });

  test(' Switching tools inside the "Selection tool" using "Shift+Tab", after pressing "ESC"', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-18046
    Description: Shift+Tab switch selection tools after pressing ESC button.
    */
    await LeftToolbar(page).chain();
    await page.keyboard.press('Escape');
    await takeLeftToolbarScreenshot(page);
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('Shift+Tab');
      await takeLeftToolbarScreenshot(page);
    }
  });

  test('Switching tools inside the "Selection tool" using "Shift+Tab", after selecting the Lasso', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-18047
    Description: Shift+Tab switch selection tools after selecting Lasso.
    */
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await takeLeftToolbarScreenshot(page);
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Shift+Tab');
      await takeLeftToolbarScreenshot(page);
    }
  });
});
