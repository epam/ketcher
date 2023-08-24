/* eslint-disable no-magic-numbers */
import { expect, test } from '@playwright/test';
import {
  receiveFileComparisonData,
  openFileAndAddToCanvas,
  saveToFile,
  takeEditorScreenshot,
} from '@utils';
import { getSdf } from '@utils/formats';

test('Open SDF v2000 file and save it', async ({ page }) => {
  await page.goto('');

  await openFileAndAddToCanvas('SDF/sdf-v2000-to-open.sdf', page);
  try {
    const expectedFile = await getSdf(page, 'v2000');
    await saveToFile('SDF/sdf-v2000-to-open-expected.sdf', expectedFile);
  } catch (error) {
    console.log(error);
  }

  const METADATA_STRING_INDEX = [1, 19];
  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/SDF/sdf-v2000-to-open-expected.sdf',
      metaDataIndexes: METADATA_STRING_INDEX,
      fileFormat: 'v2000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
});

test('Open SDF v3000 file and save it', async ({ page }) => {
  await page.goto('');

  await openFileAndAddToCanvas('SDF/sdf-v3000-to-open.sdf', page);
  try {
    const expectedFile = await getSdf(page, 'v3000');
    await saveToFile('SDF/sdf-v3000-to-open-expected.sdf', expectedFile);
  } catch (error) {
    console.log(error);
  }

  const METADATA_STRING_INDEX = [1, 26];
  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/SDF/sdf-v3000-to-open-expected.sdf',
      metaDataIndexes: METADATA_STRING_INDEX,
      fileFormat: 'v3000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
});

test('Open SDF V2000 file and place it on canvas', async ({ page }) => {
  await page.goto('');

  await openFileAndAddToCanvas('SDF/sdf-v2000-to-open.sdf', page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open SDF V3000 file and place it on canvas', async ({ page }) => {
  await page.goto('');

  await openFileAndAddToCanvas('SDF/sdf-v3000-to-open.sdf', page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});
