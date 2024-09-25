/* eslint-disable no-magic-numbers */
import { expect, test } from '@playwright/test';
import {
  receiveFileComparisonData,
  openFileAndAddToCanvas,
  saveToFile,
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasAsNewProject,
  bondsSettings,
  setBondLengthOptionUnit,
  setBondLengthValue,
  pressButton,
  selectTopPanelButton,
  TopPanelButton,
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
    'SDF/unsplit-nucleotides-connected-with-nucleotides-v3000.sdf',
    expectedFile,
  );

  // eslint-disable-next-line no-magic-numbers
  const METADATA_STRINGS_INDEXES = [1, 107, 213, 319, 425, 531];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/unsplit-nucleotides-connected-with-nucleotides-v3000.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v3000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
  await openFileAndAddToCanvasAsNewProject(
    'SDF/unsplit-nucleotides-connected-with-nucleotides-v3000.sdf',
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
    'SDF/unsplit-nucleotides-connected-with-chems-v3000.sdf',
    expectedFile,
  );

  // eslint-disable-next-line no-magic-numbers
  const METADATA_STRINGS_INDEXES = [
    1, 182, 363, 544, 725, 906, 1087, 1267, 1448,
  ];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/unsplit-nucleotides-connected-with-chems-v3000.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v3000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
  await openFileAndAddToCanvasAsNewProject(
    'SDF/unsplit-nucleotides-connected-with-chems-v3000.sdf',
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
    'SDF/unsplit-nucleotides-connected-with-sugars-v3000.sdf',
    expectedFile,
  );

  // eslint-disable-next-line no-magic-numbers
  const METADATA_STRINGS_INDEXES = [
    1, 178, 355, 532, 709, 886, 1063, 1240, 1417,
  ];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/unsplit-nucleotides-connected-with-sugars-v3000.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v3000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
  await openFileAndAddToCanvasAsNewProject(
    'SDF/unsplit-nucleotides-connected-with-sugars-v3000.sdf',
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
    'SDF/unsplit-nucleotides-connected-with-bases-v3000.sdf',
    expectedFile,
  );

  // eslint-disable-next-line no-magic-numbers
  const METADATA_STRINGS_INDEXES = [
    1, 186, 371, 556, 741, 926, 1111, 1296, 1481,
  ];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/unsplit-nucleotides-connected-with-bases-v3000.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v3000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
  await openFileAndAddToCanvasAsNewProject(
    'SDF/unsplit-nucleotides-connected-with-bases-v3000.sdf',
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
    'SDF/unsplit-nucleotides-connected-with-phosphates-v3000.sdf',
    expectedFile,
  );

  // eslint-disable-next-line no-magic-numbers
  const METADATA_STRINGS_INDEXES = [
    1, 165, 329, 493, 657, 821, 985, 1149, 1313,
  ];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/unsplit-nucleotides-connected-with-phosphates-v3000.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v3000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
  await openFileAndAddToCanvasAsNewProject(
    'SDF/unsplit-nucleotides-connected-with-phosphates-v3000.sdf',
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
    'SDF/unsplit-nucleotides-connected-with-peptides-v3000.sdf',
    expectedFile,
  );

  // eslint-disable-next-line no-magic-numbers
  const METADATA_STRINGS_INDEXES = [
    1, 188, 375, 562, 749, 936, 1123, 1310, 1497,
  ];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/unsplit-nucleotides-connected-with-peptides-v3000.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v3000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
  await openFileAndAddToCanvasAsNewProject(
    'SDF/unsplit-nucleotides-connected-with-peptides-v3000.sdf',
    page,
  );
  await takeEditorScreenshot(page);
});

test('Validate that unsplit nucleotides connected with another nucleotides could be saved to sdf 2000 file and loaded back', async ({
  page,
}) => {
  /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with another nucleotides could be saved to sdf 2000 file and loaded back
  Test working not a proper way becase we have a bug https://github.com/epam/ketcher/issues/5123
  After fix we need update expected file for this test
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas(
    'KET/unsplit-nucleotides-connected-with-nucleotides.ket',
    page,
  );
  const expectedFile = await getSdf(page, 'v2000');
  await saveToFile(
    'SDF/unsplit-nucleotides-connected-with-nucleotides-v2000.sdf',
    expectedFile,
  );

  // eslint-disable-next-line no-magic-numbers
  const METADATA_STRINGS_INDEXES = [1, 107, 213, 319, 425, 531];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/unsplit-nucleotides-connected-with-nucleotides-v2000.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v2000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
  await openFileAndAddToCanvasAsNewProject(
    'SDF/unsplit-nucleotides-connected-with-nucleotides-v2000.sdf',
    page,
  );
  await takeEditorScreenshot(page);
});

test('Validate that unsplit nucleotides connected with chems could be saved to sdf 2000 file and loaded back', async ({
  page,
}) => {
  /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with chems could be saved to sdf 2000 file and loaded back
  Test working not a proper way becase we have a bug https://github.com/epam/ketcher/issues/5123
  After fix we need update expected file for this test
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas(
    'KET/unsplit-nucleotides-connected-with-chems.ket',
    page,
  );
  const expectedFile = await getSdf(page, 'v2000');
  await saveToFile(
    'SDF/unsplit-nucleotides-connected-with-chems-v2000.sdf',
    expectedFile,
  );

  // eslint-disable-next-line no-magic-numbers
  const METADATA_STRINGS_INDEXES = [
    1, 182, 363, 544, 725, 906, 1087, 1267, 1448,
  ];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/unsplit-nucleotides-connected-with-chems-v2000.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v2000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
  await openFileAndAddToCanvasAsNewProject(
    'SDF/unsplit-nucleotides-connected-with-chems-v2000.sdf',
    page,
  );
  await takeEditorScreenshot(page);
});

test('Validate that unsplit nucleotides connected with sugars could be saved to sdf 2000 file and loaded back', async ({
  page,
}) => {
  /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with sugars could be saved to sdf 2000 file and loaded back
  Test working not a proper way becase we have a bug https://github.com/epam/ketcher/issues/5123
  After fix we need update expected file for this test
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas(
    'KET/unsplit-nucleotides-connected-with-sugars.ket',
    page,
  );
  const expectedFile = await getSdf(page, 'v2000');
  await saveToFile(
    'SDF/unsplit-nucleotides-connected-with-sugars-v2000.sdf',
    expectedFile,
  );

  // eslint-disable-next-line no-magic-numbers
  const METADATA_STRINGS_INDEXES = [
    1, 178, 355, 532, 709, 886, 1063, 1240, 1417,
  ];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/unsplit-nucleotides-connected-with-sugars-v2000.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v2000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
  await openFileAndAddToCanvasAsNewProject(
    'SDF/unsplit-nucleotides-connected-with-sugars-v2000.sdf',
    page,
  );
  await takeEditorScreenshot(page);
});

test('Validate that unsplit nucleotides connected with bases could be saved to sdf 2000 file and loaded back', async ({
  page,
}) => {
  /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with bases could be saved to sdf 2000 file and loaded back
  Test working not a proper way becase we have a bug https://github.com/epam/ketcher/issues/5123
  After fix we need update expected file for this test
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas(
    'KET/unsplit-nucleotides-connected-with-bases.ket',
    page,
  );
  const expectedFile = await getSdf(page, 'v2000');
  await saveToFile(
    'SDF/unsplit-nucleotides-connected-with-bases-v2000.sdf',
    expectedFile,
  );

  // eslint-disable-next-line no-magic-numbers
  const METADATA_STRINGS_INDEXES = [
    1, 186, 371, 556, 741, 926, 1111, 1296, 1481,
  ];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/unsplit-nucleotides-connected-with-bases-v2000.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v2000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
  await openFileAndAddToCanvasAsNewProject(
    'SDF/unsplit-nucleotides-connected-with-bases-v2000.sdf',
    page,
  );
  await takeEditorScreenshot(page);
});

test('Validate that unsplit nucleotides connected with phosphates could be saved to sdf 2000 file and loaded back', async ({
  page,
}) => {
  /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with phosphates could be saved to sdf 2000 file and loaded back
  Test working not a proper way becase we have a bug https://github.com/epam/ketcher/issues/5123
  After fix we need update expected file for this test
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas(
    'KET/unsplit-nucleotides-connected-with-phosphates.ket',
    page,
  );
  const expectedFile = await getSdf(page, 'v2000');
  await saveToFile(
    'SDF/unsplit-nucleotides-connected-with-phosphates-v2000.sdf',
    expectedFile,
  );

  // eslint-disable-next-line no-magic-numbers
  const METADATA_STRINGS_INDEXES = [
    1, 165, 329, 493, 657, 821, 985, 1149, 1313,
  ];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/unsplit-nucleotides-connected-with-phosphates-v2000.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v2000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
  await openFileAndAddToCanvasAsNewProject(
    'SDF/unsplit-nucleotides-connected-with-phosphates-v2000.sdf',
    page,
  );
  await takeEditorScreenshot(page);
});

test('Validate that unsplit nucleotides connected with peptides could be saved to sdf 2000 file and loaded back', async ({
  page,
}) => {
  /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with peptides could be saved to sdf 2000 file and loaded back
  Test working not a proper way becase we have a bug https://github.com/epam/ketcher/issues/5123
  After fix we need update expected file for this test
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas(
    'KET/unsplit-nucleotides-connected-with-peptides.ket',
    page,
  );
  const expectedFile = await getSdf(page, 'v2000');
  await saveToFile(
    'SDF/unsplit-nucleotides-connected-with-peptides-v2000.sdf',
    expectedFile,
  );

  // eslint-disable-next-line no-magic-numbers
  const METADATA_STRINGS_INDEXES = [
    1, 188, 375, 562, 749, 936, 1123, 1310, 1497,
  ];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/unsplit-nucleotides-connected-with-peptides-v2000.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v2000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
  await openFileAndAddToCanvasAsNewProject(
    'SDF/unsplit-nucleotides-connected-with-peptides-v2000.sdf',
    page,
  );
  await takeEditorScreenshot(page);
});

test('The Bond length setting with px option is applied and it should be save to sdf 2000 file', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/ketcher/issues/5435
  Description: Change bond length for ACS styles settings
  The Bond length setting is applied and it should be save to sdf 2000
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('KET/adenosine-triphosphate.ket', page);

  await bondsSettings(page);
  await setBondLengthOptionUnit(page, 'px-option');
  await setBondLengthValue(page, '79.8');
  await pressButton(page, 'Apply');

  const expectedFile = await getSdf(page, 'v2000');
  await saveToFile(
    'SDF/adenosine-triphosphate-px-bond-lengh-v2000.sdf',
    expectedFile,
  );

  const METADATA_STRINGS_INDEXES = [
    1, 188, 375, 562, 749, 936, 1123, 1310, 1497,
  ];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/adenosine-triphosphate-px-bond-lengh-v2000.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v2000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
});

test('The Bond length setting with pt option is applied and it should be save to sdf 2000 file', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/ketcher/issues/5435
  Description: Change bond length for ACS styles settings
  The Bond length setting is applied and it should be save to sdf 2000
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('KET/adenosine-triphosphate.ket', page);

  await bondsSettings(page);
  await setBondLengthOptionUnit(page, 'pt-option');
  await setBondLengthValue(page, '29.8');
  await pressButton(page, 'Apply');

  const expectedFile = await getSdf(page, 'v2000');
  await saveToFile(
    'SDF/adenosine-triphosphate-pt-bond-lengh-v2000.sdf',
    expectedFile,
  );

  const METADATA_STRINGS_INDEXES = [
    1, 188, 375, 562, 749, 936, 1123, 1310, 1497,
  ];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/adenosine-triphosphate-pt-bond-lengh-v2000.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v2000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
});

test('The Bond length setting with cm option is applied and it should be save to sdf 2000 file', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/ketcher/issues/5435
  Description: Change bond length for ACS styles settings
  The Bond length setting is applied and it should be save to sdf 2000
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('KET/adenosine-triphosphate.ket', page);

  await bondsSettings(page);
  await setBondLengthOptionUnit(page, 'cm-option');
  await setBondLengthValue(page, '0.8');
  await pressButton(page, 'Apply');

  const expectedFile = await getSdf(page, 'v2000');
  await saveToFile(
    'SDF/adenosine-triphosphate-cm-bond-lengh-v2000.sdf',
    expectedFile,
  );

  const METADATA_STRINGS_INDEXES = [
    1, 188, 375, 562, 749, 936, 1123, 1310, 1497,
  ];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/adenosine-triphosphate-cm-bond-lengh-v2000.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v2000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
});

test('The Bond length setting with inch option is applied and it should be save to sdf 2000 file', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/ketcher/issues/5435
  Description: Change bond length for ACS styles settings
  The Bond length setting is applied and it should be save to sdf 2000
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('KET/adenosine-triphosphate.ket', page);

  await bondsSettings(page);
  await setBondLengthOptionUnit(page, 'inch-option');
  await setBondLengthValue(page, '4.8');
  await pressButton(page, 'Apply');

  const expectedFile = await getSdf(page, 'v2000');
  await saveToFile(
    'SDF/adenosine-triphosphate-inch-bond-lengh-v2000.sdf',
    expectedFile,
  );

  const METADATA_STRINGS_INDEXES = [
    1, 188, 375, 562, 749, 936, 1123, 1310, 1497,
  ];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/adenosine-triphosphate-inch-bond-lengh-v2000.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v2000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
});

test('The Bond length setting with px option is applied and it should be save to sdf 3000 file', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/ketcher/issues/5435
  Description: Change bond length for ACS styles settings
  The Bond length setting is applied and it should be save to sdf 3000
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('KET/adenosine-triphosphate.ket', page);

  await bondsSettings(page);
  await setBondLengthOptionUnit(page, 'px-option');
  await setBondLengthValue(page, '79.8');
  await pressButton(page, 'Apply');

  const expectedFile = await getSdf(page, 'v3000');
  await saveToFile(
    'SDF/adenosine-triphosphate-px-bond-lengh-v3000.sdf',
    expectedFile,
  );

  const METADATA_STRINGS_INDEXES = [
    1, 188, 375, 562, 749, 936, 1123, 1310, 1497,
  ];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/adenosine-triphosphate-px-bond-lengh-v3000.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v3000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
});

test('The Bond length setting with pt option is applied and it should be save to sdf 3000 file', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/ketcher/issues/5435
  Description: Change bond length for ACS styles settings
  The Bond length setting is applied and it should be save to sdf 3000
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('KET/adenosine-triphosphate.ket', page);

  await bondsSettings(page);
  await setBondLengthOptionUnit(page, 'pt-option');
  await setBondLengthValue(page, '29.8');
  await pressButton(page, 'Apply');

  const expectedFile = await getSdf(page, 'v3000');
  await saveToFile(
    'SDF/adenosine-triphosphate-pt-bond-lengh-v3000.sdf',
    expectedFile,
  );

  const METADATA_STRINGS_INDEXES = [
    1, 188, 375, 562, 749, 936, 1123, 1310, 1497,
  ];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/adenosine-triphosphate-pt-bond-lengh-v3000.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v3000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
});

test('The Bond length setting with cm option is applied and it should be save to sdf 3000 file', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/ketcher/issues/5435
  Description: Change bond length for ACS styles settings
  The Bond length setting is applied and it should be save to sdf 3000
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('KET/adenosine-triphosphate.ket', page);

  await bondsSettings(page);
  await setBondLengthOptionUnit(page, 'cm-option');
  await setBondLengthValue(page, '0.8');
  await pressButton(page, 'Apply');

  const expectedFile = await getSdf(page, 'v3000');
  await saveToFile(
    'SDF/adenosine-triphosphate-cm-bond-lengh-v3000.sdf',
    expectedFile,
  );

  const METADATA_STRINGS_INDEXES = [
    1, 188, 375, 562, 749, 936, 1123, 1310, 1497,
  ];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/adenosine-triphosphate-cm-bond-lengh-v3000.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v3000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
});

test('The Bond length setting with inch option is applied and it should be save to sdf 3000 file', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/ketcher/issues/5435
  Description: Change bond length for ACS styles settings
  The Bond length setting is applied and it should be save to sdf 3000
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('KET/adenosine-triphosphate.ket', page);

  await bondsSettings(page);
  await setBondLengthOptionUnit(page, 'inch-option');
  await setBondLengthValue(page, '4.8');
  await pressButton(page, 'Apply');

  const expectedFile = await getSdf(page, 'v3000');
  await saveToFile(
    'SDF/adenosine-triphosphate-inch-bond-lengh-v3000.sdf',
    expectedFile,
  );

  const METADATA_STRINGS_INDEXES = [
    1, 188, 375, 562, 749, 936, 1123, 1310, 1497,
  ];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/adenosine-triphosphate-inch-bond-lengh-v3000.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v3000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
});

test('The ACS setting is applied, click on layout and it should be save to sdf 3000 file', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/ketcher/issues/5156
  Description: add new option AVS style and check saving to different format
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('KET/adenosine-triphosphate.ket', page);

  await selectTopPanelButton(TopPanelButton.Settings, page);
  await pressButton(page, 'ACS Style');
  await pressButton(page, 'Apply');
  await selectTopPanelButton(TopPanelButton.Layout, page);

  const expectedFile = await getSdf(page, 'v3000');
  await saveToFile(
    'SDF/adenosine-triphosphate-acs-style-v3000.sdf',
    expectedFile,
  );

  const METADATA_STRINGS_INDEXES = [
    1, 188, 375, 562, 749, 936, 1123, 1310, 1497,
  ];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/adenosine-triphosphate-acs-style-v3000.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v3000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
});

test('The ACS setting is applied, click on layout and it should be save to sdf 2000 file', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/ketcher/issues/5156
  Description: add new option AVS style and check saving to different format
  */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('KET/adenosine-triphosphate.ket', page);

  await selectTopPanelButton(TopPanelButton.Settings, page);
  await pressButton(page, 'ACS Style');
  await pressButton(page, 'Apply');
  await selectTopPanelButton(TopPanelButton.Layout, page);

  const expectedFile = await getSdf(page, 'v2000');
  await saveToFile(
    'SDF/adenosine-triphosphate-acs-style-v2000.sdf',
    expectedFile,
  );

  const METADATA_STRINGS_INDEXES = [
    1, 188, 375, 562, 749, 936, 1123, 1310, 1497,
  ];

  const { fileExpected: sdfFileExpected, file: sdfFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/SDF/adenosine-triphosphate-acs-style-v2000.sdf',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v3000',
    });

  expect(sdfFile).toEqual(sdfFileExpected);
});
