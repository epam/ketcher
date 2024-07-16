/* eslint-disable no-magic-numbers */
import { expect, test } from '@playwright/test';
import {
  receiveFileComparisonData,
  openFileAndAddToCanvas,
  saveToFile,
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasAsNewProject,
} from '@utils';
import { getSdf } from '@utils/formats';

test('Open SDF v2000 file and save it', async ({ page }) => {
  await waitForPageInit(page);

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
  await waitForPageInit(page);

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
  await waitForPageInit(page);

  await openFileAndAddToCanvas('SDF/sdf-v2000-to-open.sdf', page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open SDF V3000 file and place it on canvas', async ({ page }) => {
  await waitForPageInit(page);

  await openFileAndAddToCanvas('SDF/sdf-v3000-to-open.sdf', page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Validate that unsplit nucleotides connected with another nucleotides could be saved to sdf 3000 file and loaded back', async ({
  page,
}) => {
  /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with another nucleotides could be saved to sdf 3000 file and loaded back
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas(
    'KET/unsplit-nucleotides-connected-with-nucleotides.ket',
    page,
  );
  const expectedFile = await getSdf(page, 'v3000');
  await saveToFile(
    'SDF/unsplit-nucleotides-connected-with-nucleotides.sdf',
    expectedFile,
  );

  const METADATA_STRINGS_INDEXES = [1];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/unsplit-nucleotides-connected-with-nucleotides.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v3000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
  await openFileAndAddToCanvasAsNewProject(
    'SDF/unsplit-nucleotides-connected-with-nucleotides.sdf',
    page,
  );
  await takeEditorScreenshot(page);
});

test('Validate that unsplit nucleotides connected with chems could be saved to sdf 3000 file and loaded back', async ({
  page,
}) => {
  /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with chems could be saved to sdf 3000 file and loaded back
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas(
    'KET/unsplit-nucleotides-connected-with-chems.ket',
    page,
  );
  const expectedFile = await getSdf(page, 'v3000');
  await saveToFile(
    'SDF/unsplit-nucleotides-connected-with-chems.sdf',
    expectedFile,
  );

  const METADATA_STRINGS_INDEXES = [1];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/unsplit-nucleotides-connected-with-chems.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v3000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
  await openFileAndAddToCanvasAsNewProject(
    'SDF/unsplit-nucleotides-connected-with-chems.sdf',
    page,
  );
  await takeEditorScreenshot(page);
});

test('Validate that unsplit nucleotides connected with sugars could be saved to sdf 3000 file and loaded back', async ({
  page,
}) => {
  /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with sugars could be saved to sdf 3000 file and loaded back
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas(
    'KET/unsplit-nucleotides-connected-with-sugars.ket',
    page,
  );
  const expectedFile = await getSdf(page, 'v3000');
  await saveToFile(
    'SDF/unsplit-nucleotides-connected-with-sugars.sdf',
    expectedFile,
  );

  const METADATA_STRINGS_INDEXES = [1];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/unsplit-nucleotides-connected-with-sugars.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v3000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
  await openFileAndAddToCanvasAsNewProject(
    'SDF/unsplit-nucleotides-connected-with-sugars.sdf',
    page,
  );
  await takeEditorScreenshot(page);
});

test('Validate that unsplit nucleotides connected with bases could be saved to sdf 3000 file and loaded back', async ({
  page,
}) => {
  /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with bases could be saved to sdf 3000 file and loaded back
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas(
    'KET/unsplit-nucleotides-connected-with-bases.ket',
    page,
  );
  const expectedFile = await getSdf(page, 'v3000');
  await saveToFile(
    'SDF/unsplit-nucleotides-connected-with-bases.sdf',
    expectedFile,
  );

  const METADATA_STRINGS_INDEXES = [1];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/unsplit-nucleotides-connected-with-bases.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v3000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
  await openFileAndAddToCanvasAsNewProject(
    'SDF/unsplit-nucleotides-connected-with-bases.sdf',
    page,
  );
  await takeEditorScreenshot(page);
});

test('Validate that unsplit nucleotides connected with phosphates could be saved to sdf 3000 file and loaded back', async ({
  page,
}) => {
  /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with phosphates could be saved to sdf 3000 file and loaded back
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas(
    'KET/unsplit-nucleotides-connected-with-phosphates.ket',
    page,
  );
  const expectedFile = await getSdf(page, 'v3000');
  await saveToFile(
    'SDF/unsplit-nucleotides-connected-with-phosphates.sdf',
    expectedFile,
  );

  const METADATA_STRINGS_INDEXES = [1];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/unsplit-nucleotides-connected-with-phosphates.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v3000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
  await openFileAndAddToCanvasAsNewProject(
    'SDF/unsplit-nucleotides-connected-with-phosphates.sdf',
    page,
  );
  await takeEditorScreenshot(page);
});

test('Validate that unsplit nucleotides connected with peptides could be saved to sdf 3000 file and loaded back', async ({
  page,
}) => {
  /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with peptides could be saved to sdf 3000 file and loaded back
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas(
    'KET/unsplit-nucleotides-connected-with-peptides.ket',
    page,
  );
  const expectedFile = await getSdf(page, 'v3000');
  await saveToFile(
    'SDF/unsplit-nucleotides-connected-with-peptides.sdf',
    expectedFile,
  );

  const METADATA_STRINGS_INDEXES = [1];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/unsplit-nucleotides-connected-with-peptides.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v3000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
  await openFileAndAddToCanvasAsNewProject(
    'SDF/unsplit-nucleotides-connected-with-peptides.sdf',
    page,
  );
  await takeEditorScreenshot(page);
});
