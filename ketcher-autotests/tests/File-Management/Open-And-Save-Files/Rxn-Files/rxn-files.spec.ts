import { expect, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  receiveFileComparisonData,
  openFileAndAddToCanvas,
} from '@utils';

test('Open and Save file - Reaction from file that contains abbreviation 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1899(1)
   * Description: Reaction with abbreviations is opened and saved correctly
   */
  await page.goto('');

  await openFileAndAddToCanvas('sec_butyl_abr.rxn', page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - Reaction from file that contains abbreviation 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1899(2)
   * Description: Reaction with abbreviations is opened and saved correctly
   */
  await page.goto('');

  await openFileAndAddToCanvas('sec_butyl_abr.rxn', page);

  // eslint-disable-next-line no-magic-numbers
  const METADATA_STRINGS_INDEXES = [2, 7, 23, 54];

  const { fileExpected: rxnFileExpected, file: rxnFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/rxn_1899_to_compare.rxn',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
    });

  expect(rxnFile).toEqual(rxnFileExpected);
});

test('Open and Save file - Reaction from file that contains Heteroatoms 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1904(1)
   * Description: Reaction with heteroatoms is opened and saved correctly
   */
  await page.goto('');

  await openFileAndAddToCanvas('Heteroatoms.rxn', page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - Reaction from file that contains Heteroatoms 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1904(2)
   * Description: Reaction with heteroatoms is opened and saved correctly
   */
  await page.goto('');

  await openFileAndAddToCanvas('Heteroatoms.rxn', page);

  // eslint-disable-next-line no-magic-numbers
  const METADATA_STRINGS_INDEXES = [2, 7, 30, 39, 62];

  const { fileExpected: rxnFileExpected, file: rxnFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/rxn_1904_to_compare.rxn',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
    });

  expect(rxnFile).toEqual(rxnFileExpected);
});

test('Open and Save file - V3000 rxn file contains Rgroup 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1902(1)
   * Description: Reaction can be opened correctly from rxn V3000 file
   */
  await page.goto('');

  await openFileAndAddToCanvas('Rgroup_V3000.rxn', page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - V3000 rxn file contains Rgroup 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1902(2)
   * Description: Reaction can be saved correctly to rxn V3000 file
   */
  await page.goto('');

  await openFileAndAddToCanvas('Rgroup_V3000.rxn', page);

  // eslint-disable-next-line no-magic-numbers
  const METADATA_STRINGS_INDEXES = [2];

  const { fileExpected: rxnFileExpected, file: rxnFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/rxn_1902_to_compare.rxn',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v3000',
    });

  expect(rxnFile).toEqual(rxnFileExpected);
});
