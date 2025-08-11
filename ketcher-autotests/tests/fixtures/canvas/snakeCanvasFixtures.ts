/* eslint-disable no-empty-pattern */
import { test as utils } from '../utilsFixtures';
import { test as pageObjects } from '../commonPageObjectFixtures';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { mergeTests, Page } from '@playwright/test';

export const test = mergeTests(utils, pageObjects).extend<
  { SnakeCanvas: void },
  { initSnakeCanvas: () => Promise<Page> }
>({
  SnakeCanvas: async (
    {
      page,
      CommonTopRightToolbar,
      CommonTopLeftToolbar,
      MacromoleculesTopToolbar,
      resetZoomLevelToDefault,
      clearLocalStorage,
      closeErrorAndInfoModals,
    },
    use,
  ) => {
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await use();
    await closeErrorAndInfoModals(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await resetZoomLevelToDefault(page);
    await clearLocalStorage(page);
  },
  initSnakeCanvas: [
    async (
      { createPage, CommonTopRightToolbar, MacromoleculesTopToolbar },
      use,
    ) => {
      await use(async () => {
        const page = await createPage();
        await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
        await MacromoleculesTopToolbar(page).selectLayoutModeTool(
          LayoutMode.Snake,
        );
        return page;
      });
    },
    { scope: 'worker', auto: true },
  ],
});
