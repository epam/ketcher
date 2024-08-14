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

test('Validate that simple schema with retrosynthetic arrow could be saved to ket file and loaded back', async ({
  page,
}) => {
  /*
  Test case: Import/Saving files
  Description: .ket file with macro structures is exported and imported correctly .
  */
  await openFileAndAddToCanvas(
    'KET/simple-schema-with-retrosynthetic-arrow.ket',
    page,
  );
  const expectedFile = await getKet(page);
  await saveToFile(
    'KET/simple-schema-with-retrosynthetic-arrow.ket',
    expectedFile,
  );
  const { file: ketFile, fileExpected: ketFileExpected } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/KET/simple-schema-with-retrosynthetic-arrow.ket',
    });

  expect(ketFile).toEqual(ketFileExpected);
  await takeEditorScreenshot(page);
});
