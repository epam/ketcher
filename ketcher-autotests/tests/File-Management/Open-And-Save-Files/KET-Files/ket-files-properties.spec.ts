import { expect, test } from '@playwright/test';
import {
  openFileAndAddToCanvas,
  receiveFileComparisonData,
  saveToFile,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { getKet } from '@utils/formats';

test('Open KET file with properties and check properties are saved in struct', async ({
  page,
}) => {
  await waitForPageInit(page);

  await openFileAndAddToCanvas('KET/ket-with-properties.ket', page);

  const fragments = await page.evaluate(() => {
    // eslint-disable-next-line no-unsafe-optional-chaining
    return [...window.ketcher?.editor?.struct()?.frags?.values()];
  });

  const [firstFragment, secondFragment] = fragments;

  if (!firstFragment?.properties || !secondFragment?.properties) {
    test.fail();
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-explicit-any
  const [firstFragmentProperties] = firstFragment.properties! as any;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-explicit-any
  const [secondFragmentProperties] = secondFragment.properties! as any;

  const [firstFragmentPropKey] = Object.keys(firstFragmentProperties);
  const [secondFragmentPropKey] = Object.keys(secondFragmentProperties);

  const firstFragmentPropValue = firstFragmentProperties[firstFragmentPropKey];
  const secondFragmentPropValue =
    secondFragmentProperties[secondFragmentPropKey];

  expect(firstFragmentPropKey).toEqual('mol0_key');
  expect(firstFragmentPropValue).toEqual('mol0_value');
  expect(secondFragmentPropKey).toEqual('mol1_key');
  expect(secondFragmentPropValue).toEqual('mol1_value');
});

test('Save a structure with properties to KET format', async ({ page }) => {
  await waitForPageInit(page);

  await openFileAndAddToCanvas('KET/ket-with-properties.ket', page);

  const expectedFile = await getKet(page);
  await saveToFile('KET/ket-with-properties-expected.ket', expectedFile);

  const { fileExpected: ketFileExpected, file: ketFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/KET/ket-with-properties-expected.ket',
    });

  expect(ketFile).toEqual(ketFileExpected);
});

test.describe('Import-Saving .ket Files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });
  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Validate that the simple schema with retrosynthetic arrow could be saved to ket file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: .ket file with macro structures is exported and imported correctly .
    */
    await openFileAndAddToCanvas(
      'KET/simple-schema-with-retrosynthetic-arrow.ket',
      page,
    );
    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/simple-schema-with-retrosynthetic-arrow-expected.ket',
      expectedFile,
    );
    const { file: ketFile, fileExpected: ketFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/simple-schema-with-retrosynthetic-arrow-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
  });

  test('Validate that the schema with retrosynthetic,angle arrows and plus could be saved to ket file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: .ket file with macro structures is exported and imported correctly .
    */
    await openFileAndAddToCanvas(
      'KET/schema-with-retrosynthetic-angel-arrows-and-plus.ket',
      page,
    );
    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/schema-with-retrosynthetic-angel-arrows-and-plus-expected.ket',
      expectedFile,
    );
    const { file: ketFile, fileExpected: ketFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/schema-with-retrosynthetic-angel-arrows-and-plus-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
  });

  test('Validate that the schema with vertical retrosynthetic arrow could be saved to ket file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: .ket file with macro structures is exported and imported correctly .
    */
    await openFileAndAddToCanvas(
      'KET/schema-with-vertical-retrosynthetic-arrow.ket',
      page,
    );
    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/schema-with-vertical-retrosynthetic-arrow-expected.ket',
      expectedFile,
    );
    const { file: ketFile, fileExpected: ketFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/schema-with-vertical-retrosynthetic-arrow-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
  });

  test('Validate that the schema with two retrosynthetic arrows could be saved to ket file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: .ket file with macro structures is exported and imported correctly .
    */
    await openFileAndAddToCanvas(
      'KET/schema-with-two-retrosynthetic-arrows.ket',
      page,
    );
    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/schema-with-two-retrosynthetic-arrows-expected.ket',
      expectedFile,
    );
    const { file: ketFile, fileExpected: ketFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/schema-with-two-retrosynthetic-arrows-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
  });

  test('Validate that the schema with diagonal retrosynthetic arrow could be saved to ket file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: .ket file with macro structures is exported and imported correctly .
    */
    await openFileAndAddToCanvas(
      'KET/schema-with-diagonal-retrosynthetic-arrow.ket',
      page,
    );
    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/schema-with-diagonal-retrosynthetic-arrow-expected.ket',
      expectedFile,
    );
    const { file: ketFile, fileExpected: ketFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/schema-with-diagonal-retrosynthetic-arrow-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
  });

  test('Validate that the schema with reverse retrosynthetic arrow and pluses could be saved to ket file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: .ket file with macro structures is exported and imported correctly .
    */
    await openFileAndAddToCanvas(
      'KET/schema-with-reverse-retrosynthetic-arrow-and-pluses.ket',
      page,
    );
    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/schema-with-reverse-retrosynthetic-arrow-and-pluses-expected.ket',
      expectedFile,
    );
    const { file: ketFile, fileExpected: ketFileExpected } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/schema-with-reverse-retrosynthetic-arrow-and-pluses-expected.ket',
      });

    expect(ketFile).toEqual(ketFileExpected);
  });
});
