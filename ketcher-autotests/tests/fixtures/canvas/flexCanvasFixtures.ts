/* eslint-disable no-empty-pattern */
import { test as utils } from '../utilsFixtures';
import { test as pageObjects } from '../commonPageObjectFixtures';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { mergeTests, Page } from '@playwright/test';
import { NotificationBanner } from '@tests/pages/macromolecules/canvas/NotificationBanner';

export const test = mergeTests(utils, pageObjects).extend<
  { FlexCanvas: void },
  { initFlexCanvas: () => Promise<Page> }
>({
  FlexCanvas: async (
    {
      ketcher,
      CommonTopRightToolbar,
      CommonTopLeftToolbar,
      MacromoleculesTopToolbar,
      resetZoomLevelToDefault,
      clearLocalStorage,
    },
    use,
  ) => {
    const page = ketcher.page as Page;
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await use();
    await CommonTopLeftToolbar(page).clearCanvas();
    const NOTIFICATION_BANNER_CLOSE_DELAY_MS = 100;
    const banner = NotificationBanner(page);
    while (await banner.isVisible()) {
      await banner.close();
      await page.waitForTimeout(NOTIFICATION_BANNER_CLOSE_DELAY_MS);
    }
    await resetZoomLevelToDefault(page);
    await clearLocalStorage(page);
  },
  initFlexCanvas: [
    async (
      { createPage, CommonTopRightToolbar, MacromoleculesTopToolbar },
      use,
    ) => {
      await use(async () => {
        const page = await createPage();
        await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
        await MacromoleculesTopToolbar(page).selectLayoutModeTool(
          LayoutMode.Flex,
        );
        return page;
      });
    },
    { scope: 'worker', auto: true },
  ],
});
