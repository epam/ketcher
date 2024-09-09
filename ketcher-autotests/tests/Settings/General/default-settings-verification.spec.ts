/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  waitForPageInit,
  drawBenzeneRing,
  pressButton,
  copyAndPaste,
  takeEditorScreenshot,
  openFileAndAddToCanvasAsNewProject,
  resetAllSettingsToDefault,
  setFontSizeOptionUnit,
  setFontSizeValue,
  setSubFontSizeOptionUnit,
  setSubFontSizeValue,
  setReactionMarginSizeOptionUnit,
  setReactionMarginSizeValue,
  moveMouseAway,
} from '@utils';

async function resetSelectToolOff(page: Page) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await page.getByTestId('reset-to-select-input-span').click();
  await page.getByTestId('off-option').click();
  await pressButton(page, 'Apply');
}

test('Verify Ketcher settings panel', async ({ page }) => {
  /*
  Test case:EPMLSOPKET-10078 - General settings - Defaul settings verification' & EPMLSOPKET-12973
  */
  await waitForPageInit(page);
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await takeEditorScreenshot(page);
});

test.describe('General Settings', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await resetAllSettingsToDefault(page);
  });

  test('Undo/Redo Actions when switch "reset to Select tool" is"Off"', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-18059
    const pointX = 350;
    const pointY = 350;
    await resetSelectToolOff(page);
    await drawBenzeneRing(page);
    await copyAndPaste(page);
    await page.mouse.click(pointX, pointY);
    await page.keyboard.press('Control+z');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setFontSizeOptionUnit(page, 'px-option');
    await setFontSizeValue(page, '17.8');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setFontSizeOptionUnit(page, 'cm-option');
    await setFontSizeValue(page, '0.8');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setFontSizeOptionUnit(page, 'pt-option');
    await setFontSizeValue(page, '10.8');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setFontSizeOptionUnit(page, 'inch-option');
    await setFontSizeValue(page, '1.1');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setFontSizeOptionUnit(page, 'px-option');
    await setFontSizeValue(page, '9');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setFontSizeOptionUnit(page, 'cm-option');
    await setFontSizeValue(page, '2');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setFontSizeOptionUnit(page, 'pt-option');
    await setFontSizeValue(page, '18');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setFontSizeOptionUnit(page, 'inch-option');
    await setFontSizeValue(page, '1');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places px in the setting Font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: require a number input should allow entering values with one decimal place, two decimal place should rounding up
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setFontSizeOptionUnit(page, 'px-option');
    await setFontSizeValue(page, '17.83');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places cm in the setting Font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: require a number input should allow entering values with one decimal place, two decimal place should rounding up
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setFontSizeOptionUnit(page, 'cm-option');
    await setFontSizeValue(page, '0.83');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places pt in the setting Font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: require a number input should allow entering values with one decimal place, two decimal place should rounding up
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setFontSizeOptionUnit(page, 'pt-option');
    await setFontSizeValue(page, '21.89');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places inch in the setting Font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: require a number input should allow entering values with one decimal place, two decimal place should rounding up
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setFontSizeOptionUnit(page, 'inch-option');
    await setFontSizeValue(page, '0.45');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setSubFontSizeOptionUnit(page, 'px-option');
    await setSubFontSizeValue(page, '14.5');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setSubFontSizeOptionUnit(page, 'cm-option');
    await setSubFontSizeValue(page, '1.5');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setSubFontSizeOptionUnit(page, 'pt-option');
    await setSubFontSizeValue(page, '16.5');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setSubFontSizeOptionUnit(page, 'inch-option');
    await setSubFontSizeValue(page, '3.5');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setSubFontSizeOptionUnit(page, 'px-option');
    await setSubFontSizeValue(page, '15');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setSubFontSizeOptionUnit(page, 'cm-option');
    await setSubFontSizeValue(page, '1');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setSubFontSizeOptionUnit(page, 'pt-option');
    await setSubFontSizeValue(page, '36');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setSubFontSizeOptionUnit(page, 'inch-option');
    await setSubFontSizeValue(page, '2');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places px in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: require a number input should allow entering values with one decimal place, two decimal place should rounding up
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setSubFontSizeOptionUnit(page, 'px-option');
    await setSubFontSizeValue(page, '14.58');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places cm in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: require a number input should allow entering values with one decimal place, two decimal place should rounding up
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setSubFontSizeOptionUnit(page, 'cm-option');
    await setSubFontSizeValue(page, '1.59');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places pt in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: require a number input should allow entering values with one decimal place, two decimal place should rounding up
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setSubFontSizeOptionUnit(page, 'pt-option');
    await setSubFontSizeValue(page, '14.54');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places inch in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: require a number input should allow entering values with one decimal place, two decimal place should rounding up
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setSubFontSizeOptionUnit(page, 'inch-option');
    await setSubFontSizeValue(page, '.35');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/layout-with-catalyst.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    const ReactionComponentMarginSize = page.getByText(
      'Reaction component margin size',
    );
    expect(ReactionComponentMarginSize).toHaveText(
      'Reaction component margin size',
    );
    await setReactionMarginSizeOptionUnit(page, 'px-option');
    await setReactionMarginSizeValue(page, '30.3');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
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
      'KET/layout-with-catalyst.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'cm-option');
    await setReactionMarginSizeValue(page, '0.9');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
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
      'KET/layout-with-catalyst.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'pt-option');
    await setReactionMarginSizeValue(page, '56.3');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
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
      'KET/layout-with-catalyst.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'inch-option');
    await setReactionMarginSizeValue(page, '1.3');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
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
      'KET/layout-with-catalyst.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'px-option');
    await setReactionMarginSizeValue(page, '13');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
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
      'KET/layout-with-catalyst.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'cm-option');
    await setReactionMarginSizeValue(page, '4');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
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
      'KET/layout-with-catalyst.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'pt-option');
    await setReactionMarginSizeValue(page, '144');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
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
      'KET/layout-with-catalyst.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'inch-option');
    await setReactionMarginSizeValue(page, '12');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places in px option the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    require a number input should allow entering values with one decimal place, two decimal place should rounding up
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/layout-with-catalyst.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'px-option');
    await setReactionMarginSizeValue(page, '94.57');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places in cm option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    require a number input should allow entering values with one decimal place, two decimal place should rounding up
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/layout-with-catalyst.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'cm-option');
    await setReactionMarginSizeValue(page, '5.83');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places in pt option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    require a number input should allow entering values with one decimal place, two decimal place should rounding up
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/layout-with-catalyst.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'pt-option');
    await setReactionMarginSizeValue(page, '14.94');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
  });

  test('Verify value with up to 2 decimal places in inch option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    require a number input should allow entering values with one decimal place, two decimal place should rounding up
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/layout-with-catalyst.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'inch-option');
    await setReactionMarginSizeValue(page, '19.48');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
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
      'KET/layout-with-catalyst.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'px-option');
    await setReactionMarginSizeValue(page, '1000');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
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
      'KET/layout-with-catalyst.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'cm-option');
    await setReactionMarginSizeValue(page, '1000');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
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
      'KET/layout-with-catalyst.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'pt-option');
    await setReactionMarginSizeValue(page, '1000');
    await page.waitForTimeout(1000);
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
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
      'KET/layout-with-catalyst.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'inch-option');
    await setReactionMarginSizeValue(page, '1000');
    await page.waitForTimeout(1000);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await selectTopPanelButton(TopPanelButton.Layout, page);
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
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setFontSizeOptionUnit(page, 'px-option');
    await setFontSizeValue(page, '-17.8');
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify negative value with cm option in the setting Font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: a negative value should not be allowed to be entered
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setFontSizeOptionUnit(page, 'cm-option');
    await setFontSizeValue(page, '-1.8');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify negative value with pt option in the setting Font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: a negative value should not be allowed to be entered
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setFontSizeOptionUnit(page, 'pt-option');
    await setFontSizeValue(page, '-17.8');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify negative value with inch option in the setting Font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: a negative value should not be allowed to be entered
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setFontSizeOptionUnit(page, 'inch-option');
    await setFontSizeValue(page, '-1');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 with px option in the setting Font size', async ({ page }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be applyed
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setFontSizeOptionUnit(page, 'px-option');
    await setFontSizeValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 with cm option in the setting Font size', async ({ page }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be applyed
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setFontSizeOptionUnit(page, 'cm-option');
    await setFontSizeValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 with pt option in the setting Font size', async ({ page }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be applyed
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setFontSizeOptionUnit(page, 'pt-option');
    await setFontSizeValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 with inch option in the setting Font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be applyed
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setFontSizeOptionUnit(page, 'inch-option');
    await setFontSizeValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify negative value with px option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: a negative value should not be allowed to be entered
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setSubFontSizeOptionUnit(page, 'px-option');
    await setSubFontSizeValue(page, '-15.8');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify negative value with cm option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: a negative value should not be allowed to be entered
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setSubFontSizeOptionUnit(page, 'cm-option');
    await setSubFontSizeValue(page, '-1.5');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify negative value with pt option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: a negative value should not be allowed to be entered
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setSubFontSizeOptionUnit(page, 'pt-option');
    await setSubFontSizeValue(page, '-18.5');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify negative value with inch option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: a negative value should not be allowed to be entered
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setSubFontSizeOptionUnit(page, 'inch-option');
    await setSubFontSizeValue(page, '-1.5');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 with px option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be entered
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setSubFontSizeOptionUnit(page, 'px-option');
    await setSubFontSizeValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 with cm option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be entered
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setSubFontSizeOptionUnit(page, 'cm-option');
    await setSubFontSizeValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 with pt option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be entered
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setSubFontSizeOptionUnit(page, 'pt-option');
    await setSubFontSizeValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 with inch option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be entered
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setSubFontSizeOptionUnit(page, 'inch-option');
    await setSubFontSizeValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify negative value in px option the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    a negative value should not be allowed to be entered
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'px-option');
    await setReactionMarginSizeValue(page, '-14.7');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify negative value in cm option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    a negative value should not be allowed to be entered
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'cm-option');
    await setReactionMarginSizeValue(page, '-3.4');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify negative value in pt option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    a negative value should not be allowed to be entered
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'pt-option');
    await setReactionMarginSizeValue(page, '-14.2');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify negative value in inch option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    a negative value should not be allowed to be entered
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'inch-option');
    await setReactionMarginSizeValue(page, '-1.6');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 in px option the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    0 value should not be allowed to be entered
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'px-option');
    await setReactionMarginSizeValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 in cm option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    0 should not be allowed to be entered
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'cm-option');
    await setReactionMarginSizeValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 in pt option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    0 should not be allowed to be entered
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'pt-option');
    await setReactionMarginSizeValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Verify 0 in inch option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    0 should not be allowed to be entered
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'inch-option');
    await setReactionMarginSizeValue(page, '0');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'px-option');
    await setReactionMarginSizeValue(page, '1000.1');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'cm-option');
    await setReactionMarginSizeValue(page, '1000.1');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'pt-option');
    await setReactionMarginSizeValue(page, '1000.1');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await setReactionMarginSizeOptionUnit(page, 'inch-option');
    await setReactionMarginSizeValue(page, '1000.1');
    await moveMouseAway(page);
    const Apply = page.getByRole('button', { name: 'Apply' });
    const isDisabled = await Apply.isDisabled();
    expect(isDisabled).toBe(true);
    await takeEditorScreenshot(page);
  });
});
