import { test as utils } from '../utilsFixtures';
import { test as pageObjects } from '../commonPageObjectFixtures';
import { mergeTests } from '@playwright/test';
import { waitForIndigoToLoad, waitForKetcherInit } from '@utils';

export const test = mergeTests(utils, pageObjects).extend<{
  MicroCanvas: void;
}>({
  MicroCanvas: async (
    { page, CommonTopLeftToolbar, resetZoomLevelToDefault, clearLocalStorage },
    use,
  ) => {
    await waitForKetcherInit(page);
    await waitForIndigoToLoad(page);
    await use();
    await CommonTopLeftToolbar(page).clearCanvas();
    await resetZoomLevelToDefault(page);
    await clearLocalStorage(page);
  },
});
