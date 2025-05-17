/* eslint-disable max-len */
import { expect, test } from '@playwright/test';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import {
  openBondsSettingsSection,
  openFileAndAddToCanvas,
  openFileAndAddToCanvasAsNewProject,
  openSettings,
  pressButton,
  scrollToDownInSetting,
  setBondLengthOptionUnit,
  setBondLengthValue,
  setHashSpacingOptionUnit,
  setHashSpacingValue,
  setReactionMarginSizeOptionUnit,
  setReactionMarginSizeValue,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';

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

  await verifyFileExport(
    page,
    'KET/ket-with-properties-expected.ket',
    FileType.KET,
  );
});

test.describe('Ket files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('The Bond length setting with px option is applied, click on layout and it should be save to KET specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied, click on layout and it should be save to KET specification
  */
    test.slow();
    await waitForPageInit(page);
    await openFileAndAddToCanvas('KET/layout-with-catalyst.ket', page);
    await TopRightToolbar(page).Settings();
    await openBondsSettingsSection(page);
    await scrollToDownInSetting(page);
    await setBondLengthOptionUnit(page, 'px-option');
    await setBondLengthValue(page, '57.8');
    await pressButton(page, 'Apply');
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'KET/layout-with-catalyst-px-bond-lengh.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      'KET/layout-with-catalyst-px-bond-lengh.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('The Hash spacing setting with px option is applied, click on layout and it should be saved to KET specification', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/Indigo/issues/2176
      Description: Add new settings for ACS style for convert and layout functions.
      The Hash spacing setting is applied, click on layout, and it should be saved to KET specification.
    */
    test.slow();
    await openFileAndAddToCanvas('KET/layout-with-catalyst.ket', page);
    await takeEditorScreenshot(page);
    await TopRightToolbar(page).Settings();
    await openBondsSettingsSection(page);
    await scrollToDownInSetting(page);
    await setHashSpacingOptionUnit(page, 'px-option');
    await setHashSpacingValue(page, '57.8');
    await pressButton(page, 'Apply');
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/layout-with-catalyst-px-hash-spacing-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      'KET/layout-with-catalyst-px-hash-spacing-expected.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('The Bond length setting with pt option is applied, click on layout and it should be save to KET specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Bond length setting is applied, click on layout and it should be save to KET specification
  */
    test.slow();
    await openFileAndAddToCanvas('KET/layout-with-diagonally-arrow.ket', page);
    await TopRightToolbar(page).Settings();
    await openBondsSettingsSection(page);
    await scrollToDownInSetting(page);
    await setBondLengthOptionUnit(page, 'pt-option');
    await setBondLengthValue(page, '27.8');
    await pressButton(page, 'Apply');
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'KET/layout-with-diagonally-arrow-pt-bond-lengh.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      'KET/layout-with-diagonally-arrow-pt-bond-lengh.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('The Hash spacing setting with pt option is applied, click on layout and it should be save to KET specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Hash spacing setting is applied, click on layout and it should be save to KET specification
  */
    test.slow();
    await openFileAndAddToCanvas('KET/layout-with-diagonally-arrow.ket', page);
    await TopRightToolbar(page).Settings();
    await openBondsSettingsSection(page);
    await scrollToDownInSetting(page);
    await setHashSpacingOptionUnit(page, 'pt-option');
    await setHashSpacingValue(page, '27.8');
    await pressButton(page, 'Apply');
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/layout-with-diagonally-arrow-pt-hash-spacing-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      'KET/layout-with-diagonally-arrow-pt-hash-spacing-expected.ket',
      page,
    );
    await takeEditorScreenshot(page);
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
    await TopRightToolbar(page).Settings();
    await openBondsSettingsSection(page);
    await scrollToDownInSetting(page);
    await setBondLengthOptionUnit(page, 'inch-option');
    await setBondLengthValue(page, '1.8');
    await pressButton(page, 'Apply');
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'KET/layout-with-long-molecule-inch-bond-lengh.ket',
      FileType.KET,
    );
  });

  test('The Hash spacing setting with inch option is applied, click on layout and it should be save to KET specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Hash spacing setting is applied, click on layout and it should be save to KET specification
  */
    test.slow();
    await openFileAndAddToCanvas('KET/layout-with-long-molecule.ket', page);
    await TopRightToolbar(page).Settings();
    await openBondsSettingsSection(page);
    await scrollToDownInSetting(page);
    await setHashSpacingOptionUnit(page, 'inch-option');
    await setHashSpacingValue(page, '1.8');
    await pressButton(page, 'Apply');
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/layout-with-long-molecule-inch-hash-spacing-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      'KET/layout-with-long-molecule-inch-hash-spacing-expected.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('The Reaction component margin size setting with px option is applied, click on layout and it should be save to KET specification', async ({
    page,
  }) => {
    /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: Add new settings for ACS style for convert and layout functions
  The Reaction component margin size setting is applied, click on layout and it should be save to KET specification
  */
    test.slow();
    await openFileAndAddToCanvas('KET/layout-with-catalyst.ket', page);
    await TopRightToolbar(page).Settings();
    await openBondsSettingsSection(page);
    await scrollToDownInSetting(page);
    await setReactionMarginSizeOptionUnit(page, 'px-option');
    await setReactionMarginSizeValue(page, '47.8');
    await pressButton(page, 'Apply');
    await pressButton(page, 'OK');
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'KET/layout-with-catalyst-px-margin-size.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      'KET/layout-with-catalyst-px-margin-size.ket',
      page,
    );
    await takeEditorScreenshot(page);
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
    await TopRightToolbar(page).Settings();
    await openBondsSettingsSection(page);
    await scrollToDownInSetting(page);
    await setReactionMarginSizeOptionUnit(page, 'pt-option');
    await setReactionMarginSizeValue(page, '7.8');
    await pressButton(page, 'Apply');
    await pressButton(page, 'OK');
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'KET/layout-with-diagonally-arrow-pt-margin-size.ket',
      FileType.KET,
    );
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
    await TopRightToolbar(page).Settings();
    await openBondsSettingsSection(page);
    await scrollToDownInSetting(page);
    await setReactionMarginSizeOptionUnit(page, 'cm-option');
    await setReactionMarginSizeValue(page, '3.8');
    await pressButton(page, 'Apply');
    await pressButton(page, 'OK');
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'KET/layout-with-dif-elements-cm-margin-size.ket',
      FileType.KET,
    );
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
    await TopRightToolbar(page).Settings();
    await openBondsSettingsSection(page);
    await scrollToDownInSetting(page);
    await setReactionMarginSizeOptionUnit(page, 'inch-option');
    await setReactionMarginSizeValue(page, '7.8');
    await pressButton(page, 'Apply');
    await pressButton(page, 'OK');
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'KET/layout-with-long-molecule-inch-margin-size.ket',
      FileType.KET,
    );
  });

  test('Verify ACS Style setting, click on layout and it should be save to KET specification', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5156
    Description: add new option ACS style
    */
    await openFileAndAddToCanvas('KET/layout-with-diagonally-arrow.ket', page);
    await TopRightToolbar(page).Settings();
    await pressButton(page, 'Set ACS Settings');
    await pressButton(page, 'Apply');
    await pressButton(page, 'OK');
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'KET/layout-with-diagonally-arrow-acs-style.ket',
      FileType.KET,
    );
  });

  test(
    'When the user adjusts the "Reaction component margin size" settings and clicks the "Apply" button, an informational message should be displayed: ' +
      '"To fully apply these changes, you need to apply the layout."',
    async ({ page }) => {
      /*
  Test case: https://github.com/epam/Indigo/issues/2176
  Description: When the user adjusts the "Reaction component margin size" settings and clicks the "Apply" button, an
  informational message displayed: "To fully apply these changes, you need to apply the layout."
  */
      await openFileAndAddToCanvas('KET/layout-with-catalyst.ket', page);
      await TopRightToolbar(page).Settings();
      await openBondsSettingsSection(page);
      await scrollToDownInSetting(page);
      await setReactionMarginSizeOptionUnit(page, 'px-option');
      await setReactionMarginSizeValue(page, '47.8');
      await pressButton(page, 'Apply');
      await takeEditorScreenshot(page);
    },
  );
});
