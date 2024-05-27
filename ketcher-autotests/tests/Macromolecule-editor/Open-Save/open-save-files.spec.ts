/* eslint-disable no-magic-numbers */
import { Page, chromium, expect, test } from '@playwright/test';
import {
  selectClearCanvasTool,
  waitForKetcherInit,
  waitForIndigoToLoad,
  openStructurePasteFromClipboard,
  openFileAndAddToCanvasAsNewProject,
  selectSaveTool,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

test.describe('Open/save file tests: ', () => {
  let page: Page;
  test.setTimeout(300000);
  test.describe.configure({ retries: 0 });

  test.beforeAll(async ({ browser }) => {
    let sharedContext;
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
    const cntxt = page.context();
    await page.close();
    await cntxt.close();
    await browser.contexts().forEach((someContext) => {
      someContext.close();
    });
    // await browser.close();
  });

  test(`Check that it is possible to select all text by CTRL+A and delete it in 'Paste from Clipboard modal window`, async () => {
    /*
     *  Test case1: https://github.com/epam/ketcher/issues/4422 - Cases 28
     *  Check that it is possible to select all text by CTRL+A and delete it in 'Paste from Clipboard modal window
     */
    test.setTimeout(20000);

    await openStructurePasteFromClipboard(page);
    const openStructureFromClipboardTextArea = page.getByTestId(
      'open-structure-textarea',
    );

    const textToPaste = 'Random text to past from clipboard';
    await page.evaluate(async (text) => {
      await navigator.clipboard.writeText(text);
    }, textToPaste);

    await openStructureFromClipboardTextArea.click();
    await page.keyboard.press('Control+V');

    await expect(openStructureFromClipboardTextArea).toHaveValue(textToPaste);

    await openStructureFromClipboardTextArea.press('Control+A');
    await openStructureFromClipboardTextArea.press('Backspace');

    await expect(openStructureFromClipboardTextArea).toHaveValue('');
  });

  async function selectFASTAFileFormat(page: Page) {
    await page.getByRole('combobox').click();
    await page.getByText('FASTA').click();
  }

  async function closeSaveStrutureDialog(page: Page) {
    await page.getByRole('button', { name: 'Cancel' }).click();
  }

  test(`Check that in case of multiple types sequences on canvas, error "Error during sequence type recognition(RNA, DNA or Peptide)" should appear`, async () => {
    /*
     *  Test case2: https://github.com/epam/ketcher/issues/4422 - Cases 32
     *  Check that in case of multiple types sequences on canvas, error "Error during sequence type recognition(RNA, DNA or Peptide)" should appear
     */
    test.setTimeout(20000);
    await openFileAndAddToCanvasAsNewProject(
      'KET/Open-Save-Tests/Multiple types sequences on canvas.ket',
      page,
    );

    await selectSaveTool(page);
    await selectFASTAFileFormat(page);

    const errorMessageDialog = page.getByRole('dialog');
    const errorMessageText =
      'Convert error! Error during sequence type recognition(RNA, DNA or Peptide)';
    await expect(errorMessageDialog).toBeVisible();
    await expect(page.getByText(errorMessageText)).toBeVisible();

    await page.keyboard.press('Escape');
    await closeSaveStrutureDialog(page);
  });

  // async function toggleFullScreenOn(page: Page) {
  //   let cntxt = page.context();
  //   let brwsr = cntxt.browser();
  //   await page.close();
  //   await cntxt.close();
  //   await brwsr.contexts().forEach((someContext) => {
  //     someContext.close();
  //   });

  //   cntxt = await Browser.NewContextAsync(new BrowserNewContextOptions()
  //   {
  //     ViewportSize = ViewportSize.NoViewport
  //   });
  //   page = await cntxt.newPage();
  // }

  // test(`Check the pop-up window appear in fullscreen mode after clicking the “Open” button`, async () => {
  //   /*
  //    *  Test case3: https://github.com/epam/ketcher/issues/4422 - Cases 33
  //    *  Check the pop-up window appear in fullscreen mode after clicking the “Open” button
  //    */
  //   test.setTimeout(10000);

  //   await toggleFullScreenOn(page);
  //   await selectOpenTool(page);
  //   const openDialog = await page.getByRole('dialog');
  //   expect(openDialog).toBeVisible();

  // });
});
