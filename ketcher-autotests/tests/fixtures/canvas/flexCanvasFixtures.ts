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
    await page.keyboard.press('Escape');
    const banner = NotificationBanner(page);
    while (await banner.isVisible()) {
      await banner.waitForBecomeHidden();
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
