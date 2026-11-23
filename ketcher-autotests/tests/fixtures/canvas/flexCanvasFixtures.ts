import { test as utils } from '../utilitiesFixtures';
import { test as pageObjects } from '../commonPageObjectFixtures';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { mergeTests, Page } from '@playwright/test';
import { NotificationBannerOnMacro } from '@tests/pages/macromolecules/canvas/NotificationBannerOnMacro';

export const test = mergeTests(utils, pageObjects).extend<
  { FlexCanvas: void },
  { initFlexCanvas: () => Promise<Page> }
>({
  FlexCanvas: async (
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
      LayoutMode.Flex,
    );
    await use();
    await CommonTopLeftToolbar(page).clearCanvas();
    await page.keyboard.press('Escape');
    const banner = NotificationBannerOnMacro(page);
    while (await banner.isVisible()) {
      await banner.waitForBecomeHidden();
    }
    await resetZoomLevelToDefault(page);
    await clearLocalStorage(page);
    await resetClipboard(page);
  },
  initFlexCanvas: [
    async ({ createPage, CommonTopRightToolbar }, use) => {
      await use(async () => {
        const page = await createPage();
        await CommonTopRightToolbar(page).turnOnMacromoleculesEditor(
          LayoutMode.Flex,
        );
        return page;
      });
    },
    { scope: 'worker', auto: true },
  ],
});
