import { test, expect } from '@playwright/test';
import {
  drawBenzeneRing,
  receiveKetFileComparisonData,
  receiveMolFileComparisonData,
  receiveRxnFileComparisonData,
} from '@utils';
import { drawReactionWithTwoBenzeneRings } from '@utils/canvas/drawStructures';

test('Save file - Save *.rxn file', async ({ page }) => {
  /**
   * Test case: EPMLSOPKET-1849
   * Description: Reaction is saved correctly in .rxn file
   */
  await page.goto('');

  await drawReactionWithTwoBenzeneRings(page, 150, 20, 100);

  const METADATA_STRING_INDEX = [7];
  const { rxnFile, rxnFileExpected } = await receiveRxnFileComparisonData(
    page,
    METADATA_STRING_INDEX,
    'tests/test-data/rxn_1849_to_compare.rxn'
  );

  expect(rxnFile).toEqual(rxnFileExpected);
});

test('Save file - Save *.mol file', async ({ page }) => {
  /**
   * Test case: EPMLSOPKET-1848
   * Description: Structure (benzine ring) is saved correctly to .mol format
   */
  await page.goto('');

  await drawBenzeneRing(page);
  const METADATA_STRING_INDEX = [1];
  const { molFile, molFileExpected } = await receiveMolFileComparisonData(
    page,
    METADATA_STRING_INDEX,
    'tests/test-data/mol_1848to_compare.mol'
  );

  expect(molFile).toEqual(molFileExpected);
});

test('Save file - Save *.ket file', async ({ page }) => {
  /**
   * Test case: EPMLSOPKET-2934
   * Description: Sctuctures are saved correctly in .ket file
   */
  await page.goto('');

  await drawReactionWithTwoBenzeneRings(page, 150, 20, 100);
  const { ketFile, ketFileExpected } = await receiveKetFileComparisonData(
    page,
    'tests/test-data/ket_2934_to_compare.ket'
  );

  expect(ketFile).toEqual(ketFileExpected);
});
