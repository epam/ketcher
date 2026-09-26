import { test as utils } from '../utilsFixtures';
import { test as pageObjects } from '../commonPageObjectFixtures';
import { waitForIndigoToLoad, waitForKetcherInit } from '@utils';
import { mergeTests, Page } from '@playwright/test';
import { SettingsDialog } from '@tests/pages/molecules/canvas/SettingsDialog';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';

type ViewBox = { minX: number; minY: number; width: number; height: number };

// Clearing the canvas and resetting zoom keep any pan left by a previous test
// (e.g. a Hand tool drag), which shifts the absolute coordinates of the next
// loaded structure. Move the viewport origin back to where a fresh editor has it.
async function resetCanvasPan(page: Page) {
  await page.evaluate(() => {
    const { render } = window.ketcher.editor as unknown as {
      render: { setViewBox: (fn: (viewBox: ViewBox) => ViewBox) => void };
    };
    render.setViewBox((viewBox) => ({ ...viewBox, minX: 0, minY: 0 }));
  });
}

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
    await resetCanvasPan(page);
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
