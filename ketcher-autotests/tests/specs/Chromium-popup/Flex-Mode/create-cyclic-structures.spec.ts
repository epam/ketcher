/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
import { test, expect } from '@fixtures';
import { Page } from '@playwright/test';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import {
  selectAllStructuresOnCanvas,
  takeEditorScreenshot,
} from '@utils/canvas';
import { openFileAndAddToCanvasMacro } from '@utils/index';

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
});
