/* eslint-disable no-magic-numbers */
import { test, expect } from '@playwright/test';
import {
  BondsSetting,
  MeasurementUnit,
  SettingsSection,
} from '@tests/pages/constants/settingsDialog/Constants';
import {
  resetSettingsValuesToDefault,
  setSettingsOption,
  setSettingsOptions,
  SettingsDialog,
} from '@tests/pages/molecules/canvas/SettingsDialog';
import { TopRightToolbar } from '@tests/pages/molecules/TopRightToolbar';
import {
  openFileAndAddToCanvasAsNewProject,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';

test('Verify Bonds setting menu', async ({ page }) => {
  await waitForPageInit(page);
  await TopRightToolbar(page).Settings();
  await SettingsDialog(page).openSection(SettingsSection.General);
  await SettingsDialog(page).openSection(SettingsSection.Bonds);
  await takeEditorScreenshot(page);
});

test.describe('Bonds Settings', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await resetSettingsValuesToDefault(page);
  });

  test('Verify Bond length setting and entering a value with up to 1 decimal places in px option', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering values with one decimal place
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Px },
      { option: BondsSetting.BondLength, value: '74.8' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify a value with up to 1 decimal places in pt option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering values with one decimal place
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Pt },
      { option: BondsSetting.BondLength, value: '27.8' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify a value with up to 1 decimal places in cm option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering values with one decimal place
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Cm },
      { option: BondsSetting.BondLength, value: '2.8' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify a value with up to 1 decimal places in inch option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering values with one decimal place
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Inch },
      { option: BondsSetting.BondLength, value: '0.8' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole value in px option in Bond length', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering the whole values
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Px },
      { option: BondsSetting.BondLength, value: '17' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole value in pt option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering the whole values
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Pt },
      { option: BondsSetting.BondLength, value: '69' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole value in cm option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering the whole values
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Cm },
      { option: BondsSetting.BondLength, value: '3' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole value in inch option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering the whole values
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Inch },
      { option: BondsSetting.BondLength, value: '1' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify Bond length setting and entering a value with up to 2 decimal places in px option', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering values with one decimal place, 
        the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Px },
      { option: BondsSetting.BondLength, value: '58.87' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify a value with up to 2 decimal places in pt option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering values with one decimal place, 
        the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Pt },
      { option: BondsSetting.BondLength, value: '16.68' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify a value with up to 2 decimal places in cm option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering values with one decimal place, 
        the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Cm },
      { option: BondsSetting.BondLength, value: '0.78' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify a value with up to 2 decimal places in inch option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering values with one decimal place, 
        the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Inch },
      { option: BondsSetting.BondLength, value: '0.52' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify 1000 value in px option in Bond length', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering 1000 values
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Px },
      { option: BondsSetting.BondLength, value: '1000' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify 1000 value in pt option in Bond length', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering 1000 values
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Pt },
      { option: BondsSetting.BondLength, value: '1000' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify 1000 value in cm option in Bond length', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering 1000 values
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Cm },
      { option: BondsSetting.BondLength, value: '1000' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify 1000 value in inch option in Bond length', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering 1000 values
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      { option: BondsSetting.BondLengthUnits, value: MeasurementUnit.Inch },
      { option: BondsSetting.BondLength, value: '1000' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 1 decimal places px in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering values with one decimal place
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.BondThicknessUnits,
        value: MeasurementUnit.Px,
      },
      {
        option: BondsSetting.BondThickness,
        value: '3.1',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 1 decimal places cm in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering values with one decimal place
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.BondThicknessUnits,
        value: MeasurementUnit.Cm,
      },
      {
        option: BondsSetting.BondThickness,
        value: '0.2',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 1 decimal places pt in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering values with one decimal place
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.BondThicknessUnits,
        value: MeasurementUnit.Pt,
      },
      {
        option: BondsSetting.BondThickness,
        value: '13.1',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 1 decimal places inch in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering values with one decimal place
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.BondThicknessUnits,
        value: MeasurementUnit.Inch,
      },
      {
        option: BondsSetting.BondThickness,
        value: '13.1',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole number in px option in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering thw whole values 
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.BondThicknessUnits,
        value: MeasurementUnit.Px,
      },
      {
        option: BondsSetting.BondThickness,
        value: '4',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole number in cm option in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering the whole values
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.BondThicknessUnits,
        value: MeasurementUnit.Cm,
      },
      {
        option: BondsSetting.BondThickness,
        value: '1',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole number in pt option in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering the whole values
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.BondThicknessUnits,
        value: MeasurementUnit.Pt,
      },
      {
        option: BondsSetting.BondThickness,
        value: '3',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole number in inch option in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering the whole values
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.BondThicknessUnits,
        value: MeasurementUnit.Inch,
      },
      {
        option: BondsSetting.BondThickness,
        value: '2',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places px in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering values with one decimal place, 
        the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.BondThicknessUnits,
        value: MeasurementUnit.Px,
      },
      {
        option: BondsSetting.BondThickness,
        value: '3.17',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places cm in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering values with one decimal place, 
        the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.BondThicknessUnits,
        value: MeasurementUnit.Cm,
      },
      {
        option: BondsSetting.BondThickness,
        value: '0.13',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places pt in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering values with one decimal place, the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.BondThicknessUnits,
        value: MeasurementUnit.Pt,
      },
      {
        option: BondsSetting.BondThickness,
        value: '3.81',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places inch in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering values with one decimal place, 
        the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.BondThicknessUnits,
        value: MeasurementUnit.Inch,
      },
      {
        option: BondsSetting.BondThickness,
        value: '.18',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 1 decimal places px in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering values with one decimal place
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.StereoWedgeBondWidthUnits,
        value: MeasurementUnit.Px,
      },
      {
        option: BondsSetting.StereoWedgeBondWidth,
        value: '3.4',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 1 decimal places cm in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering values with one decimal place
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.StereoWedgeBondWidthUnits,
        value: MeasurementUnit.Cm,
      },
      {
        option: BondsSetting.StereoWedgeBondWidth,
        value: '0.4',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 1 decimal places pt in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering values with one decimal place
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.StereoWedgeBondWidthUnits,
        value: MeasurementUnit.Pt,
      },
      {
        option: BondsSetting.StereoWedgeBondWidth,
        value: '2.4',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 1 decimal places inch in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering values with one decimal place
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.StereoWedgeBondWidthUnits,
        value: MeasurementUnit.Inch,
      },
      {
        option: BondsSetting.StereoWedgeBondWidth,
        value: '1.4',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole number in px option in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering the whole values
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.StereoWedgeBondWidthUnits,
        value: MeasurementUnit.Px,
      },
      {
        option: BondsSetting.StereoWedgeBondWidth,
        value: '4',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole number in cm option in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering the whole values
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.StereoWedgeBondWidthUnits,
        value: MeasurementUnit.Cm,
      },
      {
        option: BondsSetting.StereoWedgeBondWidth,
        value: '3',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole number in pt option in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering the whole values
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.StereoWedgeBondWidthUnits,
        value: MeasurementUnit.Pt,
      },
      {
        option: BondsSetting.StereoWedgeBondWidth,
        value: '3',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole number in inch option in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering the whole values
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.StereoWedgeBondWidthUnits,
        value: MeasurementUnit.Inch,
      },
      {
        option: BondsSetting.StereoWedgeBondWidth,
        value: '2',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places px in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering values with one decimal place, 
        the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.StereoWedgeBondWidthUnits,
        value: MeasurementUnit.Px,
      },
      {
        option: BondsSetting.StereoWedgeBondWidth,
        value: '3.49',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places cm in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering values with one decimal place, 
        the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.StereoWedgeBondWidthUnits,
        value: MeasurementUnit.Cm,
      },
      {
        option: BondsSetting.StereoWedgeBondWidth,
        value: '0.74',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places pt in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering values with one decimal place, 
        the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.StereoWedgeBondWidthUnits,
        value: MeasurementUnit.Pt,
      },
      {
        option: BondsSetting.StereoWedgeBondWidth,
        value: '3.14',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places inch in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering values with one decimal place, 
        the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.StereoWedgeBondWidthUnits,
        value: MeasurementUnit.Inch,
      },
      {
        option: BondsSetting.StereoWedgeBondWidth,
        value: '3.67',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify Hash spacing setting and entering a value with up to 1 decimal places in px option', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering values with one decimal place
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Px,
      },
      { option: BondsSetting.HashSpacing, value: '0.5' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify a value with up to 1 decimal places in pt option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering values with one decimal place
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Pt,
      },
      { option: BondsSetting.HashSpacing, value: '0.5' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify a value with up to 1 decimal places in cm option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering values with one decimal place
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Cm,
      },
      { option: BondsSetting.HashSpacing, value: '0.5' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify a value with up to 1 decimal places in inch option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering values with one decimal place
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Inch,
      },
      { option: BondsSetting.HashSpacing, value: '0.5' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole value in px option in Hash spacing', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering the whole values
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Px,
      },
      { option: BondsSetting.HashSpacing, value: '2' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole value in pt option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering the whole values
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Pt,
      },
      { option: BondsSetting.HashSpacing, value: '1' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole value in cm option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering the whole values
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Cm,
      },
      { option: BondsSetting.HashSpacing, value: '1' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole value in inch option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering the whole values
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Inch,
      },
      { option: BondsSetting.HashSpacing, value: '1' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify Hash spacing setting and entering a value with up to 2 decimal places in px option', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering values with one decimal place,
        the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Px,
      },
      { option: BondsSetting.HashSpacing, value: '2.53' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify a value with up to 2 decimal places in pt option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering values with one decimal place, 
        the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Pt,
      },
      { option: BondsSetting.HashSpacing, value: '0.53' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify a value with up to 2 decimal places in cm option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering values with one decimal place, 
        the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Cm,
      },
      { option: BondsSetting.HashSpacing, value: '0.53' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify a value with up to 2 decimal places in inch option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering values with one decimal place, 
        the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Inch,
      },
      { option: BondsSetting.HashSpacing, value: '0.5' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify 1000 value in inch option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering values with one decimal place, 
        the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Inch,
      },
      { option: BondsSetting.HashSpacing, value: '1000' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify 1000 value in px option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering values with one decimal place, 
        the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Px,
      },
      { option: BondsSetting.HashSpacing, value: '1000' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify 1000 value in cm option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering values with one decimal place, 
        the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Cm,
      },
      { option: BondsSetting.HashSpacing, value: '1000' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify 1000 value in pt option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering values with one decimal place, 
        the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/mixed-or-stereomarks.ket',
    );
    await setSettingsOptions(page, [
      {
        option: BondsSetting.HashSpacingUnits,
        value: MeasurementUnit.Pt,
      },
      { option: BondsSetting.HashSpacing, value: '1000' },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify Bond spacing setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5154
        Description: Change "Double bond width" setting
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    const bondSpacing = page.getByText('Bond spacing');
    await expect(bondSpacing).toHaveText('Bond spacing');
    const bondSpacingValue = await SettingsDialog(page).getOptionValue(
      BondsSetting.BondSpacing,
    );
    expect(bondSpacingValue).toBe('15');
    await SettingsDialog(page).apply();
    await takeEditorScreenshot(page);
  });

  test('Verify Bond spacing entering the whole number more than default', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5154
        Description: Change "Double bond width" setting
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOption(page, BondsSetting.BondSpacing, '50');
    await takeEditorScreenshot(page);
  });

  test('Verify Bond spacing entering the whole number less than default', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5154
        Description: Change "Double bond width" setting
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOption(page, BondsSetting.BondSpacing, '10');
    await takeEditorScreenshot(page);
  });

  test('Verify Bond spacing entering 100 value', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5154
        Description: Change "Double bond width" setting
        */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await setSettingsOption(page, BondsSetting.BondSpacing, '100');
    await takeEditorScreenshot(page);
  });
});

test.describe('Negative cases for Bonds Settings', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Verify negative value in px option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        a negative value should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondLengthUnits,
      MeasurementUnit.Px,
    );
    await SettingsDialog(page).setOptionValue(BondsSetting.BondLength, '-7.8');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify a negative value in pt option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        a negative value should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondLengthUnits,
      MeasurementUnit.Pt,
    );
    await SettingsDialog(page).setOptionValue(BondsSetting.BondLength, '-7.8');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify a negative value in cm option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        a negative value should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondLengthUnits,
      MeasurementUnit.Cm,
    );
    await SettingsDialog(page).setOptionValue(BondsSetting.BondLength, '-7.8');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify a negative value in inch option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        a negative value should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondLengthUnits,
      MeasurementUnit.Inch,
    );
    await SettingsDialog(page).setOptionValue(BondsSetting.BondLength, '-7.8');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 in px option Bond length setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        0 should not be allowed to be applyed
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondLengthUnits,
      MeasurementUnit.Px,
    );
    await SettingsDialog(page).setOptionValue(BondsSetting.BondLength, '0');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 in pt option Bond length setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        0 should not be allowed to be applyed
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondLengthUnits,
      MeasurementUnit.Pt,
    );
    await SettingsDialog(page).setOptionValue(BondsSetting.BondLength, '0');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 in cm option Bond length setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        0 should not be allowed to be applyed
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondLengthUnits,
      MeasurementUnit.Cm,
    );
    await SettingsDialog(page).setOptionValue(BondsSetting.BondLength, '0');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 in inch option Bond length setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        0 should not be allowed to be applyed
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondLengthUnits,
      MeasurementUnit.Inch,
    );
    await SettingsDialog(page).setOptionValue(BondsSetting.BondLength, '0');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 1000.1 value in cm option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        a 1000.1 value should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondLengthUnits,
      MeasurementUnit.Cm,
    );
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondLength,
      '1000.1',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 1000.1 value in px option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        1000.1 value should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondLengthUnits,
      MeasurementUnit.Px,
    );
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondLength,
      '1000.1',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 1000.1 value in pt option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        1000.1 value should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondLengthUnits,
      MeasurementUnit.Pt,
    );
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondLength,
      '1000.1',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 1000.1 value in inch option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        1000.1 value should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondLengthUnits,
      MeasurementUnit.Inch,
    );
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondLength,
      '1000.1',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify negative value with px option in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: a negative value should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondThicknessUnits,
      MeasurementUnit.Px,
    );
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondThickness,
      '-0.2',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify negative value with cm option in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: a negative value should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondThicknessUnits,
      MeasurementUnit.Cm,
    );
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondThickness,
      '-0.2',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify negative value with pt option in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: a negative value should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondThicknessUnits,
      MeasurementUnit.Pt,
    );
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondThickness,
      '-0.2',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify negative value with inch option in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: a negative value should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondThicknessUnits,
      MeasurementUnit.Inch,
    );
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondThickness,
      '-0.2',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 with px option in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: 0 should not be allowed to be applyed
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondThicknessUnits,
      MeasurementUnit.Px,
    );
    await SettingsDialog(page).setOptionValue(BondsSetting.BondThickness, '0');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 with cm option in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: 0 should not be allowed to be applyed
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondThicknessUnits,
      MeasurementUnit.Cm,
    );
    await SettingsDialog(page).setOptionValue(BondsSetting.BondThickness, '0');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 with pt option in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: 0 should not be allowed to be applyed
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondThicknessUnits,
      MeasurementUnit.Pt,
    );
    await SettingsDialog(page).setOptionValue(BondsSetting.BondThickness, '0');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 with inch option in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: 0 should not be allowed to be applyed
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.BondThicknessUnits,
      MeasurementUnit.Inch,
    );
    await SettingsDialog(page).setOptionValue(BondsSetting.BondThickness, '0');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify negative value with px option in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: a negative value should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.StereoWedgeBondWidthUnits,
      MeasurementUnit.Px,
    );
    await SettingsDialog(page).setOptionValue(
      BondsSetting.StereoWedgeBondWidth,
      '-1.4',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify negative value with cm option in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: a negative value should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.StereoWedgeBondWidthUnits,
      MeasurementUnit.Cm,
    );
    await SettingsDialog(page).setOptionValue(
      BondsSetting.StereoWedgeBondWidth,
      '-1.4',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify negative value with pt option in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: a negative value should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.StereoWedgeBondWidthUnits,
      MeasurementUnit.Pt,
    );
    await SettingsDialog(page).setOptionValue(
      BondsSetting.StereoWedgeBondWidth,
      '-1.4',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify negative value with inch option in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: a negative value should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.StereoWedgeBondWidthUnits,
      MeasurementUnit.Inch,
    );
    await SettingsDialog(page).setOptionValue(
      BondsSetting.StereoWedgeBondWidth,
      '-1.4',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 with px option in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: 0 should not be allowed to be applyed
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.StereoWedgeBondWidthUnits,
      MeasurementUnit.Px,
    );
    await SettingsDialog(page).setOptionValue(
      BondsSetting.StereoWedgeBondWidth,
      '0',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 with cm option in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: 0 should not be allowed to be applyed
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.StereoWedgeBondWidthUnits,
      MeasurementUnit.Cm,
    );
    await SettingsDialog(page).setOptionValue(
      BondsSetting.StereoWedgeBondWidth,
      '0',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 with pt option in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: 0 should not be allowed to be applyed
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.StereoWedgeBondWidthUnits,
      MeasurementUnit.Pt,
    );
    await SettingsDialog(page).setOptionValue(
      BondsSetting.StereoWedgeBondWidth,
      '0',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 with inch option in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: 0 should not be allowed to be applyed
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.StereoWedgeBondWidthUnits,
      MeasurementUnit.Inch,
    );
    await SettingsDialog(page).setOptionValue(
      BondsSetting.StereoWedgeBondWidth,
      '0',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify negative value with up to 1 decimal places in px option in Hash spacing', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        a negative value should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.HashSpacingUnits,
      MeasurementUnit.Px,
    );
    await SettingsDialog(page).setOptionValue(BondsSetting.HashSpacing, '-0.5');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify a negative value with up to 1 decimal places in pt option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        a negative value should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.HashSpacingUnits,
      MeasurementUnit.Pt,
    );
    await SettingsDialog(page).setOptionValue(BondsSetting.HashSpacing, '-0.5');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify a negative value with up to 1 decimal places in cm option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        a negative value should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.HashSpacingUnits,
      MeasurementUnit.Cm,
    );
    await SettingsDialog(page).setOptionValue(BondsSetting.HashSpacing, '-0.5');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify a negative value with up to 1 decimal places in inch option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        a negative value should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.HashSpacingUnits,
      MeasurementUnit.Inch,
    );
    await SettingsDialog(page).setOptionValue(BondsSetting.HashSpacing, '-0.5');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 in px option in Hash spacing', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        0 should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.HashSpacingUnits,
      MeasurementUnit.Px,
    );
    await SettingsDialog(page).setOptionValue(BondsSetting.HashSpacing, '0');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 in pt option Hash spacing setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        0 should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.HashSpacingUnits,
      MeasurementUnit.Pt,
    );
    await SettingsDialog(page).setOptionValue(BondsSetting.HashSpacing, '0');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 in cm option Hash spacing setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        0 should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.HashSpacingUnits,
      MeasurementUnit.Cm,
    );
    await SettingsDialog(page).setOptionValue(BondsSetting.HashSpacing, '0');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 in inch option Hash spacing setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        0 should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.HashSpacingUnits,
      MeasurementUnit.Inch,
    );
    await SettingsDialog(page).setOptionValue(BondsSetting.HashSpacing, '0');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 1000.1 in inch option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        1000.1 should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.HashSpacingUnits,
      MeasurementUnit.Inch,
    );
    await SettingsDialog(page).setOptionValue(
      BondsSetting.HashSpacing,
      '1000.1',
    );

    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 1000.1 in cm option Hash spacing setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        1000.1 should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.HashSpacingUnits,
      MeasurementUnit.Cm,
    );
    await SettingsDialog(page).setOptionValue(
      BondsSetting.HashSpacing,
      '1000.1',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 1000.1 in pt option Hash spacing setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        1000.1 should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.HashSpacingUnits,
      MeasurementUnit.Pt,
    );
    await SettingsDialog(page).setOptionValue(
      BondsSetting.HashSpacing,
      '1000.1',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 1000.1 in px option Hash spacing setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        1000.1 should not be allowed to be entered
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(
      BondsSetting.HashSpacingUnits,
      MeasurementUnit.Px,
    );
    await SettingsDialog(page).setOptionValue(
      BondsSetting.HashSpacing,
      '1000.1',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify Bond spacing can not applyes 0', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5154
        Description: Change "Double bond width" setting
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(BondsSetting.BondSpacing, '0');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify Bond spacing can not applyes negative value', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5154
        Description: Change "Double bond width" setting
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(BondsSetting.BondSpacing, '-19');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify Bond spacing can not applyes 101 value', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5154
        Description: Change "Double bond width" setting
        */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Bonds);
    await SettingsDialog(page).setOptionValue(BondsSetting.BondSpacing, '101');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });
});
