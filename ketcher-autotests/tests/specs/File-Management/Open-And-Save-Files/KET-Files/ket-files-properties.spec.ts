/* eslint-disable max-len */
import { expect, test } from '@playwright/test';
import {
  BondsSetting,
  GeneralSetting,
  MeasurementUnit,
} from '@tests/pages/constants/settingsDialog/Constants';
import {
  setACSSettings,
  setSettingsOptions,
  SettingsDialog,
} from '@tests/pages/molecules/canvas/SettingsDialog';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { TopRightToolbar } from '@tests/pages/molecules/TopRightToolbar';
import {
  openFileAndAddToCanvas,
  openFileAndAddToCanvasAsNewProject,
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

  await openFileAndAddToCanvas(page, 'KET/ket-with-properties.ket');

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

  await openFileAndAddToCanvas(page, 'KET/ket-with-properties.ket');

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
    await openFileAndAddToCanvas(page, 'KET/layout-with-catalyst.ket');
    await setSettingsOptions(page, [
      {
        option: BondsSetting.BondLengthUnits,
        value: MeasurementUnit.Px,
      },
      { option: BondsSetting.BondLength, value: '57.8' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'KET/layout-with-catalyst-px-bond-lengh.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/layout-with-catalyst-px-bond-lengh.ket',
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
    await openFileAndAddToCanvas(page, 'KET/layout-with-catalyst.ket');
    await takeEditorScreenshot(page);
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Px,
      },
      { option: BondsSetting.HashSpacing, value: '57.8' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/layout-with-catalyst-px-hash-spacing-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/layout-with-catalyst-px-hash-spacing-expected.ket',
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
    await openFileAndAddToCanvas(page, 'KET/layout-with-diagonally-arrow.ket');
    await setSettingsOptions(page, [
      {
        option: BondsSetting.BondLengthUnits,
        value: MeasurementUnit.Pt,
      },
      { option: BondsSetting.BondLength, value: '27.8' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'KET/layout-with-diagonally-arrow-pt-bond-lengh.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/layout-with-diagonally-arrow-pt-bond-lengh.ket',
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
    await openFileAndAddToCanvas(page, 'KET/layout-with-diagonally-arrow.ket');
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Pt,
      },
      { option: BondsSetting.HashSpacing, value: '27.8' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/layout-with-diagonally-arrow-pt-hash-spacing-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/layout-with-diagonally-arrow-pt-hash-spacing-expected.ket',
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
    await openFileAndAddToCanvas(page, 'KET/layout-with-long-molecule.ket');
    await setSettingsOptions(page, [
      { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Inch },
      { option: BondsSetting.BondLength, value: '1.8' },
    ]);
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
    await openFileAndAddToCanvas(page, 'KET/layout-with-long-molecule.ket');
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Inch,
      },
      { option: BondsSetting.HashSpacing, value: '1.8' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/layout-with-long-molecule-inch-hash-spacing-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/layout-with-long-molecule-inch-hash-spacing-expected.ket',
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
    await openFileAndAddToCanvas(page, 'KET/layout-with-catalyst.ket');
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.ReactionComponentMarginSizeUnits,
        value: MeasurementUnit.Px,
      },
      { option: GeneralSetting.ReactionComponentMarginSize, value: '47.8' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await verifyFileExport(
      page,
      'KET/layout-with-catalyst-px-margin-size.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/layout-with-catalyst-px-margin-size.ket',
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
    await openFileAndAddToCanvas(page, 'KET/layout-with-diagonally-arrow.ket');
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.ReactionComponentMarginSizeUnits,
        value: MeasurementUnit.Pt,
      },
      { option: GeneralSetting.ReactionComponentMarginSize, value: '7.8' },
    ]);
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
    await openFileAndAddToCanvas(page, 'KET/layout-with-dif-elements.ket');
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.ReactionComponentMarginSizeUnits,
        value: MeasurementUnit.Cm,
      },
      { option: GeneralSetting.ReactionComponentMarginSize, value: '3.8' },
    ]);
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
    await openFileAndAddToCanvas(page, 'KET/layout-with-long-molecule.ket');
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.ReactionComponentMarginSizeUnits,
        value: MeasurementUnit.Inch,
      },
      { option: GeneralSetting.ReactionComponentMarginSize, value: '7.8' },
    ]);
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
    await openFileAndAddToCanvas(page, 'KET/layout-with-diagonally-arrow.ket');
    await setACSSettings(page);
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
      await openFileAndAddToCanvas(page, 'KET/layout-with-catalyst.ket');
      await TopRightToolbar(page).Settings();
      await SettingsDialog(page).setOptionValue(
        GeneralSetting.ReactionComponentMarginSize,
        '47.8',
      );
      await SettingsDialog(page).apply();

      const youNeedToApplyTheLayoutDialog = page.getByText(
        'To fully apply these changes, you need to apply the layout.',
      );
      await expect(youNeedToApplyTheLayoutDialog).toBeVisible();
    },
  );
});
