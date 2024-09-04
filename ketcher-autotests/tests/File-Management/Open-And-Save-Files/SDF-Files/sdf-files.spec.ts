/* eslint-disable no-magic-numbers */
import { expect, test } from '@playwright/test';
import {
  receiveFileComparisonData,
  openFileAndAddToCanvas,
  saveToFile,
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasAsNewProject,
  selectTopPanelButton,
  TopPanelButton,
} from '@utils';
import { clickOnFileFormatDropdown, getSdf } from '@utils/formats';

test.describe('CDF files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

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
    await openFileAndAddToCanvas('SDF/sdf-v2000-to-open.sdf', page);
    // check that structure opened from file is displayed correctly
  });

  test('Open SDF V3000 file and place it on canvas', async ({ page }) => {
    await waitForPageInit(page);

    await openFileAndAddToCanvas('SDF/sdf-v3000-to-open.sdf', page);
    // check that structure opened from file is displayed correctly
  });

  test('Validate that unsplit nucleotides connected with another nucleotides could be saved to sdf 3000 file and loaded back', async ({
    page,
  }) => {
    /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with another nucleotides could be saved to sdf 3000 file and loaded back
  */

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
  });

  test('Validate that unsplit nucleotides connected with chems could be saved to sdf 3000 file and loaded back', async ({
    page,
  }) => {
    /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with chems could be saved to sdf 3000 file and loaded back
  */

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
  });

  test('Validate that unsplit nucleotides connected with sugars could be saved to sdf 3000 file and loaded back', async ({
    page,
  }) => {
    /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with sugars could be saved to sdf 3000 file and loaded back
  */

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
  });

  test('Validate that unsplit nucleotides connected with bases could be saved to sdf 3000 file and loaded back', async ({
    page,
  }) => {
    /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with bases could be saved to sdf 3000 file and loaded back
  */

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
  });

  test('Validate that unsplit nucleotides connected with phosphates could be saved to sdf 3000 file and loaded back', async ({
    page,
  }) => {
    /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with phosphates could be saved to sdf 3000 file and loaded back
  */

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
  });

  test('Validate that unsplit nucleotides connected with peptides could be saved to sdf 3000 file and loaded back', async ({
    page,
  }) => {
    /*
  Test case: #4382
  Description: Validate that unsplit nucleotides connected with peptides could be saved to sdf 3000 file and loaded back
  */

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
  });

  test(`Verify it is not possible to export the simple schema with retrosynthetic arrow to SDF V2000`, async ({
    page,
  }) => {
    await openFileAndAddToCanvas(
      'KET/simple-schema-with-retrosynthetic-arrow.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Save, page);
    await clickOnFileFormatDropdown(page);
    await page.getByRole('option', { name: 'SDF V2000' }).click();
  });

  test(`Verify it is not possible to export the schema with retrosynthetic, angel arrows and plus to SDF V2000`, async ({
    page,
  }) => {
    await openFileAndAddToCanvas(
      'KET/schema-with-retrosynthetic-angel-arrows-and-plus.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Save, page);
    await clickOnFileFormatDropdown(page);
    await page.getByRole('option', { name: 'SDF V2000' }).click();
  });

  test(`Verify it is not possible to export the schema with two retrosynthetic arrows to SDF V2000`, async ({
    page,
  }) => {
    await openFileAndAddToCanvas(
      'KET/schema-with-two-retrosynthetic-arrows.ket',
      page,
    );

    await selectTopPanelButton(TopPanelButton.Save, page);
    await clickOnFileFormatDropdown(page);
    await page.getByRole('option', { name: 'SDF V2000' }).click();
  });

  test(`Verify it is not possible to export the simple schema with retrosynthetic arrow to SDF V3000`, async ({
    page,
  }) => {
    await openFileAndAddToCanvas(
      'KET/simple-schema-with-retrosynthetic-arrow.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Save, page);
    await clickOnFileFormatDropdown(page);
    await page.getByRole('option', { name: 'SDF V3000' }).click();
  });

  test(`Verify it is not possible to export the schema with retrosynthetic, angel arrows and plus to SDF V3000`, async ({
    page,
  }) => {
    await openFileAndAddToCanvas(
      'KET/schema-with-retrosynthetic-angel-arrows-and-plus.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Save, page);
    await clickOnFileFormatDropdown(page);
    await page.getByRole('option', { name: 'SDF V3000' }).click();
  });

  test(`Verify it is not possible to export the schema with two retrosynthetic arrows to SDF V3000`, async ({
    page,
  }) => {
    await openFileAndAddToCanvas(
      'KET/schema-with-two-retrosynthetic-arrows.ket',
      page,
    );

    await selectTopPanelButton(TopPanelButton.Save, page);
    await clickOnFileFormatDropdown(page);
    await page.getByRole('option', { name: 'SDF V3000' }).click();
  });
});
