import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  waitForPageInit,
  saveToFile,
  selectTopPanelButton,
  TopPanelButton,
  clickInTheMiddleOfTheScreen,
  pasteFromClipboardAndAddToCanvas,
  takePageScreenshot,
  copyAndPaste,
  pressButton,
} from '@utils';
import { getMolfile, getRxn } from '@utils/formats';

test.describe('Browser', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Zoom browser - Different Atom and Bond properties', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1862
    Description:
    Zoom In/Out the browser.
    Click the 'Save As' button and copy the content of the data field.
    Сlick the 'Open' button, paste the copied mol-string and click the 'OK' button.
    */
    await openFileAndAddToCanvas('Rxn-V2000/reaction-list-notlist.rxn', page);
    await page.getByTestId('zoom-input').click();
    await page.getByRole('button', { name: 'Zoom in Ctrl+=' }).click();
    await page.getByRole('button', { name: 'Zoom out Ctrl+_' }).click();
    await clickInTheMiddleOfTheScreen(page);
    const expectedFile = await getRxn(page, 'v3000');
    await saveToFile(
      'Molfiles-V3000/reaction-list-notlist-expected.rnx',
      expectedFile,
    );
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await page.getByTestId('zoom-input').click();
    await page.getByRole('button', { name: 'Zoom in Ctrl+=' }).click();
    await clickInTheMiddleOfTheScreen(page);
    await pasteFromClipboardAndAddToCanvas(
      page,
      'CCCCC/CC/C:CC.C(C)CCCCCCCCCC',
    );
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('zoom-input').click();
    await page.getByRole('button', { name: 'Zoom out Ctrl+_' }).click();
    await clickInTheMiddleOfTheScreen(page);
    await pasteFromClipboardAndAddToCanvas(
      page,
      'CCCCC/CC/C:CC.C(C)CCCCCCCCCC',
    );
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Zoom browser - R-Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1863
    Description:
    Click the "Open" button, paste the copied data in the Data field and click OK.
    Zoom In/Out the browser.
    Zoom Out the canvas.
    Click the Open button, paste the copied mol-string and click OK.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas(
      'r-group-with-allkind-attachment-points.mol',
      page,
    );
    await copyAndPaste(page);
    await page.mouse.click(x, y);
    await clickInTheMiddleOfTheScreen(page);
    await takePageScreenshot(page);
    await page.getByTestId('zoom-input').click();
    await page.getByRole('button', { name: 'Zoom in Ctrl+=' }).click();
    await page.getByRole('button', { name: 'Zoom out Ctrl+_' }).click();
    await clickInTheMiddleOfTheScreen(page);
    const expectedFile = await getMolfile(page, 'v3000');
    await saveToFile(
      'Molfiles-V3000/r-group-with-allkind-attachment-points.mol',
      expectedFile,
    );
    await clickInTheMiddleOfTheScreen(page);
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await page.getByTestId('zoom-input').click();
    await page.getByRole('button', { name: 'Zoom in Ctrl+=' }).click();
    await clickInTheMiddleOfTheScreen(page);
    await pasteFromClipboardAndAddToCanvas(
      page,
      'CCCCC/CC/C:CC.C(C)CCCCCCCCCCCCCCCCCCCCCCCCCCCC',
    );
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('zoom-input').click();
    await page.getByRole('button', { name: 'Zoom out Ctrl+_' }).click();
    await clickInTheMiddleOfTheScreen(page);
    await pasteFromClipboardAndAddToCanvas(
      page,
      'CCCCC/CC/C:CC.C(C)CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
    );
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Resize browser - Different Atom and Bond properties', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1864
    Description: TODO
    Click the 'Maximize' button of the browser.
    Open the reaction from file [^reaction_all.rxn]
    Click the 'Restore Down' button of the browser.
    Resize the browser by dragging with mouse any browser corner or edge.
    Click the 'Save As' button and copy the content of the data field.
    Clear the canvas.
    Click the 'Open' button, paste the copied mol-string and click the 'OK' button.
    Click the 'Maximize' button of the browser.
    Click the 'Restore Down' button of the browser.
    Resize the browser by dragging with mouse any browser corner or edge.
    */
    await openFileAndAddToCanvas('Rxn-V2000/rxn-reaction.rxn', page);
  });

  test('Resize browser - R-Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1865
    Description: TODO
    Click the Maximize button of the browser.
    Open [^Rgroup.mol]file in Notepad select all and copy the molstring.
    Click the "Open" button, paste the copied data in the Data field and click OK.
    Click the Restore Down button of the browser.
    Resize the browser by dragging with mouse any browser corner or edge.
    Click Save As and copy the content of the data field.
    Clear the canvas.
    Click the Open button, paste the copied mol-string and click OK.
    Click the Maximize button of the browser.
    Click the Restore Down button of the browser.
    Resize the browser by dragging with mouse any browser corner or edge.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/benzene-with-charge.mol',
      page,
    );
  });

  test('Zoom browser - S-Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4737
    Description: TODO
    1. Launch Ketcher using safari browser
    2. Open any window with drop down (e.x: Add structure on canvas -> Open the S-Group Properties using the "Data S-Group" tool on the left menu
    3. Zoom in the page using browser tool
    4. Extend the "Field name" drop down
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);
  });

  test('Text tool - Restore Down the window', async ({ page }) => {
    /* Test case: EPMLSOPKET-2237
    Description: TODO
    Click on the 'Restore Down' browser button.
    Hover the mouse over the 'Add text' button.
    */
    await pressButton(page, 'Apply');
  });
});
