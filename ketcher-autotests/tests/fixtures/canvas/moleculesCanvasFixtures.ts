/* eslint-disable no-empty-pattern */
import { test as utils } from '../utilsFixtures';
import { test as pageObjects } from '../commonPageObjectFixtures';
import { waitForIndigoToLoad, waitForKetcherInit } from '@utils';
import { mergeTests, Page } from '@playwright/test';

export const test = mergeTests(utils, pageObjects).extend<
  { MoleculesCanvas: void },
  { initMoleculesCanvas: () => Promise<Page> }
>({
  MoleculesCanvas: async (
    {
      page,
      CommonTopLeftToolbar,
      CommonTopRightToolbar,
      resetZoomLevelToDefault,
      clearLocalStorage,
      resetSettingsValuesToDefault,
      closeErrorAndInfoModals,
    },
    use,
  ) => {
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await waitForKetcherInit(page);
    await waitForIndigoToLoad(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await resetZoomLevelToDefault(page);
    await resetSettingsValuesToDefault(page);
    await closeErrorAndInfoModals(page);
    await clearLocalStorage(page);
    await use();
    await closeErrorAndInfoModals(page);
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
