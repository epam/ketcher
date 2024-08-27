import { Page, test } from '@playwright/test';
import {
  openFileAndAddToCanvasAsNewProject,
  pressButton,
  selectTopPanelButton,
  takeEditorScreenshot,
  TopPanelButton,
  waitForPageInit,
} from '@utils';
import { scrollSettingBar } from '@utils/scrollSettingBar';

/* eslint-disable no-magic-numbers */

const DEFAULT_SCROLLBAR_DELAY = 150;

async function bondsDefaultSettings(page: Page) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await page.getByText('Bonds', { exact: true }).click();
  await scrollSettingBar(page, DEFAULT_SCROLLBAR_DELAY);
}

async function resetAppliedSettings(page: Page) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await page.getByRole('button', { name: 'Reset' }).click();
  await page.getByTestId('OK').click();
}

async function clickOnCancelOption(page: Page) {
  await page.getByTestId('Cancel').click();
}

test.describe('Bonds Settings', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
    await resetAppliedSettings(page);
  });

  test('Verify Bonds setting menu', async ({ page }) => {
    await bondsDefaultSettings(page);
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
    const hashSpacing = page.getByText('Bond length');
    expect(hashSpacing).toHaveText('Bond length');
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('7.8');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').first().click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('17.8');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').first().click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('9.8');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').first().click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('4.8');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('8');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').nth(2).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('19');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').first().click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('10');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').first().click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('5');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify Bond length setting and entering a value with up to 2 decimal places in px option', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering values with one decimal place, two decimal place should rounding up
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('7.89');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify a value with up to 2 decimal places in pt option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering values with one decimal place, two decimal place should rounding up
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page.getByText('px').first().click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('17.82');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify a value with up to 2 decimal places in cm option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering values with one decimal place, two decimal place should rounding up
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page.getByText('px').first().click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('9.76');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify a value with up to 2 decimal places in inch option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        require a number input should allow entering values with one decimal place, two decimal place should rounding up
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page.getByText('px').first().click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('4.84');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .fill('3.5');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').nth(3).click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .fill('0.9');
    // await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').nth(3).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .fill('17.9');
    // await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').nth(3).click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .fill('19.9');
    // await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .fill('4');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').nth(3).click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .fill('2');
    // await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').nth(3).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .fill('19');
    // await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').nth(3).click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .fill('19.9');
    // await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify value with up to 2 decimal places px in the setting Bond thickness', async ({
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
    await bondsDefaultSettings(page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .fill('3.56');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify value with up to 2 decimal places cm in the setting Bond thickness', async ({
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
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(3).click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .fill('0.98');
    // await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify value with up to 2 decimal places pt in the setting Bond thickness', async ({
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
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(3).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .fill('17.93');
    // await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify value with up to 2 decimal places inch in the setting Bond thickness', async ({
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
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(3).click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .fill('19.94');
    // await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify value with up to 1 decimal places px in the setting Stereo (Wedge) bond width', async ({
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
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .fill('5.5');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify value with up to 1 decimal places cm in the setting Stereo (Wedge) bond width', async ({
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
    await page.getByText('px').nth(4).click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .fill('0.9');
    // await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify value with up to 1 decimal places pt in the setting Stereo (Wedge) bond width', async ({
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
    await page.getByText('px').nth(4).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .fill('17.9');
    // await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify value with up to 1 decimal places inch in the setting Stereo (Wedge) bond width', async ({
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
    await page.getByText('px').nth(4).click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .fill('19.9');
    // await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify the whole number in px option in the setting Stereo (Wedge) bond width', async ({
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
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .fill('7');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify the whole number in cm option in the setting Stereo (Wedge) bond width', async ({
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
    await page.getByText('px').nth(4).click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .fill('2');
    // await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify the whole number in pt option in the setting Stereo (Wedge) bond width', async ({
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
    await page.getByText('px').nth(4).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .fill('19');
    // await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify the whole number in inch option in the setting Stereo (Wedge) bond width', async ({
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
    await page.getByText('px').nth(4).click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .fill('21');
    // await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify value with up to 2 decimal places px in the setting Stereo (Wedge) bond width', async ({
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
    await bondsDefaultSettings(page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .fill('5.54');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify value with up to 2 decimal places cm in the setting Stereo (Wedge) bond width', async ({
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
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(4).click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .fill('0.95');
    // await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify value with up to 2 decimal places pt in the setting Stereo (Wedge) bond width', async ({
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
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(4).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .fill('17.96');
    // await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify value with up to 2 decimal places inch in the setting Stereo (Wedge) bond width', async ({
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
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(4).click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .fill('19.96');
    // await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('7.8');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').nth(5).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('17.8');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').nth(5).click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('9.8');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').nth(5).click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('4.8');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('8');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').nth(5).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('19');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').nth(5).click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('10');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
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
    await page.getByText('px').nth(5).click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('5');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify Hash spacing setting and entering a value with up to 2 decimal places in px option', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering values with one decimal place, two decimal place should rounding up
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('7.87');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify a value with up to 2 decimal places in pt option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering values with one decimal place, two decimal place should rounding up
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(5).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('17.85');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify a value with up to 2 decimal places in cm option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering values with one decimal place, two decimal place should rounding up
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(5).click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('9.89');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify a value with up to 2 decimal places in inch option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        require a number input should allow entering values with one decimal place, two decimal place should rounding up
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(5).click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('4.89');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify Bond spacing setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5154
        Description: Change "Double bond width" setting
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    const bondSpacing = page.getByText('Bond spacing');
    expect(bondSpacing).toHaveText('Bond spacing');
    const bondSpacingValue = page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first();
    expect(bondSpacingValue).toEqual('18');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify Bond spacing entering the whole number more than default 18%', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5154
        Description: Change "Double bond width" setting
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('23');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });

  test('Verify Bond spacing entering the whole number less than default 18%', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5154
        Description: Change "Double bond width" setting
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('10');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
  });
});

test.describe('Negative cases for Bonds Settings', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
    await clickOnCancelOption(page);
  });

  test('Verify negative value in px option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        a negative value should not be allowed to be entered
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('-7.8');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify a negative value in pt option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        a negative value should not be allowed to be entered
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page.getByText('px').first().click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('-17.8');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify a negative value in cm option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        a negative value should not be allowed to be entered
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page.getByText('px').first().click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('-9.8');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify a negative value in inch option Bond length setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        a negative value should not be allowed to be entered
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page.getByText('px').first().click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('-4.8');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 in px option Bond length setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        0 should not be allowed to be applyed
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('0');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 in pt option Bond length setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        0 should not be allowed to be applyed
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page.getByText('px').first().click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('0');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 in cm option Bond length setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        0 should not be allowed to be applyed
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page.getByText('px').first().click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('0');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 in inch option Bond length setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Bond length
        0 should not be allowed to be applyed
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/benzene-arrow-benzene-reagent-hcl.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page.getByText('px').first().click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('0');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify negative value with px option in the setting Bond thickness', async ({
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
    await bondsDefaultSettings(page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .fill('-5.5');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify negative value with cm option in the setting Bond thickness', async ({
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
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(3).click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .fill('-0.9');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify negative value with pt option in the setting Bond thickness', async ({
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
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(3).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .fill('-14.9');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify negative value with inch option in the setting Bond thickness', async ({
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
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(3).click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .fill('-17.9');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 with px option in the setting Bond thickness', async ({
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
    await bondsDefaultSettings(page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(2)
      .fill('0');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 with cm option in the setting Bond thickness', async ({
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
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(3).click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .fill('0');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 with pt option in the setting Bond thickness', async ({
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
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(3).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .fill('0');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 with inch option in the setting Bond thickness', async ({
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
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(3).click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(1)
      .fill('0');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify negative value with px option in the setting Stereo (Wedge) bond width', async ({
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
    await bondsDefaultSettings(page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('-5.5');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify negative value with cm option in the setting Stereo (Wedge) bond width', async ({
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
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(4).click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('-0.9');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify negative value with pt option in the setting Stereo (Wedge) bond width', async ({
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
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(4).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('-14.9');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify negative value with inch option in the setting Stereo (Wedge) bond width', async ({
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
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(4).click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('-17.9');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 with px option in the setting Stereo (Wedge) bond width', async ({
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
    await bondsDefaultSettings(page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('0');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 with cm option in the setting Stereo (Wedge) bond width', async ({
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
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(4).click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('0');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 with pt option in the setting Stereo (Wedge) bond width', async ({
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
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(4).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('0');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 with inch option in the setting Stereo (Wedge) bond width', async ({
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
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(4).click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('0');
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify negative value with up to 1 decimal places in px option in Hash spacing', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        a negative value should not be allowed to be entered
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('-7.8');
    await takeEditorScreenshot(page);
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify a negative value with up to 1 decimal places in pt option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        a negative value should not be allowed to be entered
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(5).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('-17.8');
    await takeEditorScreenshot(page);
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify a negative value with up to 1 decimal places in cm option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        a negative value should not be allowed to be entered
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(5).click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('-9.8');
    await takeEditorScreenshot(page);
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify a negative value with up to 1 decimal places in inch option Hash spacing setting', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        a negative value should not be allowed to be entered
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(5).click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('-4.8');
    await takeEditorScreenshot(page);
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 in px option in Hash spacing', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        0 should not be allowed to be entered
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('0');
    await takeEditorScreenshot(page);
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 in pt option Hash spacing setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        0 should not be allowed to be entered
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(5).click();
    await page.getByTestId('pt-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('0');
    await takeEditorScreenshot(page);
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 in cm option Hash spacing setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        0 should not be allowed to be entered
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(5).click();
    await page.getByTestId('cm-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('0');
    await takeEditorScreenshot(page);
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify 0 in inch option Hash spacing setting', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5152
        Description: add new setting Hash spacing
        0 should not be allowed to be entered
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page.getByText('px').nth(5).click();
    await page.getByTestId('inch-option').click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .nth(3)
      .fill('0');
    await takeEditorScreenshot(page);
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify Bond spacing can not applyes 0', async ({ page }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5154
        Description: Change "Double bond width" setting
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('0');
    await takeEditorScreenshot(page);
    await page.getByTestId('OK').isDisabled;
  });

  test('Verify Bond spacing can not applyes negative value', async ({
    page,
  }) => {
    /*
        Test case: https://github.com/epam/ketcher/issues/5154
        Description: Change "Double bond width" setting
        */
    await openFileAndAddToCanvasAsNewProject(
      'KET/mixed-or-stereomarks.ket',
      page,
    );
    await bondsDefaultSettings(page);
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .click();
    await page
      .locator('fieldset')
      .filter({ hasText: 'Aromatic Bonds as' })
      .getByRole('textbox')
      .first()
      .fill('-19');
    await takeEditorScreenshot(page);
    await page.getByTestId('OK').isDisabled;
  });
});
