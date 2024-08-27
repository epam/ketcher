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
} from '@utils';

/* eslint-disable no-magic-numbers */

async function generalDefaultSettings(page: Page) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  const deltaX = 0;
  const deltaY = 150;
  const anyX = 638;
  const anyY = 524;
  await page.mouse.move(anyX, anyY);
  await page.mouse.wheel(deltaX, deltaY);
}

async function resetSelectToolOff(page: Page) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await page.getByTestId('reset-to-select-input-span').click();
  await page.getByTestId('off-option').click();
  await pressButton(page, 'Apply');
}

async function resetAppliedSettings(page: Page) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await page.getByRole('button', { name: 'Reset' }).click();
  await page.getByTestId('OK').click();
}

async function clickOnCancelOption(page: Page) {
  await page.getByTestId('Cancel').click();
}

test.describe('General Settings', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
    await resetAppliedSettings(page);
  });

  test('Verify Ketcher settings panel', async ({ page }) => {
    /*
    Test case:EPMLSOPKET-10078 - General settings - Defaul settings verification' & EPMLSOPKET-12973
    */
    await selectTopPanelButton(TopPanelButton.Settings, page);
  });

  test('Verify settings menu', async ({ page }) => {
    // Test case: EPMLSOPKET-10077
    await generalDefaultSettings(page);
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
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .fill('15.6');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').first().click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .fill('0.9');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').first().click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .fill('18.9');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').first().click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .fill('42.9');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .fill('16');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').first().click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .fill('2');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').first().click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .fill('18');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').first().click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .fill('32');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .fill('15.62');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').first().click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .fill('0.97');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').first().click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .fill('18.91');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').first().click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .fill('42.95');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .fill('15.6');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').nth(1).click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .fill('34.9');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').nth(1).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .fill('18.9');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').nth(1).click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .fill('42.9');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .fill('16');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').nth(1).click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .fill('2');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').nth(1).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .fill('13');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').nth(1).click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .fill('42.9');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .fill('15.64');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').nth(1).click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .fill('34.93');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').nth(1).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .fill('18.94');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').nth(1).click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .fill('42.96');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    const ReactionComponentMarginSize = page.getByText(
      'Reaction component margin size',
    );
    expect(ReactionComponentMarginSize).toHaveText(
      'Reaction component margin size',
    );
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .fill('15.6');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').nth(2).click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .fill('15.6');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').nth(2).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .fill('15.6');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').nth(2).click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .fill('15.6');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .fill('12');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').nth(2).click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .fill('14');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').nth(2).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .fill('19');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').nth(2).click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .fill('17');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .fill('15.68');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').nth(2).click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .fill('15.66');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').nth(2).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .fill('15.62');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').nth(2).click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .fill('15.69');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });
});

test.describe('Negative cases for General Settings', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
    await clickOnCancelOption(page);
  });

  test('Verify negative value with px option in the setting Font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: a negative value should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .fill('-23.6');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify negative value with cm option in the setting Font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: a negative value should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').first().click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .fill('-37.9');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify negative value with pt option in the setting Font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: a negative value should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').first().click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .fill('-16.3');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify negative value with inch option in the setting Font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: a negative value should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').first().click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .fill('-42.9');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 with px option in the setting Font size', async ({ page }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be applyed
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .fill('0');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 with cm option in the setting Font size', async ({ page }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be applyed
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').first().click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .fill('0');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 with pt option in the setting Font size', async ({ page }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be applyed
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').first().click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .fill('0');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 with inch option in the setting Font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be applyed
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').first().click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(1)
      .fill('0');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify negative value with px option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: a negative value should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .fill('-15.6');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify negative value with cm option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: a negative value should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').first().click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .fill('-27.9');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify negative value with pt option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: a negative value should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').first().click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .fill('-14.9');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify negative value with inch option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: a negative value should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').first().click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .fill('-47.9');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 with px option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .fill('0');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 with cm option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').first().click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .fill('0');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 with pt option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').first().click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .fill('0');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 with inch option in the setting Sub font size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5175
    Description: 0 should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').first().click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(2)
      .fill('0');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify negative value in px option the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    a negative value should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .fill('-15.6');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify negative value in cm option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    a negative value should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').nth(2).click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .fill('-15.6');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify negative value in pt option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    a negative value should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').nth(2).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .fill('-15.6');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify negative value in inch option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    a negative value should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').nth(2).click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .fill('-15.6');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify 0 in px option the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    0 value should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .fill('0');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify 0 in cm option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    0 should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').nth(2).click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .fill('0');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify 0 in pt option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    0 should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').nth(2).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .fill('0');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify 0 in inch option in the setting Reaction component margin size', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/5152
    Description: add new setting Reaction component margin size
    0 should not be allowed to be entered
    */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Settings, page);
    await page.getByText('px').nth(2).click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Reset to Select ToolAfter' })
      .getByRole('textbox')
      .nth(3)
      .fill('0');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });
});
