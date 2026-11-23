import { test as utils } from '../utilitiesFixtures';
import { test as pageObjects } from '../commonPageObjectFixtures';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { mergeTests, Page } from '@playwright/test';
import { NotificationBannerOnMacro } from '@tests/pages/macromolecules/canvas/NotificationBannerOnMacro';

export const test = mergeTests(utils, pageObjects).extend<
  { SnakeCanvas: void },
  { initSnakeCanvas: () => Promise<Page> }
>({
  SnakeCanvas: async (
    {
      ketcher,
      CommonTopRightToolbar,
      CommonTopLeftToolbar,
      resetZoomLevelToDefault,
      clearLocalStorage,
      resetClipboard,
    },
    use,
  ) => {
    const page = ketcher.page as Page;
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor(
      LayoutMode.Snake,
    );
    await use();
    const banner = NotificationBannerOnMacro(page);
    while (await banner.isVisible()) {
      await banner.waitForBecomeHidden();
    }
    await CommonTopLeftToolbar(page).clearCanvas();
    await resetZoomLevelToDefault(page);
    await clearLocalStorage(page);
    await resetClipboard(page);
  },
  initSnakeCanvas: [
    async ({ createPage, CommonTopRightToolbar }, use) => {
      await use(async () => {
        const page = await createPage();
        await CommonTopRightToolbar(page).turnOnMacromoleculesEditor(
          LayoutMode.Snake,
        );
        return page;
      });
    },
    { scope: 'worker', auto: true },
  ],
});
