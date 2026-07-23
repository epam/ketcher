/* eslint-disable no-empty-pattern */
import { test as utils } from '../utilsFixtures';
import { test as pageObjects } from '../commonPageObjectFixtures';
import { waitForIndigoToLoad, waitForKetcherInit } from '@utils';
import { mergeTests, Page } from '@playwright/test';
import { SettingsDialog } from '@tests/pages/molecules/canvas/SettingsDialog';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';

export const test = mergeTests(utils, pageObjects).extend<
  { MoleculesCanvas: void },
  { initMoleculesCanvas: () => Promise<Page> }
>({
  MoleculesCanvas: async (
    {
      ketcher,
      CommonTopLeftToolbar,
      CommonTopRightToolbar,
      resetZoomLevelToDefault,
      clearLocalStorage,
      resetSettingsValuesToDefault,
    },
    use,
  ) => {
    const page = ketcher.page as Page;
    if (await SettingsDialog(page).window.isVisible()) {
      await SettingsDialog(page).close();
    }
    if (await ErrorMessageDialog(page).isVisible()) {
      await ErrorMessageDialog(page).close();
    }
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await waitForKetcherInit(page);
    await waitForIndigoToLoad(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await resetZoomLevelToDefault(page);
    await resetSettingsValuesToDefault(page);
    await clearLocalStorage(page);
    await use();
  },
  initMoleculesCanvas: [
    async ({ createPage }, use) => {
      await use(async () => {
        const page = await createPage();
        return page;
      });
    },
    { scope: 'worker', auto: true },
  ],
});
