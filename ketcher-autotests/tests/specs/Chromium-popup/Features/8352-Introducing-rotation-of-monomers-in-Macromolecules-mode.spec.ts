/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Page, test, expect } from '@fixtures';
import { RotationTool } from '@tests/pages/common/canvas/RotationTool';
import { Library } from '@tests/pages/macromolecules/Library';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import {
  selectAllStructuresOnCanvas,
  takeEditorScreenshot,
} from '@utils';
import { openFileAndAddToCanvasMacro } from '@utils/files/readFile';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';

let page: Page;

test.describe('Introducing rotation of monomers in Macromolecules mode', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.afterEach(async ({ FlexCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1 - Rotation is enabled when two monomers without bonds are selected', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12491
     * Description: Rotation is enabled in Macromolecules mode when two monomers without any bonds between them are selected
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Place two monomers on the canvas without connecting them
     * 3. Select all structures
     * 4. Verify that the rotation handle is visible (rotation is enabled)
     *
     * Version 3.14.0
     */
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 300, y: 300 });
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 500, y: 300 });
    await selectAllStructuresOnCanvas(page);

    const rotationTool = RotationTool(page);
    await expect(rotationTool.rotationHandle).toBeVisible();
  });

  test('Case 2 - Rotation is enabled when two monomers with bonds are selected', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12491
     * Description: Rotation is enabled in Macromolecules mode when two monomers with bonds between them are selected
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Load a structure with two monomers connected by a bond
     * 3. Select all structures
     * 4. Verify that the rotation handle is visible (rotation is enabled)
     *
     * Version 3.14.0
     */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/two-monomers-connected-with-each-other.ket',
    );
    await selectAllStructuresOnCanvas(page);

    const rotationTool = RotationTool(page);
    await expect(rotationTool.rotationHandle).toBeVisible();
  });

  test('Case 3 - Rotation is enabled when more than two monomers are selected regardless of bonds', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12491
     * Description: Rotation is enabled in Macromolecules mode when more than two monomers are selected, regardless of whether they are connected by bonds
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Load a structure with three monomers (connected by bonds)
     * 3. Select all structures
     * 4. Verify that the rotation handle is visible (rotation is enabled)
     *
     * Version 3.14.0
     */
    await openFileAndAddToCanvasMacro(page, 'KET/flipping-monomers.ket');
    await selectAllStructuresOnCanvas(page);

    const rotationTool = RotationTool(page);
    await expect(rotationTool.rotationHandle).toBeVisible();
  });

  test('Case 4 - Rotation is not enabled when only one monomer is selected', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12491
     * Description: Rotation is not enabled in Macromolecules mode when only one monomer is selected
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Place a single monomer on the canvas
     * 3. Select the monomer
     * 4. Verify that the rotation handle is NOT visible (rotation is disabled)
     *
     * Version 3.14.0
     */
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 400, y: 300 });
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    const monomer = getMonomerLocator(page, Peptide.A).first();
    await monomer.click();

    const rotationTool = RotationTool(page);
    await expect(rotationTool.rotationHandle).not.toBeVisible();
  });

  test('Case 5 - Bounding box with rotation handle and center cross appears when two or more monomers are selected', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12491
     * Description: A bounding box with a rotation handle and a cross in the center of rotation appears when two or more monomers are selected in Macromolecules mode
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Place two monomers on the canvas
     * 3. Select all structures
     * 4. Verify that the rotation handle and center handle are both visible
     * 5. Take screenshot to verify bounding box appearance
     *
     * Version 3.14.0
     */
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 300, y: 300 });
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 500, y: 300 });
    await selectAllStructuresOnCanvas(page);

    const rotationTool = RotationTool(page);
    await expect(rotationTool.rotationHandle).toBeVisible();
    await expect(rotationTool.rotationCenterHandle).toBeVisible();
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Case 6 - Rotation, flip, and delete buttons are shown above the bounding box for selected monomers', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12491
     * Description: There are rotation, flip, delete buttons above the bounding box for selected monomers in Macromolecules mode
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Place two monomers on the canvas
     * 3. Select all structures
     * 4. Verify that flip horizontally, flip vertically, and delete buttons are visible
     *
     * Version 3.14.0
     */
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 300, y: 300 });
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 500, y: 300 });
    await selectAllStructuresOnCanvas(page);

    const rotationTool = RotationTool(page);
    await expect(rotationTool.flipHorizontallyButton).toBeVisible();
    await expect(rotationTool.flipVerticallyButton).toBeVisible();
    await expect(rotationTool.deleteButton).toBeVisible();
  });

  test('Case 7 - Rotation angles are displayed near the bounding box while rotating', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12491
     * Description: In Macromolecules mode rotation angles are displayed near the bounding box while rotating
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Place two monomers on the canvas
     * 3. Select all structures
     * 4. Start rotating by pressing and holding left mouse button on the rotation handle
     * 5. Take screenshot to verify rotation angles are displayed
     *
     * Version 3.14.0
     */
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 300, y: 300 });
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 500, y: 300 });
    await selectAllStructuresOnCanvas(page);

    const rotationTool = RotationTool(page);
    // Start rotation without releasing mouse button to capture angle display
    await rotationTool.moveRotationHandleTo({ x: 400, y: 200 }, false);

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    // Release mouse to end rotation
    await page.mouse.up();
  });

  test('Case 8 - Default rotation angle is set to 15°', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12491
     * Description: The default rotation angle is set to 15° in Macromolecules mode
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Place two monomers on the canvas
     * 3. Select all structures
     * 4. Rotate slightly to snap to nearest angle
     * 5. Take screenshot to verify 15° increments are shown
     *
     * Version 3.14.0
     */
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 300, y: 300 });
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 500, y: 300 });
    await selectAllStructuresOnCanvas(page);

    const rotationTool = RotationTool(page);
    // Move to position that should snap to 15° angle
    await rotationTool.moveRotationHandleTo({ x: 350, y: 180 }, false);

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    // Release mouse to end rotation
    await page.mouse.up();
  });

  test('Case 9 - Rotation mode is activated by pressing left mouse button on the rotation handle', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12491
     * Description: Rotation mode gets activated in Macromolecules mode by pressing the left mouse button (rotation handle turns blue, cross turns blue, dashed line connects them, bounding box is replaced with a circle)
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Place two monomers on the canvas
     * 3. Select all structures
     * 4. Press and hold the left mouse button on the rotation handle
     * 5. Take screenshot to verify rotation mode activation (blue handle, blue cross, dashed line, rotation circle)
     *
     * Version 3.14.0
     */
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 300, y: 300 });
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 500, y: 300 });
    await selectAllStructuresOnCanvas(page);

    const rotationTool = RotationTool(page);
    // Press mouse button on rotation handle without releasing to activate rotation mode
    await rotationTool.rotationHandle.hover();
    await page.mouse.down();

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    // Release mouse to end rotation
    await page.mouse.up();
  });

  test('Case 10 - When rotation mode is deactivated, the selected fragment stays in its new position', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12491
     * Description: When rotation mode is deactivated in Macromolecules mode, the selected fragment remains in its new position, rotation circle is replaced with the bounding box, redrawn at its initial position, and all labels of the rotated fragment are aligned with the horizontal axis
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Place two monomers on the canvas
     * 3. Select all structures
     * 4. Rotate the selection by dragging the rotation handle
     * 5. Release the mouse button
     * 6. Take screenshot to verify that monomers stayed in new rotated position and bounding box is redrawn
     *
     * Version 3.14.0
     */
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 300, y: 300 });
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 500, y: 300 });
    await selectAllStructuresOnCanvas(page);

    const rotationTool = RotationTool(page);
    // Rotate by moving handle, then release
    await rotationTool.moveRotationHandleTo({ x: 400, y: 450 });

    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Case 11 - Flip horizontally, flip vertically and delete buttons work as expected', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12491
     * Description: 'flip horizontally', 'flip vertically' and 'delete' buttons work as expected in Macromolecule mode
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Load a structure with two connected monomers
     * 3. Select all structures
     * 4. Click 'flip horizontally' and take screenshot
     * 5. Click 'flip vertically' and take screenshot
     * 6. Click 'delete' and verify canvas is empty
     *
     * Version 3.14.0
     */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/two-monomers-connected-with-each-other.ket',
    );
    await selectAllStructuresOnCanvas(page);

    const rotationTool = RotationTool(page);

    // Test flip horizontally
    await rotationTool.flipHorizontally();
    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });

    // Test flip vertically
    await rotationTool.flipVertically();
    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });

    // Test delete
    await rotationTool.delete();
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 12 - Center of circle is at center of rotation and diameter equals bounding box height', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12491
     * Description: When rotation mode is activated, the center of the circle is at the center of rotation, the circle's diameter is equal to the height of the replaced bounding box
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Place two monomers on the canvas
     * 3. Select all structures
     * 4. Press and hold the left mouse button on the rotation handle to activate rotation mode
     * 5. Take screenshot to verify circle center and diameter match the bounding box
     *
     * Version 3.14.0
     */
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 300, y: 300 });
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 300, y: 500 });
    await selectAllStructuresOnCanvas(page);

    const rotationTool = RotationTool(page);
    // Activate rotation mode by holding mouse button on handle
    await rotationTool.rotationHandle.hover();
    await page.mouse.down();

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    await page.mouse.up();
  });

  test('Case 13 - Predefined angles are marked on the rotation circle: -90, -60, -45, -30, 0, 30, 45, 60, 90', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12491
     * Description: When rotation mode is activated in Macromolecule mode the following predefined angles are marked on the rotation circle: -90, -60, -45, -30, 0, 30, 45, 60, 90
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Place two monomers on the canvas
     * 3. Select all structures
     * 4. Press and hold the left mouse button on the rotation handle
     * 5. Take screenshot to verify predefined angle markers are visible
     *
     * Version 3.14.0
     */
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 300, y: 300 });
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 500, y: 300 });
    await selectAllStructuresOnCanvas(page);

    const rotationTool = RotationTool(page);
    // Activate rotation mode by holding mouse button on handle
    await rotationTool.rotationHandle.hover();
    await page.mouse.down();

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    await page.mouse.up();
  });

  test('Case 14 - Angles range always covers [-90 to +90] relative to the handle position when rotation starts', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12491
     * Description: When rotation starts in Macromolecule mode, the set of angles shown always covers the range [-90 - +90] relatively to the handle position
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Place two monomers on the canvas
     * 3. Select all structures
     * 4. Start rotation by pressing and holding on the rotation handle
     * 5. Move handle to verify that the visible angle range is [-90 to +90] relative to the starting position
     * 6. Take screenshot to verify angle range
     *
     * Version 3.14.0
     */
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 300, y: 300 });
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 500, y: 300 });
    await selectAllStructuresOnCanvas(page);

    const rotationTool = RotationTool(page);
    // Start rotation and move to a position to show the relative angle range
    await rotationTool.moveRotationHandleTo({ x: 400, y: 150 }, false);

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    await page.mouse.up();
  });

  test('Case 15 - Current rotation angle is displayed at starting position when rotation starts', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12491
     * Description: When rotation starts in Macromolecule mode, the current rotation angle is displayed at starting position
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Place two monomers on the canvas
     * 3. Select all structures
     * 4. Press left mouse button on the rotation handle (do not move yet)
     * 5. Take screenshot to verify 0° angle is shown at the starting position
     *
     * Version 3.14.0
     */
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 300, y: 300 });
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 500, y: 300 });
    await selectAllStructuresOnCanvas(page);

    const rotationTool = RotationTool(page);
    // Press mouse button on rotation handle without moving to see initial 0° display
    await rotationTool.rotationHandle.hover();
    await page.mouse.down();

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    await page.mouse.up();
  });

  test('Case 16 - Ability to move the center of rotation in Macromolecules mode', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12491
     * Description: Verify ability to move the center of rotation in Macromolecules mode
     * Scenario:
     * 1. Open Macromolecules canvas - Flex mode
     * 2. Place two monomers on the canvas
     * 3. Select all structures
     * 4. Drag the center of rotation handle to a new position
     * 5. Verify rotation center handle moved and take screenshot
     *
     * Version 3.14.0
     */
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 300, y: 300 });
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 500, y: 300 });
    await selectAllStructuresOnCanvas(page);

    const rotationTool = RotationTool(page);
    await expect(rotationTool.rotationCenterHandle).toBeVisible();

    // Move the center of rotation to a new position
    await rotationTool.moveRotationCenterHandleTo({ x: 450, y: 350 });

    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });
});
