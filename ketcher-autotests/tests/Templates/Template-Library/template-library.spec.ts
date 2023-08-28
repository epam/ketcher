import { Page, test } from '@playwright/test';
import {
  getCoordinatesOfTheMiddleOfTheScreen,
  pressButton,
  resetCurrentTool,
  selectTopPanelButton,
  STRUCTURE_LIBRARY_BUTTON_NAME,
  takeEditorScreenshot,
  TopPanelButton,
} from '@utils';

async function setDisplayStereoFlagsSettingToOn(page: Page) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await page.getByText('Stereochemistry', { exact: true }).click();
  await pressButton(page, 'IUPAC style');
  await page.getByRole('option', { name: 'On' }).click();
  await pressButton(page, 'Apply');
}

async function switchIgnoreChiralFlagSetting(page: Page) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await page.getByText('Stereochemistry', { exact: true }).click();
  await page.getByText('Ignore the chiral flag').click();
  await pressButton(page, 'Apply');
}

async function placePhenylalanineMustard(page: Page, x: number, y: number) {
  await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
  const phenylalanineLocator = page.locator(
    `div[title*="Phenylalanine mustard"] > div`,
  );
  if ((await phenylalanineLocator.count()) === 0) {
    await page.getByText('Aromatics').click();
  }
  await phenylalanineLocator.first().click();
  await page.mouse.click(x, y);
}

test.describe('Templates - Template Library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Template with chiral flag 0 with ignoreChiralFlag enabled/disabled', async ({
    page,
  }) => {
    const offsetX = 200;
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);

    await setDisplayStereoFlagsSettingToOn(page);

    await switchIgnoreChiralFlagSetting(page);
    await placePhenylalanineMustard(page, x - offsetX, y);

    await switchIgnoreChiralFlagSetting(page);
    await placePhenylalanineMustard(page, x + offsetX, y);
  });
});
