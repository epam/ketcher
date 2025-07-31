import { test as utils } from '../utilsFixtures';
import { test as pageObjects } from '../commonPageObjectFixtures';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { mergeTests } from '@playwright/test';

export const test = mergeTests(utils, pageObjects).extend<{
  SnakeCanvas: void;
}>({
  SnakeCanvas: async (
    {
      page,
      CommonTopRightToolbar,
      CommonTopLeftToolbar,
      MacromoleculesTopToolbar,
      resetZoomLevelToDefault,
      clearLocalStorage,
    },
    use,
  ) => {
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await use();
    await CommonTopLeftToolbar(page).clearCanvas();
    await resetZoomLevelToDefault(page);
    await clearLocalStorage(page);
  },
});
