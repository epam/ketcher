/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import { STRUCTURE_LIBRARY_BUTTON_TEST_ID } from '@tests/Templates/templates.costants';
import {
  clickInTheMiddleOfTheScreen,
  copyAndPaste,
  cutAndPaste,
  pressButton,
  selectTopPanelButton,
  takeEditorScreenshot,
  TopPanelButton,
  waitForPageInit,
  waitForRender,
} from '@utils';
import { scrollSettingBar } from '@utils/scrollSettingBar';

async function openStructureLibrary(page: Page) {
  await page.getByTestId(STRUCTURE_LIBRARY_BUTTON_TEST_ID).click();
}

async function templateFromLAminoAcidsCategory(page: Page) {
  await openStructureLibrary(page);
  await page.getByRole('button', { name: 'L-Amino Acids (20)' }).click();
  await scrollSettingBar(page, 80);
  await page.getByText('ARG-L-Arginine').click();
  await clickInTheMiddleOfTheScreen(page);
}

async function applyIgnoreChiralFlag(page: Page) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await page.getByText('Stereochemistry', { exact: true }).click();
  await scrollSettingBar(page, 80);
  await page
    .locator('label')
    .filter({ hasText: 'Ignore the chiral flag' })
    .locator('div span')
    .click();
  await pressButton(page, 'Apply');
}

test.describe('Ignore Chiral Flag', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Verify absence "Enhanced Stereochemistry" group Label Behavior with Copy/Paste', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-16920
    const pointX = 204;
    const pointY = 211;
    await applyIgnoreChiralFlag(page);
    await templateFromLAminoAcidsCategory(page);
    await copyAndPaste(page);
    await waitForRender(page, async () => {
      await page.mouse.click(pointX, pointY);
    });
  });

  test('Verify absence "Enhanced Stereochemistry" group Label Behavior with Cut/Paste', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-16921
    const pointY = 204;
    const pointZ = 211;
    await applyIgnoreChiralFlag(page);
    await templateFromLAminoAcidsCategory(page);
    await cutAndPaste(page);
    await waitForRender(page, async () => {
      await page.mouse.click(pointY, pointZ);
    });
  });

  test('Verify absence "Enhanced Stereochemistry" group Label Behavior with Undo', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-16919
    await applyIgnoreChiralFlag(page);
    await templateFromLAminoAcidsCategory(page);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
  });
});
