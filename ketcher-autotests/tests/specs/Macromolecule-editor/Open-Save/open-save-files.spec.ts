/* eslint-disable no-magic-numbers */
import { Page, chromium, expect, test } from '@fixtures';
import {
  waitForKetcherInit,
  openFileAndAddToCanvasAsNewProject,
  resetZoomLevelToDefault,
} from '@utils';
import { PasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MacromoleculesFileFormatType } from '@tests/pages/constants/fileFormats/macroFileFormats';
import { OpenStructureDialog } from '@tests/pages/common/OpenStructureDialog';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';

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
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  });

  test.afterEach(async () => {
    await page.keyboard.press('Escape');
    await resetZoomLevelToDefault(page);
    await CommonTopLeftToolbar(page).clearCanvas();
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
    test.setTimeout(25000);

    await CommonTopLeftToolbar(page).openFile();
    await OpenStructureDialog(page).pasteFromClipboard();

    const openStructureTextarea =
      PasteFromClipboardDialog(page).openStructureTextarea;

    const textToPaste = 'Random text to past from clipboard';
    // IMPORTANT: It is not possible to use clipboard to paste some data from since it is shared with other test threads and tests can interfere
    await openStructureTextarea.fill(textToPaste);

    await expect(openStructureTextarea).toHaveValue(textToPaste);

    await openStructureTextarea.press('Control+A');
    await openStructureTextarea.press('Backspace');

    await expect(openStructureTextarea).toHaveValue('');
  });

  test(`Check that in case of multiple types sequences on canvas, error "Error during sequence type recognition(RNA, DNA or Peptide)" should appear`, async () => {
    /*
     *  Test case2: https://github.com/epam/ketcher/issues/4422 - Cases 32
     *  Check that in case of multiple types sequences on canvas, error "Error during sequence type recognition(RNA, DNA or Peptide)" should appear
     */
    test.setTimeout(20000);
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Open-Save-Tests/Multiple types sequences on canvas.ket',
    );

    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.FASTA,
    );

    const errorMessageDialog = page.getByRole('dialog');
    const errorMessageText =
      'Convert error! Error during sequence type recognition(RNA, DNA or Peptide)';
    await expect(errorMessageDialog).toBeVisible();
    await expect(page.getByText(errorMessageText)).toBeVisible();

    await page.keyboard.press('Escape');

    await SaveStructureDialog(page).cancel();
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
