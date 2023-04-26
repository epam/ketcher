import { expect, test } from '@playwright/test';
import {
  buttonLocator,
  openFile,
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  delay,
  receiveRxnFileComparisonData,
} from '@utils';

test('Open and Save file - Reaction from file that contains abbreviation 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1899(1)
   * Description: Reaction with abbreviations is opened and saved correctly
   */
  await page.goto('');

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('sec_butyl_abr.rxn', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await delay(8);
  await clickInTheMiddleOfTheScreen(page);
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

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('sec_butyl_abr.rxn', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await delay(8);
  await clickInTheMiddleOfTheScreen(page);

  const METADATA_STRINGS_INDEXES = [2, 7, 23, 54];
  const { rxnFileExpected, rxnFile } = await receiveRxnFileComparisonData(
    page,
    METADATA_STRINGS_INDEXES,
    'tests/test-data/rxn_1899_to_compare.rxn'
  );

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

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('Heteroatoms.rxn', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await delay(8);
  await clickInTheMiddleOfTheScreen(page);
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

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('Heteroatoms.rxn', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await delay(8);
  await clickInTheMiddleOfTheScreen(page);

  const METADATA_STRINGS_INDEXES = [2, 7, 30, 39, 62];
  const { rxnFileExpected, rxnFile } = await receiveRxnFileComparisonData(
    page,
    METADATA_STRINGS_INDEXES,
    'tests/test-data/rxn_1904_to_compare.rxn'
  );

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

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('Rgroup_V3000.rxn', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await delay(8);
  await clickInTheMiddleOfTheScreen(page);
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

  const openButton = page.locator(buttonLocator);
  await openButton.click();
  await openFile('Rgroup_V3000.rxn', page);
  await page.getByRole('button', { name: 'Add to Canvas' }).click();
  await delay(8);
  await clickInTheMiddleOfTheScreen(page);

  const METADATA_STRINGS_INDEXES = [2];
  const { rxnFileExpected, rxnFile } = await receiveRxnFileComparisonData(
    page,
    METADATA_STRINGS_INDEXES,
    'tests/test-data/rxn_1902_to_compare.rxn',
    'v3000'
  );

  expect(rxnFile).toEqual(rxnFileExpected);
});
