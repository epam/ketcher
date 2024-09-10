/* eslint-disable no-magic-numbers */
import { test, expect } from '@playwright/test';
import {
  bondsDefaultSettings,
  moveMouseAway,
  openFileAndAddToCanvasAsNewProject,
  pressButton,
  resetAllSettingsToDefault,
  selectTopPanelButton,
  setBondLengthOptionUnit,
  setBondLengthValue,
  setBondSpacingValue,
  setBondThicknessOptionUnit,
  setBondThicknessValue,
  setHashSpacingOptionUnit,
  setHashSpacingValue,
  setStereoBondWidthOptionUnit,
  setStereoBondWidthValue,
  takeEditorScreenshot,
  TopPanelButton,
  waitForPageInit,
} from '@utils';

test('Verify Bonds setting menu', async ({ page }) => {
  await waitForPageInit(page);
  await bondsDefaultSettings(page);
  const scrollToDown = page.getByTestId('Options for Debugging-accordion');
  await scrollToDown.scrollIntoViewIfNeeded();
  await scrollToDown.hover({ force: true });
  await takeEditorScreenshot(page);
});

test.describe('Bonds Settings', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await resetAllSettingsToDefault(page);
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    const bondLenght = page.getByText('Bond length');
    expect(bondLenght).toHaveText('Bond length');
    await setBondLengthOptionUnit(page, 'px-option');
    await setBondLengthValue(page, '7.8');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'pt-option');
    await setBondLengthValue(page, '17.8');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'cm-option');
    await setBondLengthValue(page, '0.8');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'inch-option');
    await setBondLengthValue(page, '2.8');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'px-option');
    await setBondLengthValue(page, '17');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'pt-option');
    await setBondLengthValue(page, '19');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'cm-option');
    await setBondLengthValue(page, '1');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'inch-option');
    await setBondLengthValue(page, '3');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
  });

  test('Verify Bond length setting and entering a value with up to 2 decimal places in px option', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering values with one decimal place, the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'px-option');
    await setBondLengthValue(page, '18.87');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
  });

  test('Verify a value with up to 2 decimal places in pt option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering values with one decimal place, the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'pt-option');
    await setBondLengthValue(page, '16.68');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
  });

  test('Verify a value with up to 2 decimal places in cm option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering values with one decimal place, the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'cm-option');
    await setBondLengthValue(page, '0.78');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
  });

  test('Verify a value with up to 2 decimal places in inch option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering values with one decimal place, the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'inch-option');
    await setBondLengthValue(page, '3.25');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
  });

  test('Verify 1000 value in px option in Bond length', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering 1000 values
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'px-option');
    await setBondLengthValue(page, '1000');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
  });

  test('Verify 1000 value in pt option in Bond length', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering 1000 values
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'pt-option');
    await setBondLengthValue(page, '1000');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
  });

  test('Verify 1000 value in cm option in Bond length', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering 1000 values
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'cm-option');
    await setBondLengthValue(page, '1000');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
  });

  test('Verify 1000 value in inch option in Bond length', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering 1000 values
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'inch-option');
    await setBondLengthValue(page, '1000');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondThicknessOptionUnit(page, 'px-option');
    await setBondThicknessValue(page, '3.1');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondThicknessOptionUnit(page, 'cm-option');
    await setBondThicknessValue(page, '0.2');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondThicknessOptionUnit(page, 'pt-option');
    await setBondThicknessValue(page, '13.1');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondThicknessOptionUnit(page, 'inch-option');
    await setBondThicknessValue(page, '3.1');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondThicknessOptionUnit(page, 'px-option');
    await setBondThicknessValue(page, '4');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondThicknessOptionUnit(page, 'cm-option');
    await setBondThicknessValue(page, '1');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondThicknessOptionUnit(page, 'pt-option');
    await setBondThicknessValue(page, '3');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondThicknessOptionUnit(page, 'inch-option');
    await setBondThicknessValue(page, '2');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places px in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering values with one decimal place, the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondThicknessOptionUnit(page, 'px-option');
    await setBondThicknessValue(page, '3.17');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places cm in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering values with one decimal place, the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondThicknessOptionUnit(page, 'cm-option');
    await setBondThicknessValue(page, '0.13');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondThicknessOptionUnit(page, 'pt-option');
    await setBondThicknessValue(page, '3.81');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places inch in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering values with one decimal place, the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondThicknessOptionUnit(page, 'inch-option');
    await setBondThicknessValue(page, '.18');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setStereoBondWidthOptionUnit(page, 'px-option');
    await setStereoBondWidthValue(page, '3.4');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setStereoBondWidthOptionUnit(page, 'cm-option');
    await setStereoBondWidthValue(page, '0.4');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setStereoBondWidthOptionUnit(page, 'pt-option');
    await setStereoBondWidthValue(page, '2.4');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setStereoBondWidthOptionUnit(page, 'inch-option');
    await setStereoBondWidthValue(page, '1.4');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setStereoBondWidthOptionUnit(page, 'px-option');
    await setStereoBondWidthValue(page, '4');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setStereoBondWidthOptionUnit(page, 'cm-option');
    await setStereoBondWidthValue(page, '3');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setStereoBondWidthOptionUnit(page, 'pt-option');
    await setStereoBondWidthValue(page, '3');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setStereoBondWidthOptionUnit(page, 'inch-option');
    await setStereoBondWidthValue(page, '2');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places px in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering values with one decimal place, the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setStereoBondWidthOptionUnit(page, 'px-option');
    await setStereoBondWidthValue(page, '3.49');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places cm in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering values with one decimal place, the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setStereoBondWidthOptionUnit(page, 'cm-option');
    await setStereoBondWidthValue(page, '0.74');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places pt in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering values with one decimal place, the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setStereoBondWidthOptionUnit(page, 'pt-option');
    await setStereoBondWidthValue(page, '3.14');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places inch in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: require a number input should allow entering values with one decimal place, the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setStereoBondWidthOptionUnit(page, 'inch-option');
    await setStereoBondWidthValue(page, '3.67');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    const hashSpacing = page.getByText('Hash spacing');
    expect(hashSpacing).toHaveText('Hash spacing');
    await setHashSpacingOptionUnit(page, 'px-option');
    await setHashSpacingValue(page, '0.5');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setHashSpacingOptionUnit(page, 'pt-option');
    await setHashSpacingValue(page, '0.5');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setHashSpacingOptionUnit(page, 'cm-option');
    await setHashSpacingValue(page, '0.5');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setHashSpacingOptionUnit(page, 'inch-option');
    await setHashSpacingValue(page, '0.5');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setHashSpacingOptionUnit(page, 'px-option');
    await setHashSpacingValue(page, '2');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setHashSpacingOptionUnit(page, 'pt-option');
    await setHashSpacingValue(page, '1');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setHashSpacingOptionUnit(page, 'cm-option');
    await setHashSpacingValue(page, '1');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setHashSpacingOptionUnit(page, 'inch-option');
    await setHashSpacingValue(page, '1');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Verify Hash spacing setting and entering a value with up to 2 decimal places in px option', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering values with one decimal place, the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setHashSpacingOptionUnit(page, 'px-option');
    await setHashSpacingValue(page, '2.53');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Verify a value with up to 2 decimal places in pt option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering values with one decimal place, the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setHashSpacingOptionUnit(page, 'pt-option');
    await setHashSpacingValue(page, '0.53');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Verify a value with up to 2 decimal places in cm option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering values with one decimal place, the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setHashSpacingOptionUnit(page, 'cm-option');
    await setHashSpacingValue(page, '0.53');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Verify a value with up to 2 decimal places in inch option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering values with one decimal place, the second number from the value entered after the dot is substituted
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setHashSpacingOptionUnit(page, 'inch-option');
    await setHashSpacingValue(page, '0.5');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Verify Bond spacing setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5154
        Description: Change "Double bond width" setting
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    const bondSpacing = page.getByText('Bond spacing');
    expect(bondSpacing).toHaveText('Bond spacing');
    const bondSpacingValue = page.getByTestId('bondSpacing-input');
    expect(bondSpacingValue).toHaveValue('15');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Verify Bond spacing entering the whole number more than default for ACS 18%', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5154
        Description: Change "Double bond width" setting
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondSpacingValue(page, '50');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondSpacingValue(page, '10');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Verify Bond spacing entering 100 value', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5154
        Description: Change "Double bond width" setting
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await setBondSpacingValue(page, '100');
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'px-option');
    await setBondLengthValue(page, '-7.8');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify a negative value in pt option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        a negative value should not be allowed to be entered
        */
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'pt-option');
    await setBondLengthValue(page, '-7.8');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify a negative value in cm option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        a negative value should not be allowed to be entered
        */
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'cm-option');
    await setBondLengthValue(page, '-7.8');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify a negative value in inch option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        a negative value should not be allowed to be entered
        */
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'inch-option');
    await setBondLengthValue(page, '-7.8');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 in px option Bond length setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        0 should not be allowed to be applyed
        */
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'px-option');
    await setBondLengthValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 in pt option Bond length setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        0 should not be allowed to be applyed
        */
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'pt-option');
    await setBondLengthValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 in cm option Bond length setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        0 should not be allowed to be applyed
        */
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'cm-option');
    await setBondLengthValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 in inch option Bond length setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        0 should not be allowed to be applyed
        */
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'inch-option');
    await setBondLengthValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 1000.1 value in cm option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        a 1000.1 value should not be allowed to be entered
        */
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'cm-option');
    await setBondLengthValue(page, '1000.1');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 1000.1 value in px option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        1000.1 value should not be allowed to be entered
        */
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'px-option');
    await setBondLengthValue(page, '1000.1');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
    await takeEditorScreenshot(page);
  });

  test('Verify 1000.1 value in pt option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        1000.1 value should not be allowed to be entered
        */
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'pt-option');
    await setBondLengthValue(page, '1000.1');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
    await takeEditorScreenshot(page);
  });

  test('Verify 1000.1 value in inch option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        1000.1 value should not be allowed to be entered
        */
    await bondsDefaultSettings(page);
    await setBondLengthOptionUnit(page, 'inch-option');
    await setBondLengthValue(page, '1000.1');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
    await takeEditorScreenshot(page);
  });

  test('Verify negative value with px option in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: a negative value should not be allowed to be entered
        */
    await bondsDefaultSettings(page);
    await setBondThicknessOptionUnit(page, 'px-option');
    await setBondThicknessValue(page, '-0.2');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify negative value with cm option in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: a negative value should not be allowed to be entered
        */
    await bondsDefaultSettings(page);
    await setBondThicknessOptionUnit(page, 'cm-option');
    await setBondThicknessValue(page, '-0.2');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify negative value with pt option in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: a negative value should not be allowed to be entered
        */
    await bondsDefaultSettings(page);
    await setBondThicknessOptionUnit(page, 'pt-option');
    await setBondThicknessValue(page, '-0.2');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify negative value with inch option in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: a negative value should not be allowed to be entered
        */
    await bondsDefaultSettings(page);
    await setBondThicknessOptionUnit(page, 'inch-option');
    await setBondThicknessValue(page, '-0.2');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 with px option in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: 0 should not be allowed to be applyed
        */
    await bondsDefaultSettings(page);
    await setBondThicknessOptionUnit(page, 'px-option');
    await setBondThicknessValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 with cm option in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: 0 should not be allowed to be applyed
        */
    await bondsDefaultSettings(page);
    await setBondThicknessOptionUnit(page, 'cm-option');
    await setBondThicknessValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 with pt option in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: 0 should not be allowed to be applyed
        */
    await bondsDefaultSettings(page);
    await setBondThicknessOptionUnit(page, 'pt-option');
    await setBondThicknessValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 with inch option in the setting Bond thickness', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: 0 should not be allowed to be applyed
        */
    await bondsDefaultSettings(page);
    await setBondThicknessOptionUnit(page, 'inch-option');
    await setBondThicknessValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify negative value with px option in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: a negative value should not be allowed to be entered
        */
    await bondsDefaultSettings(page);
    await setStereoBondWidthOptionUnit(page, 'px-option');
    await setStereoBondWidthValue(page, '-1.4');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify negative value with cm option in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: a negative value should not be allowed to be entered
        */
    await bondsDefaultSettings(page);
    await setStereoBondWidthOptionUnit(page, 'cm-option');
    await setStereoBondWidthValue(page, '-1.4');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify negative value with pt option in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: a negative value should not be allowed to be entered
        */
    await bondsDefaultSettings(page);
    await setStereoBondWidthOptionUnit(page, 'pt-option');
    await setStereoBondWidthValue(page, '-1.4');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify negative value with inch option in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: a negative value should not be allowed to be entered
        */
    await bondsDefaultSettings(page);
    await setStereoBondWidthOptionUnit(page, 'inch-option');
    await setStereoBondWidthValue(page, '-1.4');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 with px option in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: 0 should not be allowed to be applyed
        */
    await bondsDefaultSettings(page);
    await setStereoBondWidthOptionUnit(page, 'px-option');
    await setStereoBondWidthValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 with cm option in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: 0 should not be allowed to be applyed
        */
    await bondsDefaultSettings(page);
    await setStereoBondWidthOptionUnit(page, 'cm-option');
    await setStereoBondWidthValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 with pt option in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: 0 should not be allowed to be applyed
        */
    await bondsDefaultSettings(page);
    await setStereoBondWidthOptionUnit(page, 'pt-option');
    await setStereoBondWidthValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 with inch option in the setting Stereo (Wedge) bond width', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5175
        Description: 0 should not be allowed to be applyed
        */
    await bondsDefaultSettings(page);
    await setStereoBondWidthOptionUnit(page, 'inch-option');
    await setStereoBondWidthValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify negative value with up to 1 decimal places in px option in Hash spacing', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        a negative value should not be allowed to be entered
        */
    await bondsDefaultSettings(page);
    await setHashSpacingOptionUnit(page, 'px-option');
    await setHashSpacingValue(page, '-0.5');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify a negative value with up to 1 decimal places in pt option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        a negative value should not be allowed to be entered
        */
    await bondsDefaultSettings(page);
    await setHashSpacingOptionUnit(page, 'pt-option');
    await setHashSpacingValue(page, '-0.5');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify a negative value with up to 1 decimal places in cm option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        a negative value should not be allowed to be entered
        */
    await bondsDefaultSettings(page);
    await setHashSpacingOptionUnit(page, 'cm-option');
    await setHashSpacingValue(page, '-0.5');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify a negative value with up to 1 decimal places in inch option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        a negative value should not be allowed to be entered
        */
    await bondsDefaultSettings(page);
    await setHashSpacingOptionUnit(page, 'inch-option');
    await setHashSpacingValue(page, '-0.5');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 in px option in Hash spacing', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        0 should not be allowed to be entered
        */
    await bondsDefaultSettings(page);
    await setHashSpacingOptionUnit(page, 'px-option');
    await setHashSpacingValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 in pt option Hash spacing setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        0 should not be allowed to be entered
        */
    await bondsDefaultSettings(page);
    await setHashSpacingOptionUnit(page, 'pt-option');
    await setHashSpacingValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 in cm option Hash spacing setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        0 should not be allowed to be entered
        */
    await bondsDefaultSettings(page);
    await setHashSpacingOptionUnit(page, 'cm-option');
    await setHashSpacingValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 in inch option Hash spacing setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        0 should not be allowed to be entered
        */
    await bondsDefaultSettings(page);
    await setHashSpacingOptionUnit(page, 'inch-option');
    await setHashSpacingValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify Bond spacing can not applyes 0', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5154
        Description: Change "Double bond width" setting
        */
    await bondsDefaultSettings(page);
    await setBondSpacingValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify Bond spacing can not applyes negative value', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5154
        Description: Change "Double bond width" setting
        */
    await bondsDefaultSettings(page);
    await setBondSpacingValue(page, '-19');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify Bond spacing can not applyes 101 value', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5154
        Description: Change "Double bond width" setting
        */
    await bondsDefaultSettings(page);
    await setBondSpacingValue(page, '101');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });
});
