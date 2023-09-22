import { Page, test } from '@playwright/test';
import {
  getCoordinatesOfTheMiddleOfTheScreen,
  pressButton,
  resetCurrentTool,
  selectTopPanelButton,
  STRUCTURE_LIBRARY_BUTTON_NAME,
  takeEditorScreenshot,
  TopPanelButton,
  waitForPageInit,
} from '@utils';

async function setDisplayStereoFlagsSettingToOn(page: Page) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await page.getByText('Stereochemistry', { exact: true }).click();
  await pressButton(page, 'IUPAC style');
  // Using "On" label style, to always show the stereo labels, so we can see the difference
  await page.getByRole('option', { name: 'On' }).click();
  await pressButton(page, 'Apply');
}

async function setIgnoreChiralFlagSetting(page: Page, newSetting: boolean) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await page.getByText('Stereochemistry', { exact: true }).click();

  const checkLocator = page.getByText('Ignore the chiral flag');
  const isChecked = await checkLocator.isChecked();
  if (isChecked !== newSetting) {
    await checkLocator.click();
  }

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
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Template with chiral flag 0 with ignoreChiralFlag enabled/disabled', async ({
    page,
  }) => {
    // Phenylalanine mustard was chosen, because it has chiral flag 0, which allows us
    // to test ignoreChiralFlag, which has an effect on the structure only in this case
    const offsetX = 200;
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);

    await setDisplayStereoFlagsSettingToOn(page);

    await setIgnoreChiralFlagSetting(page, true);
    await placePhenylalanineMustard(page, x - offsetX, y);

    await setIgnoreChiralFlagSetting(page, false);
    await placePhenylalanineMustard(page, x + offsetX, y);
  });
});
