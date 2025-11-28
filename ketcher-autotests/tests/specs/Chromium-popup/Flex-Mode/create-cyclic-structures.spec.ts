/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
import { test, expect } from '@fixtures';
import { Page } from '@playwright/test';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MonomerOption } from '@tests/pages/constants/contextMenu/Constants';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import {
  delay,
  selectAllStructuresOnCanvas,
  takeEditorScreenshot,
  takeElementScreenshot,
} from '@utils/canvas';
import { openFileAndAddToCanvasMacro } from '@utils/index';
import { getMonomerLocator } from '@utils/macromolecules/monomer';

let page: Page;

test.describe('Cyclic structures', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.afterEach(async ({ FlexCanvas: _ }) => {});
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: Verify that closed structure must contain at least three monomers', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8738
     * Description: Verify that closed structure must contain at least three monomers
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2. Select structure on canvas that contains three monomers bonded with each other
     * 3. Press "Arrange as a Ring" button on the top toolbar
     *
     * Version 3.10
     */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/three-sugar-connected-to-each-other.ket',
    );
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await MacromoleculesTopToolbar(page).arrangeAsARing();
    await takeEditorScreenshot(page);
  });

  test('Case 2: Verify that closed structure with two monomers can not be cycled', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8738
     * Description: Closed structure with two monomers can not be cycled. Arrange as a Ring button is inactive.
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2. Select structure on canvas that contains two monomers bonded with each other
     * 3. Press "Arrange as a Ring" button on the top toolbar
     *
     * Version 3.10
     */
    const arrangeAsARingButton =
      MacromoleculesTopToolbar(page).arrangeAsARingButton;
    await openFileAndAddToCanvasMacro(
      page,
      'KET/two-monomers-connected-with-each-other.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await expect(arrangeAsARingButton).toBeDisabled();
  });

  test('Case 3: Verify that closed structure without small molecules can be arranged as ring', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8738
     * Description: Closed structure without small molecules can be arranged as ring
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2. Select structure on canvas without small molecules
     * 3. Press "Arrange as a Ring" button on the top toolbar
     *
     * Version 3.10
     */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/rna-sequence-without-small-molecules.ket',
    );
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await MacromoleculesTopToolbar(page).arrangeAsARing();
    await takeEditorScreenshot(page);
  });

  test('Case 4: Verify that closed structure with small molecules cant be arranged as ring', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8738
     * Description: Closed structure with small molecules cant be arranged as ring
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2. Select structure on canvas with small molecules
     * 3. Press "Arrange as a Ring" button on the top toolbar
     *
     * Version 3.10
     */
    const arrangeAsARingButton =
      MacromoleculesTopToolbar(page).arrangeAsARingButton;
    await openFileAndAddToCanvasMacro(page, 'KET/rna-with-small-molecules.ket');
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await expect(arrangeAsARingButton).toBeDisabled();
  });

  test('Case 5: Verify that right-click menu for closed valid structure have a Arrange As A Ring point', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8738
     * Description: Right-click menu for closed valid structure have a Arrange As A Ring point
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2. Select structure on canvas
     * 3. Press right-click
     *
     * Version 3.10
     */
    const sugar = getMonomerLocator(page, Sugar._12ddR).first();
    await openFileAndAddToCanvasMacro(
      page,
      'KET/three-sugar-connected-to-each-other.ket',
    );
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await ContextMenu(page, sugar).open();
    await delay(0.2);
    await takeElementScreenshot(
      page,
      ContextMenu(page, sugar).contextMenuBody,
      { padding: 1 },
    );
  });

  test('Case 6: Verify that valid closed structure can be arranged as a ring through right-click menu', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8738
     * Description: Valid closed structure can be arranged as a ring through right-click menu
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2. Select structure on canvas
     * 3. Press right-click and select Arrange As A Ring
     *
     * Version 3.10
     */
    const sugar = getMonomerLocator(page, Sugar.R).first();
    await openFileAndAddToCanvasMacro(
      page,
      'KET/rna-sequence-without-small-molecules.ket',
    );
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await ContextMenu(page, sugar).click(MonomerOption.ArrangeAsARing);
    await takeEditorScreenshot(page);
  });

  test('Case 7: Verify that Arrange as a Ring option is not available in other layout modes(Snake, Sequence)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8738
     * Description: Arrange as a Ring option is not available in other layout modes(Snake, Sequence)
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2. Check top toolbar Arrange as a Ring button availability in Snake and Sequence layout modes
     *
     * Version 3.10
     */
    const toolbar = MacromoleculesTopToolbar(page);
    const arrangeAsARingButton = toolbar.arrangeAsARingButton;
    await openFileAndAddToCanvasMacro(
      page,
      'KET/rna-sequence-without-small-molecules.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await expect(arrangeAsARingButton).toBeVisible();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await expect(arrangeAsARingButton).not.toBeVisible();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await expect(arrangeAsARingButton).not.toBeVisible();
  });
});
