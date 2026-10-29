/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
import { Page, test } from '@fixtures';
import { takeEditorScreenshot, moveMouseAway } from '@utils';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import {
  keyboardTypeOnCanvas,
  keyboardPressOnCanvas,
} from '@utils/keyboard/index';
import { MacroBondTool } from '@tests/pages/constants/bondSelectionTool/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';

let page: Page;

test.describe('Autotests: Improve the alignment logic', () => {
  test.beforeAll(async ({ initSequenceCanvas }) => {
    page = await initSequenceCanvas();
  });

  test.afterEach(async ({ SequenceCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1 - Aligns two strands with 1 base-pair bond (10 vs 6)', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10014
     * Description: Improve the alignment logic for two strands with 1 base-pair bond
     * Scenario:
     * 1. Macromolecules mode → Sequence
     * 2. Add sequences: S1 AAAAAAAAAA, S2 CCCCCT
     * 3. Switch to Flex
     * 4. Create 1 H-bond: T (S2) ↔ any A (S1)
     * 5. Switch to Snake
     * Expected result: Best arrangement (max alignment index) chosen
     *
     * Version 3.15.0
     */

    // Step 1: Already in Sequence mode via initSequenceCanvas

    // Step 2: Add first sequence S1 AAAAAAAAAA
    await keyboardTypeOnCanvas(page, 'AAAAAAAAAA');
    await keyboardPressOnCanvas(page, 'Enter');

    // Add second sequence S2 CCCCCT
    await keyboardTypeOnCanvas(page, 'CCCCCT');
    await keyboardPressOnCanvas(page, 'Escape');

    // Step 3: Switch to Flex mode
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);

    // Step 4: Create 1 H-bond between T (S2) and first A (S1)
    const firstA = getMonomerLocator(page, { monomerAlias: 'A' }).first();
    const firstT = getMonomerLocator(page, { monomerAlias: 'T' }).first();

    await bondTwoMonomers(
      page,
      firstT,
      firstA,
      undefined,
      undefined,
      MacroBondTool.Hydrogen,
    );

    // Step 5: Switch to Snake mode
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);

    await moveMouseAway(page);

    // Verify the alignment arrangement is optimized
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Case 2 - Aligns two strands with 2 consecutive base-pair bonds (10 vs 6)', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10014
     * Description: Improve the alignment logic for two strands with 2 consecutive base-pair bonds
     * Scenario:
     * 1. Macromolecules mode → Sequence
     * 2. Add sequences: S1 AAAAAAAAAA, S2 CCCCTT
     * 3. Switch to Flex
     * 4. Create 2 H-bonds: both T (S2) ↔ two neighboring A (S1)
     * 5. Switch to Snake
     * Expected result: Best arrangement (max alignment index) chosen
     *
     * Version 3.15.0
     */

    // Step 1: Already in Sequence mode

    // Step 2: Add first sequence S1 AAAAAAAAAA
    await keyboardTypeOnCanvas(page, 'AAAAAAAAAA');
    await keyboardPressOnCanvas(page, 'Enter');

    // Add second sequence S2 CCCCTT
    await keyboardTypeOnCanvas(page, 'CCCCTT');
    await keyboardPressOnCanvas(page, 'Escape');

    // Step 3: Switch to Flex mode
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);

    // Step 4: Create 2 H-bonds between both T's (S2) and two neighboring A's (S1)
    const firstA = getMonomerLocator(page, { monomerAlias: 'A' }).first();
    const secondA = getMonomerLocator(page, { monomerAlias: 'A' }).nth(1);
    const firstT = getMonomerLocator(page, { monomerAlias: 'T' }).first();
    const secondT = getMonomerLocator(page, { monomerAlias: 'T' }).nth(1);

    // Create first H-bond
    await bondTwoMonomers(
      page,
      firstT,
      secondA,
      undefined,
      undefined,
      MacroBondTool.Hydrogen,
    );

    // Create second H-bond
    await bondTwoMonomers(
      page,
      secondT,
      firstA,
      undefined,
      undefined,
      MacroBondTool.Hydrogen,
    );

    // Step 5: Switch to Snake mode
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);

    await moveMouseAway(page);

    // Verify the alignment arrangement is optimized
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Case 3 - Aligns two strands with 3 consecutive base-pair bonds (10 vs 6)', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10014
     * Description: Improve the alignment logic for two strands with 3 consecutive base-pair bonds
     * Scenario:
     * 1. Macromolecules mode → Sequence
     * 2. Add sequences: S1 AAAAAAAAAA, S2 CCCTTT
     * 3. Switch to Flex
     * 4. Create 3 H-bonds: TTT (S2) ↔ three neighboring A (S1)
     * 5. Switch to Snake
     * Expected result: Best arrangement (max alignment index) chosen
     *
     * Version 3.15.0
     */

    // Step 1: Already in Sequence mode

    // Step 2: Add first sequence S1 AAAAAAAAAA
    await keyboardTypeOnCanvas(page, 'AAAAAAAAAA');
    await keyboardPressOnCanvas(page, 'Enter');

    // Add second sequence S2 CCCTTT
    await keyboardTypeOnCanvas(page, 'CCCTTT');
    await keyboardPressOnCanvas(page, 'Escape');

    // Step 3: Switch to Flex mode
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);

    // Step 4: Create 3 H-bonds between TTT (S2) and three neighboring A's (S1)
    const firstA = getMonomerLocator(page, { monomerAlias: 'A' }).first();
    const secondA = getMonomerLocator(page, { monomerAlias: 'A' }).nth(1);
    const thirdA = getMonomerLocator(page, { monomerAlias: 'A' }).nth(2);
    const firstT = getMonomerLocator(page, { monomerAlias: 'T' }).first();
    const secondT = getMonomerLocator(page, { monomerAlias: 'T' }).nth(1);
    const thirdT = getMonomerLocator(page, { monomerAlias: 'T' }).nth(2);

    // Create first H-bond
    await bondTwoMonomers(
      page,
      firstT,
      thirdA,
      undefined,
      undefined,
      MacroBondTool.Hydrogen,
    );

    // Create second H-bond
    await bondTwoMonomers(
      page,
      secondT,
      secondA,
      undefined,
      undefined,
      MacroBondTool.Hydrogen,
    );

    // Create third H-bond
    await bondTwoMonomers(
      page,
      thirdT,
      firstA,
      undefined,
      undefined,
      MacroBondTool.Hydrogen,
    );

    // Step 5: Switch to Snake mode
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);

    await moveMouseAway(page);

    // Verify the alignment arrangement is optimized
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });
});
