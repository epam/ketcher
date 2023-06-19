import { test, expect } from '@playwright/test';
import { drawBenzeneRing, receiveFileComparisonData } from '@utils';
import { drawReactionWithTwoBenzeneRings } from '@utils/canvas/drawStructures';

const RING_OFFSET = 150;
const ARROW_OFFSET = 20;
const ARROW_LENGTH = 100;

test('Save file - Save *.rxn file', async ({ page }) => {
  /**
   * Test case: EPMLSOPKET-1849
   * Description: Reaction is saved correctly in .rxn file
   */
  await page.goto('');

  await drawReactionWithTwoBenzeneRings(
    page,
    RING_OFFSET,
    ARROW_OFFSET,
    ARROW_LENGTH
  );

  // eslint-disable-next-line no-magic-numbers
  const METADATA_STRING_INDEX = [2, 7, 25];

  const { fileExpected: rxnFileExpected, file: rxnFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/rxn_1849_to_compare.rxn',
      metaDataIndexes: METADATA_STRING_INDEX,
      fileFormat: 'v2000',
    });

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

  const { fileExpected: molFileExpected, file: molFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/mol_1848to_compare.mol',
      metaDataIndexes: METADATA_STRING_INDEX,
    });

  expect(molFile).toEqual(molFileExpected);
});

test('Save file - Save *.ket file', async ({ page }) => {
  /**
   * Test case: EPMLSOPKET-2934
   * Description: Sctuctures are saved correctly in .ket file
   */
  await page.goto('');

  await drawReactionWithTwoBenzeneRings(
    page,
    RING_OFFSET,
    ARROW_OFFSET,
    ARROW_LENGTH
  );

  const { fileExpected: ketFileExpected, file: ketFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/ket_2934_to_compare.ket',
    });

  expect(ketFile).toEqual(ketFileExpected);
});
