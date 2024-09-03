import { expect, test } from '@playwright/test';
import {
  bondsDefaultSettings,
  openFileAndAddToCanvas,
  pressButton,
  receiveFileComparisonData,
  saveToFile,
  selectTopPanelButton,
  setBondLengthOptionUnit,
  setBondLengthValue,
  setReactionMarginSizeOptionUnit,
  setReactionMarginSizeValue,
  takeEditorScreenshot,
  TopPanelButton,
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

test('The Bond length setting with px option is applied, click on layout and it should be save to KET specification', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied, click on layout and it should be save to KET specification
  */
  await openFileAndAddToCanvas('KET/layout-with-catalyst.ket', page);
  await bondsDefaultSettings(page);
  await setBondLengthOptionUnit(page, 'px-option');
  await setBondLengthValue(page, '7.8');
  await pressButton(page, 'Apply');
  await selectTopPanelButton(TopPanelButton.Layout, page);
  await takeEditorScreenshot(page);
  const expectedFile = await getKet(page);
  await saveToFile('KET/layout-with-catalyst-px-bond-lengh.ket', expectedFile);

  const { fileExpected: ketFileExpected, file: ketFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/KET/layout-with-catalyst-px-bond-lengh.ket',
    });

  expect(ketFile).toEqual(ketFileExpected);
});

test('The Bond length setting with pt option is applied, click on layout and it should be save to KET specification', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied, click on layout and it should be save to KET specification
  */
  await openFileAndAddToCanvas('KET/layout-with-diagonally-arrow.ket', page);
  await bondsDefaultSettings(page);
  await setBondLengthOptionUnit(page, 'pt-option');
  await setBondLengthValue(page, '7.8');
  await pressButton(page, 'Apply');
  await selectTopPanelButton(TopPanelButton.Layout, page);
  await takeEditorScreenshot(page);
  const expectedFile = await getKet(page);
  await saveToFile(
    'KET/layout-with-diagonally-arrow-pt-bond-lengh.ket',
    expectedFile,
  );

  const { fileExpected: ketFileExpected, file: ketFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/KET/layout-with-diagonally-arrow-pt-bond-lengh.ket',
    });

  expect(ketFile).toEqual(ketFileExpected);
});

test('The Bond length setting with cm option is applied, click on layout and it should be save to KET specification', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied, click on layout and it should be save to KET specification
  */
  await openFileAndAddToCanvas('KET/layout-with-dif-elements.ket', page);
  await bondsDefaultSettings(page);
  await setBondLengthOptionUnit(page, 'cm-option');
  await setBondLengthValue(page, '7.8');
  await pressButton(page, 'Apply');
  await selectTopPanelButton(TopPanelButton.Layout, page);
  await takeEditorScreenshot(page);
  const expectedFile = await getKet(page);
  await saveToFile(
    'KET/layout-with-dif-elements-cm-bond-lengh.ket',
    expectedFile,
  );

  const { fileExpected: ketFileExpected, file: ketFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/KET/layout-with-dif-elements-cm-bond-lenghd.ket',
    });

  expect(ketFile).toEqual(ketFileExpected);
});

test('The Bond length setting with inch option is applied, click on layout and it should be save to KET specification', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied, click on layout and it should be save to KET specification
  */
  await openFileAndAddToCanvas('KET/layout-with-long-molecule.ket', page);
  await bondsDefaultSettings(page);
  await setBondLengthOptionUnit(page, 'inch-option');
  await setBondLengthValue(page, '7.8');
  await pressButton(page, 'Apply');
  await selectTopPanelButton(TopPanelButton.Layout, page);
  await takeEditorScreenshot(page);
  const expectedFile = await getKet(page);
  await saveToFile(
    'KET/layout-with-long-molecule-inch-bond-lengh.ket',
    expectedFile,
  );

  const { fileExpected: ketFileExpected, file: ketFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/KET/layout-with-long-molecule-inch-bond-lengh.ket',
    });

  expect(ketFile).toEqual(ketFileExpected);
});

test('The Reaction component margin size setting with px option is applied, click on layout and it should be save to KET specification', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Reaction component margin size setting is applied, click on layout and it should be save to KET specification
  */
  await openFileAndAddToCanvas('KET/layout-with-catalyst.ket', page);
  await bondsDefaultSettings(page);
  await setReactionMarginSizeOptionUnit(page, 'px-option');
  await setReactionMarginSizeValue(page, '7.8');
  await pressButton(page, 'Apply');
  await selectTopPanelButton(TopPanelButton.Layout, page);
  await takeEditorScreenshot(page);
  const expectedFile = await getKet(page);
  await saveToFile('KET/layout-with-catalyst-px-margin-size.ket', expectedFile);

  const { fileExpected: ketFileExpected, file: ketFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/KET/layout-with-catalyst-px-margin-size.ket',
    });

  expect(ketFile).toEqual(ketFileExpected);
});

test('The Reaction component margin size setting with pt option is applied, click on layout and it should be save to KET specification', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Reaction component margin size setting is applied, click on layout and it should be save to KET specification
  */
  await openFileAndAddToCanvas('KET/layout-with-diagonally-arrow.ket', page);
  await bondsDefaultSettings(page);
  await setReactionMarginSizeOptionUnit(page, 'pt-option');
  await setReactionMarginSizeValue(page, '7.8');
  await pressButton(page, 'Apply');
  await selectTopPanelButton(TopPanelButton.Layout, page);
  await takeEditorScreenshot(page);
  const expectedFile = await getKet(page);
  await saveToFile(
    'KET/layout-with-diagonally-arrow-pt-margin-size.ket',
    expectedFile,
  );

  const { fileExpected: ketFileExpected, file: ketFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/KET/layout-with-diagonally-arrow-pt-margin-size.ket',
    });

  expect(ketFile).toEqual(ketFileExpected);
});

test('The Reaction component margin size setting with cm option is applied, click on layout and it should be save to KET specification', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Reaction component margin size setting is applied, click on layout and it should be save to KET specification
  */
  await openFileAndAddToCanvas('KET/layout-with-dif-elements.ket', page);
  await bondsDefaultSettings(page);
  await setReactionMarginSizeOptionUnit(page, 'cm-option');
  await setReactionMarginSizeValue(page, '7.8');
  await pressButton(page, 'Apply');
  await selectTopPanelButton(TopPanelButton.Layout, page);
  await takeEditorScreenshot(page);
  const expectedFile = await getKet(page);
  await saveToFile(
    'KET/layout-with-dif-elements-cm-margin-size.ket',
    expectedFile,
  );

  const { fileExpected: ketFileExpected, file: ketFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/KET/layout-with-dif-elements-cm-margin-size.ket',
    });

  expect(ketFile).toEqual(ketFileExpected);
});

test('The Reaction component margin size setting with inch option is applied, click on layout and it should be save to KET specification', async ({
  page,
}) => {
  /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Reaction component margin size setting is applied, click on layout and it should be save to KET specification
  */
  await openFileAndAddToCanvas('KET/layout-with-long-molecule.ket', page);
  await bondsDefaultSettings(page);
  await setReactionMarginSizeOptionUnit(page, 'inch-option');
  await setReactionMarginSizeValue(page, '7.8');
  await pressButton(page, 'Apply');
  await selectTopPanelButton(TopPanelButton.Layout, page);
  await takeEditorScreenshot(page);
  const expectedFile = await getKet(page);
  await saveToFile(
    'KET/layout-with-long-molecule-inch-margin-size.ket',
    expectedFile,
  );

  const { fileExpected: ketFileExpected, file: ketFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/KET/layout-with-long-molecule-inch-margin-size.ket',
    });

  expect(ketFile).toEqual(ketFileExpected);
});
