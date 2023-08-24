import { expect, test } from '@playwright/test';
import {
  getCoordinatesOfTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  takeEditorScreenshot,
} from '@utils';
import { getRotationHandleCoordinates } from '@utils/clicks/selectButtonByTitle';
import {
  COORDINATES_TO_PERFORM_ROTATION,
  addStructureAndSelect,
  rotateToCoordinates,
  resetSelection,
  selectPartOfStructure,
  checkUndoRedo,
  performVerticalFlip,
  performHorizontalFlip,
  selectPartOfChain,
  selectPartOfBenzeneRing,
  anyStructure,
  EMPTY_SPACE_Y,
  EMPTY_SPACE_X,
  selectChain,
} from './utils';

test.describe('Rotation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('Cancel rotation on right click', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-16894
      Description: Rotation is cancelled via "right click"
    */
    await openFileAndAddToCanvas('mol_1855_to_open.mol', page);
    await page.keyboard.press('Control+a');
    const screenBeforeRotation = await takeEditorScreenshot(page);
    const coordinates = await getRotationHandleCoordinates(page);
    const { x: rotationHandleX, y: rotationHandleY } = coordinates;

    await page.mouse.move(rotationHandleX, rotationHandleY);
    await page.mouse.down();
    await page.mouse.move(
      COORDINATES_TO_PERFORM_ROTATION.x,
      COORDINATES_TO_PERFORM_ROTATION.y,
    );
    await page.mouse.click(
      COORDINATES_TO_PERFORM_ROTATION.x,
      COORDINATES_TO_PERFORM_ROTATION.y,
      { button: 'right' },
    );

    const screenAfterRotation = await takeEditorScreenshot(page);
    expect(screenAfterRotation).toEqual(screenBeforeRotation);
  });

  test('Floating icons are shown', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1685, 13004
      Description: Floating icon are shown, when structure is selected
    */
    await addStructureAndSelect(page);
    await takeEditorScreenshot(page);
  });

  test('Floating icons have tooltips', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1685
      Description: Floating icon have tooltips
    */
    await addStructureAndSelect(page);
    const icons = [
      {
        testId: 'transform-flip-h',
        title: 'Horizontal Flip (Alt+H)',
      },
      {
        testId: 'transform-flip-v',
        title: 'Vertical Flip (Alt+V)',
      },
      {
        testId: 'delete',
        title: 'Erase (Del)',
      },
    ];
    for (const icon of icons) {
      const iconButton = page.getByTestId(icon.testId);
      await expect(iconButton).toHaveAttribute('title', icon.title);
      await iconButton.click();
      await takeEditorScreenshot(page);
    }
  });

  test('Rotate by 60 degrees', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1686, 1687, 13006
      Description: Structure is rotated by 15 degrees steps
    */
    await addStructureAndSelect(page);
    await rotateToCoordinates(page, COORDINATES_TO_PERFORM_ROTATION);
    await resetSelection(page);
    await takeEditorScreenshot(page);
  });

  test('Rotate by 1 degree step', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1686, 1687
      Description: Structure is rotated by 1 degree step with Ctrl
    */
    await addStructureAndSelect(page);
    await page.keyboard.down('Control');
    await rotateToCoordinates(page, COORDINATES_TO_PERFORM_ROTATION);
    await page.keyboard.up('Control');
    await resetSelection(page);
    await takeEditorScreenshot(page);
  });

  test('Rotate part of structure', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1688
      Description: Select and rotate part of structure
    */
    await addStructureAndSelect(page, 'Molfiles-V2000/two-benzene-rings.mol');
    await selectPartOfStructure(page);
    await rotateToCoordinates(page, COORDINATES_TO_PERFORM_ROTATION);
    await resetSelection(page);
    await takeEditorScreenshot(page);
  });

  test('Rotate only selected structure', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1689
      Description: Multiple structures are drawn on the canvas. Only selected structures are rotated
    */
    await addStructureAndSelect(page, 'Molfiles-V2000/multiple-structures.mol');
    await selectPartOfStructure(page);
    await rotateToCoordinates(page, COORDINATES_TO_PERFORM_ROTATION);
    await resetSelection(page);
    await takeEditorScreenshot(page);
  });

  test('Performs horizontal flip for non-selected structure', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1690, 1692
      Description: Multiple structures are draw on the canvas. Horizontal flip is performed via shortcut
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/multiple-structures.mol',
      page,
    );
    await page.mouse.move(EMPTY_SPACE_X, EMPTY_SPACE_Y);
    await page.keyboard.press('Alt+h');
    await takeEditorScreenshot(page);
  });

  test('Performs vertical flip for non-selected structure', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1691, 1692
      Description: Multiple structures are draw on the canvas. Vertical flip is performed via shortcut
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/multiple-structures.mol',
      page,
    );
    await page.mouse.move(EMPTY_SPACE_X, EMPTY_SPACE_Y);
    await page.keyboard.press('Alt+v');
    await takeEditorScreenshot(page);
  });

  test('Rotate reaction', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1693
      Description: Reaction is rotated
    */
    const anyReaction = 'Rxn/rxn-reaction.rxn';
    const coordinatesForRotation = {
      x: 800,
      y: 800,
    };
    await addStructureAndSelect(page, anyReaction);
    await rotateToCoordinates(page, coordinatesForRotation);
    await resetSelection(page);
    await takeEditorScreenshot(page);
  });

  test('Reaction is flipped', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1694
      Description: Reaction is flipped vertically and horizontally
    */
    const anyReaction = 'Rxn/rxn-reaction.rxn';
    await openFileAndAddToCanvas(anyReaction, page);
    await page.mouse.move(EMPTY_SPACE_X, EMPTY_SPACE_Y);
    await page.keyboard.press('Alt+v');
    await takeEditorScreenshot(page);
    await page.keyboard.press('Alt+h');
    await takeEditorScreenshot(page);
  });

  test('Check rotate history', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1695
      Description: Check history actions for rotation and flip
    */
    await addStructureAndSelect(page);
    await rotateToCoordinates(page, COORDINATES_TO_PERFORM_ROTATION);
    await resetSelection(page);
    await checkUndoRedo(page);

    await performVerticalFlip(page);
    await checkUndoRedo(page);

    await performHorizontalFlip(page);
    await checkUndoRedo(page);
  });

  test('Horizontal flip for part of structure with selected bond', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-8935
      Description: Select and make horizontal flip for part of structure with selected bond
    */
    const extraShiftToCoverBond = 25;
    await addStructureAndSelect(page, 'Molfiles-V2000/two-benzene-rings.mol');
    await selectPartOfStructure(page, extraShiftToCoverBond);
    await performHorizontalFlip(page);
    await resetSelection(page);
    await takeEditorScreenshot(page);
  });

  test('Vertical flip for part of structure with selected bond', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-8935
      Description: Select and make vertical flip for part of structure with selected bond
    */
    const extraShiftToCoverBond = 25;
    await addStructureAndSelect(page, 'Molfiles-V2000/two-benzene-rings.mol');
    await selectPartOfStructure(page, extraShiftToCoverBond);
    await performVerticalFlip(page);
    await resetSelection(page);
    await takeEditorScreenshot(page);
  });

  test('Horizontal flip for part of structure without selected bond', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-8936
      Description: Select and make horizontal flip for part of structure without selected bond
    */
    const shift = 1;
    await addStructureAndSelect(page, 'Molfiles-V2000/two-benzene-rings.mol');
    await selectPartOfStructure(page, shift);
    await performHorizontalFlip(page);
    await resetSelection(page);
    await takeEditorScreenshot(page);
  });

  test('Vertical flip for part of structure without selected bond', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-8936
      Description: Select and make vertical flip for part of structure without selected bond
    */
    const shift = 1;
    await addStructureAndSelect(page, 'Molfiles-V2000/two-benzene-rings.mol');
    await selectPartOfStructure(page, shift);
    await performVerticalFlip(page);
    await resetSelection(page);
    await takeEditorScreenshot(page);
  });

  test('Click on rotation handle activates rotation mode', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-12992, 12997, 12993, 12995
      Description: Add any structure and select it. Click and hold rotation handle
    */
    const shift = 10;
    await addStructureAndSelect(page, anyStructure);
    await page.keyboard.press('Control+a');
    const { x: rotationHandleX, y: rotationHandleY } =
      await getRotationHandleCoordinates(page);

    await page.mouse.move(rotationHandleX, rotationHandleY);
    await page.mouse.down();
    await page.mouse.move(rotationHandleX, rotationHandleY - shift);
    await takeEditorScreenshot(page);
  });

  test('Set of angles shown always covers [-90 - +90] range relatively to the handle position', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-12994, 12999, 13000, 13001, 13004, 13005
      Description: Add any structure and select it. Rotate it by 60 degrees.
    */
    const coordinatesFor60Degrees = {
      x: 530,
      y: 270,
    };
    await addStructureAndSelect(page);
    await rotateToCoordinates(page, coordinatesFor60Degrees, false);
    await takeEditorScreenshot(page);
  });

  test('Rotate structure and release mouse', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-12996
      Description: Structure is rotated by 60 degrees. Mouse released
    */
    await addStructureAndSelect(page);
    await rotateToCoordinates(page, COORDINATES_TO_PERFORM_ROTATION);
    await takeEditorScreenshot(page);
  });

  test("Rotate handle doesn't change its position", async ({ page }) => {
    /*
      Test case: EPMLSOPKET-12998
      Description: Click on rotation handle doesn't change its position
    */
    await addStructureAndSelect(page);
    const { x: rotationHandleX, y: rotationHandleY } =
      await getRotationHandleCoordinates(page);
    await page.mouse.click(rotationHandleX, rotationHandleY);
    const { x, y } = await getRotationHandleCoordinates(page);
    expect(x).toEqual(rotationHandleX);
    expect(y).toEqual(rotationHandleY);
  });

  test.fixme(
    'Works with different zoom level and screen resolution',
    async ({ page }) => {
      /*
      Test case: EPMLSOPKET-12998
      Description: Click on rotation handle doesn't change its position
    */
      const fiftyPercentZoom = 5;
      await page.setViewportSize({ width: 1200, height: 1080 });
      for (let i = 0; i < fiftyPercentZoom; i++) {
        await page.keyboard.press('Control+_');
      }
      await addStructureAndSelect(page);
      await rotateToCoordinates(page, COORDINATES_TO_PERFORM_ROTATION);
      await resetSelection(page);
      await takeEditorScreenshot(page);
    },
  );

  test('Cancel rotation on "Escape" key', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-15499
      Description: Cancel rotation on "Escape" key
    */
    await addStructureAndSelect(page);
    const screenBeforeRotation = await takeEditorScreenshot(page);
    const coordinates = await getRotationHandleCoordinates(page);
    const { x: rotationHandleX, y: rotationHandleY } = coordinates;

    await page.mouse.move(rotationHandleX, rotationHandleY);
    await page.mouse.down();
    await page.mouse.move(
      COORDINATES_TO_PERFORM_ROTATION.x,
      COORDINATES_TO_PERFORM_ROTATION.y,
    );
    await page.keyboard.press('Escape');

    const screenAfterRotation = await takeEditorScreenshot(page);
    expect(screenAfterRotation).toEqual(screenBeforeRotation);
  });

  test('Structure remains selected after "Escape" key', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-15501
      Description: Structure remains selected after "Escape" key
    */
    await addStructureAndSelect(page);
    await page.keyboard.press('Escape');
    await takeEditorScreenshot(page);
  });

  test('Multiple "Escape" key presses cancel rotation', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-15502
      Description: Multiple "Escape" key presses cancel rotation
    */
    await addStructureAndSelect(page);
    const screenBeforeRotation = await takeEditorScreenshot(page);
    const coordinates = await getRotationHandleCoordinates(page);
    const { x: rotationHandleX, y: rotationHandleY } = coordinates;

    await page.mouse.move(rotationHandleX, rotationHandleY);
    await page.mouse.down();
    await page.mouse.move(
      COORDINATES_TO_PERFORM_ROTATION.x,
      COORDINATES_TO_PERFORM_ROTATION.y,
    );
    await page.keyboard.press('Escape');

    const screenAfterRotation = await takeEditorScreenshot(page);
    expect(screenAfterRotation).toEqual(screenBeforeRotation);

    const smallShift = 10;
    await page.mouse.move(
      COORDINATES_TO_PERFORM_ROTATION.x + smallShift,
      COORDINATES_TO_PERFORM_ROTATION.y + smallShift,
    );
    await page.keyboard.press('Escape');

    const screenAfterSecondRotation = await takeEditorScreenshot(page);
    expect(screenAfterSecondRotation).toEqual(screenBeforeRotation);
  });

  test('Non-selected end of the selected bond should be the rotation center', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-15542
      Description: Non-selected end of the selected bond should be the rotation center
    */
    const chainWithDoubleBond =
      'Molfiles-V2000/chain-with-double-bond-in-the-middle.mol';
    await openFileAndAddToCanvas(chainWithDoubleBond, page);
    await selectPartOfChain(page);
    await takeEditorScreenshot(page);
  });

  test('Unselected label rotation', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-15543
      Description: Label is not rotated with the structure, if it is not selected
    */
    const chainWithDoubleBond = 'Molfiles-V2000/benzene-stereo.mol';
    await openFileAndAddToCanvas(chainWithDoubleBond, page);
    await selectPartOfBenzeneRing(page);
    await rotateToCoordinates(page, COORDINATES_TO_PERFORM_ROTATION);
    await takeEditorScreenshot(page);
  });

  test('Selected label rotation', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-15544
      Description: Label is rotated with the structure, if it is selected
    */
    const chainWithDoubleBond = 'Molfiles-V2000/benzene-stereo.mol';
    await addStructureAndSelect(page, chainWithDoubleBond);
    await rotateToCoordinates(page, COORDINATES_TO_PERFORM_ROTATION);
    await takeEditorScreenshot(page);
  });
});

test.describe('Rotation snapping', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('for 90, 120 and 180 degrees', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-16906
      Description: Bond has 90, 120 and 180 snaps
    */
    const benzeneWithChain = 'Molfiles-V2000/benzene-with-chain.mol';
    await openFileAndAddToCanvas(benzeneWithChain, page);
    await selectChain(page);

    const firstStepCoordinates = {
      x: 500,
      y: 200,
    };
    await rotateToCoordinates(page, firstStepCoordinates, false);
    await takeEditorScreenshot(page);

    const secondStepCoordinates = {
      x: 600,
      y: 200,
    };
    await page.mouse.move(secondStepCoordinates.x, secondStepCoordinates.y);
    await takeEditorScreenshot(page);

    const thirdStepCoordinates = {
      x: 800,
      y: 250,
    };
    await page.mouse.move(thirdStepCoordinates.x, thirdStepCoordinates.y);
    await takeEditorScreenshot(page);
  });

  test('bisector snapping for 2+ bonds', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-16907
      Description: For 2+ bonds counterclockwise see a prompt for the bisector, then snap to it
    */
    const benzeneWithChain = 'Molfiles-V2000/benzene-with-chain.mol';
    await openFileAndAddToCanvas(benzeneWithChain, page);
    await selectChain(page, true);
    const coordinatesForBisectTip = {
      x: 400,
      y: 300,
    };
    await rotateToCoordinates(page, coordinatesForBisectTip, false);
    await takeEditorScreenshot(page);

    const coordinatesForBisectHighlight = {
      x: 400,
      y: 250,
    };
    await page.mouse.move(
      coordinatesForBisectHighlight.x,
      coordinatesForBisectHighlight.y,
    );
    await takeEditorScreenshot(page);
  });

  test('around new center', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-17657, 17658
      Description: Center of rotation can be selected and structure is rotated around new center.
      Rotate
    */
    const newCenterOfRotation = {
      x: 600,
      y: 450,
    };
    const coordinatesForRotation = {
      x: 700,
      y: 500,
    };
    // it is used in order not to calculate position of rotation center
    const symmetricStructure = 'Molfiles-V2000/symmetric-structure.mol';
    await addStructureAndSelect(page, symmetricStructure);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(newCenterOfRotation.x, newCenterOfRotation.y);
    await page.mouse.up();

    await rotateToCoordinates(page, coordinatesForRotation, false);
    await takeEditorScreenshot(page);
    await page.mouse.up();

    await page.keyboard.press('Control+a');
    await page.getByTestId('floating-tools').isVisible();
    await takeEditorScreenshot(page);
  });
});
