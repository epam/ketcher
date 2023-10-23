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
} from '@utils';

async function openStructureLibrary(page: Page) {
  await page.getByTestId(STRUCTURE_LIBRARY_BUTTON_TEST_ID).click();
}

async function templateFromLAminoAcidsCategory(page: Page) {
  const deltaX = 0;
  const deltaY = 80;
  const anyX = 638;
  const anyY = 524;
  await openStructureLibrary(page);
  await page.getByRole('button', { name: 'L-Amino Acids (20)' }).click();
  await page.mouse.move(anyX, anyY);
  await page.mouse.wheel(deltaX, deltaY);
  await page.getByText('ARG-L-Arginine').click();
  await clickInTheMiddleOfTheScreen(page);
}

async function applyIgnoreChiralFlag(page: Page) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await page.getByText('Stereochemistry', { exact: true }).click();
  const deltaX = 0;
  const deltaY = 60;
  const anyX = 638;
  const anyY = 524;
  await page.mouse.move(anyX, anyY);
  await page.mouse.wheel(deltaX, deltaY);
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
    const pointx = 204;
    const pointy = 211;
    await applyIgnoreChiralFlag(page);
    await templateFromLAminoAcidsCategory(page);
    await copyAndPaste(page);
    await page.mouse.click(pointx, pointy);
  });

  test('Verify absence "Enhanced Stereochemistry" group Label Behavior with Cut/Paste', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-16921
    const pointy = 204;
    const pointz = 211;
    await applyIgnoreChiralFlag(page);
    await templateFromLAminoAcidsCategory(page);
    await cutAndPaste(page);
    await page.mouse.click(pointy, pointz);
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
