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
} from '@utils';

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

  test.fixme(
    '(50px to Up) Structure Movement with Arrow Keys (1px move)',
    async ({ page }) => {
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
    },
  );

  test.fixme(
    '(50px to Right) Structure Movement with Arrow Keys (1px move)',
    async ({ page }) => {
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
    },
  );

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

  test.fixme(
    '(100px to Down with Shift key) Structure Movement with Arrow Keys (10px move)',
    async ({ page }) => {
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
    },
  );

  test.fixme(
    '(100px to Up with Shift key) Structure Movement with Arrow Keys (10px move)',
    async ({ page }) => {
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
    },
  );

  test.fixme(
    '(100px to Right with Shift key) Structure Movement with Arrow Keys (10px move)',
    async ({ page }) => {
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
    },
  );

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

  test.fixme(
    'Canvas Expansion when Structure is Moved Outside Right',
    async ({ page }) => {
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
    },
  );

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

  // flaky
  test.fixme(
    'Move structure over the border of the canvas',
    async ({ page }) => {
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
    },
  );

  // TODO: flaky
  test.fixme('Selection Drop-down list', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-10068
    Description: Selection palette should contain Rectangle Selection, Lasso Selection, Fragment Selection tools.
    */
    await page.getByTestId('select-rectangle').click();
    await expect(page).toHaveScreenshot();
  });
});
