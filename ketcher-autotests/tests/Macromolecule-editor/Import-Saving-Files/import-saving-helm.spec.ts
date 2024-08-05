/* eslint-disable no-magic-numbers */
import {
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@utils/macromolecules';
import { Page, test, BrowserContext, chromium } from '@playwright/test';
import {
  openFileAndAddToCanvasMacro,
  takeEditorScreenshot,
  waitForRender,
  selectClearCanvasTool,
  waitForIndigoToLoad,
  waitForKetcherInit,
} from '@utils';

let page: Page;
let sharedContext: BrowserContext;

test.beforeAll(async ({ browser }) => {
  try {
    sharedContext = await browser.newContext();
  } catch (error) {
    console.error('Error on creation browser context:', error);
    console.log('Restarting browser...');
    await browser.close();
    browser = await chromium.launch();
    sharedContext = await browser.newContext();
  }

  // Reminder: do not pass page as async
  page = await sharedContext.newPage();

  await page.goto('', { waitUntil: 'domcontentloaded' });
  await waitForKetcherInit(page);
  await waitForIndigoToLoad(page);
  await turnOnMacromoleculesEditor(page);
});

test.afterEach(async () => {
  await page.keyboard.press('Escape');
  await page.keyboard.press('Control+0');
  await selectClearCanvasTool(page);
});

test.afterAll(async ({ browser }) => {
  await page.close();
  await sharedContext.close();
  await browser.contexts().forEach((someContext) => {
    someContext.close();
  });
});

test.describe('Import HELM', () => {
  test('Check that preview window of macro structure does not change in micro mode ', async () => {
    /* 
      Test case: https://github.com/epam/ketcher/issues/3603
      Description: Preview window of macro structure doesn't change in micro mode
      Test working incorrect now because we have bug https://github.com/epam/ketcher/issues/3603
      */
    const scrollValue = -400;
    const moleculeLabels = ['A', '25R', 'baA', 'Test-6-Ph', 'Test-6-Ch'];
    await openFileAndAddToCanvasMacro('KET/five-monomers.ket', page);
    await turnOnMicromoleculesEditor(page);
    await scrollHorizontally(page, scrollValue);
    for (const label of moleculeLabels) {
      await waitForRender(page, async () => {
        await page.getByText(label, { exact: true }).hover();
      });
      await takeEditorScreenshot(page);
    }
  });
});
