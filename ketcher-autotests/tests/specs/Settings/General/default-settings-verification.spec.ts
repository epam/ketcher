/* eslint-disable no-magic-numbers */
import { test, expect } from '@fixtures';
import {
  waitForPageInit,
  takeEditorScreenshot,
  openFileAndAddToCanvasAsNewProject,
  clickOnCanvas,
  undoByKeyboard,
} from '@utils';
import { copyAndPaste } from '@utils/canvas/selectSelection';
import {
  GeneralSetting,
  MeasurementUnit,
  ResetToSelectToolOption,
} from '@tests/pages/constants/settingsDialog/Constants';
import { drawBenzeneRing } from '@tests/pages/molecules/BottomToolbar';
import {
  resetSettingsValuesToDefault,
  setSettingsOption,
  setSettingsOptions,
  SettingsDialog,
} from '@tests/pages/molecules/canvas/SettingsDialog';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { TopRightToolbar } from '@tests/pages/molecules/TopRightToolbar';

test('Verify Ketcher settings panel', async ({ page }) => {
  /*
  Test case:EPMLSOPKET-10078 - General settings - Defaul settings verification' & EPMLSOPKET-12973
  */
  await waitForPageInit(page);
  await TopRightToolbar(page).Settings({ waitForFontListLoad: true });
  await takeEditorScreenshot(page);
});

test.describe('General Settings', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await resetSettingsValuesToDefault(page);
  });

  test('Undo/Redo Actions when switch "reset to Select tool" is"Off"', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-18059
    const pointX = 350;
    const pointY = 350;
    await setSettingsOption(
      page,
      GeneralSetting.ResetToSelectTool,
      ResetToSelectToolOption.Off,
    );
    await drawBenzeneRing(page);
    await copyAndPaste(page);
    await clickOnCanvas(page, pointX, pointY, { from: 'pageTopLeft' });
    await undoByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 1 decimal places px in the setting Font size', async ({
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
        option: GeneralSetting.FontSizeUnits,
        value: MeasurementUnit.Px,
      },
      {
        option: GeneralSetting.FontSize,
        value: '17.8',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 1 decimal places cm in the setting Font size', async ({
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
        option: GeneralSetting.FontSizeUnits,
        value: MeasurementUnit.Cm,
      },
      {
        option: GeneralSetting.FontSize,
        value: '0.8',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 1 decimal places pt in the setting Font size', async ({
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
        option: GeneralSetting.FontSizeUnits,
        value: MeasurementUnit.Pt,
      },
      {
        option: GeneralSetting.FontSize,
        value: '10.8',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 1 decimal places inch in the setting Font size', async ({
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
        option: GeneralSetting.FontSizeUnits,
        value: MeasurementUnit.Inch,
      },
      {
        option: GeneralSetting.FontSize,
        value: '1.1',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole value in px option in the setting Font size', async ({
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
        option: GeneralSetting.FontSizeUnits,
        value: MeasurementUnit.Px,
      },
      {
        option: GeneralSetting.FontSize,
        value: '9',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole value in cm option in the setting Font size', async ({
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
        option: GeneralSetting.FontSizeUnits,
        value: MeasurementUnit.Cm,
      },
      {
        option: GeneralSetting.FontSize,
        value: '2',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole value in pt option in the setting Font size', async ({
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
        option: GeneralSetting.FontSizeUnits,
        value: MeasurementUnit.Pt,
      },
      {
        option: GeneralSetting.FontSize,
        value: '18',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole value in inch option in the setting Font size', async ({
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
        option: GeneralSetting.FontSizeUnits,
        value: MeasurementUnit.Inch,
      },
      {
        option: GeneralSetting.FontSize,
        value: '1',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places px in the setting Font size', async ({
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
        option: GeneralSetting.FontSizeUnits,
        value: MeasurementUnit.Px,
      },
      {
        option: GeneralSetting.FontSize,
        value: '17.83',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places cm in the setting Font size', async ({
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
        option: GeneralSetting.FontSizeUnits,
        value: MeasurementUnit.Cm,
      },
      {
        option: GeneralSetting.FontSize,
        value: '0.83',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places pt in the setting Font size', async ({
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
        option: GeneralSetting.FontSizeUnits,
        value: MeasurementUnit.Pt,
      },
      {
        option: GeneralSetting.FontSize,
        value: '21.89',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places inch in the setting Font size', async ({
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
        option: GeneralSetting.FontSizeUnits,
        value: MeasurementUnit.Inch,
      },
      {
        option: GeneralSetting.FontSize,
        value: '0.45',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 1 decimal places px in the setting Sub font size', async ({
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
        option: GeneralSetting.SubFontSizeUnits,
        value: MeasurementUnit.Px,
      },
      {
        option: GeneralSetting.SubFontSize,
        value: '14.5',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 1 decimal places cm in the setting Sub font size', async ({
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
        option: GeneralSetting.SubFontSizeUnits,
        value: MeasurementUnit.Cm,
      },
      {
        option: GeneralSetting.SubFontSize,
        value: '1.5',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 1 decimal places pt in the setting Sub font size', async ({
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
        option: GeneralSetting.SubFontSizeUnits,
        value: MeasurementUnit.Pt,
      },
      {
        option: GeneralSetting.SubFontSize,
        value: '16.5',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 1 decimal places inch in the setting Sub font size', async ({
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
        option: GeneralSetting.SubFontSizeUnits,
        value: MeasurementUnit.Inch,
      },
      {
        option: GeneralSetting.SubFontSize,
        value: '3.5',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole value in px option in the setting Sub font size', async ({
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
        option: GeneralSetting.SubFontSizeUnits,
        value: MeasurementUnit.Px,
      },
      {
        option: GeneralSetting.SubFontSize,
        value: '15',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole value in cm option in the setting Sub font size', async ({
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
        option: GeneralSetting.SubFontSizeUnits,
        value: MeasurementUnit.Cm,
      },
      {
        option: GeneralSetting.SubFontSize,
        value: '1',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole value in pt option in the setting Sub font size', async ({
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
        option: GeneralSetting.SubFontSizeUnits,
        value: MeasurementUnit.Pt,
      },
      {
        option: GeneralSetting.SubFontSize,
        value: '36',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify the whole value in inch option in the setting Sub font size', async ({
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
        option: GeneralSetting.SubFontSizeUnits,
        value: MeasurementUnit.Inch,
      },
      {
        option: GeneralSetting.SubFontSize,
        value: '2',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places px in the setting Sub font size', async ({
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
        option: GeneralSetting.SubFontSizeUnits,
        value: MeasurementUnit.Px,
      },
      {
        option: GeneralSetting.SubFontSize,
        value: '14.58',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places cm in the setting Sub font size', async ({
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
    await TopRightToolbar(page).Settings({ waitForFontListLoad: true });
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.SubFontSizeUnits,
      MeasurementUnit.Cm,
    );
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.SubFontSize,
      '1.59',
    );
    await takeEditorScreenshot(page);
    await SettingsDialog(page).apply();
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places pt in the setting Sub font size', async ({
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
        option: GeneralSetting.SubFontSizeUnits,
        value: MeasurementUnit.Pt,
      },
      {
        option: GeneralSetting.SubFontSize,
        value: '14.54',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places inch in the setting Sub font size', async ({
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
        option: GeneralSetting.SubFontSizeUnits,
        value: MeasurementUnit.Inch,
      },
      {
        option: GeneralSetting.SubFontSize,
        value: '.35',
      },
    ]);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 1 decimal places in px option the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    require a number input should allow entering values with one decimal place
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/layout-with-catalyst.ket',
    );
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.ReactionComponentMarginSizeUnits,
        value: MeasurementUnit.Px,
      },
      { option: GeneralSetting.ReactionComponentMarginSize, value: '30.3' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 1 decimal places in cm option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    require a number input should allow entering values with one decimal place
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/layout-with-catalyst.ket',
    );
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.ReactionComponentMarginSizeUnits,
        value: MeasurementUnit.Cm,
      },
      { option: GeneralSetting.ReactionComponentMarginSize, value: '0.9' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 1 decimal places in pt option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    require a number input should allow entering values with one decimal place
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/layout-with-catalyst.ket',
    );
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.ReactionComponentMarginSizeUnits,
        value: MeasurementUnit.Pt,
      },
      { option: GeneralSetting.ReactionComponentMarginSize, value: '56.3' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 1 decimal places in inch option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    require a number input should allow entering values with one decimal place
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/layout-with-catalyst.ket',
    );
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.ReactionComponentMarginSizeUnits,
        value: MeasurementUnit.Inch,
      },
      { option: GeneralSetting.ReactionComponentMarginSize, value: '1.3' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Verify the whole value in px option the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    require a number input should allow entering the whole values
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/layout-with-catalyst.ket',
    );
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.ReactionComponentMarginSizeUnits,
        value: MeasurementUnit.Px,
      },
      { option: GeneralSetting.ReactionComponentMarginSize, value: '13' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Verify the whole value in cm option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    require a number input should allow entering the whole values
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/layout-with-catalyst.ket',
    );
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.ReactionComponentMarginSizeUnits,
        value: MeasurementUnit.Cm,
      },
      { option: GeneralSetting.ReactionComponentMarginSize, value: '4' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Verify the whole value in pt option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    require a number input should allow entering the whole values
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/layout-with-catalyst.ket',
    );
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.ReactionComponentMarginSizeUnits,
        value: MeasurementUnit.Pt,
      },
      { option: GeneralSetting.ReactionComponentMarginSize, value: '144' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Verify the whole value in inch option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    require a number input should allow entering the whole values
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/layout-with-catalyst.ket',
    );
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.ReactionComponentMarginSizeUnits,
        value: MeasurementUnit.Inch,
      },
      { option: GeneralSetting.ReactionComponentMarginSize, value: '12' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places in px option the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    require a number input should allow entering values with one decimal place, 
        the second number from the value entered after the dot is substituted
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/layout-with-catalyst.ket',
    );
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.ReactionComponentMarginSizeUnits,
        value: MeasurementUnit.Px,
      },
      { option: GeneralSetting.ReactionComponentMarginSize, value: '94.57' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places in cm option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    require a number input should allow entering values with one decimal place, 
        the second number from the value entered after the dot is substituted
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/layout-with-catalyst.ket',
    );
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.ReactionComponentMarginSizeUnits,
        value: MeasurementUnit.Cm,
      },
      { option: GeneralSetting.ReactionComponentMarginSize, value: '5.83' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places in pt option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    require a number input should allow entering values with one decimal place, 
        the second number from the value entered after the dot is substituted
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/layout-with-catalyst.ket',
    );
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.ReactionComponentMarginSizeUnits,
        value: MeasurementUnit.Pt,
      },
      { option: GeneralSetting.ReactionComponentMarginSize, value: '14.94' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places in inch option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    require a number input should allow entering values with one decimal place, 
        the second number from the value entered after the dot is substituted
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/layout-with-catalyst.ket',
    );
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.ReactionComponentMarginSizeUnits,
        value: MeasurementUnit.Inch,
      },
      { option: GeneralSetting.ReactionComponentMarginSize, value: '19.48' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Verify 1000 value in px option the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    require a number input should allow entering the whole value 1000
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/layout-with-catalyst.ket',
    );
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.ReactionComponentMarginSizeUnits,
        value: MeasurementUnit.Px,
      },
      { option: GeneralSetting.ReactionComponentMarginSize, value: '1000' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Verify the 1000 value in cm option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    require a number input should allow entering the whole value 1000
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/layout-with-catalyst.ket',
    );
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.ReactionComponentMarginSizeUnits,
        value: MeasurementUnit.Cm,
      },
      { option: GeneralSetting.ReactionComponentMarginSize, value: '1000' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Verify the 1000 value in pt option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    require a number input should allow entering the whole value 1000
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/layout-with-catalyst.ket',
    );
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.ReactionComponentMarginSizeUnits,
        value: MeasurementUnit.Pt,
      },
      { option: GeneralSetting.ReactionComponentMarginSize, value: '1000' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  test('Verify the 1000 value in inch option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    require a number input should allow entering the whole value 1000
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/layout-with-catalyst.ket',
    );
    await setSettingsOptions(page, [
      {
        option: GeneralSetting.ReactionComponentMarginSizeUnits,
        value: MeasurementUnit.Inch,
      },
      { option: GeneralSetting.ReactionComponentMarginSize, value: '1000' },
    ]);
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });
});

test.describe('Negative cases for General Settings', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Verify negative value with px option in the setting Font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: a negative value should not be allowed to be entered
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.FontSizeUnits,
      MeasurementUnit.Px,
    );
    await SettingsDialog(page).setOptionValue(GeneralSetting.FontSize, '-17.8');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify negative value with cm option in the setting Font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: a negative value should not be allowed to be entered
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.FontSizeUnits,
      MeasurementUnit.Cm,
    );
    await SettingsDialog(page).setOptionValue(GeneralSetting.FontSize, '-1.8');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify negative value with pt option in the setting Font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: a negative value should not be allowed to be entered
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.FontSizeUnits,
      MeasurementUnit.Pt,
    );
    await SettingsDialog(page).setOptionValue(GeneralSetting.FontSize, '-17.8');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify negative value with inch option in the setting Font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: a negative value should not be allowed to be entered
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.FontSizeUnits,
      MeasurementUnit.Inch,
    );
    await SettingsDialog(page).setOptionValue(GeneralSetting.FontSize, '-1');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 with px option in the setting Font size', async ({ page }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be applyed
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.FontSizeUnits,
      MeasurementUnit.Px,
    );
    await SettingsDialog(page).setOptionValue(GeneralSetting.FontSize, '0');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 with cm option in the setting Font size', async ({ page }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be applyed
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.FontSizeUnits,
      MeasurementUnit.Cm,
    );
    await SettingsDialog(page).setOptionValue(GeneralSetting.FontSize, '0');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 with pt option in the setting Font size', async ({ page }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be applyed
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.FontSizeUnits,
      MeasurementUnit.Pt,
    );
    await SettingsDialog(page).setOptionValue(GeneralSetting.FontSize, '0');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 with inch option in the setting Font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be applyed
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.FontSizeUnits,
      MeasurementUnit.Inch,
    );
    await SettingsDialog(page).setOptionValue(GeneralSetting.FontSize, '0');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify negative value with px option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: a negative value should not be allowed to be entered
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.SubFontSizeUnits,
      MeasurementUnit.Px,
    );
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.SubFontSize,
      '-15.8',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify negative value with cm option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: a negative value should not be allowed to be entered
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.SubFontSizeUnits,
      MeasurementUnit.Cm,
    );
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.SubFontSize,
      '-1.5',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify negative value with pt option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: a negative value should not be allowed to be entered
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.SubFontSizeUnits,
      MeasurementUnit.Pt,
    );
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.SubFontSize,
      '-18.5',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify negative value with inch option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: a negative value should not be allowed to be entered
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.SubFontSizeUnits,
      MeasurementUnit.Inch,
    );
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.SubFontSize,
      '-1.5',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 with px option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be entered
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.SubFontSizeUnits,
      MeasurementUnit.Px,
    );
    await SettingsDialog(page).setOptionValue(GeneralSetting.SubFontSize, '0');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 with cm option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be entered
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.SubFontSizeUnits,
      MeasurementUnit.Cm,
    );
    await SettingsDialog(page).setOptionValue(GeneralSetting.SubFontSize, '0');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 with pt option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be entered
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.SubFontSizeUnits,
      MeasurementUnit.Pt,
    );
    await SettingsDialog(page).setOptionValue(GeneralSetting.SubFontSize, '0');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 with inch option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be entered
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.SubFontSizeUnits,
      MeasurementUnit.Inch,
    );
    await SettingsDialog(page).setOptionValue(GeneralSetting.SubFontSize, '0');
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify negative value in px option the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    a negative value should not be allowed to be entered
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSizeUnits,
      MeasurementUnit.Px,
    );
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSize,
      '-14.7',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify negative value in cm option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    a negative value should not be allowed to be entered
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSizeUnits,
      MeasurementUnit.Cm,
    );
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSize,
      '-3.4',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify negative value in pt option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    a negative value should not be allowed to be entered
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSizeUnits,
      MeasurementUnit.Pt,
    );
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSize,
      '-14.7',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify negative value in inch option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    a negative value should not be allowed to be entered
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSizeUnits,
      MeasurementUnit.Inch,
    );
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSize,
      '-1.6',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 in px option the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    0 value should not be allowed to be entered
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSizeUnits,
      MeasurementUnit.Px,
    );
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSize,
      '0',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 in cm option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    0 should not be allowed to be entered
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSizeUnits,
      MeasurementUnit.Cm,
    );
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSize,
      '0',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 in pt option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    0 should not be allowed to be entered
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSizeUnits,
      MeasurementUnit.Pt,
    );
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSize,
      '0',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 0 in inch option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    0 should not be allowed to be entered
    */
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSizeUnits,
      MeasurementUnit.Inch,
    );
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSize,
      '0',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 1000.1 value in px option the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    1000.1 should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSizeUnits,
      MeasurementUnit.Px,
    );
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSize,
      '1000.1',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify 1000.1 value in cm option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    1000.1 should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSizeUnits,
      MeasurementUnit.Cm,
    );
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSize,
      '1000.1',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify the 1000.1 value in pt option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    1000.1 should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSizeUnits,
      MeasurementUnit.Pt,
    );
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSize,
      '1000.1',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('Verify the 1000.1 value in inch option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    1000.1 should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
    );
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSizeUnits,
      MeasurementUnit.Inch,
    );
    await SettingsDialog(page).setOptionValue(
      GeneralSetting.ReactionComponentMarginSize,
      '1000.1',
    );
    const applyButton = SettingsDialog(page).applyButton;
    const isDisabled = await applyButton.isDisabled();
    expect(isDisabled).toBe(true);
  });
});
