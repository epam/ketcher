/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-magic-numbers */
import { expect, Page, test } from '@fixtures';
import {
  clickOnCanvas,
  getCoordinatesOfTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  takeElementScreenshot,
  zoomOutByKeyboard,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { verticalFlipByKeyboard, horizontalFlipByKeyboard } from './utils';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { RotationTool } from '@tests/pages/common/canvas/RotationTool';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { getBondLocator } from '@utils/macromolecules/polymerBond';
let page: Page;
test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.describe('Rotation', () => {
  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

  test('Cancel rotation on right click', async () => {
    /*
      Test case: EPMLSOPKET-16894
      Description: Rotation is cancelled via "right click"
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/mol-1855-to-open.mol');
    await selectAllStructuresOnCanvas(page);
    const screenBeforeRotation = await takeEditorScreenshot(page);

    await RotationTool(page).moveRotationHandleTo(
      {
        x: 20,
        y: 100,
      },
      false,
    );
    await clickOnCanvas(page, 20, 100, {
      button: 'right',
      from: 'pageTopLeft',
    });

    const screenAfterRotation = await takeEditorScreenshot(page);
    expect(screenAfterRotation).toEqual(screenBeforeRotation);
  });

  test('Floating icons are shown', async () => {
    /*
      Test case: EPMLSOPKET-1685, 13004
      Description: Floating icon are shown, when structure is selected
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/rings-heteroatoms-query-features.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page);
  });

  test('Floating icons have tooltips', async () => {
    /*
      Test case: EPMLSOPKET-1685
      Description: Floating icon have tooltips
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/rings-heteroatoms-query-features.mol',
    );
    await selectAllStructuresOnCanvas(page);
    const icons = [
      {
        button: RotationTool(page).flipHorizontallyButton,
        title: 'Horizontal Flip (Alt+H)',
      },
      {
        button: RotationTool(page).flipVerticallyButton,
        title: 'Vertical Flip (Alt+V)',
      },
      {
        button: RotationTool(page).deleteButton,
        title: 'Erase (Del)',
      },
    ];
    for (const icon of icons) {
      const iconButton = icon.button;
      await expect(iconButton).toHaveAttribute('title', icon.title);
      await iconButton.click();
      await takeEditorScreenshot(page);
    }
  });

  test('Rotate by 60 degrees', async () => {
    /*
      Test case: EPMLSOPKET-1686, 1687, 13006
      Description: Structure is rotated by 15 degrees steps
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/rings-heteroatoms-query-features.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await RotationTool(page).moveRotationHandleTo({
      x: 20,
      y: 100,
    });
    await clickOnCanvas(page, 70, 90, {
      from: 'pageTopLeft',
    });
    await takeEditorScreenshot(page);
  });

  test('Rotate by 1 degree step', async () => {
    /*
      Test case: EPMLSOPKET-1686, 1687
      Description: Structure is rotated by 1 degree step with Ctrl
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/rings-heteroatoms-query-features.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await page.keyboard.down('ControlOrMeta');
    await RotationTool(page).moveRotationHandleTo({
      x: 20,
      y: 100,
    });
    await page.keyboard.up('ControlOrMeta');
    await clickOnCanvas(page, 70, 90, {
      from: 'pageTopLeft',
    });
    await takeEditorScreenshot(page);
  });

  test('Rotate part of structure', async () => {
    /*
      Test case: EPMLSOPKET-1688
      Description: Select and rotate part of structure
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/two-benzene-rings.mol');
    await selectAllStructuresOnCanvas(page);
    const coordinatesToStartSelection = 70;
    const rightMostAtom = getAtomLocator(page, { atomLabel: 'P' });
    const bottomMostAtom = getAtomLocator(page, { atomLabel: 'S' });
    const rightAtom = await rightMostAtom.boundingBox();
    const bottomAtom = await bottomMostAtom.boundingBox();
    await page.mouse.move(
      coordinatesToStartSelection,
      coordinatesToStartSelection,
    );
    await page.mouse.down();
    if (rightAtom && bottomAtom) {
      await page.mouse.move(
        rightAtom.x + 5 + rightAtom.width / 2,
        bottomAtom.y + 5 + bottomAtom.height / 2,
      );
    }
    await page.mouse.up();
    await RotationTool(page).moveRotationHandleTo({
      x: 20,
      y: 100,
    });
    await clickOnCanvas(page, 70, 90, {
      from: 'pageTopLeft',
    });
    await takeEditorScreenshot(page);
  });

  test('Rotate only selected structure', async () => {
    /*
      Test case: EPMLSOPKET-1689
      Description: Multiple structures are drawn on the canvas. Only selected structures are rotated
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/multiple-structures.mol',
    );
    await selectAllStructuresOnCanvas(page);
    const coordinatesToStartSelection = 70;
    const rightMostAtom = getAtomLocator(page, { atomLabel: 'P' });
    const bottomMostAtom = getAtomLocator(page, { atomLabel: 'S' });
    const rightAtom = await rightMostAtom.boundingBox();
    const bottomAtom = await bottomMostAtom.boundingBox();
    await page.mouse.move(
      coordinatesToStartSelection,
      coordinatesToStartSelection,
    );
    await page.mouse.down();
    if (rightAtom && bottomAtom) {
      await page.mouse.move(
        rightAtom.x + 5 + rightAtom.width / 2,
        bottomAtom.y + 5 + bottomAtom.height / 2,
      );
    }
    await page.mouse.up();
    await RotationTool(page).moveRotationHandleTo({
      x: 20,
      y: 100,
    });
    await clickOnCanvas(page, 70, 90, {
      from: 'pageTopLeft',
    });
    await takeEditorScreenshot(page);
  });

  test('Performs horizontal flip for non-selected structure', async () => {
    /*
      Test case: EPMLSOPKET-1690, 1692
      Description: Multiple structures are draw on the canvas. Horizontal flip is performed via shortcut
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/multiple-structures.mol',
    );
    await page.mouse.move(70, 90);
    await horizontalFlipByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Performs vertical flip for non-selected structure', async () => {
    /*
      Test case: EPMLSOPKET-1691, 1692
      Description: Multiple structures are draw on the canvas. Vertical flip is performed via shortcut
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/multiple-structures.mol',
    );
    await page.mouse.move(70, 90);
    await verticalFlipByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Rotate reaction', async () => {
    /*
      Test case: EPMLSOPKET-1693
      Description: Reaction is rotated
    */
    const coordinatesForRotation = {
      x: 800,
      y: 800,
    };
    await openFileAndAddToCanvas(page, 'Rxn-V2000/rxn-reaction.rxn');
    await selectAllStructuresOnCanvas(page);
    await RotationTool(page).moveRotationHandleTo(coordinatesForRotation);
    await clickOnCanvas(page, 70, 90, {
      from: 'pageTopLeft',
    });
    await takeEditorScreenshot(page);
  });

  test('Reaction is flipped', async () => {
    /*
      Test case: EPMLSOPKET-1694
      Description: Reaction is flipped vertically and horizontally
    */
    const anyReaction = 'Rxn-V2000/rxn-reaction.rxn';
    await openFileAndAddToCanvas(page, anyReaction);
    await page.mouse.move(70, 90);
    await verticalFlipByKeyboard(page);
    await takeEditorScreenshot(page);

    await horizontalFlipByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Check rotate history', async () => {
    /*
      Test case: EPMLSOPKET-1695
      Description: Check history actions for rotation and flip
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/rings-heteroatoms-query-features.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await RotationTool(page).moveRotationHandleTo({
      x: 20,
      y: 100,
    });
    await clickOnCanvas(page, 70, 90, {
      from: 'pageTopLeft',
    });
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);

    await verticalFlipByKeyboard(page);
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);

    await horizontalFlipByKeyboard(page);
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);
  });

  test('Horizontal flip for part of structure with selected bond', async () => {
    /*
      Test case: EPMLSOPKET-8935
      Description: Select and make horizontal flip for part of structure with selected bond
    */
    const extraShiftToCoverBond = 25;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/two-benzene-rings.mol');
    await selectAllStructuresOnCanvas(page);
    const coordinatesToStartSelection = 70;
    const rightMostAtom = getAtomLocator(page, { atomLabel: 'P' });
    const bottomMostAtom = getAtomLocator(page, { atomLabel: 'S' });
    const rightAtom = await rightMostAtom.boundingBox();
    const bottomAtom = await bottomMostAtom.boundingBox();
    await page.mouse.move(
      coordinatesToStartSelection,
      coordinatesToStartSelection,
    );
    await page.mouse.down();
    if (rightAtom && bottomAtom) {
      await page.mouse.move(
        rightAtom.x + extraShiftToCoverBond + rightAtom.width / 2,
        bottomAtom.y + extraShiftToCoverBond + bottomAtom.height / 2,
      );
    }
    await page.mouse.up();
    await horizontalFlipByKeyboard(page);
    await clickOnCanvas(page, 70, 90, {
      from: 'pageTopLeft',
    });
    await takeEditorScreenshot(page);
  });

  test('Vertical flip for part of structure with selected bond', async () => {
    /*
      Test case: EPMLSOPKET-8935
      Description: Select and make vertical flip for part of structure with selected bond
    */
    const extraShiftToCoverBond = 25;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/two-benzene-rings.mol');
    await selectAllStructuresOnCanvas(page);
    const coordinatesToStartSelection = 70;
    const rightMostAtom = getAtomLocator(page, { atomLabel: 'P' });
    const bottomMostAtom = getAtomLocator(page, { atomLabel: 'S' });
    const rightAtom = await rightMostAtom.boundingBox();
    const bottomAtom = await bottomMostAtom.boundingBox();
    await page.mouse.move(
      coordinatesToStartSelection,
      coordinatesToStartSelection,
    );
    await page.mouse.down();
    if (rightAtom && bottomAtom) {
      await page.mouse.move(
        rightAtom.x + extraShiftToCoverBond + rightAtom.width / 2,
        bottomAtom.y + extraShiftToCoverBond + bottomAtom.height / 2,
      );
    }
    await page.mouse.up();
    await verticalFlipByKeyboard(page);
    await clickOnCanvas(page, 70, 90, {
      from: 'pageTopLeft',
    });
    await takeEditorScreenshot(page);
  });

  test('Horizontal flip for part of structure without selected bond', async () => {
    /*
      Test case: EPMLSOPKET-8936
      Description: Select and make horizontal flip for part of structure without selected bond
    */
    const shift = 1;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/two-benzene-rings.mol');
    await selectAllStructuresOnCanvas(page);
    const coordinatesToStartSelection = 70;
    const rightMostAtom = getAtomLocator(page, { atomLabel: 'P' });
    const bottomMostAtom = getAtomLocator(page, { atomLabel: 'S' });
    const rightAtom = await rightMostAtom.boundingBox();
    const bottomAtom = await bottomMostAtom.boundingBox();
    await page.mouse.move(
      coordinatesToStartSelection,
      coordinatesToStartSelection,
    );
    await page.mouse.down();
    if (rightAtom && bottomAtom) {
      await page.mouse.move(
        rightAtom.x + shift + rightAtom.width / 2,
        bottomAtom.y + shift + bottomAtom.height / 2,
      );
    }
    await page.mouse.up();
    await horizontalFlipByKeyboard(page);
    await clickOnCanvas(page, 70, 90, {
      from: 'pageTopLeft',
    });
    await takeEditorScreenshot(page);
  });

  test('Vertical flip for part of structure without selected bond', async () => {
    /*
      Test case: EPMLSOPKET-8936
      Description: Select and make vertical flip for part of structure without selected bond
    */
    const shift = 1;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/two-benzene-rings.mol');
    await selectAllStructuresOnCanvas(page);
    const coordinatesToStartSelection = 70;
    const rightMostAtom = getAtomLocator(page, { atomLabel: 'P' });
    const bottomMostAtom = getAtomLocator(page, { atomLabel: 'S' });
    const rightAtom = await rightMostAtom.boundingBox();
    const bottomAtom = await bottomMostAtom.boundingBox();
    await page.mouse.move(
      coordinatesToStartSelection,
      coordinatesToStartSelection,
    );
    await page.mouse.down();
    if (rightAtom && bottomAtom) {
      await page.mouse.move(
        rightAtom.x + shift + rightAtom.width / 2,
        bottomAtom.y + shift + bottomAtom.height / 2,
      );
    }
    await page.mouse.up();
    await verticalFlipByKeyboard(page);
    await clickOnCanvas(page, 70, 90, {
      from: 'pageTopLeft',
    });
    await takeEditorScreenshot(page);
  });

  test('Click on rotation handle activates rotation mode', async () => {
    /*
      Test case: EPMLSOPKET-12992, 12997, 12993, 12995
      Description: Add any structure and select it. Click and hold rotation handle
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/rings-heteroatoms-query-features.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await selectAllStructuresOnCanvas(page);
    await RotationTool(page).moveRotationHandleTo({ x: 726, y: 235 }, false);
    await takeEditorScreenshot(page);
  });

  test('Set of angles shown always covers [-90 - +90] range relatively to the handle position', async () => {
    /*
      Test case: EPMLSOPKET-12994, 12999, 13000, 13001, 13004, 13005
      Description: Add any structure and select it. Rotate it by 60 degrees.
    */
    const coordinatesFor60Degrees = {
      x: 530,
      y: 270,
    };
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/rings-heteroatoms-query-features.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await RotationTool(page).moveRotationHandleTo(
      coordinatesFor60Degrees,
      false,
    );
    await takeEditorScreenshot(page);
  });

  test('Rotate structure and release mouse', async () => {
    /*
      Test case: EPMLSOPKET-12996
      Description: Structure is rotated by 60 degrees. Mouse released
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/rings-heteroatoms-query-features.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await RotationTool(page).moveRotationHandleTo({
      x: 20,
      y: 100,
    });
    await takeEditorScreenshot(page);
  });

  test("Rotate handle doesn't change its position", async () => {
    /*
      Test case: EPMLSOPKET-12998
      Description: Click on rotation handle doesn't change its position
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/rings-heteroatoms-query-features.mol',
    );
    await selectAllStructuresOnCanvas(page);
    const rotationHandle = RotationTool(page).rotationHandle;
    const rotationHandleBoundingBox = await rotationHandle.boundingBox();
    if (!rotationHandleBoundingBox) {
      throw new Error('Rotation handle bounding box is not available.');
    }
    let { x: rotationHandleX, y: rotationHandleY } = rotationHandleBoundingBox;
    rotationHandleX += rotationHandleBoundingBox.width / 2;
    rotationHandleY += rotationHandleBoundingBox.height / 2;
    await clickOnCanvas(page, rotationHandleX, rotationHandleY, {
      from: 'pageTopLeft',
    });
    const rotationHandleBoundingBoxAfter = await rotationHandle.boundingBox();
    if (!rotationHandleBoundingBoxAfter) {
      throw new Error('Rotation handle bounding box is not available.');
    }
    let { x, y } = rotationHandleBoundingBoxAfter;
    x += rotationHandleBoundingBoxAfter.width / 2;
    y += rotationHandleBoundingBoxAfter.height / 2;
    expect(x).toEqual(rotationHandleX);
    expect(y).toEqual(rotationHandleY);
  });

  test('Works with different zoom level and screen resolution', async () => {
    /*
      Test case: EPMLSOPKET-12998
      Description: Click on rotation handle doesn't change its position
    */
    await page.setViewportSize({ width: 1200, height: 1080 });
    await zoomOutByKeyboard(page, { repeat: 5 });
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/rings-heteroatoms-query-features.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await RotationTool(page).moveRotationHandleTo({
      x: 20,
      y: 100,
    });
    await clickOnCanvas(page, 70, 90, {
      from: 'pageTopLeft',
    });
    const targetAtom = getAtomLocator(page, {
      atomLabel: 'C',
      atomId: 32,
    });
    await takeElementScreenshot(page, targetAtom, { padding: 100 });
  });

  test('Cancel rotation on "Escape" key', async () => {
    /*
      Test case: EPMLSOPKET-15499
      Description: Cancel rotation on "Escape" key
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/rings-heteroatoms-query-features.mol',
    );
    await selectAllStructuresOnCanvas(page);
    const targetAtom = getAtomLocator(page, {
      atomLabel: 'C',
      atomId: 32,
    });
    const screenBeforeRotation = await takeElementScreenshot(page, targetAtom, {
      padding: 150,
    });
    await RotationTool(page).moveRotationHandleTo(
      {
        x: 20,
        y: 100,
      },
      false,
    );
    await page.keyboard.press('Escape');

    const screenAfterRotation = await takeElementScreenshot(page, targetAtom, {
      padding: 150,
    });
    expect(screenAfterRotation).toEqual(screenBeforeRotation);
  });

  test('Structure remains selected after "Escape" key', async () => {
    /*
      Test case: EPMLSOPKET-15501
      Description: Structure remains selected after "Escape" key
    */
    const targetAtom = getAtomLocator(page, {
      atomLabel: 'C',
      atomId: 32,
    });
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/rings-heteroatoms-query-features.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await page.keyboard.press('Escape');
    await takeElementScreenshot(page, targetAtom, {
      padding: 160,
    });
  });

  test('Multiple "Escape" key presses cancel rotation', async () => {
    /*
      Test case: EPMLSOPKET-15502
      Description: Multiple "Escape" key presses cancel rotation
    */
    const targetAtom = getAtomLocator(page, {
      atomLabel: 'C',
      atomId: 32,
    });
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/rings-heteroatoms-query-features.mol',
    );
    await selectAllStructuresOnCanvas(page);
    const screenBeforeRotation = await takeElementScreenshot(page, targetAtom, {
      padding: 160,
    });
    await RotationTool(page).moveRotationHandleTo(
      {
        x: 20,
        y: 100,
      },
      false,
    );
    await page.keyboard.press('Escape');

    const screenAfterRotation = await takeElementScreenshot(page, targetAtom, {
      padding: 160,
    });
    expect(screenAfterRotation).toEqual(screenBeforeRotation);

    const smallShift = 10;
    await page.mouse.move(20 + smallShift, 100 + smallShift);
    await page.keyboard.press('Escape');

    const screenAfterSecondRotation = await takeElementScreenshot(
      page,
      targetAtom,
      {
        padding: 160,
      },
    );
    expect(screenAfterSecondRotation).toEqual(screenBeforeRotation);
  });

  test('Non-selected end of the selected bond should be the rotation center', async () => {
    /*
      Test case: EPMLSOPKET-15542
      Description: Non-selected end of the selected bond should be the rotation center
    */
    const chainWithDoubleBond =
      'Molfiles-V2000/chain-with-double-bond-in-the-middle.mol';
    await openFileAndAddToCanvas(page, chainWithDoubleBond);
    const coordinatesToStartSelection = 70;
    const smallShift = 20;
    const doubleBond = getBondLocator(page, { bondId: 18 });
    const box = await doubleBond.boundingBox();
    if (!box) throw new Error('Bond bounding box not found');
    const centerX = box.x + box.width / 2; // eslint-disable-line no-magic-numbers
    const centerY = box.y + box.height / 2; // eslint-disable-line no-magic-numbers
    await page.mouse.move(
      coordinatesToStartSelection,
      coordinatesToStartSelection,
    );
    await page.mouse.down();
    await page.mouse.move(centerX + 1, centerY + smallShift);
    await page.mouse.up();
    await takeEditorScreenshot(page);
  });

  test('Unselected label rotation', async () => {
    /*
      Test case: EPMLSOPKET-15543
      Description: Label is not rotated with the structure, if it is not selected
    */
    const chainWithDoubleBond = 'Molfiles-V2000/benzene-stereo.mol';
    await openFileAndAddToCanvas(page, chainWithDoubleBond);
    const coordinatesToStartSelection = 90;
    const smallShift = 15;

    const stereoBond = getBondLocator(page, { bondId: 14, bondStereo: 1 });
    const box = await stereoBond.boundingBox();
    if (!box) throw new Error('Bond bounding box not found');
    const centerX = box.x + box.width / 2; // eslint-disable-line no-magic-numbers
    const centerY = box.y + box.height / 2; // eslint-disable-line no-magic-numbers
    await page.mouse.move(
      coordinatesToStartSelection,
      coordinatesToStartSelection,
    );
    await page.mouse.down();
    await page.mouse.move(centerX + smallShift, centerY + smallShift);
    await page.mouse.up();
    await RotationTool(page).moveRotationHandleTo({
      x: 20,
      y: 100,
    });
    await takeEditorScreenshot(page);
  });

  test('Selected label rotation', async () => {
    /*
      Test case: EPMLSOPKET-15544
      Description: Label is rotated with the structure, if it is selected
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/benzene-stereo.mol');
    await selectAllStructuresOnCanvas(page);
    await RotationTool(page).moveRotationHandleTo({
      x: 20,
      y: 100,
    });
    await takeEditorScreenshot(page);
  });
});

test.describe('Rotation snapping', () => {
  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});
  test('for 90, 120 and 180 degrees', async () => {
    /*
      Test case: EPMLSOPKET-16906
      Description: Bond has 90, 120 and 180 snaps
    */
    const benzeneWithChain = 'Molfiles-V2000/benzene-with-chain.mol';
    await openFileAndAddToCanvas(page, benzeneWithChain);
    const smallShift = 30;
    const leftMostAtom = getAtomLocator(page, { atomLabel: 'S' });
    const rightMostAtom = getAtomLocator(page, { atomLabel: 'P' });
    const leftAtom = await leftMostAtom.boundingBox();
    const rightAtom = await rightMostAtom.boundingBox();
    if (leftAtom) {
      await page.mouse.move(
        leftAtom.x + leftAtom.width / 2,
        leftAtom.y - smallShift + leftAtom.height / 2,
      );
    }
    await page.mouse.down();
    if (rightAtom) {
      await page.mouse.move(
        rightAtom.x + smallShift + rightAtom.width / 2,
        rightAtom.y + smallShift + rightAtom.height / 2,
      );
    }
    await page.mouse.up();

    const firstStepCoordinates = {
      x: 500,
      y: 200,
    };
    await RotationTool(page).moveRotationHandleTo(firstStepCoordinates, false);
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

  test('bisector snapping for 2+ bonds', async () => {
    /*
      Test case: EPMLSOPKET-16907
      Description: For 2+ bonds counterclockwise see a prompt for the bisector, then snap to it
    */
    const benzeneWithChain = 'Molfiles-V2000/benzene-with-chain.mol';
    await openFileAndAddToCanvas(page, benzeneWithChain);
    const smallShift = 30;
    const shiftForBond = 20;
    const leftMostAtom = getAtomLocator(page, { atomLabel: 'S' });
    const rightMostAtom = getAtomLocator(page, { atomLabel: 'P' });
    const leftAtom = await leftMostAtom.boundingBox();
    const rightAtom = await rightMostAtom.boundingBox();
    if (leftAtom) {
      await page.mouse.move(
        leftAtom.x - shiftForBond + leftAtom.width / 2,
        leftAtom.y - smallShift + leftAtom.height / 2,
      );
    }
    await page.mouse.down();
    if (rightAtom) {
      await page.mouse.move(
        rightAtom.x + smallShift + rightAtom.width / 2,
        rightAtom.y + smallShift + rightAtom.height / 2,
      );
    }
    await page.mouse.up();
    const coordinatesForBisectTip = {
      x: 400,
      y: 300,
    };
    await RotationTool(page).moveRotationHandleTo(
      coordinatesForBisectTip,
      false,
    );
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

  test('around new center', async () => {
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
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/symmetric-structure.mol',
    );
    await selectAllStructuresOnCanvas(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(newCenterOfRotation.x, newCenterOfRotation.y);
    await page.mouse.up();

    await RotationTool(page).moveRotationHandleTo(
      coordinatesForRotation,
      false,
    );
    await takeEditorScreenshot(page);
    await page.mouse.up();

    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page);
  });
});
