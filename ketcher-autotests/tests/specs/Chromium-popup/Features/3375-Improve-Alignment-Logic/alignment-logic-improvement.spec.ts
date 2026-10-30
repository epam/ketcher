/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
import { Page, test, expect } from '@fixtures';
import { takeEditorScreenshot, moveMouseAway } from '@utils';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { MonomerType } from '@utils/types';
import {
  keyboardTypeOnCanvas,
  keyboardPressOnCanvas,
  zoomOutByKeyboard,
} from '@utils/keyboard/index';
import { MacroBondTool } from '@tests/pages/constants/bondSelectionTool/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';

let page: Page;

/**
 * Returns the bases with the given alias in 5' -> 3' order of their chain.
 * Monomer ids grow in creation order, and typed sequences are created from 5' to 3',
 * so sorting by id gives chain positions regardless of DOM order or layout.
 * Each alias used here belongs to only one chain (A - S1, T - S2), and the count
 * check guards that assumption.
 */
async function getBasesInChainOrder(alias: string, expectedCount: number) {
  const bases = getMonomerLocator(page, {
    monomerAlias: alias,
    monomerType: MonomerType.Base,
  });
  await expect(bases).toHaveCount(expectedCount);
  const monomerIds = await bases.evaluateAll((elements) =>
    elements.map((element) => Number(element.getAttribute('data-monomerid'))),
  );
  return monomerIds
    .sort((a, b) => a - b)
    .map((monomerId) => getMonomerLocator(page, { monomerId }));
}

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
    await zoomOutByKeyboard(page, { repeat: 3 });

    // Step 4: Create 1 H-bond between T6 (S2) and A1 (S1); positions count from 5'
    const [a1] = await getBasesInChainOrder('A', 10);
    const [t6] = await getBasesInChainOrder('T', 1);

    await bondTwoMonomers(
      page,
      t6,
      a1,
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
    await zoomOutByKeyboard(page, { repeat: 3 });

    // Step 4: Create 2 H-bonds: T5-T6 (S2) with A2-A1 (S1); positions count from 5'
    const [a1, a2] = await getBasesInChainOrder('A', 10);
    const [t5, t6] = await getBasesInChainOrder('T', 2);

    // Create first H-bond
    await bondTwoMonomers(
      page,
      t5,
      a2,
      undefined,
      undefined,
      MacroBondTool.Hydrogen,
    );

    // Create second H-bond
    await bondTwoMonomers(
      page,
      t6,
      a1,
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
    await zoomOutByKeyboard(page, { repeat: 3 });

    // Step 4: Create 3 H-bonds: T4-T6 (S2) with A3-A1 (S1); positions count from 5'
    const [a1, a2, a3] = await getBasesInChainOrder('A', 10);
    const [t4, t5, t6] = await getBasesInChainOrder('T', 3);

    // Create first H-bond
    await bondTwoMonomers(
      page,
      t4,
      a3,
      undefined,
      undefined,
      MacroBondTool.Hydrogen,
    );

    // Create second H-bond
    await bondTwoMonomers(
      page,
      t5,
      a2,
      undefined,
      undefined,
      MacroBondTool.Hydrogen,
    );

    // Create third H-bond
    await bondTwoMonomers(
      page,
      t6,
      a1,
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
