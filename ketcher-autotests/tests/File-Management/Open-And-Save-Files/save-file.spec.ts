/* eslint-disable no-magic-numbers */
import { test, expect } from '@playwright/test';
import { drawBenzeneRing, receiveFileComparisonData, saveToFile } from '@utils';
import { drawReactionWithTwoBenzeneRings } from '@utils/canvas/drawStructures';
import { getKet, getMolfile, getRxn } from '@utils/formats';

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
    ARROW_LENGTH,
  );

  const expectedFile = await getRxn(page, 'v2000');
  await saveToFile('rxn-1849-to-compare-expectedV2000.rxn', expectedFile);

  const METADATA_STRING_INDEX = [2, 7, 25];

  const { fileExpected: rxnFileExpected, file: rxnFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/rxn-1849-to-compare-expectedV2000.rxn',
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

  const expectedFile = await getMolfile(page, 'v2000');
  await saveToFile('mol-1848-to-compare-expectedV2000.mol', expectedFile);

  const METADATA_STRING_INDEX = [1];

  const { fileExpected: molFileExpected, file: molFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/mol-1848-to-compare-expectedV2000.mol',
      fileFormat: 'v2000',
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
    ARROW_LENGTH,
  );

  const expectedFile = await getKet(page);
  await saveToFile('ket-2934-to-compare-expected.ket', expectedFile);

  const { fileExpected: ketFileExpected, file: ketFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/ket-2934-to-compare-expected.ket',
    });

  expect(ketFile).toEqual(ketFileExpected);
});
